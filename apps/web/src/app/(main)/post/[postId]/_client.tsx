"use client";
import { CommentTree } from "@/components/comments/CommentTree";
import { Post } from "@/components/feed/Post";
import { Card } from "@/components/ui/card";
import { useBookmarkPost, useLikePost, useRepostPost } from "@/hooks/api-hooks";
import { api } from "@/trpc/react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function Client({
	postId,
}: {
	postId: number;
}) {
	const { data: post } = api.post.getByPostId.useQuery({ postId });
	const likeMutation = useLikePost();
	const repostMutation = useRepostPost();
	const bookmarkMutation = useBookmarkPost();

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
					onLike={() => likeMutation.mutate({ postId })}
					onRepost={() => repostMutation.mutate({ postId })}
					onBookmark={() => bookmarkMutation.mutate({ postId })}
				/>
				<CommentTree postId={postId} />
			</Card>
		</div>
	);
}
