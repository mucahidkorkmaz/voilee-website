import { z } from "zod";
import { createWebhook, deleteWebhook, getAllWebhooks, updateWebhook } from "../db";
import { adminProcedure, router } from "../_core/trpc";

export const webhooksRouter = router({
  list: adminProcedure.query(async () => {
    return await getAllWebhooks();
  }),
  create: adminProcedure
    .input(
      z.object({
        name: z.string().min(1),
        url: z.string().url(),
        event: z.enum([
          "order.created", "order.updated", "order.shipped",
          "order.delivered", "order.cancelled",
          "product.created", "product.updated", "product.deleted",
          "user.registered",
        ]),
        secret: z.string().optional(),
        isActive: z.boolean().default(true),
      }),
    )
    .mutation(async ({ input }) => {
      return await createWebhook(input);
    }),
  update: adminProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(1).optional(),
        url: z.string().url().optional(),
        event: z.enum([
          "order.created", "order.updated", "order.shipped",
          "order.delivered", "order.cancelled",
          "product.created", "product.updated", "product.deleted",
          "user.registered",
        ]).optional(),
        secret: z.string().optional(),
        isActive: z.boolean().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      return await updateWebhook(id, data);
    }),
  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      return await deleteWebhook(input.id);
    }),
});
