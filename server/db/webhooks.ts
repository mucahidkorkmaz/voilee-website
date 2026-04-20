import { desc, eq } from "drizzle-orm";
import { webhooks, type InsertWebhook } from "../../drizzle/schema";
import { getDb } from "./client";

export async function getAllWebhooks() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(webhooks).orderBy(desc(webhooks.createdAt));
}

export async function createWebhook(data: Omit<InsertWebhook, "id" | "createdAt" | "updatedAt">) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(webhooks).values(data);
  return { success: true };
}

export async function updateWebhook(id: number, data: Partial<Omit<InsertWebhook, "id" | "createdAt" | "updatedAt">>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(webhooks).set({ ...data, updatedAt: new Date() }).where(eq(webhooks.id, id));
  return { success: true };
}

export async function deleteWebhook(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(webhooks).where(eq(webhooks.id, id));
  return { success: true };
}
