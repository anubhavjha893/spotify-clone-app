import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Mic2, Shuffle } from "lucide-react";
import { axiosInstance, getErrorMessage } from "@/lib/axios";
import { pluralize } from "@/lib/format";
import { useDominantColor } from "@/hooks/useDominantColor";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useTilt } from "@/hooks/useTilt";
import usePlayerStore from "@/stores/usePlayerStore";
import Artwork from "@/components/Artwork";
import EmptyState from "@/components/EmptyState";
import PlayCircleButton from "@/components/PlayCircleButton";
import TrackList from "@/components/TrackList";
import PageShell from "@/layout/components/PageShell";
import PageLoader from "@/layout/components/PageLoader";
import AlbumShelf from "@/pages/home/components/AlbumShelf";
import type { Artist } from "@/types";
import { site } from "@/config/site";

const cache = new Map<string, Artist>();

const ArtistAvatar = ({ src, name }: { src: string | null; name: string }) => {
	const tiltRef = useTilt<HTMLDivElement>({ max: 10, lift: 16 });
	return (
		<div ref={tiltRef} className="shrink-0">
			<Artwork src={src} alt={name} eager rounded="full" size={240} className="size-44 shadow-[0_8px_40px_rgba(0,0,0,0.55)] lg:size-56" />
		</div>
	);
};

const ArtistPage = () => {
	const { name = "" } = useParams();
	const key = name.toLowerCase();
	const [artist, setArtist] = useState<Artist | null>(cache.get(key) ?? null);
	const [error, setError] = useState<string | null>(null);
	const [showAll, setShowAll] = useState(false);
	const currentSong = usePlayerStore((s) => s.currentSong);
	const isPlaying = usePlayerStore((s) => s.isPlaying);
	const shuffle = usePlayerStore((s) => s.shuffle);
	const tint = useDominantColor(artist?.imageUrl);
	useDocumentTitle(artist?.name ?? name);

	useEffect(() => {
		let active = true;
		setArtist(cache.get(key) ?? null);
		setError(null);
		setShowAll(false);
		axiosInstance
			.get<Artist>(`/artists/${encodeURIComponent(name)}`)
			.then(({ data }) => {
				cache.set(key, data);
				if (active) setArtist(data);
			})
			.catch((err) => active && setError(getErrorMessage(err, "Artist not found")));
		return () => {
			active = false;
		};
	}, [name, key]);

	if (!artist) {
		if (!error) return <PageLoader />;
		return (
			<PageShell>
				<EmptyState
					icon={Mic2}
					title="Artist not found"
					description={error}
					action={
						<Link to="/search" className="inline-flex h-10 items-center rounded-full bg-white px-6 text-sm font-bold text-black">
							Search
						</Link>
					}
				/>
			</PageShell>
		);
	}

	const playingHere = !!currentSong && artist.songs.some((song) => song._id === currentSong._id);
	const { playQueue, togglePlay, toggleShuffle } = usePlayerStore.getState();
	const popular = artist.songs.slice(0, showAll ? 10 : 5);

	return (
		<PageShell tint={tint}>
			<section
				className="tint-header -mt-16 flex flex-col gap-6 px-4 pb-6 pt-24 sm:flex-row sm:items-end md:px-6"
				style={{ "--tint": tint } as React.CSSProperties}
			>
				<ArtistAvatar src={artist.imageUrl} name={artist.name} />
				<div className="min-w-0">
					<p className="text-sm font-semibold text-white">Artist</p>
					<h1 className="my-2 break-words text-5xl font-black leading-none tracking-tight text-white xl:text-7xl">
						{artist.name}
					</h1>
					<p className="text-sm text-white/80">
						{pluralize(artist.albums.length, "album")}
						<span aria-hidden="true"> &middot; </span>
						{pluralize(artist.songs.length, "song")}
						{artist.totalPlays > 0 && (
							<>
								<span aria-hidden="true"> &middot; </span>
								{pluralize(artist.totalPlays, "play")} on {site.name}
							</>
						)}
					</p>
				</div>
			</section>

			<div className="bg-black/20 px-2 md:px-4">
				<div className="flex items-center gap-6 px-2 py-5">
					<PlayCircleButton
						size="lg"
						playing={playingHere && isPlaying}
						label={artist.name}
						onClick={() => (playingHere ? togglePlay() : playQueue(artist.songs, 0))}
						disabled={artist.songs.length === 0}
					/>
					<button
						type="button"
						onClick={toggleShuffle}
						aria-pressed={shuffle}
						className={`grid size-10 place-items-center transition-colors ${shuffle ? "text-primary" : "text-subdued hover:text-white"}`}
						aria-label={shuffle ? "Disable shuffle" : "Enable shuffle"}
						title={shuffle ? "Disable shuffle" : "Enable shuffle"}
					>
						<Shuffle className="size-7" />
					</button>
				</div>

				{artist.songs.length > 0 && (
					<section className="mb-8" aria-label="Popular">
						<h2 className="mb-3 px-2 text-2xl font-bold text-white">Popular</h2>
						<TrackList songs={popular} showAlbumColumn />
						{artist.songs.length > 5 && (
							<button
								type="button"
								onClick={() => setShowAll((value) => !value)}
								className="mt-3 px-4 text-sm font-bold text-subdued hover:text-white"
							>
								{showAll ? "Show less" : "See more"}
							</button>
						)}
					</section>
				)}

				<AlbumShelf title="Discography" albums={artist.albums} showYearOnly />
			</div>
		</PageShell>
	);
};

export default ArtistPage;
