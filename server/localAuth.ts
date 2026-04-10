import type { Express, Request, Response } from "express";
import { getSessionCookieOptions } from "./_core/cookies";
import { ENV } from "./_core/env";
import { sdk } from "./_core/sdk";
import { upsertUser } from "./db";

const LOCAL_ADMIN_OPEN_ID = "local-admin";

export function registerLocalAuthRoutes(app: Express) {
  app.post("/api/local-login", async (req: Request, res: Response) => {
    const { password } = req.body ?? {};

    if (!ENV.adminPassword) {
      res.status(403).json({ error: "Local auth is not configured. Set ADMIN_PASSWORD in .env" });
      return;
    }

    if (!password || password !== ENV.adminPassword) {
      res.status(401).json({ error: "Geçersiz şifre." });
      return;
    }

    // Try to persist the admin user to DB, but don't block login if DB is unavailable.
    upsertUser({
      openId: LOCAL_ADMIN_OPEN_ID,
      name: "Admin",
      email: "admin@local",
      loginMethod: "local",
      role: "admin",
      lastSignedIn: new Date(),
    }).catch(err => console.warn("[LocalAuth] Could not persist admin user to DB:", err));

    try {
      const token = await sdk.createSessionToken(LOCAL_ADMIN_OPEN_ID, {
        name: "Admin",
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie("app_session_id", token, cookieOptions);
      res.json({ success: true });
    } catch (error) {
      console.error("[LocalAuth] Token creation error:", error);
      res.status(500).json({ error: "Giriş yapılırken bir hata oluştu." });
    }
  });
}
