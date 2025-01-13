"use client";

import { Post } from "@/components/feed/Post";
import { useBookmarkPost, useLikePost, useRepostPost } from "@/hooks/api-hooks";
import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";

export default function Feed() {
	const router = useRouter();
	const { data: posts } = api.post.getLatest.useQuery();
	const likeMutation = useLikePost();
	const repostMutation = useRepostPost();
	const bookmarkMutation = useBookmarkPost();

	if (!posts) return null;
	return (
		<div className="space-y-4">
			{posts.map((post) => {
				return (
					<div key={post.id} onClick={() => router.push(`/post/${post.id}`)} className="cursor-pointer">
						<Post
							post={post}
							onLike={() => likeMutation.mutate({ postId: post.id })}
							onRepost={() => repostMutation.mutate({ postId: post.id })}
							onBookmark={() => bookmarkMutation.mutate({ postId: post.id })}
						/>
					</div>
				);
			})}
		</div>
	);
}
