import { Link } from "react-router-dom";
import { SignedIn, UserButton } from "@clerk/clerk-react";
import { ArrowLeft } from "lucide-react";
import Logo from "@/components/Logo";

const Header = () => (
	<header className="mb-8 flex flex-wrap items-center justify-between gap-4">
		<div className="flex items-center gap-4">
			<Link to="/" aria-label="Back to the app">
				<Logo />
			</Link>
			<span className="h-6 w-px bg-white/15" aria-hidden="true" />
			<div>
				<h1 className="text-xl font-bold">Catalog dashboard</h1>
				<p className="text-sm text-subdued">Add and remove songs and albums</p>
			</div>
		</div>
		<div className="flex items-center gap-3">
			<Link
				to="/"
				className="inline-flex h-9 items-center gap-2 rounded-full bg-white/10 px-4 text-sm font-semibold transition hover:bg-white/20"
			>
				<ArrowLeft className="size-4" />
				Back to app
			</Link>
			<SignedIn>
				<UserButton />
			</SignedIn>
		</div>
	</header>
);

export default Header;
