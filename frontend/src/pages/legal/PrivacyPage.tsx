import { site } from "@/config/site";
import LegalPage, { ContactLine, type LegalSection } from "./LegalPage";

const sections: LegalSection[] = [
	{
		id: "information-we-collect",
		title: "Information we collect",
		body: (
			<>
				<p>
					<strong className="text-white">Account details.</strong> Sign in is handled by Clerk. When you create an
					account, Clerk processes your name, email address, profile picture and, if you sign in with a provider such as
					Google, the identifiers that provider shares. We store a copy of your display name, profile picture link and
					Clerk user ID in our database to show your profile to other listeners.
				</p>
				<p>
					<strong className="text-white">Library.</strong> The songs you save to Liked Songs are stored with your
					profile.
				</p>
				<p>
					<strong className="text-white">Messages.</strong> When you message another listener we store the message
					text, the sender, the recipient and the time it was sent.
				</p>
				<p>
					<strong className="text-white">Listening activity.</strong> While you are signed in and connected, the song
					you are playing is shared in real time with other signed in listeners. This status is kept in server memory
					only and is cleared when you disconnect.
				</p>
				<p>
					<strong className="text-white">Play counts.</strong> When a song has played for 30 seconds (or half of a
					shorter song) we add one to that song's total play count. Play counts are not linked to your account. To avoid
					counting the same play twice, the server keeps your IP address together with the song ID in memory for 30
					seconds.
				</p>
				<p>
					<strong className="text-white">Data stored on your device.</strong> Your browser's local storage keeps your
					player state (queue, volume, shuffle and repeat), your recently played songs and layout preferences. This data
					stays on your device and is not sent to us.
				</p>
			</>
		),
	},
	{
		id: "cookies",
		title: "Cookies",
		body: (
			<p>
				Clerk sets cookies that are strictly necessary to keep you signed in securely. {site.name} does not use
				advertising or analytics cookies.
			</p>
		),
	},
	{
		id: "how-we-use-information",
		title: "How we use information",
		body: (
			<ul>
				<li>To provide your account, library, messages and friend activity.</li>
				<li>To rank songs by how often they are played.</li>
				<li>To keep the service secure and prevent abuse.</li>
			</ul>
		),
	},
	{
		id: "sharing",
		title: "Who can see your information",
		body: (
			<>
				<p>
					<strong className="text-white">Other listeners</strong> who are signed in can see your display name, profile
					picture, whether you are online and the song you are currently playing. Messages are visible to you and the
					person you send them to.
				</p>
				<p>
					<strong className="text-white">Service providers</strong> process data on our behalf: Clerk for
					authentication, Cloudinary for hosting uploaded media, and our database and hosting providers. Media in the
					catalog and fonts are loaded from third party servers (including Cloudinary, SoundHelix, Lorem Picsum and
					Google Fonts), which receive your IP address when your browser requests those files.
				</p>
				<p>We do not sell your personal information and we do not use it for advertising.</p>
			</>
		),
	},
	{
		id: "retention",
		title: "How long we keep it",
		body: (
			<p>
				Your profile, liked songs and messages are kept until you ask us to delete them. Listening activity and the
				short lived play count records described above are kept in memory only.
			</p>
		),
	},
	{
		id: "your-choices",
		title: "Your choices and rights",
		body: (
			<>
				<p>
					You can update your name and profile picture from the account menu. You can remove songs from Liked Songs at
					any time.
				</p>
				<p>
					To get a copy of your data, correct it, or delete your profile, liked songs and messages, <ContactLine />.
					Depending on where you live you may have additional rights under laws such as the GDPR or CCPA, including the
					right to object to processing and to complain to a data protection authority.
				</p>
			</>
		),
	},
	{
		id: "security",
		title: "Security",
		body: (
			<p>
				Requests to our servers are authenticated with short lived session tokens issued by Clerk, and only the
				administrator account can change the catalog. No system is perfectly secure, so we cannot guarantee absolute
				security.
			</p>
		),
	},
	{
		id: "children",
		title: "Children",
		body: <p>{site.name} is not intended for children under 13 and we do not knowingly collect their information.</p>,
	},
	{
		id: "changes",
		title: "Changes to this policy",
		body: (
			<p>
				If we change this policy we will update the date at the top of this page. Please check it from time to time.
			</p>
		),
	},
	{
		id: "contact",
		title: "Contact",
		body: (
			<p>
				For any privacy question, <ContactLine />.
			</p>
		),
	},
];

const PrivacyPage = () => (
	<LegalPage
		title="Privacy Policy"
		intro={
			<p>
				This policy explains what information {site.name} collects when you use the service, how it is used and the
				choices you have.
			</p>
		}
		sections={sections}
	/>
);

export default PrivacyPage;
