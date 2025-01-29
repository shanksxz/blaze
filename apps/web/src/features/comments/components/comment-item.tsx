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
		<div className="relative group">
			<div className="flex gap-2 sm:gap-4">
				<div className="relative flex-shrink-0">
					{isChild && (
						<div
							className="absolute -left-[18px] sm:-left-[30px] top-4 h-[2px] w-[22px] sm:w-[36px] bg-border/50 
                       group-hover:bg-border/80 transition-colors duration-200"
							aria-hidden="true"
						/>
					)}
					<Avatar className="h-7 w-7 sm:h-9 sm:w-9 ring-2 ring-background">
						<AvatarImage src={comment.author.image || ""} alt={comment.author.username || ""} />
						<AvatarFallback className="bg-muted text-muted-foreground text-xs sm:text-sm">
							{comment.author.username?.[0]}
						</AvatarFallback>
					</Avatar>
				</div>
				<div className="flex-1 space-y-1 sm:space-y-2">
					<div className="flex items-center gap-2">
						<span className="font-semibold text-xs sm:text-sm">{comment.author.username}</span>
						<span className="text-xs text-muted-foreground">{formattedDate}</span>
					</div>
					<p className="text-xs sm:text-sm text-foreground/90 leading-relaxed">{comment.content}</p>
					<div className="flex items-center gap-2 sm:gap-4">
						<Button
							variant="ghost"
							size="sm"
							className="h-6 sm:h-7 px-1 sm:px-2 text-xs text-muted-foreground hover:text-primary 
                       hover:bg-primary/5 transition-colors"
							onClick={() => setShowReply(!showReply)}
						>
							<MessageCircle className="mr-1 h-3 sm:h-3.5 w-3 sm:w-3.5" />
							Reply
						</Button>
						{comment.commentCounts > 0 && (
							<Button
								variant="ghost"
								size="sm"
								className="h-6 sm:h-7 px-1 sm:px-2 text-xs text-muted-foreground hover:text-primary 
                         hover:bg-primary/5 transition-colors"
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
							<CommentBox postId={postId} setShowReply={setShowReply} parentCommentId={comment.id} />
						</div>
					)}
				</div>
			</div>
			{showChildComments && (
				<div className="relative mt-2 sm:mt-4 space-y-4 sm:space-y-6 pl-[28px] sm:pl-[45px]">
					{isLoading ? (
						<div className="space-y-4">
							<Skeleton className="h-12 w-full" />
							<Skeleton className="h-12 w-full" />
						</div>
					) : (
						<div className="relative">
							<div
								className={`absolute 
                          bottom-0
                          left-[-18px] sm:left-[-30px] top-[-45px] sm:top-[-65px] w-[2px] bg-border/50 
                           group-hover:bg-border/80 transition-colors duration-200`}
								aria-hidden="true"
							/>
							{childComments?.map((childComment, _index) => (
								<CommentItem key={childComment.id} comment={childComment} postId={postId} isChild />
							))}
						</div>
					)}
				</div>
			)}
		</div>
	);
}
