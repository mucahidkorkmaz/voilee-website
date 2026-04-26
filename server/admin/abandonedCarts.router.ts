import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { adminProcedure, router } from "../_core/trpc";
import { getAbandonedCartById, listStaleAbandonedCarts, markAbandonedReminderSent } from "../db/abandonedCarts";
import { getStoreSettings } from "../db/settings";
import { sendAutomationAbandonedCart } from "../_core/email";

function publicSiteBaseUrl(): string {
  const direct = process.env.PUBLIC_SITE_URL?.trim() || process.env.VITE_APP_URL?.trim();
  if (direct) return direct.replace(/\/$/, "");
  const cors = process.env.CORS_ORIGIN?.split(",")[0]?.trim();
  if (cors?.startsWith("http")) return cors.replace(/\/$/, "");
  return "http://localhost:5173";
}

export const abandonedCartsAdminRouter = router({
  list: adminProcedure
    .input(
      z
        .object({
          minInactiveHours: z.number().min(1).max(720).optional(),
        })
        .optional(),
    )
    .query(async ({ input }) => {
      const hours = input?.minInactiveHours ?? 24;
      return await listStaleAbandonedCarts(hours);
    }),

  sendReminder: adminProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ input }) => {
      const row = await getAbandonedCartById(input.id);
      if (!row) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Kayıt bulunamadı." });
      }
      const email = row.customerEmail?.trim();
      if (!email) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Bu sepet için e-posta yok; hatırlatma gönderilemez.",
        });
      }

      const settings = await getStoreSettings();
      const siteName = settings?.storeName ?? "VOILÉE";
      const base = publicSiteBaseUrl();
      const cartUrl = `${base}/tr/checkout`;

      const name = row.customerName?.trim() || email;
      const totalNum = Number(row.cartTotal);
      const total = `₺${totalNum.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

      await sendAutomationAbandonedCart({
        to: email,
        customerName: name,
        customerEmail: email,
        siteName,
        cartUrl,
        cartTotal: total,
      });

      await markAbandonedReminderSent(input.id);
      return { success: true as const };
    }),
});
