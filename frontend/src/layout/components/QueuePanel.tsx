import { ListMusic, X } from "lucide-react";
import Artwork from "@/components/Artwork";
import EmptyState from "@/components/EmptyState";
import Equalizer from "@/components/Equalizer";
import usePlayerStore from "@/stores/usePlayerStore";
import { useUIStore } from "@/stores/useUIStore";
import type { Song } from "@/types";
import PanelHeader from "./PanelHeader";

const QueueRow = ({
	song,
	onPlay,
	onRemove,
	current = false,
	playing = false,
}: {
	song: Song;
	onPlay: () => void;
	onRemove?: () => void;
	current?: boolean;
	playing?: boolean;
}) => (
	<li className="group flex items-center gap-3 rounded-md p-2 transition-colors hover:bg-white/10">
		<button type="button" onClick={onPlay} className="flex min-w-0 flex-1 items-center gap-3 text-left">
			<Artwork src={song.imageUrl} alt="" className="size-12" size={64} rounded="sm" />
			<span className="min-w-0">
				<span className={`block truncate font-medium ${current ? "text-primary" : "text-white"}`}>{song.title}</span>
				<span className="block truncate text-sm text-subdued">{song.artist}</span>
			</span>
		</button>
		{current && <Equalizer playing={playing} />}
		{onRemove && (
			<button
				type="button"
				onClick={onRemove}
				className="grid size-8 place-items-center rounded-full text-subdued opacity-0 transition hover:text-white focus-visible:opacity-100 group-hover:opacity-100"
				aria-label={`Remove ${song.title} from queue`}
				title="Remove from queue"
			>
				<X className="size-4" />
			</button>
		)}
	</li>
);

const QueuePanel = () => {
	const queue = usePlayerStore((s) => s.queue);
	const currentIndex = usePlayerStore((s) => s.currentIndex);
	const currentSong = usePlayerStore((s) => s.currentSong);
	const isPlaying = usePlayerStore((s) => s.isPlaying);
	const { jumpTo, removeFromQueue, clearUpcoming, togglePlay } = usePlayerStore.getState();
	const toggleRightPanel = useUIStore((s) => s.toggleRightPanel);

	const upcoming = queue.slice(currentIndex + 1);

	return (
		<div className="flex h-full flex-col">
			<PanelHeader title="Queue" onClose={() => toggleRightPanel("queue")} />

			{!currentSong ? (
				<EmptyState icon={ListMusic} title="Your queue is empty" description="Play an album or add songs to see them here." />
			) : (
				<div className="min-h-0 flex-1 overflow-y-auto px-2 pb-4">
					<h3 className="px-2 pb-2 text-sm font-bold text-white">Now playing</h3>
					<ul>
						<QueueRow song={currentSong} onPlay={togglePlay} current playing={isPlaying} />
					</ul>

					<div className="mt-6 flex items-center justify-between px-2 pb-2">
						<h3 className="text-sm font-bold text-white">Next up</h3>
						{upcoming.length > 0 && (
							<button
								type="button"
								onClick={clearUpcoming}
								className="text-xs font-semibold text-subdued hover:text-white hover:underline"
							>
								Clear queue
							</button>
						)}
					</div>
					{upcoming.length === 0 ? (
						<p className="px-2 text-sm text-subdued">Nothing queued after this song.</p>
					) : (
						<ul>
							{upcoming.map((song, offset) => {
								const index = currentIndex + 1 + offset;
								return (
									<QueueRow
										key={`${song._id}-${index}`}
										song={song}
										onPlay={() => jumpTo(index)}
										onRemove={() => removeFromQueue(index)}
									/>
								);
							})}
						</ul>
					)}
				</div>
			)}
		</div>
	);
};

export default QueuePanel;
