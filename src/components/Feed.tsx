'use client';

import { useCallback } from 'react';
import { usePost } from '~/hooks/usePost';
import { api } from '~/trpc/react';
import { Post } from './Post';

export default function Feed() {
	const { data: posts } = api.post.getAll.useQuery();
	const { toggleLike, toggleRepost } = usePost();

	const handleLike = useCallback(
		(postId: number) => {
			toggleLike.mutate({ postId });
		},
		[toggleLike],
	);

	const handleRepost = useCallback(
		(postId: number) => {
			toggleRepost.mutate({ postId });
		},
		[toggleRepost],
	);

	if (!posts) return null;

	return (
		<div className="space-y-4">
			{posts.map((post) => (
				<Post
					key={post.id}
					post={post}
					onLike={handleLike}
					onRepost={handleRepost}
					isLikeLoading={toggleLike.isPending}
					isRepostLoading={toggleRepost.isPending}
				/>
			))}
		</div>
	);
}
