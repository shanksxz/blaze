'use client';

import { api } from '@/trpc/react';
import { Post } from '@/components/feed/Post';

export default function Feed() {
	const { data: posts } = api.post.getLatest.useQuery();

	if (!posts) return null;

	return (
		<div className="space-y-4">
			{posts.map((post) => (
				<Post key={post.id} post={post} />
			))}
		</div>
	);
}