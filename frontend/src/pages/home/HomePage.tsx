import { useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { RefreshCw, WifiOff } from "lucide-react";
import { useMusicStore } from "@/stores/useMusicStore";
import { useLibraryStore } from "@/stores/useLibraryStore";
import { useDominantColor } from "@/hooks/useDominantColor";
import { greeting } from "@/lib/format";
import EmptyState from "@/components/EmptyState";
import GenreTiles from "@/components/GenreTiles";
import Shelf, { ShelfSkeleton } from "@/components/Shelf";
import PageShell from "@/layout/components/PageShell";
import QuickPicks from "./components/QuickPicks";
import SongShelf from "./components/SongShelf";
import AlbumShelf from "./components/AlbumShelf";
import ArtistShelf from "./components/ArtistShelf";
import Spotlight from "./components/Spotlight";

const HomePage = () => {
	const { user } = useUser();
	const featuredSongs = useMusicStore((s) => s.featuredSongs);
	const madeForYouSongs = useMusicStore((s) => s.madeForYouSongs);
	const trendingSongs = useMusicStore((s) => s.trendingSongs);
	const sectionsLoading = useMusicStore((s) => s.sectionsLoading);
	const homeError = useMusicStore((s) => s.homeError);
	const albums = useMusicStore((s) => s.albums);
	const albumsLoading = useMusicStore((s) => s.albumsLoading);
	const fetchHome = useMusicStore((s) => s.fetchHome);
	const recentlyPlayed = useLibraryStore((s) => s.recentlyPlayed);

	// Same album all day, a different one tomorrow.
	const spotlight = albums.length > 0 ? albums[Math.floor(Date.now() / 86_400_000) % albums.length] : null;
	const [hoveredArt, setHoveredArt] = useState<string | null>(null);
	const tint = useDominantColor(hoveredArt ?? spotlight?.imageUrl);

	useEffect(() => {
		fetchHome();
	}, [fetchHome]);

	const nothingLoaded =
		!!homeError && featuredSongs.length === 0 && madeForYouSongs.length === 0 && trendingSongs.length === 0;
	const newest = [...albums].sort((a, b) => b.releaseYear - a.releaseYear);

	return (
		<PageShell tint={tint}>
			<div className="px-1 pt-2 md:px-3">
				<h1 className="mb-6 px-3 text-3xl font-extrabold tracking-tight text-white">
					{greeting()}
					{user?.firstName ? `, ${user.firstName}` : ""}
				</h1>

				{nothingLoaded ? (
					<EmptyState
						icon={WifiOff}
						title="Could not reach the music service"
						description={homeError ?? undefined}
						action={
							<button
								type="button"
								onClick={() => fetchHome()}
								className="inline-flex h-10 items-center gap-2 rounded-full bg-white px-6 text-sm font-bold text-black transition hover:scale-[1.03]"
							>
								<RefreshCw className="size-4" />
								Try again
							</button>
						}
					/>
				) : (
					<>
						<QuickPicks albums={albums.slice(0, 8)} loading={albumsLoading} onHover={setHoveredArt} />

						{spotlight && <Spotlight album={spotlight} />}

						{recentlyPlayed.length > 0 && <SongShelf title="Recently played" songs={recentlyPlayed} />}

						{sectionsLoading.madeForYou ? (
							<ShelfSkeleton />
						) : (
							<SongShelf title="Picked for you" subtitle="A fresh mix from the catalog every visit" songs={madeForYouSongs} />
						)}

						{sectionsLoading.trending ? (
							<ShelfSkeleton />
						) : (
							<SongShelf title="Most played" subtitle="Ranked by plays from all listeners" songs={trendingSongs} />
						)}

						{albumsLoading ? <ShelfSkeleton /> : <AlbumShelf title="Albums" subtitle="Newest releases first" albums={newest} />}

						{!albumsLoading && <ArtistShelf albums={albums} />}

						{!albumsLoading && <GenreTiles albums={albums} title="Browse by genre" />}

						{sectionsLoading.featured ? (
							<ShelfSkeleton />
						) : (
							<SongShelf title="Discover" subtitle="Songs you may not have heard yet" songs={featuredSongs} />
						)}

						{!albumsLoading && albums.length === 0 && !sectionsLoading.featured && featuredSongs.length === 0 && (
							<Shelf title="Nothing here yet" layout="grid">
								<p className="px-3 text-subdued">
									The catalog is empty. An admin can add albums and songs from the dashboard.
								</p>
							</Shelf>
						)}
					</>
				)}
			</div>
		</PageShell>
	);
};

export default HomePage;
