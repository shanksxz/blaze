import { TRPCError } from "@trpc/server";
import { and, eq, sql } from "drizzle-orm";
import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { comment, like, post, repost, users } from "~/server/db/schema";

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

  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const result = await ctx.db
        .select({
          id: post.id,
          content: post.content,
          createdAt: post.createdAt,
          likes: sql<number>`count(distinct ${like.id})`,
          reposts: sql<number>`count(distinct ${repost.id})`,
          comments: sql<number>`count(distinct ${comment.id})`,
          hasLiked: sql<boolean>`EXISTS (
						SELECT 1 FROM ${like} 
						WHERE ${like.postId} = ${post.id} 
						AND ${like.userId} = ${ctx.session?.user?.id}
					)`,
          hasReposted: sql<boolean>`EXISTS (
						SELECT 1 FROM ${repost} 
						WHERE ${repost.postId} = ${post.id} 
						AND ${repost.userId} = ${ctx.session?.user?.id}
					)`,
          author: {
            id: users.id,
            name: users.name,
            image: users.image,
            username: users.username,
          },
        })
        .from(post)
        .leftJoin(like, eq(like.postId, post.id))
        .leftJoin(repost, eq(repost.postId, post.id))
        .leftJoin(comment, eq(comment.postId, post.id))
        .leftJoin(users, eq(users.id, post.createdById))
        .where(eq(post.id, input.id))
        .groupBy(post.id, users.id)
        .then((rows) => rows[0]);

      if (!result) throw new TRPCError({ code: "NOT_FOUND" });
      return result;
    }),

  getAll: publicProcedure.query(async ({ ctx }) => {
    const posts = await ctx.db.query.post.findMany({
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
    });

    return posts.map((post) => ({
      ...post,
      likes: post.likes.length,
      reposts: post.reposts.length,
      comments: post.comments.length,
      hasLiked: post.likes.some(
        (like) => like.userId === ctx.session?.user?.id
      ),
      hasReposted: post.reposts.some(
        (repost) => repost.userId === ctx.session?.user?.id
      ),
    }));
  }),

  toggleLike: protectedProcedure
    .input(z.object({ postId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const existingLike = await ctx.db.query.like.findFirst({
        where: and(
          eq(like.postId, input.postId),
          eq(like.userId, ctx.session.user.id)
        ),
      });

      if (existingLike) {
        await ctx.db
          .delete(like)
          .where(
            and(
              eq(like.postId, input.postId),
              eq(like.userId, ctx.session.user.id)
            )
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
      })
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
    }),

  toggleRepost: protectedProcedure
    .input(z.object({ postId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const existingRepost = await ctx.db.query.repost.findFirst({
        where: and(
          eq(repost.postId, input.postId),
          eq(repost.userId, ctx.session.user.id)
        ),
      });

      if (existingRepost) {
        await ctx.db
          .delete(repost)
          .where(
            and(
              eq(repost.postId, input.postId),
              eq(repost.userId, ctx.session.user.id)
            )
          );
      } else {
        await ctx.db.insert(repost).values({
          postId: input.postId,
          userId: ctx.session.user.id,
        });
      }
    }),
});
