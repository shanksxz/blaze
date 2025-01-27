import { desc, eq, hashtags, like, or, postHashtags, sql } from "@repo/database";
import { users } from "@repo/database";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";

interface SearchResults {
	users: {
		id: string;
		name: string | null;
		username: string | null;
		image: string | null;
	}[];
	hashtags: {
		name: string;
		count: number;
	}[];
}

export const searchRouter = createTRPCRouter({
	all: publicProcedure
		.input(z.object({ query: z.string() }))
		.query(async ({ ctx, input }): Promise<SearchResults> => {
			const query = input.query.toLowerCase();
			const usersResult = await ctx.db
				.select({
					id: users.id,
					name: users.name,
					username: users.username,
					image: users.image,
				})
				.from(users)
				.where(
					or(
						like(sql`LOWER(${users.name})`, `%${query}%`),
						like(sql`LOWER(${users.username})`, `%${query}%`),
					),
				)
				.limit(5);

			const hashtagResults = await ctx.db
				.select({
					name: hashtags.name,
					count: sql<number>`COUNT(DISTINCT ${postHashtags.postId})`.as("count"),
				})
				.from(hashtags)
				.leftJoin(postHashtags, eq(hashtags.id, postHashtags.hashtagId))
				.where(like(sql`LOWER(${hashtags.name})`, `%${query}%`))
				.groupBy(hashtags.name)
				.orderBy(desc(sql`COUNT(DISTINCT ${postHashtags.postId})`))
				.limit(5);

			return {
				users: usersResult,
				hashtags: hashtagResults,
			};
		}),
});
