import { getNewsletterSubscriptions } from "../db";
import { adminProcedure, router } from "../_core/trpc";

export const newsletterRouter = router({
  list: adminProcedure.query(async () => {
    return await getNewsletterSubscriptions();
  }),
});
