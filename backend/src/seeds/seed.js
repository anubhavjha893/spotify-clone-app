// Loads the demo catalog defined in catalog.js.
//
// By default every audio file and cover is copied to your Cloudinary account (folder
// "encore-catalog") so it streams from a fast CDN. Re-running reuses files that are
// already there. Pass --no-upload to stream straight from the Internet Archive instead
// (slower to start and to seek).
//
// Running this replaces every song and album in the database. Users and messages are kept.
import "dotenv/config";
import mongoose from "mongoose";
import cloudinary from "../lib/cloudinary.js";
import { Song } from "../models/song.model.js";
import { Album } from "../models/album.model.js";
import { User } from "../models/user.model.js";
import { CATALOG } from "./catalog.js";

const FOLDER = "encore-catalog";
const CONCURRENCY = 4;

const hasCloudinary =
	process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET;
const upload = !process.argv.includes("--no-upload") && hasCloudinary;

const slug = (value) =>
	value
		.toLowerCase()
		.normalize("NFKD")
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-|-$/g, "");

const archiveUrl = (identifier, file) =>
	`https://archive.org/download/${identifier}/${file.split("/").map(encodeURIComponent).join("/")}`;

// "04:36", "01:04:36" or "276.98" to seconds
const parseLength = (value) => {
	if (value === undefined) return 0;
	const text = String(value);
	if (text.includes(":")) return text.split(":").reduce((total, part) => total * 60 + Number(part), 0);
	return Number(text);
};

const fetchArchiveFiles = async (identifier) => {
	const response = await fetch(`https://archive.org/metadata/${identifier}`);
	if (!response.ok) throw new Error(`Archive metadata for ${identifier} returned ${response.status}`);
	const data = await response.json();
	return new Map((data.files || []).map((file) => [file.name, file]));
};

// Cloudinary keeps an existing asset when overwrite is false, so re-runs do not upload twice.
const toCloudinary = async (sourceUrl, publicId, resourceType) => {
	const result = await cloudinary.uploader.upload(sourceUrl, {
		resource_type: resourceType,
		public_id: `${FOLDER}/${publicId}`,
		overwrite: false,
		...(resourceType === "image" ? { transformation: [{ width: 1200, height: 1200, crop: "limit" }] } : {}),
	});
	return { url: result.secure_url, duration: result.duration };
};

const runPool = async (items, worker) => {
	const results = new Array(items.length);
	let next = 0;
	const runners = Array.from({ length: Math.min(CONCURRENCY, items.length) }, async () => {
		while (next < items.length) {
			const index = next++;
			results[index] = await worker(items[index], index);
		}
	});
	await Promise.all(runners);
	return results;
};

const prepareAlbum = async (album) => {
	const files = await fetchArchiveFiles(album.identifier);
	const albumSlug = slug(album.title);

	for (const name of [album.cover, ...album.tracks.map(([file]) => file)]) {
		if (!files.has(name)) throw new Error(`"${name}" is missing from archive item ${album.identifier}`);
	}

	const coverSource = archiveUrl(album.identifier, album.cover);
	const imageUrl = upload ? (await toCloudinary(coverSource, `${albumSlug}/cover`, "image")).url : coverSource;

	const tracks = await runPool(album.tracks, async ([file, title]) => {
		const source = archiveUrl(album.identifier, file);
		const archiveLength = parseLength(files.get(file).length);
		if (!upload) return { title, audioUrl: source, duration: Math.round(archiveLength) };

		const stored = await toCloudinary(source, `${albumSlug}/${slug(title)}`, "video");
		return { title, audioUrl: stored.url, duration: Math.round(stored.duration || archiveLength) };
	});

	console.log(`  ${album.artist} - ${album.title}: ${tracks.length} tracks`);
	return { ...album, imageUrl, tracks };
};

const seedDatabase = async () => {
	if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is not set");
	if (!process.argv.includes("--no-upload") && !hasCloudinary) {
		console.warn("Cloudinary is not configured, streaming from the Internet Archive instead.");
	}

	console.log(upload ? "Copying the catalog to Cloudinary..." : "Using Internet Archive URLs...");
	// Prepare everything before touching the database, so a failed download leaves it unchanged.
	const prepared = [];
	for (const album of CATALOG) prepared.push(await prepareAlbum(album));

	await mongoose.connect(process.env.MONGODB_URI);
	await Promise.all([Album.deleteMany({}), Song.deleteMany({})]);
	await User.updateMany({}, { $set: { likedSongs: [] } });

	let songCount = 0;
	for (const album of prepared) {
		const createdAlbum = await Album.create({
			title: album.title,
			artist: album.artist,
			imageUrl: album.imageUrl,
			releaseYear: album.releaseYear,
			genre: album.genre,
			license: album.license,
			sourceUrl: `https://archive.org/details/${album.identifier}`,
		});

		const songs = await Song.insertMany(
			album.tracks.map((track) => ({
				title: track.title,
				artist: album.artist,
				imageUrl: album.imageUrl,
				audioUrl: track.audioUrl,
				duration: track.duration,
				albumId: createdAlbum._id,
			}))
		);

		createdAlbum.songs = songs.map((song) => song._id);
		await createdAlbum.save();
		songCount += songs.length;
	}

	console.log(`Seeded ${prepared.length} albums and ${songCount} songs`);
};

seedDatabase()
	.catch((error) => {
		console.error("Error seeding database:", error.message || error);
		process.exitCode = 1;
	})
	.finally(() => mongoose.connection.close());
