import { clerkClient, getAuth } from "@clerk/express";

export const protectedRoute = (req, res, next) => {
	const { userId } = getAuth(req);
	if (!userId) {
		return res.status(401).json({ message: "Unauthorized - you must be logged in" });
	}

	req.userId = userId;
	next();
};

export const isAdminUser = async (userId) => {
	const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
	if (!adminEmail) return false;

	const user = await clerkClient.users.getUser(userId);
	return user.emailAddresses.some(
		(email) =>
			email.emailAddress.toLowerCase() === adminEmail && email.verification?.status === "verified"
	);
};

export const requireAdmin = async (req, res, next) => {
	try {
		if (!(await isAdminUser(req.userId))) {
			return res.status(403).json({ message: "Forbidden - admin access required" });
		}

		next();
	} catch (error) {
		next(error);
	}
};
