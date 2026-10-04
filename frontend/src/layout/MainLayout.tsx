import { Suspense, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/Resizable";
import ShortcutsDialog from "@/components/ShortcutsDialog";
import { useIsDesktop } from "@/hooks/useMediaQuery";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useMusicStore } from "@/stores/useMusicStore";
import { useUIStore } from "@/stores/useUIStore";
import BottomNav from "./components/BottomNav";
import FullscreenPlayer from "./components/FullscreenPlayer";
import LeftSidebar from "./components/LeftSidebar";
import MiniPlayer from "./components/MiniPlayer";
import PlayerBar from "./components/PlayerBar";
import RightPanel from "./components/RightPanel";
import PageLoader from "./components/PageLoader";

const handleClass = "w-2 bg-transparent transition-colors hover:bg-white/20 data-[resize-handle-state=drag]:bg-white/30";

const MainLayout = () => {
	const isDesktop = useIsDesktop();
	const { isSignedIn } = useAuth();
	const rightPanel = useUIStore((s) => s.rightPanel);
	const fetchAlbums = useMusicStore((s) => s.fetchAlbums);
	useKeyboardShortcuts(!!isSignedIn);

	// Albums feed the sidebar, home, search and library on every screen size.
	useEffect(() => {
		fetchAlbums();
	}, [fetchAlbums]);

	const content = (
		<main id="main" className="surface relative h-full overflow-hidden md:rounded-lg">
			<Suspense fallback={<PageLoader />}>
				<Outlet />
			</Suspense>
		</main>
	);

	return (
		<div className="flex h-dvh flex-col bg-black text-white">
			<a
				href="#main"
				className="sr-only z-50 rounded bg-white px-4 py-2 font-semibold text-black focus:not-sr-only focus:absolute focus:left-4 focus:top-4"
			>
				Skip to content
			</a>

			{isDesktop ? (
				<>
					<ResizablePanelGroup direction="horizontal" autoSaveId="encore-layout" className="min-h-0 flex-1 p-2 pb-0">
						<ResizablePanel id="left" order={1} defaultSize={22} minSize={7} maxSize={32}>
							<LeftSidebar />
						</ResizablePanel>
						<ResizableHandle className={handleClass} />
						<ResizablePanel id="main" order={2} defaultSize={rightPanel ? 56 : 78} minSize={35}>
							{content}
						</ResizablePanel>
						{rightPanel && (
							<>
								<ResizableHandle className={handleClass} />
								<ResizablePanel id="right" order={3} defaultSize={22} minSize={16} maxSize={30}>
									<RightPanel />
								</ResizablePanel>
							</>
						)}
					</ResizablePanelGroup>
					<PlayerBar />
				</>
			) : (
				<>
					<div className="min-h-0 flex-1">{content}</div>
					<div className="absolute inset-x-0 bottom-0 z-30">
						<MiniPlayer />
						<BottomNav />
					</div>
				</>
			)}

			<FullscreenPlayer />
			<ShortcutsDialog />
		</div>
	);
};

export default MainLayout;
