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
        "POST /api/surprises/:slug/verify-password": "Verify password for protected surprise",
        "GET /api/files/:filename": "Get uploaded file"
      }
    });
  });

  // Create a surprise
  app.post("/api/surprises", upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const { message, password } = req.body;
      
      if (!message || message.trim() === '') {
        return res.status(400).json({ message: "Message is required" });
      }

      // Validate file type
      if (!req.file.mimetype.startsWith('image/') && !req.file.mimetype.startsWith('video/')) {
        return res.status(400).json({ message: "Only image and video files are allowed" });
      }

      const slug = nanoid(12);
      const filename = `${slug}-${Date.now()}${getFileExtension(req.file.originalname)}`;
      
      await storage.saveFile(req.file.buffer, filename);

      const surpriseData = {
        slug,
        filename,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        message: message.trim(),
        password: password ? storage.hashPassword(password) : null,
      };

      const surprise = await storage.createSurprise(surpriseData);
      
      // Generate QR code - optimized for speed
      const baseUrl = process.env.REPLIT_DOMAIN ? `https://${process.env.REPLIT_DOMAIN}` : `http://localhost:${process.env.PORT || 5000}`;
      const surpriseUrl = `${baseUrl}/surprise/${slug}`;
      const qrCodeDataUrl = await QRCode.toDataURL(surpriseUrl, {
        width: 200,
        margin: 2,
        errorCorrectionLevel: 'L'
      });

      res.json({
        id: surprise.id,
        slug: surprise.slug,
        shareUrl: surpriseUrl,
        qrCode: qrCodeDataUrl,
        hasPassword: !!surprise.password,
      });
    } catch (error) {
      console.error('Error creating surprise:', error);
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
      });
    } catch (error) {
      console.error('Error fetching surprise:', error);
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
        return res.status(400).json({ message: "Surprise is not password protected" });
      }

      if (!password) {
        return res.status(400).json({ message: "Password is required" });
      }

      const isValid = storage.verifyPassword(password, surprise.password);
      
      if (!isValid) {
        return res.status(401).json({ message: "Invalid password" });
      }

      res.json({ success: true });
    } catch (error) {
      console.error('Error verifying password:', error);
      res.status(500).json({ message: "Failed to verify password" });
    }
  });

  // Serve uploaded files
  app.get("/api/files/:filename", async (req, res) => {
    try {
      const { filename } = req.params;
      const fileBuffer = await storage.getFileBuffer(filename);
      
      if (!fileBuffer) {
        return res.status(404).json({ message: "File not found" });
      }

      // Set appropriate content type based on file extension
      const ext = filename.split('.').pop()?.toLowerCase();
      const mimeTypes: Record<string, string> = {
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'png': 'image/png',
        'gif': 'image/gif',
        'webp': 'image/webp',
        'mp4': 'video/mp4',
        'webm': 'video/webm',
        'mov': 'video/quicktime',
      };

      res.set('Content-Type', mimeTypes[ext!] || 'application/octet-stream');
      res.send(fileBuffer);
    } catch (error) {
      console.error('Error serving file:', error);
      res.status(500).json({ message: "Failed to serve file" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

function getFileExtension(filename: string): string {
  const ext = filename.split('.').pop();
  return ext ? `.${ext}` : '';
}
