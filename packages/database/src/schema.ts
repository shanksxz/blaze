import { pgTable, varchar, boolean, timestamp, text, unique } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const users = pgTable('users', {
  id: varchar('id', { length: 255 }).primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  emailVerified: boolean('email_verified').default(false),
  image: varchar('image', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
  accounts: many(accounts)
}));

export const sessions = pgTable('sessions', {
  id: varchar('id', { length: 255 }).primaryKey(),
  userId: varchar('user_id', { length: 255 }).notNull().references(() => users.id, { onDelete: 'cascade' }),
  token: varchar('token', { length: 255 }).unique().notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  ipAddress: varchar('ip_address', { length: 255 }).notNull(),
  userAgent: text('user_agent').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id]
  })
}));

export const accounts = pgTable('accounts', {
  id: varchar('id', { length: 255 }).primaryKey(),
  userId: varchar('user_id', { length: 255 }).notNull().references(() => users.id, { onDelete: 'cascade' }),
  accountId: varchar('account_id', { length: 255 }).notNull(),
  providerId: varchar('provider_id', { length: 255 }).notNull(),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at'),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
}, (table) => ({
  uniqProviderAccount: unique().on(table.providerId, table.accountId)
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id]
  })
}));

export const verifications = pgTable('verifications', {
  id: varchar('id', { length: 255 }).primaryKey(),
  identifier: varchar('identifier', { length: 255 }).notNull(),
  value: varchar('value', { length: 255 }).notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
}, (table) => ({
  uniqIdentifierValue: unique().on(table.identifier, table.value)
}));
