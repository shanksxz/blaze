import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import {
	and,
	comment,
	desc,
	eq,
	follow,
	like,
	posts,
	repost,
	sql,
	users,
} from "@repo/database";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const userRouter = createTRPCRouter({
	setup: protectedProcedure
		.input(
			z.object({
				username: z
					.string()
					.min(3)
					.max(30)
					.regex(/^[a-zA-Z0-9_]+$/),
			}),
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
			console.log("profile", input.username);
			const user = await ctx.db.query.users.findFirst({
				where: eq(users.username, input.username),
				with: {
					likes: {
						with: {
							post: true,
						},
					},
					posts: true,
				},
			});
			console.log("user", user);

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
					eq(follow.followingId, user.id),
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
			const foo = await ctx.db
				.select({
					id: posts.id,
					content: posts.content,
					createdAt: posts.createdAt,
					updatedAt: posts.updatedAt,
					createdById: posts.createdById,
					comments: sql<number>`count(distinct ${comment.id})`,
					reposts: sql<number>`count(distinct ${repost.id})`,
					likes: sql<number>`count(distinct ${like.id})`,
					hasLiked: sql<boolean>`exists(select 1 from ${like} where ${like.postId} = ${posts.id} and ${like.userId} = ${ctx.session.user.id})`,
					hasReposted: sql<boolean>`exists(select 1 from ${repost} where ${repost.postId} = ${posts.id} and ${repost.userId} = ${ctx.session.user.id})`,
					createdBy: {
						name: users.name,
						image: users.image,
						username: users.username,
					},
				})
				.from(posts)
				.leftJoin(comment, eq(comment.postId, posts.id))
				.leftJoin(repost, eq(repost.postId, posts.id))
				.leftJoin(like, eq(like.postId, posts.id))
				.leftJoin(users, eq(users.id, posts.createdById))
				.where(eq(posts.createdById, input.userId))
				.groupBy(posts.id, users.id)
				.orderBy(desc(posts.createdAt));

			return foo;
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
					eq(follow.followingId, input.userId),
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

	likes: protectedProcedure
		.input(z.object({ userId: z.string() }))
		.query(async ({ ctx, input }) => {
			const likedPosts = await ctx.db
				.select({
					id: posts.id,
					content: posts.content,
					createdAt: posts.createdAt,
					updatedAt: posts.updatedAt,
					createdById: posts.createdById,
					comments: sql<number>`count(distinct ${comment.id})`,
					reposts: sql<number>`count(distinct ${repost.id})`,
					likes: sql<number>`count(distinct ${like.id})`,
					hasLiked: sql<boolean>`exists(select 1 from ${like} where ${like.postId} = ${posts.id} and ${like.userId} = ${ctx.session.user.id})`,
					hasReposted: sql<boolean>`exists(select 1 from ${repost} where ${repost.postId} = ${posts.id} and ${repost.userId} = ${ctx.session.user.id})`,
					createdBy: {
						name: users.name,
						image: users.image,
						username: users.username,
					},
				})
				.from(posts)
				.leftJoin(comment, eq(comment.postId, posts.id))
				.leftJoin(repost, eq(repost.postId, posts.id))
				.leftJoin(like, eq(like.postId, posts.id))
				.leftJoin(users, eq(users.id, posts.createdById))
				.where(eq(like.userId, input.userId))
				.groupBy(posts.id, users.id)
				.orderBy(desc(posts.createdAt));

			return likedPosts;
		}),
});
