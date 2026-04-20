import { desc, eq } from "drizzle-orm";
import { orderItems, products, type InsertProduct } from "../../drizzle/schema";
import { getDb } from "./client";

export async function getAllProducts() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(products).orderBy(desc(products.createdAt));
}

export async function createProduct(
  data: Omit<InsertProduct, "id" | "createdAt" | "updatedAt">,
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(products).values(data);
  return { success: true };
}

export async function updateProduct(
  id: number,
  data: Partial<Omit<InsertProduct, "id" | "createdAt" | "updatedAt">>,
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(products).set(data).where(eq(products.id, id));
  return { success: true };
}

export async function deleteProduct(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(orderItems).where(eq(orderItems.productId, id));
  await db.delete(products).where(eq(products.id, id));
  return { success: true };
}
