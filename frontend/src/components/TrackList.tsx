import { Clock3, ListEnd, ListPlus, Play } from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
import { formatTime } from "@/lib/format";
import usePlayerStore from "@/stores/usePlayerStore";
import { useMusicStore } from "@/stores/useMusicStore";
import type { Song } from "@/types";
import ArtistLink from "./ArtistLink";
import Artwork from "./Artwork";
import BufferingRing from "./BufferingRing";
import Equalizer from "./Equalizer";
import LikeButton from "./LikeButton";

interface TrackListProps {
	songs: Song[];
	showArtwork?: boolean;
	// Adds an Album column linking to each song's album.
	showAlbumColumn?: boolean;
	showHeader?: boolean;
}

const iconButton =
	"grid size-8 place-items-center rounded-full text-subdued opacity-0 transition hover:text-white focus-visible:opacity-100 group-hover:opacity-100 [&_svg]:size-4";

const TrackList = ({ songs, showArtwork = true, showAlbumColumn = false, showHeader = true }: TrackListProps) => {
	const currentSong = usePlayerStore((s) => s.currentSong);
	const isPlaying = usePlayerStore((s) => s.isPlaying);
	const isBuffering = usePlayerStore((s) => s.isBuffering);
	const albums = useMusicStore((s) => s.albums);
	const { playSong, togglePlay, addToQueue, playNext } = usePlayerStore.getState();

	const albumTitles = showAlbumColumn ? new Map(albums.map((album) => [album._id, album.title])) : null;

	const columns = cn(
		"grid items-center gap-4 px-4",
		showAlbumColumn
			? "grid-cols-[24px_minmax(0,1fr)_auto] md:grid-cols-[24px_minmax(0,4fr)_minmax(0,3fr)_auto]"
			: "grid-cols-[24px_minmax(0,1fr)_auto]"
	);

	return (
		<div role="table" aria-label="Tracks" className="text-sm">
			{showHeader && (
				<div role="row" className={cn(columns, "mb-2 h-9 border-b border-white/10 text-subdued")}>
					<span role="columnheader" className="text-center">
						#
					</span>
					<span role="columnheader">Title</span>
					{showAlbumColumn && (
						<span role="columnheader" className="hidden md:block">
							Album
						</span>
					)}
					<span role="columnheader" className="flex justify-end pr-11" title="Duration">
						<Clock3 className="size-4" aria-label="Duration" />
					</span>
				</div>
			)}

			<div role="rowgroup">
				{songs.map((song, index) => {
					const isCurrent = currentSong?._id === song._id;
					const handlePlay = () => (isCurrent ? togglePlay() : playSong(song, songs));
					const albumTitle = song.albumId ? albumTitles?.get(song.albumId) : undefined;

					return (
						<div
							key={`${song._id}-${index}`}
							role="row"
							onDoubleClick={handlePlay}
							onClick={(event) => {
								// Touch screens have no hover state or double click, so a tap plays the track.
								const interactive = (event.target as HTMLElement).closest("button, a");
								if (!interactive && window.matchMedia("(hover: none)").matches) handlePlay();
							}}
							className={cn(columns, "group h-14 rounded-md transition-colors hover:bg-white/10", isCurrent && "bg-white/5")}
						>
							<div role="cell" className="relative grid place-items-center text-subdued">
								<span className="tabular-nums group-hover:invisible">
									{isCurrent ? <Equalizer playing={isPlaying && !isBuffering} /> : index + 1}
								</span>
								<button
									type="button"
									onClick={handlePlay}
									aria-label={isCurrent && isPlaying ? `Pause ${song.title}` : `Play ${song.title}`}
									className="invisible absolute inset-0 grid place-items-center text-white group-hover:visible focus-visible:visible"
								>
									{isCurrent && isPlaying ? (
										<span className="flex gap-[3px]" aria-hidden="true">
											<span className="h-3 w-[3px] rounded-sm bg-white" />
											<span className="h-3 w-[3px] rounded-sm bg-white" />
										</span>
									) : (
										<Play className="size-4" fill="currentColor" strokeWidth={0} />
									)}
								</button>
							</div>

							<div role="cell" className="flex min-w-0 items-center gap-3">
								{showArtwork && (
									<span className="relative shrink-0">
										<Artwork src={song.imageUrl} alt="" className="size-10" size={64} rounded="sm" />
										{isCurrent && isPlaying && isBuffering && <BufferingRing className="inset-0 rounded" />}
									</span>
								)}
								<div className="min-w-0">
									<p className={cn("truncate text-base font-medium", isCurrent ? "text-primary" : "text-white")}>
										{song.title}
									</p>
									<p className="truncate text-subdued">
										<ArtistLink name={song.artist} />
									</p>
								</div>
							</div>

							{showAlbumColumn && (
								<div role="cell" className="hidden min-w-0 truncate text-subdued md:block">
									{song.albumId && albumTitle ? (
										<Link to={`/albums/${song.albumId}`} className="hover:text-white hover:underline">
											{albumTitle}
										</Link>
									) : (
										"Single"
									)}
								</div>
							)}

							<div role="cell" className="flex items-center justify-end gap-1">
								<button
									type="button"
									className={cn(iconButton, "hidden sm:grid")}
									onClick={() => {
										playNext(song);
										toast.success("Playing next", { id: "queue" });
									}}
									aria-label={`Play ${song.title} next`}
									title="Play next"
								>
									<ListEnd />
								</button>
								<button
									type="button"
									className={cn(iconButton, "hidden sm:grid")}
									onClick={() => {
										addToQueue(song);
										toast.success("Added to queue", { id: "queue" });
									}}
									aria-label={`Add ${song.title} to queue`}
									title="Add to queue"
								>
									<ListPlus />
								</button>
								<LikeButton song={song} />
								<span className="w-11 text-right tabular-nums text-subdued">{formatTime(song.duration)}</span>
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
};

export default TrackList;
