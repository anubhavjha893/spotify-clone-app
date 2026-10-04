import { Album } from "../models/album.model.js";
import { Song } from "../models/song.model.js";

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const search = async (req, res, next) => {
	try {
		const query = typeof req.query.q === "string" ? req.query.q.trim().slice(0, 100) : "";
		if (!query) return res.status(200).json({ songs: [], albums: [] });

		const pattern = new RegExp(escapeRegex(query), "i");
		const [songs, albums] = await Promise.all([
			Song.find({ $or: [{ title: pattern }, { artist: pattern }] }, { __v: 0 }).sort({ plays: -1 }).limit(20),
			Album.find({ $or: [{ title: pattern }, { artist: pattern }, { genre: pattern }] }, { __v: 0 }).limit(12),
		]);

		res.status(200).json({ songs, albums });
	} catch (error) {
		next(error);
	}
};
