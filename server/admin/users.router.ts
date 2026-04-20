import { z } from "zod";
import { getAllUsers, updateUserRole } from "../db";
import { adminProcedure, router } from "../_core/trpc";

export const usersRouter = router({
  list: adminProcedure.query(async () => {
    return await getAllUsers();
  }),
  updateRole: adminProcedure
    .input(z.object({ id: z.number(), role: z.enum(["user", "admin"]) }))
    .mutation(async ({ input }) => {
      return await updateUserRole(input.id, input.role);
    }),
});
