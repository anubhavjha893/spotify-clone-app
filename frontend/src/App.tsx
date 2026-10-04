import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import { AuthenticateWithRedirectCallback } from "@clerk/clerk-react";
import { Toaster } from "react-hot-toast";
import MainLayout from "./layout/MainLayout";
import AudioEngine from "./layout/components/AudioEngine";
import PageLoader from "./layout/components/PageLoader";
import HomePage from "./pages/home/HomePage";
import { useIsDesktop } from "./hooks/useMediaQuery";

// Home loads with the shell; every other page is split into its own chunk.
const AlbumPage = lazy(() => import("./pages/album/AlbumPage"));
const SearchPage = lazy(() => import("./pages/search/SearchPage"));
const LibraryPage = lazy(() => import("./pages/library/LibraryPage"));
const LikedSongsPage = lazy(() => import("./pages/liked/LikedSongsPage"));
const ChatPage = lazy(() => import("./pages/chat/ChatPage"));
const AdminPage = lazy(() => import("./pages/admin/AdminPage"));
const ArtistPage = lazy(() => import("./pages/artist/ArtistPage"));
const GenrePage = lazy(() => import("./pages/genre/GenrePage"));
const PrivacyPage = lazy(() => import("./pages/legal/PrivacyPage"));
const TermsPage = lazy(() => import("./pages/legal/TermsPage"));
const AuthCallbackPage = lazy(() => import("./pages/auth-callback/AuthCallbackPage"));
const NotFoundPage = lazy(() => import("./pages/404/NotFoundPage"));

function App() {
	const isDesktop = useIsDesktop();

	return (
		<>
			{/* Lives outside the routes so music keeps playing across every page */}
			<AudioEngine />

			<Suspense
				fallback={
					<div className="h-dvh bg-black">
						<PageLoader />
					</div>
				}
			>
				<Routes>
					<Route
						path="/sso-callback"
						element={<AuthenticateWithRedirectCallback signUpForceRedirectUrl="/auth-callback" />}
					/>
					<Route path="/auth-callback" element={<AuthCallbackPage />} />
					<Route path="/admin" element={<AdminPage />} />

					<Route element={<MainLayout />}>
						<Route path="/" element={<HomePage />} />
						<Route path="/search" element={<SearchPage />} />
						<Route path="/library" element={<LibraryPage />} />
						<Route path="/liked" element={<LikedSongsPage />} />
						<Route path="/chat" element={<ChatPage />} />
						<Route path="/albums/:albumId" element={<AlbumPage />} />
						<Route path="/artist/:name" element={<ArtistPage />} />
						<Route path="/genre/:name" element={<GenrePage />} />
						<Route path="/privacy" element={<PrivacyPage />} />
						<Route path="/terms" element={<TermsPage />} />
						<Route path="*" element={<NotFoundPage />} />
					</Route>
				</Routes>
			</Suspense>

			{/* Toasts sit above the player bar on desktop and above the mini player and tab bar on phones */}
			<Toaster
				position="bottom-center"
				containerStyle={{ bottom: isDesktop ? 96 : 150 }}
				toastOptions={{
					duration: 3000,
					style: {
						background: "hsl(0 0% 100%)",
						color: "#000",
						fontWeight: 600,
						fontSize: 14,
						borderRadius: 8,
						padding: "10px 16px",
					},
				}}
			/>
		</>
	);
}

export default App;
