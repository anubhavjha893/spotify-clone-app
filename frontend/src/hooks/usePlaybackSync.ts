import { useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import { axiosInstance } from "@/lib/axios";
import { getAccentColor } from "@/lib/color";
import { sizedImage } from "@/lib/image";
import usePlayerStore from "@/stores/usePlayerStore";
import { useLibraryStore } from "@/stores/useLibraryStore";
import type { Song } from "@/types";

// The queue and recently played list are saved in the browser. When the catalog changes
// (songs edited, deleted or re-seeded) those copies go stale, so they are refreshed from
// the server once when the app starts.
export const useCatalogSync = () => {
	useEffect(() => {
		const player = usePlayerStore.getState();
		const library = useLibraryStore.getState();
		const ids = [
			...new Set([...player.queue, ...player.originalQueue, ...library.recentlyPlayed].map((song) => song._id)),
		];
		if (ids.length === 0) return;

		axiosInstance
			.post<Song[]>("/songs/lookup", { ids })
			.then(({ data }) => {
				usePlayerStore.getState().syncWithCatalog(data);
				useLibraryStore.getState().syncRecentlyPlayed(data);
			})
			.catch(() => {
				// Keep the saved state if the server cannot be reached; playback errors are handled separately.
			});
	}, []);
};

// Only one tab plays at a time: starting playback in one tab pauses the others.
const channel = typeof BroadcastChannel !== "undefined" ? new BroadcastChannel("encore-playback") : null;
const tabId = Math.random().toString(36).slice(2);

export const announcePlayback = () => channel?.postMessage({ type: "playing", tabId });

export const useSingleTabPlayback = () => {
	useEffect(() => {
		if (!channel) return;
		const onMessage = (event: MessageEvent<{ type: string; tabId: string }>) => {
			if (event.data?.type === "playing" && event.data.tabId !== tabId && usePlayerStore.getState().isPlaying) {
				usePlayerStore.getState().setPlaying(false);
			}
		};
		channel.addEventListener("message", onMessage);
		return () => channel.removeEventListener("message", onMessage);
	}, []);
};

// Liked Songs can change on another device or tab, so they are refreshed when the
// window regains focus (at most once every 30 seconds).
export const useLikesRefreshOnFocus = () => {
	const { isSignedIn } = useAuth();

	useEffect(() => {
		if (!isSignedIn) return;
		let last = Date.now();
		const onVisible = () => {
			if (document.visibilityState !== "visible" || Date.now() - last < 30_000) return;
			last = Date.now();
			useLibraryStore.getState().fetchLikes();
		};
		document.addEventListener("visibilitychange", onVisible);
		return () => document.removeEventListener("visibilitychange", onVisible);
	}, [isSignedIn]);
};

// Scrollbars take the colour of the song that is playing, falling back to the brand green.
export const useScrollbarColor = (imageUrl: string | null | undefined) => {
	useEffect(() => {
		let active = true;
		const root = document.documentElement;
		if (!imageUrl) {
			root.style.removeProperty("--scroll-rgb");
			return;
		}
		getAccentColor(sizedImage(imageUrl, 48)).then((rgb) => {
			if (!active) return;
			if (rgb) root.style.setProperty("--scroll-rgb", rgb.join(" "));
			else root.style.removeProperty("--scroll-rgb");
		});
		return () => {
			active = false;
		};
	}, [imageUrl]);
};

// Downloads the start of the next track in the background so skipping is instant.
const preloader = typeof Audio !== "undefined" ? new Audio() : null;
if (preloader) {
	preloader.preload = "auto";
	preloader.muted = true;
}

export const preloadSong = (song: Song | null | undefined) => {
	if (!preloader || !song || preloader.src === song.audioUrl) return;
	preloader.src = song.audioUrl;
	preloader.load();
};
