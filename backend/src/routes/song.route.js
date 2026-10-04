import express from "express";
import {
	getAllSongs,
	getFeaturedSongs,
	getSongsMadeForYou,
	getTrendingSongs,
	lookupSongs,
	recordPlay,
} from "../controllers/song.controller.js";
import { protectedRoute, requireAdmin } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", protectedRoute, requireAdmin, getAllSongs);
router.get("/featured", getFeaturedSongs);
router.get("/made-for-you", getSongsMadeForYou);
router.get("/trending", getTrendingSongs);
router.post("/lookup", lookupSongs);
router.post("/:id/play", recordPlay);

export default router;
