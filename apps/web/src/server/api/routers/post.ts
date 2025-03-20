import { createTRPCRouter, protectedProcedure, publicProcedure } from "@/server/api/trpc";
import {
	and,
	comments,
	countDistinct,
	desc,
	eq,
	getISOFormatDateQuery,
	hashtags,
	isNull,
	postHashtags,
	postLikes,
	posts as postsTable,
	reposts,
	sql,
	users,
} from "@repo/database";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
	createCommentNotification,
	createLikeNotification,
	createMentionNotification,
	createRepostNotification,
} from "../routers/notifications";

export const postRouter = createTRPCRouter({
	create: protectedProcedure
		.input(
			z.object({
				content: z.string().min(1),
				hashtags: z.array(z.string()).optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			return await ctx.db.transaction(async (tx) => {
				const [post] = await tx
					.insert(postsTable)
					.values({
						content: input.content,
						createdById: ctx.session.user.id,
					})
					.returning();

				if (input.hashtags?.length) {
					const normalizedTags = [...new Set(input.hashtags.map((tag) => tag.toLowerCase().trim()))];
					const hashtagRecords = await Promise.all(
						normalizedTags.map(async (tagName) => {
							const [existing] = await tx.select().from(hashtags).where(eq(hashtags.name, tagName));
							if (existing) return existing;
							const [newTag] = await tx.insert(hashtags).values({ name: tagName }).returning();
							return newTag;
						}),
					);

					await tx.insert(postHashtags).values(
						hashtagRecords.map((tag) => ({
							postId: post.id,
							hashtagId: tag.id,
						})),
					);
				}

				const postWithRelations = await tx.query.posts.findFirst({
					where: eq(postsTable.id, post.id),
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
						postHashtags: {
							with: {
								hashtag: true,
							},
						},
					},
				});

				if (!postWithRelations) {
					throw new TRPCError({
						code: "INTERNAL_SERVER_ERROR",
						message: "Failed to create post",
					});
				}

				return {
					...postWithRelations,
					likes: postWithRelations.postLikes.length,
					reposts: postWithRelations.reposts.length,
					commentsCount: postWithRelations.postComments.length,
					hasLiked: false,
					hasReposted: false,
					isBookmarked: false,
					hashtags: postWithRelations.postHashtags.map((ph) => ph.hashtag.name),
				};
			});
		}),

	getLatest: publicProcedure.query(async ({ ctx }) => {
		const posts = await ctx.db.query.posts.findMany({
			orderBy: (postsTable, { desc }) => [desc(postsTable.createdAt)],
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
				postHashtags: {
					with: {
						hashtag: true,
					},
				},
			},
			limit: 10,
		});

		return posts.map((post) => ({
			...post,
			likes: post.postLikes.length,
			reposts: post.reposts.length,
			commentsCount: post.postComments.length,
			hasLiked: post.postLikes.some((like) => like.userId === ctx.session?.user?.id),
			hasReposted: post.reposts.some((repost) => repost.userId === ctx.session?.user?.id),
			isBookmarked: post.bookmarks.some((bookmark) => bookmark.userId === ctx.session?.user?.id),
			hashtags: post.postHashtags.map((ph) => ph.hashtag.name),
		}));
	}),

	getByPostId: publicProcedure.input(z.object({ postId: z.number() })).query(async ({ ctx, input }) => {
		const post = await ctx.db.query.posts.findFirst({
			where: eq(postsTable.id, input.postId),
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
				bookmarks: true,
				postHashtags: {
					with: {
						hashtag: true,
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
			hasLiked: post.postLikes.some((like) => like.userId === ctx.session?.user?.id),
			hasReposted: post.reposts.some((repost) => repost.userId === ctx.session?.user?.id),
			isBookmarked: post.bookmarks.some((bookmark) => bookmark.userId === ctx.session?.user?.id),
			hashtags: post.postHashtags.map((ph) => ph.hashtag.name),
		};
	}),

	toggleLike: protectedProcedure.input(z.object({ postId: z.number() })).mutation(async ({ ctx, input }) => {
		const post = await ctx.db.query.posts.findFirst({
			where: eq(postsTable.id, input.postId),
			with: {
				author: {
					columns: {
						id: true,
						username: true,
					},
				},
			},
		});

		if (!post || !post.author) {
			throw new TRPCError({
				code: "NOT_FOUND",
				message: "Post not found",
			});
		}

		const existingLike = await ctx.db.query.postLikes.findFirst({
			where: and(eq(postLikes.postId, input.postId), eq(postLikes.userId, ctx.session.user.id)),
		});

		if (!existingLike && post.author.id !== ctx.session.user.id) {
			await createLikeNotification(ctx, post.author.id, input.postId);
		}

		if (existingLike) {
			await ctx.db
				.delete(postLikes)
				.where(and(eq(postLikes.postId, input.postId), eq(postLikes.userId, ctx.session.user.id)));
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
			const post = await ctx.db.query.posts.findFirst({
				where: eq(postsTable.id, input.postId),
				with: {
					author: {
						columns: {
							id: true,
							username: true,
						},
					},
				},
			});

			if (!post || !post.author.id) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Post not found",
				});
			}

			const mentions = input.content.match(/@(\w+)/g);
			if (mentions) {
				await Promise.all(
					mentions.map(async (mention) => {
						const username = mention.slice(1);
						const user = await ctx.db.query.users.findFirst({
							where: eq(users.username, username),
						});
						if (user) {
							await createMentionNotification(ctx, user.id, input.postId);
						}
					}),
				);
			}

			const [comment] = await ctx.db.transaction(async (tx) => {
				const [updated] = await tx
					.update(postsTable)
					.set({ commentCount: sql`${postsTable.commentCount} + 1` })
					.where(eq(postsTable.id, input.postId))
					.returning({ commentCount: postsTable.commentCount });

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
						createdAt: getISOFormatDateQuery(comments.createdAt).as("created_at"),
						commentCounts: comments.commentCounts,
					});
			});

			if (post.author.id !== ctx.session.user.id) {
				await createCommentNotification(ctx, post.author.id, input.postId, comment.id);
			}
			return comment;
		}),

	getComments: publicProcedure.input(z.object({ postId: z.number() })).query(async ({ ctx, input }) => {
		const [postExists] = await ctx.db
			.select({ exists: sql`1` })
			.from(postsTable)
			.where(eq(postsTable.id, input.postId))
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
			.where(and(eq(comments.postId, input.postId), isNull(comments.parentCommentId)));

		const allComments = await ctx.db.query.comments.findMany({
			where: and(eq(comments.postId, input.postId), isNull(comments.parentCommentId)),
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
						createdAt: getISOFormatDateQuery(comments.createdAt).as("created_at"),
					},
				},
			},
			extras: {
				createdAt: getISOFormatDateQuery(comments.createdAt).as("created_at"),
			},
		});

		return allComments;
	}),

	repost: protectedProcedure.input(z.object({ postId: z.number() })).mutation(async ({ ctx, input }) => {
		const post = await ctx.db.query.posts.findFirst({
			where: eq(postsTable.id, input.postId),
			with: {
				author: {
					columns: {
						id: true,
						username: true,
					},
				},
			},
		});

		if (!post || !post.author.id) {
			throw new TRPCError({
				code: "NOT_FOUND",
				message: "Post not found",
			});
		}

		const existing = await ctx.db.query.reposts.findFirst({
			where: and(eq(reposts.postId, input.postId), eq(reposts.userId, ctx.session.user.id)),
		});

		if (!existing && post.author.id !== ctx.session.user.id) {
			await createRepostNotification(ctx, post.author.id, input.postId);
		}

		if (existing) {
			await ctx.db.delete(reposts).where(eq(reposts.id, existing.id));
		} else {
			await ctx.db.insert(reposts).values({
				postId: input.postId,
				userId: ctx.session.user.id,
			});
		}

		return { success: true };
	}),

	toggleRepost: protectedProcedure.input(z.object({ postId: z.number() })).mutation(async ({ ctx, input }) => {
		const existingRepost = await ctx.db.query.reposts.findFirst({
			where: and(eq(reposts.postId, input.postId), eq(reposts.userId, ctx.session.user.id)),
		});

		if (existingRepost) {
			await ctx.db
				.delete(reposts)
				.where(and(eq(reposts.postId, input.postId), eq(reposts.userId, ctx.session.user.id)));
		} else {
			await ctx.db.insert(reposts).values({
				postId: input.postId,
				userId: ctx.session.user.id,
			});
		}
	}),

	feed: publicProcedure
		.input(
			z.object({
				limit: z.number().min(1).max(100).default(10),
				cursor: z.number().nullish(),
			}),
		)
		.query(async ({ ctx, input }) => {
			const { limit, cursor } = input;

			const posts = await ctx.db.query.posts.findMany({
				limit: limit + 1,
				where: cursor ? sql`id < ${cursor}` : undefined,
				orderBy: [desc(postsTable.id)],
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
					postHashtags: {
						with: {
							hashtag: true,
						},
					},
				},
			});

			let nextCursor: typeof cursor = undefined;
			if (posts.length > limit) {
				const nextItem = posts.pop();
				nextCursor = nextItem?.id;
			}

			return {
				items: posts.map((post) => ({
					...post,
					likes: post.postLikes.length,
					reposts: post.reposts.length,
					commentsCount: post.postComments.length,
					hasLiked: post.postLikes.some((like) => like.userId === ctx.session?.user?.id),
					hasReposted: post.reposts.some((repost) => repost.userId === ctx.session?.user?.id),
					isBookmarked: post.bookmarks.some((bookmark) => bookmark.userId === ctx.session?.user?.id),
					hashtags: post.postHashtags.map((ph) => ph.hashtag.name),
				})),
				nextCursor,
			};
		}),
});
