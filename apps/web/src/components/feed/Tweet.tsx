"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { authClient } from "@/server/auth/auth-client";
import { api } from "@/trpc/react";
import { type TweetSchema, tweetSchema } from "@/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Calendar, Image, Smile } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";
export default function Tweet() {
	const {
		control,
		handleSubmit,
		formState: { errors },
		reset,
	} = useForm<TweetSchema>({
		resolver: zodResolver(tweetSchema),
		defaultValues: {
			content: "",
		},
	});

	const { data: session } = authClient.useSession();
	const utils = api.useUtils();
	const createPost = api.post.create.useMutation({
		onSuccess: () => {
			toast.success("post has been created.");
			utils.post.getLatest.invalidate();
			reset();
		},
		onError: (error) => {
			console.error(error);
		},
	});

	const onSubmit = async (data: z.infer<typeof tweetSchema>) => {
		if (!session?.user) return;
		createPost.mutateAsync({ content: data.content });
	};

	return (
		<form
			onSubmit={handleSubmit(onSubmit)}
			className="border rounded-lg p-4 mb-6"
		>
			<Controller
				name="content"
				control={control}
				render={({ field }) => (
					<>
						<Textarea
							{...field}
							placeholder="What's happening?"
							className="w-full mb-4 resize-none focus:ring-0"
						/>
						{errors.content && (
							<p className="text-red-500">{errors.content.message}</p>
						)}
					</>
				)}
			/>
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
