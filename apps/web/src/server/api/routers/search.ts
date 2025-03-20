import {
	and,
	between,
	bookmarks,
	comments,
	desc,
	eq,
	hashtags,
	like,
	or,
	postHashtags,
	postLikes,
	posts,
	posts as postsTable,
	reposts,
	sql,
	users,
} from "@repo/database";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const searchRouter = createTRPCRouter({
	all: publicProcedure.input(z.object({ query: z.string() })).query(async ({ ctx, input }) => {
		const query = input.query.toLowerCase();
		const usersResult = await ctx.db
			.select({
				id: users.id,
				name: users.name,
				username: users.username,
				image: users.image,
			})
			.from(users)
			.where(or(like(sql`LOWER(${users.name})`, `%${query}%`), like(sql`LOWER(${users.username})`, `%${query}%`)))
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

	explore: publicProcedure
		.input(
			z.object({
				query: z.string(),
				dateRange: z
					.object({
						from: z.date().optional(),
						to: z.date().optional(),
					})
					.optional(),
				filters: z.array(z.string()).optional(),
				sortBy: z.enum(["relevance", "newest", "oldest"]).default("relevance"),
				limit: z.number().default(10),
				cursor: z.number().nullish(),
			}),
		)
		.query(async ({ ctx, input }) => {
			const { query, dateRange, filters, sortBy } = input;

			if (query.length === 0 && !dateRange && !filters) return { items: [], nextCursor: null };

			const usernames = filters?.filter((f) => f.startsWith("from:")).map((f) => f.split(":")[1]) || [];

			const hashtagFilters = filters?.filter((f) => f.startsWith("#")).map((f) => f.slice(1)) || [];

			const userIds =
				usernames.length > 0
					? await ctx.db.select({ id: users.id }).from(users).where(sql`${users.username} IN (${usernames})`)
					: [];

			const conditions = [];
			if (query.length > 0) {
				conditions.push(like(sql`LOWER(${postsTable.content})`, `%${query.toLowerCase()}%`));
			}

			if (dateRange?.from) {
				const fromDate = dateRange.from;
				const toDate = dateRange.to || new Date();
				conditions.push(between(postsTable.createdAt, fromDate, toDate));
			}

			if (userIds.length > 0) {
				conditions.push(sql`${postsTable.createdById} IN (${userIds.map((u) => u.id)})`);
			}

			if (hashtagFilters.length > 0) {
				conditions.push(
					sql`EXISTS (
            SELECT 1 FROM ${postHashtags} ph
            JOIN ${hashtags} h ON ph.hashtag_id = h.id
            WHERE ph.post_id = ${postsTable.id} AND h.name IN (${hashtagFilters})
          )`,
				);
			}

			const posts = await ctx.db.query.posts.findMany({
				limit: input.limit + 1,
				where:
					conditions.length > 0
						? input.cursor
							? and(...conditions, sql`id < ${input.cursor}`)
							: and(...conditions)
						: input.cursor
							? sql`id < ${input.cursor}`
							: undefined,
				orderBy: sortBy === "oldest" ? [postsTable.createdAt] : [desc(postsTable.createdAt)],
				with: {
					author: {
						columns: {
							name: true,
							image: true,
							username: true,
						},
					},
					postLikes: true,
					reposts: true,
					postComments: true,
					bookmarks: true,
					postHashtags: {
						with: {
							hashtag: true,
						},
					},
				},
			});

			let nextCursor: typeof input.cursor = undefined;
			if (posts.length > input.limit) {
				const nextItem = posts.pop();
				nextCursor = nextItem?.id;
			}

			return {
				items: posts.map((post) => ({
					...post,
					likes: post.postLikes.length,
					reposts: post.reposts.length,
					commentsCount: post.postComments.length,
					hasLiked: post.postLikes.some((like) => like.userId === ctx.session?.user?.id),
					hasReposted: post.reposts.some((repost) => repost.userId === ctx.session?.user?.id),
					isBookmarked: post.bookmarks.some((bookmark) => bookmark.userId === ctx.session?.user?.id),
					hashtags: post.postHashtags.map((ph) => ph.hashtag.name),
				})),
				nextCursor,
			};
		}),
});
