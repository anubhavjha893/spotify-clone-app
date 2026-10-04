import { Song } from "../models/song.model.js";
import { httpError, isValidId } from "../lib/http-error.js";

const PUBLIC_FIELDS = { __v: 0 };
const PLAY_DEDUPE_WINDOW_MS = 30 * 1000;
const recentPlays = new Map();

const sampleSongs = (size) =>
	Song.aggregate([{ $sample: { size } }, { $project: PUBLIC_FIELDS }]);

export const getAllSongs = async (req, res, next) => {
	try {
		const songs = await Song.find({}, PUBLIC_FIELDS).sort({ createdAt: -1 });
		res.status(200).json(songs);
	} catch (error) {
		next(error);
	}
};

export const getFeaturedSongs = async (req, res, next) => {
	try {
		res.status(200).json(await sampleSongs(6));
	} catch (error) {
		next(error);
	}
};

export const getSongsMadeForYou = async (req, res, next) => {
	try {
		res.status(200).json(await sampleSongs(8));
	} catch (error) {
		next(error);
	}
};

// Ranked by real play counts recorded through recordPlay.
export const getTrendingSongs = async (req, res, next) => {
	try {
		// Only songs that have actually been played; the shelf stays hidden until then.
		const songs = await Song.find({ plays: { $gt: 0 } }, PUBLIC_FIELDS).sort({ plays: -1, createdAt: -1 }).limit(10);
		res.status(200).json(songs);
	} catch (error) {
		next(error);
	}
};

// Returns the current version of the requested songs, so the client can refresh a
// saved queue and drop songs that were removed from the catalog.
export const lookupSongs = async (req, res, next) => {
	try {
		const ids = Array.isArray(req.body?.ids) ? req.body.ids.filter(isValidId).slice(0, 500) : [];
		if (ids.length === 0) return res.status(200).json([]);

		const songs = await Song.find({ _id: { $in: ids } }, PUBLIC_FIELDS);
		res.status(200).json(songs);
	} catch (error) {
		next(error);
	}
};

export const recordPlay = async (req, res, next) => {
	try {
		const { id } = req.params;
		if (!isValidId(id)) throw httpError(400, "Invalid song id");

		// Ignore repeated reports for the same song from the same listener in a short window
		// so that skipping back and forth does not inflate the count.
		const key = `${req.ip}:${id}`;
		const now = Date.now();
		const last = recentPlays.get(key);
		if (last && now - last < PLAY_DEDUPE_WINDOW_MS) {
			return res.status(202).json({ counted: false });
		}

		if (recentPlays.size > 10000) {
			for (const [k, time] of recentPlays) {
				if (now - time > PLAY_DEDUPE_WINDOW_MS) recentPlays.delete(k);
			}
		}
		recentPlays.set(key, now);

		const song = await Song.findByIdAndUpdate(id, { $inc: { plays: 1 } }, { new: true });
		if (!song) throw httpError(404, "Song not found");

		res.status(200).json({ counted: true, plays: song.plays });
	} catch (error) {
		next(error);
	}
};
