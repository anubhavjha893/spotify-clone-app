// Single place for brand and legal details. Update these before launch.
export const site = {
	name: "LOOMA",
	// Public URL of the production site, e.g. https://looma.example.com
	url: import.meta.env.VITE_SITE_URL || "",
	// Address shown on the privacy policy and terms pages for user requests.
	contactEmail: import.meta.env.VITE_CONTACT_EMAIL || "",
	// Date the current versions of the privacy policy and terms took effect.
	legalUpdated: "October 4, 2026",
} as const;
