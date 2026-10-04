import MediaCard from "@/components/MediaCard";
import Shelf, { GridItem, ShelfItem } from "@/components/Shelf";
import usePlayerStore from "@/stores/usePlayerStore";
import type { Song } from "@/types";

interface SongShelfProps {
	title: string;
	subtitle?: string;
	songs: Song[];
	moreTo?: string;
	layout?: "row" | "grid";
}

const SongShelf = ({ title, subtitle, songs, moreTo, layout = "row" }: SongShelfProps) => {
	const currentId = usePlayerStore((s) => s.currentSong?._id);
	const isPlaying = usePlayerStore((s) => s.isPlaying);

	if (songs.length === 0) return null;
	const Wrap = layout === "row" ? ShelfItem : GridItem;

	return (
		<Shelf title={title} subtitle={subtitle} moreTo={moreTo} layout={layout}>
			{songs.map((song) => {
				const isCurrent = currentId === song._id;
				return (
					<Wrap key={song._id}>
						<MediaCard
							title={song.title}
							subtitle={song.artist}
							imageUrl={song.imageUrl}
							playing={isCurrent && isPlaying}
							onPlay={() => {
								const player = usePlayerStore.getState();
								if (isCurrent) player.togglePlay();
								else player.playSong(song, songs);
							}}
						/>
					</Wrap>
				);
			})}
		</Shelf>
	);
};

export default SongShelf;
