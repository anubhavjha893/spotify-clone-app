import { Album } from "../models/album.model.js";
import { Song } from "../models/song.model.js";
import { httpError } from "../lib/http-error.js";

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const getGenre = async (req, res, next) => {
	try {
		const name = typeof req.params.name === "string" ? req.params.name.trim().slice(0, 60) : "";
		const albums = name
			? await Album.find({ genre: new RegExp(`^${escapeRegex(name)}$`, "i") }, { __v: 0 }).sort({ releaseYear: -1 })
			: [];
		if (albums.length === 0) throw httpError(404, "Genre not found");

		const songs = await Song.find({ albumId: { $in: albums.map((album) => album._id) } }, { __v: 0 }).sort({
			plays: -1,
			createdAt: -1,
		});

		res.status(200).json({ name: albums[0].genre, albums, songs });
	} catch (error) {
		next(error);
	}
};

export const getArtist = async (req, res, next) => {
	try {
		const name = typeof req.params.name === "string" ? req.params.name.trim().slice(0, 200) : "";
		if (!name) throw httpError(404, "Artist not found");

		// Artist names are matched case-insensitively and exactly.
		const exact = new RegExp(`^${escapeRegex(name)}$`, "i");
		const [songs, albums] = await Promise.all([
			Song.find({ artist: exact }, { __v: 0 }).sort({ plays: -1, createdAt: -1 }),
			Album.find({ artist: exact }, { __v: 0 }).sort({ releaseYear: -1 }),
		]);
		if (songs.length === 0 && albums.length === 0) throw httpError(404, "Artist not found");

		res.status(200).json({
			name: albums[0]?.artist ?? songs[0].artist,
			imageUrl: albums[0]?.imageUrl ?? songs[0]?.imageUrl ?? null,
			totalPlays: songs.reduce((sum, song) => sum + (song.plays || 0), 0),
			songs,
			albums,
		});
	} catch (error) {
		next(error);
	}
};
