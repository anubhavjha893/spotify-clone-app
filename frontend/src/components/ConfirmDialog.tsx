import { useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";

interface ConfirmDialogProps {
	trigger: React.ReactNode;
	title: string;
	description: string;
	confirmLabel: string;
	onConfirm: () => Promise<void>;
}

const ConfirmDialog = ({ trigger, title, description, confirmLabel, onConfirm }: ConfirmDialogProps) => {
	const [open, setOpen] = useState(false);
	const [busy, setBusy] = useState(false);

	const handleConfirm = async () => {
		setBusy(true);
		try {
			await onConfirm();
			setOpen(false);
		} finally {
			setBusy(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={(next) => !busy && setOpen(next)}>
			<DialogTrigger asChild>{trigger}</DialogTrigger>
			<DialogContent className="max-w-sm">
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
					<DialogDescription>{description}</DialogDescription>
				</DialogHeader>
				<DialogFooter className="gap-2">
					<Button variant="ghost" onClick={() => setOpen(false)} disabled={busy}>
						Cancel
					</Button>
					<Button variant="destructive" onClick={handleConfirm} disabled={busy}>
						{busy ? "Deleting..." : confirmLabel}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default ConfirmDialog;
