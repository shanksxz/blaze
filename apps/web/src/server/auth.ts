import { env } from "@/env.js";
import { accounts, db, sessions, users, verifications } from "@repo/database";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: "pg",
		schema: {
			user: users,
			session: sessions,
			account: accounts,
			verification: verifications,
		},
	}),
	emailAndPassword: {
		enabled: true,
	},
	socialProviders: {
		github: {
			clientId: env.GITHUB_ID,
			clientSecret: env.GITHUB_SECRET,
		},
	},
});

export type Session = typeof auth.$Infer.Session;
