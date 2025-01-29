"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { authClient } from "@/server/auth/auth-client";
import { api } from "@/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const MAX_COMMENT_LENGTH = 280;

const commentSchema = z.object({
	content: z
		.string()
		.min(1, { message: "Comment cannot be empty" })
		.max(MAX_COMMENT_LENGTH, { message: `Comment cannot exceed ${MAX_COMMENT_LENGTH} characters` }),
});

export function CommentBox({
	postId,
	parentCommentId,
	setShowReply,
}: {
	postId: number;
	parentCommentId?: number;
	setShowReply?: (value: boolean | ((prev: boolean) => boolean)) => void;
}) {
	const { data: session } = authClient.useSession();
	const [isLoading, setIsLoading] = useState(false);

	const form = useForm({
		resolver: zodResolver(commentSchema),
		defaultValues: {
			content: "",
		},
	});

	const { register, watch, reset } = form;
	const content = watch("content");
	const characterCount = content.length;
	const remainingCharacters = MAX_COMMENT_LENGTH - characterCount;

	const utils = api.useUtils();

	const createComment = api.post.addComment.useMutation({
		onSuccess: () => {
			toast.success("Comment has been created");
			reset();
			utils.post.getComments.invalidate({ postId });
			if (parentCommentId) {
				utils.comment.getChildComments.invalidate({
					parentCommentId: parentCommentId,
				});
			}
		},
		onError: (error) => {
			console.error(error);
			toast.error("Failed to create comment");
		},
	});

	const createChildComment = api.comment.createChildComment.useMutation({
		onSuccess: () => {
			toast.success("Reply has been created");
			reset();
			if (parentCommentId) {
				utils.comment.getChildComments.invalidate({ parentCommentId });
			}
			utils.post.getComments.invalidate({ postId });
		},
		onError: (error) => {
			console.error(error);
			toast.error("Failed to create reply");
		},
	});

	const onSubmit = async (data: z.infer<typeof commentSchema>) => {
		if (!session?.user) return;
		setIsLoading(true);
		try {
			if (parentCommentId) {
				await createChildComment.mutateAsync({
					content: data.content,
					parentCommentId,
				});
			} else {
				await createComment.mutateAsync({
					content: data.content,
					postId,
				});
			}
		} finally {
			setIsLoading(false);
			if (setShowReply) {
				setShowReply(false);
			}
		}
	};

	return (
		<form onSubmit={form.handleSubmit(onSubmit)} className="relative">
			<div className="flex flex-col sm:flex-row gap-4">
				<Avatar className="h-8 w-8 ring-2 ring-background hidden sm:block">
					<AvatarImage src={session?.user?.image || ""} alt={session?.user?.name || ""} />
					<AvatarFallback className="bg-muted">{session?.user?.name?.[0]}</AvatarFallback>
				</Avatar>
				<div className="flex-1 space-y-4">
					<div className="relative">
						<Textarea
							{...register("content")}
							placeholder={parentCommentId ? "Write a reply..." : "Write a comment..."}
							className="min-h-[80px] p-2 resize-none border bg-background text-sm focus-visible:ring-0"
							maxLength={MAX_COMMENT_LENGTH}
						/>
						<div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
							<span
								className={`${
									remainingCharacters <= 20
										? "text-destructive"
										: remainingCharacters <= 50
											? "text-warning"
											: ""
								}`}
							>
								{remainingCharacters}
							</span>
							<span className="ml-1">characters remaining</span>
						</div>
					</div>
					<div className="flex items-center justify-between">
						<div className="text-xs text-muted-foreground">
							{!session?.user && <span>Please sign in to comment</span>}
						</div>
						<Button
							type="submit"
							size="sm"
							className="rounded-full px-4"
							disabled={
								isLoading || !session?.user || !content.trim() || content.length > MAX_COMMENT_LENGTH
							}
						>
							{isLoading ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									{parentCommentId ? "Replying..." : "Commenting..."}
								</>
							) : parentCommentId ? (
								"Reply"
							) : (
								"Comment"
							)}
						</Button>
					</div>
				</div>
			</div>
			{form.formState.errors.content && (
				<p className="mt-2 text-sm text-destructive">{form.formState.errors.content.message}</p>
			)}
		</form>
	);
}
