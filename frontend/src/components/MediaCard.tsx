import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useTilt } from "@/hooks/useTilt";
import Artwork from "./Artwork";
import PlayCircleButton from "./PlayCircleButton";

interface MediaCardProps {
	title: string;
	subtitle: string;
	imageUrl: string;
	to?: string;
	playing: boolean;
	onPlay: () => void;
	roundedArt?: boolean;
}

// Card with a pointer-following 3D tilt and a light glare across the artwork.
const MediaCard = ({ title, subtitle, imageUrl, to, playing, onPlay, roundedArt = false }: MediaCardProps) => {
	const navigate = useNavigate();
	const tiltRef = useTilt<HTMLDivElement>({ max: 10, lift: 18 });

	const open = () => (to ? navigate(to) : onPlay());

	return (
		<div
			className="group relative cursor-pointer rounded-lg p-3 transition-colors duration-300 hover:bg-white/[0.07]"
			onClick={open}
		>
			<div ref={tiltRef} className="relative mb-3" style={{ transformStyle: "preserve-3d" }}>
				<Artwork
					src={imageUrl}
					alt=""
					rounded={roundedArt ? "full" : "md"}
					className="aspect-square w-full shadow-[0_8px_24px_rgba(0,0,0,0.5)]"
				/>
				<div
					aria-hidden="true"
					className={cn(
						"pointer-events-none absolute inset-0 transition-opacity duration-300",
						roundedArt ? "rounded-full" : "rounded-md"
					)}
					style={{
						opacity: "var(--glare-opacity, 0)",
						background:
							"radial-gradient(circle at var(--glare-x, 50%) var(--glare-y, 50%), rgba(255,255,255,0.22), transparent 60%)",
					}}
				/>
				{/* Sits in front of the artwork when the card tilts */}
				<div className="absolute bottom-2 right-2" style={{ transform: "translateZ(30px)" }}>
					<div
						className={cn(
							"transition-all duration-300",
							playing
								? "translate-y-0 opacity-100"
								: "translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100"
						)}
					>
						<PlayCircleButton
							playing={playing}
							label={title}
							onClick={(event) => {
								event.stopPropagation();
								onPlay();
							}}
						/>
					</div>
				</div>
			</div>
			{to ? (
				<a
					href={to}
					onClick={(event) => {
						event.preventDefault();
						event.stopPropagation();
						navigate(to);
					}}
					className="block truncate font-semibold text-white"
				>
					{title}
				</a>
			) : (
				<p className="truncate font-semibold text-white">{title}</p>
			)}
			<p className="mt-1 line-clamp-2 text-sm text-subdued">{subtitle}</p>
		</div>
	);
};

export default MediaCard;
