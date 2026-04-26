import { desc, eq } from "drizzle-orm";
import { newsletterSubscriptions, orderItems, orders, products } from "../../drizzle/schema";
import { getDb } from "./client";

export type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled";

export async function getAllOrders() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orders).orderBy(desc(orders.createdAt));
}

export async function getOrderSummaryByOrderNumber(orderNumber: string) {
  const db = await getDb();
  if (!db) return null;
  const [row] = await db
    .select({ totalPrice: orders.totalPrice })
    .from(orders)
    .where(eq(orders.orderNumber, orderNumber))
    .limit(1);
  return row ?? null;
}

export async function updateOrderStatus(
  id: number,
  status: OrderStatus,
  opts?: { trackingNumber?: string; cargoCompany?: string },
) {
  const db = await getDb();
  if (!db) return { success: false };

  const base: Record<string, unknown> = { status, updatedAt: new Date() };
  if (opts?.trackingNumber !== undefined) base.trackingNumber = opts.trackingNumber || null;
  if (opts?.cargoCompany !== undefined) base.cargoCompany = opts.cargoCompany || null;

  if (status === "delivered") {
    Object.assign(base, { paymentStatus: "paid", paidAt: new Date() });
  }

  await db.update(orders).set(base).where(eq(orders.id, id));

  if (status === "delivered") {
    import("../integrations/parasut")
      .then(({ handleOrderDeliveredForInvoice }) => handleOrderDeliveredForInvoice(id))
      .catch(err => console.error("[Paraşüt] handleOrderDelivered hatası:", err));
  }

  return { success: true };
}

export async function getNewsletterSubscriptions() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(newsletterSubscriptions).orderBy(desc(newsletterSubscriptions.createdAt));
}

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
      unitPrice: orderItems.unitPrice,
      kdvRate: orderItems.kdvRate,
      productId: orderItems.productId,
      productNameTR: products.nameTR,
      productImageUrl: products.imageUrl,
    })
    .from(orderItems)
    .leftJoin(products, eq(orderItems.productId, products.id))
    .where(eq(orderItems.orderId, orderId));

  return { ...order, items };
}
