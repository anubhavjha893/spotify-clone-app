import { cn } from "@/lib/utils";

// Spinning ring drawn around a play button while the audio is loading.
const BufferingRing = ({ className }: { className?: string }) => (
	<span
		className={cn(
			"pointer-events-none absolute -inset-1 animate-spin rounded-full border-2 border-white/10 border-t-primary",
			className
		)}
		role="status"
		aria-label="Loading"
	/>
);

export default BufferingRing;
