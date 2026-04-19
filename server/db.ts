import { and, count, desc, eq, gte, ne, sql, sum } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import {
  InsertCategory,
  InsertCmsPage,
  InsertCollection,
  InsertDiscount,
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
  mediaItems,
  newsletterSubscriptions,
  orderItems,
  orders,
  products,
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
    return { userCount: 0, productCount: 0, orderCount: 0, newsletterCount: 0, recentOrders: [] };

  const [
    [{ userCount }],
    [{ productCount }],
    [{ orderCount }],
    [{ newsletterCount }],
    recentOrders,
  ] = await Promise.all([
    db.select({ userCount: count() }).from(users),
    db.select({ productCount: count() }).from(products),
    db.select({ orderCount: count() }).from(orders),
    db.select({ newsletterCount: count() }).from(newsletterSubscriptions),
    db.select().from(orders).orderBy(desc(orders.createdAt)).limit(5),
  ]);

  return { userCount, productCount, orderCount, newsletterCount, recentOrders };
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
    return { totalRevenue: 0, monthRevenue: 0, weekRevenue: 0, statusBreakdown: [], topProducts: [] };
  }

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - 7);

  const [totalResult, monthResult, weekResult, statusBreakdown, topProducts] = await Promise.all([
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
      .groupBy(orderItems.productId, products.nameTR, products.imageUrl)
      .orderBy(desc(sum(orderItems.quantity)))
      .limit(5),
  ]);

  return {
    totalRevenue: Number(totalResult[0]?.total ?? 0),
    monthRevenue: Number(monthResult[0]?.total ?? 0),
    weekRevenue: Number(weekResult[0]?.total ?? 0),
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
  };
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
