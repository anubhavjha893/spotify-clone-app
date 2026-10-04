import fs from "fs/promises";
import { Album } from "../models/album.model.js";
import { Song } from "../models/song.model.js";
import { User } from "../models/user.model.js";
import cloudinary from "../lib/cloudinary.js";
import { httpError, isValidId } from "../lib/http-error.js";

const uploadToCloudinary = async (file, resourceType) => {
	try {
		const result = await cloudinary.uploader.upload(file.tempFilePath, {
			resource_type: resourceType,
		});
		return result.secure_url;
	} catch (error) {
		console.error("Error in uploadToCloudinary", error);
		throw httpError(502, "Error uploading file to storage");
	} finally {
		fs.unlink(file.tempFilePath).catch(() => {});
	}
};

const assertFileType = (file, prefix, label) => {
	if (!file || Array.isArray(file)) throw httpError(400, `Please upload one ${label} file`);
	if (!file.mimetype?.startsWith(prefix)) throw httpError(400, `${label} file has an unsupported format`);
};

const cleanText = (value) => (typeof value === "string" ? value.trim() : "");

const cleanupTempFiles = (files) => {
	for (const file of Object.values(files || {}).flat()) {
		if (file?.tempFilePath) fs.unlink(file.tempFilePath).catch(() => {});
	}
};

export const createSong = async (req, res, next) => {
	try {
		const { audioFile, imageFile, videoFile } = req.files || {};
		assertFileType(audioFile, "audio/", "Audio");
		assertFileType(imageFile, "image/", "Image");
		if (videoFile) assertFileType(videoFile, "video/", "Video");

		const title = cleanText(req.body.title);
		const artist = cleanText(req.body.artist);
		const duration = Math.round(Number(req.body.duration));
		const albumId = cleanText(req.body.albumId) || null;

		if (!title || !artist) throw httpError(400, "Title and artist are required");
		if (!Number.isFinite(duration) || duration <= 0) throw httpError(400, "Duration must be a positive number");
		if (albumId && (!isValidId(albumId) || !(await Album.exists({ _id: albumId })))) {
			throw httpError(400, "Selected album does not exist");
		}

		const [audioUrl, imageUrl, videoUrl] = await Promise.all([
			uploadToCloudinary(audioFile, "video"), // Cloudinary stores audio under the video resource type
			uploadToCloudinary(imageFile, "image"),
			videoFile ? uploadToCloudinary(videoFile, "video") : null,
		]);

		const song = await Song.create({ title, artist, albumId, duration, imageUrl, audioUrl, videoUrl });

		if (albumId) {
			await Album.findByIdAndUpdate(albumId, { $push: { songs: song._id } });
		}

		res.status(201).json(song);
	} catch (error) {
		cleanupTempFiles(req.files);
		next(error);
	}
};

export const deleteSong = async (req, res, next) => {
	try {
		const { id } = req.params;
		if (!isValidId(id)) throw httpError(404, "Song not found");

		const song = await Song.findByIdAndDelete(id);
		if (!song) throw httpError(404, "Song not found");

		await Promise.all([
			song.albumId ? Album.findByIdAndUpdate(song.albumId, { $pull: { songs: song._id } }) : null,
			User.updateMany({ likedSongs: song._id }, { $pull: { likedSongs: song._id } }),
		]);

		res.status(200).json({ message: "Song deleted successfully" });
	} catch (error) {
		next(error);
	}
};

export const createAlbum = async (req, res, next) => {
	try {
		const { imageFile } = req.files || {};
		assertFileType(imageFile, "image/", "Image");

		const title = cleanText(req.body.title);
		const artist = cleanText(req.body.artist);
		const releaseYear = Number(req.body.releaseYear);
		const genre = cleanText(req.body.genre).slice(0, 60) || null;
		const maxYear = new Date().getFullYear() + 1;

		if (!title || !artist) throw httpError(400, "Title and artist are required");
		if (!Number.isInteger(releaseYear) || releaseYear < 1900 || releaseYear > maxYear) {
			throw httpError(400, `Release year must be between 1900 and ${maxYear}`);
		}

		const imageUrl = await uploadToCloudinary(imageFile, "image");
		const album = await Album.create({ title, artist, releaseYear, genre, imageUrl });

		res.status(201).json(album);
	} catch (error) {
		cleanupTempFiles(req.files);
		next(error);
	}
};

export const deleteAlbum = async (req, res, next) => {
	try {
		const { id } = req.params;
		if (!isValidId(id)) throw httpError(404, "Album not found");

		const album = await Album.findByIdAndDelete(id);
		if (!album) throw httpError(404, "Album not found");

		const songIds = (await Song.find({ albumId: id }, { _id: 1 })).map((song) => song._id);
		await Promise.all([
			Song.deleteMany({ _id: { $in: songIds } }),
			User.updateMany({}, { $pull: { likedSongs: { $in: songIds } } }),
		]);

		res.status(200).json({ message: "Album deleted successfully", deletedSongIds: songIds });
	} catch (error) {
		next(error);
	}
};

export const checkAdmin = (req, res) => {
	res.status(200).json({ admin: true });
};
