import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set in the .env file.");
}

const client = new MongoClient(process.env.DATABASE_URL);

export async function connectDB() {
  try {
    await client.connect();
    console.log("✅ Connected to MongoDB successfully.");
    return client.db("digital_surprise");
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("❌ Failed to connect to MongoDB:", errorMessage);
    throw error;
  }
}

export const db = connectDB();
