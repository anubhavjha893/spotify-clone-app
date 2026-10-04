import axios, { AxiosError } from "axios";

// The frontend (Vercel) and backend (Render) are deployed separately, so the backend's
// URL must be given explicitly via VITE_API_URL in production. Locally both run on their
// default ports, so talking to localhost:5000 just works without any extra setup.
export const API_ORIGIN = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "http://localhost:5000" : "");

export const axiosInstance = axios.create({
	baseURL: `${API_ORIGIN}/api`,
});

type TokenGetter = () => Promise<string | null>;
let getToken: TokenGetter | null = null;

// Clerk session tokens are short lived, so a fresh one is attached to every request
// instead of storing a single token when the app loads.
export const setTokenGetter = (getter: TokenGetter | null) => {
	getToken = getter;
};

export const getSessionToken = async () => {
	try {
		return getToken ? await getToken() : null;
	} catch {
		return null;
	}
};

axiosInstance.interceptors.request.use(async (config) => {
	const token = await getSessionToken();
	if (token) config.headers.Authorization = `Bearer ${token}`;
	return config;
});

export const getErrorMessage = (error: unknown, fallback = "Something went wrong") => {
	if (error instanceof AxiosError) {
		return (error.response?.data as { message?: string } | undefined)?.message || error.message || fallback;
	}
	if (error instanceof Error) return error.message;
	return fallback;
};
