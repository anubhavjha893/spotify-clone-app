import { useState } from "react";
import { Link } from "react-router-dom";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { ChevronDown, ListMusic } from "lucide-react";
import { cn } from "@/lib/utils";
import Artwork from "@/components/Artwork";
import { sizedImage } from "@/lib/image";
import CanvasVideo from "@/components/CanvasVideo";
import LikeButton from "@/components/LikeButton";
import ArtistLink from "@/components/ArtistLink";
import { useDominantColor } from "@/hooks/useDominantColor";
import { useIsDesktop } from "@/hooks/useMediaQuery";
import { useTilt } from "@/hooks/useTilt";
import usePlayerStore from "@/stores/usePlayerStore";
import { useUIStore } from "@/stores/useUIStore";
import ProgressBar from "./ProgressBar";
import QueuePanel from "./QueuePanel";
import TransportControls from "./TransportControls";
import VolumeControl from "./VolumeControl";

// Record sleeve with a vinyl disc that slides out and spins while the song plays.
const RecordStage = ({ imageUrl, title, playing }: { imageUrl: string; title: string; playing: boolean }) => {
	const tiltRef = useTilt<HTMLDivElement>({ max: 12, lift: 24 });

	return (
		<div className="relative mx-auto aspect-square w-full max-w-[min(64vh,420px)]" style={{ perspective: "1200px" }}>
			<div ref={tiltRef} className="relative size-full" style={{ transformStyle: "preserve-3d" }}>
				<div
					className={cn(
						"absolute inset-[4%] rounded-full shadow-2xl transition-transform duration-700 ease-out",
						playing ? "translate-x-[12%] md:translate-x-[18%]" : "translate-x-0"
					)}
					aria-hidden="true"
				>
					<div
						className={cn("size-full rounded-full spin-slow", !playing && "spin-paused")}
						style={{
							background:
								"repeating-radial-gradient(circle at center, #111 0 2px, #1c1c1c 2px 4px), #111",
						}}
					>
						<div className="absolute inset-[32%] overflow-hidden rounded-full border-4 border-black/60">
							<img src={sizedImage(imageUrl, 160)} alt="" className="size-full object-cover" />
						</div>
						<div className="absolute left-1/2 top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black" />
					</div>
				</div>
				<Artwork
					src={imageUrl}
					alt={`${title} artwork`}
					eager
					size={480}
					className="relative aspect-square w-full shadow-[0_30px_80px_rgba(0,0,0,0.6)]"
				/>
			</div>
		</div>
	);
};

const FullscreenPlayer = () => {
	const open = useUIStore((s) => s.fullscreenOpen);
	const setOpen = useUIStore((s) => s.setFullscreenOpen);
	const currentSong = usePlayerStore((s) => s.currentSong);
	const isPlaying = usePlayerStore((s) => s.isPlaying);
	const tint = useDominantColor(currentSong?.imageUrl);
	const isDesktop = useIsDesktop();
	const [showQueue, setShowQueue] = useState(false);
	const [videoFailed, setVideoFailed] = useState<string | null>(null);

	if (!currentSong) return null;
	const showVideo = !!currentSong.videoUrl && videoFailed !== currentSong.videoUrl;

	return (
		<DialogPrimitive.Root open={open} onOpenChange={setOpen}>
			<DialogPrimitive.Portal>
				<DialogPrimitive.Content
					className="fixed inset-0 z-50 flex flex-col overflow-hidden bg-black text-white outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:slide-out-to-bottom-8 data-[state=open]:slide-in-from-bottom-8"
					aria-describedby={undefined}
				>
					{/* Background: the song's video when it has one, otherwise its artwork, blurred and drifting slowly */}
					<div className="absolute inset-0" aria-hidden="true" style={{ backgroundColor: `rgb(${tint})` }}>
						{showVideo ? (
							<CanvasVideo
								src={currentSong.videoUrl!}
								playing={isPlaying}
								className="absolute inset-0 size-full"
								onUnavailable={() => setVideoFailed(currentSong.videoUrl!)}
							/>
						) : (
							<img
								src={sizedImage(currentSong.imageUrl, 160) || undefined}
								alt=""
								className={cn(
									"absolute inset-0 size-full object-cover opacity-50 blur-3xl ambient-drift",
									!isPlaying && "[animation-play-state:paused]"
								)}
							/>
						)}
						<div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/85" />
					</div>

					<header className="relative flex items-center justify-between p-4 pt-[max(1rem,env(safe-area-inset-top))] md:p-6">
						<DialogPrimitive.Close
							className="grid size-10 place-items-center rounded-full bg-black/30 transition hover:bg-black/50"
							aria-label="Close full screen player"
						>
							<ChevronDown className="size-6" />
						</DialogPrimitive.Close>
						<DialogPrimitive.Title className="min-w-0 truncate px-4 text-center text-xs font-bold uppercase tracking-widest text-white/80">
							Now playing
						</DialogPrimitive.Title>
						<button
							type="button"
							onClick={() => setShowQueue((value) => !value)}
							aria-pressed={showQueue}
							className={cn(
								"grid size-10 place-items-center rounded-full transition",
								showQueue ? "bg-white text-black" : "bg-black/30 hover:bg-black/50"
							)}
							aria-label={showQueue ? "Hide queue" : "Show queue"}
							title="Queue"
						>
							<ListMusic className="size-5" />
						</button>
					</header>

					<div className="relative flex min-h-0 flex-1 items-center justify-center px-6 md:px-12">
						{showQueue ? (
							<div className="h-full w-full max-w-xl overflow-hidden rounded-xl bg-black/50 backdrop-blur-md">
								<QueuePanel />
							</div>
						) : (
							!showVideo && <RecordStage imageUrl={currentSong.imageUrl} title={currentSong.title} playing={isPlaying} />
						)}
					</div>

					<footer className="relative mx-auto w-full max-w-3xl px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-6 md:px-12">
						<div className="mb-4 flex items-end justify-between gap-4">
							<div className="min-w-0">
								<h2 className="truncate text-2xl font-extrabold tracking-tight md:text-4xl">
									{currentSong.albumId ? (
										<Link to={`/albums/${currentSong.albumId}`} onClick={() => setOpen(false)} className="hover:underline">
											{currentSong.title}
										</Link>
									) : (
										currentSong.title
									)}
								</h2>
								<p className="mt-1 truncate text-white/75 md:text-lg">
									<ArtistLink name={currentSong.artist} onNavigate={() => setOpen(false)} />
								</p>
							</div>
							<LikeButton song={currentSong} size="md" className="text-white/80" />
						</div>
						<ProgressBar className="mb-4 text-white/80" />
						<div className="relative flex items-center justify-center">
							<TransportControls large />
							{isDesktop && (
								<div className="absolute right-0 top-1/2 -translate-y-1/2">
									<VolumeControl />
								</div>
							)}
						</div>
					</footer>
				</DialogPrimitive.Content>
			</DialogPrimitive.Portal>
		</DialogPrimitive.Root>
	);
};

export default FullscreenPlayer;
