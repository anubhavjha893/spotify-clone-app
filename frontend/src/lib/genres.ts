// Fixed tile colours for genres, so a genre always looks the same everywhere.
const PALETTE = ["#e13300", "#1e3264", "#148a08", "#056952", "#ba5d07", "#477d95", "#e8115b", "#27856a", "#8c1932", "#0d73ec"];

export const genreColor = (genre: string) => {
	let hash = 0;
	for (const char of genre.toLowerCase()) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
	return PALETTE[hash % PALETTE.length];
};

export const genrePath = (genre: string) => `/genre/${encodeURIComponent(genre)}`;
export const artistPath = (artist: string) => `/artist/${encodeURIComponent(artist)}`;
