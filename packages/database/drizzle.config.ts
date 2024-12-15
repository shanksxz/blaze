import "dotenv/config";

import { defineConfig } from "drizzle-kit";

const getEnvVar = (name: string): string => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
};

export default defineConfig({
  schema: "./src/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: getEnvVar("DATABASE_URL"),
  },
});
