import { desc, eq } from "drizzle-orm";
import { mediaItems, type InsertMediaItem } from "../../drizzle/schema";
import { getDb } from "./client";

export async function getAllMediaItems() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(mediaItems).orderBy(desc(mediaItems.createdAt));
}

export async function createMediaItem(data: Omit<InsertMediaItem, "id" | "createdAt">) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [item] = await db.insert(mediaItems).values(data).returning();
  return item;
}

export async function deleteMediaItem(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(mediaItems).where(eq(mediaItems.id, id));
  return { success: true };
}
