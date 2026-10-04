import { Message } from "../models/message.model.js";
import { Song } from "../models/song.model.js";
import { User } from "../models/user.model.js";
import { httpError, isValidId } from "../lib/http-error.js";

export const getAllUsers = async (req, res, next) => {
	try {
		const users = await User.find(
			{ clerkId: { $ne: req.userId } },
			{ fullName: 1, imageUrl: 1, clerkId: 1 }
		).sort({ fullName: 1 });
		res.status(200).json(users);
	} catch (error) {
		next(error);
	}
};

export const getMessages = async (req, res, next) => {
	try {
		const myId = req.userId;
		const { userId } = req.params;

		const messages = await Message.find({
			$or: [
				{ senderId: myId, receiverId: userId },
				{ senderId: userId, receiverId: myId },
			],
		})
			.sort({ createdAt: -1 })
			.limit(200);

		res.status(200).json(messages.reverse());
	} catch (error) {
		next(error);
	}
};

export const getLikedSongs = async (req, res, next) => {
	try {
		const user = await User.findOne({ clerkId: req.userId }, { likedSongs: 1 }).populate({
			path: "likedSongs",
			select: { __v: 0 },
		});
		if (!user) return res.status(200).json([]);

		// Most recently liked first
		res.status(200).json([...user.likedSongs].reverse());
	} catch (error) {
		next(error);
	}
};

export const likeSong = async (req, res, next) => {
	try {
		const { songId } = req.params;
		if (!isValidId(songId)) throw httpError(400, "Invalid song id");
		if (!(await Song.exists({ _id: songId }))) throw httpError(404, "Song not found");

		const user = await User.findOneAndUpdate(
			{ clerkId: req.userId },
			{ $addToSet: { likedSongs: songId } },
			{ new: true, projection: { likedSongs: 1 } }
		);
		if (!user) throw httpError(404, "Profile not found");

		res.status(200).json({ likedSongIds: user.likedSongs });
	} catch (error) {
		next(error);
	}
};

export const unlikeSong = async (req, res, next) => {
	try {
		const { songId } = req.params;
		if (!isValidId(songId)) throw httpError(400, "Invalid song id");

		const user = await User.findOneAndUpdate(
			{ clerkId: req.userId },
			{ $pull: { likedSongs: songId } },
			{ new: true, projection: { likedSongs: 1 } }
		);
		if (!user) throw httpError(404, "Profile not found");

		res.status(200).json({ likedSongIds: user.likedSongs });
	} catch (error) {
		next(error);
	}
};
