// Comma separated list, e.g. "https://example.com,https://www.example.com"
export const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:3000")
	.split(",")
	.map((origin) => origin.trim())
	.filter(Boolean);
