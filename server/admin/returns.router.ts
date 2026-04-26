import { z } from "zod";
import { getAllReturns, getOrderSummaryByOrderNumber, getReturn, updateReturnStatus } from "../db";
import { getStoreSettings } from "../db/settings";
import { adminProcedure, router } from "../_core/trpc";
import { sendRefundAccepted, sendRefundProcessed, sendRefundRejected } from "../_core/email";

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
      const result = await updateReturnStatus(input.id, input.status, input.adminNote, input.refundAmount);

      try {
        const returnData = await getReturn(input.id);
        const to = (returnData?.customerEmail ?? "").trim();
        if (!to || !returnData) return result;

        const settings = await getStoreSettings();
        const siteName = settings?.storeName ?? "";
        const orderRow = await getOrderSummaryByOrderNumber(returnData.orderNumber);
        const orderTotal =
          orderRow?.totalPrice != null ? `₺${Number(orderRow.totalPrice).toFixed(2)}` : "";

        const customerName = (returnData.customerName ?? to).trim() || to;
        const customerEmail = to;

        const commonVars = {
          to,
          customerName,
          customerEmail,
          orderNumber: returnData.orderNumber,
          orderTotal,
          siteName,
        };

        switch (input.status) {
          case "accepted":
            await sendRefundAccepted({ ...commonVars, refundAmount: input.refundAmount ?? "" });
            break;
          case "rejected":
            await sendRefundRejected({ ...commonVars, rejectReason: input.adminNote ?? "" });
            break;
          case "processed":
            await sendRefundProcessed({ ...commonVars, refundAmount: input.refundAmount ?? "" });
            break;
          default:
            break;
        }
      } catch (emailErr) {
        console.error("[AdminRouter] Return email notification failed:", emailErr);
      }

      return result;
    }),
});
