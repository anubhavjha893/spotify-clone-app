import { cn } from "@/lib/utils";

// Small animated bars marking the track that is currently playing.
const Equalizer = ({ playing, className }: { playing: boolean; className?: string }) => (
	<span
		className={cn("inline-flex h-3.5 w-3.5 items-end gap-[2px]", !playing && "eq-paused", className)}
		aria-hidden="true"
	>
		<span className="eq-bar h-full w-[3px] rounded-sm bg-primary" />
		<span className="eq-bar h-full w-[3px] rounded-sm bg-primary" />
		<span className="eq-bar h-full w-[3px] rounded-sm bg-primary" />
	</span>
);

export default Equalizer;
