import { getEnvVar } from "@/utils";
import { defineConfig } from "drizzle-kit";


export default defineConfig({
  schema: "./src/schema/index.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: getEnvVar("DATABASE_URL"),
  },
});
