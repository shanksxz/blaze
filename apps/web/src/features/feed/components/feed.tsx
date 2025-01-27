"use client";

import { Post } from "@/features/post/components/post-card";
import { usePostService } from "@/hooks/api-hooks";
import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";

export default function Feed() {
	const router = useRouter();
	const { data: posts } = api.post.getLatest.useQuery(undefined, {
		suspense: true,
	});
	const { bookmarkPost, likePost, repostPost } = usePostService();

	return (
		<div className="space-y-4">
			{posts?.map((post) => (
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
