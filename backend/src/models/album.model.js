import mongoose from "mongoose";

const albumSchema = new mongoose.Schema(
	{
		title: { type: String, required: true, trim: true, maxlength: 200 },
		artist: { type: String, required: true, trim: true, maxlength: 200 },
		imageUrl: { type: String, required: true },
		releaseYear: { type: Number, required: true, min: 1900, max: 2100 },
		genre: { type: String, trim: true, maxlength: 60, default: null },
		// Licence and source, shown as credits on the album page (required for Creative Commons music).
		license: {
			name: { type: String, trim: true, maxlength: 60 },
			url: { type: String, trim: true, maxlength: 300 },
		},
		sourceUrl: { type: String, trim: true, maxlength: 300, default: null },
		songs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Song" }],
	},
	{ timestamps: true }
);

albumSchema.index({ artist: 1 });
albumSchema.index({ genre: 1 });

export const Album = mongoose.model("Album", albumSchema);
