"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/trpc/react";
import { CommentBox } from "./comment-box";
import CommentItem from "./comment-item";

export function CommentTree({ postId }: { postId: number }) {
	const {
		data: comments,
		isLoading,
		error,
	} = api.post.getComments.useQuery({
		postId,
	});

	if (isLoading) {
		return (
			<div className="space-y-4 p-4">
				<Skeleton className="h-12 w-full" />
			</div>
		);
	}

	if (error) {
		return <div className="p-4 text-center text-sm text-muted-foreground">Failed to load comments</div>;
	}

	return (
		<div className="divide-y divide-border">
			<div className="p-4">
				<CommentBox postId={postId} />
			</div>
			<div className="space-y-4 p-4">
				{comments?.map((comment) => (
					<CommentItem key={comment.id} comment={comment} postId={postId} />
				))}
			</div>
		</div>
	);
}
