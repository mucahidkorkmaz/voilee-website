import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { syncAbandonedCartSnapshot } from "../db/abandonedCarts";

const cartItemSchema = z.object({
  id: z.number(),
  nameTR: z.string(),
  nameEN: z.string(),
  nameAR: z.string(),
  price: z.number(),
  quantity: z.number().int().positive(),
  collection: z.string(),
  imageUrl: z.string().optional(),
});

export const cartRouter = router({
  syncAbandoned: publicProcedure
    .input(
      z.object({
        sessionId: z.string().min(8).max(64),
        items: z.array(cartItemSchema),
        cartTotal: z.number(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const u = ctx.user;
      return await syncAbandonedCartSnapshot({
        sessionId: input.sessionId,
        userId: u?.id ?? null,
        customerEmail: u?.email ?? null,
        customerName: u?.name ?? null,
        items: input.items,
        cartTotal: input.cartTotal,
      });
    }),
});
