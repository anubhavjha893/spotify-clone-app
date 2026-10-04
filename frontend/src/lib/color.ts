export type RGB = [number, number, number];

export const DEFAULT_TINT: RGB = [64, 64, 64];

// Raw dominant colour per image, or null when it cannot be read.
const cache = new Map<string, Promise<RGB | null>>();

const toHsl = ([r, g, b]: RGB) => {
	const rn = r / 255;
	const gn = g / 255;
	const bn = b / 255;
	const max = Math.max(rn, gn, bn);
	const min = Math.min(rn, gn, bn);
	const l = (max + min) / 2;
	const d = max - min;
	const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
	return { s, l };
};

const hueOf = ([r, g, b]: RGB) => {
	const max = Math.max(r, g, b);
	const min = Math.min(r, g, b);
	if (max === min) return 0;
	const d = max - min;
	const h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
	return (h * 60 + 360) % 360;
};

// Purple and violet backdrops are toned down to a neutral grey of the same brightness,
// keeping the interface free of purple gradients whatever the artwork looks like.
const mutePurple = (rgb: RGB): RGB => {
	const hue = hueOf(rgb);
	if (hue < 255 || hue > 330) return rgb;
	const grey = Math.round(rgb[0] * 0.3 + rgb[1] * 0.59 + rgb[2] * 0.11);
	return [grey, grey, grey].map((value, i) => Math.round(value * 0.85 + rgb[i] * 0.15)) as RGB;
};

// Keeps the colour dark enough for white text to stay readable on top of it.
const clampForText = (input: RGB): RGB => {
	const [r, g, b] = mutePurple(input);
	const { l } = toHsl([r, g, b]);
	const target = 0.32;
	if (l <= target) return [r, g, b];
	const factor = target / l;
	return [Math.round(r * factor), Math.round(g * factor), Math.round(b * factor)];
};

const extract = (src: string) =>
	new Promise<RGB | null>((resolve) => {
		const img = new Image();
		img.crossOrigin = "anonymous";
		img.decoding = "async";

		img.onload = () => {
			try {
				const size = 32;
				const canvas = document.createElement("canvas");
				canvas.width = size;
				canvas.height = size;
				const ctx = canvas.getContext("2d", { willReadFrequently: true });
				if (!ctx) return resolve(null);

				ctx.drawImage(img, 0, 0, size, size);
				const { data } = ctx.getImageData(0, 0, size, size);

				// Bucket pixels and weight each bucket by saturation so the result is the
				// most characteristic colour of the artwork rather than a muddy average.
				const buckets = new Map<number, { r: number; g: number; b: number; weight: number }>();
				for (let i = 0; i < data.length; i += 4) {
					const r = data[i];
					const g = data[i + 1];
					const b = data[i + 2];
					const { s, l } = toHsl([r, g, b]);
					if (l < 0.08 || l > 0.92) continue;

					const key = ((r >> 5) << 6) | ((g >> 5) << 3) | (b >> 5);
					const weight = 0.25 + s;
					const bucket = buckets.get(key) || { r: 0, g: 0, b: 0, weight: 0 };
					bucket.r += r * weight;
					bucket.g += g * weight;
					bucket.b += b * weight;
					bucket.weight += weight;
					buckets.set(key, bucket);
				}

				let best: { r: number; g: number; b: number; weight: number } | null = null;
				for (const bucket of buckets.values()) {
					if (!best || bucket.weight > best.weight) best = bucket;
				}
				if (!best) return resolve(null);

				resolve([
					Math.round(best.r / best.weight),
					Math.round(best.g / best.weight),
					Math.round(best.b / best.weight),
				]);
			} catch {
				// Canvas is tainted when the image host does not send CORS headers.
				resolve(null);
			}
		};
		img.onerror = () => resolve(null);
		img.src = src;
	});

const readColor = (src: string) => {
	let result = cache.get(src);
	if (!result) {
		result = extract(src);
		cache.set(src, result);
	}
	return result;
};

// Dark version of the artwork colour, used behind white text.
export const getDominantColor = async (src: string): Promise<RGB> => {
	if (!src) return DEFAULT_TINT;
	const raw = await readColor(src);
	return raw ? clampForText(raw) : DEFAULT_TINT;
};

const hslToRgb = (h: number, s: number, l: number): RGB => {
	const c = (1 - Math.abs(2 * l - 1)) * s;
	const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
	const m = l - c / 2;
	const [r, g, b] =
		h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
	return [Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255)];
};

// Bright, saturated version of the artwork colour for small accents such as scrollbars.
// Returns null for greyscale or purple artwork, so callers can fall back to the brand green.
export const getAccentColor = async (src: string): Promise<RGB | null> => {
	if (!src) return null;
	const raw = await readColor(src);
	if (!raw) return null;
	const hue = hueOf(raw);
	const { s } = toHsl(raw);
	if (s < 0.2 || (hue >= 255 && hue <= 330)) return null;
	return hslToRgb(hue, Math.max(s, 0.6), 0.6);
};

export const rgbString = (rgb: RGB) => rgb.join(" ");
