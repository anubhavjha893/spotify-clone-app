import express from "express";
import { protectedRoute } from "../middleware/auth.middleware.js";
import {
	getAllUsers,
	getLikedSongs,
	getMessages,
	likeSong,
	unlikeSong,
} from "../controllers/user.controller.js";

const router = express.Router();
router.use(protectedRoute);

router.get("/", getAllUsers);
router.get("/messages/:userId", getMessages);
router.get("/me/likes", getLikedSongs);
router.put("/me/likes/:songId", likeSong);
router.delete("/me/likes/:songId", unlikeSong);

export default router;
