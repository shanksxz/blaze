import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { and, comments, desc, eq, follows, postLikes, posts as postsTable, reposts, sql, users } from "@repo/database";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createFollowNotification } from "../routers/notifications";

export const userRouter = createTRPCRouter({
	profile: protectedProcedure.input(z.object({ username: z.string().min(3) })).query(async ({ ctx, input }) => {
		console.log("profile", input.username);
		const user = await ctx.db.query.users.findFirst({
			where: eq(users.username, input.username),
			with: {
				postLikes: {
					with: {
						post: true,
					},
				},
				commentLikes: {
					with: {
						comment: true,
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
			.from(follows)
			.where(eq(follows.followingId, user.id));

		const followingCount = await ctx.db
			.select({ count: sql<number>`count(*)` })
			.from(follows)
			.where(eq(follows.followerId, user.id));

		if (ctx.session.user.id === user.id) {
			return {
				...user,
				isCurrentUser: true,
				isFollowing: false,
				followers: followerCount[0]?.count ?? 0,
				following: followingCount[0]?.count ?? 0,
			};
		}

		const followRecord = await ctx.db.query.follows.findFirst({
			where: and(eq(follows.followerId, ctx.session.user.id), eq(follows.followingId, user.id)),
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
		.input(
			z.object({
				userId: z.string(),
				limit: z.number().min(1).max(100).default(10),
				cursor: z.number().nullish(),
			}),
		)
		.query(async ({ ctx, input }) => {
			const { userId, limit, cursor } = input;

			const result = await ctx.db
				.select({
					id: postsTable.id,
					content: postsTable.content,
					createdAt: postsTable.createdAt,
					updatedAt: postsTable.updatedAt,
					createdById: postsTable.createdById,
					comments: sql<number>`count(distinct ${comments.id})`,
					reposts: sql<number>`count(distinct ${reposts.id})`,
					likes: sql<number>`count(distinct ${postLikes.id})`,
					hasLiked: sql<boolean>`exists(select 1 from ${postLikes} where ${postLikes.postId} = ${postsTable.id} and ${postLikes.userId} = ${ctx.session.user.id})`,
					hasReposted: sql<boolean>`exists(select 1 from ${reposts} where ${reposts.postId} = ${postsTable.id} and ${reposts.userId} = ${ctx.session.user.id})`,
					createdBy: {
						name: users.name,
						image: users.image,
						username: users.username,
					},
				})
				.from(postsTable)
				.leftJoin(comments, eq(comments.postId, postsTable.id))
				.leftJoin(reposts, eq(reposts.postId, postsTable.id))
				.leftJoin(postLikes, eq(postLikes.postId, postsTable.id))
				.leftJoin(users, eq(users.id, postsTable.createdById))
				.where(
					cursor
						? and(eq(postsTable.createdById, userId), sql`${postsTable.id} < ${cursor}`)
						: eq(postsTable.createdById, userId),
				)
				.groupBy(postsTable.id, users.id, users.name, users.image, users.username)
				.orderBy(desc(postsTable.id))
				.limit(limit + 1);

			let nextCursor: typeof cursor = undefined;
			if (result.length > limit) {
				const nextItem = result.pop();
				nextCursor = nextItem?.id;
			}

			return {
				items: result,
				nextCursor,
			};
		}),

	toggleFollow: protectedProcedure.input(z.object({ userId: z.string() })).mutation(async ({ ctx, input }) => {
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

		const existing = await ctx.db.query.follows.findFirst({
			where: and(eq(follows.followerId, ctx.session.user.id), eq(follows.followingId, input.userId)),
		});

		if (!existing) {
			await createFollowNotification(ctx, targetUser.id);
		}

		if (existing) {
			await ctx.db.delete(follows).where(eq(follows.id, existing.id));
		} else {
			await ctx.db.insert(follows).values({
				followerId: ctx.session.user.id,
				followingId: input.userId,
			});
		}

		return { success: true };
	}),

	likes: protectedProcedure.input(z.object({ userId: z.string() })).query(async ({ ctx, input }) => {
		const likedPosts = await ctx.db
			.select({
				id: postsTable.id,
				content: postsTable.content,
				createdAt: postsTable.createdAt,
				updatedAt: postsTable.updatedAt,
				createdById: postsTable.createdById,
				comments: sql<number>`count(distinct ${comments.id})`,
				reposts: sql<number>`count(distinct ${reposts.id})`,
				likes: sql<number>`count(distinct ${postLikes.id})`,
				hasLiked: sql<boolean>`exists(select 1 from ${postLikes} where ${postLikes.postId} = ${postsTable.id} and ${postLikes.userId} = ${ctx.session.user.id})`,
				hasReposted: sql<boolean>`exists(select 1 from ${reposts} where ${reposts.postId} = ${postsTable.id} and ${reposts.userId} = ${ctx.session.user.id})`,
				createdBy: {
					name: users.name,
					image: users.image,
					username: users.username,
				},
			})
			.from(postsTable)
			.leftJoin(comments, eq(comments.postId, postsTable.id))
			.leftJoin(reposts, eq(reposts.postId, postsTable.id))
			.leftJoin(postLikes, eq(postLikes.postId, postsTable.id))
			.leftJoin(users, eq(users.id, postsTable.createdById))
			.where(eq(postLikes.userId, input.userId))
			.groupBy(postsTable.id, users.id)
			.orderBy(desc(postsTable.createdAt));

		return likedPosts;
	}),
});
