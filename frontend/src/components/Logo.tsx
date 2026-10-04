import { cn } from "@/lib/utils";
import { site } from "@/config/site";

export const LogoMark = ({ className }: { className?: string }) => (
	<svg viewBox="0 0 64 64" aria-hidden="true" className={cn("size-8 shrink-0", className)}>
		<rect width="64" height="64" rx="16" fill="hsl(var(--primary))" />
		<rect x="14" y="26" width="7" height="22" rx="3.5" fill="#0b0b0b" />
		<rect x="25" y="16" width="7" height="32" rx="3.5" fill="#0b0b0b" />
		<rect x="36" y="22" width="7" height="26" rx="3.5" fill="#0b0b0b" />
		<rect x="47" y="32" width="5" height="16" rx="2.5" fill="#0b0b0b" />
	</svg>
);

const Logo = ({ className, compact = false }: { className?: string; compact?: boolean }) => (
	<span className={cn("inline-flex items-center gap-2 text-white", className)}>
		<LogoMark />
		{!compact && (
			// Display font for the wordmark only.
			<span className="font-[Syne,Figtree,sans-serif] text-[22px] font-extrabold uppercase leading-none tracking-[0.04em]">
				{site.name}
			</span>
		)}
	</span>
);

export default Logo;
