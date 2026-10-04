import { useNavigate } from "react-router-dom";
import MediaCard from "@/components/MediaCard";
import Shelf, { ShelfItem } from "@/components/Shelf";
import { artistPath } from "@/lib/genres";
import { axiosInstance } from "@/lib/axios";
import usePlayerStore from "@/stores/usePlayerStore";
import type { AlbumSummary, Artist } from "@/types";

// Artists derived from the albums in the catalog, pictured with their latest album cover.
const ArtistShelf = ({ albums }: { albums: AlbumSummary[] }) => {
	const navigate = useNavigate();
	const currentArtist = usePlayerStore((s) => s.currentSong?.artist);
	const isPlaying = usePlayerStore((s) => s.isPlaying);

	const artists = new Map<string, AlbumSummary>();
	for (const album of [...albums].sort((a, b) => b.releaseYear - a.releaseYear)) {
		if (!artists.has(album.artist)) artists.set(album.artist, album);
	}
	if (artists.size === 0) return null;

	const play = async (name: string) => {
		const player = usePlayerStore.getState();
		if (currentArtist === name) {
			player.togglePlay();
			return;
		}
		try {
			const { data } = await axiosInstance.get<Artist>(`/artists/${encodeURIComponent(name)}`);
			player.playQueue(data.songs, 0);
		} catch {
			navigate(artistPath(name));
		}
	};

	return (
		<Shelf title="Artists">
			{[...artists.entries()].map(([name, album]) => (
				<ShelfItem key={name}>
					<MediaCard
						title={name}
						subtitle="Artist"
						imageUrl={album.imageUrl}
						to={artistPath(name)}
						roundedArt
						playing={currentArtist === name && isPlaying}
						onPlay={() => play(name)}
					/>
				</ShelfItem>
			))}
		</Shelf>
	);
};

export default ArtistShelf;
