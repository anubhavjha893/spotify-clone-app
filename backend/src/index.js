import "dotenv/config";
import express from "express";
import { clerkMiddleware } from "@clerk/express";
import fileUpload from "express-fileupload";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import { createServer } from "http";
import fs from "fs";
import cron from "node-cron";

import { connectDB } from "./lib/db.js";
import { allowedOrigins } from "./lib/origins.js";
import { initializeSocket } from "./lib/socket.js";
import userRoutes from "./routes/user.route.js";
import authRoutes from "./routes/auth.route.js";
import adminRoutes from "./routes/admin.route.js";
import songRoutes from "./routes/song.route.js";
import albumRoutes from "./routes/album.route.js";
import statRoutes from "./routes/stat.route.js";
import searchRoutes from "./routes/search.route.js";
import { artistRouter, genreRouter } from "./routes/artist.route.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const tempDir = path.join(__dirname, "..", "tmp");
const frontendDist = path.join(__dirname, "..", "..", "frontend", "dist");

const app = express();
const PORT = process.env.PORT || 5000;
const isProduction = process.env.NODE_ENV === "production";

app.disable("x-powered-by");
if (isProduction) app.set("trust proxy", 1);

const httpServer = createServer(app);
initializeSocket(httpServer);

app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json({ limit: "100kb" }));
app.use(clerkMiddleware());
app.use(
	fileUpload({
		useTempFiles: true,
		tempFileDir: tempDir,
		createParentPath: true,
		abortOnLimit: true,
		limits: { fileSize: 25 * 1024 * 1024 },
	})
);

// Uploads are removed right after they reach Cloudinary. This nightly sweep
// catches anything left behind by aborted or failed requests.
cron.schedule("0 0 * * *", () => {
	fs.readdir(tempDir, (err, files) => {
		if (err) return;
		for (const file of files) {
			fs.unlink(path.join(tempDir, file), () => {});
		}
	});
});

app.get("/api/health", (req, res) => res.status(200).json({ status: "ok" }));

app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/songs", songRoutes);
app.use("/api/albums", albumRoutes);
app.use("/api/stats", statRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/artists", artistRouter);
app.use("/api/genres", genreRouter);

app.use("/api", (req, res) => {
	res.status(404).json({ message: "Endpoint not found" });
});

// Only present when the frontend is built into this same deployment. When the frontend
// is hosted separately (e.g. on Vercel, talking to this API over VITE_API_URL), this
// directory does not exist here and the block below is skipped entirely.
const frontendIndex = path.join(frontendDist, "index.html");
if (isProduction && fs.existsSync(frontendIndex)) {
	app.use(express.static(frontendDist, { maxAge: "1y", index: false }));
	app.get("*", (req, res) => {
		res.sendFile(frontendIndex);
	});
}

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
	const status = err.status || err.statusCode || 500;
	if (status >= 500) console.error(err);

	res.status(status).json({
		message: status >= 500 && isProduction ? "Internal server error" : err.message,
	});
});

const start = async () => {
	await connectDB();
	httpServer.listen(PORT, () => {
		console.log(`Server is running on port ${PORT}`);
	});
};

start();
