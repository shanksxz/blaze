import { relations, sql } from "drizzle-orm";
import { integer, pgTable, serial, timestamp, varchar } from "drizzle-orm/pg-core";
import { posts, users } from "./index";

export const bookmarks = pgTable("bookmarks", {
	id: serial("id").primaryKey(),
	postId: integer("post_id")
		.notNull()
		.references(() => posts.id),
	userId: varchar("user_id", { length: 255 })
		.notNull()
		.references(() => users.id),
	createdAt: timestamp("created_at", { withTimezone: true }).default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const bookmarksRelations = relations(bookmarks, ({ one }) => ({
	post: one(posts, {
		fields: [bookmarks.postId],
		references: [posts.id],
		relationName: "postBookmarks",
	}),
	user: one(users, {
		fields: [bookmarks.userId],
		references: [users.id],
		relationName: "authorBookmarks",
	}),
}));
