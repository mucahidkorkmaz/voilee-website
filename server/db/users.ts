import { and, count, desc, eq, ilike, or } from "drizzle-orm";
import {
  orders,
  passwordResetTokens,
  productVerifications,
  returns,
  users,
  wishlist,
  type InsertUser,
} from "../../drizzle/schema";
import { ENV } from "../_core/env";
import { getDb } from "./client";

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = { openId: user.openId };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) values.lastSignedIn = new Date();
    if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();

    await db
      .insert(users)
      .values(values)
      .onConflictDoUpdate({ target: users.openId, set: updateSet });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user by email: database not available");
    return undefined;
  }
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createUserWithPassword(input: {
  openId: string;
  email: string;
  name: string;
  phone?: string | null;
  passwordHash: string;
  loginMethod?: string;
}) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create user: database not available");
    return undefined;
  }
  const now = new Date();
  await db.insert(users).values({
    openId: input.openId,
    email: input.email,
    name: input.name,
    phone: input.phone ?? null,
    passwordHash: input.passwordHash,
    loginMethod: input.loginMethod ?? "email",
    role: "user",
    emailVerified: false,
    lastSignedIn: now,
  });
  const created = await db
    .select()
    .from(users)
    .where(eq(users.openId, input.openId))
    .limit(1);
  return created[0];
}

export async function updateUserLastSignedIn(openId: string) {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set({ lastSignedIn: new Date() }).where(eq(users.openId, openId));
}

export async function updateUserPasswordHash(openId: string, passwordHash: string) {
  const db = await getDb();
  if (!db) return false;
  await db.update(users).set({ passwordHash }).where(eq(users.openId, openId));
  return true;
}

export async function updateUserProfile(
  openId: string,
  fields: { name?: string; phone?: string | null }
) {
  const db = await getDb();
  if (!db) return undefined;
  const set: Record<string, unknown> = { updatedAt: new Date() };
  if (fields.name !== undefined) set.name = fields.name;
  if (fields.phone !== undefined) set.phone = fields.phone;
  await db.update(users).set(set).where(eq(users.openId, openId));
  const [updated] = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return updated;
}

export async function getAllUsers() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(users).orderBy(desc(users.createdAt));
}

export async function getUsersByRole(role: "user" | "admin", search?: string) {
  const db = await getDb();
  if (!db) return [];
  const term = search?.trim();
  if (!term) {
    return db.select().from(users).where(eq(users.role, role)).orderBy(desc(users.createdAt));
  }
  // ILIKE wildcards: kullanıcı % ve _ gönderemesin (tam alt dize araması).
  const literal = term.replace(/[%_]/g, "");
  if (!literal) {
    return db.select().from(users).where(eq(users.role, role)).orderBy(desc(users.createdAt));
  }
  const pattern = `%${literal}%`;
  return db
    .select()
    .from(users)
    .where(
      and(
        eq(users.role, role),
        or(ilike(users.name, pattern), ilike(users.email, pattern), ilike(users.phone, pattern)),
      ),
    )
    .orderBy(desc(users.createdAt));
}

export async function updateUserRole(id: number, role: "user" | "admin") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  if (role === "user") {
    const [current] = await db.select().from(users).where(eq(users.id, id)).limit(1);
    if (current?.role === "admin") {
      const [{ adminCount }] = await db
        .select({ adminCount: count() })
        .from(users)
        .where(eq(users.role, "admin"));
      const n = Number(adminCount);
      if (!Number.isFinite(n) || n <= 1) {
        throw new Error("Son yönetici rolü kaldırılamaz.");
      }
    }
  }

  await db.update(users).set({ role, updatedAt: new Date() }).where(eq(users.id, id));
  return { success: true };
}

export async function deleteCustomerUserById(
  id: number,
  opts: { actorUserId: number; ownerOpenId?: string },
): Promise<{ ok: true } | { ok: false; error: string }> {
  const db = await getDb();
  if (!db) return { ok: false, error: "Veritabanı kullanılamıyor." };

  const [target] = await db.select().from(users).where(eq(users.id, id)).limit(1);
  if (!target) return { ok: false, error: "Kullanıcı bulunamadı." };
  if (target.role !== "user") return { ok: false, error: "Yalnızca müşteri hesapları silinebilir." };
  if (target.id === opts.actorUserId) return { ok: false, error: "Kendi hesabınızı bu ekrandan silemezsiniz." };
  if (opts.ownerOpenId && target.openId === opts.ownerOpenId) {
    return { ok: false, error: "Sahip hesabı silinemez." };
  }

  await db.transaction(async tx => {
    await tx.update(productVerifications).set({ ownerUserId: null }).where(eq(productVerifications.ownerUserId, id));
    await tx.delete(wishlist).where(eq(wishlist.userId, id));
    await tx.delete(passwordResetTokens).where(eq(passwordResetTokens.userId, id));
    await tx.update(returns).set({ userId: null }).where(eq(returns.userId, id));
    await tx.update(orders).set({ userId: null }).where(eq(orders.userId, id));
    await tx.delete(users).where(and(eq(users.id, id), eq(users.role, "user")));
  });

  return { ok: true };
}
