import { useNavigate } from "react-router-dom";
import Artwork from "@/components/Artwork";
import PlayCircleButton from "@/components/PlayCircleButton";
import { playOrToggleAlbum } from "@/lib/playback";
import usePlayerStore from "@/stores/usePlayerStore";
import type { AlbumSummary } from "@/types";

interface QuickPicksProps {
	albums: AlbumSummary[];
	loading: boolean;
	onHover: (imageUrl: string | null) => void;
}

// Compact album tiles at the top of the home page. Hovering one recolours the header.
const QuickPicks = ({ albums, loading, onHover }: QuickPicksProps) => {
	const navigate = useNavigate();
	const currentAlbumId = usePlayerStore((s) => s.currentSong?.albumId);
	const isPlaying = usePlayerStore((s) => s.isPlaying);

	if (loading) {
		return (
			<div className="mb-8 grid grid-cols-2 gap-2 px-3 md:grid-cols-[repeat(auto-fill,minmax(250px,1fr))]" aria-hidden="true">
				{Array.from({ length: 8 }).map((_, i) => (
					<div key={i} className="h-14 animate-pulse rounded-md bg-white/10 md:h-16" />
				))}
			</div>
		);
	}

	if (albums.length === 0) return null;

	return (
		<div className="mb-8 grid grid-cols-2 gap-2 px-3 md:grid-cols-[repeat(auto-fill,minmax(250px,1fr))]" onMouseLeave={() => onHover(null)}>
			{albums.map((album) => {
				const playing = currentAlbumId === album._id && isPlaying;
				return (
					<div
						key={album._id}
						role="link"
						tabIndex={0}
						onClick={() => navigate(`/albums/${album._id}`)}
						onKeyDown={(e) => e.key === "Enter" && navigate(`/albums/${album._id}`)}
						onMouseEnter={() => onHover(album.imageUrl)}
						onFocus={() => onHover(album.imageUrl)}
						className="group flex h-14 cursor-pointer items-center gap-3 overflow-hidden rounded-md bg-white/[0.07] pr-2 transition-colors hover:bg-white/[0.16] md:h-16"
					>
						<Artwork src={album.imageUrl} alt="" className="h-full w-14 md:w-16" size={64} rounded="sm" />
						<span className="min-w-0 flex-1 truncate text-sm font-bold text-white">{album.title}</span>
						<PlayCircleButton
							size="sm"
							playing={playing}
							label={album.title}
							onClick={(e) => {
								e.stopPropagation();
								playOrToggleAlbum(album._id);
							}}
							className={
								playing
									? "hidden md:grid"
									: "hidden opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 md:grid"
							}
						/>
					</div>
				);
			})}
		</div>
	);
};

export default QuickPicks;
