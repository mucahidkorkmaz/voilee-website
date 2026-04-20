import { eq } from "drizzle-orm";
import { storeSettings, type InsertStoreSettings } from "../../drizzle/schema";
import { getDb } from "./client";

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
