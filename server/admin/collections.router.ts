import { z } from "zod";
import {
  createCollection,
  deleteCollection,
  getAllCollections,
  updateCollection,
} from "../db";
import { adminProcedure, router } from "../_core/trpc";

export const collectionsRouter = router({
  list: adminProcedure.query(async () => {
    return await getAllCollections();
  }),
  create: adminProcedure
    .input(
      z.object({
        slug: z.string().min(1),
        nameTR: z.string().min(1),
        nameEN: z.string().min(1),
        nameAR: z.string().min(1),
        descriptionTR: z.string().optional(),
        descriptionEN: z.string().optional(),
        descriptionAR: z.string().optional(),
        imageUrl: z.string().optional(),
        isActive: z.boolean().default(true),
        sortOrder: z.number().default(0),
      }),
    )
    .mutation(async ({ input }) => {
      return await createCollection(input);
    }),
  update: adminProcedure
    .input(
      z.object({
        id: z.number(),
        slug: z.string().min(1).optional(),
        nameTR: z.string().min(1).optional(),
        nameEN: z.string().min(1).optional(),
        nameAR: z.string().min(1).optional(),
        descriptionTR: z.string().optional(),
        descriptionEN: z.string().optional(),
        descriptionAR: z.string().optional(),
        imageUrl: z.string().optional(),
        isActive: z.boolean().optional(),
        sortOrder: z.number().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      return await updateCollection(id, data);
    }),
  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      return await deleteCollection(input.id);
    }),
});
