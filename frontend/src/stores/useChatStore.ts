import { create } from "zustand";
import { io, type Socket } from "socket.io-client";
import { API_ORIGIN, axiosInstance, getErrorMessage, getSessionToken } from "@/lib/axios";
import type { Activity, Message, User } from "@/types";

interface ChatStore {
	users: User[];
	usersLoading: boolean;
	usersError: string | null;
	isConnected: boolean;
	onlineUsers: Set<string>;
	userActivities: Map<string, Activity | null>;
	messages: Message[];
	messagesLoading: boolean;
	messagesError: string | null;
	selectedUser: User | null;
	unread: Record<string, number>;
	myId: string | null;

	fetchUsers: () => Promise<void>;
	initSocket: (userId: string) => void;
	disconnectSocket: () => void;
	sendMessage: (receiverId: string, content: string) => Promise<string | null>;
	fetchMessages: (userId: string) => Promise<void>;
	setSelectedUser: (user: User | null) => void;
	updateActivity: (activity: Activity | null) => void;
}

const socket: Socket = io(API_ORIGIN || undefined, {
	autoConnect: false,
	withCredentials: true,
	// Called on every (re)connect so the server always receives a fresh session token.
	auth: (cb) => {
		getSessionToken().then((token) => cb({ token }));
	},
});

let lastActivity: Activity | null = null;

const useChatStore = create<ChatStore>((set, get) => {
	const appendMessage = (message: Message) => {
		const { selectedUser, myId } = get();
		const otherId = message.senderId === myId ? message.receiverId : message.senderId;

		if (selectedUser?.clerkId === otherId) {
			set((state) =>
				state.messages.some((m) => m._id === message._id) ? state : { messages: [...state.messages, message] }
			);
		} else if (message.senderId !== myId) {
			set((state) => ({ unread: { ...state.unread, [otherId]: (state.unread[otherId] || 0) + 1 } }));
		}
	};

	socket.on("connect", () => {
		set({ isConnected: true });
		// Re-announce what is playing after a reconnect.
		if (lastActivity) socket.emit("update_activity", lastActivity);
	});
	socket.on("disconnect", () => set({ isConnected: false }));

	socket.on("users_online", (users: string[]) => set({ onlineUsers: new Set(users) }));
	socket.on("activities", (activities: [string, Activity | null][]) => set({ userActivities: new Map(activities) }));
	socket.on("user_connected", (userId: string) => {
		set((state) => ({ onlineUsers: new Set([...state.onlineUsers, userId]) }));
	});
	socket.on("user_disconnected", (userId: string) => {
		set((state) => {
			const onlineUsers = new Set(state.onlineUsers);
			onlineUsers.delete(userId);
			const userActivities = new Map(state.userActivities);
			userActivities.delete(userId);
			return { onlineUsers, userActivities };
		});
	});
	socket.on("activity_updated", ({ userId, activity }: { userId: string; activity: Activity | null }) => {
		set((state) => {
			const userActivities = new Map(state.userActivities);
			userActivities.set(userId, activity);
			return { userActivities };
		});
	});
	socket.on("receive_message", appendMessage);
	socket.on("message_sent", appendMessage);

	return {
		users: [],
		usersLoading: false,
		usersError: null,
		isConnected: false,
		onlineUsers: new Set(),
		userActivities: new Map(),
		messages: [],
		messagesLoading: false,
		messagesError: null,
		selectedUser: null,
		unread: {},
		myId: null,

		setSelectedUser: (user) => {
			set((state) => {
				const unread = { ...state.unread };
				if (user) delete unread[user.clerkId];
				return { selectedUser: user, messages: [], unread };
			});
		},

		fetchUsers: async () => {
			set({ usersLoading: get().users.length === 0, usersError: null });
			try {
				const response = await axiosInstance.get<User[]>("/users");
				set({ users: response.data });
			} catch (error) {
				set({ usersError: getErrorMessage(error) });
			} finally {
				set({ usersLoading: false });
			}
		},

		initSocket: (userId) => {
			set({ myId: userId });
			if (!socket.connected) socket.connect();
		},

		disconnectSocket: () => {
			lastActivity = null;
			socket.disconnect();
			set({
				isConnected: false,
				myId: null,
				onlineUsers: new Set(),
				userActivities: new Map(),
				messages: [],
				selectedUser: null,
				unread: {},
			});
		},

		sendMessage: (receiverId, content) =>
			new Promise((resolve) => {
				if (!socket.connected) return resolve("You are offline. Reconnecting...");
				socket
					.timeout(10000)
					.emit("send_message", { receiverId, content }, (err: Error | null, res?: { error?: string }) => {
						if (err) return resolve("Message timed out. Please try again.");
						resolve(res?.error ?? null);
					});
			}),

		fetchMessages: async (userId) => {
			set({ messagesLoading: true, messagesError: null });
			try {
				const response = await axiosInstance.get<Message[]>(`/users/messages/${userId}`);
				// Ignore the response if the user switched conversations meanwhile.
				if (get().selectedUser?.clerkId !== userId) return;

				set((state) => {
					const known = new Set(response.data.map((m) => m._id));
					const live = state.messages.filter((m) => !known.has(m._id));
					return { messages: [...response.data, ...live] };
				});
			} catch (error) {
				set({ messagesError: getErrorMessage(error, "Could not load messages") });
			} finally {
				set({ messagesLoading: false });
			}
		},

		updateActivity: (activity) => {
			lastActivity = activity;
			if (socket.connected) socket.emit("update_activity", activity);
		},
	};
});

export default useChatStore;
