import { Disc3, ListMusic, Mic2, Users2 } from "lucide-react";
import { useMusicStore } from "@/stores/useMusicStore";
import StatsCard from "./StatsCard";

// Live counts from the database.
const DashboardStats = () => {
	const stats = useMusicStore((s) => s.stats);

	const items = [
		{ icon: ListMusic, label: "Songs", value: stats.totalSongs },
		{ icon: Disc3, label: "Albums", value: stats.totalAlbums },
		{ icon: Mic2, label: "Artists", value: stats.totalArtists },
		{ icon: Users2, label: "Registered users", value: stats.totalUsers },
	];

	return (
		<div className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
			{items.map((item) => (
				<StatsCard key={item.label} icon={item.icon} label={item.label} value={item.value.toLocaleString()} />
			))}
		</div>
	);
};

export default DashboardStats;
