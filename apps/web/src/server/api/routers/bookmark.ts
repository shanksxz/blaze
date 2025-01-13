import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { and, bookmarks, eq } from "@repo/database";
import { z } from "zod";

export const bookmarkRouter = createTRPCRouter({
	toggle: protectedProcedure.input(z.object({ postId: z.number() })).mutation(async ({ ctx, input }) => {
		const existingBookmark = await ctx.db.query.bookmarks.findFirst({
			where: and(eq(bookmarks.postId, input.postId), eq(bookmarks.userId, ctx.session.user.id)),
		});

		if (existingBookmark) {
			await ctx.db
				.delete(bookmarks)
				.where(and(eq(bookmarks.postId, input.postId), eq(bookmarks.userId, ctx.session.user.id)));
			return { bookmarked: false };
		}

		await ctx.db.insert(bookmarks).values({
			postId: input.postId,
			userId: ctx.session.user.id,
		});
		return { bookmarked: true };
	}),

	getBookmarkStatus: protectedProcedure.input(z.object({ postId: z.number() })).query(async ({ ctx, input }) => {
		const bookmark = await ctx.db.query.bookmarks.findFirst({
			where: and(eq(bookmarks.postId, input.postId), eq(bookmarks.userId, ctx.session.user.id)),
		});
		return { bookmarked: !!bookmark };
	}),

	getBookmarkedPosts: protectedProcedure.query(async ({ ctx }) => {
		const posts = await ctx.db.query.bookmarks.findMany({
			where: eq(bookmarks.userId, ctx.session.user.id),
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
					},
				},
			},
			orderBy: (bookmarks, { desc }) => [desc(bookmarks.createdAt)],
		});

		return posts.map(({ post }) => ({
			...post,
			likes: post.postLikes.length,
			reposts: post.reposts.length,
			commentsCount: post.postComments.length,
			hasLiked: post.postLikes.some((like) => like.userId === ctx.session.user.id),
			hasReposted: post.reposts.some((repost) => repost.userId === ctx.session.user.id),
			isBookmarked: post.bookmarks.some((bookmark) => bookmark.userId === ctx.session.user.id),
		}));
	}),
});
