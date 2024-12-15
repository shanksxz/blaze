import { migrate } from "drizzle-orm/postgres-js/migrator";
import { db } from "../src/database";

const main = async () => {
  try {
    await migrate(db, { migrationsFolder: "drizzle" });
    console.log("Migration completed");
  } catch (error) {
    console.error("Error during migration:", error);
    process.exit(1);
  }
};

main();
