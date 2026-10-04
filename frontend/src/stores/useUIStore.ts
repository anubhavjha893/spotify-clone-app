import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { safeStorage } from "@/lib/storage";

export type RightPanel = "now-playing" | "queue" | "friends" | null;

interface UIStore {
	rightPanel: RightPanel;
	fullscreenOpen: boolean;
	shortcutsOpen: boolean;
	// The colour behind page headers, taken from the artwork on screen.
	tint: string;
	showRemaining: boolean;

	toggleRightPanel: (panel: Exclude<RightPanel, null>) => void;
	setFullscreenOpen: (open: boolean) => void;
	setShortcutsOpen: (open: boolean) => void;
	setTint: (tint: string) => void;
	toggleRemaining: () => void;
}

export const useUIStore = create<UIStore>()(
	persist(
		(set, get) => ({
			rightPanel: "now-playing",
			fullscreenOpen: false,
			shortcutsOpen: false,
			tint: "64 64 64",
			showRemaining: false,

			toggleRightPanel: (panel) => set({ rightPanel: get().rightPanel === panel ? null : panel }),
			setFullscreenOpen: (open) => set({ fullscreenOpen: open }),
			setShortcutsOpen: (open) => set({ shortcutsOpen: open }),
			setTint: (tint) => set({ tint }),
			toggleRemaining: () => set({ showRemaining: !get().showRemaining }),
		}),
		{
			name: "encore-ui",
			version: 1,
			storage: createJSONStorage(() => safeStorage),
			partialize: (state) => ({ rightPanel: state.rightPanel, showRemaining: state.showRemaining }),
		}
	)
);
