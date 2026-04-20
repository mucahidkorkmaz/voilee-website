import { z } from "zod";
import {
  createCmsPage,
  deleteCmsPage,
  getAllCmsPages,
  getCmsPage,
  updateCmsPage,
} from "../db";
import { adminProcedure, router } from "../_core/trpc";

export const cmsRouter = router({
  list: adminProcedure.query(async () => {
    return await getAllCmsPages();
  }),
  get: adminProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return await getCmsPage(input.id);
    }),
  create: adminProcedure
    .input(
      z.object({
        slug: z.string().min(1),
        titleTR: z.string().min(1),
        titleEN: z.string().min(1),
        titleAR: z.string().min(1),
        contentTR: z.string().optional(),
        contentEN: z.string().optional(),
        contentAR: z.string().optional(),
        isPublished: z.boolean().default(false),
      }),
    )
    .mutation(async ({ input }) => {
      return await createCmsPage(input);
    }),
  update: adminProcedure
    .input(
      z.object({
        id: z.number(),
        slug: z.string().min(1).optional(),
        titleTR: z.string().min(1).optional(),
        titleEN: z.string().min(1).optional(),
        titleAR: z.string().min(1).optional(),
        contentTR: z.string().optional(),
        contentEN: z.string().optional(),
        contentAR: z.string().optional(),
        isPublished: z.boolean().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      return await updateCmsPage(id, data);
    }),
  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      return await deleteCmsPage(input.id);
    }),
});
