import { relations, sql } from "drizzle-orm";
import { boolean, integer, pgTable, serial, timestamp, varchar } from "drizzle-orm/pg-core";
import { comments, posts, users } from "./index";

export const notifications = pgTable("notifications", {
	id: serial("id").primaryKey(),
	userId: varchar("user_id", { length: 255 })
		.notNull()
		.references(() => users.id),
	actorId: varchar("actor_id", { length: 255 })
		.notNull()
		.references(() => users.id),
	type: varchar("type", { length: 50 }).notNull(),
	postId: integer("post_id").references(() => posts.id),
	commentId: integer("comment_id").references(() => comments.id),
	read: boolean("read").default(false).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true }).default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const notificationsRelations = relations(notifications, ({ one }) => ({
	user: one(users, {
		fields: [notifications.userId],
		references: [users.id],
		relationName: "userNotifications",
	}),
	actor: one(users, {
		fields: [notifications.actorId],
		references: [users.id],
		relationName: "actorNotifications",
	}),
	post: one(posts, {
		fields: [notifications.postId],
		references: [posts.id],
	}),
	comment: one(comments, {
		fields: [notifications.commentId],
		references: [comments.id],
	}),
}));
