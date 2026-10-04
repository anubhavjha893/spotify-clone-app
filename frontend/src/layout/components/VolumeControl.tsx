import { Volume, Volume1, Volume2, VolumeX } from "lucide-react";
import { Slider } from "@/components/ui/Slider";
import usePlayerStore from "@/stores/usePlayerStore";

const VolumeControl = () => {
	const volume = usePlayerStore((s) => s.volume);
	const muted = usePlayerStore((s) => s.muted);
	const { setVolume, toggleMute } = usePlayerStore.getState();

	const effective = muted ? 0 : volume;
	const Icon = effective === 0 ? VolumeX : effective < 0.34 ? Volume : effective < 0.67 ? Volume1 : Volume2;

	return (
		<div className="flex items-center gap-1">
			<button
				type="button"
				onClick={toggleMute}
				className="grid size-8 place-items-center text-subdued transition-colors hover:text-white"
				aria-label={muted ? "Unmute" : "Mute"}
				title={muted ? "Unmute" : "Mute"}
			>
				<Icon className="size-4" />
			</button>
			<Slider
				value={[effective * 100]}
				max={100}
				step={1}
				className="w-24"
				onValueChange={([value]) => setVolume(value / 100)}
				aria-label="Volume"
			/>
		</div>
	);
};

export default VolumeControl;
