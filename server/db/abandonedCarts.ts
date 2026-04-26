import { and, desc, eq, lte, ne } from "drizzle-orm";
import { abandonedCarts } from "../../drizzle/schema";
import { getDb } from "./client";

export interface AbandonedCartItemPayload {
  id: number;
  nameTR: string;
  nameEN: string;
  nameAR: string;
  price: number;
  quantity: number;
  collection: string;
  imageUrl?: string;
}

export async function syncAbandonedCartSnapshot(input: {
  sessionId: string;
  userId: number | null;
  customerEmail: string | null;
  customerName: string | null;
  items: AbandonedCartItemPayload[];
  cartTotal: number;
}) {
  const db = await getDb();
  if (!db) return { ok: false as const };

  if (input.items.length === 0) {
    await db.delete(abandonedCarts).where(eq(abandonedCarts.sessionId, input.sessionId));
    return { ok: true as const };
  }

  const now = new Date();
  const itemsJson = JSON.stringify(input.items);
  const totalStr = input.cartTotal.toFixed(2);

  await db
    .insert(abandonedCarts)
    .values({
      sessionId: input.sessionId,
      userId: input.userId ?? undefined,
      customerEmail: input.customerEmail ?? undefined,
      customerName: input.customerName ?? undefined,
      itemsJson,
      cartTotal: totalStr,
      lastActivityAt: now,
      createdAt: now,
    })
    .onConflictDoUpdate({
      target: abandonedCarts.sessionId,
      set: {
        userId: input.userId ?? undefined,
        customerEmail: input.customerEmail ?? undefined,
        customerName: input.customerName ?? undefined,
        itemsJson,
        cartTotal: totalStr,
        lastActivityAt: now,
      },
    });

  return { ok: true as const };
}

export async function listStaleAbandonedCarts(minInactiveHours: number) {
  const db = await getDb();
  if (!db) return [];
  const cutoff = new Date(Date.now() - minInactiveHours * 60 * 60 * 1000);
  return db
    .select()
    .from(abandonedCarts)
    .where(and(lte(abandonedCarts.lastActivityAt, cutoff), ne(abandonedCarts.itemsJson, "[]")))
    .orderBy(desc(abandonedCarts.lastActivityAt));
}

export async function getAbandonedCartById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const [row] = await db.select().from(abandonedCarts).where(eq(abandonedCarts.id, id)).limit(1);
  return row ?? null;
}

export async function markAbandonedReminderSent(id: number) {
  const db = await getDb();
  if (!db) return;
  await db
    .update(abandonedCarts)
    .set({ reminderEmailSentAt: new Date() })
    .where(eq(abandonedCarts.id, id));
}
