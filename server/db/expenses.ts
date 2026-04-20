import { desc, eq } from "drizzle-orm";
import { expenses, type InsertExpense } from "../../drizzle/schema";
import { getDb } from "./client";

export async function getAllExpenses() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(expenses).orderBy(desc(expenses.date));
}

export async function createExpense(data: Omit<InsertExpense, "id" | "createdAt" | "updatedAt">) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [created] = await db.insert(expenses).values(data).returning();
  return created;
}

export async function updateExpense(id: number, data: Partial<Omit<InsertExpense, "id" | "createdAt" | "updatedAt">>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(expenses).set({ ...data, updatedAt: new Date() }).where(eq(expenses.id, id));
  return { success: true };
}

export async function deleteExpense(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(expenses).where(eq(expenses.id, id));
  return { success: true };
}
