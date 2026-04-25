import { eq } from "drizzle-orm";
import { heroSlides, type InsertHeroSlide } from "../../drizzle/schema";
import { getDb } from "./client";

type HeroSlideInsertPayload = Omit<InsertHeroSlide, "id" | "createdAt" | "updatedAt"> & {
  imgUrlMobile?: string | null;
  duration?: number;
};
type HeroSlideUpdatePayload = Partial<HeroSlideInsertPayload>;

export async function getAllHeroSlides() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(heroSlides).orderBy(heroSlides.sortOrder, heroSlides.createdAt);
}

export async function getActiveHeroSlides() {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(heroSlides)
    .where(eq(heroSlides.isActive, true))
    .orderBy(heroSlides.sortOrder, heroSlides.createdAt);
}

export async function createHeroSlide(data: HeroSlideInsertPayload) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(heroSlides).values(data);
  return { success: true };
}

export async function updateHeroSlide(id: number, data: HeroSlideUpdatePayload) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(heroSlides).set({ ...data, updatedAt: new Date() }).where(eq(heroSlides.id, id));
  return { success: true };
}

export async function deleteHeroSlide(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(heroSlides).where(eq(heroSlides.id, id));
  return { success: true };
}
