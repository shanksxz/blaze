import { relations } from "drizzle-orm";
import { integer, pgTable, varchar } from "drizzle-orm/pg-core";
import { users } from "./index";

export const follows = pgTable("follows", {
	id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
	followerId: varchar("follower_id", { length: 255 })
		.notNull()
		.references(() => users.id),
	followingId: varchar("following_id", { length: 255 })
		.notNull()
		.references(() => users.id),
});

export const followsRelations = relations(follows, ({ one }) => ({
	follower: one(users, {
		fields: [follows.followerId],
		references: [users.id],
		relationName: "following",
	}),
	following: one(users, {
		fields: [follows.followingId],
		references: [users.id],
		relationName: "followedBy",
	}),
}));
