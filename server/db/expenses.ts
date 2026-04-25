import { desc, eq } from "drizzle-orm";
import { expenses, type InsertExpense } from "../../drizzle/schema";
import { ayrıstırKdv } from "../finance";
import { getDb } from "./client";

export async function getAllExpenses() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(expenses).orderBy(desc(expenses.date));
}

export async function createExpense(data: Omit<InsertExpense, "id" | "createdAt" | "updatedAt">) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const kdvOrani = Number(data.kdvRate ?? 20);
  const { kdvHaric, kdv } = ayrıstırKdv(Number(data.amount), kdvOrani);

  const [created] = await db
    .insert(expenses)
    .values({
      ...data,
      kdvRate: kdvOrani.toFixed(2),
      kdvAmount: kdv.toFixed(2),
      netAmount: kdvHaric.toFixed(2),
    })
    .returning();
  return created;
}

export async function updateExpense(id: number, data: Partial<Omit<InsertExpense, "id" | "createdAt" | "updatedAt">>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  let patch: Partial<Omit<InsertExpense, "id" | "createdAt" | "updatedAt">> = { ...data };

  if (data.amount !== undefined || data.kdvRate !== undefined) {
    const [existing] = await db.select().from(expenses).where(eq(expenses.id, id)).limit(1);
    if (!existing) throw new Error("Expense not found");

    const amountNum = Number(data.amount ?? existing.amount);
    const kdvOrani = Number(data.kdvRate ?? existing.kdvRate ?? 20);
    const { kdvHaric, kdv } = ayrıstırKdv(amountNum, kdvOrani);
    patch = {
      ...patch,
      kdvRate: kdvOrani.toFixed(2),
      kdvAmount: kdv.toFixed(2),
      netAmount: kdvHaric.toFixed(2),
    };
  }

  await db.update(expenses).set({ ...patch, updatedAt: new Date() }).where(eq(expenses.id, id));
  return { success: true };
}

export async function deleteExpense(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(expenses).where(eq(expenses.id, id));
  return { success: true };
}
