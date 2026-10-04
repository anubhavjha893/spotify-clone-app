import express from "express";
import { getArtist, getGenre } from "../controllers/artist.controller.js";

export const artistRouter = express.Router();
artistRouter.get("/:name", getArtist);

export const genreRouter = express.Router();
genreRouter.get("/:name", getGenre);
