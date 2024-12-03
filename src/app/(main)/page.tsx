import Feed from '~/components/Feed';
import Tweet from '~/components/Tweet';

export default async function BlazeFeed() {
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
