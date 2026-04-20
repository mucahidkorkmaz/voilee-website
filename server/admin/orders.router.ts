import { z } from "zod";
import { getAllOrders, getOrderWithItems, updateOrderStatus } from "../db";
import { adminProcedure, router } from "../_core/trpc";

export const ordersRouter = router({
  list: adminProcedure.query(async () => {
    return await getAllOrders();
  }),
  detail: adminProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return await getOrderWithItems(input.id);
    }),
  updateStatus: adminProcedure
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["pending", "processing", "shipped", "delivered", "cancelled"]),
      }),
    )
    .mutation(async ({ input }) => {
      return await updateOrderStatus(input.id, input.status);
    }),
});
