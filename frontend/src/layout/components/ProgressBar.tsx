import { useState } from "react";
import { Slider } from "@/components/ui/Slider";
import { formatTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import usePlayerStore from "@/stores/usePlayerStore";
import { useUIStore } from "@/stores/useUIStore";

// While dragging, the thumb follows the pointer and the audio only seeks on release.
const ProgressBar = ({ className, compact = false }: { className?: string; compact?: boolean }) => {
	const currentTime = usePlayerStore((s) => s.currentTime);
	const duration = usePlayerStore((s) => s.duration);
	const bufferedEnd = usePlayerStore((s) => s.bufferedEnd);
	const hasSong = usePlayerStore((s) => !!s.currentSong);
	const seek = usePlayerStore((s) => s.seek);
	const showRemaining = useUIStore((s) => s.showRemaining);
	const toggleRemaining = useUIStore((s) => s.toggleRemaining);
	const [dragValue, setDragValue] = useState<number | null>(null);

	const total = Number.isFinite(duration) && duration > 0 ? duration : 0;
	const position = dragValue ?? Math.min(currentTime, total || currentTime);

	return (
		<div className={cn("flex w-full items-center gap-2 text-xs tabular-nums text-subdued", className)}>
			{!compact && <span className="w-10 text-right">{formatTime(position)}</span>}
			<Slider
				value={[position]}
				max={total || 1}
				step={1}
				disabled={!hasSong || !total}
				bufferedPercent={total ? (bufferedEnd / total) * 100 : 0}
				onValueChange={([value]) => setDragValue(value)}
				onValueCommit={([value]) => {
					seek(value);
					setDragValue(null);
				}}
				aria-label="Seek"
				aria-valuetext={`${formatTime(position)} of ${formatTime(total)}`}
			/>
			{!compact && (
				<button
					type="button"
					onClick={toggleRemaining}
					className="w-11 text-left hover:text-white"
					title={showRemaining ? "Show total length" : "Show time remaining"}
				>
					{showRemaining && total ? `-${formatTime(total - position)}` : formatTime(total)}
				</button>
			)}
		</div>
	);
};

export default ProgressBar;
