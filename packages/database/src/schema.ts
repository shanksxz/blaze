import {
  pgTable,
  varchar,
  integer,
  boolean,
  timestamp,
  text,
  unique,
  foreignKey,
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";

export const users = pgTable("users", {
  id: varchar("id", { length: 255 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  emailVerified: boolean("email_verified").default(false),
  image: varchar("image", { length: 255 }),
  username: varchar("username", { length: 255 }).unique(),
  bio: text("bio"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
  accounts: many(accounts),
  posts: many(posts),
  comments: many(comment),
  likes: many(like),
  reposts: many(repost),
  followedBy: many(follow, { relationName: "followedBy" }),
  following: many(follow, { relationName: "following" }),
}));

export const sessions = pgTable("sessions", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 255 })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  token: varchar("token", { length: 255 }).unique().notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  ipAddress: varchar("ip_address", { length: 255 }).notNull(),
  userAgent: text("user_agent").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const accounts = pgTable(
  "accounts",
  {
    id: varchar("id", { length: 255 }).primaryKey(),
    userId: varchar("user_id", { length: 255 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    accountId: varchar("account_id", { length: 255 }).notNull(),
    providerId: varchar("provider_id", { length: 255 }).notNull(),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => ({
    uniqProviderAccount: unique().on(table.providerId, table.accountId),
  })
);

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}));

export const verifications = pgTable(
  "verifications",
  {
    id: varchar("id", { length: 255 }).primaryKey(),
    identifier: varchar("identifier", { length: 255 }).notNull(),
    value: varchar("value", { length: 255 }).notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => ({
    uniqIdentifierValue: unique().on(table.identifier, table.value),
  })
);

export const posts = pgTable("posts", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  content: varchar("content", { length: 256 }),
  createdById: varchar("created_by", { length: 255 })
    .notNull()
    .references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
    () => new Date()
  ),
});

export const postsRelations = relations(posts, ({ one, many }) => ({
  createdBy: one(users, {
    fields: [posts.createdById],
    references: [users.id],
  }),
  likes: many(like),
  reposts: many(repost),
  comments: many(comment),
}));

export const comment = pgTable(
  "comment",
  {
    id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
    postId: integer("post_id")
      .notNull()
      .references(() => posts.id),
    userId: varchar("user_id", { length: 255 })
      .notNull()
      .references(() => users.id),
    parentCommentId: integer("parent_comment_id"),
    text: text("text"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
      () => new Date()
    ),
  },
  (table) => ({
    parentCommentRefrence: foreignKey({
      columns: [table.parentCommentId],
      foreignColumns: [table.id],
      name: "comment_parent_comment_id_fk",
    }),
  })
);

export const commentRelations = relations(comment, ({ one }) => ({
  post: one(posts, { fields: [comment.postId], references: [posts.id] }),
  user: one(users, { fields: [comment.userId], references: [users.id] }),
  parentComment: one(comment, {
    fields: [comment.parentCommentId],
    references: [comment.id],
  }),
  childComments: one(comment, {
    fields: [comment.id],
    references: [comment.parentCommentId],
  }),
}));

export const like = pgTable("like", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  postId: integer("post_id")
    .notNull()
    .references(() => posts.id),
  userId: varchar("user_id", { length: 255 })
    .notNull()
    .references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

export const likeRelations = relations(like, ({ one }) => ({
  post: one(posts, { fields: [like.postId], references: [posts.id] }),
  user: one(users, { fields: [like.userId], references: [users.id] }),
}));

export const repost = pgTable("repost", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  postId: integer("post_id")
    .notNull()
    .references(() => posts.id),
  userId: varchar("user_id", { length: 255 })
    .notNull()
    .references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

export const repostRelations = relations(repost, ({ one }) => ({
  post: one(posts, { fields: [repost.postId], references: [posts.id] }),
  user: one(users, { fields: [repost.userId], references: [users.id] }),
}));

export const follow = pgTable("follow", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  followerId: varchar("follower_id", { length: 255 })
    .notNull()
    .references(() => users.id),
  followingId: varchar("following_id", { length: 255 })
    .notNull()
    .references(() => users.id),
});

export const followRelations = relations(follow, ({ one }) => ({
  follower: one(users, {
    fields: [follow.followerId],
    references: [users.id],
    relationName: "following",
  }),
  following: one(users, {
    fields: [follow.followingId],
    references: [users.id],
    relationName: "followedBy",
  }),
}));
