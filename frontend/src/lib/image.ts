// Requests a resized, modern-format copy of Cloudinary images so a 56px thumbnail does
// not download a 1200px cover. Other URLs are returned unchanged.
const CLOUDINARY_UPLOAD = "/image/upload/";

export const sizedImage = (src: string | null | undefined, size: number) => {
	if (!src) return src ?? "";
	const index = src.indexOf(CLOUDINARY_UPLOAD);
	if (index === -1 || !src.includes("res.cloudinary.com")) return src;

	// Device pixel ratio up to 2, rounded to a few widths so the CDN cache stays warm.
	const target = Math.min(size * 2, 1200);
	const width = [96, 160, 320, 480, 640, 960, 1200].find((w) => w >= target) ?? 1200;
	const insertAt = index + CLOUDINARY_UPLOAD.length;
	return `${src.slice(0, insertAt)}f_auto,q_auto,c_fill,w_${width},h_${width}/${src.slice(insertAt)}`;
};
