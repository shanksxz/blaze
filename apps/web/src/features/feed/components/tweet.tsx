"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAutoResizeTextArea } from "@/hooks/use-auto-resize";
import { authClient } from "@/server/auth/auth-client";
import { api } from "@/trpc/react";
import { tweetSchema } from "@/validation";
import { Calendar, Image, Smile } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

const MAX_LENGTH = 280;

export default function TweetForm() {
	const [content, setContent] = useState("");
	const [tags, setTags] = useState<string[]>([]);
	const [error, setError] = useState("");
	const { data: session } = authClient.useSession();
	const textareaRef = useRef<HTMLTextAreaElement>(null);

	const utils = api.useUtils();
	useAutoResizeTextArea(textareaRef);

	const createPost = api.post.create.useMutation({
		onSuccess: () => {
			toast.success("Post has been created.");
			utils.post.getLatest.invalidate();
			setContent("");
			setError("");
			setTags([]);
		},
		onError: (error) => {
			toast.error("Failed to create post.");
			console.error(error);
		},
	});

	const extractTags = useCallback((text: string): string[] => {
		const tagMatches = text.match(/#[\w\u0590-\u05ff]+/g);
		return tagMatches
			? tagMatches.map((tag) => tag.slice(1)).filter((tag, index, self) => self.indexOf(tag) === index)
			: [];
	}, []);

	const handleContentChange = useCallback(
		(e: React.ChangeEvent<HTMLTextAreaElement>) => {
			const value = e.target.value;
			if (value.length <= MAX_LENGTH) {
				setContent(value);
				const newTags = extractTags(value);
				setTags(newTags);
				setError("");
			}
		},
		[extractTags],
	);

	const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (!session?.user) return;
		try {
			const validated = tweetSchema.parse({ content });
			createPost.mutateAsync({ content: validated.content, hashtags: tags });
		} catch (err) {
			if (err instanceof Error) {
				toast.error(err.message);
			}
		}
	};

	const characterCount = content.length;
	const remainingCharacters = MAX_LENGTH - characterCount;

	return (
		<div className="border rounded-lg p-4 mb-6 bg-card">
			<form onSubmit={onSubmit}>
				<div className="mb-4">
					{tags.length > 0 && (
						<div className="flex flex-wrap gap-2 mb-2">
							{tags.map((tag) => (
								<span
									key={tag}
									className="bg-secondary text-secondary-foreground px-2 py-1 rounded-sm text-sm"
								>
									#{tag}
								</span>
							))}
						</div>
					)}
					<Textarea
						value={content}
						onChange={handleContentChange}
						placeholder="What's happening?"
						className="w-full resize-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 min-h-[100px]"
						maxLength={MAX_LENGTH}
						ref={textareaRef}
					/>
				</div>

				<div className="flex justify-between items-center">
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
					<div className="flex items-center gap-2">
						<p
							className={`text-sm ${remainingCharacters <= 20 ? "text-yellow-500" : "text-muted-foreground"}`}
						>
							<span className="tabular-nums">{remainingCharacters}</span>{" "}
						</p>
						<Button type="submit" disabled={!session?.user || createPost.isPending || characterCount === 0}>
							{createPost.isPending ? "Blazing..." : "Blaze it!"}
						</Button>
					</div>
				</div>
			</form>
			{error && <p className="text-destructive mt-2">{error}</p>}
		</div>
	);
}
