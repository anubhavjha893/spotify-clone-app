import { useState } from "react";
import { Search, Trash2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import Artwork from "@/components/Artwork";
import ConfirmDialog from "@/components/ConfirmDialog";
import { formatTime } from "@/lib/format";
import { useMusicStore } from "@/stores/useMusicStore";

const SongsTable = () => {
	const songs = useMusicStore((s) => s.songs);
	const albums = useMusicStore((s) => s.albums);
	const songsLoading = useMusicStore((s) => s.songsLoading);
	const songsError = useMusicStore((s) => s.songsError);
	const deleteSong = useMusicStore((s) => s.deleteSong);
	const [filter, setFilter] = useState("");

	if (songsLoading && songs.length === 0) return <p className="py-8 text-center text-subdued">Loading songs...</p>;
	if (songsError) return <p className="py-8 text-center text-red-400">{songsError}</p>;

	const albumTitles = new Map(albums.map((album) => [album._id, album.title]));
	const needle = filter.trim().toLowerCase();
	const visible = needle
		? songs.filter((song) => `${song.title} ${song.artist}`.toLowerCase().includes(needle))
		: songs;

	return (
		<>
			<div className="relative mb-4 max-w-xs">
				<Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-subdued" />
				<input
					type="search"
					value={filter}
					onChange={(e) => setFilter(e.target.value)}
					placeholder="Filter songs"
					aria-label="Filter songs"
					className="h-9 w-full rounded-md bg-surface-hover pl-9 pr-3 text-sm outline-none placeholder:text-subdued focus:ring-1 focus:ring-white/40"
				/>
			</div>
			<div className="overflow-x-auto">
				<Table>
					<TableHeader>
						<TableRow className="border-white/10 hover:bg-transparent">
							<TableHead className="w-14" />
							<TableHead>Title</TableHead>
							<TableHead>Artist</TableHead>
							<TableHead className="hidden md:table-cell">Album</TableHead>
							<TableHead className="hidden sm:table-cell">Length</TableHead>
							<TableHead className="hidden sm:table-cell">Plays</TableHead>
							<TableHead className="hidden lg:table-cell">Added</TableHead>
							<TableHead className="text-right">
								<span className="sr-only">Actions</span>
							</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{visible.map((song) => (
							<TableRow key={song._id} className="border-white/5 hover:bg-white/5">
								<TableCell>
									<Artwork src={song.imageUrl} alt="" className="size-10" size={64} rounded="sm" />
								</TableCell>
								<TableCell className="font-medium text-white">
									{song.title}
									{song.videoUrl && <span className="ml-2 rounded bg-white/10 px-1.5 py-0.5 text-[10px] font-semibold text-subdued">CANVAS</span>}
								</TableCell>
								<TableCell className="text-subdued">{song.artist}</TableCell>
								<TableCell className="hidden text-subdued md:table-cell">
									{song.albumId ? albumTitles.get(song.albumId) ?? "Unknown" : "Single"}
								</TableCell>
								<TableCell className="hidden tabular-nums text-subdued sm:table-cell">{formatTime(song.duration)}</TableCell>
								<TableCell className="hidden tabular-nums text-subdued sm:table-cell">{(song.plays ?? 0).toLocaleString()}</TableCell>
								<TableCell className="hidden text-subdued lg:table-cell">
									{new Date(song.createdAt).toLocaleDateString()}
								</TableCell>
								<TableCell className="text-right">
									<ConfirmDialog
										title="Delete this song?"
										description={`"${song.title}" will be removed from the catalog, its album and every listener's Liked Songs. This cannot be undone.`}
										confirmLabel="Delete song"
										onConfirm={() => deleteSong(song._id)}
										trigger={
											<button
												type="button"
												className="grid size-8 place-items-center rounded-full text-red-400 hover:bg-red-400/10 hover:text-red-300"
												aria-label={`Delete ${song.title}`}
												title="Delete"
											>
												<Trash2 className="size-4" />
											</button>
										}
									/>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
				{visible.length === 0 && (
					<p className="py-8 text-center text-sm text-subdued">{needle ? "No songs match this filter." : "No songs yet."}</p>
				)}
			</div>
		</>
	);
};

export default SongsTable;
