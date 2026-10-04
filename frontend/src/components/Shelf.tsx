import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ShelfProps {
	title: string;
	subtitle?: string;
	moreTo?: string;
	children: React.ReactNode;
	// "row" scrolls sideways in a single line, "grid" wraps (used on full lists).
	layout?: "row" | "grid";
}

export const shelfGrid = "grid grid-cols-2 gap-x-1 gap-y-2 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6";
const rowItem = "w-[44vw] max-w-[190px] shrink-0 snap-start sm:w-[180px] sm:max-w-none xl:w-[196px]";

const arrow =
	"absolute top-[38%] z-10 hidden size-9 -translate-y-1/2 place-items-center rounded-full bg-black/80 text-white shadow-lg transition hover:scale-105 hover:bg-black md:grid";

const Shelf = ({ title, subtitle, moreTo, children, layout = "row" }: ShelfProps) => {
	const scroller = useRef<HTMLDivElement>(null);
	const [edges, setEdges] = useState({ start: true, end: true });

	const measure = useCallback(() => {
		const el = scroller.current;
		if (!el) return;
		setEdges({ start: el.scrollLeft <= 4, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4 });
	}, []);

	useEffect(() => {
		const el = scroller.current;
		if (!el) return;
		measure();
		const observer = new ResizeObserver(measure);
		observer.observe(el);
		return () => observer.disconnect();
	}, [measure, children]);

	const scrollBy = (direction: 1 | -1) => {
		const el = scroller.current;
		if (el) el.scrollBy({ left: direction * el.clientWidth * 0.85, behavior: "smooth" });
	};

	return (
		<section className="group/shelf mb-8" aria-label={title}>
			<div className="mb-1 flex items-end justify-between gap-4 px-3">
				<div className="min-w-0">
					<h2 className="truncate text-2xl font-bold tracking-tight text-white">
						{moreTo ? (
							<Link to={moreTo} className="hover:underline">
								{title}
							</Link>
						) : (
							title
						)}
					</h2>
					{subtitle && <p className="truncate text-sm text-subdued">{subtitle}</p>}
				</div>
				{moreTo && (
					<Link to={moreTo} className="shrink-0 text-sm font-semibold text-subdued hover:text-white hover:underline">
						Show all
					</Link>
				)}
			</div>

			{layout === "grid" ? (
				<div className={shelfGrid}>{children}</div>
			) : (
				<div className="relative">
					<div
						ref={scroller}
						onScroll={measure}
						className="scrollbar-none flex snap-x snap-mandatory scroll-px-3 gap-1 overflow-x-auto px-1 md:px-0 [&>*]:shrink-0"
					>
						{children}
					</div>
					{!edges.start && (
						<button
							type="button"
							onClick={() => scrollBy(-1)}
							className={cn(arrow, "left-1 opacity-0 group-hover/shelf:opacity-100 focus-visible:opacity-100")}
							aria-label={`Scroll ${title} back`}
						>
							<ChevronLeft className="size-5" />
						</button>
					)}
					{!edges.end && (
						<button
							type="button"
							onClick={() => scrollBy(1)}
							className={cn(arrow, "right-1 opacity-0 group-hover/shelf:opacity-100 focus-visible:opacity-100")}
							aria-label={`Scroll ${title} forward`}
						>
							<ChevronRight className="size-5" />
						</button>
					)}
				</div>
			)}
		</section>
	);
};

export const GridItem = ({ children }: { children: React.ReactNode }) => <>{children}</>;

export const ShelfItem = ({ children }: { children: React.ReactNode }) => <div className={rowItem}>{children}</div>;

export const ShelfSkeleton = ({ count = 6 }: { count?: number }) => (
	<div className="mb-8" aria-hidden="true">
		<div className="mx-3 mb-4 h-7 w-48 animate-pulse rounded bg-surface-hover" />
		<div className="flex gap-1 overflow-hidden">
			{Array.from({ length: count }).map((_, i) => (
				<div key={i} className={cn(rowItem, "p-3")}>
					<div className="mb-3 aspect-square animate-pulse rounded-md bg-surface-hover" />
					<div className="mb-2 h-4 w-3/4 animate-pulse rounded bg-surface-hover" />
					<div className="h-3 w-1/2 animate-pulse rounded bg-surface-hover" />
				</div>
			))}
		</div>
	</div>
);

export default Shelf;
