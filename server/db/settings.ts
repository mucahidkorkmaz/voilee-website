import { eq } from "drizzle-orm";
import { storeSettings, type InsertStoreSettings } from "../../drizzle/schema";
import { getDb } from "./client";

/** Drops `undefined` so partial updates never write SQL NULL into columns we did not intend to touch. */
function omitUndefined(row: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(row)) {
    if (v !== undefined) out[k] = v;
  }
  return out;
}

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
  const payload = omitUndefined({ ...(data as Record<string, unknown>), updatedAt: new Date() });

  if (existing.length === 0) {
    await db.insert(storeSettings).values(payload as InsertStoreSettings);
  } else {
    await db.update(storeSettings).set(payload).where(eq(storeSettings.id, existing[0].id));
  }
  return { success: true };
}
