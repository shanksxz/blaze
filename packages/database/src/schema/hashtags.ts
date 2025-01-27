import { relations } from "drizzle-orm";
import { integer, pgTable, serial, varchar } from "drizzle-orm/pg-core";
import { posts } from "./posts";

export const hashtags = pgTable("hashtags", {
	id: serial("id").primaryKey(),
	name: varchar("name", { length: 50 }).notNull().unique(),
});

export const postHashtags = pgTable("post_hashtags", {
	postId: integer("post_id")
		.notNull()
		.references(() => posts.id, { onDelete: "cascade" }),
	hashtagId: integer("hashtag_id")
		.notNull()
		.references(() => hashtags.id, { onDelete: "cascade" }),
});

export const hashtagsRelations = relations(hashtags, ({ many }) => ({
	postHashtags: many(postHashtags),
}));

export const postHashtagsRelations = relations(postHashtags, ({ one }) => ({
	post: one(posts, {
		fields: [postHashtags.postId],
		references: [posts.id],
	}),
	hashtag: one(hashtags, {
		fields: [postHashtags.hashtagId],
		references: [hashtags.id],
	}),
}));
