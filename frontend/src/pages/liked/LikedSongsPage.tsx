import { Link } from "react-router-dom";
import { SignInButton, useAuth, useUser } from "@clerk/clerk-react";
import { Heart, Shuffle } from "lucide-react";
import { useLibraryStore } from "@/stores/useLibraryStore";
import usePlayerStore from "@/stores/usePlayerStore";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { formatTotalDuration, pluralize } from "@/lib/format";
import EmptyState from "@/components/EmptyState";
import PlayCircleButton from "@/components/PlayCircleButton";
import TrackList from "@/components/TrackList";
import PageShell from "@/layout/components/PageShell";
import PageLoader from "@/layout/components/PageLoader";

const LIKED_TINT = "42 107 69";

const LikedSongsPage = () => {
	useDocumentTitle("Liked Songs");
	const { isSignedIn, isLoaded } = useAuth();
	const { user } = useUser();
	const likedSongs = useLibraryStore((s) => s.likedSongs);
	const likesLoading = useLibraryStore((s) => s.likesLoading);
	const likesLoaded = useLibraryStore((s) => s.likesLoaded);
	const currentSong = usePlayerStore((s) => s.currentSong);
	const isPlaying = usePlayerStore((s) => s.isPlaying);
	const shuffle = usePlayerStore((s) => s.shuffle);

	if (!isLoaded) return <PageLoader />;

	if (!isSignedIn) {
		return (
			<PageShell>
				<EmptyState
					icon={Heart}
					title="Save songs you love"
					description="Log in to keep a collection of liked songs across all your devices."
					action={
						<SignInButton mode="modal">
							<button type="button" className="h-10 rounded-full bg-white px-6 text-sm font-bold text-black">
								Log in
							</button>
						</SignInButton>
					}
				/>
			</PageShell>
		);
	}

	const playingHere = !!currentSong && likedSongs.some((song) => song._id === currentSong._id);
	const totalSeconds = likedSongs.reduce((sum, song) => sum + (song.duration || 0), 0);
	const { playQueue, togglePlay, toggleShuffle } = usePlayerStore.getState();

	return (
		<PageShell tint={LIKED_TINT}>
			<section
				className="tint-header -mt-16 flex flex-col gap-6 px-4 pb-6 pt-24 sm:flex-row sm:items-end md:px-6"
				style={{ "--tint": LIKED_TINT } as React.CSSProperties}
			>
				<div className="grid size-48 shrink-0 place-items-center rounded-md bg-gradient-to-br from-[#2a6b45] to-[#9ad5b1] shadow-[0_8px_40px_rgba(0,0,0,0.55)] lg:size-56">
					<Heart className="size-20 text-white" fill="currentColor" />
				</div>
				<div className="min-w-0">
					<p className="text-sm font-semibold text-white">Playlist</p>
					<h1 className="my-2 text-4xl font-black leading-none tracking-tight text-white sm:text-5xl xl:text-7xl">
						Liked Songs
					</h1>
					<p className="text-sm text-white/80">
						<span className="font-bold text-white">{user?.fullName || user?.username || "You"}</span>
						<span aria-hidden="true"> &middot; </span>
						{pluralize(likedSongs.length, "song")}
						{totalSeconds > 0 && <span className="text-white/70">, {formatTotalDuration(totalSeconds)}</span>}
					</p>
				</div>
			</section>

			<div className="bg-black/20 px-2 md:px-4">
				{likesLoading && !likesLoaded ? (
					<div className="h-48">
						<PageLoader />
					</div>
				) : likedSongs.length === 0 ? (
					<EmptyState
						icon={Heart}
						title="Songs you like will appear here"
						description="Tap the heart on any song to save it."
						action={
							<Link to="/search" className="inline-flex h-10 items-center rounded-full bg-white px-6 text-sm font-bold text-black">
								Find songs
							</Link>
						}
					/>
				) : (
					<>
						<div className="flex items-center gap-6 px-2 py-5">
							<PlayCircleButton
								size="lg"
								playing={playingHere && isPlaying}
								label="Liked Songs"
								onClick={() => (playingHere ? togglePlay() : playQueue(likedSongs, 0))}
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
						<TrackList songs={likedSongs} showAlbumColumn />
					</>
				)}
			</div>
		</PageShell>
	);
};

export default LikedSongsPage;
