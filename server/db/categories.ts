import { eq } from "drizzle-orm";
import { categories, products, type InsertCategory } from "../../drizzle/schema";
import { getDb } from "./client";

export async function getAllCategories() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(categories).orderBy(categories.sortOrder, categories.createdAt);
}

export async function createCategory(data: Omit<InsertCategory, "id" | "createdAt" | "updatedAt">) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(categories).values(data);
  return { success: true };
}

export async function updateCategory(id: number, data: Partial<Omit<InsertCategory, "id" | "createdAt" | "updatedAt">>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(categories).set({ ...data, updatedAt: new Date() }).where(eq(categories.id, id));
  return { success: true };
}

export async function deleteCategory(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(products).set({ categoryId: null }).where(eq(products.categoryId, id));
  await db.delete(categories).where(eq(categories.id, id));
  return { success: true };
}
