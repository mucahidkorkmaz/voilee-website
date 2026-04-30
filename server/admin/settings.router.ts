import { z } from "zod";
import { getStoreSettings, upsertStoreSettings } from "../db";
import { adminProcedure, router } from "../_core/trpc";
import { resetTransporter } from "../_core/email";

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
        siteLogoUrl: z.string().optional(),
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
        taxNumber: z.string().optional(),
        taxOffice: z.string().optional(),
        companyType: z.enum(["sahis", "limited", "anonim"]).optional(),
        mersis: z.string().optional(),
        parasutClientId: z.string().optional(),
        parasutClientSecret: z.string().optional(),
        parasutCompanyId: z.string().optional(),
        parasutEnabled: z.boolean().optional(),
        bankName: z.string().optional(),
        iban: z.string().optional(),
        accountHolder: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const updated = await upsertStoreSettings(input);
      resetTransporter();
      console.log("[Settings] SMTP transporter reset edildi.");
      return updated;
    }),
  testParasut: adminProcedure.mutation(async () => {
    const settings = await getStoreSettings();
    if (!settings?.parasutClientId || !settings?.parasutClientSecret) {
      return { success: false as const, error: "Paraşüt bilgileri eksik." };
    }
    const { getParasutToken } = await import("../integrations/parasut");
    const token = await getParasutToken({
      clientId: settings.parasutClientId,
      clientSecret: settings.parasutClientSecret,
      companyId: settings.parasutCompanyId ?? "",
    });
    return token
      ? { success: true as const, message: "Bağlantı başarılı." }
      : { success: false as const, error: "Token alınamadı. Bilgileri kontrol edin." };
  }),
});
