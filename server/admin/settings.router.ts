import { z } from "zod";
import { getStoreSettings, upsertStoreSettings } from "../db";
import { adminProcedure, router } from "../_core/trpc";

export const settingsRouter = router({
  get: adminProcedure.query(async () => {
    return await getStoreSettings();
  }),
  update: adminProcedure
    .input(
      z.object({
        storeName: z.string().optional(),
        storeEmail: z.string().email().optional().or(z.literal("")),
        storePhone: z.string().optional(),
        storeAddress: z.string().optional(),
        faviconUrl: z.string().optional(),
        instagramUrl: z.string().optional(),
        facebookUrl: z.string().optional(),
        twitterUrl: z.string().optional(),
        youtubeUrl: z.string().optional(),
        tiktokUrl: z.string().optional(),
        pinterestUrl: z.string().optional(),
        linkedinUrl: z.string().optional(),
        snapchatUrl: z.string().optional(),
        whatsappUrl: z.string().optional(),
        telegramUrl: z.string().optional(),
        freeShippingThreshold: z.string().optional(),
        shippingCostDomestic: z.string().optional(),
        shippingCostInternational: z.string().optional(),
        smtpHost: z.string().optional(),
        smtpPort: z.string().optional(),
        smtpSecure: z.boolean().optional(),
        smtpUser: z.string().optional(),
        smtpPass: z.string().optional(),
        smtpFrom: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      return await upsertStoreSettings(input);
    }),
});
