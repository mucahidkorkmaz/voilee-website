import { and, count, desc, eq, ne } from "drizzle-orm";
import { newsletterSubscriptions, orders, products, returns, users } from "../../drizzle/schema";
import { getDb } from "./client";

export async function getAdminStats() {
  const db = await getDb();
  if (!db)
    return { userCount: 0, productCount: 0, orderCount: 0, newsletterCount: 0, activeReturnCount: 0, recentOrders: [] };

  const [
    [{ userCount }],
    [{ productCount }],
    [{ orderCount }],
    [{ newsletterCount }],
    [{ activeReturnCount }],
    recentOrders,
  ] = await Promise.all([
    db.select({ userCount: count() }).from(users),
    db.select({ productCount: count() }).from(products),
    db.select({ orderCount: count() }).from(orders),
    db.select({ newsletterCount: count() }).from(newsletterSubscriptions),
    db.select({ activeReturnCount: count() }).from(returns)
      .where(and(ne(returns.status, "processed"), ne(returns.status, "rejected"))),
    db.select().from(orders).orderBy(desc(orders.createdAt)).limit(5),
  ]);

  return { userCount, productCount, orderCount, newsletterCount, activeReturnCount, recentOrders };
}
