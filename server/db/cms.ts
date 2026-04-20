import { desc, eq } from "drizzle-orm";
import { cmsPages, type InsertCmsPage } from "../../drizzle/schema";
import { getDb } from "./client";

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
