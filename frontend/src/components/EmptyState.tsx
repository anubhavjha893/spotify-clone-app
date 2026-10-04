import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
	icon: LucideIcon;
	title: string;
	description?: string;
	action?: React.ReactNode;
	className?: string;
}

const EmptyState = ({ icon: Icon, title, description, action, className }: EmptyStateProps) => (
	<div className={cn("flex flex-col items-center justify-center px-6 py-16 text-center", className)}>
		<div className="mb-4 grid size-16 place-items-center rounded-full bg-surface-hover text-subdued">
			<Icon className="size-7" />
		</div>
		<h3 className="text-xl font-bold text-white">{title}</h3>
		{description && <p className="mt-2 max-w-sm text-sm text-subdued">{description}</p>}
		{action && <div className="mt-6">{action}</div>}
	</div>
);

export default EmptyState;
