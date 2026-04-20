import { z } from "zod";
import { createDiscount, deleteDiscount, getAllDiscounts, updateDiscount } from "../db";
import { adminProcedure, router } from "../_core/trpc";

export const discountsRouter = router({
  list: adminProcedure.query(async () => {
    return await getAllDiscounts();
  }),
  create: adminProcedure
    .input(
      z.object({
        code: z.string().min(1),
        type: z.enum(["percentage", "fixed"]),
        value: z.string(),
        minOrderAmount: z.string().optional(),
        maxUses: z.number().optional(),
        isActive: z.boolean().default(true),
        expiresAt: z.string().datetime().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      return await createDiscount({
        ...input,
        expiresAt: input.expiresAt ? new Date(input.expiresAt) : undefined,
      });
    }),
  update: adminProcedure
    .input(
      z.object({
        id: z.number(),
        code: z.string().min(1).optional(),
        type: z.enum(["percentage", "fixed"]).optional(),
        value: z.string().optional(),
        minOrderAmount: z.string().optional(),
        maxUses: z.number().optional(),
        isActive: z.boolean().optional(),
        expiresAt: z.string().datetime().optional().nullable(),
      }),
    )
    .mutation(async ({ input }) => {
      const { id, expiresAt, ...rest } = input;
      return await updateDiscount(id, {
        ...rest,
        expiresAt: expiresAt ? new Date(expiresAt) : expiresAt === null ? undefined : undefined,
      });
    }),
  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      return await deleteDiscount(input.id);
    }),
});
