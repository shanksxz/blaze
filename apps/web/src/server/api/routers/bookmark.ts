import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { and, bookmarks as bookmarksTable, desc, eq, sql } from "@repo/database";
import { z } from "zod";

export const bookmarkRouter = createTRPCRouter({
	toggle: protectedProcedure.input(z.object({ postId: z.number() })).mutation(async ({ ctx, input }) => {
		const existingBookmark = await ctx.db.query.bookmarks.findFirst({
			where: and(eq(bookmarksTable.postId, input.postId), eq(bookmarksTable.userId, ctx.session.user.id)),
		});

		if (existingBookmark) {
			await ctx.db
				.delete(bookmarksTable)
				.where(and(eq(bookmarksTable.postId, input.postId), eq(bookmarksTable.userId, ctx.session.user.id)));
			return { bookmarked: false };
		}

		await ctx.db.insert(bookmarksTable).values({
			postId: input.postId,
			userId: ctx.session.user.id,
		});
		return { bookmarked: true };
	}),

	getBookmarkStatus: protectedProcedure.input(z.object({ postId: z.number() })).query(async ({ ctx, input }) => {
		const bookmark = await ctx.db.query.bookmarks.findFirst({
			where: and(eq(bookmarksTable.postId, input.postId), eq(bookmarksTable.userId, ctx.session.user.id)),
		});
		return { bookmarked: !!bookmark };
	}),

	getBookmarkedPosts: protectedProcedure
		.input(
			z.object({
				limit: z.number().min(1).max(100).default(10),
				cursor: z.number().nullish(),
			}),
		)
		.query(async ({ ctx, input }) => {
			const { limit, cursor } = input;

			const bookmarks = await ctx.db.query.bookmarks.findMany({
				limit: limit + 1,
				where: cursor ? sql`id < ${cursor}` : undefined,
				orderBy: [desc(bookmarksTable.id)],
				with: {
					post: {
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
					},
				},
			});

			let nextCursor: typeof cursor = undefined;
			if (bookmarks.length > limit) {
				const nextItem = bookmarks.pop();
				nextCursor = nextItem?.id;
			}

			return {
				items: bookmarks.map(({ post }) => ({
					...post,
					likes: post.postLikes.length,
					reposts: post.reposts.length,
					commentsCount: post.postComments.length,
					hasLiked: post.postLikes.some((like) => like.userId === ctx.session.user.id),
					hasReposted: post.reposts.some((repost) => repost.userId === ctx.session.user.id),
					isBookmarked: post.bookmarks.some((bookmark) => bookmark.userId === ctx.session.user.id),
					hashtags: post.postHashtags.map((ph) => ph.hashtag.name),
				})),
				nextCursor,
			};
		}),
});
