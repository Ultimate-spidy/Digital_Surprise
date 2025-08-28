import { type Surprise, type InsertSurprise, surprises } from "@shared/schema";
import { createHash } from "crypto";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  createSurprise(surprise: InsertSurprise): Promise<Surprise>;
  getSurpriseBySlug(slug: string): Promise<Surprise | undefined>;
  saveFile(buffer: Buffer, filename: string): Promise<string>;
  getFileBuffer(filename: string): Promise<Buffer | undefined>;
  hashPassword(password: string): string;
  verifyPassword(password: string, hash: string): boolean;
}

export class DatabaseStorage implements IStorage {
  private files: Map<string, Buffer>;

  constructor() {
    this.files = new Map();
  }

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

  async saveFile(buffer: Buffer, filename: string): Promise<string> {
    this.files.set(filename, buffer);
    return filename;
  }

  async getFileBuffer(filename: string): Promise<Buffer | undefined> {
    return this.files.get(filename);
  }

  hashPassword(password: string): string {
    return createHash('sha256').update(password).digest('hex');
  }

  verifyPassword(password: string, hash: string): boolean {
    return this.hashPassword(password) === hash;
  }

  generateSlug(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }
}

export const storage = new DatabaseStorage();
