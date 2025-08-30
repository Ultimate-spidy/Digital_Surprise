import { type Surprise, type InsertSurprise, surprises } from "@shared/schema";
import { createHash } from "crypto";
import { db } from "./db";
import { eq } from "drizzle-orm";
import { v2 as cloudinary } from "cloudinary";

// Updated Cloudinary config with new api_key
cloudinary.config({
  cloud_name: "dfxhtpsmk", // from your dashboard
  api_key: "242418512848473", // <-- updated as requested
  api_secret: "WqlAYfzgkpeq3UTJhysUUsI8eLw", // from your dashboard
});

export interface IStorage {
  createSurprise(surprise: InsertSurprise): Promise<Surprise>;
  getSurpriseBySlug(slug: string): Promise<Surprise | undefined>;
  saveFile(
    buffer: Buffer,
    originalName: string,
    mimeType: string,
  ): Promise<string>;
  hashPassword(password: string): Promise<string>;
  verifyPassword(password: string, hash: string): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  async createSurprise(insertSurprise: InsertSurprise): Promise<Surprise> {
    const [surprise] = await db
      .insert(surprises)
      .values(insertSurprise)
      .returning();
    return surprise;
  }

  async getSurpriseBySlug(slug: string): Promise<Surprise | undefined> {
    const [surprise] = await db
      .select()
      .from(surprises)
      .where(eq(surprises.slug, slug))
      .limit(1);
    return surprise || undefined;
  }

  async saveFile(
    buffer: Buffer,
    originalName: string,
    mimeType: string,
  ): Promise<string> {
    // Convert buffer to base64 string for Cloudinary
    const base64 = buffer.toString("base64");
    const uploadStr = `data:${mimeType};base64,${base64}`;

    const result = await cloudinary.uploader.upload(uploadStr, {
      public_id: originalName, // or use a slug for uniqueness
      resource_type: "auto", // auto-detect image/video
      overwrite: true,
    });
    return result.secure_url; // public file URL
  }

  async hashPassword(password: string): Promise<string> {
    return createHash("sha256").update(password).digest("hex");
  }

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return this.hashPassword(password) === hash;
  }
}

export const storage = new DatabaseStorage();
