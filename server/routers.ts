import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { adminRouter } from "./adminRouter";
import { createReturn, getReturn, getReturnsByUserId } from "./db";

export const appRouter = router({
  // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),
  returns: router({
    submit: publicProcedure
      .input(
        z.object({
          orderNumber: z.string().min(1),
          reason: z.string().min(1),
          notes: z.string().optional(),
          customerEmail: z.string().email().optional(),
          customerName: z.string().optional(),
          items: z.array(
            z.object({
              productId: z.number().nullable().optional(),
              productName: z.string(),
              quantity: z.number().min(1),
              price: z.number().nullable().optional(),
              imageUrl: z.string().nullable().optional(),
            }),
          ).optional(),
        }),
      )
      .mutation(async ({ input, ctx }) => {
        return await createReturn({
          orderNumber: input.orderNumber,
          userId: ctx.user?.id ?? null,
          customerEmail: ctx.user?.email ?? input.customerEmail ?? null,
          customerName: ctx.user?.name ?? input.customerName ?? null,
          reason: input.reason,
          notes: input.notes ?? null,
          items: input.items,
        });
      }),
    get: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await getReturn(input.id);
      }),
    myReturns: protectedProcedure.query(async ({ ctx }) => {
      return await getReturnsByUserId(ctx.user.id);
    }),
  }),
  admin: adminRouter,
});

export type AppRouter = typeof appRouter;
