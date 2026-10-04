import { useEffect, useState } from "react";
import { DEFAULT_TINT, getDominantColor, rgbString } from "@/lib/color";
import { sizedImage } from "@/lib/image";

// Returns "r g b" for use in rgb(var(--tint) / alpha).
export const useDominantColor = (src: string | null | undefined) => {
	const [color, setColor] = useState(rgbString(DEFAULT_TINT));

	useEffect(() => {
		let active = true;
		if (!src) {
			setColor(rgbString(DEFAULT_TINT));
			return;
		}
		getDominantColor(sizedImage(src, 48)).then((rgb) => {
			if (active) setColor(rgbString(rgb));
		});
		return () => {
			active = false;
		};
	}, [src]);

	return color;
};
