import "dotenv/config";
import cors from "cors";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { registerLocalAuthRoutes } from "../localAuth";
import { registerUserAuthRoutes } from "../userAuth";
import { registerStorefrontRoutes } from "../storefrontRoutes";
import { registerUploadRoutes, UPLOADS_DIR } from "../uploadRoutes";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { ENV } from "./env";
import { serveStatic } from "./static.js";
// vite.ts sadece development'ta dynamic import ile yüklenir — production'da asla çağrılmaz
// (vite ve @tailwindcss/vite devDependency olduğundan production container'da bulunmaz)

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);

  // CORS — 3 katmanlı mimaride frontend ayrı bir origin'den gelir.
  // CORS_ORIGIN env değişkeni ile izin verilen origin'ler belirlenir.
  // Development'ta tüm origin'lere açık; production'da sadece belirlenen origin'lere.
  const allowedOrigins = ENV.corsOrigin
    ? ENV.corsOrigin.split(",").map(o => o.trim())
    : [];

  app.use(
    cors({
      origin: (origin, callback) => {
        // Origin yoksa (curl, sunucu-sunucu istekler) izin ver
        if (!origin) return callback(null, true);
        // Development: herkese aç
        if (!ENV.isProduction) return callback(null, true);
        // Production: sadece CORS_ORIGIN'de tanımlı origin'lere izin ver
        if (allowedOrigins.includes(origin)) return callback(null, true);
        callback(new Error(`CORS policy: origin '${origin}' is not allowed`));
      },
      credentials: true, // Cookie tabanlı auth için zorunlu
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  );

  // Body parser — dosya yükleme için büyük limit
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // Yüklenen görselleri statik olarak sun (/uploads/*)
  app.use("/uploads", express.static(UPLOADS_DIR, { maxAge: "1y", immutable: false }));

  // Tarayıcının otomatik /favicon.ico isteğini boş yanıtla — gerçek favicon DB'den gelir
  app.get("/favicon.ico", (_req, res) => res.status(204).end());

  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);
  // Local admin password login (for dev / self-hosted)
  registerLocalAuthRoutes(app);
  // Storefront user auth (email + password) — register/login/logout/me
  registerUserAuthRoutes(app);
  // Storefront public API — /api/v1/products, /api/v1/collections, /api/v1/orders
  registerStorefrontRoutes(app);
  // Görsel yükleme endpoint'i — /api/upload (admin yetkisi gerektirir)
  registerUploadRoutes(app);
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );

  // Statik dosya servisi:
  // - Development: Vite dev server üzerinden (dynamic import — vite devDependency)
  // - Production + SERVE_STATIC=true: Express statik servis (tek sunucu kurulumu)
  // - Production + SERVE_STATIC=false (varsayılan): Nginx katmanı üstlenir
  if (process.env.NODE_ENV === "development") {
    const { setupVite } = await import("./vite.js");
    await setupVite(app, server);
  } else if (ENV.serveStatic) {
    serveStatic(app);
  } else {
    // 3 katmanlı mimaride backend sadece /api/* yanıtlar.
    // Bilinmeyen rotaya 404 döndür (Nginx zaten frontend'i sunar).
    app.use((_req, res) => {
      res.status(404).json({ error: "Not found" });
    });
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
