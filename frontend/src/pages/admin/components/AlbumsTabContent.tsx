import AddAlbumDialog from "./AddAlbumDialog";
import AlbumsTable from "./AlbumsTable";

const AlbumsTabContent = () => (
	<section className="rounded-lg bg-surface-raised p-5" aria-labelledby="albums-heading">
		<div className="mb-5 flex flex-wrap items-center justify-between gap-4">
			<div>
				<h2 id="albums-heading" className="text-lg font-bold text-white">
					Albums
				</h2>
				<p className="text-sm text-subdued">Deleting an album also deletes its songs</p>
			</div>
			<AddAlbumDialog />
		</div>
		<AlbumsTable />
	</section>
);

export default AlbumsTabContent;
