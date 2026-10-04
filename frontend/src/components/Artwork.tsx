import { useState } from "react";
import { Music } from "lucide-react";
import { cn } from "@/lib/utils";
import { sizedImage } from "@/lib/image";

interface ArtworkProps {
	src?: string | null;
	alt: string;
	className?: string;
	rounded?: "sm" | "md" | "full";
	eager?: boolean;
	// Rendered size in CSS pixels, used to request a suitably sized image.
	size?: number;
}

// Cover art with lazy loading, a neutral placeholder while it loads and a fallback icon on error.
const Artwork = ({ src, alt, className, rounded = "md", eager = false, size = 320 }: ArtworkProps) => {
	const [status, setStatus] = useState({ src, state: src ? "loading" : "error" });
	// Reset when a different image is passed to the same instance.
	if (status.src !== src) setStatus({ src, state: src ? "loading" : "error" });
	const state = status.src === src ? status.state : "loading";
	const setState = (next: "loaded" | "error") => setStatus({ src, state: next });
	const radius = rounded === "full" ? "rounded-full" : rounded === "sm" ? "rounded" : "rounded-md";

	return (
		<div className={cn("relative shrink-0 overflow-hidden bg-surface-hover", radius, className)}>
			{state !== "error" && src && (
				<img
					src={sizedImage(src, size)}
					alt={alt}
					loading={eager ? "eager" : "lazy"}
					decoding="async"
					draggable={false}
					onLoad={() => setState("loaded")}
					onError={() => setState("error")}
					className={cn(
						"size-full object-cover transition-opacity duration-300",
						state === "loaded" ? "opacity-100" : "opacity-0"
					)}
				/>
			)}
			{state === "error" && (
				<div className="absolute inset-0 grid place-items-center text-subdued" role="img" aria-label={alt}>
					<Music className="size-1/3 min-h-4 min-w-4" />
				</div>
			)}
		</div>
	);
};

export default Artwork;
