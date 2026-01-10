// db.ts
import pkg from "pg";
const { Pool } = pkg;
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "@shared/schema";

// if (!process.env.DATABASE_URL) {
//   throw new Error("DATABASE_URL must be set. Did you forget to provision a database?");
// }

export const pool = new Pool({
  connectionString: "mongodb+srv://231210059_db_user:Rashisingh27@ultimatespiderman.mxsmnas.mongodb.net/?appName=ultimateSpiderman",
});

export const db = drizzle(pool, { schema });
