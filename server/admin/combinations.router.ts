import { z } from "zod";
import {
  deleteCombination,
  getCombinationWithItems,
  listCombinationsWithItemsForAdmin,
  regenerateCombinations,
  updateCombination,
} from "../db";
import { adminProcedure, router } from "../_core/trpc";

export const combinationsRouter = router({
  list: adminProcedure
    .input(z.object({ silhouetteId: z.number().optional() }).optional())
    .query(async ({ input }) => {
      return await listCombinationsWithItemsForAdmin(input?.silhouetteId);
    }),

  get: adminProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return await getCombinationWithItems(input.id);
    }),

  update: adminProcedure
    .input(
      z.object({
        id: z.number(),
        nameTR: z.string().min(1).optional(),
        nameEN: z.string().min(1).optional(),
        nameAR: z.string().min(1).optional(),
        descriptionTR: z.string().optional().nullable(),
        descriptionEN: z.string().optional().nullable(),
        descriptionAR: z.string().optional().nullable(),
        price: z.string().optional(),
        priceOverridden: z.boolean().optional(),
        imageUrl: z.string().optional().nullable(),
        galleryUrls: z.string().optional().nullable(),
        status: z.enum(["draft", "published", "archived"]).optional(),
        sortOrder: z.number().optional(),
        isActive: z.boolean().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      const payload = { ...data };
      if (data.price !== undefined) {
        payload.priceOverridden = true;
      }
      return await updateCombination(id, payload);
    }),

  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      return await deleteCombination(input.id);
    }),

  regenerate: adminProcedure
    .input(z.object({ silhouetteId: z.number() }))
    .mutation(async ({ input }) => {
      return await regenerateCombinations(input.silhouetteId);
    }),

  resetPrice: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const combo = await getCombinationWithItems(input.id);
      if (!combo) throw new Error("Combination not found");
      await updateCombination(input.id, {
        price: combo.autoPrice,
        priceOverridden: false,
      });
      return await getCombinationWithItems(input.id);
    }),
});
