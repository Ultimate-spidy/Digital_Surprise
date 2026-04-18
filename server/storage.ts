import { type Surprise, type InsertSurprise } from "@shared/schema";
import { randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { connectDB } from "./db";
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.CLOUDINARY_URL) {
  throw new Error("CLOUDINARY_URL must be set in the .env file.");
}

const cloudinaryUrl = new URL(process.env.CLOUDINARY_URL);
if (
  cloudinaryUrl.protocol !== "cloudinary:" ||
  !cloudinaryUrl.username ||
  !cloudinaryUrl.password ||
  !cloudinaryUrl.hostname
) {
  throw new Error(
    "CLOUDINARY_URL format is invalid. Expected: cloudinary://api_key:api_secret@cloud_name",
  );
}

cloudinary.config({
  cloud_name: cloudinaryUrl.hostname,
  api_key: decodeURIComponent(cloudinaryUrl.username),
  api_secret: decodeURIComponent(cloudinaryUrl.password),
});

const PASSWORD_KEYLEN = 64;
const PASSWORD_SALT_BYTES = 16;

function compareHexStringsSafe(aHex: string, bHex: string): boolean {
  const aBuffer = Buffer.from(aHex, "hex");
  const bBuffer = Buffer.from(bHex, "hex");

  if (aBuffer.length !== bBuffer.length) {
    return false;
  }

  return timingSafeEqual(aBuffer, bBuffer);
}


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
  updateSurprisePasswordBySlug(slug: string, password: string): Promise<void>;
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

  async updateSurprisePasswordBySlug(
    slug: string,
    password: string,
  ): Promise<void> {
    const db = await connectDB();
    const collection = db.collection("surprises");

    await collection.updateOne({ slug }, { $set: { password } });
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
    const salt = randomBytes(PASSWORD_SALT_BYTES).toString("hex");
    const derivedKey = scryptSync(password, salt, PASSWORD_KEYLEN).toString("hex");
    return `scrypt:${salt}:${derivedKey}`;
  }

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    if (hash.startsWith("scrypt:")) {
      const [, salt, expectedDerivedKey] = hash.split(":");

      if (!salt || !expectedDerivedKey) {
        return false;
      }

      const providedDerivedKey = scryptSync(
        password,
        salt,
        PASSWORD_KEYLEN,
      ).toString("hex");
      return compareHexStringsSafe(providedDerivedKey, expectedDerivedKey);
    }

    return false;
  }
}

export const storage = new DatabaseStorage();
