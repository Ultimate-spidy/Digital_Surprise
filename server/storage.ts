import { type Surprise, type InsertSurprise } from "@shared/schema";
import { createHash } from "crypto";
import { connectDB } from "./db";
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.CLOUDINARY_URL) {
  throw new Error("CLOUDINARY_URL must be set in the .env file.");
}

// Parse CLOUDINARY_URL: cloudinary://api_key:api_secret@cloud_name
const cloudinaryUrlParts = process.env.CLOUDINARY_URL.split("://")[1]; // Remove cloudinary://
const [credentials, cloudName] = cloudinaryUrlParts.split("@");
const [apiKey, apiSecret] = credentials.split(":");

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
});

export async function testCloudinaryConnection() {
  try {
    const result = await cloudinary.api.ping();
    console.log("✅ Cloudinary connection successful:", result);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("❌ Cloudinary connection failed:", errorMessage);
    throw error;
  }
}

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
    const db = await connectDB();
    const collection = db.collection("surprises");
    
    const surprise: any = {
      ...insertSurprise,
      id: undefined, // MongoDB will create _id
      createdAt: new Date(),
    };
    
    const result = await collection.insertOne(surprise);
    return {
      ...surprise,
      id: result.insertedId.toString(),
    } as Surprise;
  }

  async getSurpriseBySlug(slug: string): Promise<Surprise | undefined> {
    const db = await connectDB();
    const collection = db.collection("surprises");
    
    const surprise = await collection.findOne({ slug });
    if (!surprise) return undefined;
    
    return {
      ...surprise,
      id: surprise._id.toString(),
    } as any as Surprise;
  }

  async saveFile(
    buffer: Buffer,
    originalName: string,
    mimeType: string,
  ): Promise<string> {
    try {
      // Convert buffer to base64 string for Cloudinary
      const base64 = buffer.toString("base64");
      const uploadStr = `data:${mimeType};base64,${base64}`;

      const result = await cloudinary.uploader.upload(uploadStr, {
        public_id: originalName, // or use a slug for uniqueness
        resource_type: "auto", // auto-detect image/video
        overwrite: true,
      });
      return result.secure_url; // public file URL
    } catch (error) {
      console.error("Cloudinary upload error:", error);
      throw error;
    }
  }

  async hashPassword(password: string): Promise<string> {
    return createHash("sha256").update(password).digest("hex");
  }

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    const hashedInput = await this.hashPassword(password);
    return hashedInput === hash;
  }
}

export const storage = new DatabaseStorage();
