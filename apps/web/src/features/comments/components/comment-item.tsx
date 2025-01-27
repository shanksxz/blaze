"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { type RouterOutputs, api } from "@/trpc/react";
import { MessageCircle } from "lucide-react";
import { useState } from "react";
import { CommentBox } from "./comment-box";

type Comment = RouterOutputs["comment"]["getChildComments"][number];

export default function CommentItem({
	comment,
	postId,
	isChild = false,
}: {
	comment: Comment;
	postId: number;
	isChild?: boolean;
	hasChildComments?: boolean;
}) {
	const [showReply, setShowReply] = useState(false);
	const [showChildComments, setShowChildComments] = useState(false);

	const { data: childComments, isLoading } = api.comment.getChildComments.useQuery(
		{ parentCommentId: comment.id },
		{ enabled: showChildComments },
	);

	const formattedDate = new Date(comment.createdAt).toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		hour: "numeric",
		minute: "numeric",
	});

	return (
		<div className="relative">
			<div className="flex gap-3">
				<div className="relative flex-shrink-0">
					{isChild && (
						<div className="absolute -left-[32px] top-4 h-[2px] w-[32px] bg-border" aria-hidden="true" />
					)}
					<Avatar className="h-8 w-8">
						<AvatarImage src={comment.author.image || ""} alt={comment.author.username || ""} />
						<AvatarFallback className="bg-muted">{comment.author.username?.[0]}</AvatarFallback>
					</Avatar>
				</div>
				<div className="flex-1 space-y-1">
					<div className="flex items-center gap-2">
						<span className="font-medium">{comment.author.username}</span>
						<span className="text-sm text-muted-foreground">{formattedDate}</span>
					</div>
					<p className="text-sm text-foreground/90">{comment.content}</p>
					<div className="flex items-center gap-4 pt-0.5">
						<Button
							variant="ghost"
							size="sm"
							className="h-8 px-2 text-muted-foreground hover:text-primary"
							onClick={() => setShowReply(!showReply)}
						>
							<MessageCircle className="mr-1.5 h-4 w-4" />
							Reply
						</Button>
						{comment.commentCounts > 0 && (
							<Button
								variant="ghost"
								size="sm"
								className="h-8 px-2 text-muted-foreground hover:text-primary"
								onClick={() => setShowChildComments(!showChildComments)}
							>
								{showChildComments
									? "Hide replies"
									: `Show ${comment.commentCounts} ${comment.commentCounts === 1 ? "reply" : "replies"}`}
							</Button>
						)}
					</div>
					{showReply && (
						<div className="pt-2">
							<CommentBox postId={postId} parentCommentId={comment.id} />
						</div>
					)}
				</div>
			</div>
			{showChildComments && (
				<div className="relative mt-3 space-y-4 pl-[40px]">
					{isLoading ? (
						<div className="space-y-4">
							<Skeleton className="h-12 w-full" />
							<Skeleton className="h-12 w-full" />
						</div>
					) : (
						<div className="relative">
							<div
								className="absolute bottom-0 left-[-32px] top-0 w-[2px] bg-border"
								aria-hidden="true"
							/>
							{childComments?.map((childComment) => (
								<CommentItem key={childComment.id} comment={childComment} postId={postId} isChild />
							))}
						</div>
					)}
				</div>
			)}
		</div>
	);
}
