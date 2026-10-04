import { useEffect } from "react";
import usePlayerStore from "@/stores/usePlayerStore";
import { useLibraryStore } from "@/stores/useLibraryStore";
import { useUIStore } from "@/stores/useUIStore";

export const SHORTCUTS: { keys: string[]; label: string }[] = [
	{ keys: ["Space"], label: "Play or pause" },
	{ keys: ["Shift", "Right"], label: "Next track" },
	{ keys: ["Shift", "Left"], label: "Previous track" },
	{ keys: ["Right"], label: "Forward 10 seconds" },
	{ keys: ["Left"], label: "Back 10 seconds" },
	{ keys: ["Shift", "Up"], label: "Volume up" },
	{ keys: ["Shift", "Down"], label: "Volume down" },
	{ keys: ["M"], label: "Mute or unmute" },
	{ keys: ["S"], label: "Shuffle" },
	{ keys: ["R"], label: "Cycle repeat mode" },
	{ keys: ["L"], label: "Like or unlike the current track" },
	{ keys: ["F"], label: "Open or close the full screen player" },
	{ keys: ["?"], label: "Show keyboard shortcuts" },
];

const isTypingTarget = (target: EventTarget | null) => {
	if (!(target instanceof HTMLElement)) return false;
	return (
		target.isContentEditable ||
		["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName) ||
		target.getAttribute("role") === "slider"
	);
};

export const useKeyboardShortcuts = (signedIn: boolean) => {
	useEffect(() => {
		const onKeyDown = (event: KeyboardEvent) => {
			if (event.defaultPrevented || event.ctrlKey || event.metaKey || event.altKey) return;
			if (isTypingTarget(event.target)) return;

			const player = usePlayerStore.getState();
			const ui = useUIStore.getState();
			const key = event.key;

			// Let Space activate focused buttons and links normally.
			if (key === " " && event.target instanceof HTMLElement && event.target.closest("button, a, [role=button]")) {
				return;
			}

			const handled = (() => {
				switch (key) {
					case " ":
						player.togglePlay();
						return true;
					case "ArrowRight":
						if (event.shiftKey) player.next();
						else player.seek(Math.min(player.currentTime + 10, player.duration || Infinity));
						return true;
					case "ArrowLeft":
						if (event.shiftKey) player.previous();
						else player.seek(Math.max(player.currentTime - 10, 0));
						return true;
					case "ArrowUp":
						if (!event.shiftKey) return false;
						player.setVolume((player.muted ? 0 : player.volume) + 0.1);
						return true;
					case "ArrowDown":
						if (!event.shiftKey) return false;
						player.setVolume((player.muted ? 0 : player.volume) - 0.1);
						return true;
					case "m":
					case "M":
						player.toggleMute();
						return true;
					case "s":
					case "S":
						player.toggleShuffle();
						return true;
					case "r":
					case "R":
						player.cycleRepeat();
						return true;
					case "l":
					case "L":
						if (signedIn && player.currentSong) useLibraryStore.getState().toggleLike(player.currentSong);
						return true;
					case "f":
					case "F":
						if (player.currentSong) ui.setFullscreenOpen(!ui.fullscreenOpen);
						return true;
					case "?":
						ui.setShortcutsOpen(true);
						return true;
					default:
						return false;
				}
			})();

			if (handled) event.preventDefault();
		};

		window.addEventListener("keydown", onKeyDown);
		return () => window.removeEventListener("keydown", onKeyDown);
	}, [signedIn]);
};
