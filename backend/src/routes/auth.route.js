import express from "express";
import { syncUser } from "../controllers/auth.controller.js";
import { protectedRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/callback", protectedRoute, syncUser);

export default router;
