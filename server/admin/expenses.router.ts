import { z } from "zod";
import { createExpense, deleteExpense, getAllExpenses, updateExpense } from "../db";
import { adminProcedure, router } from "../_core/trpc";

export const expensesRouter = router({
  list: adminProcedure.query(async () => {
    return await getAllExpenses();
  }),
  create: adminProcedure
    .input(
      z.object({
        category: z.enum([
          "shipping", "advertising", "material", "salary",
          "rent", "tax", "commission", "packaging", "software", "other",
        ]),
        description: z.string().min(1),
        amount: z.string(),
        date: z.string(),
        isRecurring: z.boolean().default(false),
        notes: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      return await createExpense({
        ...input,
        date: new Date(input.date),
      });
    }),
  update: adminProcedure
    .input(
      z.object({
        id: z.number(),
        category: z.enum([
          "shipping", "advertising", "material", "salary",
          "rent", "tax", "commission", "packaging", "software", "other",
        ]).optional(),
        description: z.string().min(1).optional(),
        amount: z.string().optional(),
        date: z.string().optional(),
        isRecurring: z.boolean().optional(),
        notes: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const { id, date, ...rest } = input;
      return await updateExpense(id, {
        ...rest,
        ...(date ? { date: new Date(date) } : {}),
      });
    }),
  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      return await deleteExpense(input.id);
    }),
});
