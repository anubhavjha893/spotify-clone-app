import { Server } from "socket.io";
import { verifyToken } from "@clerk/backend";
import { Message } from "../models/message.model.js";
import { User } from "../models/user.model.js";
import { allowedOrigins } from "./origins.js";
import { isValidId } from "./http-error.js";

const MAX_MESSAGE_LENGTH = 2000;

const sanitizeActivity = (activity) => {
	if (!activity || typeof activity !== "object") return null;

	const { songId, title, artist, imageUrl } = activity;
	if (!isValidId(songId) || typeof title !== "string" || typeof artist !== "string") return null;

	return {
		songId,
		title: title.slice(0, 200),
		artist: artist.slice(0, 200),
		imageUrl: typeof imageUrl === "string" ? imageUrl.slice(0, 1000) : "",
	};
};

export const initializeSocket = (server) => {
	const io = new Server(server, {
		cors: { origin: allowedOrigins, credentials: true },
	});

	// userId -> number of open sockets (a user can have several tabs open)
	const connectionCounts = new Map();
	// userId -> { songId, title, artist, imageUrl } | null
	const userActivities = new Map();

	// Identity comes from a verified Clerk session token, never from the client payload.
	io.use(async (socket, next) => {
		try {
			const token = socket.handshake.auth?.token;
			if (!token) return next(new Error("Unauthorized"));

			const payload = await verifyToken(token, { secretKey: process.env.CLERK_SECRET_KEY });
			socket.data.userId = payload.sub;
			next();
		} catch {
			next(new Error("Unauthorized"));
		}
	});

	io.on("connection", (socket) => {
		const { userId } = socket.data;
		socket.join(userId);

		const count = (connectionCounts.get(userId) || 0) + 1;
		connectionCounts.set(userId, count);
		if (count === 1) {
			userActivities.set(userId, null);
			socket.broadcast.emit("user_connected", userId);
		}

		socket.emit("users_online", Array.from(connectionCounts.keys()));
		socket.emit("activities", Array.from(userActivities.entries()));

		socket.on("update_activity", (activity) => {
			const clean = sanitizeActivity(activity);
			userActivities.set(userId, clean);
			io.emit("activity_updated", { userId, activity: clean });
		});

		socket.on("send_message", async (data, ack) => {
			const reply = typeof ack === "function" ? ack : () => {};
			try {
				const receiverId = typeof data?.receiverId === "string" ? data.receiverId : "";
				const content = typeof data?.content === "string" ? data.content.trim() : "";

				if (!receiverId || receiverId === userId) return reply({ error: "Invalid recipient" });
				if (!content) return reply({ error: "Message is empty" });
				if (content.length > MAX_MESSAGE_LENGTH) {
					return reply({ error: `Messages are limited to ${MAX_MESSAGE_LENGTH} characters` });
				}

				if (!(await User.exists({ clerkId: receiverId }))) return reply({ error: "Invalid recipient" });

				const message = await Message.create({ senderId: userId, receiverId, content });

				io.to(receiverId).emit("receive_message", message);
				io.to(userId).emit("message_sent", message);
				reply({ message });
			} catch (error) {
				console.error("Error sending message", error);
				reply({ error: "Message could not be sent" });
			}
		});

		socket.on("disconnect", () => {
			const remaining = (connectionCounts.get(userId) || 1) - 1;
			if (remaining > 0) {
				connectionCounts.set(userId, remaining);
				return;
			}

			connectionCounts.delete(userId);
			userActivities.delete(userId);
			io.emit("user_disconnected", userId);
		});
	});
};
