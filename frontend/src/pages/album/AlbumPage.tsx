import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { Disc3, Shuffle } from "lucide-react";
import { useMusicStore } from "@/stores/useMusicStore";
import usePlayerStore from "@/stores/usePlayerStore";
import { useDominantColor } from "@/hooks/useDominantColor";
import { useTilt } from "@/hooks/useTilt";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { formatTotalDuration, pluralize } from "@/lib/format";
import Artwork from "@/components/Artwork";
import EmptyState from "@/components/EmptyState";
import PlayCircleButton from "@/components/PlayCircleButton";
import TrackList from "@/components/TrackList";
import PageShell from "@/layout/components/PageShell";
import PageLoader from "@/layout/components/PageLoader";
import ArtistLink from "@/components/ArtistLink";
import AlbumShelf from "@/pages/home/components/AlbumShelf";
import { artistPath, genrePath } from "@/lib/genres";

const AlbumCover = ({ src, title }: { src: string; title: string }) => {
	const tiltRef = useTilt<HTMLDivElement>({ max: 10, lift: 20 });
	return (
		<div ref={tiltRef} className="shrink-0">
			<Artwork
				src={src}
				alt={`${title} cover`}
				eager
				className="size-48 shadow-[0_8px_40px_rgba(0,0,0,0.55)] lg:size-56"
			/>
		</div>
	);
};

const MoreByArtist = ({ artist, excludeId }: { artist: string; excludeId: string }) => {
	const others = useMusicStore((s) => s.albums).filter((album) => album.artist === artist && album._id !== excludeId);
	if (others.length === 0) return null;
	return <AlbumShelf title={`More by ${artist}`} albums={others} moreTo={artistPath(artist)} showYearOnly />;
};

const AlbumPage = () => {
	const { albumId = "" } = useParams();
	const album = useMusicStore((s) => s.albumCache[albumId]);
	const albumLoading = useMusicStore((s) => s.albumLoading);
	const albumError = useMusicStore((s) => s.albumError);
	const fetchAlbumById = useMusicStore((s) => s.fetchAlbumById);
	const currentSong = usePlayerStore((s) => s.currentSong);
	const isPlaying = usePlayerStore((s) => s.isPlaying);
	const shuffle = usePlayerStore((s) => s.shuffle);
	const tint = useDominantColor(album?.imageUrl);

	useEffect(() => {
		fetchAlbumById(albumId);
	}, [fetchAlbumById, albumId]);

	useDocumentTitle(album ? `${album.title} by ${album.artist}` : null);

	if (!album) {
		if (albumLoading) return <PageLoader />;
		return (
			<PageShell>
				<EmptyState
					icon={Disc3}
					title="Album not found"
					description={albumError ?? "It may have been removed."}
					action={
						<Link to="/" className="inline-flex h-10 items-center rounded-full bg-white px-6 text-sm font-bold text-black">
							Back to Home
						</Link>
					}
				/>
			</PageShell>
		);
	}

	const isThisAlbum = album.songs.some((song) => song._id === currentSong?._id);
	const totalSeconds = album.songs.reduce((sum, song) => sum + (song.duration || 0), 0);
	const { playQueue, togglePlay, toggleShuffle } = usePlayerStore.getState();

	const handlePlay = () => {
		if (isThisAlbum) togglePlay();
		else playQueue(album.songs, 0);
	};

	return (
		<PageShell tint={tint}>
			<section
				className="tint-header -mt-16 flex flex-col gap-6 px-4 pb-6 pt-24 sm:flex-row sm:items-end md:px-6"
				style={{ "--tint": tint } as React.CSSProperties}
			>
				<AlbumCover src={album.imageUrl} title={album.title} />
				<div className="min-w-0">
					<p className="text-sm font-semibold text-white">Album</p>
					<h1 className="my-2 break-words text-4xl font-black leading-none tracking-tight text-white sm:text-5xl xl:text-7xl">
						{album.title}
					</h1>
					<p className="text-sm text-white/80">
						<ArtistLink name={album.artist} className="font-bold text-white" />
						<span aria-hidden="true"> &middot; </span>
						{album.releaseYear}
						{album.genre && (
							<>
								<span aria-hidden="true"> &middot; </span>
								<Link to={genrePath(album.genre)} className="hover:text-white hover:underline">
									{album.genre}
								</Link>
							</>
						)}
						<span aria-hidden="true"> &middot; </span>
						{pluralize(album.songs.length, "song")}
						{totalSeconds > 0 && (
							<>
								<span aria-hidden="true">, </span>
								<span className="text-white/70">{formatTotalDuration(totalSeconds)}</span>
							</>
						)}
					</p>
				</div>
			</section>

			<div className="bg-black/20 px-2 md:px-4">
				<div className="flex items-center gap-6 px-2 py-5">
					<PlayCircleButton
						size="lg"
						playing={isThisAlbum && isPlaying}
						label={album.title}
						onClick={handlePlay}
						disabled={album.songs.length === 0}
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

				{album.songs.length === 0 ? (
					<p className="px-4 pb-10 text-subdued">This album has no songs yet.</p>
				) : (
					<TrackList songs={album.songs} showArtwork={false} />
				)}

				<div className="space-y-1 px-4 pb-4 pt-8 text-xs text-subdued">
					<p className="text-sm">Released {album.releaseYear}</p>
					{album.license?.name && (
						<p>
							&copy; {album.releaseYear} {album.artist}. Licensed under{" "}
							{album.license.url ? (
								<a href={album.license.url} target="_blank" rel="noopener noreferrer" className="underline hover:text-white">
									{album.license.name}
								</a>
							) : (
								album.license.name
							)}
							.
							{album.sourceUrl && (
								<>
									{" "}
									<a href={album.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline hover:text-white">
										Source
									</a>
								</>
							)}
						</p>
					)}
				</div>

				<MoreByArtist artist={album.artist} excludeId={album._id} />
			</div>
		</PageShell>
	);
};

export default AlbumPage;
