import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";
import type { auth } from "@/server/auth/auth";

export const authClient = createAuthClient({
	baseURL: process.env.BETTER_AUTH_URL,	
	plugins: [inferAdditionalFields<typeof auth>()],
});
