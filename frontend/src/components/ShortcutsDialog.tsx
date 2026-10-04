import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/Dialog";
import { SHORTCUTS } from "@/hooks/useKeyboardShortcuts";
import { useUIStore } from "@/stores/useUIStore";

const ShortcutsDialog = () => {
	const open = useUIStore((s) => s.shortcutsOpen);
	const setOpen = useUIStore((s) => s.setShortcutsOpen);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogContent className="max-w-md">
				<DialogHeader>
					<DialogTitle>Keyboard shortcuts</DialogTitle>
					<DialogDescription>Shortcuts work anywhere except while typing.</DialogDescription>
				</DialogHeader>
				<dl className="divide-y divide-white/10">
					{SHORTCUTS.map((shortcut) => (
						<div key={shortcut.label} className="flex items-center justify-between gap-4 py-2.5 text-sm">
							<dt className="text-subdued">{shortcut.label}</dt>
							<dd className="flex shrink-0 gap-1">
								{shortcut.keys.map((key) => (
									<kbd
										key={key}
										className="min-w-7 rounded border border-white/15 bg-white/5 px-1.5 py-0.5 text-center font-sans text-xs font-semibold text-white"
									>
										{key}
									</kbd>
								))}
							</dd>
						</div>
					))}
				</dl>
			</DialogContent>
		</Dialog>
	);
};

export default ShortcutsDialog;
