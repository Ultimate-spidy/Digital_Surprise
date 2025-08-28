import { sql } from "drizzle-orm";
import { pgTable, text, varchar, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const surprises = pgTable("surprises", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  slug: text("slug").notNull().unique(),
  filename: text("filename").notNull(),
  originalName: text("original_name").notNull(),
  mimeType: text("mime_type").notNull(),
  message: text("message").notNull(),
  password: text("password"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertSurpriseSchema = createInsertSchema(surprises).omit({
  id: true,
  createdAt: true,
});

export type InsertSurprise = z.infer<typeof insertSurpriseSchema>;
export type Surprise = typeof surprises.$inferSelect;
