import { useEffect, useLayoutEffect, useRef } from "react";
import { SignInButton, useAuth, useUser } from "@clerk/clerk-react";
import { MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import useChatStore from "@/stores/useChatStore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import EmptyState from "@/components/EmptyState";
import Topbar from "@/components/Topbar";
import PageLoader from "@/layout/components/PageLoader";
import UsersList from "./components/UsersList";
import ChatHeader from "./components/ChatHeader";
import MessageInput from "./components/MessageInput";

const formatTime = (date: string) =>
	new Date(date).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });

const formatDay = (date: string) => {
	const day = new Date(date);
	const today = new Date();
	const yesterday = new Date();
	yesterday.setDate(today.getDate() - 1);
	if (day.toDateString() === today.toDateString()) return "Today";
	if (day.toDateString() === yesterday.toDateString()) return "Yesterday";
	return day.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" });
};

const ChatPage = () => {
	useDocumentTitle("Messages");
	const { isSignedIn, isLoaded } = useAuth();
	const { user } = useUser();
	const messages = useChatStore((s) => s.messages);
	const messagesLoading = useChatStore((s) => s.messagesLoading);
	const messagesError = useChatStore((s) => s.messagesError);
	const selectedUser = useChatStore((s) => s.selectedUser);
	const fetchMessages = useChatStore((s) => s.fetchMessages);
	const fetchUsers = useChatStore((s) => s.fetchUsers);
	const bottomRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (isSignedIn) fetchUsers();
	}, [isSignedIn, fetchUsers]);

	useEffect(() => {
		if (selectedUser) fetchMessages(selectedUser.clerkId);
	}, [selectedUser, fetchMessages]);

	// Leaving the page closes the conversation so new messages count as unread.
	useEffect(() => () => useChatStore.getState().setSelectedUser(null), []);

	useLayoutEffect(() => {
		bottomRef.current?.scrollIntoView({ block: "end" });
	}, [messages, selectedUser]);

	if (!isLoaded) return <PageLoader />;

	if (!isSignedIn) {
		return (
			<div className="flex h-full flex-col">
				<Topbar />
				<EmptyState
					icon={MessageCircle}
					title="Chat with other listeners"
					description="Log in to send messages and see who is online."
					action={
						<SignInButton mode="modal">
							<button type="button" className="h-10 rounded-full bg-white px-6 text-sm font-bold text-black">
								Log in
							</button>
						</SignInButton>
					}
				/>
			</div>
		);
	}

	return (
		<div className="flex h-full flex-col pb-36 md:pb-0">
			<Topbar solid />
			<div className="grid min-h-0 flex-1 md:grid-cols-[minmax(0,300px)_1fr]">
				<div className={cn("min-h-0 border-white/10 md:block md:border-r", selectedUser && "hidden")}>
					<UsersList />
				</div>

				<section className={cn("min-h-0 flex-col", selectedUser ? "flex" : "hidden md:flex")} aria-label="Conversation">
					{selectedUser ? (
						<>
							<ChatHeader />
							<div className="min-h-0 flex-1 overflow-y-auto px-4 py-4" role="log" aria-live="polite">
								{messagesLoading && messages.length === 0 ? (
									<PageLoader />
								) : messagesError ? (
									<p className="py-10 text-center text-sm text-subdued">{messagesError}</p>
								) : messages.length === 0 ? (
									<p className="py-10 text-center text-sm text-subdued">
										No messages yet. Say hello to {selectedUser.fullName}.
									</p>
								) : (
									<ol className="space-y-1">
										{messages.map((message, index) => {
											const mine = message.senderId === user?.id;
											const previous = messages[index - 1];
											const newDay =
												!previous ||
												new Date(previous.createdAt).toDateString() !== new Date(message.createdAt).toDateString();
											const grouped = !newDay && previous?.senderId === message.senderId;

											return (
												<li key={message._id}>
													{newDay && (
														<p className="my-4 text-center text-xs font-semibold text-subdued">{formatDay(message.createdAt)}</p>
													)}
													<div className={cn("flex items-end gap-2", mine && "flex-row-reverse", !grouped && "mt-3")}>
														<Avatar className={cn("size-7", grouped && "invisible")}>
															<AvatarImage src={mine ? user?.imageUrl : selectedUser.imageUrl} alt="" />
															<AvatarFallback>{(mine ? user?.firstName : selectedUser.fullName)?.[0] ?? "?"}</AvatarFallback>
														</Avatar>
														<div
															className={cn(
																"max-w-[75%] rounded-2xl px-3.5 py-2",
																mine ? "rounded-br-md bg-primary text-primary-foreground" : "rounded-bl-md bg-surface-hover text-white"
															)}
														>
															<p className="whitespace-pre-wrap break-words text-sm">{message.content}</p>
															<time
																dateTime={message.createdAt}
																className={cn("mt-0.5 block text-right text-[11px]", mine ? "text-black/60" : "text-subdued")}
															>
																{formatTime(message.createdAt)}
															</time>
														</div>
													</div>
												</li>
											);
										})}
									</ol>
								)}
								<div ref={bottomRef} />
							</div>
							<MessageInput />
						</>
					) : (
						<EmptyState icon={MessageCircle} title="No conversation selected" description="Choose someone to start chatting." />
					)}
				</section>
			</div>
		</div>
	);
};

export default ChatPage;
