import { TRPCError } from "@trpc/server";
import { and, eq, sql, desc } from "drizzle-orm";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { follow, post, users, comment, repost, like } from "~/server/db/schema";

export const userRouter = createTRPCRouter({
  setup: protectedProcedure
    .input(
      z.object({
        username: z
          .string()
          .min(3)
          .max(30)
          .regex(/^[a-zA-Z0-9_]+$/),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const currentUser = await ctx.db.query.users.findFirst({
        where: eq(users.id, ctx.session.user.id),
      });

      if (currentUser?.username) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Username can only be set once",
        });
      }

      const existing = await ctx.db.query.users.findFirst({
        where: eq(users.username, input.username),
      });

      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Username already taken",
        });
      }

      const user = await ctx.db
        .update(users)
        .set({ username: input.username.toLowerCase() })
        .where(eq(users.id, ctx.session.user.id))
        .returning();
      return user[0];
    }),

  profile: protectedProcedure
    .input(z.object({ username: z.string().min(3) }))
    .query(async ({ ctx, input }) => {
      const user = await ctx.db.query.users.findFirst({
        where: eq(users.username, input.username),
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      const followerCount = await ctx.db
        .select({ count: sql<number>`count(*)` })
        .from(follow)
        .where(eq(follow.followingId, user.id));

      const followingCount = await ctx.db
        .select({ count: sql<number>`count(*)` })
        .from(follow)
        .where(eq(follow.followerId, user.id));

      if (ctx.session.user.id === user.id) {
        return {
          ...user,
          isCurrentUser: true,
          isFollowing: false,
          followers: followerCount[0]?.count ?? 0,
          following: followingCount[0]?.count ?? 0,
        };
      }

      const followRecord = await ctx.db.query.follow.findFirst({
        where: and(
          eq(follow.followerId, ctx.session.user.id),
          eq(follow.followingId, user.id)
        ),
      });

      return {
        ...user,
        isCurrentUser: ctx.session.user.id === user.id,
        isFollowing: !!followRecord,
        followers: followerCount[0]?.count ?? 0,
        following: followingCount[0]?.count ?? 0,
      };
    }),

  posts: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      const posts = await ctx.db
        .select({
          id: post.id,
          content: post.content,
          createdAt: post.createdAt,
          comments: sql<number>`count(distinct ${comment.id})`,
          reposts: sql<number>`count(distinct ${repost.id})`,
          likes: sql<number>`count(distinct ${like.id})`,
          createdBy: {
            name: users.name,
            image: users.image,
            username: users.username,
          },
        })
        .from(post)
        .leftJoin(comment, eq(comment.postId, post.id))
        .leftJoin(repost, eq(repost.postId, post.id))
        .leftJoin(like, eq(like.postId, post.id))
        .leftJoin(users, eq(users.id, post.createdById))
        .where(eq(post.createdById, input.userId))
        .groupBy(post.id, users.id, users.name, users.image, users.username)
        .orderBy(desc(post.createdAt));

      return posts;
    }),

  toggleFollow: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (input.userId === ctx.session.user.id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot follow yourself",
        });
      }

      const targetUser = await ctx.db.query.users.findFirst({
        where: eq(users.id, input.userId),
      });

      if (!targetUser) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User to follow not found",
        });
      }

      const existing = await ctx.db.query.follow.findFirst({
        where: and(
          eq(follow.followerId, ctx.session.user.id),
          eq(follow.followingId, input.userId)
        ),
      });

      if (existing) {
        await ctx.db.delete(follow).where(eq(follow.id, existing.id));
      } else {
        await ctx.db.insert(follow).values({
          followerId: ctx.session.user.id,
          followingId: input.userId,
        });
      }

      return { success: true };
    }),
});
