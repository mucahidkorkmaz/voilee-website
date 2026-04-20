import { z } from "zod";
import { getAllReturns, updateReturnStatus } from "../db";
import { adminProcedure, router } from "../_core/trpc";

export const returnsRouter = router({
  list: adminProcedure.query(async () => {
    return await getAllReturns();
  }),
  updateStatus: adminProcedure
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["requested", "accepted", "rejected", "processed"]),
        adminNote: z.string().optional(),
        refundAmount: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      return await updateReturnStatus(input.id, input.status, input.adminNote, input.refundAmount);
    }),
});
