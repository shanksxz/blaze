import {
	createTRPCRouter,
	protectedProcedure,
	publicProcedure,
} from "@/server/api/trpc";
import {
	and,
	comments,
	countDistinct,
	eq,
	getISOFormatDateQuery,
	isNull,
	postLikes,
	posts,
	reposts,
	sql,
} from "@repo/database";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const postRouter = createTRPCRouter({
	create: protectedProcedure
		.input(z.object({ content: z.string().min(1) }))
		.mutation(async ({ ctx, input }) => {
			await ctx.db.insert(posts).values({
				content: input.content,
				createdById: ctx.session.user.id,
			});
		}),

	getLatest: publicProcedure.query(async ({ ctx }) => {
		const posts = await ctx.db.query.posts.findMany({
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
			},
			limit: 10,
		});

		return posts.map((post) => ({
			...post,
			likes: post.postLikes.length,
			reposts: post.reposts.length,
			commentsCount: post.postComments.length,
			hasLiked: post.postLikes.some(
				(like) => like.userId === ctx.session?.user?.id,
			),
			hasReposted: post.reposts.some(
				(repost) => repost.userId === ctx.session?.user?.id,
			),
		}));
	}),

	getByPostId: publicProcedure
		.input(z.object({ postId: z.string() }))
		.query(async ({ ctx, input }) => {
			const post = await ctx.db.query.posts.findFirst({
				where: eq(posts.id, Number.parseInt(input.postId)),
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
					postComments: {
						with: {
							author: {
								columns: {
									name: true,
									image: true,
									username: true,
								},
							},
							childComments: true,
						},
					},
				},
			});

			if (!post) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Post not found",
				});
			}

			return {
				...post,
				likes: post.postLikes.length,
				reposts: post.reposts.length,
				commentsCount: post.postComments.length,
				hasLiked: post.postLikes.some(
					(like) => like.userId === ctx.session?.user?.id,
				),
				hasReposted: post.reposts.some(
					(repost) => repost.userId === ctx.session?.user?.id,
				),
			};
		}),

	toggleLike: protectedProcedure
		.input(z.object({ postId: z.number() }))
		.mutation(async ({ ctx, input }) => {
			const existingLike = await ctx.db.query.postLikes.findFirst({
				where: and(
					eq(postLikes.postId, input.postId),
					eq(postLikes.userId, ctx.session.user.id),
				),
			});

			if (existingLike) {
				await ctx.db
					.delete(postLikes)
					.where(
						and(
							eq(postLikes.postId, input.postId),
							eq(postLikes.userId, ctx.session.user.id),
						),
					);
			} else {
				await ctx.db.insert(postLikes).values({
					postId: input.postId,
					userId: ctx.session.user.id,
				});
			}
		}),

	addComment: protectedProcedure
		.input(
			z.object({
				postId: z.number(),
				content: z.string().min(1),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const [comment] = await ctx.db.transaction(async (tx) => {
				const [updated] = await tx
					.update(posts)
					.set({ commentCount: sql`${posts.commentCount} + 1` })
					.where(eq(posts.id, input.postId))
					.returning({ commentCount: posts.commentCount });

				if (!updated) {
					throw new TRPCError({
						code: "NOT_FOUND",
						message: "Post not found",
					});
				}

				return await tx
					.insert(comments)
					.values({
						postId: input.postId,
						userId: ctx.session.user.id,
						content: input.content,
					})
					.returning({
						id: comments.id,
						postId: comments.postId,
						userId: comments.userId,
						content: comments.content,
						parentCommentId: comments.parentCommentId,
						depth: comments.depth,
						createdAt: getISOFormatDateQuery(comments.createdAt).as(
							"created_at",
						),
						commentCounts: comments.commentCounts,
					});
			});

			return comment;
		}),

	getComments: publicProcedure
		.input(z.object({ postId: z.number() }))
		.query(async ({ ctx, input }) => {
			const [postExists] = await ctx.db
				.select({ exists: sql`1` })
				.from(posts)
				.where(eq(posts.id, input.postId))
				.limit(1);

			if (!postExists) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Post not found",
				});
			}

			const [count] = await ctx.db
				.select({ count: countDistinct(comments.id) })
				.from(comments)
				.where(
					and(
						eq(comments.postId, input.postId),
						isNull(comments.parentCommentId),
					),
				);

			const allComments = await ctx.db.query.comments.findMany({
				where: and(
					eq(comments.postId, input.postId),
					isNull(comments.parentCommentId),
				),
				with: {
					author: {
						columns: {
							username: true,
							id: true,
							image: true,
						},
					},
					childComments: {
						limit: 2,
						with: {
							author: {
								columns: {
									username: true,
									id: true,
									image: true,
								},
							},
						},
						extras: {
							createdAt: getISOFormatDateQuery(comments.createdAt).as(
								"created_at",
							),
						},
					},
				},
				extras: {
					createdAt: getISOFormatDateQuery(comments.createdAt).as("created_at"),
				},
			});

			return allComments;
		}),

	repost: protectedProcedure
		.input(z.object({ postId: z.number() }))
		.mutation(async ({ ctx, input }) => {
			const existingRepost = await ctx.db.query.reposts.findFirst({
				where: and(
					eq(reposts.postId, input.postId),
					eq(reposts.userId, ctx.session.user.id),
				),
			});

			if (existingRepost) {
				throw new TRPCError({
					code: "CONFLICT",
					message: "Already reposted",
				});
			}

			await ctx.db.insert(reposts).values({
				postId: input.postId,
				userId: ctx.session.user.id,
			});
		}),

	toggleRepost: protectedProcedure
		.input(z.object({ postId: z.number() }))
		.mutation(async ({ ctx, input }) => {
			const existingRepost = await ctx.db.query.reposts.findFirst({
				where: and(
					eq(reposts.postId, input.postId),
					eq(reposts.userId, ctx.session.user.id),
				),
			});

			if (existingRepost) {
				await ctx.db
					.delete(reposts)
					.where(
						and(
							eq(reposts.postId, input.postId),
							eq(reposts.userId, ctx.session.user.id),
						),
					);
			} else {
				await ctx.db.insert(reposts).values({
					postId: input.postId,
					userId: ctx.session.user.id,
				});
			}
		}),
});
