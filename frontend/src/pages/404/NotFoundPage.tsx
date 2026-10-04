import { Link, useNavigate } from "react-router-dom";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { LogoMark } from "@/components/Logo";
import PageShell from "@/layout/components/PageShell";

export default function NotFoundPage() {
	const navigate = useNavigate();
	useDocumentTitle("Page not found");

	return (
		<PageShell>
			<div className="flex flex-col items-center px-6 py-20 text-center">
				<LogoMark className="mb-8 size-14" />
				<h1 className="text-4xl font-extrabold tracking-tight text-white">Page not found</h1>
				<p className="mt-3 max-w-md text-subdued">
					We could not find the page you were looking for. Check the address, or head back to Home.
				</p>
				<div className="mt-8 flex flex-col gap-3 sm:flex-row">
					<Link to="/" className="inline-flex h-12 items-center justify-center rounded-full bg-white px-8 font-bold text-black transition hover:scale-[1.03]">
						Home
					</Link>
					<button
						type="button"
						onClick={() => navigate(-1)}
						className="h-12 rounded-full border border-white/30 px-8 font-bold text-white transition hover:border-white hover:scale-[1.03]"
					>
						Go back
					</button>
				</div>
			</div>
		</PageShell>
	);
}
