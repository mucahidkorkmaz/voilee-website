import { z } from "zod";
import { EMAIL_TEMPLATE_KEYS, type EmailTemplateKey } from "@shared/const";
import { getAllEmailTemplates, resetEmailTemplate, upsertEmailTemplate } from "../db";
import { adminProcedure, router } from "../_core/trpc";

const emailTemplateKeySchema = z.enum(
  EMAIL_TEMPLATE_KEYS as unknown as [EmailTemplateKey, ...EmailTemplateKey[]],
);

export const emailTemplatesRouter = router({
  list: adminProcedure.query(async () => {
    return await getAllEmailTemplates();
  }),
  upsert: adminProcedure
    .input(
      z.object({
        key: emailTemplateKeySchema,
        subject: z.string(),
        body: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      return await upsertEmailTemplate(input.key, input.subject, input.body);
    }),
  reset: adminProcedure
    .input(z.object({ key: emailTemplateKeySchema }))
    .mutation(async ({ input }) => {
      return await resetEmailTemplate(input.key);
    }),
});
