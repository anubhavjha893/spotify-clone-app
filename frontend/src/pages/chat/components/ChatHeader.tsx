import { ArrowLeft } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import useChatStore from "@/stores/useChatStore";

const ChatHeader = () => {
	const selectedUser = useChatStore((s) => s.selectedUser);
	const onlineUsers = useChatStore((s) => s.onlineUsers);
	const activity = useChatStore((s) => (selectedUser ? s.userActivities.get(selectedUser.clerkId) : null));
	const setSelectedUser = useChatStore((s) => s.setSelectedUser);

	if (!selectedUser) return null;
	const online = onlineUsers.has(selectedUser.clerkId);

	return (
		<div className="flex items-center gap-3 border-b border-white/10 p-3">
			<button
				type="button"
				onClick={() => setSelectedUser(null)}
				className="grid size-9 place-items-center rounded-full text-subdued hover:bg-white/10 hover:text-white md:hidden"
				aria-label="Back to people"
			>
				<ArrowLeft className="size-5" />
			</button>
			<Avatar className="size-10">
				<AvatarImage src={selectedUser.imageUrl} alt="" />
				<AvatarFallback>{selectedUser.fullName[0]}</AvatarFallback>
			</Avatar>
			<div className="min-w-0">
				<h2 className="truncate font-semibold text-white">{selectedUser.fullName}</h2>
				<p className="truncate text-xs text-subdued">
					{activity ? `Listening to ${activity.title} by ${activity.artist}` : online ? "Online" : "Offline"}
				</p>
			</div>
		</div>
	);
};

export default ChatHeader;
