import { eq } from "drizzle-orm";
import { products, silhouettes, type InsertSilhouette } from "../../drizzle/schema";
import { getDb } from "./client";

export async function getAllSilhouettes() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(silhouettes).orderBy(silhouettes.sortOrder, silhouettes.createdAt);
}

export async function createSilhouette(data: Omit<InsertSilhouette, "id" | "createdAt" | "updatedAt">) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(silhouettes).values(data);
  return { success: true };
}

export async function updateSilhouette(id: number, data: Partial<Omit<InsertSilhouette, "id" | "createdAt" | "updatedAt">>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(silhouettes).set({ ...data, updatedAt: new Date() }).where(eq(silhouettes.id, id));
  return { success: true };
}

export async function deleteSilhouette(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(products).set({ silhouetteId: null }).where(eq(products.silhouetteId, id));
  await db.delete(silhouettes).where(eq(silhouettes.id, id));
  return { success: true };
}
