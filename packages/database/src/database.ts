import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

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

export const db = drizzle(pool);
