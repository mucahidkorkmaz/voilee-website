import { z } from "zod";
import { eq, sql } from "drizzle-orm";
import { heroSlides } from "../../drizzle/schema";
import {
  createHeroSlide,
  deleteHeroSlide,
  getDb,
  getActiveHeroSlides,
  getAllHeroSlides,
  updateHeroSlide,
} from "../db";
import { adminProcedure, publicProcedure, router } from "../_core/trpc";

const normalizeBoolean = (value: unknown): boolean => value === true || value === 1 || value === "true";

const normalizeSlideBooleans = <T extends { isActive: unknown; ctaVisible: unknown; secVisible: unknown }>(rows: T[]) =>
  rows.map(row => ({
    ...row,
    isActive: normalizeBoolean(row.isActive),
    ctaVisible: normalizeBoolean(row.ctaVisible),
    secVisible: normalizeBoolean(row.secVisible),
  }));

const heroSlideInputSchema = z.object({
  imgUrl: z.string().min(1),
  linkUrl: z.string().max(500).optional(),
  tagTR: z.string().default(""),
  tagEN: z.string().default(""),
  tagAR: z.string().default(""),
  titleTR: z.string().default(""),
  titleEN: z.string().default(""),
  titleAR: z.string().default(""),
  subtitleTR: z.string().default(""),
  subtitleEN: z.string().default(""),
  subtitleAR: z.string().default(""),
  ctaLabelTR: z.string().optional(),
  ctaLabelEN: z.string().optional(),
  ctaLabelAR: z.string().optional(),
  ctaHrefTR: z.string().default("/koleksiyonlar"),
  ctaHrefEN: z.string().default("/en/collections"),
  ctaHrefAR: z.string().default("/ar/collections"),
  ctaVisible: z.boolean(),
  secLabelTR: z.string().optional(),
  secLabelEN: z.string().optional(),
  secLabelAR: z.string().optional(),
  secHrefTR: z.string().optional(),
  secHrefEN: z.string().optional(),
  secHrefAR: z.string().optional(),
  secVisible: z.boolean(),
  sortOrder: z.number().default(0),
  isActive: z.boolean().default(true),
});

export const heroSlidesRouter = router({
  list: publicProcedure.query(async () => {
    const rows = await getActiveHeroSlides();
    console.log("DB LIST SAMPLE:", JSON.stringify(rows[0]));
    return normalizeSlideBooleans(rows);
  }),
  adminList: adminProcedure.query(async () => {
    const rows = await getAllHeroSlides();
    return normalizeSlideBooleans(rows);
  }),
  create: adminProcedure.input(heroSlideInputSchema).mutation(async ({ input }) => {
    return await createHeroSlide(input);
  }),
  update: adminProcedure
    .input(
      heroSlideInputSchema.partial().extend({
        id: z.number(),
        ctaVisible: z.boolean(),
        secVisible: z.boolean(),
      }),
    )
    .mutation(async ({ input }) => {
      console.log("DB UPDATE INPUT ctaVisible:", input.ctaVisible, typeof input.ctaVisible);
      console.log("DB UPDATE INPUT secVisible:", input.secVisible, typeof input.secVisible);
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db
        .update(heroSlides)
        .set({
          imgUrl: input.imgUrl,
          linkUrl: input.linkUrl ?? null,
          tagTR: input.tagTR,
          tagEN: input.tagEN,
          tagAR: input.tagAR,
          titleTR: input.titleTR,
          titleEN: input.titleEN,
          titleAR: input.titleAR,
          subtitleTR: input.subtitleTR,
          subtitleEN: input.subtitleEN,
          subtitleAR: input.subtitleAR,
          ctaLabelTR: input.ctaLabelTR,
          ctaLabelEN: input.ctaLabelEN,
          ctaLabelAR: input.ctaLabelAR,
          ctaHrefTR: input.ctaHrefTR,
          ctaHrefEN: input.ctaHrefEN,
          ctaHrefAR: input.ctaHrefAR,
          ctaVisible: sql`${input.ctaVisible}`,
          secLabelTR: input.secLabelTR,
          secLabelEN: input.secLabelEN,
          secLabelAR: input.secLabelAR,
          secHrefTR: input.secHrefTR,
          secHrefEN: input.secHrefEN,
          secHrefAR: input.secHrefAR,
          secVisible: sql`${input.secVisible}`,
          sortOrder: input.sortOrder,
          isActive: sql`${input.isActive}`,
          updatedAt: new Date(),
        })
        .where(eq(heroSlides.id, input.id));
      return { success: true };
    }),
  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      return await deleteHeroSlide(input.id);
    }),
  reorder: adminProcedure
    .input(
      z.array(
        z.object({
          id: z.number(),
          sortOrder: z.number(),
        }),
      ),
    )
    .mutation(async ({ input }) => {
      await Promise.all(input.map(item => updateHeroSlide(item.id, { sortOrder: item.sortOrder })));
      return { success: true };
    }),
});
