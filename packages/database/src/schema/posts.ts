import { relations, sql } from "drizzle-orm";
import { integer, pgTable, serial, timestamp, varchar } from "drizzle-orm/pg-core";
import { bookmarks, comments, postLikes, reposts, users } from "./index";

export const posts = pgTable("posts", {
	id: serial("id").primaryKey(),
	content: varchar("content", { length: 256 }),
	commentCount: integer("comment_counts").default(0).notNull(),
	likesCount: integer("likes_count").default(0).notNull(),
	createdById: varchar("created_by", { length: 255 })
		.notNull()
		.references(() => users.id),
	createdAt: timestamp("created_at", { withTimezone: true }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(() => new Date()),
});

export const postsRelations = relations(posts, ({ one, many }) => ({
	author: one(users, {
		fields: [posts.createdById],
		references: [users.id],
		relationName: "author",
	}),
	postLikes: many(postLikes, {
		relationName: "postLikes",
	}),
	reposts: many(reposts, {
		relationName: "reposts",
	}),
	postComments: many(comments, {
		relationName: "postComments",
	}),
	bookmarks: many(bookmarks, {
		relationName: "postBookmarks",
	}),
}));
