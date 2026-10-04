import { Link } from "react-router-dom";
import Artwork from "@/components/Artwork";
import ArtistLink from "@/components/ArtistLink";
import PlayCircleButton from "@/components/PlayCircleButton";
import { useDominantColor } from "@/hooks/useDominantColor";
import { useTilt } from "@/hooks/useTilt";
import { pluralize } from "@/lib/format";
import { genrePath } from "@/lib/genres";
import { playOrToggleAlbum } from "@/lib/playback";
import usePlayerStore from "@/stores/usePlayerStore";
import type { AlbumSummary } from "@/types";

const Spotlight = ({ album }: { album: AlbumSummary }) => {
	const tint = useDominantColor(album.imageUrl);
	const tiltRef = useTilt<HTMLDivElement>({ max: 12, lift: 24 });
	const playing = usePlayerStore((s) => s.currentSong?.albumId === album._id && s.isPlaying);

	return (
		<section
			aria-label="Album of the day"
			className="relative mx-3 mb-10 overflow-hidden rounded-xl p-5 md:p-8"
			style={{ backgroundColor: `rgb(${tint})` }}
		>
			<div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/10 to-transparent" aria-hidden="true" />

			<div className="relative flex flex-col gap-6 sm:flex-row sm:items-center">
				<div ref={tiltRef} style={{ transformStyle: "preserve-3d" }} className="shrink-0">
					<Link to={`/albums/${album._id}`} aria-label={`Open ${album.title}`}>
						<Artwork
							src={album.imageUrl}
							alt=""
							eager
							size={240}
							className="size-40 shadow-[0_20px_50px_rgba(0,0,0,0.55)] md:size-52"
						/>
					</Link>
				</div>
				<div className="min-w-0">
					<p className="text-xs font-bold uppercase tracking-widest text-white/80">Album of the day</p>
					<Link to={`/albums/${album._id}`} className="mt-2 block">
						<h2 className="line-clamp-2 text-3xl font-black leading-tight tracking-tight text-white hover:underline md:text-5xl">
							{album.title}
						</h2>
					</Link>
					<p className="mt-2 text-sm text-white/85">
						<ArtistLink name={album.artist} className="font-bold text-white" />
						<span aria-hidden="true"> &middot; </span>
						{album.releaseYear}
						{album.genre && (
							<>
								<span aria-hidden="true"> &middot; </span>
								<Link to={genrePath(album.genre)} className="hover:underline">
									{album.genre}
								</Link>
							</>
						)}
						<span aria-hidden="true"> &middot; </span>
						{pluralize(album.songs.length, "song")}
					</p>
					<div className="mt-5 flex items-center gap-3">
						<PlayCircleButton playing={playing} label={album.title} onClick={() => playOrToggleAlbum(album._id)} />
						<Link
							to={`/albums/${album._id}`}
							className="inline-flex h-10 items-center rounded-full border border-white/40 px-5 text-sm font-bold text-white transition hover:scale-[1.03] hover:border-white"
						>
							View album
						</Link>
					</div>
				</div>
			</div>
		</section>
	);
};

export default Spotlight;
