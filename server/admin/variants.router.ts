import { z } from "zod";
import { adminProcedure, router } from "../_core/trpc";
import { getProductById } from "../db/products";
import {
  createVariant,
  deleteVariant,
  getActiveVariantSummariesByProductIds,
  getVariantById,
  getVariantsByProductId,
  updateVariant,
} from "../db/variants";
import { recalculateCombinationPrices, regenerateCombinations } from "../db/combinations";

async function refreshSilhouetteCombinations(silhouetteId: number | null | undefined) {
  if (silhouetteId == null) return;
  await regenerateCombinations(silhouetteId);
  await recalculateCombinationPrices(silhouetteId);
}

export const variantsRouter = router({
  summariesForProducts: adminProcedure
    .input(z.object({ productIds: z.array(z.number()) }))
    .query(async ({ input }) => {
      if (input.productIds.length === 0) return [];
      const map = await getActiveVariantSummariesByProductIds(input.productIds);
      return input.productIds.map(pid => ({
        productId: pid,
        count: map.get(pid)?.count ?? 0,
        totalStock: map.get(pid)?.totalStock ?? 0,
      }));
    }),

  list: adminProcedure
    .input(z.object({ productId: z.number() }))
    .query(async ({ input }) => {
      return await getVariantsByProductId(input.productId);
    }),

  create: adminProcedure
    .input(
      z.object({
        productId: z.number(),
        nameTR: z.string().min(1),
        nameEN: z.string().min(1),
        nameAR: z.string().min(1),
        sku: z.string().optional(),
        price: z.string().nullable().optional(),
        stock: z.number().default(0),
        imageUrl: z.string().optional(),
        colorHex: z.string().optional(),
        sortOrder: z.number().default(0),
        isActive: z.boolean().default(true),
      }),
    )
    .mutation(async ({ input }) => {
      const { productId, ...rest } = input;
      const result = await createVariant({
        productId,
        nameTR: rest.nameTR,
        nameEN: rest.nameEN,
        nameAR: rest.nameAR,
        sku: rest.sku ?? null,
        price: rest.price ?? null,
        stock: rest.stock,
        imageUrl: rest.imageUrl ?? null,
        colorHex: rest.colorHex ?? null,
        sortOrder: rest.sortOrder,
        isActive: rest.isActive,
      });
      const product = await getProductById(productId);
      if (product?.silhouetteId != null) {
        await refreshSilhouetteCombinations(product.silhouetteId);
      }
      return result;
    }),

  update: adminProcedure
    .input(
      z.object({
        id: z.number(),
        nameTR: z.string().min(1).optional(),
        nameEN: z.string().min(1).optional(),
        nameAR: z.string().min(1).optional(),
        sku: z.string().optional().nullable(),
        price: z.string().nullable().optional(),
        stock: z.number().optional(),
        imageUrl: z.string().optional().nullable(),
        colorHex: z.string().optional().nullable(),
        sortOrder: z.number().optional(),
        isActive: z.boolean().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      const before = await getVariantById(id);
      await updateVariant(id, data);
      const afterProductId = before?.productId;
      if (afterProductId != null) {
        const product = await getProductById(afterProductId);
        await refreshSilhouetteCombinations(product?.silhouetteId);
      }
      return { success: true };
    }),

  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const before = await getVariantById(input.id);
      await deleteVariant(input.id);
      if (before) {
        const product = await getProductById(before.productId);
        await refreshSilhouetteCombinations(product?.silhouetteId);
      }
      return { success: true };
    }),
});
