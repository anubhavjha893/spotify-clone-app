import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import toast from "react-hot-toast";
import { axiosInstance, getErrorMessage } from "@/lib/axios";
import { safeStorage } from "@/lib/storage";
import type { Song } from "@/types";

const RECENT_LIMIT = 12;

interface LibraryStore {
	likedSongs: Song[];
	likedIds: string[];
	likesLoading: boolean;
	likesLoaded: boolean;
	recentlyPlayed: Song[];

	fetchLikes: () => Promise<void>;
	toggleLike: (song: Song) => Promise<void>;
	resetLikes: () => void;
	addRecentlyPlayed: (song: Song) => void;
	syncRecentlyPlayed: (fresh: Song[]) => void;
}

export const useLibraryStore = create<LibraryStore>()(
	persist(
		(set, get) => ({
			likedSongs: [],
			likedIds: [],
			likesLoading: false,
			likesLoaded: false,
			recentlyPlayed: [],

			fetchLikes: async () => {
				set({ likesLoading: true });
				try {
					const response = await axiosInstance.get<Song[]>("/users/me/likes");
					set({ likedSongs: response.data, likedIds: response.data.map((s) => s._id), likesLoaded: true });
				} catch (error) {
					toast.error(getErrorMessage(error, "Could not load liked songs"));
				} finally {
					set({ likesLoading: false });
				}
			},

			toggleLike: async (song) => {
				const { likedIds, likedSongs } = get();
				const wasLiked = likedIds.includes(song._id);

				// Optimistic update, rolled back if the request fails.
				set({
					likedIds: wasLiked ? likedIds.filter((id) => id !== song._id) : [song._id, ...likedIds],
					likedSongs: wasLiked ? likedSongs.filter((s) => s._id !== song._id) : [song, ...likedSongs],
				});

				try {
					if (wasLiked) await axiosInstance.delete(`/users/me/likes/${song._id}`);
					else await axiosInstance.put(`/users/me/likes/${song._id}`);
					toast.success(wasLiked ? "Removed from Liked Songs" : "Added to Liked Songs", { id: "like" });
				} catch (error) {
					set({ likedIds, likedSongs });
					toast.error(getErrorMessage(error, "Could not update Liked Songs"), { id: "like" });
				}
			},

			resetLikes: () => set({ likedSongs: [], likedIds: [], likesLoaded: false }),

			addRecentlyPlayed: (song) => {
				const rest = get().recentlyPlayed.filter((s) => s._id !== song._id);
				set({ recentlyPlayed: [song, ...rest].slice(0, RECENT_LIMIT) });
			},

			syncRecentlyPlayed: (fresh) => {
				const byId = new Map(fresh.map((song) => [song._id, song]));
				set({
					recentlyPlayed: get().recentlyPlayed.flatMap((song) => (byId.has(song._id) ? [byId.get(song._id)!] : [])),
				});
			},
		}),
		{
			name: "encore-library",
			version: 1,
			storage: createJSONStorage(() => safeStorage),
			partialize: (state) => ({ recentlyPlayed: state.recentlyPlayed }),
		}
	)
);
