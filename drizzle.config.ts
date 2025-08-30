import { defineConfig } from "drizzle-kit";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL, ensure the database is provisioned");
}

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: "postgresql://postgres:vNQuVxmPjKrvwJpSnZFUpVWhtrmVMVBF@metro.proxy.rlwy.net:31899/railway",
  },
});

// import type { Config } from "drizzle-kit";

// export default {
//   schema: "./src/db/schema.ts",
//   out: "./drizzle",
//   dialect: "postgresql",
//   dbCredentials: {
//     url: process.env.DATABASE_PUBLIC_URL!, // 👈 use your env var
//   },
// } satisfies Config;
