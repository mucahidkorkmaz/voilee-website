import { randomBytes, scrypt as _scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import type { Express, Request, Response } from "express";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { sdk } from "./_core/sdk";
import {
  createUserWithPassword,
  getUserByEmail,
  getUserByOpenId,
  updateUserLastSignedIn,
  updateUserPasswordHash,
  updateUserProfile,
} from "./db";

const scrypt = promisify(_scrypt) as (
  pw: string,
  salt: Buffer,
  keylen: number
) => Promise<Buffer>;

const KEY_LEN = 64;
const EMAIL_PREFIX = "email:";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const derived = await scrypt(password, salt, KEY_LEN);
  return `scrypt$${salt.toString("hex")}$${derived.toString("hex")}`;
}

async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split("$");
  if (parts.length !== 3 || parts[0] !== "scrypt") return false;
  const salt = Buffer.from(parts[1], "hex");
  const expected = Buffer.from(parts[2], "hex");
  const derived = await scrypt(password, salt, expected.length);
  if (derived.length !== expected.length) return false;
  return timingSafeEqual(derived, expected);
}

function publicUser(user: {
  id: number;
  openId: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  role: "user" | "admin";
  emailVerified: boolean;
}) {
  return {
    id: user.id,
    openId: user.openId,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    emailVerified: user.emailVerified,
  };
}

async function setSessionCookie(req: Request, res: Response, openId: string, name: string) {
  const token = await sdk.createSessionToken(openId, { name });
  const cookieOptions = getSessionCookieOptions(req);
  res.cookie(COOKIE_NAME, token, cookieOptions);
}

export function registerUserAuthRoutes(app: Express) {
  // ─── Register ───────────────────────────────────────────────────────────────
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const { email, password, name, phone } = req.body ?? {};

      if (typeof email !== "string" || !EMAIL_REGEX.test(email.trim())) {
        return res.status(400).json({ error: "Geçerli bir e-posta adresi giriniz." });
      }
      if (typeof password !== "string" || password.length < 8) {
        return res.status(400).json({ error: "Şifre en az 8 karakter olmalıdır." });
      }
      if (typeof name !== "string" || name.trim().length < 2) {
        return res.status(400).json({ error: "Ad Soyad en az 2 karakter olmalıdır." });
      }

      const cleanEmail = email.trim().toLowerCase();
      const openId = EMAIL_PREFIX + cleanEmail;

      const existing = await getUserByEmail(cleanEmail).catch(() => undefined);
      if (existing) {
        return res.status(409).json({ error: "Bu e-posta ile kayıtlı bir hesap zaten var." });
      }

      const passwordHash = await hashPassword(password);

      const created = await createUserWithPassword({
        openId,
        email: cleanEmail,
        name: name.trim(),
        phone: typeof phone === "string" ? phone.trim() || null : null,
        passwordHash,
        loginMethod: "email",
      });

      if (!created) {
        return res
          .status(503)
          .json({ error: "Veritabanı şu an kullanılamıyor. Lütfen daha sonra tekrar deneyin." });
      }

      await setSessionCookie(req, res, openId, created.name ?? cleanEmail);

      return res.status(201).json({ user: publicUser(created) });
    } catch (error) {
      console.error("[UserAuth] Register error:", error);
      return res.status(500).json({ error: "Kayıt sırasında bir hata oluştu." });
    }
  });

  // ─── Login ──────────────────────────────────────────────────────────────────
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body ?? {};

      if (typeof email !== "string" || typeof password !== "string") {
        return res.status(400).json({ error: "E-posta ve şifre zorunludur." });
      }

      const cleanEmail = email.trim().toLowerCase();
      const user = await getUserByEmail(cleanEmail).catch(() => undefined);

      if (!user || !user.passwordHash) {
        // Mesajı bilinçli olarak generic tutuyoruz (account enumeration koruması).
        return res.status(401).json({ error: "Geçersiz e-posta veya şifre." });
      }

      const ok = await verifyPassword(password, user.passwordHash);
      if (!ok) {
        return res.status(401).json({ error: "Geçersiz e-posta veya şifre." });
      }

      await updateUserLastSignedIn(user.openId).catch(() => undefined);
      await setSessionCookie(req, res, user.openId, user.name ?? cleanEmail);

      return res.json({ user: publicUser(user) });
    } catch (error) {
      console.error("[UserAuth] Login error:", error);
      return res.status(500).json({ error: "Giriş sırasında bir hata oluştu." });
    }
  });

  // ─── Update Profile ──────────────────────────────────────────────────────────
  app.patch("/api/auth/profile", async (req: Request, res: Response) => {
    try {
      const sessionUser = await sdk.authenticateRequest(req).catch(() => null);
      if (!sessionUser) {
        return res.status(401).json({ error: "Oturum bulunamadı. Lütfen tekrar giriş yapın." });
      }

      const { name, phone } = req.body ?? {};

      if (name !== undefined && (typeof name !== "string" || name.trim().length < 2)) {
        return res.status(400).json({ error: "Ad Soyad en az 2 karakter olmalıdır." });
      }
      if (phone !== undefined && phone !== null && typeof phone !== "string") {
        return res.status(400).json({ error: "Geçersiz telefon formatı." });
      }

      const fields: { name?: string; phone?: string | null } = {};
      if (name !== undefined) fields.name = name.trim();
      if (phone !== undefined) fields.phone = typeof phone === "string" && phone.trim() ? phone.trim() : null;

      const updated = await updateUserProfile(sessionUser.openId, fields);
      if (!updated) {
        return res.status(503).json({ error: "Veritabanı şu an kullanılamıyor." });
      }

      return res.json({ user: publicUser(updated) });
    } catch (error) {
      console.error("[UserAuth] Update-profile error:", error);
      return res.status(500).json({ error: "Profil güncellenirken bir hata oluştu." });
    }
  });

  // ─── Change Password ─────────────────────────────────────────────────────────
  app.post("/api/auth/change-password", async (req: Request, res: Response) => {
    try {
      const sessionUser = await sdk.authenticateRequest(req).catch(() => null);
      if (!sessionUser) {
        return res.status(401).json({ error: "Oturum bulunamadı. Lütfen tekrar giriş yapın." });
      }

      const { currentPassword, newPassword } = req.body ?? {};

      if (typeof currentPassword !== "string" || typeof newPassword !== "string") {
        return res.status(400).json({ error: "Mevcut ve yeni şifre zorunludur." });
      }
      if (newPassword.length < 8) {
        return res.status(400).json({ error: "Yeni şifre en az 8 karakter olmalıdır." });
      }
      if (currentPassword === newPassword) {
        return res.status(400).json({ error: "Yeni şifre mevcut şifreden farklı olmalıdır." });
      }

      const user = await getUserByOpenId(sessionUser.openId).catch(() => undefined);
      if (!user || !user.passwordHash) {
        return res.status(400).json({ error: "Bu hesap için şifre değiştirme desteklenmiyor." });
      }

      const ok = await verifyPassword(currentPassword, user.passwordHash);
      if (!ok) {
        return res.status(401).json({ error: "Mevcut şifreniz yanlış." });
      }

      const newHash = await hashPassword(newPassword);
      const updated = await updateUserPasswordHash(user.openId, newHash);
      if (!updated) {
        return res.status(503).json({ error: "Veritabanı şu an kullanılamıyor." });
      }

      return res.json({ success: true });
    } catch (error) {
      console.error("[UserAuth] Change-password error:", error);
      return res.status(500).json({ error: "Şifre değiştirme sırasında bir hata oluştu." });
    }
  });

  // ─── Logout ─────────────────────────────────────────────────────────────────
  app.post("/api/auth/logout", (req: Request, res: Response) => {
    const cookieOptions = getSessionCookieOptions(req);
    res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
    return res.json({ success: true });
  });

  // ─── Me ─────────────────────────────────────────────────────────────────────
  app.get("/api/auth/me", async (req: Request, res: Response) => {
    try {
      const user = await sdk.authenticateRequest(req).catch(() => null);
      if (!user) return res.status(200).json({ user: null });

      // Eğer DB'de email-prefixed openId varsa, public alanları döndür.
      const fresh = await getUserByOpenId(user.openId).catch(() => undefined);
      if (!fresh) return res.status(200).json({ user: null });

      return res.json({
        user: publicUser({
          id: fresh.id,
          openId: fresh.openId,
          name: fresh.name,
          email: fresh.email,
          phone: fresh.phone ?? null,
          role: fresh.role,
          emailVerified: fresh.emailVerified ?? false,
        }),
      });
    } catch {
      return res.status(200).json({ user: null });
    }
  });
}

export function registerPasswordResetRoutes(app: Express) {
  // 1. Token gönder
  app.post("/api/auth/forgot-password", async (req: Request, res: Response) => {
    try {
      const { email } = req.body ?? {};
      if (typeof email !== "string") return res.status(400).json({ error: "Email gerekli" });

      const { getDb } = await import("./db");
      const db = await getDb();
      if (!db) return res.status(500).json({ error: "DB bağlantısı yok" });

      const { users, passwordResetTokens } = await import("../drizzle/schema");
      const { eq } = await import("drizzle-orm");
      const { randomBytes } = await import("crypto");
      const { sendEmail, buildLayout, textToHtmlInline, esc } = await import("./_core/email");

      const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
      // Kullanıcı bulunamasa bile başarılı dön (güvenlik)
      if (!user || !user.passwordHash) return res.json({ ok: true });

      const token = randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 dakika

      await db.delete(passwordResetTokens).where(eq(passwordResetTokens.userId, user.id));
      await db.insert(passwordResetTokens).values({ userId: user.id, token, expiresAt });

      const { ENV } = await import("./_core/env");
      const baseUrl = ENV.corsOrigin?.split(",")[0]?.trim() ?? "";
      const resetUrl = `${baseUrl}/tr/reset-password?token=${token}`;

      await sendEmail({
        to: email,
        subject: "Şifre Sıfırlama — VOILÉE",
        html: buildLayout({
          bodyHtml:
            textToHtmlInline(`Sayın Müşterimiz,

Hesabınız için bir şifre sıfırlama talebinde bulunuldu. Aşağıdaki bağlantı 30 dakika geçerlidir.

Bu isteği siz yapmadıysanız bu e-postayı görmezden gelebilirsiniz.`) +
            `<p style="text-align:center;margin:32px 0">
  <a href="${esc(resetUrl)}"
     style="display:inline-block;background:#1C1C1E;color:#C9A96E;
            padding:14px 48px;text-decoration:none;
            font-family:'DM Sans','Helvetica Neue',Arial,sans-serif;
            font-size:10px;letter-spacing:3px;text-transform:uppercase;
            border:1px solid #C9A96E">
    ŞİFREMİ SIFIRLA
  </a>
</p>`,
        }),
      });

      return res.json({ ok: true });
    } catch (err) {
      console.error("[ForgotPassword]", err);
      return res.status(500).json({ error: "Bir hata oluştu" });
    }
  });

  // 2. Şifreyi sıfırla
  app.post("/api/auth/reset-password", async (req: Request, res: Response) => {
    try {
      const { token, password } = req.body ?? {};
      if (typeof token !== "string" || typeof password !== "string" || password.length < 8) {
        return res.status(400).json({ error: "Geçersiz istek" });
      }

      const { getDb } = await import("./db");
      const db = await getDb();
      if (!db) return res.status(500).json({ error: "DB bağlantısı yok" });

      const { users, passwordResetTokens } = await import("../drizzle/schema");
      const { eq } = await import("drizzle-orm");
      const { scrypt, randomBytes } = await import("crypto");
      const { promisify } = await import("util");

      const scryptAsync = promisify(scrypt);

      const [resetToken] = await db.select().from(passwordResetTokens).where(eq(passwordResetTokens.token, token)).limit(1);
      if (!resetToken || resetToken.usedAt || resetToken.expiresAt < new Date()) {
        return res.status(400).json({ error: "Bağlantı geçersiz veya süresi dolmuş" });
      }

      const salt = randomBytes(16).toString("hex");
      const KEY_LEN = 32;
      const derived = await scryptAsync(password, salt, KEY_LEN) as Buffer;
      const passwordHash = `${salt}:${derived.toString("hex")}`;

      await db.update(users).set({ passwordHash }).where(eq(users.id, resetToken.userId));
      await db.update(passwordResetTokens).set({ usedAt: new Date() }).where(eq(passwordResetTokens.id, resetToken.id));

      return res.json({ ok: true });
    } catch (err) {
      console.error("[ResetPassword]", err);
      return res.status(500).json({ error: "Bir hata oluştu" });
    }
  });
}
