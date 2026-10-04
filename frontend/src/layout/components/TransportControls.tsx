import { Pause, Play, Repeat, Repeat1, Shuffle, SkipBack, SkipForward } from "lucide-react";
import { cn } from "@/lib/utils";
import usePlayerStore from "@/stores/usePlayerStore";
import BufferingRing from "@/components/BufferingRing";

const toggleButton = (active: boolean) =>
	cn(
		"relative grid size-8 place-items-center rounded-full transition-colors [&_svg]:size-4",
		active ? "text-primary hover:brightness-110" : "text-subdued hover:text-white"
	);

const ActiveDot = () => (
	<span className="absolute -bottom-0.5 left-1/2 size-1 -translate-x-1/2 rounded-full bg-primary" aria-hidden="true" />
);

// Shuffle, previous, play, next and repeat. `large` is used by the full screen player.
const TransportControls = ({ large = false }: { large?: boolean }) => {
	const isPlaying = usePlayerStore((s) => s.isPlaying);
	const isBuffering = usePlayerStore((s) => s.isBuffering);
	const hasSong = usePlayerStore((s) => !!s.currentSong);
	const shuffle = usePlayerStore((s) => s.shuffle);
	const repeat = usePlayerStore((s) => s.repeat);
	const { togglePlay, next, previous, toggleShuffle, cycleRepeat } = usePlayerStore.getState();

	const repeatLabel = repeat === "off" ? "Enable repeat" : repeat === "all" ? "Enable repeat one" : "Disable repeat";

	return (
		<div className={cn("flex items-center justify-center", large ? "gap-6" : "gap-4")}>
			<button
				type="button"
				onClick={toggleShuffle}
				className={toggleButton(shuffle)}
				aria-pressed={shuffle}
				aria-label={shuffle ? "Disable shuffle" : "Enable shuffle"}
				title={shuffle ? "Disable shuffle" : "Enable shuffle"}
			>
				<Shuffle />
				{shuffle && <ActiveDot />}
			</button>

			<button
				type="button"
				onClick={previous}
				disabled={!hasSong}
				className={cn(
					"grid place-items-center text-subdued transition-colors hover:text-white disabled:opacity-40",
					large ? "size-10 [&_svg]:size-6" : "size-8 [&_svg]:size-5"
				)}
				aria-label="Previous"
				title="Previous"
			>
				<SkipBack fill="currentColor" />
			</button>

			<button
				type="button"
				onClick={togglePlay}
				disabled={!hasSong}
				className={cn(
					"relative grid place-items-center rounded-full bg-white text-black transition-transform hover:scale-105 active:scale-95 disabled:opacity-40 disabled:hover:scale-100",
					large ? "size-16 [&_svg]:size-7" : "size-8 [&_svg]:size-4"
				)}
				aria-label={isPlaying ? "Pause" : "Play"}
				title={isPlaying ? "Pause" : "Play"}
			>
				{isPlaying && isBuffering && <BufferingRing />}
				{isPlaying ? (
					<Pause fill="currentColor" strokeWidth={0} />
				) : (
					<Play fill="currentColor" strokeWidth={0} className="ml-0.5" />
				)}
			</button>

			<button
				type="button"
				onClick={next}
				disabled={!hasSong}
				className={cn(
					"grid place-items-center text-subdued transition-colors hover:text-white disabled:opacity-40",
					large ? "size-10 [&_svg]:size-6" : "size-8 [&_svg]:size-5"
				)}
				aria-label="Next"
				title="Next"
			>
				<SkipForward fill="currentColor" />
			</button>

			<button
				type="button"
				onClick={cycleRepeat}
				className={toggleButton(repeat !== "off")}
				aria-label={repeatLabel}
				title={repeatLabel}
			>
				{repeat === "one" ? <Repeat1 /> : <Repeat />}
				{repeat !== "off" && <ActiveDot />}
			</button>
		</div>
	);
};

export default TransportControls;
