import { useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { axiosInstance } from "@/lib/axios";
import usePlayerStore, { registerAudioElement } from "@/stores/usePlayerStore";
import useChatStore from "@/stores/useChatStore";
import { useLibraryStore } from "@/stores/useLibraryStore";
import {
	announcePlayback,
	preloadSong,
	useCatalogSync,
	useLikesRefreshOnFocus,
	useScrollbarColor,
	useSingleTabPlayback,
} from "@/hooks/usePlaybackSync";

// A play is counted once someone has listened for 30 seconds, or half of a shorter track.
const MIN_LISTEN_SECONDS = 30;

const AudioEngine = () => {
	const audioRef = useRef<HTMLAudioElement>(null);
	const loadedSongId = useRef<string | null>(null);
	// True while a new source loads; pause events fired by the switch are not user pauses.
	const switching = useRef(false);
	const listened = useRef({ seconds: 0, lastTime: 0, counted: false });
	const nextPreloaded = useRef(false);
	const currentSongImage = usePlayerStore((s) => s.currentSong?.imageUrl);

	useCatalogSync();
	useSingleTabPlayback();
	useLikesRefreshOnFocus();
	useScrollbarColor(currentSongImage);

	const currentSong = usePlayerStore((s) => s.currentSong);
	const isPlaying = usePlayerStore((s) => s.isPlaying);
	const volume = usePlayerStore((s) => s.volume);
	const muted = usePlayerStore((s) => s.muted);
	const restartToken = usePlayerStore((s) => s.restartToken);

	useEffect(() => {
		registerAudioElement(audioRef.current);
		return () => registerAudioElement(null);
	}, []);

	// Load a new source when the song changes.
	useEffect(() => {
		const audio = audioRef.current;
		if (!audio) return;

		if (!currentSong) {
			audio.removeAttribute("src");
			audio.load();
			loadedSongId.current = null;
			return;
		}

		if (loadedSongId.current !== currentSong._id) {
			loadedSongId.current = currentSong._id;
			switching.current = true;
			listened.current = { seconds: 0, lastTime: 0, counted: false };
			audio.src = currentSong.audioUrl;
			audio.load();
			usePlayerStore.getState().setProgress(0, currentSong.duration || 0);
		}
	}, [currentSong]);

	// Restart the same song (repeat one, previous at the start, replaying a duplicate).
	useEffect(() => {
		const audio = audioRef.current;
		if (!audio || restartToken === 0) return;
		audio.currentTime = 0;
		listened.current = { seconds: 0, lastTime: 0, counted: false };
	}, [restartToken]);

	// Play or pause. Runs after a source change too, so the new song starts automatically.
	useEffect(() => {
		const audio = audioRef.current;
		if (!audio || !currentSong) return;

		if (isPlaying) {
			audio.play().catch((error: DOMException) => {
				// Browsers block audio until the person interacts with the page.
				if (error.name === "NotAllowedError") usePlayerStore.getState().setPlaying(false);
			});
		} else {
			audio.pause();
		}
	}, [isPlaying, currentSong, restartToken]);

	useEffect(() => {
		if (audioRef.current) {
			audioRef.current.volume = volume;
			audioRef.current.muted = muted;
		}
	}, [volume, muted]);

	// Tell friends what is playing.
	useEffect(() => {
		const { updateActivity } = useChatStore.getState();
		updateActivity(
			currentSong && isPlaying
				? {
						songId: currentSong._id,
						title: currentSong.title,
						artist: currentSong.artist,
						imageUrl: currentSong.imageUrl,
					}
				: null
		);
	}, [currentSong, isPlaying]);

	// Lock screen, notification and hardware media key controls.
	useEffect(() => {
		if (!("mediaSession" in navigator)) return;
		const session = navigator.mediaSession;

		if (!currentSong) {
			session.metadata = null;
			return;
		}

		session.metadata = new MediaMetadata({
			title: currentSong.title,
			artist: currentSong.artist,
			artwork: [{ src: currentSong.imageUrl, sizes: "640x640" }],
		});

		const player = usePlayerStore.getState;
		const handlers: [MediaSessionAction, MediaSessionActionHandler][] = [
			["play", () => player().setPlaying(true)],
			["pause", () => player().setPlaying(false)],
			["previoustrack", () => player().previous()],
			["nexttrack", () => player().next()],
			["seekto", (details) => details.seekTime !== undefined && player().seek(details.seekTime)],
			["seekbackward", () => player().seek(Math.max(player().currentTime - 10, 0))],
			["seekforward", () => player().seek(player().currentTime + 10)],
		];
		for (const [action, handler] of handlers) {
			try {
				session.setActionHandler(action, handler);
			} catch {
				// Action not supported by this browser.
			}
		}
	}, [currentSong]);

	useEffect(() => {
		if ("mediaSession" in navigator) {
			navigator.mediaSession.playbackState = currentSong ? (isPlaying ? "playing" : "paused") : "none";
		}
	}, [currentSong, isPlaying]);

	const handleTimeUpdate = () => {
		const audio = audioRef.current;
		const song = usePlayerStore.getState().currentSong;
		// While a seek is in flight the reported time is in limbo; "seeked" reports the final position.
		if (!audio || !song || audio.seeking) return;

		usePlayerStore.getState().setProgress(audio.currentTime);

		// Warm up the next track once this one is safely playing.
		if (audio.currentTime > 5 && !nextPreloaded.current) {
			nextPreloaded.current = true;
			const { queue, currentIndex, repeat } = usePlayerStore.getState();
			preloadSong(queue[currentIndex + 1] ?? (repeat === "all" ? queue[0] : null));
		}

		// Count only continuous listening, not seeking.
		const state = listened.current;
		const delta = audio.currentTime - state.lastTime;
		if (delta > 0 && delta < 2) state.seconds += delta;
		state.lastTime = audio.currentTime;

		const threshold = Math.min(MIN_LISTEN_SECONDS, (audio.duration || song.duration) / 2);
		if (!state.counted && state.seconds >= threshold) {
			state.counted = true;
			axiosInstance.post(`/songs/${song._id}/play`).catch(() => {});
			useLibraryStore.getState().addRecentlyPlayed(song);
		}
	};

	const handleError = () => {
		const audio = audioRef.current;
		if (!audio?.getAttribute("src")) return;
		toast.error("This track could not be played. Skipping to the next one.", { id: "audio-error" });
		const { queue, next, setPlaying } = usePlayerStore.getState();
		if (queue.length > 1) next();
		else setPlaying(false);
	};

	return (
		<audio
			ref={audioRef}
			preload="auto"
			onTimeUpdate={handleTimeUpdate}
			onLoadedMetadata={(e) => usePlayerStore.getState().setProgress(e.currentTarget.currentTime, e.currentTarget.duration)}
			onEnded={() => usePlayerStore.getState().handleEnded()}
			onLoadedData={() => {
				switching.current = false;
			}}
			onLoadStart={() => {
				if (usePlayerStore.getState().isPlaying) usePlayerStore.getState().setBuffering(true);
			}}
			onWaiting={() => usePlayerStore.getState().setBuffering(true)}
			onPlaying={() => usePlayerStore.getState().setBuffering(false)}
			onCanPlay={(e) => {
				if (e.currentTarget.paused) usePlayerStore.getState().setBuffering(false);
			}}
			onSeeked={(e) => usePlayerStore.getState().setProgress(e.currentTarget.currentTime)}
			onProgress={(e) => {
				const audio = e.currentTarget;
				// The buffered range that contains the playhead.
				for (let i = 0; i < audio.buffered.length; i++) {
					if (audio.buffered.start(i) <= audio.currentTime + 0.5 && audio.buffered.end(i) >= audio.currentTime) {
						usePlayerStore.getState().setBufferedEnd(audio.buffered.end(i));
						return;
					}
				}
			}}
			onPlay={() => {
				usePlayerStore.getState().setPlaying(true);
				announcePlayback();
			}}
			onPause={(e) => {
				usePlayerStore.getState().setBuffering(false);
				// Keep the store in sync when playback is paused by the system (headphones unplugged etc).
				if (!switching.current && !e.currentTarget.ended) usePlayerStore.getState().setPlaying(false);
			}}
			onError={handleError}
		/>
	);
};

export default AudioEngine;
