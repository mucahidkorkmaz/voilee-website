import { z } from "zod";
import { createProduct, deleteProduct, getAllProducts, updateProduct } from "../db";
import { adminProcedure, router } from "../_core/trpc";

export const productsRouter = router({
  list: adminProcedure.query(async () => {
    return await getAllProducts();
  }),
  create: adminProcedure
    .input(
      z.object({
        nameTR: z.string().min(1),
        nameEN: z.string().min(1),
        nameAR: z.string().min(1),
        descriptionTR: z.string().optional(),
        descriptionEN: z.string().optional(),
        descriptionAR: z.string().optional(),
        price: z.string(),
        collection: z.string().optional(),
        silhouetteId: z.number().nullable().optional(),
        categoryId: z.number().nullable().optional(),
        imageUrl: z.string().optional(),
        stock: z.number().default(0),
        isActive: z.boolean().default(true),
      }),
    )
    .mutation(async ({ input }) => {
      return await createProduct(input);
    }),
  update: adminProcedure
    .input(
      z.object({
        id: z.number(),
        nameTR: z.string().min(1).optional(),
        nameEN: z.string().min(1).optional(),
        nameAR: z.string().min(1).optional(),
        descriptionTR: z.string().optional(),
        descriptionEN: z.string().optional(),
        descriptionAR: z.string().optional(),
        price: z.string().optional(),
        collection: z.string().optional(),
        silhouetteId: z.number().nullable().optional(),
        categoryId: z.number().nullable().optional(),
        imageUrl: z.string().optional(),
        stock: z.number().optional(),
        isActive: z.boolean().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      return await updateProduct(id, data);
    }),
  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      return await deleteProduct(input.id);
    }),
});
