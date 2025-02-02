import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import type { Context } from "@/server/api/trpc";
import { and, eq, gt, inArray, notifications, sql, users } from "@repo/database";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

const notificationDataSchema = z.object({
	type: z.enum(["like", "comment", "follow", "mention", "repost"]),
	message: z.string(),
	metadata: z
		.object({
			actorId: z.string().optional(),
			postId: z.number().optional(),
			commentId: z.number().optional(),
		})
		.optional(),
});

export const notificationRouter = createTRPCRouter({
	getNotifications: protectedProcedure
		.input(
			z.object({
				since: z
					.date()
					.optional()
					.default(() => new Date(0)),
			}),
		)
		.query(async ({ ctx, input }) => {
			const dbNotifications = await ctx.db.query.notifications.findMany({
				where: and(eq(notifications.userId, ctx.session.user.id), gt(notifications.createdAt, input.since)),
				orderBy: (notifications, { desc }) => [desc(notifications.createdAt)],
				with: {
					actor: true,
					post: true,
					comment: true,
				},
			});

			return dbNotifications;
		}),

	markAsRead: protectedProcedure
		.input(
			z.object({
				notificationIds: z.array(z.number()),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			await ctx.db
				.update(notifications)
				.set({ read: true })
				.where(
					and(
						eq(notifications.userId, ctx.session.user.id),
						inArray(notifications.id, input.notificationIds),
					),
				);
			return { success: true };
		}),

	createNotification: protectedProcedure
		.input(
			z.object({
				receiverUsername: z.string(),
				data: notificationDataSchema,
				postId: z.number().optional(),
				commentId: z.number().optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const receiver = await ctx.db.query.users.findFirst({
				where: eq(users.username, input.receiverUsername),
			});

			if (!receiver) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Receiver not found",
				});
			}

			const [notification] = await ctx.db
				.insert(notifications)
				.values({
					userId: receiver.id,
					actorId: ctx.session.user.id,
					type: input.data.type,
					postId: input.postId,
					commentId: input.commentId,
					read: false,
				})
				.returning();

			return notification;
		}),

	getUnreadCount: protectedProcedure.query(async ({ ctx }) => {
		const [result] = await ctx.db
			.select({ count: sql<number>`count(*)` })
			.from(notifications)
			.where(and(eq(notifications.userId, ctx.session.user.id), eq(notifications.read, false)));

		return { count: result?.count ?? 0 };
	}),

	markAllAsRead: protectedProcedure.mutation(async ({ ctx }) => {
		await ctx.db
			.update(notifications)
			.set({ read: true })
			.where(and(eq(notifications.userId, ctx.session.user.id), eq(notifications.read, false)));
		return { success: true };
	}),

	deleteNotification: protectedProcedure
		.input(
			z.object({
				notificationId: z.number(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			await ctx.db
				.delete(notifications)
				.where(and(eq(notifications.id, input.notificationId), eq(notifications.userId, ctx.session.user.id)));
			return { success: true };
		}),
});

export const createLikeNotification = async (ctx: Context, userId: string, postId: number) => {
	if (!ctx.session) throw new TRPCError({ code: "UNAUTHORIZED" });

	const [notification] = await ctx.db
		.insert(notifications)
		.values({
			userId: userId,
			actorId: ctx.session.user.id,
			type: "like",
			postId,
			read: false,
		})
		.returning();

	return notification;
};

export const createCommentNotification = async (ctx: Context, userId: string, postId: number, commentId: number) => {
	if (!ctx.session) throw new TRPCError({ code: "UNAUTHORIZED" });

	const [notification] = await ctx.db
		.insert(notifications)
		.values({
			userId: userId,
			actorId: ctx.session.user.id,
			type: "comment",
			postId,
			commentId,
			read: false,
		})
		.returning();

	return notification;
};

export const createFollowNotification = async (ctx: Context, userId: string) => {
	if (!ctx.session) throw new TRPCError({ code: "UNAUTHORIZED" });

	const [notification] = await ctx.db
		.insert(notifications)
		.values({
			userId: userId,
			actorId: ctx.session.user.id,
			type: "follow",
			read: false,
		})
		.returning();

	return notification;
};

export const createMentionNotification = async (ctx: Context, userId: string, postId: number) => {
	if (!ctx.session) throw new TRPCError({ code: "UNAUTHORIZED" });

	const [notification] = await ctx.db
		.insert(notifications)
		.values({
			userId: userId,
			actorId: ctx.session.user.id,
			type: "mention",
			postId,
			read: false,
		})
		.returning();

	return notification;
};

export const createRepostNotification = async (ctx: Context, userId: string, postId: number) => {
	if (!ctx.session) throw new TRPCError({ code: "UNAUTHORIZED" });

	const [notification] = await ctx.db
		.insert(notifications)
		.values({
			userId: userId,
			actorId: ctx.session.user.id,
			type: "repost",
			postId,
			read: false,
		})
		.returning();

	return notification;
};
