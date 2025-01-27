"use client";

import { Card } from "@/components/ui/card";
import { CommentTree } from "@/features/comments/components/comment-tree";
import { Post } from "@/features/post/components/post-card";
import { usePostService } from "@/hooks/api-hooks";
import { api } from "@/trpc/react";

export default function Client({
	postId,
}: {
	postId: number;
}) {
	const { data: post } = api.post.getByPostId.useQuery({ postId });
	const { bookmarkPost, likePost, repostPost } = usePostService();

	if (!post) return null;

	return (
		<div className="min-h-screen bg-background">
			<Card className="rounded-sm shadow-none">
				<Post
					post={post}
					onLike={() => likePost.mutate({ postId })}
					onRepost={() => repostPost.mutate({ postId })}
					onBookmark={() => bookmarkPost.mutate({ postId })}
				/>
				<CommentTree postId={postId} />
			</Card>
		</div>
	);
}
