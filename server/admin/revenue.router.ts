import { getRevenueStats } from "../db";
import { adminProcedure, router } from "../_core/trpc";

export const revenueRouter = router({
  stats: adminProcedure.query(async () => {
    return await getRevenueStats();
  }),
});
