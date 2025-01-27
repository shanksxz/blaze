"use client";

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

const commentSchema = z.object({
	content: z.string().min(1, { message: "Comment cannot be empty" }),
});

export function CommentBox({
	postId,
	parentCommentId,
}: {
	postId: number;
	parentCommentId?: number;
}) {
	const { data: session } = authClient.useSession();
	const [isLoading, setIsLoading] = useState(false);
	const form = useForm({
		resolver: zodResolver(commentSchema),
		defaultValues: {
			content: "",
		},
	});
	const { reset, watch } = form;
	const content = watch("content");

	const utils = api.useUtils();

	const createComment = api.post.addComment.useMutation({
		onSuccess: () => {
			toast.success("Comment has been created");
			reset();
			utils.post.getComments.invalidate({ postId });
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
		}
	};

	return (
		<form onSubmit={form.handleSubmit(onSubmit)} className="relative">
			<div className="space-y-2">
				<Textarea
					{...form.register("content")}
					placeholder={parentCommentId ? "Reply to this comment..." : "Write a message..."}
					className="min-h-[60px] resize-none border bg-background text-sm focus-visible:ring-1"
				/>
				<div className="flex items-center justify-between">
					<div className="text-xs text-muted-foreground">
						{!session?.user && <span>Please sign in to comment</span>}
					</div>
					<Button
						type="submit"
						size="sm"
						className="px-4"
						disabled={isLoading || !session?.user || !content.trim()}
					>
						{isLoading ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								{parentCommentId ? "Replying..." : "Sending..."}
							</>
						) : parentCommentId ? (
							"Reply"
						) : (
							"Send"
						)}
					</Button>
				</div>
			</div>
			{form.formState.errors.content && (
				<p className="mt-2 text-sm text-destructive">{form.formState.errors.content.message}</p>
			)}
		</form>
	);
}
