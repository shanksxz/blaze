import { z } from "zod";
import { eq, and, sql } from "drizzle-orm";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { post, comment, like, repost } from "~/server/db/schema";
import { TRPCError } from "@trpc/server";

export const postRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({ content: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(post).values({
        content: input.content,
        createdById: ctx.session.user.id,
      });
    }),

  getLatest: protectedProcedure.query(async ({ ctx }) => {
    const post = await ctx.db.query.post.findFirst({
      orderBy: (posts, { desc }) => [desc(posts.createdAt)],
    });

    return post ?? null;
  }),

  getAll: publicProcedure.query(async ({ ctx }) => {
    const posts = await ctx.db.query.post.findMany({
      orderBy: (posts, { desc }) => [desc(posts.createdAt)],
      with: {
        createdBy: {
          columns: {
            name: true,
            image: true,
          },
        },
        likes: true,
        reposts: true,
      },
    });

    return posts.map((post) => ({
      ...post,
      likes: post.likes.length,
      reposts: post.reposts.length,
      hasLiked: post.likes.some(
        (like) => like.userId === ctx.session?.user?.id
      ),
      hasReposted: post.reposts.some(
        (repost) => repost.userId === ctx.session?.user?.id
      ),
    }));
  }),

  like: protectedProcedure
    .input(z.object({ postId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const existingLike = await ctx.db.query.like.findFirst({
        where: and(
          eq(like.postId, input.postId),
          eq(like.userId, ctx.session.user.id)
        ),
      });

      if (existingLike) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Already liked",
        });
      }

      await ctx.db.insert(like).values({
        postId: input.postId,
        userId: ctx.session.user.id,
      });

      await ctx.db
        .update(post)
        .set({ likes: sql`${post.likes} + 1` })
        .where(eq(post.id, input.postId));
    }),

  unlike: protectedProcedure
    .input(z.object({ postId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const existingLike = await ctx.db.query.like.findFirst({
        where: and(
          eq(like.postId, input.postId),
          eq(like.userId, ctx.session.user.id)
        ),
      });

      if (!existingLike) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Like not found",
        });
      }

      await ctx.db
        .delete(like)
        .where(
          and(
            eq(like.postId, input.postId),
            eq(like.userId, ctx.session.user.id)
          )
        );

      await ctx.db
        .update(post)
        .set({ likes: sql`${post.likes} - 1` })
        .where(eq(post.id, input.postId));
    }),

  addComment: protectedProcedure
    .input(
      z.object({
        postId: z.number(),
        text: z.string().min(1),
        parentCommentId: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(comment).values({
        postId: input.postId,
        userId: ctx.session.user.id,
        text: input.text,
        parentCommentId: input.parentCommentId,
      });

      await ctx.db
        .update(post)
        .set({ comments: sql`${post.comments} + 1` })
        .where(eq(post.id, input.postId));
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
          eq(repost.userId, ctx.session.user.id)
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

      await ctx.db
        .update(post)
        .set({ reposts: sql`${post.reposts} + 1` })
        .where(eq(post.id, input.postId));
    }),
});
