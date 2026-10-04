import { Link } from "react-router-dom";
import { Trash2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import Artwork from "@/components/Artwork";
import ConfirmDialog from "@/components/ConfirmDialog";
import { pluralize } from "@/lib/format";
import { useMusicStore } from "@/stores/useMusicStore";

const AlbumsTable = () => {
	const albums = useMusicStore((s) => s.albums);
	const albumsLoading = useMusicStore((s) => s.albumsLoading);
	const albumsError = useMusicStore((s) => s.albumsError);
	const deleteAlbum = useMusicStore((s) => s.deleteAlbum);

	if (albumsLoading && albums.length === 0) return <p className="py-8 text-center text-subdued">Loading albums...</p>;
	if (albumsError) return <p className="py-8 text-center text-red-400">{albumsError}</p>;

	return (
		<div className="overflow-x-auto">
			<Table>
				<TableHeader>
					<TableRow className="border-white/10 hover:bg-transparent">
						<TableHead className="w-14" />
						<TableHead>Title</TableHead>
						<TableHead>Artist</TableHead>
						<TableHead className="hidden sm:table-cell">Year</TableHead>
						<TableHead className="hidden sm:table-cell">Songs</TableHead>
						<TableHead className="text-right">
							<span className="sr-only">Actions</span>
						</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{albums.map((album) => (
						<TableRow key={album._id} className="border-white/5 hover:bg-white/5">
							<TableCell>
								<Artwork src={album.imageUrl} alt="" className="size-10" size={64} rounded="sm" />
							</TableCell>
							<TableCell className="font-medium text-white">
								<Link to={`/albums/${album._id}`} className="hover:underline">
									{album.title}
								</Link>
							</TableCell>
							<TableCell className="text-subdued">{album.artist}</TableCell>
							<TableCell className="hidden tabular-nums text-subdued sm:table-cell">{album.releaseYear}</TableCell>
							<TableCell className="hidden text-subdued sm:table-cell">{pluralize(album.songs.length, "song")}</TableCell>
							<TableCell className="text-right">
								<ConfirmDialog
									title="Delete this album?"
									description={`"${album.title}" and its ${pluralize(album.songs.length, "song")} will be removed for everyone. This cannot be undone.`}
									confirmLabel="Delete album"
									onConfirm={() => deleteAlbum(album._id)}
									trigger={
										<button
											type="button"
											className="grid size-8 place-items-center rounded-full text-red-400 hover:bg-red-400/10 hover:text-red-300"
											aria-label={`Delete ${album.title}`}
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
			{albums.length === 0 && <p className="py-8 text-center text-sm text-subdued">No albums yet.</p>}
		</div>
	);
};

export default AlbumsTable;
