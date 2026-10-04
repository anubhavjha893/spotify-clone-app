import { Link } from "react-router-dom";
import { site } from "@/config/site";
import LegalPage, { ContactLine, type LegalSection } from "./LegalPage";

const sections: LegalSection[] = [
	{
		id: "acceptance",
		title: "Accepting these terms",
		body: (
			<p>
				By using {site.name} you agree to these terms and to our{" "}
				<Link to="/privacy" className="text-white underline underline-offset-2">
					Privacy Policy
				</Link>
				. If you do not agree, do not use the service.
			</p>
		),
	},
	{
		id: "eligibility",
		title: "Who can use the service",
		body: (
			<p>
				You must be at least 13 years old, and old enough to agree to these terms where you live. If you are under the
				age of majority, a parent or guardian must agree to them for you.
			</p>
		),
	},
	{
		id: "account",
		title: "Your account",
		body: (
			<p>
				You are responsible for activity on your account and for keeping your sign in method secure. Tell us
				straight away if you think someone else has accessed your account.
			</p>
		),
	},
	{
		id: "acceptable-use",
		title: "Acceptable use",
		body: (
			<>
				<p>You agree not to:</p>
				<ul>
					<li>harass, threaten or send unwanted or illegal content to other listeners;</li>
					<li>send spam or automated messages;</li>
					<li>download, copy or redistribute music from the service unless its licence allows it;</li>
					<li>interfere with the service, probe it for weaknesses or try to access accounts that are not yours;</li>
					<li>scrape the service or use it to build a competing catalog.</li>
				</ul>
			</>
		),
	},
	{
		id: "content",
		title: "Music and other content",
		body: (
			<>
				<p>
					The catalog is managed by the administrator of this site, who is responsible for having the rights to every
					file that is uploaded. Demo tracks are example songs published by SoundHelix and demo artwork is supplied by
					Lorem Picsum.
				</p>
				<p>
					All content remains the property of its owners. You may stream it through the service for personal,
					non-commercial use only. If you believe content on {site.name} infringes your rights, <ContactLine /> with
					details and we will review it promptly.
				</p>
			</>
		),
	},
	{
		id: "messages",
		title: "Messages you send",
		body: (
			<p>
				You are responsible for the messages you send. We may remove messages or suspend accounts that break these
				terms.
			</p>
		),
	},
	{
		id: "availability",
		title: "Availability and changes",
		body: (
			<p>
				We may change, suspend or stop any part of the service at any time. The service is provided "as is" and "as
				available", without warranties of any kind, to the extent permitted by law.
			</p>
		),
	},
	{
		id: "liability",
		title: "Limitation of liability",
		body: (
			<p>
				To the extent permitted by law, {site.name} and its operator are not liable for indirect, incidental or
				consequential damages, or for loss of data, arising from your use of the service. Nothing in these terms limits
				liability that cannot be limited by law.
			</p>
		),
	},
	{
		id: "termination",
		title: "Ending your use",
		body: (
			<p>
				You can stop using {site.name} at any time. We may suspend or close accounts that break these terms. Sections
				that by their nature should survive termination will continue to apply.
			</p>
		),
	},
	{
		id: "changes",
		title: "Changes to these terms",
		body: (
			<p>
				We may update these terms. The date at the top of this page shows when they last changed. Continuing to use the
				service after a change means you accept the updated terms.
			</p>
		),
	},
	{
		id: "contact",
		title: "Contact",
		body: (
			<p>
				For questions about these terms, <ContactLine />.
			</p>
		),
	},
];

const TermsPage = () => (
	<LegalPage
		title="Terms and Conditions"
		intro={<p>These terms set out the rules for using {site.name}. Please read them carefully.</p>}
		sections={sections}
	/>
);

export default TermsPage;
