import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { comments, eq, getISOFormatDateQuery, posts, sql } from "@repo/database";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const commentRouter = createTRPCRouter({
	createChildComment: protectedProcedure
		.input(
			z.object({
				content: z.string().min(1),
				parentCommentId: z.number(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const [comment] = await ctx.db.transaction(async (tx) => {
				const [parentComment] = await tx
					.select({
						id: comments.id,
						postId: comments.postId,
						depth: comments.depth,
					})
					.from(comments)
					.where(eq(comments.id, input.parentCommentId))
					.limit(1);

				if (!parentComment) {
					throw new TRPCError({
						code: "NOT_FOUND",
						message: "Parent comment not found",
					});
				}

				const postId = parentComment.postId;

				const [updatedParentComment] = await tx
					.update(comments)
					.set({ commentCounts: sql`${comments.commentCounts} + 1` })
					.where(eq(comments.id, input.parentCommentId))
					.returning({ commentCounts: comments.commentCounts });

				const [updatedPost] = await tx
					.update(posts)
					.set({ commentCount: sql`${posts.commentCount} + 1` })
					.where(eq(posts.id, postId))
					.returning({ commentCounts: posts.commentCount });

				if (!updatedPost || !updatedParentComment) {
					throw new TRPCError({
						code: "NOT_FOUND",
						message: "Post or parent comment not found",
					});
				}

				return await tx
					.insert(comments)
					.values({
						content: input.content,
						postId,
						userId: ctx.session.user.id,
						parentCommentId: input.parentCommentId,
						depth: parentComment.depth + 1,
					})
					.returning({
						id: comments.id,
						postId: comments.postId,
						userId: comments.userId,
						content: comments.content,
						parentCommentId: comments.parentCommentId,
						depth: comments.depth,
						createdAt: getISOFormatDateQuery(comments.createdAt).as("created_at"),
						commentCounts: comments.commentCounts,
					});
			});
			return comment;
		}),
	getChildComments: protectedProcedure
		.input(z.object({ parentCommentId: z.number() }))
		.query(async ({ ctx, input }) => {
			const allComments = await ctx.db.query.comments.findMany({
				where: eq(comments.parentCommentId, input.parentCommentId),
				with: {
					author: {
						columns: {
							id: true,
							username: true,
							image: true,
						},
					},
				},
				extras: {
					createdAt: getISOFormatDateQuery(comments.createdAt).as("created_at"),
				},
			});
			return allComments;
		}),
});
