import { SignInButton, SignUpButton } from "@clerk/clerk-react";

// Opens Clerk's sign in modal, which offers every provider enabled in the Clerk dashboard.
const SignInOAuthButtons = () => (
	<div className="flex items-center gap-2">
		<SignUpButton mode="modal">
			<button
				type="button"
				className="hidden h-10 rounded-full px-4 text-sm font-bold text-subdued transition hover:scale-[1.03] hover:text-white sm:block"
			>
				Sign up
			</button>
		</SignUpButton>
		<SignInButton mode="modal">
			<button
				type="button"
				className="h-10 rounded-full bg-white px-6 text-sm font-bold text-black transition hover:scale-[1.03] hover:bg-white/90"
			>
				Log in
			</button>
		</SignInButton>
	</div>
);

export default SignInOAuthButtons;
