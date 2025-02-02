"use client";

import { Post } from "@/features/post/components/post-card";
import { usePostService } from "@/hooks/api-hooks";
import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";

interface HashtagFeedProps {
	hashtag: string;
}

export default function HashtagFeed({ hashtag }: HashtagFeedProps) {
	const router = useRouter();
	const { data: posts } = api.hashtag.getPostsByTag.useQuery(
		{ tag: hashtag },
		{
			suspense: true,
		},
	);
	const { bookmarkPost, likePost, repostPost } = usePostService();

	if (!posts?.length) {
		return <div className="p-4 text-center text-muted-foreground">No posts found with #{hashtag}</div>;
	}

	return (
		<div className="space-y-4">
			{posts.map((post) => (
				<div key={post.id} onClick={() => router.push(`/post/${post.id}`)} className="cursor-pointer">
					<Post
						post={post}
						onLike={() => likePost.mutate({ postId: post.id })}
						onRepost={() => repostPost.mutate({ postId: post.id })}
						onBookmark={() => bookmarkPost.mutate({ postId: post.id })}
					/>
				</div>
			))}
		</div>
	);
}
