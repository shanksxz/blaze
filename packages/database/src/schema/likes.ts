import { relations, sql } from "drizzle-orm";
import { integer, pgTable, serial, timestamp, varchar } from "drizzle-orm/pg-core";
import { comments, posts, users } from "./index";

export const postLikes = pgTable("post_likes", {
	id: serial("id").primaryKey(),
	postId: integer("post_id")
		.notNull()
		.references(() => posts.id),
	userId: varchar("user_id", { length: 255 })
		.notNull()
		.references(() => users.id),
	createdAt: timestamp("created_at", { withTimezone: true }).default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const postLikesRelations = relations(postLikes, ({ one }) => ({
	post: one(posts, {
		fields: [postLikes.postId],
		references: [posts.id],
		relationName: "postLikes",
	}),
	author: one(users, {
		fields: [postLikes.userId],
		references: [users.id],
		relationName: "author",
	}),
}));

export const commentLikes = pgTable("comment_likes", {
	id: serial("id").primaryKey(),
	commentId: integer("comment_id")
		.notNull()
		.references(() => comments.id),
	userId: varchar("user_id", { length: 255 })
		.notNull()
		.references(() => users.id),
	createdAt: timestamp("created_at", { withTimezone: true }).default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const commentLikesRelations = relations(commentLikes, ({ one }) => ({
	comment: one(comments, {
		fields: [commentLikes.commentId],
		references: [comments.id],
		relationName: "commentLikes",
	}),
	author: one(users, {
		fields: [commentLikes.userId],
		references: [users.id],
		relationName: "author",
	}),
}));
