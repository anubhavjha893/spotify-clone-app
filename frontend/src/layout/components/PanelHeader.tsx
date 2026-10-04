import { X } from "lucide-react";

interface PanelHeaderProps {
	title: string;
	onClose: () => void;
	children?: React.ReactNode;
}

const PanelHeader = ({ title, onClose, children }: PanelHeaderProps) => (
	<div className="flex h-14 shrink-0 items-center justify-between gap-2 px-4">
		<h2 className="truncate font-bold text-white">{title}</h2>
		<div className="flex items-center gap-1">
			{children}
			<button
				type="button"
				onClick={onClose}
				className="grid size-8 place-items-center rounded-full text-subdued transition hover:bg-white/10 hover:text-white"
				aria-label={`Close ${title.toLowerCase()} panel`}
				title="Close"
			>
				<X className="size-4" />
			</button>
		</div>
	</div>
);

export default PanelHeader;
