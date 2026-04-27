import { and, asc, eq, inArray, ne } from "drizzle-orm";
import {
  categories,
  combinationItems,
  combinations,
  products,
  productVariants,
  silhouettes,
  type InsertCombination,
  type InsertCombinationItem,
  type Product,
} from "../../drizzle/schema";
import { getDb } from "./client";
import { getVariantsByProductId } from "./variants";

// ─── Combinations ─────────────────────────────────────────────────────────────

export async function getAllCombinations() {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(combinations)
    .orderBy(combinations.silhouetteId, combinations.sortOrder, combinations.createdAt);
}

export async function getCombinationsBysilhouetteId(silhouetteId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(combinations)
    .where(eq(combinations.silhouetteId, silhouetteId))
    .orderBy(combinations.sortOrder, combinations.createdAt);
}

export type CombinationListItem = Awaited<ReturnType<typeof getCombinationsBysilhouetteId>>[number] & {
  items: {
    id: number;
    productId: number;
    categoryId: number;
    variantId: number | null;
    productName: string | null;
    productPrice: string | null;
    categoryName: string | null;
    productImage: string | null;
    variantName: string | null;
    variantPrice: string | null;
    variantImage: string | null;
    variantColorHex: string | null;
    productFabricTR: string | null;
    productFabricEN: string | null;
    productFabricAR: string | null;
  }[];
  stock: number;
};

export async function getCombinationStock(combinationId: number): Promise<number> {
  const db = await getDb();
  if (!db) return 0;

  const items = await db
    .select({
      productStock: products.stock,
      variantId: combinationItems.variantId,
      variantStock: productVariants.stock,
    })
    .from(combinationItems)
    .leftJoin(products, eq(combinationItems.productId, products.id))
    .leftJoin(productVariants, eq(combinationItems.variantId, productVariants.id))
    .where(eq(combinationItems.combinationId, combinationId));

  if (items.length === 0) return 0;

  const stocks = items.map(item => {
    if (item.variantId != null && item.variantStock != null) {
      return item.variantStock ?? 0;
    }
    return item.productStock ?? 0;
  });

  return Math.min(...stocks);
}

function comboKeyFromItems(items: { productId: number; variantId: number | null; categoryId: number }[]): string {
  return [...items]
    .sort((a, b) => a.categoryId - b.categoryId)
    .map(i => `${i.productId}:${i.variantId ?? "null"}`)
    .join("-");
}

export async function listCombinationsWithItemsForAdmin(silhouetteId?: number): Promise<CombinationListItem[]> {
  const db = await getDb();
  if (!db) return [];
  const combos =
    silhouetteId != null
      ? await db
          .select()
          .from(combinations)
          .where(eq(combinations.silhouetteId, silhouetteId))
          .orderBy(combinations.sortOrder, combinations.createdAt)
      : await db
          .select()
          .from(combinations)
          .orderBy(combinations.silhouetteId, combinations.sortOrder, combinations.createdAt);
  if (combos.length === 0) return [];
  const ids = combos.map(c => c.id);
  const itemRows = await db
    .select({
      combinationId: combinationItems.combinationId,
      id: combinationItems.id,
      productId: combinationItems.productId,
      categoryId: combinationItems.categoryId,
      variantId: combinationItems.variantId,
      productName: products.nameTR,
      productPrice: products.price,
      categoryName: categories.nameTR,
      productImage: products.imageUrl,
      variantName: productVariants.nameTR,
      variantPrice: productVariants.price,
      variantImage: productVariants.imageUrl,
      variantColorHex: productVariants.colorHex,
      productFabricTR: products.fabricTR,
      productFabricEN: products.fabricEN,
      productFabricAR: products.fabricAR,
    })
    .from(combinationItems)
    .leftJoin(products, eq(combinationItems.productId, products.id))
    .leftJoin(categories, eq(combinationItems.categoryId, categories.id))
    .leftJoin(productVariants, eq(combinationItems.variantId, productVariants.id))
    .where(inArray(combinationItems.combinationId, ids))
    .orderBy(combinationItems.combinationId, combinationItems.categoryId);

  const byCombo = new Map<number, CombinationListItem["items"]>();
  for (const row of itemRows) {
    const list = byCombo.get(row.combinationId) ?? [];
    list.push({
      id: row.id,
      productId: row.productId,
      categoryId: row.categoryId,
      variantId: row.variantId,
      productName: row.productName,
      productPrice: row.productPrice,
      categoryName: row.categoryName,
      productImage: row.productImage,
      variantName: row.variantName,
      variantPrice: row.variantPrice,
      variantImage: row.variantImage,
      variantColorHex: row.variantColorHex,
      productFabricTR: row.productFabricTR,
      productFabricEN: row.productFabricEN,
      productFabricAR: row.productFabricAR,
    });
    byCombo.set(row.combinationId, list);
  }

  const stocks = await Promise.all(ids.map(id => getCombinationStock(id)));
  const stockById = new Map(ids.map((id, i) => [id, stocks[i] ?? 0]));

  return combos.map(c => ({
    ...c,
    items: byCombo.get(c.id) ?? [],
    stock: stockById.get(c.id) ?? 0,
  }));
}

export async function getCombinationWithItems(combinationId: number) {
  const db = await getDb();
  if (!db) return null;

  const [combo] = await db
    .select()
    .from(combinations)
    .where(eq(combinations.id, combinationId))
    .limit(1);
  if (!combo) return null;

  const items = await db
    .select({
      id: combinationItems.id,
      productId: combinationItems.productId,
      categoryId: combinationItems.categoryId,
      variantId: combinationItems.variantId,
      productName: products.nameTR,
      productPrice: products.price,
      categoryName: categories.nameTR,
      productImage: products.imageUrl,
      variantName: productVariants.nameTR,
      variantPrice: productVariants.price,
      variantImage: productVariants.imageUrl,
      variantColorHex: productVariants.colorHex,
      productFabricTR: products.fabricTR,
      productFabricEN: products.fabricEN,
      productFabricAR: products.fabricAR,
    })
    .from(combinationItems)
    .leftJoin(products, eq(combinationItems.productId, products.id))
    .leftJoin(categories, eq(combinationItems.categoryId, categories.id))
    .leftJoin(productVariants, eq(combinationItems.variantId, productVariants.id))
    .where(eq(combinationItems.combinationId, combinationId))
    .orderBy(asc(combinationItems.categoryId));

  const stock = await getCombinationStock(combinationId);

  return { ...combo, items, stock };
}

export async function getCombinationBySlugPublished(slug: string) {
  const db = await getDb();
  if (!db) return null;
  const [combo] = await db
    .select()
    .from(combinations)
    .where(
      and(
        eq(combinations.slug, slug),
        eq(combinations.status, "published"),
        eq(combinations.isActive, true),
      ),
    )
    .limit(1);
  if (!combo) return null;
  return getCombinationWithItems(combo.id);
}

export async function createCombination(data: Omit<InsertCombination, "id" | "createdAt" | "updatedAt">) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(combinations).values(data).returning({ id: combinations.id });
  return result;
}

export async function updateCombination(
  id: number,
  data: Partial<Omit<InsertCombination, "id" | "createdAt" | "updatedAt">>,
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(combinations).set({ ...data, updatedAt: new Date() }).where(eq(combinations.id, id));
  return { success: true };
}

export async function deleteCombination(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(combinationItems).where(eq(combinationItems.combinationId, id));
  await db.delete(combinations).where(eq(combinations.id, id));
  return { success: true };
}

export async function createCombinationItem(data: Omit<InsertCombinationItem, "id" | "createdAt">) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(combinationItems).values(data);
  return { success: true };
}

interface ComboOption {
  productId: number;
  variantId: number | null;
  categoryId: number;
  price: number;
  nameTR: string;
  nameEN: string;
  nameAR: string;
}

function cartesianOptions<T>(arrays: T[][]): T[][] {
  if (arrays.length === 0) return [[]];
  const [first, ...rest] = arrays;
  const restCombos = cartesianOptions(rest);
  return first.flatMap(item => restCombos.map(combo => [item, ...combo]));
}

async function buildOptionsForCategory(db: NonNullable<Awaited<ReturnType<typeof getDb>>>, categoryId: number, prods: Product[]): Promise<ComboOption[]> {
  const options: ComboOption[] = [];
  for (const product of prods) {
    const variants = await getVariantsByProductId(product.id);
    const active = variants.filter(v => v.isActive);
    if (variants.length > 0 && active.length === 0) {
      continue;
    }
    if (active.length === 0) {
      options.push({
        productId: product.id,
        variantId: null,
        categoryId,
        price: parseFloat(String(product.price)),
        nameTR: product.nameTR,
        nameEN: product.nameEN,
        nameAR: product.nameAR,
      });
    } else {
      for (const v of active) {
        const vPrice =
          v.price != null && String(v.price).trim() !== ""
            ? parseFloat(String(v.price))
            : parseFloat(String(product.price));
        options.push({
          productId: product.id,
          variantId: v.id,
          categoryId,
          price: vPrice,
          nameTR: `${product.nameTR} — ${v.nameTR}`,
          nameEN: `${product.nameEN} — ${v.nameEN}`,
          nameAR: `${product.nameAR} — ${v.nameAR}`,
        });
      }
    }
  }
  return options;
}

/**
 * Silüet altında kategorilere göre seçeneklerin (ürün veya ürün+varyant) kartezyen çarpımı;
 * combination_items satırında variantId tutulur.
 */
export async function regenerateCombinations(silhouetteId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const activeProducts = await db
    .select()
    .from(products)
    .where(and(eq(products.silhouetteId, silhouetteId), eq(products.isActive, true)));

  const productsByCategory: Record<number, typeof activeProducts> = {};
  for (const p of activeProducts) {
    if (p.categoryId == null) continue;
    if (!productsByCategory[p.categoryId]) {
      productsByCategory[p.categoryId] = [];
    }
    productsByCategory[p.categoryId].push(p);
  }

  const categoryIds = Object.keys(productsByCategory)
    .map(Number)
    .sort((a, b) => a - b);

  if (categoryIds.length < 2) {
    await db
      .update(combinations)
      .set({ status: "archived", updatedAt: new Date() })
      .where(and(eq(combinations.silhouetteId, silhouetteId), ne(combinations.status, "archived")));
    return { created: 0, archived: 0 };
  }

  const optionArrays: ComboOption[][] = [];
  for (const catId of categoryIds) {
    const opts = await buildOptionsForCategory(db, catId, productsByCategory[catId]);
    if (opts.length === 0) {
      await db
        .update(combinations)
        .set({ status: "archived", updatedAt: new Date() })
        .where(and(eq(combinations.silhouetteId, silhouetteId), ne(combinations.status, "archived")));
      return { created: 0, archived: 0 };
    }
    optionArrays.push(opts);
  }

  const allCombos = cartesianOptions(optionArrays);

  const existingCombos = await db
    .select()
    .from(combinations)
    .where(eq(combinations.silhouetteId, silhouetteId));

  const existingComboKeys = new Map<number, string>();
  for (const combo of existingCombos) {
    const items = await db
      .select({
        productId: combinationItems.productId,
        variantId: combinationItems.variantId,
        categoryId: combinationItems.categoryId,
      })
      .from(combinationItems)
      .where(eq(combinationItems.combinationId, combo.id))
      .orderBy(asc(combinationItems.categoryId));
    existingComboKeys.set(combo.id, comboKeyFromItems(items));
  }

  const [silhouette] = await db
    .select()
    .from(silhouettes)
    .where(eq(silhouettes.id, silhouetteId))
    .limit(1);
  if (!silhouette) return { created: 0, archived: 0 };

  let created = 0;
  const validKeys = new Set<string>();

  for (const comboOpts of allCombos) {
    const key = comboKeyFromItems(
      comboOpts.map(o => ({
        productId: o.productId,
        variantId: o.variantId,
        categoryId: o.categoryId,
      })),
    );
    validKeys.add(key);

    const alreadyExists = existingCombos.some(ec => existingComboKeys.get(ec.id) === key);

    if (!alreadyExists) {
      const labels = comboOpts.map(o => o.nameTR);
      const totalPrice = comboOpts.reduce((sum, o) => sum + o.price, 0).toFixed(2);

      const slugBase = `${silhouette.slug}-${comboOpts
        .map(o =>
          o.nameTR
            .toLowerCase()
            .replace(/[^a-z0-9ğüşıöçĞÜŞİÖÇ\s]/g, "")
            .replace(/\s+/g, "-")
            .substring(0, 24),
        )
        .join("-")}`;
      const slug = `${slugBase}-${Date.now()}`;

      const [newCombo] = await db
        .insert(combinations)
        .values({
          silhouetteId,
          slug,
          nameTR: `${silhouette.nameTR} — ${labels.join(" + ")}`,
          nameEN: `${silhouette.nameEN} — ${comboOpts.map(o => o.nameEN).join(" + ")}`,
          nameAR: `${silhouette.nameAR} — ${comboOpts.map(o => o.nameAR).join(" + ")}`,
          price: totalPrice,
          autoPrice: totalPrice,
          priceOverridden: false,
          status: "draft",
        })
        .returning({ id: combinations.id });

      for (const o of comboOpts) {
        await db.insert(combinationItems).values({
          combinationId: newCombo.id,
          productId: o.productId,
          categoryId: o.categoryId,
          variantId: o.variantId,
        });
      }

      created++;
    }
  }

  let archived = 0;
  for (const ec of existingCombos) {
    if (ec.status === "archived") continue;
    const existingKey = existingComboKeys.get(ec.id) ?? "";
    if (!validKeys.has(existingKey)) {
      await db
        .update(combinations)
        .set({ status: "archived", updatedAt: new Date() })
        .where(eq(combinations.id, ec.id));
      archived++;
    }
  }

  return { created, archived };
}

export async function recalculateCombinationPrices(silhouetteId: number) {
  const db = await getDb();
  if (!db) return;

  const combos = await db
    .select()
    .from(combinations)
    .where(and(eq(combinations.silhouetteId, silhouetteId), ne(combinations.status, "archived")));

  for (const combo of combos) {
    const items = await db
      .select({
        productPrice: products.price,
        variantId: combinationItems.variantId,
        variantPrice: productVariants.price,
      })
      .from(combinationItems)
      .leftJoin(products, eq(combinationItems.productId, products.id))
      .leftJoin(productVariants, eq(combinationItems.variantId, productVariants.id))
      .where(eq(combinationItems.combinationId, combo.id));

    const autoPrice = items
      .reduce((sum, i) => {
        const p = parseFloat(String(i.productPrice ?? "0"));
        if (i.variantId != null && i.variantPrice != null && String(i.variantPrice).trim() !== "") {
          return sum + parseFloat(String(i.variantPrice));
        }
        return sum + p;
      }, 0)
      .toFixed(2);

    if (!combo.priceOverridden) {
      await db
        .update(combinations)
        .set({ autoPrice, price: autoPrice, updatedAt: new Date() })
        .where(eq(combinations.id, combo.id));
    } else {
      await db
        .update(combinations)
        .set({ autoPrice, updatedAt: new Date() })
        .where(eq(combinations.id, combo.id));
    }
  }
}
