import { Pause, Play } from "lucide-react";
import { cn } from "@/lib/utils";

interface PlayCircleButtonProps {
	playing: boolean;
	onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
	label: string;
	size?: "sm" | "md" | "lg";
	className?: string;
	disabled?: boolean;
}

const sizes = {
	sm: "size-10 [&_svg]:size-4",
	md: "size-12 [&_svg]:size-5",
	lg: "size-14 [&_svg]:size-6",
};

const PlayCircleButton = ({ playing, onClick, label, size = "md", className, disabled }: PlayCircleButtonProps) => (
	<button
		type="button"
		onClick={onClick}
		disabled={disabled}
		aria-label={playing ? `Pause ${label}` : `Play ${label}`}
		title={playing ? "Pause" : "Play"}
		className={cn(
			"grid shrink-0 place-items-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-black/40",
			"transition-transform duration-150 hover:scale-105 hover:brightness-110 active:scale-95",
			"disabled:pointer-events-none disabled:opacity-50",
			sizes[size],
			className
		)}
	>
		{playing ? <Pause fill="currentColor" strokeWidth={0} /> : <Play fill="currentColor" strokeWidth={0} className="ml-0.5" />}
	</button>
);

export default PlayCircleButton;
