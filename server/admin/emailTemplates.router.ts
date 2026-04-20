import { z } from "zod";
import { getAllEmailTemplates, resetEmailTemplate, upsertEmailTemplate } from "../db";
import { adminProcedure, router } from "../_core/trpc";

export const emailTemplatesRouter = router({
  list: adminProcedure.query(async () => {
    return await getAllEmailTemplates();
  }),
  upsert: adminProcedure
    .input(
      z.object({
        key: z.string().min(1),
        subject: z.string(),
        body: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      return await upsertEmailTemplate(input.key, input.subject, input.body);
    }),
  reset: adminProcedure
    .input(z.object({ key: z.string().min(1) }))
    .mutation(async ({ input }) => {
      return await resetEmailTemplate(input.key);
    }),
});
