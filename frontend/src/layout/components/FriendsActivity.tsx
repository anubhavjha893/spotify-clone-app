import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import EmptyState from "@/components/EmptyState";
import Equalizer from "@/components/Equalizer";
import useChatStore from "@/stores/useChatStore";
import { useUIStore } from "@/stores/useUIStore";
import PanelHeader from "./PanelHeader";

const FriendsActivity = () => {
	const { isSignedIn } = useAuth();
	const navigate = useNavigate();
	const users = useChatStore((s) => s.users);
	const usersLoading = useChatStore((s) => s.usersLoading);
	const onlineUsers = useChatStore((s) => s.onlineUsers);
	const userActivities = useChatStore((s) => s.userActivities);
	const fetchUsers = useChatStore((s) => s.fetchUsers);
	const setSelectedUser = useChatStore((s) => s.setSelectedUser);
	const toggleRightPanel = useUIStore((s) => s.toggleRightPanel);

	useEffect(() => {
		if (isSignedIn) fetchUsers();
	}, [isSignedIn, fetchUsers]);

	// Listening now first, then online, then everyone else.
	const sorted = [...users].sort((a, b) => {
		const rank = (id: string) => (userActivities.get(id) ? 0 : onlineUsers.has(id) ? 1 : 2);
		return rank(a.clerkId) - rank(b.clerkId);
	});

	return (
		<div className="flex h-full flex-col">
			<PanelHeader title="Friend activity" onClose={() => toggleRightPanel("friends")} />

			{!isSignedIn ? (
				<EmptyState icon={Users} title="See what friends play" description="Log in to see what other listeners are playing right now." />
			) : usersLoading ? (
				<div className="space-y-4 p-4" aria-hidden="true">
					{Array.from({ length: 4 }).map((_, i) => (
						<div key={i} className="flex items-center gap-3">
							<div className="size-10 animate-pulse rounded-full bg-surface-hover" />
							<div className="flex-1 space-y-2">
								<div className="h-3.5 w-1/2 animate-pulse rounded bg-surface-hover" />
								<div className="h-3 w-3/4 animate-pulse rounded bg-surface-hover" />
							</div>
						</div>
					))}
				</div>
			) : sorted.length === 0 ? (
				<EmptyState icon={Users} title="No other listeners yet" description="When other people sign up, their listening shows up here." />
			) : (
				<ul className="min-h-0 flex-1 space-y-1 overflow-y-auto px-2 pb-4">
					{sorted.map((user) => {
						const activity = userActivities.get(user.clerkId);
						const online = onlineUsers.has(user.clerkId);

						return (
							<li key={user._id}>
								<button
									type="button"
									onClick={() => {
										setSelectedUser(user);
										navigate("/chat");
									}}
									className="flex w-full items-start gap-3 rounded-md p-2 text-left transition-colors hover:bg-white/10"
									title={`Message ${user.fullName}`}
								>
									<span className="relative shrink-0">
										<Avatar className="size-10">
											<AvatarImage src={user.imageUrl} alt="" />
											<AvatarFallback>{user.fullName[0]}</AvatarFallback>
										</Avatar>
										<span
											className={`absolute bottom-0 right-0 size-3 rounded-full border-2 border-[hsl(var(--surface))] ${online ? "bg-primary" : "bg-zinc-500"}`}
											aria-label={online ? "Online" : "Offline"}
										/>
									</span>
									<span className="min-w-0 flex-1">
										<span className="flex items-center justify-between gap-2">
											<span className="truncate text-sm font-semibold text-white">{user.fullName}</span>
											{activity && <Equalizer playing />}
										</span>
										{activity ? (
											<>
												<span className="block truncate text-sm text-white/90">{activity.title}</span>
												<span className="block truncate text-xs text-subdued">{activity.artist}</span>
											</>
										) : (
											<span className="block text-xs text-subdued">{online ? "Online" : "Offline"}</span>
										)}
									</span>
								</button>
							</li>
						);
					})}
				</ul>
			)}
		</div>
	);
};

export default FriendsActivity;
