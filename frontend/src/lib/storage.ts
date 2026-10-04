import type { StateStorage } from "zustand/middleware";

// localStorage can be unavailable (private windows, blocked site data), so every
// access is guarded and the app keeps working with in-memory state.
export const safeStorage: StateStorage = {
	getItem: (name) => {
		try {
			return window.localStorage.getItem(name);
		} catch {
			return null;
		}
	},
	setItem: (name, value) => {
		try {
			window.localStorage.setItem(name, value);
		} catch {
			// ignore
		}
	},
	removeItem: (name) => {
		try {
			window.localStorage.removeItem(name);
		} catch {
			// ignore
		}
	},
};
