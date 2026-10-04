import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
	plugins: [react()],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
	server: {
		port: 3000,
	},
	build: {
		rollupOptions: {
			output: {
				// Separate long-lived vendor chunks so app updates do not invalidate them in the browser cache.
				manualChunks: {
					react: ["react", "react-dom", "react-router-dom"],
					clerk: ["@clerk/clerk-react", "@clerk/themes"],
					radix: [
						"@radix-ui/react-avatar",
						"@radix-ui/react-dialog",
						"@radix-ui/react-scroll-area",
						"@radix-ui/react-select",
						"@radix-ui/react-slider",
						"@radix-ui/react-slot",
						"@radix-ui/react-tabs",
					],
					realtime: ["socket.io-client", "axios", "zustand"],
				},
			},
		},
	},
});
