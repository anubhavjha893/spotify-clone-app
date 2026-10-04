import { useState } from "react";
import { Link } from "react-router-dom";
import { Maximize2, Music } from "lucide-react";
import Artwork from "@/components/Artwork";
import { sizedImage } from "@/lib/image";
import CanvasVideo from "@/components/CanvasVideo";
import EmptyState from "@/components/EmptyState";
import LikeButton from "@/components/LikeButton";
import ArtistLink from "@/components/ArtistLink";
import { useTilt } from "@/hooks/useTilt";
import usePlayerStore from "@/stores/usePlayerStore";
import { useUIStore } from "@/stores/useUIStore";
import PanelHeader from "./PanelHeader";

const NowPlayingPanel = () => {
	const currentSong = usePlayerStore((s) => s.currentSong);
	const isPlaying = usePlayerStore((s) => s.isPlaying);
	const nextSong = usePlayerStore((s) => s.queue[s.currentIndex + 1] ?? null);
	const jumpTo = usePlayerStore((s) => s.jumpTo);
	const currentIndex = usePlayerStore((s) => s.currentIndex);
	const setFullscreenOpen = useUIStore((s) => s.setFullscreenOpen);
	const toggleRightPanel = useUIStore((s) => s.toggleRightPanel);
	const tiltRef = useTilt<HTMLDivElement>({ max: 6, lift: 10 });
	const [videoFailed, setVideoFailed] = useState<string | null>(null);

	const showVideo = !!currentSong?.videoUrl && videoFailed !== currentSong.videoUrl;

	return (
		<div className="flex h-full flex-col">
			<PanelHeader title={currentSong ? "Now playing" : "Nothing playing"} onClose={() => toggleRightPanel("now-playing")}>
				{currentSong && (
					<button
						type="button"
						onClick={() => setFullscreenOpen(true)}
						className="grid size-8 place-items-center rounded-full text-subdued transition hover:bg-white/10 hover:text-white"
						aria-label="Open full screen player"
						title="Full screen"
					>
						<Maximize2 className="size-4" />
					</button>
				)}
			</PanelHeader>

			{!currentSong ? (
				<EmptyState icon={Music} title="Pick something to play" description="Songs you play show up here with their artwork." />
			) : (
				<div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4">
					<div
						ref={tiltRef}
						className="relative aspect-[9/14] max-h-[420px] w-full overflow-hidden rounded-xl bg-surface-hover shadow-2xl"
					>
						{showVideo ? (
							<>
								<Artwork src={currentSong.imageUrl} alt="" className="absolute inset-0 size-full" rounded="sm" />
								<CanvasVideo
									src={currentSong.videoUrl!}
									playing={isPlaying}
									className="absolute inset-0 size-full"
									onUnavailable={() => setVideoFailed(currentSong.videoUrl!)}
								/>
							</>
						) : (
							<>
								<img
									src={sizedImage(currentSong.imageUrl, 160) || undefined}
									alt=""
									aria-hidden="true"
									className="absolute inset-0 size-full scale-125 object-cover opacity-60 blur-2xl"
								/>
								<div className="absolute inset-0 grid place-items-center p-6">
									<Artwork src={currentSong.imageUrl} alt={`${currentSong.title} artwork`} className="aspect-square w-full shadow-2xl" />
								</div>
							</>
						)}
						<div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4 pt-16">
							<div className="flex items-end justify-between gap-2">
								<div className="min-w-0">
									<p className="truncate text-xl font-bold text-white">{currentSong.title}</p>
									<p className="truncate text-sm text-white/75">
										<ArtistLink name={currentSong.artist} />
									</p>
								</div>
								<LikeButton song={currentSong} size="md" />
							</div>
						</div>
					</div>

					{currentSong.albumId && (
						<Link
							to={`/albums/${currentSong.albumId}`}
							className="mt-4 block rounded-lg bg-surface-raised p-4 text-sm font-semibold text-white transition hover:bg-surface-hover"
						>
							Go to album
						</Link>
					)}

					<div className="mt-4 rounded-lg bg-surface-raised p-4">
						<p className="mb-3 text-sm font-bold text-white">Next in queue</p>
						{nextSong ? (
							<button
								type="button"
								onClick={() => jumpTo(currentIndex + 1)}
								className="flex w-full items-center gap-3 rounded-md p-1 text-left transition hover:bg-white/10"
							>
								<Artwork src={nextSong.imageUrl} alt="" className="size-12" size={64} rounded="sm" />
								<span className="min-w-0">
									<span className="block truncate font-medium text-white">{nextSong.title}</span>
									<span className="block truncate text-sm text-subdued">{nextSong.artist}</span>
								</span>
							</button>
						) : (
							<p className="text-sm text-subdued">Your queue ends after this song.</p>
						)}
					</div>
				</div>
			)}
		</div>
	);
};

export default NowPlayingPanel;
