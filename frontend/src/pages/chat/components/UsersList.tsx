import UsersListSkeleton from "@/components/skeletons/UsersListSkeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import { cn } from "@/lib/utils";
import useChatStore from "@/stores/useChatStore";

const UsersList = () => {
	const users = useChatStore((s) => s.users);
	const selectedUser = useChatStore((s) => s.selectedUser);
	const setSelectedUser = useChatStore((s) => s.setSelectedUser);
	const usersLoading = useChatStore((s) => s.usersLoading);
	const usersError = useChatStore((s) => s.usersError);
	const onlineUsers = useChatStore((s) => s.onlineUsers);
	const userActivities = useChatStore((s) => s.userActivities);
	const unread = useChatStore((s) => s.unread);

	return (
		<div className="h-full overflow-y-auto p-2">
			<h2 className="px-2 pb-2 pt-1 text-sm font-bold text-white">People</h2>
			{usersLoading ? (
				<UsersListSkeleton />
			) : usersError ? (
				<p className="px-2 text-sm text-subdued">{usersError}</p>
			) : users.length === 0 ? (
				<p className="px-2 text-sm text-subdued">No one else has signed up yet.</p>
			) : (
				<ul className="space-y-0.5">
					{users.map((user) => {
						const online = onlineUsers.has(user.clerkId);
						const activity = userActivities.get(user.clerkId);
						const count = unread[user.clerkId] || 0;

						return (
							<li key={user._id}>
								<button
									type="button"
									onClick={() => setSelectedUser(user)}
									aria-current={selectedUser?.clerkId === user.clerkId}
									className={cn(
										"flex w-full items-center gap-3 rounded-md p-2 text-left transition-colors",
										selectedUser?.clerkId === user.clerkId ? "bg-white/10" : "hover:bg-white/5"
									)}
								>
									<span className="relative shrink-0">
										<Avatar className="size-11">
											<AvatarImage src={user.imageUrl} alt="" />
											<AvatarFallback>{user.fullName[0]}</AvatarFallback>
										</Avatar>
										<span
											className={cn(
												"absolute bottom-0 right-0 size-3 rounded-full ring-2 ring-[hsl(var(--surface))]",
												online ? "bg-primary" : "bg-zinc-500"
											)}
											aria-label={online ? "Online" : "Offline"}
										/>
									</span>
									<span className="min-w-0 flex-1">
										<span className={cn("block truncate text-sm", count ? "font-bold text-white" : "font-medium text-white")}>
											{user.fullName}
										</span>
										<span className="block truncate text-xs text-subdued">
											{activity ? `Listening to ${activity.title}` : online ? "Online" : "Offline"}
										</span>
									</span>
									{count > 0 && (
										<span className="rounded-full bg-primary px-2 py-0.5 text-xs font-bold text-black" aria-label={`${count} unread`}>
											{count}
										</span>
									)}
								</button>
							</li>
						);
					})}
				</ul>
			)}
		</div>
	);
};

export default UsersList;
