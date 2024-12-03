import Feed from '~/components/Feed';
import Tweet from '~/components/Tweet';
import { api } from '~/trpc/server';

export default async function BlazeFeed() {

    const posts = await api.post.getAll()

	return (
		<div className="min-h-screen bg-background">
			<main className="container mx-auto px-4 py-6">
				<div className="max-w-2xl mx-auto">
                    <Tweet />
                    <Feed initialPosts={posts} />
				</div>
			</main>
		</div>
	);
}