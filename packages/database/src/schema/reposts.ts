import { relations, sql } from "drizzle-orm";
import { integer, pgTable, serial, timestamp, varchar } from "drizzle-orm/pg-core";
import { posts } from "./posts";
import { users } from "./users";

export const reposts = pgTable("reposts", {
	id: serial("id").primaryKey(),
	postId: integer("post_id")
		.notNull()
		.references(() => posts.id),
	userId: varchar("user_id", { length: 255 })
		.notNull()
		.references(() => users.id),
	createdAt: timestamp("created_at", { withTimezone: true }).default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const repostsRelations = relations(reposts, ({ one }) => ({
	post: one(posts, {
		fields: [reposts.postId],
		references: [posts.id],
		relationName: "reposts",
	}),
	author: one(users, {
		fields: [reposts.userId],
		references: [users.id],
		relationName: "author",
	}),
}));
