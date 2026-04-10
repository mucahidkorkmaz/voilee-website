import { count, desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import {
  InsertProduct,
  InsertUser,
  newsletterSubscriptions,
  orderItems,
  orders,
  products,
  users,
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
