import { useEffect, useState } from "react";

export type WakeStatus = "checking" | "waking" | "awake";

const HEALTH_PATH = "/api/health";
// Below this, a cold server and a normal request look the same, so nothing is shown.
// A warm server answers well inside this window.
const GRACE_MS = 900;
// How long a single attempt waits before being treated as failed and retried.
const ATTEMPT_TIMEOUT_MS = 10_000;
const RETRY_DELAY_MS = 700;
// Give up waiting and let the app's own loading and error states take over, rather
// than blocking the page forever if the backend is actually down, not just asleep.
const MAX_WAIT_MS = 75_000;

// Polls the API's health endpoint until it answers. Render's free tier puts an inactive
// backend to sleep, and the first request after that can take up to about a minute while
// it restarts; this is what the splash screen in ServerWakeGate waits on.
export const useServerWake = (apiOrigin: string) => {
	const [status, setStatus] = useState<WakeStatus>("checking");
	const [elapsedMs, setElapsedMs] = useState(0);

	useEffect(() => {
		let cancelled = false;
		const start = performance.now();

		const finish = () => {
			if (cancelled) return;
			cancelled = true;
			window.clearTimeout(graceTimer);
			window.clearInterval(tick);
			setStatus("awake");
		};

		const graceTimer = window.setTimeout(() => {
			if (!cancelled) setStatus((s) => (s === "checking" ? "waking" : s));
		}, GRACE_MS);

		const tick = window.setInterval(() => {
			if (cancelled) return;
			const elapsed = performance.now() - start;
			setElapsedMs(elapsed);
			if (elapsed >= MAX_WAIT_MS) finish();
		}, 250);

		const poll = async () => {
			while (!cancelled) {
				const controller = new AbortController();
				const abortTimer = window.setTimeout(() => controller.abort(), ATTEMPT_TIMEOUT_MS);
				try {
					const response = await fetch(`${apiOrigin}${HEALTH_PATH}`, {
						signal: controller.signal,
						cache: "no-store",
					});
					window.clearTimeout(abortTimer);
					if (response.ok) return finish();
				} catch {
					window.clearTimeout(abortTimer);
					// Network error, abort, or a 502/503 while the container is still starting: retry.
				}
				if (cancelled) return;
				await new Promise((resolve) => window.setTimeout(resolve, RETRY_DELAY_MS));
			}
		};

		poll();

		return () => {
			cancelled = true;
			window.clearTimeout(graceTimer);
			window.clearInterval(tick);
		};
	}, [apiOrigin]);

	return { status, elapsedMs };
};
