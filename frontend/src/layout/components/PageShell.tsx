import { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import Footer from "@/components/Footer";
import Topbar from "@/components/Topbar";

interface PageShellProps {
	children: React.ReactNode;
	// "r g b" colour used for the backdrop behind the header and the solid top bar.
	tint?: string;
	topbarContent?: React.ReactNode;
	showFooter?: boolean;
	className?: string;
}

// Scrollable page body with a sticky top bar that turns solid after scrolling.
const PageShell = ({ children, tint, topbarContent, showFooter = true, className }: PageShellProps) => {
	const [scrolled, setScrolled] = useState(false);
	const scrolledRef = useRef(false);

	const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
		const next = event.currentTarget.scrollTop > 56;
		if (next !== scrolledRef.current) {
			scrolledRef.current = next;
			setScrolled(next);
		}
	};

	return (
		<div
			className="relative h-full overflow-y-auto overscroll-contain"
			onScroll={handleScroll}
			style={tint ? ({ "--tint": tint } as React.CSSProperties) : undefined}
		>
			{tint && <div className="tint-fade pointer-events-none absolute inset-x-0 top-0 h-[420px]" aria-hidden="true" />}
			<div
				className="sticky top-0 z-20"
				style={scrolled && tint ? { backgroundColor: `rgb(${tint})` } : undefined}
			>
				<Topbar solid={scrolled && !tint}>{topbarContent}</Topbar>
			</div>
			<div className={cn("relative pb-40 md:pb-0", className)}>
				{children}
				{showFooter && <Footer />}
			</div>
		</div>
	);
};

export default PageShell;
