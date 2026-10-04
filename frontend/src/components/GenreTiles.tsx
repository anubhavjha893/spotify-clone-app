import { Link } from "react-router-dom";
import { genreColor, genrePath } from "@/lib/genres";
import { sizedImage } from "@/lib/image";
import type { AlbumSummary } from "@/types";

interface GenreTilesProps {
	albums: AlbumSummary[];
	title?: string;
}

// Coloured tiles, one per genre in the catalog, each with a tilted cover from that genre.
const GenreTiles = ({ albums, title = "Browse all" }: GenreTilesProps) => {
	const genres = new Map<string, { cover: string; count: number }>();
	for (const album of albums) {
		if (!album.genre) continue;
		const entry = genres.get(album.genre);
		if (entry) entry.count += 1;
		else genres.set(album.genre, { cover: album.imageUrl, count: 1 });
	}
	if (genres.size === 0) return null;

	return (
		<section className="mb-8 px-3" aria-label={title}>
			<h2 className="mb-4 text-2xl font-bold tracking-tight text-white">{title}</h2>
			<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
				{[...genres.entries()]
					.sort(([a], [b]) => a.localeCompare(b))
					.map(([genre, { cover }]) => (
						<Link
							key={genre}
							to={genrePath(genre)}
							className="group relative aspect-[16/10] overflow-hidden rounded-lg p-4 transition-transform duration-200 hover:scale-[1.02]"
							style={{ backgroundColor: genreColor(genre) }}
						>
							<span className="relative z-10 text-xl font-extrabold leading-tight text-white md:text-2xl">{genre}</span>
							<img
								src={sizedImage(cover, 120)}
								alt=""
								loading="lazy"
								className="absolute -bottom-2 -right-4 size-[46%] rotate-[25deg] rounded object-cover shadow-[0_4px_16px_rgba(0,0,0,0.45)] transition-transform duration-300 group-hover:rotate-[18deg] group-hover:scale-105"
							/>
						</Link>
					))}
			</div>
		</section>
	);
};

export default GenreTiles;
