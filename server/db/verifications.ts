import { desc, eq, sql } from "drizzle-orm";
import {
  orders,
  products,
  productVerifications,
  type InsertProductVerification,
} from "../../drizzle/schema";
import { getDb } from "./client";

export async function getAllProductVerifications() {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(productVerifications)
    .orderBy(desc(productVerifications.createdAt));
}

export async function getProductVerificationBySerial(serialNumber: string) {
  const db = await getDb();
  if (!db) return null;
  const [row] = await db
    .select()
    .from(productVerifications)
    .where(eq(productVerifications.serialNumber, serialNumber))
    .limit(1);
  return row ?? null;
}

export async function getProductVerificationById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const [row] = await db
    .select()
    .from(productVerifications)
    .where(eq(productVerifications.id, id))
    .limit(1);
  return row ?? null;
}

export async function incrementVerificationScan(serialNumber: string) {
  const db = await getDb();
  if (!db) return null;
  const existing = await getProductVerificationBySerial(serialNumber);
  if (!existing) return null;
  const now = new Date();
  await db
    .update(productVerifications)
    .set({
      scanCount: (existing.scanCount ?? 0) + 1,
      firstScannedAt: existing.firstScannedAt ?? now,
      lastScannedAt: now,
      updatedAt: now,
    })
    .where(eq(productVerifications.id, existing.id));
  return getProductVerificationById(existing.id);
}

export async function createProductVerification(
  data: Omit<InsertProductVerification, "id" | "createdAt" | "updatedAt">,
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [created] = await db
    .insert(productVerifications)
    .values(data)
    .returning();
  return created;
}

export async function updateProductVerification(
  id: number,
  data: Partial<Omit<InsertProductVerification, "id" | "createdAt" | "updatedAt">>,
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db
    .update(productVerifications)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(productVerifications.id, id));
  return { success: true };
}

export async function deleteProductVerification(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(productVerifications).where(eq(productVerifications.id, id));
  return { success: true };
}

export async function registerVerificationOwner(
  serialNumber: string,
  owner: { userId?: number | null; name: string; email?: string | null },
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const existing = await getProductVerificationBySerial(serialNumber);
  if (!existing) throw new Error("Doğrulama kaydı bulunamadı.");
  if (existing.status === "registered")
    throw new Error("Bu parça zaten tescil edilmiş.");
  const now = new Date();
  await db
    .update(productVerifications)
    .set({
      status: "registered",
      ownerUserId: owner.userId ?? null,
      ownerName: owner.name,
      ownerEmail: owner.email ?? null,
      registeredAt: now,
      transferToName: null,
      transferToEmail: null,
      transferNote: null,
      transferInitiatedAt: null,
      updatedAt: now,
    })
    .where(eq(productVerifications.id, existing.id));
  return getProductVerificationById(existing.id);
}

export async function initiateVerificationTransfer(
  serialNumber: string,
  transfer: { name: string; email: string; note?: string | null },
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const existing = await getProductVerificationBySerial(serialNumber);
  if (!existing) throw new Error("Doğrulama kaydı bulunamadı.");
  if (existing.status !== "registered")
    throw new Error("Devir için parçanın önce tescil edilmiş olması gerekir.");
  const now = new Date();
  await db
    .update(productVerifications)
    .set({
      status: "transferring",
      transferToName: transfer.name,
      transferToEmail: transfer.email,
      transferNote: transfer.note ?? null,
      transferInitiatedAt: now,
      updatedAt: now,
    })
    .where(eq(productVerifications.id, existing.id));
  return getProductVerificationById(existing.id);
}

export async function cancelVerificationTransfer(serialNumber: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const existing = await getProductVerificationBySerial(serialNumber);
  if (!existing) throw new Error("Doğrulama kaydı bulunamadı.");
  const now = new Date();
  await db
    .update(productVerifications)
    .set({
      status: existing.ownerName ? "registered" : "unowned",
      transferToName: null,
      transferToEmail: null,
      transferNote: null,
      transferInitiatedAt: null,
      updatedAt: now,
    })
    .where(eq(productVerifications.id, existing.id));
  return getProductVerificationById(existing.id);
}

// Batch generate VL-YYYY-NNNNN serial numbers for a product.
export async function generateSerialsForProduct(input: {
  productId: number;
  count: number;
  year?: number;
  batchNumber?: string | null;
  productionDate?: string | null;
  material?: string | null;
  collectionYear?: string | null;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  if (input.count < 1 || input.count > 500)
    throw new Error("Üretilecek adet 1 ile 500 arasında olmalıdır.");

  const [product] = await db
    .select()
    .from(products)
    .where(eq(products.id, input.productId))
    .limit(1);
  if (!product) throw new Error("Ürün bulunamadı.");

  const year = input.year ?? new Date().getFullYear();
  const prefix = `VL-${year}-`;

  // Find the highest existing suffix for this year prefix and continue from there.
  const existingRows = await db
    .select({ serialNumber: productVerifications.serialNumber })
    .from(productVerifications)
    .where(sql`${productVerifications.serialNumber} LIKE ${prefix + "%"}`);

  let maxSuffix = 0;
  for (const row of existingRows) {
    const match = row.serialNumber.match(/^VL-\d{4}-(\d+)$/);
    if (match) {
      const n = parseInt(match[1], 10);
      if (!isNaN(n) && n > maxSuffix) maxSuffix = n;
    }
  }

  const generated: string[] = [];
  const now = new Date();
  const rowsToInsert: InsertProductVerification[] = [];

  for (let i = 1; i <= input.count; i++) {
    const suffix = String(maxSuffix + i).padStart(5, "0");
    const serial = `${prefix}${suffix}`;
    generated.push(serial);
    rowsToInsert.push({
      serialNumber: serial,
      productId: product.id,
      productNameTR: product.nameTR,
      productNameEN: product.nameEN,
      productNameAR: product.nameAR,
      collection: product.collection,
      collectionYear: input.collectionYear ?? String(year),
      batchNumber: input.batchNumber ?? null,
      productionDate: input.productionDate ?? null,
      material: input.material ?? null,
      imageUrl: product.imageUrl,
      status: "unowned",
      scanCount: 0,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
  }

  const inserted = await db
    .insert(productVerifications)
    .values(rowsToInsert)
    .returning();

  return inserted;
}

export async function getVerificationsByOrderNumber(orderNumber: string) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(productVerifications)
    .where(eq(productVerifications.orderNumber, orderNumber))
    .orderBy(productVerifications.serialNumber);
}

export async function assignVerificationsToOrder(input: {
  ids: number[];
  orderNumber: string;
  orderItemId?: number | null;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  if (input.ids.length === 0) return { success: true, updated: 0 };
  const now = new Date();
  const result = await db
    .update(productVerifications)
    .set({
      orderNumber: input.orderNumber,
      orderItemId: input.orderItemId ?? null,
      updatedAt: now,
    })
    .where(sql`${productVerifications.id} = ANY(${input.ids})`)
    .returning({ id: productVerifications.id });
  return { success: true, updated: result.length };
}

export async function releaseVerificationsByOrderNumber(orderNumber: string) {
  const db = await getDb();
  if (!db) return { released: 0 };
  const now = new Date();
  const rows = await db
    .update(productVerifications)
    .set({
      status: "unowned",
      ownerUserId: null,
      ownerName: null,
      ownerEmail: null,
      registeredAt: null,
      transferToName: null,
      transferToEmail: null,
      transferNote: null,
      transferInitiatedAt: null,
      updatedAt: now,
    })
    .where(eq(productVerifications.orderNumber, orderNumber))
    .returning({ id: productVerifications.id });
  return { released: rows.length };
}

// Hybrid claim: verification.orderNumber must match one of the user's delivered
// orders. Falls back to error to force the open "manual" registration path.
export async function claimVerificationForUser(input: {
  serialNumber: string;
  userId: number;
  userName: string;
  userEmail?: string | null;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const existing = await getProductVerificationBySerial(input.serialNumber);
  if (!existing) throw new Error("Doğrulama kaydı bulunamadı.");
  if (existing.status === "registered")
    throw new Error("Bu parça zaten tescil edilmiş.");
  if (!existing.orderNumber)
    throw new Error("Bu parça henüz bir sipariş ile eşleştirilmemiş. Lütfen formu doldurarak adınıza tescil edin.");

  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.orderNumber, existing.orderNumber))
    .limit(1);

  if (!order)
    throw new Error("Eşleşen sipariş bulunamadı. Lütfen formu doldurarak adınıza tescil edin.");
  if (order.userId !== input.userId)
    throw new Error("Bu parça başka bir hesaba ait siparişten geliyor.");
  if (order.status !== "delivered")
    throw new Error("Sahiplenme için siparişinizin teslim edilmiş olması gerekir.");

  return registerVerificationOwner(input.serialNumber, {
    userId: input.userId,
    name: input.userName,
    email: input.userEmail ?? null,
  });
}
