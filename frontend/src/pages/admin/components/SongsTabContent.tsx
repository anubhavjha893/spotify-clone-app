import AddSongDialog from "./AddSongDialog";
import SongsTable from "./SongsTable";

const SongsTabContent = () => (
	<section className="rounded-lg bg-surface-raised p-5" aria-labelledby="songs-heading">
		<div className="mb-5 flex flex-wrap items-center justify-between gap-4">
			<div>
				<h2 id="songs-heading" className="text-lg font-bold text-white">
					Songs
				</h2>
				<p className="text-sm text-subdued">Every track in the catalog</p>
			</div>
			<AddSongDialog />
		</div>
		<SongsTable />
	</section>
);

export default SongsTabContent;
