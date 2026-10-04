import { useUIStore } from "@/stores/useUIStore";
import FriendsActivity from "./FriendsActivity";
import NowPlayingPanel from "./NowPlayingPanel";
import QueuePanel from "./QueuePanel";

const RightPanel = () => {
	const panel = useUIStore((s) => s.rightPanel);

	return (
		<aside className="surface h-full overflow-hidden rounded-lg" aria-label="Side panel">
			{panel === "queue" && <QueuePanel />}
			{panel === "friends" && <FriendsActivity />}
			{panel === "now-playing" && <NowPlayingPanel />}
		</aside>
	);
};

export default RightPanel;
