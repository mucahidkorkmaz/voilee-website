import { and, desc, eq, ne } from "drizzle-orm";
import { returnItems, returns } from "../../drizzle/schema";
import { getDb } from "./client";
import { releaseVerificationsByOrderNumber } from "./verifications";

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

  // When a return is fully processed, automatically release any verification
  // ownership tied to this order so the piece returns to "unowned" stock.
  if (status === "processed") {
    const [existing] = await db
      .select({ orderNumber: returns.orderNumber })
      .from(returns)
      .where(eq(returns.id, id))
      .limit(1);
    if (existing?.orderNumber) {
      await releaseVerificationsByOrderNumber(existing.orderNumber);
    }
  }

  return { success: true };
}
