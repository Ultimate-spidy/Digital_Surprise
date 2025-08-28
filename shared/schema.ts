import { sql } from "drizzle-orm";
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const surprises = sqliteTable("surprises", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  filename: text("filename").notNull(),
  originalName: text("original_name").notNull(),
  mimeType: text("mime_type").notNull(),
  message: text("message").notNull(),
  password: text("password"),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`).notNull(),
});

export const insertSurpriseSchema = createInsertSchema(surprises).omit({
  id: true,
  createdAt: true,
});

export type InsertSurprise = z.infer<typeof insertSurpriseSchema>;
export type Surprise = typeof surprises.$inferSelect;
