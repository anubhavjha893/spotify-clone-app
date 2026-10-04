import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { Heart, Library } from "lucide-react";
import { cn } from "@/lib/utils";
import { pluralize } from "@/lib/format";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useMusicStore } from "@/stores/useMusicStore";
import { useLibraryStore } from "@/stores/useLibraryStore";
import Artwork from "@/components/Artwork";
import EmptyState from "@/components/EmptyState";
import PageShell from "@/layout/components/PageShell";

type Filter = "all" | "albums" | "recent";

const LibraryPage = () => {
	useDocumentTitle("Your Library");
	const { isSignedIn } = useAuth();
	const albums = useMusicStore((s) => s.albums);
	const likedCount = useLibraryStore((s) => s.likedIds.length);
	const recentlyPlayed = useLibraryStore((s) => s.recentlyPlayed);
	const [filter, setFilter] = useState<Filter>("all");

	const chips: { id: Filter; label: string }[] = [
		{ id: "all", label: "All" },
		{ id: "albums", label: "Albums" },
		{ id: "recent", label: "Recently played" },
	];

	const row = "flex items-center gap-3 rounded-md p-2 transition-colors hover:bg-white/10";

	return (
		<PageShell>
			<div className="px-4 md:px-6">
				<h1 className="mb-4 text-3xl font-extrabold tracking-tight text-white">Your Library</h1>

				<div className="mb-4 flex gap-2 overflow-x-auto scrollbar-none" role="tablist" aria-label="Filter library">
					{chips.map((chip) => (
						<button
							key={chip.id}
							type="button"
							role="tab"
							aria-selected={filter === chip.id}
							onClick={() => setFilter(chip.id)}
							className={cn(
								"h-8 shrink-0 rounded-full px-3 text-sm font-medium transition-colors",
								filter === chip.id ? "bg-white text-black" : "bg-white/10 text-white hover:bg-white/20"
							)}
						>
							{chip.label}
						</button>
					))}
				</div>

				<ul className="space-y-1">
					{filter === "all" && isSignedIn && (
						<li>
							<Link to="/liked" className={row}>
								<span className="grid size-14 shrink-0 place-items-center rounded-md bg-gradient-to-br from-[#2a6b45] to-[#9ad5b1]">
									<Heart className="size-6 text-white" fill="currentColor" />
								</span>
								<span className="min-w-0">
									<span className="block truncate font-semibold text-white">Liked Songs</span>
									<span className="block truncate text-sm text-subdued">Playlist &middot; {pluralize(likedCount, "song")}</span>
								</span>
							</Link>
						</li>
					)}

					{(filter === "all" || filter === "albums") &&
						albums.map((album) => (
							<li key={album._id}>
								<Link to={`/albums/${album._id}`} className={row}>
									<Artwork src={album.imageUrl} alt="" className="size-14" size={64} />
									<span className="min-w-0">
										<span className="block truncate font-semibold text-white">{album.title}</span>
										<span className="block truncate text-sm text-subdued">Album &middot; {album.artist}</span>
									</span>
								</Link>
							</li>
						))}

					{filter === "recent" &&
						recentlyPlayed.map((song) => (
							<li key={song._id}>
								<Link to={song.albumId ? `/albums/${song.albumId}` : "/"} className={row}>
									<Artwork src={song.imageUrl} alt="" className="size-14" size={64} />
									<span className="min-w-0">
										<span className="block truncate font-semibold text-white">{song.title}</span>
										<span className="block truncate text-sm text-subdued">Song &middot; {song.artist}</span>
									</span>
								</Link>
							</li>
						))}
				</ul>

				{filter === "recent" && recentlyPlayed.length === 0 && (
					<EmptyState icon={Library} title="Nothing played yet" description="Songs you listen to show up here." />
				)}
				{filter !== "recent" && albums.length === 0 && !isSignedIn && (
					<EmptyState icon={Library} title="Your library is empty" description="Albums added to the catalog appear here." />
				)}
			</div>
		</PageShell>
	);
};

export default LibraryPage;
