import { SignedIn, SignedOut, UserButton } from "@clerk/clerk-react";
import { ChevronLeft, ChevronRight, Keyboard, LayoutDashboard } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import useAuthStore from "@/stores/useAuthStore";
import { useUIStore } from "@/stores/useUIStore";
import Logo from "./Logo";
import SignInOAuthButtons from "./SignInOAuthButtons";

interface TopbarProps {
	// Fades in a solid background once the page has scrolled.
	solid?: boolean;
	children?: React.ReactNode;
}

const navButton =
	"grid size-8 place-items-center rounded-full bg-black/60 text-white transition hover:bg-black/80 disabled:opacity-40";

const Topbar = ({ solid = false, children }: TopbarProps) => {
	const navigate = useNavigate();
	// Re-render on navigation so the back button state stays current.
	useLocation();
	const isAdmin = useAuthStore((s) => s.isAdmin);
	const setShortcutsOpen = useUIStore((s) => s.setShortcutsOpen);
	const historyIndex = (window.history.state as { idx?: number } | null)?.idx ?? 0;

	return (
		<header
			className={cn(
				"sticky top-0 z-20 flex h-16 items-center justify-between gap-4 px-4 transition-colors duration-300 md:px-6",
				solid ? "bg-surface/95 backdrop-blur" : "bg-transparent"
			)}
		>
			<div className="flex min-w-0 flex-1 items-center gap-2">
				<Link to="/" className="md:hidden" aria-label="Home">
					<Logo compact />
				</Link>
				<div className="hidden items-center gap-2 md:flex">
					<button
						type="button"
						className={navButton}
						onClick={() => navigate(-1)}
						disabled={historyIndex === 0}
						aria-label="Go back"
						title="Go back"
					>
						<ChevronLeft className="size-5" />
					</button>
					<button
						type="button"
						className={navButton}
						onClick={() => navigate(1)}
						aria-label="Go forward"
						title="Go forward"
					>
						<ChevronRight className="size-5" />
					</button>
				</div>
				{children}
			</div>

			<div className="flex shrink-0 items-center gap-3">
				<button
					type="button"
					onClick={() => setShortcutsOpen(true)}
					className="hidden size-8 place-items-center rounded-full text-subdued transition hover:text-white lg:grid"
					aria-label="Keyboard shortcuts"
					title="Keyboard shortcuts"
				>
					<Keyboard className="size-5" />
				</button>
				{isAdmin && (
					<Link
						to="/admin"
						className="hidden h-8 items-center gap-2 rounded-full bg-white/10 px-4 text-sm font-semibold text-white transition hover:bg-white/20 sm:inline-flex"
					>
						<LayoutDashboard className="size-4" />
						Dashboard
					</Link>
				)}
				<SignedOut>
					<SignInOAuthButtons />
				</SignedOut>
				<SignedIn>
					<UserButton appearance={{ elements: { avatarBox: "size-8" } }} />
				</SignedIn>
			</div>
		</header>
	);
};

export default Topbar;
