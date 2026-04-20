import { z } from "zod";
import {
  assignVerificationsToOrder,
  createProductVerification,
  deleteProductVerification,
  generateSerialsForProduct,
  getAllProductVerifications,
  releaseVerificationsByOrderNumber,
  updateProductVerification,
} from "../db";
import { adminProcedure, router } from "../_core/trpc";

export const verificationsRouter = router({
  list: adminProcedure.query(async () => {
    return await getAllProductVerifications();
  }),
  create: adminProcedure
    .input(
      z.object({
        serialNumber: z.string().min(1),
        productId: z.number().nullable().optional(),
        productNameTR: z.string().optional(),
        productNameEN: z.string().optional(),
        productNameAR: z.string().optional(),
        collection: z.string().optional(),
        collectionYear: z.string().optional(),
        batchNumber: z.string().optional(),
        productionDate: z.string().optional(),
        material: z.string().optional(),
        imageUrl: z.string().optional(),
        orderNumber: z.string().optional(),
        isActive: z.boolean().default(true),
      }),
    )
    .mutation(async ({ input }) => {
      return await createProductVerification(input);
    }),
  update: adminProcedure
    .input(
      z.object({
        id: z.number(),
        serialNumber: z.string().min(1).optional(),
        productId: z.number().nullable().optional(),
        productNameTR: z.string().optional(),
        productNameEN: z.string().optional(),
        productNameAR: z.string().optional(),
        collection: z.string().optional(),
        collectionYear: z.string().optional(),
        batchNumber: z.string().optional(),
        productionDate: z.string().optional(),
        material: z.string().optional(),
        imageUrl: z.string().optional(),
        orderNumber: z.string().optional(),
        status: z.enum(["unowned", "registered", "transferring"]).optional(),
        ownerName: z.string().optional(),
        ownerEmail: z.string().optional(),
        isActive: z.boolean().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      return await updateProductVerification(id, data);
    }),
  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      return await deleteProductVerification(input.id);
    }),
  generateBatch: adminProcedure
    .input(
      z.object({
        productId: z.number(),
        count: z.number().min(1).max(500),
        year: z.number().optional(),
        batchNumber: z.string().optional(),
        productionDate: z.string().optional(),
        material: z.string().optional(),
        collectionYear: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      return await generateSerialsForProduct({
        productId: input.productId,
        count: input.count,
        year: input.year,
        batchNumber: input.batchNumber ?? null,
        productionDate: input.productionDate ?? null,
        material: input.material ?? null,
        collectionYear: input.collectionYear ?? null,
      });
    }),
  assignToOrder: adminProcedure
    .input(
      z.object({
        ids: z.array(z.number()).min(1),
        orderNumber: z.string().min(1),
        orderItemId: z.number().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      return await assignVerificationsToOrder({
        ids: input.ids,
        orderNumber: input.orderNumber.trim(),
        orderItemId: input.orderItemId ?? null,
      });
    }),
  releaseByOrderNumber: adminProcedure
    .input(z.object({ orderNumber: z.string().min(1) }))
    .mutation(async ({ input }) => {
      return await releaseVerificationsByOrderNumber(input.orderNumber.trim());
    }),
});
