import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { deleteCustomerUserById, getUsersByRole, updateUserRole } from "../db";
import { ENV } from "../_core/env";
import { adminProcedure, router } from "../_core/trpc";

export const usersRouter = router({
  list: adminProcedure
    .input(
      z.object({
        role: z.enum(["user", "admin"]),
        search: z.string().max(200).optional(),
      }),
    )
    .query(async ({ input }) => {
      return await getUsersByRole(input.role, input.search?.trim() || undefined);
    }),
  updateRole: adminProcedure
    .input(z.object({ id: z.number(), role: z.enum(["user", "admin"]) }))
    .mutation(async ({ input }) => {
      try {
        return await updateUserRole(input.id, input.role);
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Rol güncellenemedi.";
        throw new TRPCError({ code: "BAD_REQUEST", message: msg });
      }
    }),
  deleteCustomer: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const result = await deleteCustomerUserById(input.id, {
        actorUserId: ctx.user.id,
        ownerOpenId: ENV.ownerOpenId || undefined,
      });
      if (!result.ok) {
        throw new TRPCError({ code: "BAD_REQUEST", message: result.error });
      }
      return { success: true as const };
    }),
});
