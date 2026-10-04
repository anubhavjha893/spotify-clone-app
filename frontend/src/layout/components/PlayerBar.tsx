import { Link } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { Maximize2, MonitorPlay, ListMusic, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import Artwork from "@/components/Artwork";
import LikeButton from "@/components/LikeButton";
import ArtistLink from "@/components/ArtistLink";
import usePlayerStore from "@/stores/usePlayerStore";
import { useUIStore, type RightPanel } from "@/stores/useUIStore";
import ProgressBar from "./ProgressBar";
import TransportControls from "./TransportControls";
import VolumeControl from "./VolumeControl";

const PanelToggle = ({
	panel,
	label,
	icon: Icon,
}: {
	panel: Exclude<RightPanel, null>;
	label: string;
	icon: typeof ListMusic;
}) => {
	const active = useUIStore((s) => s.rightPanel === panel);
	const toggle = useUIStore((s) => s.toggleRightPanel);

	return (
		<button
			type="button"
			onClick={() => toggle(panel)}
			aria-pressed={active}
			aria-label={label}
			title={label}
			className={cn(
				"relative grid size-8 place-items-center rounded-full transition-colors [&_svg]:size-4",
				active ? "text-primary" : "text-subdued hover:text-white"
			)}
		>
			<Icon />
			{active && <span className="absolute -bottom-0.5 size-1 rounded-full bg-primary" aria-hidden="true" />}
		</button>
	);
};

const PlayerBar = () => {
	const currentSong = usePlayerStore((s) => s.currentSong);
	const setFullscreenOpen = useUIStore((s) => s.setFullscreenOpen);
	const { isSignedIn } = useAuth();

	return (
		<footer className="grid h-[72px] grid-cols-[minmax(180px,1fr)_minmax(0,2fr)_minmax(180px,1fr)] items-center gap-4 px-2">
			<div className="flex min-w-0 items-center gap-3">
				{currentSong && (
					<>
						<button
							type="button"
							onClick={() => setFullscreenOpen(true)}
							className="group relative shrink-0"
							aria-label="Open full screen player"
						>
							<Artwork src={currentSong.imageUrl} alt="" className="size-14" size={64} rounded="sm" />
							<span className="absolute inset-0 grid place-items-center rounded bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
								<Maximize2 className="size-4" />
							</span>
						</button>
						<div className="min-w-0">
							{currentSong.albumId ? (
								<Link
									to={`/albums/${currentSong.albumId}`}
									className="block truncate text-sm font-medium text-white hover:underline"
								>
									{currentSong.title}
								</Link>
							) : (
								<p className="truncate text-sm font-medium text-white">{currentSong.title}</p>
							)}
							<p className="truncate text-xs text-subdued">
								<ArtistLink name={currentSong.artist} />
							</p>
						</div>
						<LikeButton song={currentSong} />
					</>
				)}
			</div>

			<div className="flex flex-col items-center gap-1">
				<TransportControls />
				<ProgressBar className="max-w-[720px]" />
			</div>

			<div className="flex items-center justify-end gap-1">
				<PanelToggle panel="now-playing" label="Now playing view" icon={MonitorPlay} />
				<PanelToggle panel="queue" label="Queue" icon={ListMusic} />
				{isSignedIn && <PanelToggle panel="friends" label="Friend activity" icon={Users} />}
				<VolumeControl />
				<button
					type="button"
					onClick={() => setFullscreenOpen(true)}
					disabled={!currentSong}
					className="grid size-8 place-items-center text-subdued transition-colors hover:text-white disabled:opacity-40"
					aria-label="Full screen"
					title="Full screen"
				>
					<Maximize2 className="size-4" />
				</button>
			</div>
		</footer>
	);
};

export default PlayerBar;
