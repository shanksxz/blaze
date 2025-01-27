"use client";

import { Post } from "@/features/post/components/post-card";
import { usePostService } from "@/hooks/api-hooks";
import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";

export default function Client() {
	const { data: bookmarkedPosts } = api.bookmark.getBookmarkedPosts.useQuery(undefined, {
		suspense: true,
	});
	const router = useRouter();
	const { likePost, repostPost, bookmarkPost } = usePostService();
	if (!bookmarkedPosts) return null;
	return (
		<div className="space-y-4">
			{bookmarkedPosts.length === 0 ? (
				<div className="text-center py-8 text-muted-foreground">No bookmarked posts yet</div>
			) : (
				bookmarkedPosts.map((post) => (
					<div key={post.id} onClick={() => router.push(`/post/${post.id}`)} className="cursor-pointer">
						<Post
							post={post}
							onLike={() => likePost.mutate({ postId: post.id })}
							onRepost={() => repostPost.mutate({ postId: post.id })}
							onBookmark={() => bookmarkPost.mutate({ postId: post.id })}
						/>
					</div>
				))
			)}
		</div>
	);
}
