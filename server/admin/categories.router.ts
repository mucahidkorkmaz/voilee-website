import { z } from "zod";
import { createCategory, deleteCategory, getAllCategories, updateCategory } from "../db";
import { adminProcedure, router } from "../_core/trpc";

export const categoriesRouter = router({
  list: adminProcedure.query(async () => {
    return await getAllCategories();
  }),
  create: adminProcedure
    .input(
      z.object({
        nameTR: z.string().min(1),
        nameEN: z.string().min(1),
        nameAR: z.string().min(1),
        silhouetteId: z.number().nullable().optional(),
        imageUrl: z.string().optional(),
        sortOrder: z.number().default(0),
        isActive: z.boolean().default(true),
      }),
    )
    .mutation(async ({ input }) => {
      return await createCategory(input);
    }),
  update: adminProcedure
    .input(
      z.object({
        id: z.number(),
        nameTR: z.string().min(1).optional(),
        nameEN: z.string().min(1).optional(),
        nameAR: z.string().min(1).optional(),
        silhouetteId: z.number().nullable().optional(),
        imageUrl: z.string().optional(),
        sortOrder: z.number().optional(),
        isActive: z.boolean().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      return await updateCategory(id, data);
    }),
  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      return await deleteCategory(input.id);
    }),
});
