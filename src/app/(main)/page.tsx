import { redirect } from 'next/navigation';
import Feed from '~/components/Feed';
import Tweet from '~/components/Tweet';
import { auth } from '~/server/auth';

export default async function BlazeFeed() {
	const session = await auth();
	if (session && !session.user.username) {
		return redirect('/profile/setup');
	}

	return (
		<div className="min-h-screen bg-background">
			<main className="container mx-auto px-4 py-6">
				<div className="max-w-2xl mx-auto">
					<Tweet />
					<Feed />
				</div>
			</main>
		</div>
	);
}
