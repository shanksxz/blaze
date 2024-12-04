import type { NextAuthConfig } from 'next-auth';
import GitHub from 'next-auth/providers/github';

export default {
	providers: [
		GitHub({
			clientId: process.env.GITHUB_ID as string,
			clientSecret: process.env.GITHUB_SECRET as string,
		}),
	],
	pages: {
		signIn: '/login',
	},
} satisfies NextAuthConfig;
