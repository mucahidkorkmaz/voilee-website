import { desc, eq } from "drizzle-orm";
import { users, type InsertUser } from "../../drizzle/schema";
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

export async function updateUserRole(id: number, role: "user" | "admin") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(users).set({ role }).where(eq(users.id, id));
  return { success: true };
}
