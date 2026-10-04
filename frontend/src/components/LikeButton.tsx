import { Heart } from "lucide-react";
import { useAuth, useClerk } from "@clerk/clerk-react";
import { cn } from "@/lib/utils";
import { useLibraryStore } from "@/stores/useLibraryStore";
import type { Song } from "@/types";

interface LikeButtonProps {
	song: Song;
	className?: string;
	size?: "sm" | "md";
}

const LikeButton = ({ song, className, size = "sm" }: LikeButtonProps) => {
	const { isSignedIn } = useAuth();
	const { openSignIn } = useClerk();
	const liked = useLibraryStore((s) => s.likedIds.includes(song._id));
	const toggleLike = useLibraryStore((s) => s.toggleLike);

	const handleClick = (event: React.MouseEvent) => {
		event.stopPropagation();
		if (!isSignedIn) {
			openSignIn();
			return;
		}
		toggleLike(song);
	};

	return (
		<button
			type="button"
			onClick={handleClick}
			aria-pressed={liked}
			aria-label={liked ? `Remove ${song.title} from Liked Songs` : `Save ${song.title} to Liked Songs`}
			title={liked ? "Remove from Liked Songs" : "Save to Liked Songs"}
			className={cn(
				"grid shrink-0 place-items-center rounded-full transition-[color,transform] duration-150 active:scale-90",
				liked ? "text-primary" : "text-subdued hover:text-white",
				size === "sm" ? "size-8 [&_svg]:size-4" : "size-10 [&_svg]:size-6",
				className
			)}
		>
			<Heart fill={liked ? "currentColor" : "none"} />
		</button>
	);
};

export default LikeButton;
