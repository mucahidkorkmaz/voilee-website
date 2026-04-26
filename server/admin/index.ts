import { adminProcedure, router } from "../_core/trpc";
import { usersRouter } from "./users.router";
import { productsRouter } from "./products.router";
import { categoriesRouter } from "./categories.router";
import { silhouettesRouter } from "./silhouettes.router";
import { collectionsRouter } from "./collections.router";
import { mediaRouter } from "./media.router";
import { ordersRouter } from "./orders.router";
import { returnsRouter } from "./returns.router";
import { newsletterRouter } from "./newsletter.router";
import { revenueRouter } from "./revenue.router";
import { discountsRouter } from "./discounts.router";
import { expensesRouter } from "./expenses.router";
import { webhooksRouter } from "./webhooks.router";
import { cmsRouter } from "./cms.router";
import { emailTemplatesRouter } from "./emailTemplates.router";
import { verificationsRouter } from "./verifications.router";
import { settingsRouter } from "./settings.router";
import { heroSlidesRouter } from "./heroSlides.router";
import { abandonedCartsAdminRouter } from "./abandonedCarts.router";
import { getAdminStats } from "../db";

export const adminRouter = router({
  stats: adminProcedure.query(async () => {
    return await getAdminStats();
  }),
  users: usersRouter,
  products: productsRouter,
  categories: categoriesRouter,
  silhouettes: silhouettesRouter,
  collections: collectionsRouter,
  media: mediaRouter,
  orders: ordersRouter,
  returns: returnsRouter,
  newsletter: newsletterRouter,
  revenue: revenueRouter,
  discounts: discountsRouter,
  expenses: expensesRouter,
  webhooks: webhooksRouter,
  cms: cmsRouter,
  emailTemplates: emailTemplatesRouter,
  verifications: verificationsRouter,
  settings: settingsRouter,
  heroSlides: heroSlidesRouter,
  abandonedCarts: abandonedCartsAdminRouter,
});
