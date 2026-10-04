import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { artistPath } from "@/lib/genres";

interface ArtistLinkProps {
	name: string;
	className?: string;
	onNavigate?: () => void;
}

const ArtistLink = ({ name, className, onNavigate }: ArtistLinkProps) => (
	<Link
		to={artistPath(name)}
		onClick={(event) => {
			event.stopPropagation();
			onNavigate?.();
		}}
		className={cn("hover:text-white hover:underline", className)}
	>
		{name}
	</Link>
);

export default ArtistLink;
