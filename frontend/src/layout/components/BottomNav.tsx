import { NavLink } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { Home, Library, MessageCircle, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import useChatStore from "@/stores/useChatStore";

const BottomNav = () => {
	const { isSignedIn } = useAuth();
	const unreadTotal = useChatStore((s) => Object.values(s.unread).reduce((sum, n) => sum + n, 0));

	const items = [
		{ to: "/", label: "Home", icon: Home, end: true },
		{ to: "/search", label: "Search", icon: Search },
		{ to: "/library", label: "Your Library", icon: Library },
		...(isSignedIn ? [{ to: "/chat", label: "Messages", icon: MessageCircle }] : []),
	];

	return (
		<nav
			aria-label="Primary"
			className="grid bg-gradient-to-t from-black via-black/95 to-black/80 pb-[env(safe-area-inset-bottom)]"
			style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}
		>
			{items.map(({ to, label, icon: Icon, end }) => (
				<NavLink
					key={to}
					to={to}
					end={end}
					className={({ isActive }) =>
						cn(
							"relative flex flex-col items-center gap-1 py-2 text-[11px] font-medium transition-colors",
							isActive ? "text-white" : "text-subdued"
						)
					}
				>
					<Icon className="size-6" />
					{label}
					{to === "/chat" && unreadTotal > 0 && (
						<span className="absolute right-1/2 top-1 translate-x-5 rounded-full bg-primary px-1.5 text-[10px] font-bold text-black">
							{unreadTotal}
						</span>
					)}
				</NavLink>
			))}
		</nav>
	);
};

export default BottomNav;
