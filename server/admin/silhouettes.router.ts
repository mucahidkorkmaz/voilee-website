import { z } from "zod";
import {
  createSilhouette,
  deleteSilhouette,
  getAllSilhouettes,
  updateSilhouette,
} from "../db";
import { adminProcedure, router } from "../_core/trpc";

export const silhouettesRouter = router({
  list: adminProcedure.query(async () => {
    return await getAllSilhouettes();
  }),
  create: adminProcedure
    .input(
      z.object({
        slug: z.string().min(1),
        nameTR: z.string().min(1),
        nameEN: z.string().min(1),
        nameAR: z.string().min(1),
        imageUrl: z.string().optional(),
        sortOrder: z.number().default(0),
        isActive: z.boolean().default(true),
      }),
    )
    .mutation(async ({ input }) => {
      return await createSilhouette(input);
    }),
  update: adminProcedure
    .input(
      z.object({
        id: z.number(),
        slug: z.string().min(1).optional(),
        nameTR: z.string().min(1).optional(),
        nameEN: z.string().min(1).optional(),
        nameAR: z.string().min(1).optional(),
        imageUrl: z.string().optional(),
        sortOrder: z.number().optional(),
        isActive: z.boolean().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      return await updateSilhouette(id, data);
    }),
  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      return await deleteSilhouette(input.id);
    }),
});
