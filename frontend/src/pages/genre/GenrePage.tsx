import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Shapes } from "lucide-react";
import { axiosInstance, getErrorMessage } from "@/lib/axios";
import { formatTotalDuration, pluralize } from "@/lib/format";
import { genreColor } from "@/lib/genres";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import usePlayerStore from "@/stores/usePlayerStore";
import EmptyState from "@/components/EmptyState";
import PlayCircleButton from "@/components/PlayCircleButton";
import TrackList from "@/components/TrackList";
import PageShell from "@/layout/components/PageShell";
import PageLoader from "@/layout/components/PageLoader";
import AlbumShelf from "@/pages/home/components/AlbumShelf";
import type { AlbumSummary, Song } from "@/types";

interface Genre {
	name: string;
	albums: AlbumSummary[];
	songs: Song[];
}

const hexToRgb = (hex: string) => {
	const value = parseInt(hex.slice(1), 16);
	return `${(value >> 16) & 255} ${(value >> 8) & 255} ${value & 255}`;
};

const GenrePage = () => {
	const { name = "" } = useParams();
	const [genre, setGenre] = useState<Genre | null>(null);
	const [error, setError] = useState<string | null>(null);
	const currentSong = usePlayerStore((s) => s.currentSong);
	const isPlaying = usePlayerStore((s) => s.isPlaying);
	useDocumentTitle(genre?.name ?? name);

	useEffect(() => {
		let active = true;
		setGenre(null);
		setError(null);
		axiosInstance
			.get<Genre>(`/genres/${encodeURIComponent(name)}`)
			.then(({ data }) => active && setGenre(data))
			.catch((err) => active && setError(getErrorMessage(err, "Genre not found")));
		return () => {
			active = false;
		};
	}, [name]);

	if (!genre) {
		if (!error) return <PageLoader />;
		return (
			<PageShell>
				<EmptyState
					icon={Shapes}
					title="Genre not found"
					description={error}
					action={
						<Link to="/search" className="inline-flex h-10 items-center rounded-full bg-white px-6 text-sm font-bold text-black">
							Browse all
						</Link>
					}
				/>
			</PageShell>
		);
	}

	const tint = hexToRgb(genreColor(genre.name));
	const playingHere = !!currentSong && genre.songs.some((song) => song._id === currentSong._id);
	const totalSeconds = genre.songs.reduce((sum, song) => sum + (song.duration || 0), 0);
	const { playQueue, togglePlay } = usePlayerStore.getState();

	return (
		<PageShell tint={tint}>
			<section
				className="tint-header -mt-16 px-4 pb-8 pt-28 md:px-6"
				style={{ "--tint": tint } as React.CSSProperties}
			>
				<p className="text-sm font-semibold text-white">Genre</p>
				<h1 className="my-2 text-5xl font-black tracking-tight text-white xl:text-7xl">{genre.name}</h1>
				<p className="text-sm text-white/80">
					{pluralize(genre.albums.length, "album")}
					<span aria-hidden="true"> &middot; </span>
					{pluralize(genre.songs.length, "song")}
					{totalSeconds > 0 && <span className="text-white/70">, {formatTotalDuration(totalSeconds)}</span>}
				</p>
			</section>

			<div className="bg-black/20 px-2 md:px-4">
				<div className="px-2 py-5">
					<PlayCircleButton
						size="lg"
						playing={playingHere && isPlaying}
						label={genre.name}
						onClick={() => (playingHere ? togglePlay() : playQueue(genre.songs, 0))}
					/>
				</div>
				<AlbumShelf title="Albums" albums={genre.albums} />
				<section className="mb-8" aria-label="Songs">
					<h2 className="mb-3 px-2 text-2xl font-bold text-white">Songs</h2>
					<TrackList songs={genre.songs} showAlbumColumn />
				</section>
			</div>
		</PageShell>
	);
};

export default GenrePage;
