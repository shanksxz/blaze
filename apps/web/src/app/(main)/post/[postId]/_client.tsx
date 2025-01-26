"use client";
import { Card } from "@/components/ui/card";
import { CommentTree } from "@/features/comments/components/comment-tree";
import { Post } from "@/features/post/components/post-card";
import { useBookmarkPost, useLikePost, usePostService, useRepostPost } from "@/hooks/api-hooks";
import { api } from "@/trpc/react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function Client({
	postId,
}: {
	postId: number;
}) {
	const { data: post } = api.post.getByPostId.useQuery({ postId });
	const { bookmarkPost, likePost, repostPost } = usePostService();

	if (!post) return null;

	return (
		<div className="min-h-screen bg-background max-w-2xl mx-auto">
			<div className="flex items-center justify-start h-14">
				<Link href="/">
					<ArrowLeft className="w-5 h-5" />
				</Link>
				<h1 className="text-xl font-semibold ml-2">Post</h1>
			</div>
			<Card className="rounded-sm">
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
