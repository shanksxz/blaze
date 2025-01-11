"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { authClient } from "@/server/auth/auth-client";
import { api } from "@/trpc/react";
import { tweetSchema } from "@/validation";
import { Calendar, Image, Smile } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Tweet() {
	const [content, setContent] = useState("");
	const [error, setError] = useState("");

	const { data: session } = authClient.useSession();
	const utils = api.useUtils();

	const createPost = api.post.create.useMutation({
		onSuccess: () => {
			toast.success("Post has been created.");
			utils.post.getLatest.invalidate();
			setContent("");
			setError("");
		},
		onError: (error) => {
			toast.error("Failed to create post.");
			console.error(error);
		},
	});

	const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (!session?.user) return;

		try {
			const validated = tweetSchema.parse({ content });
			createPost.mutateAsync({ content: validated.content });
		} catch (err) {
			if (err instanceof Error) {
				toast.error(err.message);
				// setError(err.message)
			}
		}
	};

	return (
		<form onSubmit={onSubmit} className="border rounded-lg p-4 mb-6">
			<Textarea
				value={content}
				onChange={(e) => {
					setContent(e.target.value);
					setError(""); // Clear error when user types
				}}
				placeholder="What's happening?"
				className="w-full mb-4 resize-none focus:ring-0"
			/>
			{error && <p className="text-red-500">{error}</p>}
			<div className="flex items-center justify-between">
				<div className="flex space-x-2">
					<Button variant="ghost" size="icon" disabled>
						<Image className="w-5 h-5" />
					</Button>
					<Button variant="ghost" size="icon" disabled>
						<Smile className="w-5 h-5" />
					</Button>
					<Button variant="ghost" size="icon" disabled>
						<Calendar className="w-5 h-5" />
					</Button>
				</div>
				<Button type="submit" disabled={!session?.user || createPost.isPending}>
					{createPost.isPending ? "Blazing..." : "Blaze it!"}
				</Button>
			</div>
		</form>
	);
}
