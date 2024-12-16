import { z } from "zod";

export const tweetSchema = z.object({
	content: z
		.string()
		.min(1, "Content is required")
		.max(256, "Content is too long"),
});

export const setupSchema = z.object({
	username: z.string().min(3, "Username must be at least 3 characters long"),
});

export type SetupSchema = z.infer<typeof setupSchema>;
export type TweetSchema = z.infer<typeof tweetSchema>;
