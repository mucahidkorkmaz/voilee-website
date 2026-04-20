import { and, count, desc, eq, gte, ne, sql, sum } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import {
  InsertCategory,
  InsertCmsPage,
  InsertCollection,
  InsertDiscount,
  InsertExpense,
  InsertMediaItem,
  InsertProduct,
  InsertSilhouette,
  InsertStoreSettings,
  InsertUser,
  InsertWebhook,
  categories,
  cmsPages,
  collections,
  discounts,
  emailTemplates,
  expenses,
  mediaItems,
  newsletterSubscriptions,
  orderItems,
  orders,
  products,
  returnItems,
  returns,
  silhouettes,
  storeSettings,
  users,
  webhooks,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      const client = postgres(process.env.DATABASE_URL);
      _db = drizzle(client);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = { openId: user.openId };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) values.lastSignedIn = new Date();
    if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();

    await db
      .insert(users)
      .values(values)
      .onConflictDoUpdate({ target: users.openId, set: updateSet });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user by email: database not available");
    return undefined;
  }
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createUserWithPassword(input: {
  openId: string;
  email: string;
  name: string;
  phone?: string | null;
  passwordHash: string;
  loginMethod?: string;
}) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create user: database not available");
    return undefined;
  }
  const now = new Date();
  await db.insert(users).values({
    openId: input.openId,
    email: input.email,
    name: input.name,
    phone: input.phone ?? null,
    passwordHash: input.passwordHash,
    loginMethod: input.loginMethod ?? "email",
    role: "user",
    emailVerified: false,
    lastSignedIn: now,
  });
  const created = await db
    .select()
    .from(users)
    .where(eq(users.openId, input.openId))
    .limit(1);
  return created[0];
}

export async function updateUserLastSignedIn(openId: string) {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set({ lastSignedIn: new Date() }).where(eq(users.openId, openId));
}

export async function updateUserPasswordHash(openId: string, passwordHash: string) {
  const db = await getDb();
  if (!db) return false;
  await db.update(users).set({ passwordHash }).where(eq(users.openId, openId));
  return true;
}

export async function updateUserProfile(
  openId: string,
  fields: { name?: string; phone?: string | null }
) {
  const db = await getDb();
  if (!db) return undefined;
  const set: Record<string, unknown> = { updatedAt: new Date() };
  if (fields.name !== undefined) set.name = fields.name;
  if (fields.phone !== undefined) set.phone = fields.phone;
  await db.update(users).set(set).where(eq(users.openId, openId));
  const [updated] = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return updated;
}

// ─── Admin queries ────────────────────────────────────────────────────────────

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

export async function getAllUsers() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(users).orderBy(desc(users.createdAt));
}

export async function updateUserRole(id: number, role: "user" | "admin") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(users).set({ role }).where(eq(users.id, id));
  return { success: true };
}

export async function getAllProducts() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(products).orderBy(desc(products.createdAt));
}

export async function createProduct(
  data: Omit<InsertProduct, "id" | "createdAt" | "updatedAt">,
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(products).values(data);
  return { success: true };
}

export async function updateProduct(
  id: number,
  data: Partial<Omit<InsertProduct, "id" | "createdAt" | "updatedAt">>,
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(products).set(data).where(eq(products.id, id));
  return { success: true };
}

export async function deleteProduct(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(orderItems).where(eq(orderItems.productId, id));
  await db.delete(products).where(eq(products.id, id));
  return { success: true };
}

export async function getAllOrders() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orders).orderBy(desc(orders.createdAt));
}

export async function updateOrderStatus(
  id: number,
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled",
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(orders).set({ status }).where(eq(orders.id, id));
  return { success: true };
}

export async function getNewsletterSubscriptions() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(newsletterSubscriptions).orderBy(desc(newsletterSubscriptions.createdAt));
}

// ─── Revenue ──────────────────────────────────────────────────────────────────

export async function getRevenueStats() {
  const db = await getDb();
  if (!db) {
    return {
      totalRevenue: 0, monthRevenue: 0, weekRevenue: 0,
      totalRefunds: 0, monthRefunds: 0, weekRefunds: 0,
      totalExpenses: 0, monthExpenses: 0,
      activeReturnCount: 0, processedReturnCount: 0,
      totalOrderCount: 0, monthOrderCount: 0,
      statusBreakdown: [], topProducts: [],
      dailyRevenue: [] as { date: string; revenue: number; refunds: number; orders: number }[],
      monthlyRevenue: [] as { month: string; revenue: number; refunds: number; expenses: number; orders: number }[],
      expensesByCategory: [] as { category: string; total: number }[],
      returnedOrderNumbers: [] as string[],
    };
  }

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - 7);
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(now.getDate() - 30);
  const twelveMonthsAgo = new Date(now.getFullYear() - 1, now.getMonth(), 1);

  const [
    totalResult, monthResult, weekResult,
    statusBreakdown, topProducts,
    totalRefundResult, monthRefundResult, weekRefundResult,
    [{ activeReturnCount }], [{ processedReturnCount }],
    [{ totalOrderCount }], [{ monthOrderCount }],
    totalExpenseResult, monthExpenseResult,
    dailyRevenueRaw, dailyRefundsRaw,
    monthlyRevenueRaw, monthlyRefundsRaw, monthlyExpensesRaw,
    expensesByCategoryRaw,
    returnedOrderNumbersRaw,
  ] = await Promise.all([
    db
      .select({ total: sum(orders.totalPrice) })
      .from(orders)
      .where(ne(orders.status, "cancelled")),
    db
      .select({ total: sum(orders.totalPrice) })
      .from(orders)
      .where(and(ne(orders.status, "cancelled"), gte(orders.createdAt, startOfMonth))),
    db
      .select({ total: sum(orders.totalPrice) })
      .from(orders)
      .where(and(ne(orders.status, "cancelled"), gte(orders.createdAt, startOfWeek))),
    db
      .select({
        status: orders.status,
        orderCount: count(),
        revenue: sum(orders.totalPrice),
      })
      .from(orders)
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
      .where(ne(orders.status, "cancelled"))
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
    db
      .select({ totalOrderCount: count() })
      .from(orders)
      .where(ne(orders.status, "cancelled")),
    db
      .select({ monthOrderCount: count() })
      .from(orders)
      .where(and(ne(orders.status, "cancelled"), gte(orders.createdAt, startOfMonth))),
    db
      .select({ total: sum(expenses.amount) })
      .from(expenses),
    db
      .select({ total: sum(expenses.amount) })
      .from(expenses)
      .where(gte(expenses.date, startOfMonth)),
    db
      .select({
        day: sql<string>`TO_CHAR(${orders.createdAt}, 'YYYY-MM-DD')`,
        revenue: sum(orders.totalPrice),
        orderCount: count(),
      })
      .from(orders)
      .where(and(ne(orders.status, "cancelled"), gte(orders.createdAt, thirtyDaysAgo)))
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
      .where(and(ne(orders.status, "cancelled"), gte(orders.createdAt, twelveMonthsAgo)))
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
      .where(and(ne(returns.status, "rejected"))),
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
    profit: totalRevenue - totalRefunds - totalExpenses,
    monthProfit: monthRevenue - monthRefunds - monthExpenses,
    activeReturnCount,
    processedReturnCount,
    totalOrderCount,
    monthOrderCount,
    avgOrderValue: totalOrderCount > 0 ? (totalRevenue / totalOrderCount) : 0,
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
  };
}

// ─── Expenses ──────────────────────────────────────────────────────────────────

export async function getAllExpenses() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(expenses).orderBy(desc(expenses.date));
}

export async function createExpense(data: Omit<InsertExpense, "id" | "createdAt" | "updatedAt">) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [created] = await db.insert(expenses).values(data).returning();
  return created;
}

export async function updateExpense(id: number, data: Partial<Omit<InsertExpense, "id" | "createdAt" | "updatedAt">>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(expenses).set({ ...data, updatedAt: new Date() }).where(eq(expenses.id, id));
  return { success: true };
}

export async function deleteExpense(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(expenses).where(eq(expenses.id, id));
  return { success: true };
}

// ─── Order Detail ─────────────────────────────────────────────────────────────

export async function getOrderWithItems(orderId: number) {
  const db = await getDb();
  if (!db) return null;

  const [order] = await db.select().from(orders).where(eq(orders.id, orderId));
  if (!order) return null;

  const items = await db
    .select({
      id: orderItems.id,
      quantity: orderItems.quantity,
      price: orderItems.price,
      productId: orderItems.productId,
      productNameTR: products.nameTR,
      productImageUrl: products.imageUrl,
    })
    .from(orderItems)
    .leftJoin(products, eq(orderItems.productId, products.id))
    .where(eq(orderItems.orderId, orderId));

  return { ...order, items };
}

// ─── Store Settings ────────────────────────────────────────────────────────────

export async function getStoreSettings() {
  const db = await getDb();
  if (!db) return null;
  try {
    const [settings] = await db.select().from(storeSettings).limit(1);
    return settings ?? null;
  } catch {
    return null;
  }
}

export async function upsertStoreSettings(
  data: Partial<Omit<InsertStoreSettings, "id" | "updatedAt">>,
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await db.select({ id: storeSettings.id }).from(storeSettings).limit(1);

  if (existing.length === 0) {
    await db.insert(storeSettings).values({ ...data, updatedAt: new Date() });
  } else {
    await db
      .update(storeSettings)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(storeSettings.id, existing[0].id));
  }
  return { success: true };
}

// ─── Categories ───────────────────────────────────────────────────────────────

export async function getAllCategories() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(categories).orderBy(categories.sortOrder, categories.createdAt);
}

export async function createCategory(data: Omit<InsertCategory, "id" | "createdAt" | "updatedAt">) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(categories).values(data);
  return { success: true };
}

export async function updateCategory(id: number, data: Partial<Omit<InsertCategory, "id" | "createdAt" | "updatedAt">>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(categories).set({ ...data, updatedAt: new Date() }).where(eq(categories.id, id));
  return { success: true };
}

export async function deleteCategory(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(products).set({ categoryId: null }).where(eq(products.categoryId, id));
  await db.delete(categories).where(eq(categories.id, id));
  return { success: true };
}

// ─── Silhouettes ──────────────────────────────────────────────────────────────

export async function getAllSilhouettes() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(silhouettes).orderBy(silhouettes.sortOrder, silhouettes.createdAt);
}

export async function createSilhouette(data: Omit<InsertSilhouette, "id" | "createdAt" | "updatedAt">) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(silhouettes).values(data);
  return { success: true };
}

export async function updateSilhouette(id: number, data: Partial<Omit<InsertSilhouette, "id" | "createdAt" | "updatedAt">>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(silhouettes).set({ ...data, updatedAt: new Date() }).where(eq(silhouettes.id, id));
  return { success: true };
}

export async function deleteSilhouette(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(products).set({ silhouetteId: null }).where(eq(products.silhouetteId, id));
  await db.delete(silhouettes).where(eq(silhouettes.id, id));
  return { success: true };
}

// ─── Collections ──────────────────────────────────────────────────────────────

export async function getAllCollections() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(collections).orderBy(collections.sortOrder, collections.createdAt);
}

export async function createCollection(data: Omit<InsertCollection, "id" | "createdAt" | "updatedAt">) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(collections).values(data);
  return { success: true };
}

export async function updateCollection(id: number, data: Partial<Omit<InsertCollection, "id" | "createdAt" | "updatedAt">>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(collections).set({ ...data, updatedAt: new Date() }).where(eq(collections.id, id));
  return { success: true };
}

export async function deleteCollection(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(collections).where(eq(collections.id, id));
  return { success: true };
}

// ─── Media ────────────────────────────────────────────────────────────────────

export async function getAllMediaItems() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(mediaItems).orderBy(desc(mediaItems.createdAt));
}

export async function createMediaItem(data: Omit<InsertMediaItem, "id" | "createdAt">) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [item] = await db.insert(mediaItems).values(data).returning();
  return item;
}

export async function deleteMediaItem(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(mediaItems).where(eq(mediaItems.id, id));
  return { success: true };
}

// ─── Discounts ────────────────────────────────────────────────────────────────

export async function getAllDiscounts() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(discounts).orderBy(desc(discounts.createdAt));
}

export async function createDiscount(data: Omit<InsertDiscount, "id" | "createdAt" | "updatedAt">) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(discounts).values(data);
  return { success: true };
}

export async function updateDiscount(id: number, data: Partial<Omit<InsertDiscount, "id" | "createdAt" | "updatedAt">>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(discounts).set({ ...data, updatedAt: new Date() }).where(eq(discounts.id, id));
  return { success: true };
}

export async function deleteDiscount(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(discounts).where(eq(discounts.id, id));
  return { success: true };
}

// ─── Webhooks ─────────────────────────────────────────────────────────────────

export async function getAllWebhooks() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(webhooks).orderBy(desc(webhooks.createdAt));
}

export async function createWebhook(data: Omit<InsertWebhook, "id" | "createdAt" | "updatedAt">) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(webhooks).values(data);
  return { success: true };
}

export async function updateWebhook(id: number, data: Partial<Omit<InsertWebhook, "id" | "createdAt" | "updatedAt">>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(webhooks).set({ ...data, updatedAt: new Date() }).where(eq(webhooks.id, id));
  return { success: true };
}

export async function deleteWebhook(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(webhooks).where(eq(webhooks.id, id));
  return { success: true };
}

// ─── CMS Pages ────────────────────────────────────────────────────────────────

export async function getAllCmsPages() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(cmsPages).orderBy(desc(cmsPages.createdAt));
}

export async function getCmsPage(id: number) {
  const db = await getDb();
  if (!db) return null;
  const [page] = await db.select().from(cmsPages).where(eq(cmsPages.id, id));
  return page ?? null;
}

export async function createCmsPage(data: Omit<InsertCmsPage, "id" | "createdAt" | "updatedAt">) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(cmsPages).values(data);
  return { success: true };
}

export async function updateCmsPage(id: number, data: Partial<Omit<InsertCmsPage, "id" | "createdAt" | "updatedAt">>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(cmsPages).set({ ...data, updatedAt: new Date() }).where(eq(cmsPages.id, id));
  return { success: true };
}

export async function deleteCmsPage(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(cmsPages).where(eq(cmsPages.id, id));
  return { success: true };
}

// ─── Email Templates ──────────────────────────────────────────────────────────

export async function getAllEmailTemplates(): Promise<Record<string, { subject?: string; body?: string }>> {
  const db = await getDb();
  if (!db) return {};
  const rows = await db.select().from(emailTemplates);
  return Object.fromEntries(rows.map((r) => [r.key, { subject: r.subject ?? undefined, body: r.body ?? undefined }]));
}

export async function upsertEmailTemplate(key: string, subject: string, body: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const existing = await db.select({ id: emailTemplates.id }).from(emailTemplates).where(eq(emailTemplates.key, key)).limit(1);
  if (existing.length === 0) {
    await db.insert(emailTemplates).values({ key, subject, body, updatedAt: new Date() });
  } else {
    await db.update(emailTemplates).set({ subject, body, updatedAt: new Date() }).where(eq(emailTemplates.id, existing[0].id));
  }
  return { success: true };
}

export async function resetEmailTemplate(key: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(emailTemplates).where(eq(emailTemplates.key, key));
  return { success: true };
}

// ─── Returns ──────────────────────────────────────────────────────────────────

export async function createReturn(data: {
  orderNumber: string;
  userId?: number | null;
  customerEmail?: string | null;
  customerName?: string | null;
  reason: string;
  notes?: string | null;
  items?: Array<{
    productId?: number | null;
    productName: string;
    quantity: number;
    price?: number | null;
    imageUrl?: string | null;
  }>;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  const returnNumber = `IADE-${Date.now()}-${suffix}`;

  const [created] = await db.insert(returns).values({
    returnNumber,
    orderNumber: data.orderNumber,
    userId: data.userId ?? null,
    customerEmail: data.customerEmail ?? null,
    customerName: data.customerName ?? null,
    reason: data.reason,
    notes: data.notes ?? null,
    status: "requested",
  }).returning();

  if (data.items && data.items.length > 0) {
    await db.insert(returnItems).values(
      data.items.map(item => ({
        returnId: created.id,
        productId: item.productId ?? null,
        productName: item.productName,
        quantity: item.quantity,
        price: item.price != null ? String(item.price) : null,
        imageUrl: item.imageUrl ?? null,
      })),
    );
  }

  return created;
}

export async function getReturn(id: number) {
  const db = await getDb();
  if (!db) return null;
  const [ret] = await db.select().from(returns).where(eq(returns.id, id)).limit(1);
  if (!ret) return null;
  const items = await db.select().from(returnItems).where(eq(returnItems.returnId, id));
  return { ...ret, items };
}

export async function getActiveReturnForOrder(orderNumber: string) {
  const db = await getDb();
  if (!db) return null;
  const [existing] = await db
    .select()
    .from(returns)
    .where(and(eq(returns.orderNumber, orderNumber), ne(returns.status, "rejected")))
    .limit(1);
  return existing ?? null;
}

export async function getReturnsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  const userReturns = await db
    .select()
    .from(returns)
    .where(eq(returns.userId, userId))
    .orderBy(desc(returns.createdAt));
  const allItems = await db.select().from(returnItems);
  return userReturns.map(r => ({
    ...r,
    items: allItems.filter(i => i.returnId === r.id),
  }));
}

export async function getAllReturns() {
  const db = await getDb();
  if (!db) return [];
  const allReturns = await db.select().from(returns).orderBy(desc(returns.createdAt));
  const allItems = await db.select().from(returnItems);
  return allReturns.map(r => ({
    ...r,
    items: allItems.filter(i => i.returnId === r.id),
  }));
}

export async function updateReturnStatus(
  id: number,
  status: "requested" | "accepted" | "rejected" | "processed",
  adminNote?: string,
  refundAmount?: string,
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const set: Record<string, unknown> = { status, updatedAt: new Date() };
  if (adminNote !== undefined) set.adminNote = adminNote;
  if (refundAmount !== undefined) set.refundAmount = refundAmount;
  await db.update(returns).set(set).where(eq(returns.id, id));
  return { success: true };
}
