import { and, count, desc, eq, gte, isNull, ne, or, sql, sum } from "drizzle-orm";
import { expenses, orderItems, orders, products, returns } from "../../drizzle/schema";
import { hesaplaMaliOzet } from "../finance";
import { getDb } from "./client";

export async function getRevenueStats() {
  const db = await getDb();
  const realized = and(eq(orders.status, "delivered"), eq(orders.paymentStatus, "paid"));

  if (!db) {
    return {
      totalRevenue: 0,
      monthRevenue: 0,
      weekRevenue: 0,
      totalRefunds: 0,
      monthRefunds: 0,
      weekRefunds: 0,
      totalExpenses: 0,
      monthExpenses: 0,
      activeReturnCount: 0,
      processedReturnCount: 0,
      totalOrderCount: 0,
      monthOrderCount: 0,
      statusBreakdown: [],
      topProducts: [],
      dailyRevenue: [] as { date: string; revenue: number; refunds: number; orders: number }[],
      monthlyRevenue: [] as { month: string; revenue: number; refunds: number; expenses: number; orders: number }[],
      expensesByCategory: [] as { category: string; total: number }[],
      returnedOrderNumbers: [] as string[],
      totalKdvCollected: 0,
      monthKdvCollected: 0,
      netRevenueExKdv: 0,
      monthRevenueExKdv: 0,
      paymentMethodBreakdown: [] as { method: string; count: number; total: number }[],
      invoicePendingCount: 0,
      kdvHaricGelir: 0,
      kdvHaricNetGelir: 0,
      kdvHaricGider: 0,
      gercekKar: 0,
      kdvHaricAylikGelir: 0,
      gercekAylikKar: 0,
      tahsilKdv: 0,
      iadeKdv: 0,
      indirilecekKdv: 0,
      odenecekKdv: 0,
      aylikTahsilKdv: 0,
      aylikOdenecekKdv: 0,
      yillikMatrahTahmini: 0,
      yillikGelirVergisiTahmini: 0,
      netRevenue: 0,
      netMonthRevenue: 0,
      profit: 0,
      monthProfit: 0,
      avgOrderValue: 0,
    };
  }

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - 7);
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(now.getDate() - 30);
  const twelveMonthsAgo = new Date(now.getFullYear() - 1, now.getMonth(), 1);

  const paymentMethodExpr = sql<string>`coalesce(${orders.paymentMethod}, 'unknown')`;

  const [
    totalResult,
    monthResult,
    weekResult,
    statusBreakdown,
    topProducts,
    totalRefundResult,
    monthRefundResult,
    weekRefundResult,
    [{ activeReturnCount }],
    [{ processedReturnCount }],
    [{ totalOrderCount }],
    [{ monthOrderCount }],
    totalExpenseResult,
    monthExpenseResult,
    dailyRevenueRaw,
    dailyRefundsRaw,
    monthlyRevenueRaw,
    monthlyRefundsRaw,
    monthlyExpensesRaw,
    expensesByCategoryRaw,
    returnedOrderNumbersRaw,
    totalKdvResult,
    monthKdvResult,
    totalSubtotalResult,
    monthSubtotalResult,
    paymentMethodRaw,
    [{ invoicePendingCount }],
  ] = await Promise.all([
    db.select({ total: sum(orders.totalPrice) }).from(orders).where(realized),
    db
      .select({ total: sum(orders.totalPrice) })
      .from(orders)
      .where(and(realized, gte(orders.createdAt, startOfMonth))),
    db
      .select({ total: sum(orders.totalPrice) })
      .from(orders)
      .where(and(realized, gte(orders.createdAt, startOfWeek))),
    db
      .select({
        status: orders.status,
        orderCount: count(),
        revenue: sum(orders.totalPrice),
      })
      .from(orders)
      .where(realized)
      .groupBy(orders.status),
    db
      .select({
        productId: orderItems.productId,
        nameTR: products.nameTR,
        imageUrl: products.imageUrl,
        totalQty: sum(orderItems.quantity),
        totalRevenue: sql<string>`SUM(${orderItems.price} * ${orderItems.quantity})`,
      })
      .from(orderItems)
      .innerJoin(products, eq(orderItems.productId, products.id))
      .innerJoin(orders, eq(orderItems.orderId, orders.id))
      .where(realized)
      .groupBy(orderItems.productId, products.nameTR, products.imageUrl)
      .orderBy(desc(sum(orderItems.quantity)))
      .limit(10),
    db
      .select({ total: sum(returns.refundAmount) })
      .from(returns)
      .where(eq(returns.status, "processed")),
    db
      .select({ total: sum(returns.refundAmount) })
      .from(returns)
      .where(and(eq(returns.status, "processed"), gte(returns.createdAt, startOfMonth))),
    db
      .select({ total: sum(returns.refundAmount) })
      .from(returns)
      .where(and(eq(returns.status, "processed"), gte(returns.createdAt, startOfWeek))),
    db
      .select({ activeReturnCount: count() })
      .from(returns)
      .where(and(ne(returns.status, "processed"), ne(returns.status, "rejected"))),
    db
      .select({ processedReturnCount: count() })
      .from(returns)
      .where(eq(returns.status, "processed")),
    db.select({ totalOrderCount: count() }).from(orders).where(realized),
    db
      .select({ monthOrderCount: count() })
      .from(orders)
      .where(and(realized, gte(orders.createdAt, startOfMonth))),
    db.select({ total: sum(expenses.amount) }).from(expenses),
    db.select({ total: sum(expenses.amount) }).from(expenses).where(gte(expenses.date, startOfMonth)),
    db
      .select({
        day: sql<string>`TO_CHAR(${orders.createdAt}, 'YYYY-MM-DD')`,
        revenue: sum(orders.totalPrice),
        orderCount: count(),
      })
      .from(orders)
      .where(and(realized, gte(orders.createdAt, thirtyDaysAgo)))
      .groupBy(sql`TO_CHAR(${orders.createdAt}, 'YYYY-MM-DD')`)
      .orderBy(sql`TO_CHAR(${orders.createdAt}, 'YYYY-MM-DD')`),
    db
      .select({
        day: sql<string>`TO_CHAR(${returns.createdAt}, 'YYYY-MM-DD')`,
        refunds: sum(returns.refundAmount),
      })
      .from(returns)
      .where(and(eq(returns.status, "processed"), gte(returns.createdAt, thirtyDaysAgo)))
      .groupBy(sql`TO_CHAR(${returns.createdAt}, 'YYYY-MM-DD')`)
      .orderBy(sql`TO_CHAR(${returns.createdAt}, 'YYYY-MM-DD')`),
    db
      .select({
        month: sql<string>`TO_CHAR(${orders.createdAt}, 'YYYY-MM')`,
        revenue: sum(orders.totalPrice),
        orderCount: count(),
      })
      .from(orders)
      .where(and(realized, gte(orders.createdAt, twelveMonthsAgo)))
      .groupBy(sql`TO_CHAR(${orders.createdAt}, 'YYYY-MM')`)
      .orderBy(sql`TO_CHAR(${orders.createdAt}, 'YYYY-MM')`),
    db
      .select({
        month: sql<string>`TO_CHAR(${returns.createdAt}, 'YYYY-MM')`,
        refunds: sum(returns.refundAmount),
      })
      .from(returns)
      .where(and(eq(returns.status, "processed"), gte(returns.createdAt, twelveMonthsAgo)))
      .groupBy(sql`TO_CHAR(${returns.createdAt}, 'YYYY-MM')`)
      .orderBy(sql`TO_CHAR(${returns.createdAt}, 'YYYY-MM')`),
    db
      .select({
        month: sql<string>`TO_CHAR(${expenses.date}, 'YYYY-MM')`,
        total: sum(expenses.amount),
      })
      .from(expenses)
      .where(gte(expenses.date, twelveMonthsAgo))
      .groupBy(sql`TO_CHAR(${expenses.date}, 'YYYY-MM')`)
      .orderBy(sql`TO_CHAR(${expenses.date}, 'YYYY-MM')`),
    db
      .select({
        category: expenses.category,
        total: sum(expenses.amount),
      })
      .from(expenses)
      .groupBy(expenses.category)
      .orderBy(desc(sum(expenses.amount))),
    db
      .select({ orderNumber: returns.orderNumber })
      .from(returns)
      .where(ne(returns.status, "rejected")),
    db.select({ total: sum(orders.kdvAmount) }).from(orders).where(realized),
    db
      .select({ total: sum(orders.kdvAmount) })
      .from(orders)
      .where(and(realized, gte(orders.createdAt, startOfMonth))),
    db.select({ total: sum(orders.subtotal) }).from(orders).where(realized),
    db
      .select({ total: sum(orders.subtotal) })
      .from(orders)
      .where(and(realized, gte(orders.createdAt, startOfMonth))),
    db
      .select({
        method: paymentMethodExpr,
        orderCount: count(),
        total: sum(orders.totalPrice),
      })
      .from(orders)
      .where(realized)
      .groupBy(paymentMethodExpr),
    db
      .select({ invoicePendingCount: count() })
      .from(orders)
      .where(
        and(
          realized,
          or(isNull(orders.invoiceStatus), eq(orders.invoiceStatus, "not_issued")),
        ),
      ),
  ]);

  const totalRevenue = Number(totalResult[0]?.total ?? 0);
  const totalRefunds = Number(totalRefundResult[0]?.total ?? 0);
  const monthRevenue = Number(monthResult[0]?.total ?? 0);
  const monthRefunds = Number(monthRefundResult[0]?.total ?? 0);
  const weekRefunds = Number(weekRefundResult[0]?.total ?? 0);
  const totalExpenses = Number(totalExpenseResult[0]?.total ?? 0);
  const monthExpenses = Number(monthExpenseResult[0]?.total ?? 0);

  const refundsByDay = new Map(dailyRefundsRaw.map(r => [r.day, Number(r.refunds ?? 0)]));
  const dailyRevenue = dailyRevenueRaw.map(r => ({
    date: r.day,
    revenue: Number(r.revenue ?? 0),
    refunds: refundsByDay.get(r.day) ?? 0,
    orders: r.orderCount,
  }));

  const refundsByMonth = new Map(monthlyRefundsRaw.map(r => [r.month, Number(r.refunds ?? 0)]));
  const expensesByMonth = new Map(monthlyExpensesRaw.map(r => [r.month, Number(r.total ?? 0)]));
  const monthlyRevenue = monthlyRevenueRaw.map(r => ({
    month: r.month,
    revenue: Number(r.revenue ?? 0),
    refunds: refundsByMonth.get(r.month) ?? 0,
    expenses: expensesByMonth.get(r.month) ?? 0,
    orders: r.orderCount,
  }));

  const toplamGiderIndirilebilir = totalExpenses;
  const toplamGiderIndirilemez = 0;

  const maliOzet = hesaplaMaliOzet({
    toplamGelirKdvDahil: totalRevenue,
    toplamIadeKdvDahil: totalRefunds,
    toplamGiderIndirilebilir,
    toplamGiderIndirilemez,
  });

  const maliOzetAylik = hesaplaMaliOzet({
    toplamGelirKdvDahil: monthRevenue,
    toplamIadeKdvDahil: monthRefunds,
    toplamGiderIndirilebilir: monthExpenses,
    toplamGiderIndirilemez: 0,
  });

  return {
    totalRevenue,
    monthRevenue,
    weekRevenue: Number(weekResult[0]?.total ?? 0),
    totalRefunds,
    monthRefunds,
    weekRefunds,
    totalExpenses,
    monthExpenses,
    netRevenue: totalRevenue - totalRefunds,
    netMonthRevenue: monthRevenue - monthRefunds,
    profit: maliOzet.gercekKar,
    monthProfit: maliOzetAylik.gercekKar,
    activeReturnCount,
    processedReturnCount,
    totalOrderCount,
    monthOrderCount,
    avgOrderValue: totalOrderCount > 0 ? totalRevenue / totalOrderCount : 0,
    statusBreakdown: statusBreakdown.map(r => ({
      status: r.status,
      orderCount: r.orderCount,
      revenue: Number(r.revenue ?? 0),
    })),
    topProducts: topProducts.map(p => ({
      productId: p.productId,
      nameTR: p.nameTR,
      imageUrl: p.imageUrl,
      totalQty: Number(p.totalQty ?? 0),
      totalRevenue: Number(p.totalRevenue ?? 0),
    })),
    dailyRevenue,
    monthlyRevenue,
    expensesByCategory: expensesByCategoryRaw.map(e => ({
      category: e.category,
      total: Number(e.total ?? 0),
    })),
    returnedOrderNumbers: returnedOrderNumbersRaw.map(r => r.orderNumber),
    totalKdvCollected: Number(totalKdvResult[0]?.total ?? 0),
    monthKdvCollected: Number(monthKdvResult[0]?.total ?? 0),
    netRevenueExKdv: Number(totalSubtotalResult[0]?.total ?? 0),
    monthRevenueExKdv: Number(monthSubtotalResult[0]?.total ?? 0),
    paymentMethodBreakdown: paymentMethodRaw.map(r => ({
      method: r.method,
      count: r.orderCount,
      total: Number(r.total ?? 0),
    })),
    invoicePendingCount: Number(invoicePendingCount ?? 0),

    kdvHaricGelir: maliOzet.kdvHaricGelir,
    kdvHaricNetGelir: maliOzet.kdvHaricNetGelir,
    kdvHaricGider: maliOzet.kdvHaricGider,
    gercekKar: maliOzet.gercekKar,
    kdvHaricAylikGelir: maliOzetAylik.kdvHaricNetGelir,
    gercekAylikKar: maliOzetAylik.gercekKar,

    tahsilKdv: maliOzet.tahsilKdv,
    iadeKdv: maliOzet.iadeKdv,
    indirilecekKdv: maliOzet.indirilecekKdv,
    odenecekKdv: maliOzet.odenecekKdv,
    aylikTahsilKdv: maliOzetAylik.tahsilKdv,
    aylikOdenecekKdv: maliOzetAylik.odenecekKdv,

    yillikMatrahTahmini: maliOzet.yillikMatrahTahmini,
    yillikGelirVergisiTahmini: maliOzet.yillikGelirVergisiTahmini,
  };
}
