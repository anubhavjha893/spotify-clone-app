import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance, getErrorMessage } from "@/lib/axios";
import type { Album, AlbumSummary, Song, Stats } from "@/types";

type Section = "featured" | "madeForYou" | "trending";

interface MusicStore {
	albums: AlbumSummary[];
	albumsLoading: boolean;
	albumsError: string | null;

	albumCache: Record<string, Album>;
	albumLoading: boolean;
	albumError: string | null;

	featuredSongs: Song[];
	madeForYouSongs: Song[];
	trendingSongs: Song[];
	sectionsLoading: Record<Section, boolean>;
	homeError: string | null;

	songs: Song[];
	songsLoading: boolean;
	songsError: string | null;
	stats: Stats;

	fetchAlbums: () => Promise<void>;
	fetchAlbumById: (id: string) => Promise<void>;
	fetchHome: () => Promise<void>;
	fetchSongs: () => Promise<void>;
	fetchStats: () => Promise<void>;
	deleteSong: (id: string) => Promise<void>;
	deleteAlbum: (id: string) => Promise<void>;
}

export const useMusicStore = create<MusicStore>((set, get) => ({
	albums: [],
	albumsLoading: false,
	albumsError: null,

	albumCache: {},
	albumLoading: false,
	albumError: null,

	featuredSongs: [],
	madeForYouSongs: [],
	trendingSongs: [],
	sectionsLoading: { featured: true, madeForYou: true, trending: true },
	homeError: null,

	songs: [],
	songsLoading: false,
	songsError: null,
	stats: { totalSongs: 0, totalAlbums: 0, totalUsers: 0, totalArtists: 0 },

	fetchAlbums: async () => {
		set({ albumsLoading: get().albums.length === 0, albumsError: null });
		try {
			const response = await axiosInstance.get<AlbumSummary[]>("/albums");
			set({ albums: response.data });
		} catch (error) {
			set({ albumsError: getErrorMessage(error) });
		} finally {
			set({ albumsLoading: false });
		}
	},

	fetchAlbumById: async (id) => {
		// Cached albums render instantly and are refreshed in the background.
		set({ albumLoading: !get().albumCache[id], albumError: null });
		try {
			const response = await axiosInstance.get<Album>(`/albums/${id}`);
			set((state) => ({ albumCache: { ...state.albumCache, [id]: response.data } }));
		} catch (error) {
			set({ albumError: getErrorMessage(error) });
		} finally {
			set({ albumLoading: false });
		}
	},

	fetchHome: async () => {
		const load = async (section: Section, url: string, key: "featuredSongs" | "madeForYouSongs" | "trendingSongs") => {
			try {
				const response = await axiosInstance.get<Song[]>(url);
				set({ [key]: response.data } as Pick<MusicStore, typeof key>);
			} catch (error) {
				set({ homeError: getErrorMessage(error, "Could not load music") });
			} finally {
				set((state) => ({ sectionsLoading: { ...state.sectionsLoading, [section]: false } }));
			}
		};

		set({ homeError: null });
		await Promise.all([
			load("featured", "/songs/featured", "featuredSongs"),
			load("madeForYou", "/songs/made-for-you", "madeForYouSongs"),
			load("trending", "/songs/trending", "trendingSongs"),
		]);
	},

	fetchSongs: async () => {
		set({ songsLoading: true, songsError: null });
		try {
			const response = await axiosInstance.get<Song[]>("/songs");
			set({ songs: response.data });
		} catch (error) {
			set({ songsError: getErrorMessage(error) });
		} finally {
			set({ songsLoading: false });
		}
	},

	fetchStats: async () => {
		try {
			const response = await axiosInstance.get<Stats>("/stats");
			set({ stats: response.data });
		} catch (error) {
			toast.error(getErrorMessage(error, "Could not load statistics"));
		}
	},

	deleteSong: async (id) => {
		try {
			await axiosInstance.delete(`/admin/songs/${id}`);
			set((state) => ({
				songs: state.songs.filter((song) => song._id !== id),
				albums: state.albums.map((album) => ({ ...album, songs: album.songs.filter((songId) => songId !== id) })),
				albumCache: {},
			}));
			get().fetchStats();
			toast.success("Song deleted");
		} catch (error) {
			toast.error(getErrorMessage(error, "Could not delete song"));
		}
	},

	deleteAlbum: async (id) => {
		try {
			await axiosInstance.delete(`/admin/albums/${id}`);
			set((state) => ({
				albums: state.albums.filter((album) => album._id !== id),
				songs: state.songs.filter((song) => song.albumId !== id),
				albumCache: {},
			}));
			get().fetchStats();
			toast.success("Album and its songs deleted");
		} catch (error) {
			toast.error(getErrorMessage(error, "Could not delete album"));
		}
	},
}));
