import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getAllOrders, getOrderWithItems, updateOrderStatus, type OrderStatus } from "../db";
import { getStoreSettings } from "../db/settings";
import { adminProcedure, router } from "../_core/trpc";
import { ENV } from "../_core/env";
import {
  sendOrderCancelled,
  sendOrderDelivered,
  sendOrderPaymentApprovedWireTransfer,
  sendOrderReadyStorePickup,
  sendShipmentReady,
  sendShipmentSent,
  sendShipmentUpdated,
} from "../_core/email";

function accountOrderUrl(orderNumber: string): string {
  const baseUrl = ENV.corsOrigin?.split(",")[0]?.trim() ?? "";
  if (!baseUrl) return "";
  return `${baseUrl.replace(/\/$/, "")}/tr/account/orders/${encodeURIComponent(orderNumber)}`;
}

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
        trackingNumber: z.string().optional(),
        cargoCompany: z.string().optional(),
        cancelReason: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const before = await getOrderWithItems(input.id);
      if (!before) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Sipariş bulunamadı." });
      }

      const prevStatus = (before.status ?? "pending") as OrderStatus;

      const result = await updateOrderStatus(input.id, input.status, {
        trackingNumber: input.trackingNumber,
        cargoCompany: input.cargoCompany,
      });

      try {
        const after = await getOrderWithItems(input.id);
        if (!after) return result;

        const to = (after.customerEmail ?? "").trim();
        if (!to) return result;

        const settings = await getStoreSettings();
        const siteName = settings?.storeName?.trim() || "VOILÉE";
        const customerName = (after.customerName ?? after.billingName ?? to).trim() || to;
        const customerEmail = to;
        const orderNumber = after.orderNumber;
        const orderTotal = `₺${Number(after.totalPrice).toFixed(2)}`;
        const orderDate = new Date(after.createdAt).toLocaleDateString("tr-TR");
        const orderUrl = accountOrderUrl(orderNumber);
        const trackingNumber = (after.trackingNumber ?? "").trim() || "—";
        const cargoCompany = (after.cargoCompany ?? "").trim() || "—";
        const deliveryMethod = (after.deliveryMethod ?? "shipping").trim();
        const paymentMethod = (after.paymentMethod ?? "").toLowerCase();

        const becameProcessingFromPending =
          input.status === "processing" && prevStatus === "pending";
        const becameShipped = input.status === "shipped" && prevStatus !== "shipped";
        const becameDelivered = input.status === "delivered" && prevStatus !== "delivered";
        const becameCancelled = input.status === "cancelled" && prevStatus !== "cancelled";

        const shipmentFieldsChanged =
          (input.trackingNumber !== undefined &&
            (input.trackingNumber || "") !== (before.trackingNumber ?? "")) ||
          (input.cargoCompany !== undefined && (input.cargoCompany || "") !== (before.cargoCompany ?? ""));

        if (becameDelivered) {
          await sendOrderDelivered({
            to,
            customerName,
            orderNumber,
            siteName,
          });
        }

        if (becameCancelled) {
          await sendOrderCancelled({
            to,
            customerName,
            customerEmail,
            orderNumber,
            orderTotal,
            siteName,
            cancelReason: input.cancelReason?.trim() ?? "",
          });
        }

        if (becameShipped) {
          await sendShipmentSent({
            to,
            customerName,
            customerEmail,
            orderNumber,
            trackingNumber,
            cargoCompany: cargoCompany === "—" ? undefined : cargoCompany,
            siteName,
          });
        } else if (after.status === "shipped" && shipmentFieldsChanged) {
          await sendShipmentUpdated({
            to,
            customerName,
            customerEmail,
            orderNumber,
            orderTotal,
            siteName,
            trackingNumber,
            cargoCompany,
          });
        }

        if (becameProcessingFromPending) {
          const storeAddress = (settings?.storeAddress ?? "").trim() || "—";
          if (deliveryMethod === "store_pickup") {
            await sendOrderReadyStorePickup({
              to,
              customerName,
              customerEmail,
              orderNumber,
              orderTotal,
              siteName,
              storeAddress,
            });
          } else {
            await sendShipmentReady({
              to,
              customerName,
              customerEmail,
              orderNumber,
              orderTotal,
              siteName,
            });
          }

          if (paymentMethod === "bank") {
            await sendOrderPaymentApprovedWireTransfer({
              to,
              customerName,
              customerEmail,
              orderNumber,
              orderTotal,
              siteName,
            });
          }
        }
      } catch (emailErr) {
        console.error("[AdminRouter] Email notification failed:", emailErr);
      }

      return result;
    }),
});
