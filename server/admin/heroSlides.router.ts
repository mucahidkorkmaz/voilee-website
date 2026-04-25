import { z } from "zod";
import { eq, sql } from "drizzle-orm";
import { heroSlides } from "../../drizzle/schema";
import {
  createHeroSlide,
  deleteHeroSlide,
  getDb,
  getAllHeroSlides,
  updateHeroSlide,
} from "../db";
import { adminProcedure, router } from "../_core/trpc";

const heroSlideInputSchema = z.object({
  imgUrl: z.string().min(1),
  imgUrlMobile: z.string().max(500).optional(),
  duration: z.number().min(1000).max(30000).default(6000),
  tagTR: z.string().default(""),
  tagEN: z.string().default(""),
  tagAR: z.string().default(""),
  titleTR: z.string().default(""),
  titleEN: z.string().default(""),
  titleAR: z.string().default(""),
  subtitleTR: z.string().default(""),
  subtitleEN: z.string().default(""),
  subtitleAR: z.string().default(""),
  ctaHrefTR: z.string().default("/koleksiyonlar"),
  ctaHrefEN: z.string().default("/en/collections"),
  ctaHrefAR: z.string().default("/ar/collections"),
  sortOrder: z.number().default(0),
  isActive: z.boolean().default(true),
});

export const heroSlidesRouter = router({
  list: adminProcedure.query(async () => {
    return await getAllHeroSlides();
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
        isActive: z.boolean().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db
        .update(heroSlides)
        .set({
          ...data,
          imgUrlMobile: input.imgUrlMobile,
          duration: input.duration,
          ctaVisible: sql`${input.ctaVisible}`,
          secVisible: sql`${input.secVisible}`,
          isActive: sql`${input.isActive ?? true}`,
          updatedAt: new Date(),
        })
        .where(eq(heroSlides.id, id));
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
