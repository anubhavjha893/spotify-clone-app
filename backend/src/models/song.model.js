import mongoose from "mongoose";

const songSchema = new mongoose.Schema(
	{
		title: { type: String, required: true, trim: true, maxlength: 200 },
		artist: { type: String, required: true, trim: true, maxlength: 200 },
		imageUrl: { type: String, required: true },
		audioUrl: { type: String, required: true },
		// Optional short looping video shown behind the player while the song plays.
		videoUrl: { type: String, default: null },
		duration: { type: Number, required: true, min: 0 },
		plays: { type: Number, default: 0, min: 0 },
		albumId: { type: mongoose.Schema.Types.ObjectId, ref: "Album", default: null },
	},
	{ timestamps: true }
);

songSchema.index({ plays: -1 });
songSchema.index({ albumId: 1 });
songSchema.index({ artist: 1 });

export const Song = mongoose.model("Song", songSchema);
