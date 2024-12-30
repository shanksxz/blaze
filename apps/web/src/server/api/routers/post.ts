import {
	createTRPCRouter,
	protectedProcedure,
	publicProcedure,
} from "@/server/api/trpc";
import { and, comment, eq, like, posts, repost } from "@repo/database";
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
				createdBy: {
					columns: {
						name: true,
						image: true,
						username: true,
					},
				},
				likes: true,
				reposts: true,
				comments: true,
			},
			limit: 10,
		});

		return posts.map((post) => ({
			...post,
			likes: post.likes.length,
			reposts: post.reposts.length,
			commentsCount: post.comments.length,
			hasLiked: post.likes.some(
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
					createdBy: {
						columns: {
							name: true,
							image: true,
							username: true,
						},
					},
					likes: true,
					reposts: true,
					comments: {
						with: {
							user: {
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
				likes: post.likes.length,
				reposts: post.reposts.length,
				commentsCount: post.comments.length,
				hasLiked: post.likes.some(
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
			const existingLike = await ctx.db.query.like.findFirst({
				where: and(
					eq(like.postId, input.postId),
					eq(like.userId, ctx.session.user.id),
				),
			});

			if (existingLike) {
				await ctx.db
					.delete(like)
					.where(
						and(
							eq(like.postId, input.postId),
							eq(like.userId, ctx.session.user.id),
						),
					);
			} else {
				await ctx.db.insert(like).values({
					postId: input.postId,
					userId: ctx.session.user.id,
				});
			}
		}),

	addComment: protectedProcedure
		.input(
			z.object({
				postId: z.number(),
				text: z.string().min(1),
				parentCommentId: z.number().optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			await ctx.db.insert(comment).values({
				postId: input.postId,
				userId: ctx.session.user.id,
				text: input.text,
				parentCommentId: input.parentCommentId,
			});
		}),

	getComments: publicProcedure
		.input(z.object({ postId: z.number() }))
		.query(async ({ ctx, input }) => {
			const comments = await ctx.db.query.comment.findMany({
				where: eq(comment.postId, input.postId),
				with: {
					user: true,
					childComments: true,
				},
				orderBy: (comments, { desc }) => [desc(comments.createdAt)],
			});
			return comments;
		}),

	repost: protectedProcedure
		.input(z.object({ postId: z.number() }))
		.mutation(async ({ ctx, input }) => {
			const existingRepost = await ctx.db.query.repost.findFirst({
				where: and(
					eq(repost.postId, input.postId),
					eq(repost.userId, ctx.session.user.id),
				),
			});

			if (existingRepost) {
				throw new TRPCError({
					code: "CONFLICT",
					message: "Already reposted",
				});
			}

			await ctx.db.insert(repost).values({
				postId: input.postId,
				userId: ctx.session.user.id,
			});
		}),

	toggleRepost: protectedProcedure
		.input(z.object({ postId: z.number() }))
		.mutation(async ({ ctx, input }) => {
			const existingRepost = await ctx.db.query.repost.findFirst({
				where: and(
					eq(repost.postId, input.postId),
					eq(repost.userId, ctx.session.user.id),
				),
			});

			if (existingRepost) {
				await ctx.db
					.delete(repost)
					.where(
						and(
							eq(repost.postId, input.postId),
							eq(repost.userId, ctx.session.user.id),
						),
					);
			} else {
				await ctx.db.insert(repost).values({
					postId: input.postId,
					userId: ctx.session.user.id,
				});
			}
		}),
});
