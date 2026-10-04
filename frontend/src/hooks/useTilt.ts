import { useEffect, useState } from "react";
import { useFinePointer, usePrefersReducedMotion } from "./useMediaQuery";

interface TiltOptions {
	// Maximum rotation in degrees.
	max?: number;
	// Lift towards the viewer while hovered, in pixels.
	lift?: number;
}

// Subtle 3D tilt that follows the pointer. Writes transforms straight to the element
// inside requestAnimationFrame, so React does not re-render on pointer moves.
// Disabled for touch input and for people who prefer reduced motion.
// Returns a callback ref, so it also works for elements that mount later.
export const useTilt = <T extends HTMLElement>({ max = 8, lift = 12 }: TiltOptions = {}) => {
	const [element, setElement] = useState<T | null>(null);
	const finePointer = useFinePointer();
	const reducedMotion = usePrefersReducedMotion();
	const enabled = finePointer && !reducedMotion;

	useEffect(() => {
		if (!element || !enabled) return;
		let frame = 0;

		element.style.transition = "transform 300ms cubic-bezier(0.2, 0.8, 0.2, 1)";
		element.style.willChange = "transform";

		const onMove = (event: PointerEvent) => {
			cancelAnimationFrame(frame);
			frame = requestAnimationFrame(() => {
				const rect = element.getBoundingClientRect();
				const x = (event.clientX - rect.left) / rect.width - 0.5;
				const y = (event.clientY - rect.top) / rect.height - 0.5;
				element.style.transform = `perspective(900px) rotateX(${(-y * max).toFixed(2)}deg) rotateY(${(x * max).toFixed(2)}deg) translateZ(${lift}px)`;
				element.style.setProperty("--glare-x", `${((x + 0.5) * 100).toFixed(1)}%`);
				element.style.setProperty("--glare-y", `${((y + 0.5) * 100).toFixed(1)}%`);
				element.style.setProperty("--glare-opacity", "1");
			});
		};

		const reset = () => {
			cancelAnimationFrame(frame);
			element.style.transform = "";
			element.style.setProperty("--glare-opacity", "0");
		};

		element.addEventListener("pointermove", onMove);
		element.addEventListener("pointerleave", reset);
		return () => {
			element.removeEventListener("pointermove", onMove);
			element.removeEventListener("pointerleave", reset);
			reset();
			element.style.willChange = "";
			element.style.transition = "";
		};
	}, [element, enabled, max, lift]);

	return setElement;
};
