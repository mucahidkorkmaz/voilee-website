import { eq } from "drizzle-orm";
import { collections, type InsertCollection } from "../../drizzle/schema";
import { getDb } from "./client";

export async function getAllCollections() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(collections).orderBy(collections.sortOrder, collections.createdAt);
}

export async function createCollection(data: Omit<InsertCollection, "id" | "createdAt" | "updatedAt">) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(collections).values(data);
  return { success: true };
}

export async function updateCollection(id: number, data: Partial<Omit<InsertCollection, "id" | "createdAt" | "updatedAt">>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(collections).set({ ...data, updatedAt: new Date() }).where(eq(collections.id, id));
  return { success: true };
}

export async function deleteCollection(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(collections).where(eq(collections.id, id));
  return { success: true };
}
