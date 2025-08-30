import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertSurpriseSchema } from "@shared/schema";
import multer from "multer";
import QRCode from "qrcode";
import { nanoid } from "nanoid";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
});

export async function registerRoutes(app: Express): Promise<Server> {
  // API status route
  app.get("/api", (req, res) => {
    res.json({
      message: "Digital Surprise Sharing API",
      status: "running",
      endpoints: {
        "POST /api/surprises": "Create a new surprise",
        "GET /api/surprises/:slug": "Get surprise by slug",
        "POST /api/surprises/:slug/verify-password":
          "Verify password for protected surprise",
        // "GET /api/files/:filename": "Get uploaded file", // REMOVE this, no longer needed
      },
    });
  });

  // Create a surprise
  app.post("/api/surprises", upload.single("file"), async (req, res) => {
    console.log("Incoming upload:", req.headers["content-length"]);
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const { message, password } = req.body;

      if (!message || message.trim() === "") {
        return res.status(400).json({ message: "Message is required" });
      }

      // Validate file type
      if (
        !req.file.mimetype.startsWith("image/") &&
        !req.file.mimetype.startsWith("video/")
      ) {
        return res
          .status(400)
          .json({ message: "Only image and video files are allowed" });
      }

      const slug = nanoid(12);
      const filename = `${slug}-${Date.now()}${getFileExtension(req.file.originalname)}`;

      // Upload to Cloudinary, get public URL
      const fileUrl = await storage.saveFile(
        req.file.buffer,
        filename,
        req.file.mimetype,
      );

      const surpriseData = {
        slug,
        filename: fileUrl, // store the Cloudinary URL instead of a filename!
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        message: message.trim(),
        password: password ? await storage.hashPassword(password) : null,
      };

      const surprise = await storage.createSurprise(surpriseData);

      // Generate QR code - optimized for speed
      const baseUrl =
        process.env.PUBLIC_URL ||
        req.get('origin') ||
        `https://digitalsurprise-production.up.railway.app`;

      const surpriseUrl = `${baseUrl}/surprise/${slug}`;
      const qrCodeDataUrl = await QRCode.toDataURL(surpriseUrl, {
        width: 200,
        margin: 2,
        errorCorrectionLevel: "L",
      });

      res.json({
        id: surprise.id,
        slug: surprise.slug,
        shareUrl: surpriseUrl,
        qrCode: qrCodeDataUrl,
        hasPassword: !!surprise.password,
        fileUrl: fileUrl, // return this Cloudinary URL for frontend use!
      });
    } catch (error) {
      console.error("Error creating surprise:", error);
      res.status(500).json({ message: "Failed to create surprise" });
    }
  });

  // Get a surprise by slug
  app.get("/api/surprises/:slug", async (req, res) => {
    try {
      const { slug } = req.params;
      const surprise = await storage.getSurpriseBySlug(slug);

      if (!surprise) {
        return res.status(404).json({ message: "Surprise not found" });
      }

      // Don't send the password hash to the client
      const { password, ...surpriseData } = surprise;

      res.json({
        ...surpriseData,
        hasPassword: !!password,
        fileUrl: surprise.filename, // filename now contains Cloudinary URL
      });
    } catch (error) {
      console.error("Error fetching surprise:", error);
      res.status(500).json({ message: "Failed to fetch surprise" });
    }
  });

  // Verify password for protected surprise
  app.post("/api/surprises/:slug/verify-password", async (req, res) => {
    try {
      const { slug } = req.params;
      const { password } = req.body;

      const surprise = await storage.getSurpriseBySlug(slug);

      if (!surprise) {
        return res.status(404).json({ message: "Surprise not found" });
      }

      if (!surprise.password) {
        return res
          .status(400)
          .json({ message: "Surprise is not password protected" });
      }

      if (!password) {
        return res.status(400).json({ message: "Password is required" });
      }

      const isValid = await storage.verifyPassword(password, surprise.password);

      if (!isValid) {
        return res.status(401).json({ message: "Invalid password" });
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Error verifying password:", error);
      res.status(500).json({ message: "Failed to verify password" });
    }
  });

  // REMOVE the /api/files/:filename route!
  // No need to serve files from backend, Cloudinary does this for you.

  const httpServer = createServer(app);
  return httpServer;
}

function getFileExtension(filename: string): string {
  const ext = filename.split(".").pop();
  return ext ? `.${ext}` : "";
}
