import { useEffect } from "react";
import { Link } from "react-router-dom";
import { SignInButton, useAuth } from "@clerk/clerk-react";
import { Disc3, Music, ShieldAlert } from "lucide-react";
import useAuthStore from "@/stores/useAuthStore";
import { useMusicStore } from "@/stores/useMusicStore";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import EmptyState from "@/components/EmptyState";
import PageLoader from "@/layout/components/PageLoader";
import Header from "./components/Header";
import DashboardStats from "./components/DashboardStats";
import SongsTabContent from "./components/SongsTabContent";
import AlbumsTabContent from "./components/AlbumsTabContent";

const AdminDashboard = () => {
	const fetchAlbums = useMusicStore((s) => s.fetchAlbums);
	const fetchSongs = useMusicStore((s) => s.fetchSongs);
	const fetchStats = useMusicStore((s) => s.fetchStats);

	useEffect(() => {
		fetchAlbums();
		fetchSongs();
		fetchStats();
	}, [fetchAlbums, fetchSongs, fetchStats]);

	return (
		<>
			<DashboardStats />
			<Tabs defaultValue="songs" className="space-y-6">
				<TabsList className="bg-surface-raised p-1">
					<TabsTrigger value="songs" className="gap-2 data-[state=active]:bg-surface-hover data-[state=active]:text-white">
						<Music className="size-4" />
						Songs
					</TabsTrigger>
					<TabsTrigger value="albums" className="gap-2 data-[state=active]:bg-surface-hover data-[state=active]:text-white">
						<Disc3 className="size-4" />
						Albums
					</TabsTrigger>
				</TabsList>
				<TabsContent value="songs">
					<SongsTabContent />
				</TabsContent>
				<TabsContent value="albums">
					<AlbumsTabContent />
				</TabsContent>
			</Tabs>
		</>
	);
};

const AdminPage = () => {
	useDocumentTitle("Dashboard");
	const { isLoaded, isSignedIn } = useAuth();
	const isAdmin = useAuthStore((s) => s.isAdmin);
	const adminChecked = useAuthStore((s) => s.adminChecked);

	let body: React.ReactNode;
	if (!isLoaded || (isSignedIn && !adminChecked)) {
		body = (
			<div className="h-[60vh]">
				<PageLoader />
			</div>
		);
	} else if (!isSignedIn) {
		body = (
			<EmptyState
				icon={ShieldAlert}
				title="Log in to continue"
				description="The dashboard is only available to administrators."
				action={
					<SignInButton mode="modal">
						<button type="button" className="h-10 rounded-full bg-white px-6 text-sm font-bold text-black">
							Log in
						</button>
					</SignInButton>
				}
			/>
		);
	} else if (!isAdmin) {
		body = (
			<EmptyState
				icon={ShieldAlert}
				title="You do not have access"
				description="Only the administrator account can manage the catalog."
				action={
					<Link to="/" className="inline-flex h-10 items-center rounded-full bg-white px-6 text-sm font-bold text-black">
						Back to Home
					</Link>
				}
			/>
		);
	} else {
		body = <AdminDashboard />;
	}

	return (
		<div className="h-dvh overflow-y-auto bg-[hsl(var(--surface))] pb-24 text-white">
			<div className="mx-auto max-w-7xl px-4 py-6 md:px-8">
				<Header />
				{body}
			</div>
		</div>
	);
};

export default AdminPage;
