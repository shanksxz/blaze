import { createTRPCRouter, protectedProcedure, publicProcedure } from "@/server/api/trpc";
import { and, desc, eq, hashtags, postHashtags, posts, sql } from "@repo/database";
import { z } from "zod";

export const hashtagRouter = createTRPCRouter({
	getTrending: publicProcedure.input(z.object({ limit: z.number().optional() })).query(async ({ ctx, input }) => {
		return await ctx.db
			.select({
				name: hashtags.name,
				count: sql<number>`count(DISTINCT ${postHashtags.postId})`,
			})
			.from(hashtags)
			.leftJoin(postHashtags, eq(hashtags.id, postHashtags.hashtagId))
			.groupBy(hashtags.name)
			.orderBy(sql`count(DISTINCT ${postHashtags.postId}) DESC`)
			.limit(input.limit || 5);
	}),

	getPostsByTag: publicProcedure.input(z.object({ tag: z.string() })).query(async ({ ctx, input }) => {
		const postsWithTag = await ctx.db.query.posts.findMany({
			where: (posts, { inArray }) =>
				inArray(
					posts.id,
					ctx.db
						.select({ postId: postHashtags.postId })
						.from(postHashtags)
						.innerJoin(hashtags, eq(hashtags.id, postHashtags.hashtagId))
						.where(eq(hashtags.name, input.tag.toLowerCase())),
				),
			orderBy: (posts, { desc }) => [desc(posts.createdAt)],
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

		return postsWithTag.map((post) => ({
			...post,
			likes: post.postLikes.length,
			reposts: post.reposts.length,
			commentsCount: post.postComments.length,
			hasLiked: post.postLikes.some((like) => like.userId === ctx.session?.user?.id),
			hasReposted: post.reposts.some((repost) => repost.userId === ctx.session?.user?.id),
			isBookmarked: post.bookmarks.some((bookmark) => bookmark.userId === ctx.session?.user?.id),
			hashtags: post.postHashtags.map((ph) => ph.hashtag.name),
		}));
	}),

	search: publicProcedure.input(z.object({ query: z.string() })).query(async ({ ctx, input }) => {
		return await ctx.db.query.hashtags.findMany({
			where: sql`${hashtags.name} ILIKE ${`%${input.query}%`}`,
			limit: 5,
		});
	}),
});

export const postRouter = createTRPCRouter({
	create: protectedProcedure
		.input(
			z.object({
				content: z.string().min(1),
				hashtags: z.array(z.string()).optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			return await ctx.db.transaction(async (tx) => {
				const [post] = await tx
					.insert(posts)
					.values({
						content: input.content,
						createdById: ctx.session.user.id,
					})
					.returning();

				if (input.hashtags?.length) {
					const normalizedTags = input.hashtags.map((tag) => tag.toLowerCase().replace(/^#/, ""));

					const hashtagRecords = await Promise.all(
						normalizedTags.map(async (tagName) => {
							const [existing] = await tx.select().from(hashtags).where(eq(hashtags.name, tagName));

							if (existing) return existing;

							const [newTag] = await tx.insert(hashtags).values({ name: tagName }).returning();

							return newTag;
						}),
					);

					await tx.insert(postHashtags).values(
						hashtagRecords.map((tag) => ({
							postId: post.id,
							hashtagId: tag.id,
						})),
					);
				}

				return post;
			});
		}),
});
