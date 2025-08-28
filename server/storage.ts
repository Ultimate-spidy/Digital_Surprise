import { type Surprise, type InsertSurprise, surprises } from "@shared/schema";
import { randomUUID } from "crypto";
import { createHash } from "crypto";
import path from "path";
import fs from "fs";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { eq } from "drizzle-orm";

export interface IStorage {
  createSurprise(surprise: InsertSurprise): Promise<Surprise>;
  getSurpriseBySlug(slug: string): Promise<Surprise | undefined>;
  saveFile(buffer: Buffer, filename: string): Promise<string>;
  getFileBuffer(filename: string): Promise<Buffer | undefined>;
  hashPassword(password: string): string;
  verifyPassword(password: string, hash: string): boolean;
}

export class SqliteStorage implements IStorage {
  private db;
  private drizzleDb;
  private files: Map<string, Buffer>;

  constructor() {
    // Initialize SQLite database
    this.db = new Database("database.db");
    this.drizzleDb = drizzle(this.db);
    this.files = new Map();
    
    // Create tables if they don't exist
    this.initDatabase();
    
    // Ensure uploads directory exists
    const uploadsDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
  }

  private initDatabase() {
    // Create surprises table if it doesn't exist
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS surprises (
        id TEXT PRIMARY KEY,
        slug TEXT NOT NULL UNIQUE,
        filename TEXT NOT NULL,
        original_name TEXT NOT NULL,
        mime_type TEXT NOT NULL,
        message TEXT NOT NULL,
        password TEXT,
        created_at INTEGER NOT NULL DEFAULT (unixepoch())
      )
    `);
  }

  async createSurprise(insertSurprise: InsertSurprise): Promise<Surprise> {
    const id = randomUUID();
    const surprise: Surprise = {
      ...insertSurprise,
      id,
      password: insertSurprise.password || null,
      createdAt: new Date(),
    };
    
    await this.drizzleDb.insert(surprises).values(surprise);
    return surprise;
  }

  async getSurpriseBySlug(slug: string): Promise<Surprise | undefined> {
    const result = await this.drizzleDb
      .select()
      .from(surprises)
      .where(eq(surprises.slug, slug))
      .limit(1);
    
    return result[0] || undefined;
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

export const storage = new SqliteStorage();
