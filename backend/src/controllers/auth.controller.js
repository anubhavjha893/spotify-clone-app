import { clerkClient } from "@clerk/express";
import { User } from "../models/user.model.js";

// Creates or refreshes the local profile for the signed in Clerk user.
// Profile data is read from Clerk directly so a client cannot write someone else's record.
export const syncUser = async (req, res, next) => {
	try {
		const clerkUser = await clerkClient.users.getUser(req.userId);

		const emailName = clerkUser.primaryEmailAddress?.emailAddress.split("@")[0];
		const fullName =
			[clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ").trim() ||
			clerkUser.username ||
			emailName ||
			"Listener";

		const user = await User.findOneAndUpdate(
			{ clerkId: clerkUser.id },
			{ $set: { fullName, imageUrl: clerkUser.imageUrl } },
			{ upsert: true, new: true, setDefaultsOnInsert: true, projection: { __v: 0 } }
		);

		res.status(200).json(user);
	} catch (error) {
		next(error);
	}
};
