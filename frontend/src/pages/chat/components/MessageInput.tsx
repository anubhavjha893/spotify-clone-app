import { useState } from "react";
import { SendHorizontal } from "lucide-react";
import toast from "react-hot-toast";
import useChatStore from "@/stores/useChatStore";

const MAX_LENGTH = 2000;

const MessageInput = () => {
	const [message, setMessage] = useState("");
	const [sending, setSending] = useState(false);
	const selectedUser = useChatStore((s) => s.selectedUser);
	const sendMessage = useChatStore((s) => s.sendMessage);
	const isConnected = useChatStore((s) => s.isConnected);

	const trimmed = message.trim();

	const handleSend = async () => {
		if (!selectedUser || !trimmed || sending) return;
		setSending(true);
		const error = await sendMessage(selectedUser.clerkId, trimmed);
		setSending(false);
		if (error) toast.error(error);
		else setMessage("");
	};

	return (
		<form
			className="border-t border-white/10 p-3"
			onSubmit={(event) => {
				event.preventDefault();
				handleSend();
			}}
		>
			<div className="flex items-end gap-2">
				<textarea
					value={message}
					onChange={(e) => setMessage(e.target.value.slice(0, MAX_LENGTH))}
					onKeyDown={(e) => {
						if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
							e.preventDefault();
							handleSend();
						}
					}}
					rows={1}
					placeholder={isConnected ? `Message ${selectedUser?.fullName ?? ""}` : "Connecting..."}
					aria-label="Message"
					className="max-h-32 min-h-11 flex-1 resize-none rounded-2xl border border-transparent bg-surface-hover px-4 py-2.5 text-sm text-white outline-none placeholder:text-subdued focus:border-white/30 focus-visible:outline-none [field-sizing:content]"
				/>
				<button
					type="submit"
					disabled={!trimmed || sending || !isConnected}
					className="grid size-11 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground transition hover:brightness-110 disabled:opacity-40"
					aria-label="Send message"
				>
					<SendHorizontal className="size-5" />
				</button>
			</div>
			{message.length > MAX_LENGTH - 200 && (
				<p className="mt-1 text-right text-xs text-subdued">
					{message.length}/{MAX_LENGTH}
				</p>
			)}
		</form>
	);
};

export default MessageInput;
