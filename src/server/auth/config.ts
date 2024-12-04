import { DrizzleAdapter } from '@auth/drizzle-adapter';
import type { DefaultSession, NextAuthConfig } from 'next-auth';
import GithubProvider from 'next-auth/providers/github';
import { db } from '~/server/db';
import { accounts, sessions, users, verificationTokens } from '~/server/db/schema';

declare module 'next-auth' {
	interface Session extends DefaultSession {
		user: {
			id: string;
			username: string;
		} & DefaultSession['user'];
	}
}

export const authConfig = {
	providers: [GithubProvider],
	adapter: DrizzleAdapter(db, {
		usersTable: users,
		accountsTable: accounts,
		sessionsTable: sessions,
		verificationTokensTable: verificationTokens,
	}),
	pages: {
		signIn: '/login',
	},
	callbacks: {
		session: ({ session, user }) => ({
			...session,
			user: {
				...session.user,
				id: user.id,
			},
		}),
	},
} satisfies NextAuthConfig;
