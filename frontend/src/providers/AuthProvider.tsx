import { useEffect, useRef } from "react";
import { useAuth } from "@clerk/clerk-react";
import { axiosInstance, setTokenGetter } from "@/lib/axios";
import useAuthStore from "@/stores/useAuthStore";
import useChatStore from "@/stores/useChatStore";
import { useLibraryStore } from "@/stores/useLibraryStore";

// Keeps API auth, the realtime connection and per-user data in step with the Clerk session.
const AuthProvider = ({ children }: { children: React.ReactNode }) => {
	const { isLoaded, isSignedIn, userId, getToken } = useAuth();
	const syncedFor = useRef<string | null>(null);

	// Registered during render so requests made by children on first mount are authenticated.
	setTokenGetter(isSignedIn ? () => getToken() : null);

	useEffect(() => {
		if (!isLoaded) return;

		if (!isSignedIn || !userId) {
			syncedFor.current = null;
			useAuthStore.getState().reset();
			useLibraryStore.getState().resetLikes();
			useChatStore.getState().disconnectSocket();
			return;
		}

		if (syncedFor.current === userId) return;
		syncedFor.current = userId;

		const init = async () => {
			try {
				// Make sure the local profile exists before anything depends on it.
				await axiosInstance.post("/auth/callback");
			} catch (error) {
				console.error("Could not sync profile", error);
			}
			useAuthStore.getState().checkAdminStatus();
			useLibraryStore.getState().fetchLikes();
			useChatStore.getState().initSocket(userId);
		};
		init();
	}, [isLoaded, isSignedIn, userId]);

	useEffect(() => () => useChatStore.getState().disconnectSocket(), []);

	return <>{children}</>;
};

export default AuthProvider;
