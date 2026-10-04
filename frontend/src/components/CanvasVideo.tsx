import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";

interface CanvasVideoProps {
	src: string;
	playing: boolean;
	className?: string;
	onUnavailable?: () => void;
}

// Short looping video shown behind a song while it plays. Muted, and paused together
// with the music, when the tab is hidden, or when reduced motion is requested.
const CanvasVideo = ({ src, playing, className, onUnavailable }: CanvasVideoProps) => {
	const ref = useRef<HTMLVideoElement>(null);
	const reducedMotion = usePrefersReducedMotion();
	const [readySrc, setReadySrc] = useState<string | null>(null);
	const ready = readySrc === src;

	useEffect(() => {
		const video = ref.current;
		if (!video) return;

		const sync = () => {
			if (playing && !reducedMotion && document.visibilityState === "visible") {
				video.play().catch(() => {});
			} else {
				video.pause();
			}
		};

		sync();
		document.addEventListener("visibilitychange", sync);
		return () => document.removeEventListener("visibilitychange", sync);
	}, [playing, reducedMotion, src]);

	return (
		<video
			ref={ref}
			key={src}
			src={src}
			muted
			loop
			playsInline
			preload="metadata"
			aria-hidden="true"
			onLoadedData={() => setReadySrc(src)}
			onError={onUnavailable}
			className={cn("object-cover transition-opacity duration-700", ready ? "opacity-100" : "opacity-0", className)}
		/>
	);
};

export default CanvasVideo;
