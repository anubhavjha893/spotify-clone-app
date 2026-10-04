/// <reference types="vite/client" />

interface ImportMetaEnv {
	readonly VITE_CLERK_PUBLISHABLE_KEY: string;
	// Base URL of the deployed backend, e.g. https://looma-api.onrender.com (no trailing slash).
	readonly VITE_API_URL?: string;
	readonly VITE_SITE_URL?: string;
	readonly VITE_CONTACT_EMAIL?: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
