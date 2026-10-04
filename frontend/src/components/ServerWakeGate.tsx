import { useEffect, useState } from "react";
import { API_ORIGIN } from "@/lib/axios";
import { useServerWake } from "@/hooks/useServerWake";
import { cn } from "@/lib/utils";
import { LogoMark } from "./Logo";

const RING_RADIUS = 35;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;
// The ring fills over roughly this long, then keeps pace with the server instead of
// sitting stuck at full while a slower-than-usual wake-up continues in the background.
const RING_DURATION_MS = 50_000;
const LONG_WAIT_MS = 60_000;

const formatSeconds = (ms: number) => `${Math.floor(ms / 1000)}s`;

// Render's free tier sleeps the backend after a period of inactivity; the first visit
// afterwards can take up to about a minute to respond while it restarts. This gate holds
// the whole app behind a splash until a real response comes back from the API, so nobody
// ever sees a half-loaded page or a wall of failed requests while the server wakes up.
// A warm server answers inside the grace period and nothing is shown at all.
const ServerWakeGate = ({ children }: { children: React.ReactNode }) => {
	const { status, elapsedMs } = useServerWake(API_ORIGIN);
	const [settling, setSettling] = useState(false);

	// Once awake, hold the "ready" moment on screen briefly rather than cutting straight
	// to the app, but only when the splash was actually visible for a moment first.
	useEffect(() => {
		if (status !== "awake" || elapsedMs <= 1500) return;
		setSettling(true);
		const timer = window.setTimeout(() => setSettling(false), 850);
		return () => window.clearTimeout(timer);
	}, [status, elapsedMs]);

	if (status === "checking") return null;
	if (status === "awake" && !settling) return <>{children}</>;

	const progress = settling ? 1 : Math.min(elapsedMs / RING_DURATION_MS, 1);
	const longWait = elapsedMs > LONG_WAIT_MS;

	return (
		<div className="fixed inset-0 z-[100] grid place-items-center overflow-hidden bg-black px-6">
			<div
				className="pointer-events-none absolute left-1/2 top-1/2 size-[640px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-25 blur-[120px]"
				style={{ background: "radial-gradient(circle, hsl(var(--primary)) 0%, transparent 70%)" }}
				aria-hidden="true"
			/>

			<div className="relative flex w-full max-w-sm flex-col items-center text-center">
				<div className="relative mb-8 grid size-20 place-items-center">
					<svg className="absolute inset-0 size-full -rotate-90" viewBox="0 0 80 80" aria-hidden="true">
						<circle cx="40" cy="40" r={RING_RADIUS} fill="none" stroke="rgb(255 255 255 / 0.1)" strokeWidth="4" />
						<circle
							cx="40"
							cy="40"
							r={RING_RADIUS}
							fill="none"
							stroke="hsl(var(--primary))"
							strokeWidth="4"
							strokeLinecap="round"
							strokeDasharray={RING_CIRCUMFERENCE}
							strokeDashoffset={RING_CIRCUMFERENCE * (1 - progress)}
							className="transition-[stroke-dashoffset] duration-300 ease-linear"
						/>
					</svg>
					<LogoMark className={cn("size-9 transition-transform duration-500", settling ? "scale-110" : "animate-pulse")} />
				</div>

				<div aria-hidden="true" className={cn("mb-5 flex h-6 items-end justify-center gap-1.5", settling && "eq-paused")}>
					{[0, 1, 2, 3, 4].map((i) => (
						<span
							key={i}
							className="eq-bar w-1.5 rounded-sm bg-primary"
							style={{ height: "100%", animationDelay: `${i * -140}ms` }}
						/>
					))}
				</div>

				<h1 className="text-xl font-bold text-white">{settling ? "Ready" : "Waking up the server"}</h1>
				<p className="mt-2 text-sm text-subdued" role="status" aria-live="polite">
					{settling
						? "Taking you in..."
						: longWait
							? `Still starting, ${formatSeconds(elapsedMs)} in. This is taking longer than usual, but it should finish soon.`
							: "The free server was asleep and is starting back up. This usually takes under a minute."}
				</p>

				{!settling && <p className="mt-6 text-xs tabular-nums text-subdued/70">{formatSeconds(elapsedMs)} elapsed</p>}
			</div>
		</div>
	);
};

export default ServerWakeGate;
