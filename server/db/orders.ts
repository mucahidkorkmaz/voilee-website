import { desc, eq } from "drizzle-orm";
import { newsletterSubscriptions, orderItems, orders, products } from "../../drizzle/schema";
import { getDb } from "./client";

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
  if (!db) return { success: false };

  await db
    .update(orders)
    .set(
      status === "delivered"
        ? { status, updatedAt: new Date(), paymentStatus: "paid", paidAt: new Date() }
        : { status, updatedAt: new Date() },
    )
    .where(eq(orders.id, id));

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
