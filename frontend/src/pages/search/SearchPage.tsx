import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { CanceledError } from "axios";
import { Search, SearchX, X } from "lucide-react";
import { axiosInstance, getErrorMessage } from "@/lib/axios";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useMusicStore } from "@/stores/useMusicStore";
import usePlayerStore from "@/stores/usePlayerStore";
import Artwork from "@/components/Artwork";
import EmptyState from "@/components/EmptyState";
import PlayCircleButton from "@/components/PlayCircleButton";
import TrackList from "@/components/TrackList";
import PageShell from "@/layout/components/PageShell";
import PageLoader from "@/layout/components/PageLoader";
import AlbumShelf from "@/pages/home/components/AlbumShelf";
import GenreTiles from "@/components/GenreTiles";
import type { AlbumSummary, Song } from "@/types";

interface Results {
	songs: Song[];
	albums: AlbumSummary[];
}

const DEBOUNCE_MS = 250;

const SearchPage = () => {
	const [params, setParams] = useSearchParams();
	const initial = params.get("q") ?? "";
	const [query, setQuery] = useState(initial);
	const [results, setResults] = useState<Results | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const inputRef = useRef<HTMLInputElement>(null);
	// setSearchParams changes identity on every navigation, so it is read through a ref
	// to keep the search effect from re-running in a loop.
	const setParamsRef = useRef(setParams);
	setParamsRef.current = setParams;

	const albums = useMusicStore((s) => s.albums);
	const currentId = usePlayerStore((s) => s.currentSong?._id);
	const isPlaying = usePlayerStore((s) => s.isPlaying);
	const trimmed = query.trim();

	useDocumentTitle(trimmed ? `Search: ${trimmed}` : "Search");

	useEffect(() => {
		inputRef.current?.focus();
	}, []);

	useEffect(() => {
		if (!trimmed) {
			setResults(null);
			setLoading(false);
			setError(null);
			setParamsRef.current({}, { replace: true });
			return;
		}

		const controller = new AbortController();
		setLoading(true);
		const timer = window.setTimeout(async () => {
			setParamsRef.current({ q: trimmed }, { replace: true });
			try {
				const response = await axiosInstance.get<Results>("/search", {
					params: { q: trimmed },
					signal: controller.signal,
				});
				setResults(response.data);
				setError(null);
			} catch (err) {
				if (err instanceof CanceledError) return;
				setError(getErrorMessage(err, "Search failed"));
			} finally {
				if (!controller.signal.aborted) setLoading(false);
			}
		}, DEBOUNCE_MS);

		return () => {
			window.clearTimeout(timer);
			controller.abort();
		};
	}, [trimmed]);

	const topSong = results?.songs[0];
	const searchBox = (
		<div className="relative w-full max-w-md">
			<Search className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-subdued" />
			<input
				ref={inputRef}
				type="search"
				value={query}
				onChange={(e) => setQuery(e.target.value)}
				placeholder="Songs, albums or artists"
				aria-label="Search songs, albums or artists"
				maxLength={100}
				className="h-12 w-full rounded-full border border-transparent bg-surface-raised pl-11 pr-10 text-sm text-white outline-none transition placeholder:text-subdued hover:border-white/10 hover:bg-surface-hover focus:border-white focus-visible:outline-none [&::-webkit-search-cancel-button]:hidden"
			/>
			{query && (
				<button
					type="button"
					onClick={() => {
						setQuery("");
						inputRef.current?.focus();
					}}
					className="absolute right-3 top-1/2 grid size-6 -translate-y-1/2 place-items-center text-subdued hover:text-white"
					aria-label="Clear search"
				>
					<X className="size-5" />
				</button>
			)}
		</div>
	);

	return (
		<PageShell topbarContent={<div className="ml-2 hidden flex-1 md:block">{searchBox}</div>}>
			<div className="px-4 pt-2 md:hidden">{searchBox}</div>

			<div className="px-1 pt-4 md:px-3" aria-live="polite">
				{!trimmed ? (
					albums.length > 0 ? (
						<>
							<GenreTiles albums={albums} />
							<AlbumShelf title="All albums" albums={albums} layout="grid" />
						</>
					) : (
						<EmptyState icon={Search} title="Search the catalog" description="Find songs, albums and artists." />
					)
				) : loading && !results ? (
					<div className="h-60">
						<PageLoader />
					</div>
				) : error ? (
					<EmptyState icon={SearchX} title="Search is unavailable" description={error} />
				) : results && results.songs.length === 0 && results.albums.length === 0 ? (
					<EmptyState
						icon={SearchX}
						title={`No results for "${trimmed}"`}
						description="Check the spelling, or try fewer or different keywords."
					/>
				) : (
					results && (
						<>
							{topSong && (
								<div className="mb-8 grid gap-6 px-3 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
									<section aria-label="Top result">
										<h2 className="mb-3 text-2xl font-bold text-white">Top result</h2>
										<div className="group relative rounded-lg bg-surface-raised p-5 transition-colors hover:bg-surface-hover">
											<Artwork src={topSong.imageUrl} alt="" className="mb-4 size-24 shadow-xl" />
											<p className="line-clamp-2 break-words text-3xl font-extrabold leading-tight text-white">{topSong.title}</p>
											<p className="mt-1 text-sm text-subdued">
												<span className="font-semibold text-white">{topSong.artist}</span>
												<span aria-hidden="true"> &middot; </span>
												Song
											</p>
											<PlayCircleButton
												className="absolute bottom-5 right-5 opacity-0 transition-all group-hover:opacity-100 focus-visible:opacity-100"
												playing={currentId === topSong._id && isPlaying}
												label={topSong.title}
												onClick={() => {
													const player = usePlayerStore.getState();
													if (currentId === topSong._id) player.togglePlay();
													else player.playSong(topSong, results.songs);
												}}
											/>
										</div>
									</section>
									<section aria-label="Songs">
										<h2 className="mb-3 text-2xl font-bold text-white">Songs</h2>
										<TrackList songs={results.songs.slice(0, 4)} showHeader={false} />
									</section>
								</div>
							)}

							{results.songs.length > 4 && (
								<section className="mb-8 px-3" aria-label="More songs">
									<h2 className="mb-3 text-2xl font-bold text-white">More songs</h2>
									<TrackList songs={results.songs.slice(4)} showAlbumColumn />
								</section>
							)}

							{results.albums.length > 0 && <AlbumShelf title="Albums" albums={results.albums} />}
						</>
					)
				)}
			</div>
		</PageShell>
	);
};

export default SearchPage;
