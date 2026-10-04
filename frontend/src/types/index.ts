export interface Song {
	_id: string;
	title: string;
	artist: string;
	albumId: string | null;
	imageUrl: string;
	audioUrl: string;
	videoUrl?: string | null;
	duration: number;
	plays?: number;
	createdAt: string;
	updatedAt: string;
}

export interface Album {
	_id: string;
	title: string;
	artist: string;
	imageUrl: string;
	releaseYear: number;
	genre?: string | null;
	license?: { name?: string; url?: string } | null;
	sourceUrl?: string | null;
	songs: Song[];
}

export interface Artist {
	name: string;
	imageUrl: string | null;
	totalPlays: number;
	songs: Song[];
	albums: AlbumSummary[];
}

// GET /albums returns song ids, GET /albums/:id returns populated songs.
export interface AlbumSummary extends Omit<Album, "songs"> {
	songs: string[];
}

export interface User {
	_id: string;
	fullName: string;
	imageUrl: string;
	clerkId: string;
}

export interface Stats {
	totalSongs: number;
	totalAlbums: number;
	totalUsers: number;
	totalArtists: number;
}

export interface Message {
	_id: string;
	senderId: string;
	receiverId: string;
	content: string;
	createdAt: string;
	updatedAt: string;
}

export interface Activity {
	songId: string;
	title: string;
	artist: string;
	imageUrl: string;
}

export type RepeatMode = "off" | "all" | "one";
