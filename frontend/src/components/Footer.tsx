import { Link } from "react-router-dom";
import { site } from "@/config/site";

const Footer = () => (
	<footer className="mt-10 border-t border-white/10 px-4 pb-10 pt-8 text-sm text-subdued md:px-6">
		<nav aria-label="Legal" className="flex flex-wrap gap-x-6 gap-y-2">
			<Link to="/privacy" className="hover:text-white hover:underline">
				Privacy Policy
			</Link>
			<Link to="/terms" className="hover:text-white hover:underline">
				Terms and Conditions
			</Link>
			{site.contactEmail && (
				<a href={`mailto:${site.contactEmail}`} className="hover:text-white hover:underline">
					Contact
				</a>
			)}
		</nav>
		<p className="mt-4">
			&copy; {new Date().getFullYear()} {site.name}
		</p>
	</footer>
);

export default Footer;
