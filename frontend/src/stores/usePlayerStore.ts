import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { RepeatMode, Song } from "@/types";
import { safeStorage } from "@/lib/storage";

// The single <audio> element is owned by AudioEngine and registered here so that
// actions such as seek can act on it directly.
let audioElement: HTMLAudioElement | null = null;
export const registerAudioElement = (element: HTMLAudioElement | null) => {
	audioElement = element;
};
export const getAudioElement = () => audioElement;

const RESTART_THRESHOLD_SECONDS = 3;

const shuffleKeepingFirst = (songs: Song[], first: number) => {
	const rest = songs.filter((_, index) => index !== first);
	for (let i = rest.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[rest[i], rest[j]] = [rest[j], rest[i]];
	}
	return first >= 0 && songs[first] ? [songs[first], ...rest] : rest;
};

interface PlayerState {
	queue: Song[];
	originalQueue: Song[];
	currentIndex: number;
	currentSong: Song | null;
	isPlaying: boolean;
	shuffle: boolean;
	repeat: RepeatMode;
	volume: number;
	muted: boolean;
	currentTime: number;
	duration: number;
	// Incremented whenever the same song must restart from the beginning.
	restartToken: number;
	// True while the audio waits for data, so controls can show a loading state.
	isBuffering: boolean;
	// Seconds of the current song that have been downloaded.
	bufferedEnd: number;

	playQueue: (songs: Song[], startIndex?: number) => void;
	playSong: (song: Song, context?: Song[]) => void;
	togglePlay: () => void;
	setPlaying: (playing: boolean) => void;
	next: () => void;
	previous: () => void;
	handleEnded: () => void;
	seek: (seconds: number) => void;
	setVolume: (volume: number) => void;
	toggleMute: () => void;
	toggleShuffle: () => void;
	cycleRepeat: () => void;
	addToQueue: (song: Song) => void;
	playNext: (song: Song) => void;
	removeFromQueue: (index: number) => void;
	jumpTo: (index: number) => void;
	clearUpcoming: () => void;
	setProgress: (currentTime: number, duration?: number) => void;
	setBuffering: (buffering: boolean) => void;
	setBufferedEnd: (seconds: number) => void;
	syncWithCatalog: (fresh: Song[]) => void;
}

const usePlayerStore = create<PlayerState>()(
	persist(
		(set, get) => {
			// Moves to a queue position. When the target is the song already loaded
			// (repeats or duplicates in the queue) the restart token makes it start over.
			const goTo = (index: number, playing: boolean) => {
				const { queue, currentSong, restartToken } = get();
				const song = queue[index];
				if (!song) return;
				set({
					currentIndex: index,
					currentSong: song,
					isPlaying: playing,
					currentTime: 0,
					restartToken: currentSong?._id === song._id ? restartToken + 1 : restartToken,
				});
			};

			return {
			queue: [],
			originalQueue: [],
			currentIndex: -1,
			currentSong: null,
			isPlaying: false,
			shuffle: false,
			repeat: "off",
			volume: 0.75,
			muted: false,
			currentTime: 0,
			duration: 0,
			restartToken: 0,
			isBuffering: false,
			bufferedEnd: 0,

			playQueue: (songs, startIndex = 0) => {
				if (songs.length === 0) return;
				const index = Math.min(Math.max(startIndex, 0), songs.length - 1);
				const { shuffle, currentSong, restartToken } = get();
				const queue = shuffle ? shuffleKeepingFirst(songs, index) : [...songs];
				const nextIndex = shuffle ? 0 : index;
				const song = queue[nextIndex];

				set({
					originalQueue: [...songs],
					queue,
					currentIndex: nextIndex,
					currentSong: song,
					isPlaying: true,
					currentTime: 0,
					restartToken: currentSong?._id === song._id ? restartToken + 1 : restartToken,
				});
			},

			playSong: (song, context) => {
				const songs = context && context.length > 0 ? context : [song];
				const index = songs.findIndex((s) => s._id === song._id);
				get().playQueue(songs, index === -1 ? 0 : index);
			},

			togglePlay: () => {
				const { currentSong, isPlaying } = get();
				if (!currentSong) return;
				set({ isPlaying: !isPlaying });
			},

			setPlaying: (playing) => set({ isPlaying: playing }),

			next: () => {
				const { queue, currentIndex, repeat } = get();
				if (queue.length === 0) return;

				const nextIndex = currentIndex + 1;
				if (nextIndex >= queue.length) {
					// End of the queue: wrap around, and only keep playing when repeat is on.
					goTo(0, repeat !== "off");
					return;
				}

				goTo(nextIndex, true);
			},

			previous: () => {
				const { queue, currentIndex, repeat, restartToken } = get();
				if (queue.length === 0) return;

				const position = audioElement?.currentTime ?? 0;
				const atStart = currentIndex <= 0 && repeat !== "all";
				if (position > RESTART_THRESHOLD_SECONDS || atStart) {
					get().seek(0);
					set({ restartToken: restartToken + 1, isPlaying: true });
					return;
				}

				goTo(currentIndex - 1 < 0 ? queue.length - 1 : currentIndex - 1, true);
			},

			handleEnded: () => {
				const { repeat, restartToken } = get();
				if (repeat === "one") {
					set({ restartToken: restartToken + 1, isPlaying: true, currentTime: 0 });
					return;
				}
				get().next();
			},

			seek: (seconds) => {
				if (audioElement && Number.isFinite(seconds)) {
					audioElement.currentTime = Math.max(0, seconds);
				}
				set({ currentTime: Math.max(0, seconds) });
			},

			setVolume: (volume) => {
				const clamped = Math.min(Math.max(volume, 0), 1);
				set({ volume: clamped, muted: clamped === 0 });
			},

			toggleMute: () => {
				const { muted, volume } = get();
				if (muted && volume === 0) set({ muted: false, volume: 0.5 });
				else set({ muted: !muted });
			},

			toggleShuffle: () => {
				const { shuffle, queue, originalQueue, currentIndex, currentSong } = get();
				if (!shuffle) {
					set({ shuffle: true, queue: shuffleKeepingFirst(queue, currentIndex), currentIndex: currentSong ? 0 : -1 });
					return;
				}

				const restored = originalQueue.length > 0 ? originalQueue : queue;
				const index = currentSong ? restored.findIndex((s) => s._id === currentSong._id) : -1;
				set({ shuffle: false, queue: [...restored], currentIndex: index });
			},

			cycleRepeat: () => {
				const order: RepeatMode[] = ["off", "all", "one"];
				const { repeat } = get();
				set({ repeat: order[(order.indexOf(repeat) + 1) % order.length] });
			},

			addToQueue: (song) => {
				const { queue, originalQueue, currentSong } = get();
				if (!currentSong) {
					get().playQueue([song]);
					return;
				}
				set({ queue: [...queue, song], originalQueue: [...originalQueue, song] });
			},

			playNext: (song) => {
				const { queue, originalQueue, currentIndex, currentSong } = get();
				if (!currentSong) {
					get().playQueue([song]);
					return;
				}
				const updated = [...queue];
				updated.splice(currentIndex + 1, 0, song);
				set({ queue: updated, originalQueue: [...originalQueue, song] });
			},

			removeFromQueue: (index) => {
				const { queue, currentIndex } = get();
				if (index === currentIndex || index < 0 || index >= queue.length) return;

				const removed = queue[index];
				const updated = queue.filter((_, i) => i !== index);
				const originalQueue = [...get().originalQueue];
				const originalIndex = originalQueue.findIndex((s) => s._id === removed._id);
				if (originalIndex !== -1) originalQueue.splice(originalIndex, 1);

				set({
					queue: updated,
					originalQueue,
					currentIndex: index < currentIndex ? currentIndex - 1 : currentIndex,
				});
			},

			jumpTo: (index) => goTo(index, true),

			clearUpcoming: () => {
				const { queue, currentIndex, currentSong } = get();
				if (!currentSong) return;
				const kept = queue.slice(0, currentIndex + 1);
				set({ queue: kept, originalQueue: kept });
			},

			setProgress: (currentTime, duration) => {
				set(duration === undefined ? { currentTime } : { currentTime, duration });
			},

			setBuffering: (buffering) => {
				if (get().isBuffering !== buffering) set({ isBuffering: buffering });
			},

			setBufferedEnd: (seconds) => set({ bufferedEnd: seconds }),

			// Replaces saved songs with their current catalog version (new URLs, titles, durations)
			// and drops songs that no longer exist. Stops playback if the current song was removed.
			syncWithCatalog: (fresh) => {
				const byId = new Map(fresh.map((song) => [song._id, song]));
				const { queue, originalQueue, currentIndex, currentSong } = get();
				const refresh = (songs: Song[]) => songs.flatMap((song) => (byId.has(song._id) ? [byId.get(song._id)!] : []));

				if (currentSong && !byId.has(currentSong._id)) {
					set({ queue: [], originalQueue: [], currentIndex: -1, currentSong: null, isPlaying: false, currentTime: 0, duration: 0 });
					return;
				}

				const before = queue.slice(0, Math.max(currentIndex, 0)).filter((song) => byId.has(song._id)).length;
				const updatedQueue = refresh(queue);
				set({
					queue: updatedQueue,
					originalQueue: refresh(originalQueue),
					currentIndex: currentSong ? before : -1,
					currentSong: currentSong ? byId.get(currentSong._id)! : null,
				});
			},
			};
		},
		{
			name: "encore-player",
			version: 1,
			storage: createJSONStorage(() => safeStorage),
			// Restores the last session paused, so nothing plays without the user asking.
			partialize: (state) => ({
				queue: state.queue,
				originalQueue: state.originalQueue,
				currentIndex: state.currentIndex,
				currentSong: state.currentSong,
				shuffle: state.shuffle,
				repeat: state.repeat,
				volume: state.volume,
				muted: state.muted,
			}),
		}
	)
);

export default usePlayerStore;
