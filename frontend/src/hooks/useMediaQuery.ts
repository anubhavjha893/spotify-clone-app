import { useSyncExternalStore } from "react";

export const useMediaQuery = (query: string) =>
	useSyncExternalStore(
		(onChange) => {
			const list = window.matchMedia(query);
			list.addEventListener("change", onChange);
			return () => list.removeEventListener("change", onChange);
		},
		() => window.matchMedia(query).matches,
		() => false
	);

export const useIsDesktop = () => useMediaQuery("(min-width: 768px)");
export const usePrefersReducedMotion = () => useMediaQuery("(prefers-reduced-motion: reduce)");
export const useFinePointer = () => useMediaQuery("(hover: hover) and (pointer: fine)");
