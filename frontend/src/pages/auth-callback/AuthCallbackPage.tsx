import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import PageLoader from "@/layout/components/PageLoader";

// Landing route after an OAuth redirect. The profile itself is synced by AuthProvider
// whenever a session starts, so this page only waits for Clerk and moves on.
const AuthCallbackPage = () => {
	const { isLoaded } = useAuth();
	const navigate = useNavigate();

	useEffect(() => {
		if (isLoaded) navigate("/", { replace: true });
	}, [isLoaded, navigate]);

	return (
		<div className="h-dvh bg-black">
			<PageLoader />
		</div>
	);
};

export default AuthCallbackPage;
