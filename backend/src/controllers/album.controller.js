import { Album } from "../models/album.model.js";
import { httpError, isValidId } from "../lib/http-error.js";

export const getAllAlbums = async (req, res, next) => {
	try {
		const albums = await Album.find({}, { __v: 0 }).sort({ createdAt: -1 });
		res.status(200).json(albums);
	} catch (error) {
		next(error);
	}
};

export const getAlbumById = async (req, res, next) => {
	try {
		const { albumId } = req.params;
		if (!isValidId(albumId)) throw httpError(404, "Album not found");

		const album = await Album.findById(albumId, { __v: 0 }).populate({
			path: "songs",
			select: { __v: 0 },
		});
		if (!album) throw httpError(404, "Album not found");

		res.status(200).json(album);
	} catch (error) {
		next(error);
	}
};
