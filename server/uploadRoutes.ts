import type { Express } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { nanoid } from "nanoid";
import { sdk } from "./_core/sdk";

export const UPLOADS_DIR = process.env.UPLOADS_DIR
  ? path.resolve(process.env.UPLOADS_DIR)
  : path.join(process.cwd(), "uploads");

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "image/avif",
  "image/x-icon",
  "image/vnd.microsoft.icon",
]);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || ".jpg";
    cb(null, `${nanoid()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME_TYPES.has(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Sadece görsel dosyaları yüklenebilir (JPEG, PNG, WebP, GIF, SVG, AVIF)."));
    }
  },
});

export function registerUploadRoutes(app: Express) {
  app.post("/api/upload", async (req, res, next) => {
    try {
      const user = await sdk.authenticateRequest(req);
      if (user.role !== "admin") {
        res.status(403).json({ error: "Yetkisiz erişim." });
        return;
      }
    } catch {
      res.status(401).json({ error: "Giriş yapmanız gereklidir." });
      return;
    }

    upload.single("file")(req, res, err => {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          res.status(400).json({ error: "Dosya boyutu 15 MB sınırını aşıyor." });
        } else {
          res.status(400).json({ error: err.message });
        }
        return;
      }
      if (err) {
        res.status(400).json({ error: err.message });
        return;
      }
      if (!req.file) {
        res.status(400).json({ error: "Dosya bulunamadı." });
        return;
      }

      const url = `/uploads/${req.file.filename}`;
      res.json({ url, filename: req.file.originalname, size: req.file.size });
    });

    next;
  });
}
