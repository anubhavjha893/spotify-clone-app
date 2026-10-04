import { useEffect, useRef, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { SignedIn, useAuth } from "@clerk/clerk-react";
import { Heart, Home, Library, MessageCircle, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import Artwork from "@/components/Artwork";
import Equalizer from "@/components/Equalizer";
import Logo from "@/components/Logo";
import { ScrollArea } from "@/components/ui/ScrollArea";
import { useMusicStore } from "@/stores/useMusicStore";
import { useLibraryStore } from "@/stores/useLibraryStore";
import usePlayerStore from "@/stores/usePlayerStore";
import useChatStore from "@/stores/useChatStore";
import { pluralize } from "@/lib/format";

const COMPACT_WIDTH = 200;

// Switches to an icon only layout when the panel is dragged narrow.
const useIsCompact = () => {
	const ref = useRef<HTMLDivElement>(null);
	const [compact, setCompact] = useState(false);

	useEffect(() => {
		const el = ref.current;
		if (!el) return;
		const observer = new ResizeObserver(([entry]) => setCompact(entry.contentRect.width < COMPACT_WIDTH));
		observer.observe(el);
		return () => observer.disconnect();
	}, []);

	return { ref, compact };
};

const LeftSidebar = () => {
	const { ref, compact } = useIsCompact();
	const { isSignedIn } = useAuth();
	const albums = useMusicStore((s) => s.albums);
	const albumsLoading = useMusicStore((s) => s.albumsLoading);
	const likedCount = useLibraryStore((s) => s.likedIds.length);
	const currentAlbumId = usePlayerStore((s) => s.currentSong?.albumId);
	const isPlaying = usePlayerStore((s) => s.isPlaying);
	const unreadTotal = useChatStore((s) => Object.values(s.unread).reduce((sum, n) => sum + n, 0));

	const navItem = ({ isActive }: { isActive: boolean }) =>
		cn(
			"flex h-10 items-center gap-4 rounded-md px-3 font-bold transition-colors",
			compact && "justify-center px-0",
			isActive ? "text-white" : "text-subdued hover:text-white"
		);

	return (
		<div ref={ref} className="flex h-full flex-col gap-2">
			<nav aria-label="Primary" className="surface rounded-lg px-3 py-4">
				<Link to="/" className={cn("mb-4 flex px-3", compact && "justify-center px-0")} aria-label="Home">
					<Logo compact={compact} />
				</Link>
				<NavLink to="/" end className={navItem} title="Home">
					<Home className="size-6 shrink-0" />
					{!compact && "Home"}
				</NavLink>
				<NavLink to="/search" className={navItem} title="Search">
					<Search className="size-6 shrink-0" />
					{!compact && "Search"}
				</NavLink>
				<SignedIn>
					<NavLink to="/chat" className={navItem} title="Messages">
						<span className="relative">
							<MessageCircle className="size-6 shrink-0" />
							{unreadTotal > 0 && (
								<span className="absolute -right-1.5 -top-1.5 rounded-full bg-primary px-1 text-[10px] font-bold leading-4 text-black">
									{unreadTotal}
								</span>
							)}
						</span>
						{!compact && "Messages"}
					</NavLink>
				</SignedIn>
			</nav>

			<section aria-label="Your Library" className="surface flex min-h-0 flex-1 flex-col rounded-lg">
				<NavLink
					to="/library"
					className={({ isActive }) =>
						cn(
							"flex h-14 items-center gap-3 px-6 font-bold transition-colors",
							compact && "justify-center px-0",
							isActive ? "text-white" : "text-subdued hover:text-white"
						)
					}
					title="Your Library"
				>
					<Library className="size-6 shrink-0" />
					{!compact && "Your Library"}
				</NavLink>

				<ScrollArea className="min-h-0 flex-1 [&_[data-radix-scroll-area-viewport]>div]:!block">
					<ul className="space-y-0.5 px-2 pb-2">
						{isSignedIn && (
							<li>
								<NavLink
									to="/liked"
									className={({ isActive }) =>
										cn(
											"flex items-center gap-3 rounded-md p-2 transition-colors hover:bg-white/10",
											compact && "justify-center",
											isActive && "bg-white/10"
										)
									}
									title="Liked Songs"
								>
									<span className="grid size-12 shrink-0 place-items-center rounded-md bg-gradient-to-br from-[#2a6b45] to-[#9ad5b1]">
										<Heart className="size-5 text-white" fill="currentColor" />
									</span>
									{!compact && (
										<span className="min-w-0">
											<span className="block truncate font-medium text-white">Liked Songs</span>
											<span className="block truncate text-sm text-subdued">
												Playlist &middot; {pluralize(likedCount, "song")}
											</span>
										</span>
									)}
								</NavLink>
							</li>
						)}

						{albumsLoading &&
							Array.from({ length: 6 }).map((_, i) => (
								<li key={i} className={cn("flex items-center gap-3 p-2", compact && "justify-center")} aria-hidden="true">
									<div className="size-12 shrink-0 animate-pulse rounded-md bg-surface-hover" />
									{!compact && (
										<div className="flex-1 space-y-2">
											<div className="h-3.5 w-3/4 animate-pulse rounded bg-surface-hover" />
											<div className="h-3 w-1/2 animate-pulse rounded bg-surface-hover" />
										</div>
									)}
								</li>
							))}

						{albums.map((album) => {
							const playingHere = currentAlbumId === album._id;
							return (
								<li key={album._id}>
									<NavLink
										to={`/albums/${album._id}`}
										className={({ isActive }) =>
											cn(
												"flex items-center gap-3 rounded-md p-2 transition-colors hover:bg-white/10",
												compact && "justify-center",
												isActive && "bg-white/10"
											)
										}
										title={album.title}
									>
										<Artwork src={album.imageUrl} alt="" className="size-12" size={64} />
										{!compact && (
											<span className="min-w-0 flex-1">
												<span className={cn("block truncate font-medium", playingHere ? "text-primary" : "text-white")}>
													{album.title}
												</span>
												<span className="block truncate text-sm text-subdued">Album &middot; {album.artist}</span>
											</span>
										)}
										{!compact && playingHere && <Equalizer playing={isPlaying} className="mr-2" />}
									</NavLink>
								</li>
							);
						})}
					</ul>
				</ScrollArea>
			</section>
		</div>
	);
};

export default LeftSidebar;
