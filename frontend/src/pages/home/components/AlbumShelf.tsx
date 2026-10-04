import MediaCard from "@/components/MediaCard";
import Shelf, { GridItem, ShelfItem } from "@/components/Shelf";
import { playOrToggleAlbum } from "@/lib/playback";
import usePlayerStore from "@/stores/usePlayerStore";
import type { AlbumSummary } from "@/types";

interface AlbumShelfProps {
	title: string;
	subtitle?: string;
	albums: AlbumSummary[];
	moreTo?: string;
	layout?: "row" | "grid";
	// Show the release year instead of the artist (used on artist pages).
	showYearOnly?: boolean;
}

const AlbumShelf = ({ title, subtitle, albums, moreTo, layout = "row", showYearOnly = false }: AlbumShelfProps) => {
	const currentAlbumId = usePlayerStore((s) => s.currentSong?.albumId);
	const isPlaying = usePlayerStore((s) => s.isPlaying);

	if (albums.length === 0) return null;
	const Wrap = layout === "row" ? ShelfItem : GridItem;

	return (
		<Shelf title={title} subtitle={subtitle} moreTo={moreTo} layout={layout}>
			{albums.map((album) => (
				<Wrap key={album._id}>
					<MediaCard
						title={album.title}
						subtitle={showYearOnly ? `${album.releaseYear} · Album` : `${album.releaseYear} · ${album.artist}`}
						imageUrl={album.imageUrl}
						to={`/albums/${album._id}`}
						playing={currentAlbumId === album._id && isPlaying}
						onPlay={() => playOrToggleAlbum(album._id)}
					/>
				</Wrap>
			))}
		</Shelf>
	);
};

export default AlbumShelf;
