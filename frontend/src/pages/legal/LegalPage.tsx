import { Link } from "react-router-dom";
import { site } from "@/config/site";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import PageShell from "@/layout/components/PageShell";

export interface LegalSection {
	id: string;
	title: string;
	body: React.ReactNode;
}

interface LegalPageProps {
	title: string;
	intro: React.ReactNode;
	sections: LegalSection[];
}

export const ContactLine = () =>
	site.contactEmail ? (
		<>
			email us at{" "}
			<a href={`mailto:${site.contactEmail}`} className="text-white underline underline-offset-2">
				{site.contactEmail}
			</a>
		</>
	) : (
		<>use the contact details published by the operator of this site</>
	);

const LegalPage = ({ title, intro, sections }: LegalPageProps) => {
	useDocumentTitle(title);

	return (
		<PageShell>
			<article className="mx-auto max-w-3xl px-4 pb-8 pt-4 md:px-6">
				<p className="text-sm text-subdued">Last updated {site.legalUpdated}</p>
				<h1 className="mt-2 text-4xl font-extrabold tracking-tight text-white">{title}</h1>
				<div className="mt-4 space-y-4 leading-relaxed text-white/80">{intro}</div>

				<nav aria-label="On this page" className="mt-8 rounded-lg bg-surface-raised p-5">
					<p className="mb-2 text-sm font-bold text-white">On this page</p>
					<ol className="list-decimal space-y-1 pl-5 text-sm text-subdued marker:text-subdued">
						{sections.map((section) => (
							<li key={section.id}>
								<a href={`#${section.id}`} className="hover:text-white hover:underline">
									{section.title}
								</a>
							</li>
						))}
					</ol>
				</nav>

				{sections.map((section, index) => (
					<section key={section.id} id={section.id} className="mt-10 scroll-mt-20">
						<h2 className="text-xl font-bold text-white">
							{index + 1}. {section.title}
						</h2>
						<div className="mt-3 space-y-3 leading-relaxed text-white/80 [&_li]:mt-1.5 [&_ul]:list-disc [&_ul]:pl-5">
							{section.body}
						</div>
					</section>
				))}

				<p className="mt-12 text-sm text-subdued">
					See also our{" "}
					{title === "Privacy Policy" ? (
						<Link to="/terms" className="text-white underline underline-offset-2">
							Terms and Conditions
						</Link>
					) : (
						<Link to="/privacy" className="text-white underline underline-offset-2">
							Privacy Policy
						</Link>
					)}
					.
				</p>
			</article>
		</PageShell>
	);
};

export default LegalPage;
