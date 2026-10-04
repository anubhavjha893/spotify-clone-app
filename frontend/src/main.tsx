import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ClerkProvider } from "@clerk/clerk-react";
import { dark } from "@clerk/themes";
import "./index.css";
import App from "./App.tsx";
import AuthProvider from "./providers/AuthProvider.tsx";
import ServerWakeGate from "./components/ServerWakeGate.tsx";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
	throw new Error("VITE_CLERK_PUBLISHABLE_KEY is not set. Add it to frontend/.env");
}

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<ClerkProvider
			publishableKey={PUBLISHABLE_KEY}
			afterSignOutUrl="/"
			appearance={{
				baseTheme: dark,
				variables: {
					colorPrimary: "#1ed760",
					colorTextOnPrimaryBackground: "#000000",
					fontFamily: "Figtree, system-ui, sans-serif",
					borderRadius: "0.5rem",
				},
			}}
		>
			<BrowserRouter>
				<ServerWakeGate>
					<AuthProvider>
						<App />
					</AuthProvider>
				</ServerWakeGate>
			</BrowserRouter>
		</ClerkProvider>
	</StrictMode>
);
