import { relations, sql } from "drizzle-orm";
import { integer, pgTable, serial, timestamp, varchar } from "drizzle-orm/pg-core";
import { posts, users } from "./index";
import { commentLikes } from "./likes";

export const comments = pgTable("comments", {
	id: serial("id").primaryKey(),
	postId: integer("post_id")
		.notNull()
		.references(() => posts.id),
	userId: varchar("user_id", { length: 255 })
		.notNull()
		.references(() => users.id),
	parentCommentId: integer("parent_comment_id"),
	content: varchar("content", { length: 256 }).notNull(),
	commentCounts: integer("comment_counts").default(0).notNull(),
	depth: integer("depth").default(0).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(() => new Date()),
});

export const commentsRelations = relations(comments, ({ one, many }) => ({
	post: one(posts, {
		fields: [comments.postId],
		references: [posts.id],
		relationName: "postComments",
	}),
	author: one(users, {
		fields: [comments.userId],
		references: [users.id],
		relationName: "author",
	}),
	parentComment: one(comments, {
		fields: [comments.parentCommentId],
		references: [comments.id],
		relationName: "childComments",
	}),
	childComments: many(comments, { relationName: "childComments" }),
	commentLikes: many(commentLikes, {
		relationName: "commentLikes",
	}),
}));
