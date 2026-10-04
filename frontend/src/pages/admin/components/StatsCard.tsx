import type { LucideIcon } from "lucide-react";

type StatsCardProps = {
	icon: LucideIcon;
	label: string;
	value: string;
};

const StatsCard = ({ icon: Icon, label, value }: StatsCardProps) => (
	<div className="rounded-lg bg-surface-raised p-5">
		<div className="flex items-center gap-2 text-sm text-subdued">
			<Icon className="size-4" />
			{label}
		</div>
		<p className="mt-2 text-3xl font-bold tabular-nums text-white">{value}</p>
	</div>
);

export default StatsCard;
