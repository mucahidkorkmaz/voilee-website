import { eq } from "drizzle-orm";
import { emailTemplates } from "../../drizzle/schema";
import { getDb } from "./client";

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

export async function getEmailTemplate(key: string): Promise<{ key: string; subject: string; body: string } | null> {
  try {
    const db = await getDb();
    if (!db) return null;

    const [row] = await db
      .select()
      .from(emailTemplates)
      .where(eq(emailTemplates.key, key))
      .limit(1);

    if (!row) return null;
    return { key: row.key, subject: row.subject ?? "", body: row.body ?? "" };
  } catch (err) {
    console.error(`[DB] getEmailTemplate("${key}") failed:`, err);
    return null;
  }
}
