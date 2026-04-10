import { z } from "zod";
import {
  createProduct,
  deleteProduct,
  getAdminStats,
  getAllOrders,
  getAllProducts,
  getAllUsers,
  getNewsletterSubscriptions,
  updateOrderStatus,
  updateProduct,
  updateUserRole,
} from "./db";
import { adminProcedure, router } from "./_core/trpc";

export const adminRouter = router({
  stats: adminProcedure.query(async () => {
    return await getAdminStats();
  }),

  users: router({
    list: adminProcedure.query(async () => {
      return await getAllUsers();
    }),
    updateRole: adminProcedure
      .input(z.object({ id: z.number(), role: z.enum(["user", "admin"]) }))
      .mutation(async ({ input }) => {
        return await updateUserRole(input.id, input.role);
      }),
  }),

  products: router({
    list: adminProcedure.query(async () => {
      return await getAllProducts();
    }),
    create: adminProcedure
      .input(
        z.object({
          nameTR: z.string().min(1),
          nameEN: z.string().min(1),
          nameAR: z.string().min(1),
          descriptionTR: z.string().optional(),
          descriptionEN: z.string().optional(),
          descriptionAR: z.string().optional(),
          price: z.string(),
          collection: z.string().min(1),
          imageUrl: z.string().optional(),
          stock: z.number().default(0),
          isActive: z.boolean().default(true),
        }),
      )
      .mutation(async ({ input }) => {
        return await createProduct(input);
      }),
    update: adminProcedure
      .input(
        z.object({
          id: z.number(),
          nameTR: z.string().min(1).optional(),
          nameEN: z.string().min(1).optional(),
          nameAR: z.string().min(1).optional(),
          descriptionTR: z.string().optional(),
          descriptionEN: z.string().optional(),
          descriptionAR: z.string().optional(),
          price: z.string().optional(),
          collection: z.string().optional(),
          imageUrl: z.string().optional(),
          stock: z.number().optional(),
          isActive: z.boolean().optional(),
        }),
      )
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return await updateProduct(id, data);
      }),
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return await deleteProduct(input.id);
      }),
  }),

  orders: router({
    list: adminProcedure.query(async () => {
      return await getAllOrders();
    }),
    updateStatus: adminProcedure
      .input(
        z.object({
          id: z.number(),
          status: z.enum(["pending", "processing", "shipped", "delivered", "cancelled"]),
        }),
      )
      .mutation(async ({ input }) => {
        return await updateOrderStatus(input.id, input.status);
      }),
  }),

  newsletter: router({
    list: adminProcedure.query(async () => {
      return await getNewsletterSubscriptions();
    }),
  }),
});
