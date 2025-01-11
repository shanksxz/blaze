import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
	server: {
		BETTER_AUTH_SECRET: process.env.NODE_ENV === "production" ? z.string() : z.string().optional(),
		BETTER_AUTH_URL: z.string().url(),
		GITHUB_ID: z.string(),
		GITHUB_SECRET: z.string(),
		DATABASE_URL: z.string().url(),
		NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
	},
	client: {
		// NEXT_PUBLIC_CLIENTVAR: z.string(),
	},
	runtimeEnv: {
		BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
		BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
		GITHUB_ID: process.env.GITHUB_ID,
		GITHUB_SECRET: process.env.GITHUB_SECRET,
		DATABASE_URL: process.env.DATABASE_URL,
		NODE_ENV: process.env.NODE_ENV,
	},
	skipValidation: !!process.env.SKIP_ENV_VALIDATION,
	emptyStringAsUndefined: true,
});
