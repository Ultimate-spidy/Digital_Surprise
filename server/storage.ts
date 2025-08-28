import { type Surprise, type InsertSurprise } from "@shared/schema";
import { randomUUID } from "crypto";
import { createHash } from "crypto";
import path from "path";
import fs from "fs";

export interface IStorage {
  createSurprise(surprise: InsertSurprise): Promise<Surprise>;
  getSurpriseBySlug(slug: string): Promise<Surprise | undefined>;
  saveFile(buffer: Buffer, filename: string): Promise<string>;
  getFileBuffer(filename: string): Promise<Buffer | undefined>;
  hashPassword(password: string): string;
  verifyPassword(password: string, hash: string): boolean;
}

export class MemStorage implements IStorage {
  private surprises: Map<string, Surprise>;
  private files: Map<string, Buffer>;

  constructor() {
    this.surprises = new Map();
    this.files = new Map();
    
    // Ensure uploads directory exists
    const uploadsDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
  }

  async createSurprise(insertSurprise: InsertSurprise): Promise<Surprise> {
    const id = randomUUID();
    const surprise: Surprise = {
      ...insertSurprise,
      id,
      password: insertSurprise.password || null,
      createdAt: new Date(),
    };
    this.surprises.set(id, surprise);
    return surprise;
  }

  async getSurpriseBySlug(slug: string): Promise<Surprise | undefined> {
    return Array.from(this.surprises.values()).find(
      (surprise) => surprise.slug === slug
    );
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

export const storage = new MemStorage();
