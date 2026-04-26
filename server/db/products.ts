import { desc, eq } from "drizzle-orm";
import { orderItems, productVariants, products, type InsertProduct } from "../../drizzle/schema";
import { getDb } from "./client";
import { recalculateCombinationPrices, regenerateCombinations } from "./combinations";

export async function getProductById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const [row] = await db.select().from(products).where(eq(products.id, id)).limit(1);
  return row ?? null;
}

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
  if (data.silhouetteId != null) {
    await regenerateCombinations(data.silhouetteId);
  }
  return { success: true };
}

export async function updateProduct(
  id: number,
  data: Partial<Omit<InsertProduct, "id" | "createdAt" | "updatedAt">>,
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [oldProduct] = await db.select().from(products).where(eq(products.id, id)).limit(1);
  await db
    .update(products)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(products.id, id));
  const newSilhouetteId = data.silhouetteId ?? oldProduct?.silhouetteId;
  if (oldProduct?.silhouetteId != null && oldProduct.silhouetteId !== newSilhouetteId) {
    await regenerateCombinations(oldProduct.silhouetteId);
  }
  if (newSilhouetteId != null) {
    await regenerateCombinations(newSilhouetteId);
  }
  if (data.price !== undefined && newSilhouetteId != null) {
    await recalculateCombinationPrices(newSilhouetteId);
  }
  return { success: true };
}

export async function deleteProduct(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [product] = await db.select().from(products).where(eq(products.id, id)).limit(1);
  await db.delete(orderItems).where(eq(orderItems.productId, id));
  await db.delete(productVariants).where(eq(productVariants.productId, id));
  await db.delete(products).where(eq(products.id, id));
  if (product?.silhouetteId != null) {
    await regenerateCombinations(product.silhouetteId);
  }
  return { success: true };
}
