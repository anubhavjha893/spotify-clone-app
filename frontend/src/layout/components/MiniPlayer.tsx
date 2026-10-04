import { Pause, Play } from "lucide-react";
import Artwork from "@/components/Artwork";
import LikeButton from "@/components/LikeButton";
import BufferingRing from "@/components/BufferingRing";
import { useDominantColor } from "@/hooks/useDominantColor";
import usePlayerStore from "@/stores/usePlayerStore";
import { useUIStore } from "@/stores/useUIStore";

// Compact player shown above the tab bar on phones. Tapping it opens the full screen player.
const MiniPlayer = () => {
	const currentSong = usePlayerStore((s) => s.currentSong);
	const isPlaying = usePlayerStore((s) => s.isPlaying);
	const isBuffering = usePlayerStore((s) => s.isBuffering);
	const currentTime = usePlayerStore((s) => s.currentTime);
	const duration = usePlayerStore((s) => s.duration);
	const togglePlay = usePlayerStore((s) => s.togglePlay);
	const setFullscreenOpen = useUIStore((s) => s.setFullscreenOpen);
	const tint = useDominantColor(currentSong?.imageUrl);

	if (!currentSong) return null;
	const progress = duration > 0 ? Math.min(currentTime / duration, 1) : 0;

	return (
		<div
			className="relative mx-2 overflow-hidden rounded-lg transition-colors duration-500"
			style={{ backgroundColor: `rgb(${tint})` }}
		>
			<div className="flex items-center gap-3 p-2">
				<button
					type="button"
					onClick={() => setFullscreenOpen(true)}
					className="flex min-w-0 flex-1 items-center gap-3 text-left"
					aria-label={`Open player for ${currentSong.title}`}
				>
					<Artwork src={currentSong.imageUrl} alt="" className="size-10" size={64} rounded="sm" />
					<span className="min-w-0">
						<span className="block truncate text-sm font-semibold text-white">{currentSong.title}</span>
						<span className="block truncate text-xs text-white/70">{currentSong.artist}</span>
					</span>
				</button>
				<LikeButton song={currentSong} />
				<button
					type="button"
					onClick={togglePlay}
					className="relative grid size-9 place-items-center rounded-full text-white"
					aria-label={isPlaying ? "Pause" : "Play"}
				>
					{isPlaying && isBuffering && <BufferingRing className="-inset-0.5" />}
					{isPlaying ? (
						<Pause className="size-6" fill="currentColor" strokeWidth={0} />
					) : (
						<Play className="size-6" fill="currentColor" strokeWidth={0} />
					)}
				</button>
			</div>
			<div className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-white/20" aria-hidden="true">
				<div className="h-full origin-left rounded-full bg-white" style={{ transform: `scaleX(${progress})` }} />
			</div>
		</div>
	);
};

export default MiniPlayer;
