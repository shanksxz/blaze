import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
// import { comments } from "./schema/comments";
// import { follows } from "./schema/follows";
// import { commentLikes, postLikes } from "./schema/likes";
// import { posts } from "./schema/posts";
// import { reposts } from "./schema/repost";
// import { users } from "./schema/users";


const getEnvVar = (name: string): string => {
	const value = process.env[name];
	if (!value) {
		throw new Error(`Missing environment variable: ${name}`);
	}
	return value;
};

const pool = new Pool({
	connectionString: getEnvVar("DATABASE_URL"),
});

export const db = drizzle(pool, {

});
