import Feed from "@/components/feed/Feed";
import Tweet from "@/components/feed/Tweet";
import { auth } from "@/server/auth/auth";
import { headers } from "next/headers";

export default async function Page() {
	const session = await auth.api.getSession(
		{
			headers: await headers(),
		}
	);

	return (
		<div className="min-h-screen bg-background">
			<main className="container mx-auto px-4 py-6">
				<div className="max-w-2xl mx-auto">
					<Tweet isAuthenticated={!!session?.user.name} />
					<Feed />
				</div>
			</main>
		</div>
	);
}