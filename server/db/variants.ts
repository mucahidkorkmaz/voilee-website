import { and, asc, count, eq, inArray, sum } from "drizzle-orm";
import { getDb } from "./client";
import { productVariants, type InsertProductVariant } from "../../drizzle/schema";

export async function getVariantsByProductId(productId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(productVariants)
    .where(eq(productVariants.productId, productId))
    .orderBy(asc(productVariants.sortOrder), asc(productVariants.id));
}

export async function createVariant(data: Omit<InsertProductVariant, "id" | "createdAt" | "updatedAt">) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db
    .insert(productVariants)
    .values({ ...data, updatedAt: new Date() })
    .returning({ id: productVariants.id });
  return result;
}

export async function updateVariant(
  id: number,
  data: Partial<Omit<InsertProductVariant, "id" | "createdAt" | "updatedAt">>,
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db
    .update(productVariants)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(productVariants.id, id));
  return { success: true };
}

export async function deleteVariant(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(productVariants).where(eq(productVariants.id, id));
  return { success: true };
}

/**
 * Varyantlı ürün: aktif varyant stokları toplamı.
 * Varyantsız: product.stock
 */
export async function getEffectiveStock(productId: number, productStock: number): Promise<number> {
  const db = await getDb();
  if (!db) return productStock;

  const variants = await db
    .select({ stock: productVariants.stock })
    .from(productVariants)
    .where(and(eq(productVariants.productId, productId), eq(productVariants.isActive, true)));

  if (variants.length === 0) return productStock;
  return variants.reduce((sum, v) => sum + (v.stock ?? 0), 0);
}

export async function getVariantById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const [row] = await db.select().from(productVariants).where(eq(productVariants.id, id)).limit(1);
  return row ?? null;
}

/** Aktif varyant sayısı ve stok toplamı (ürün listesi / stok sütunu için). */
export async function getActiveVariantSummariesByProductIds(
  productIds: number[],
): Promise<Map<number, { count: number; totalStock: number }>> {
  const db = await getDb();
  const empty = new Map<number, { count: number; totalStock: number }>();
  if (!db || productIds.length === 0) return empty;

  const rows = await db
    .select({
      productId: productVariants.productId,
      cnt: count(),
      stockSum: sum(productVariants.stock),
    })
    .from(productVariants)
    .where(and(inArray(productVariants.productId, productIds), eq(productVariants.isActive, true)))
    .groupBy(productVariants.productId);

  const m = new Map<number, { count: number; totalStock: number }>();
  for (const r of rows) {
    m.set(r.productId, {
      count: Number(r.cnt),
      totalStock: Number(r.stockSum ?? 0),
    });
  }
  return m;
}
