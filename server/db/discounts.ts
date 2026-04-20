import { desc, eq } from "drizzle-orm";
import { discounts, type InsertDiscount } from "../../drizzle/schema";
import { getDb } from "./client";

export async function getAllDiscounts() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(discounts).orderBy(desc(discounts.createdAt));
}

export async function createDiscount(data: Omit<InsertDiscount, "id" | "createdAt" | "updatedAt">) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(discounts).values(data);
  return { success: true };
}

export async function updateDiscount(id: number, data: Partial<Omit<InsertDiscount, "id" | "createdAt" | "updatedAt">>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(discounts).set({ ...data, updatedAt: new Date() }).where(eq(discounts.id, id));
  return { success: true };
}

export async function deleteDiscount(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(discounts).where(eq(discounts.id, id));
  return { success: true };
}
