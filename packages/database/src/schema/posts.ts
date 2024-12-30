import { relations, sql } from "drizzle-orm";
import { pgTable, serial, timestamp, varchar } from "drizzle-orm/pg-core";
// import { comments } from "./comments";
// import { postLikes } from "./likes";
// import { reposts } from "./reposts";
import { comments } from "./comments";
import { postLikes } from "./likes";
import { reposts } from "./reposts";
import { users } from "./users";

export const posts = pgTable("posts", {
	id: serial("id").primaryKey(),
	content: varchar("content", { length: 256 }),
	createdById: varchar("created_by", { length: 255 })
		.notNull()
		.references(() => users.id),
	createdAt: timestamp("created_at", { withTimezone: true })
		.default(sql`CURRENT_TIMESTAMP`)
		.notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
		() => new Date(),
	),
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
	comments: many(comments, {
		relationName: "postComments",
	}),
}));
