import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { adminRouter } from "./adminRouter";
import {
  cancelVerificationTransfer,
  claimVerificationForUser,
  createReturn,
  getProductVerificationBySerial,
  getReturn,
  getReturnsByUserId,
  getVerificationsByOrderNumber,
  incrementVerificationScan,
  initiateVerificationTransfer,
  registerVerificationOwner,
} from "./db";

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
  verification: router({
    bySerial: publicProcedure
      .input(z.object({ serialNumber: z.string().min(1), track: z.boolean().optional() }))
      .query(async ({ input }) => {
        const normalized = input.serialNumber.trim();
        if (input.track) {
          const tracked = await incrementVerificationScan(normalized);
          if (tracked) return tracked;
        }
        return await getProductVerificationBySerial(normalized);
      }),
    register: publicProcedure
      .input(
        z.object({
          serialNumber: z.string().min(1),
          name: z.string().min(1),
          email: z.string().email().optional(),
        }),
      )
      .mutation(async ({ input, ctx }) => {
        return await registerVerificationOwner(input.serialNumber.trim(), {
          userId: ctx.user?.id ?? null,
          name: input.name,
          email: ctx.user?.email ?? input.email ?? null,
        });
      }),
    transferStart: publicProcedure
      .input(
        z.object({
          serialNumber: z.string().min(1),
          name: z.string().min(1),
          email: z.string().email(),
          note: z.string().optional(),
        }),
      )
      .mutation(async ({ input }) => {
        return await initiateVerificationTransfer(input.serialNumber.trim(), {
          name: input.name,
          email: input.email,
          note: input.note ?? null,
        });
      }),
    transferCancel: publicProcedure
      .input(z.object({ serialNumber: z.string().min(1) }))
      .mutation(async ({ input }) => {
        return await cancelVerificationTransfer(input.serialNumber.trim());
      }),
    byOrderNumber: publicProcedure
      .input(z.object({ orderNumber: z.string().min(1) }))
      .query(async ({ input }) => {
        return await getVerificationsByOrderNumber(input.orderNumber.trim());
      }),
    claimForOrder: protectedProcedure
      .input(z.object({ serialNumber: z.string().min(1) }))
      .mutation(async ({ input, ctx }) => {
        return await claimVerificationForUser({
          serialNumber: input.serialNumber.trim(),
          userId: ctx.user.id,
          userName: ctx.user.name ?? ctx.user.email ?? "Müşteri",
          userEmail: ctx.user.email ?? null,
        });
      }),
  }),
  admin: adminRouter,
});

export type AppRouter = typeof appRouter;
