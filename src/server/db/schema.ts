import { relations, sql } from 'drizzle-orm';
import {
	foreignKey,
	index,
	integer,
	pgTableCreator,
	primaryKey,
	text,
	timestamp,
	varchar,
} from 'drizzle-orm/pg-core';
import type { AdapterAccount } from 'next-auth/adapters';

export const createTable = pgTableCreator((name) => `blaze_${name}`);

export const users = createTable('user', {
	id: varchar('id', { length: 255 })
		.notNull()
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	name: varchar('name', { length: 255 }),
	email: varchar('email', { length: 255 }).notNull(),
	emailVerified: timestamp('email_verified', {
		mode: 'date',
		withTimezone: true,
	}).default(sql`CURRENT_TIMESTAMP`),
	image: varchar('image', { length: 255 }),
	posts: integer('posts').default(0),
	followers: integer('followers').default(0),
	following: integer('following').default(0),
	bio: text('bio'),
});

export const usersRelations = relations(users, ({ many }) => ({
	accounts: many(accounts),
}));

export const accounts = createTable(
	'account',
	{
		userId: varchar('user_id', { length: 255 })
			.notNull()
			.references(() => users.id),
		type: varchar('type', { length: 255 }).$type<AdapterAccount['type']>().notNull(),
		provider: varchar('provider', { length: 255 }).notNull(),
		providerAccountId: varchar('provider_account_id', {
			length: 255,
		}).notNull(),
		refresh_token: text('refresh_token'),
		access_token: text('access_token'),
		expires_at: integer('expires_at'),
		token_type: varchar('token_type', { length: 255 }),
		scope: varchar('scope', { length: 255 }),
		id_token: text('id_token'),
		session_state: varchar('session_state', { length: 255 }),
	},
	(account) => ({
		compoundKey: primaryKey({
			columns: [account.provider, account.providerAccountId],
		}),
		userIdIdx: index('account_user_id_idx').on(account.userId),
	}),
);

export const accountsRelations = relations(accounts, ({ one }) => ({
	user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessions = createTable(
	'session',
	{
		sessionToken: varchar('session_token', { length: 255 }).notNull().primaryKey(),
		userId: varchar('user_id', { length: 255 })
			.notNull()
			.references(() => users.id),
		expires: timestamp('expires', {
			mode: 'date',
			withTimezone: true,
		}).notNull(),
	},
	(session) => ({
		userIdIdx: index('session_user_id_idx').on(session.userId),
	}),
);

export const sessionsRelations = relations(sessions, ({ one }) => ({
	user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const verificationTokens = createTable(
	'verification_token',
	{
		identifier: varchar('identifier', { length: 255 }).notNull(),
		token: varchar('token', { length: 255 }).notNull(),
		expires: timestamp('expires', {
			mode: 'date',
			withTimezone: true,
		}).notNull(),
	},
	(vt) => ({
		compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
	}),
);

export const post = createTable('post', {
	id: integer('id').primaryKey().generatedByDefaultAsIdentity(),
	name: varchar('name', { length: 256 }),
	createdById: varchar('created_by', { length: 255 })
		.notNull()
		.references(() => users.id),
	createdAt: timestamp('created_at', { withTimezone: true })
		.default(sql`CURRENT_TIMESTAMP`)
		.notNull(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).$onUpdate(() => new Date()),
	likes: integer('likes').default(0),
	comments: integer('comments').default(0),
	reposts: integer('reposts').default(0),
});

export const postRelations = relations(post, ({ one }) => ({
	createdBy: one(users, { fields: [post.createdById], references: [users.id] }),
}));

export const comment = createTable(
	'comment',
	{
		id: integer('id').primaryKey().generatedByDefaultAsIdentity(),
		postId: integer('post_id')
			.notNull()
			.references(() => post.id),
		userId: varchar('user_id', { length: 255 })
			.notNull()
			.references(() => users.id),
		parentCommentId: integer('parent_comment_id'),
		text: text('text'),
		createdAt: timestamp('created_at', { withTimezone: true })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).$onUpdate(() => new Date()),
		likes: integer('likes').default(0),
		comments: integer('comments').default(0),
	},
	(table) => ({
		parentCommentRefrence: foreignKey({
			columns: [table.parentCommentId],
			foreignColumns: [table.id],
			name: 'comment_parent_comment_id_fk',
		}),
	}),
);

export const commentRelations = relations(comment, ({ one }) => ({
	post: one(post, { fields: [comment.postId], references: [post.id] }),
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

export const like = createTable('like', {
	postId: integer('post_id')
		.notNull()
		.references(() => post.id),
	userId: varchar('user_id', { length: 255 })
		.notNull()
		.references(() => users.id),
	createdAt: timestamp('created_at', { withTimezone: true })
		.default(sql`CURRENT_TIMESTAMP`)
		.notNull(),
});

export const likeRelations = relations(like, ({ one }) => ({
	post: one(post, { fields: [like.postId], references: [post.id] }),
	user: one(users, { fields: [like.userId], references: [users.id] }),
}));

export const repost = createTable('repost', {
	postId: integer('post_id')
		.notNull()
		.references(() => post.id),
	userId: varchar('user_id', { length: 255 })
		.notNull()
		.references(() => users.id),
	createdAt: timestamp('created_at', { withTimezone: true })
		.default(sql`CURRENT_TIMESTAMP`)
		.notNull(),
});

export const repostRelations = relations(repost, ({ one }) => ({
	post: one(post, { fields: [repost.postId], references: [post.id] }),
	user: one(users, { fields: [repost.userId], references: [users.id] }),
}));

export const follow = createTable('follow', {
	followerId: varchar('follower_id', { length: 255 })
		.notNull()
		.references(() => users.id),
	followingId: varchar('following_id', { length: 255 })
		.notNull()
		.references(() => users.id),
});

export const followRelations = relations(follow, ({ one }) => ({
	follower: one(users, { fields: [follow.followerId], references: [users.id] }),
	following: one(users, {
		fields: [follow.followingId],
		references: [users.id],
	}),
}));
