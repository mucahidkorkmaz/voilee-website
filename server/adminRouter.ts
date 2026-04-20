import { z } from "zod";
import {
  createCategory,
  createCmsPage,
  createCollection,
  createDiscount,
  createExpense,
  createMediaItem,
  createProduct,
  createProductVerification,
  generateSerialsForProduct,
  assignVerificationsToOrder,
  releaseVerificationsByOrderNumber,
  createSilhouette,
  createWebhook,
  deleteCategory,
  deleteCollection,
  deleteCmsPage,
  deleteDiscount,
  deleteExpense,
  deleteMediaItem,
  deleteProduct,
  deleteProductVerification,
  deleteSilhouette,
  deleteWebhook,
  getAdminStats,
  getAllCategories,
  getAllCmsPages,
  getAllCollections,
  getAllDiscounts,
  getAllEmailTemplates,
  getAllExpenses,
  getAllMediaItems,
  getAllOrders,
  getAllProducts,
  getAllProductVerifications,
  getAllReturns,
  getAllSilhouettes,
  getAllUsers,
  getAllWebhooks,
  getCmsPage,
  getNewsletterSubscriptions,
  getOrderWithItems,
  getRevenueStats,
  getStoreSettings,
  updateCategory,
  updateCmsPage,
  updateCollection,
  updateDiscount,
  updateExpense,
  updateOrderStatus,
  updateProduct,
  updateProductVerification,
  updateReturnStatus,
  updateSilhouette,
  updateUserRole,
  updateWebhook,
  upsertEmailTemplate,
  resetEmailTemplate,
  upsertStoreSettings,
} from "./db";
import { adminProcedure, router } from "./_core/trpc";

export const adminRouter = router({
  stats: adminProcedure.query(async () => {
    return await getAdminStats();
  }),

  // ─── Users ──────────────────────────────────────────────────────────────────
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

  // ─── Products ───────────────────────────────────────────────────────────────
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
          collection: z.string().optional(),
          silhouetteId: z.number().nullable().optional(),
          categoryId: z.number().nullable().optional(),
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
          silhouetteId: z.number().nullable().optional(),
          categoryId: z.number().nullable().optional(),
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

  // ─── Categories ─────────────────────────────────────────────────────────────
  categories: router({
    list: adminProcedure.query(async () => {
      return await getAllCategories();
    }),
    create: adminProcedure
      .input(
        z.object({
          nameTR: z.string().min(1),
          nameEN: z.string().min(1),
          nameAR: z.string().min(1),
          silhouetteId: z.number().nullable().optional(),
          imageUrl: z.string().optional(),
          sortOrder: z.number().default(0),
          isActive: z.boolean().default(true),
        }),
      )
      .mutation(async ({ input }) => {
        return await createCategory(input);
      }),
    update: adminProcedure
      .input(
        z.object({
          id: z.number(),
          nameTR: z.string().min(1).optional(),
          nameEN: z.string().min(1).optional(),
          nameAR: z.string().min(1).optional(),
          silhouetteId: z.number().nullable().optional(),
          imageUrl: z.string().optional(),
          sortOrder: z.number().optional(),
          isActive: z.boolean().optional(),
        }),
      )
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return await updateCategory(id, data);
      }),
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return await deleteCategory(input.id);
      }),
  }),

  // ─── Silhouettes ───────────────────────────────────────────────────────────
  silhouettes: router({
    list: adminProcedure.query(async () => {
      return await getAllSilhouettes();
    }),
    create: adminProcedure
      .input(
        z.object({
          slug: z.string().min(1),
          nameTR: z.string().min(1),
          nameEN: z.string().min(1),
          nameAR: z.string().min(1),
          imageUrl: z.string().optional(),
          sortOrder: z.number().default(0),
          isActive: z.boolean().default(true),
        }),
      )
      .mutation(async ({ input }) => {
        return await createSilhouette(input);
      }),
    update: adminProcedure
      .input(
        z.object({
          id: z.number(),
          slug: z.string().min(1).optional(),
          nameTR: z.string().min(1).optional(),
          nameEN: z.string().min(1).optional(),
          nameAR: z.string().min(1).optional(),
          imageUrl: z.string().optional(),
          sortOrder: z.number().optional(),
          isActive: z.boolean().optional(),
        }),
      )
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return await updateSilhouette(id, data);
      }),
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return await deleteSilhouette(input.id);
      }),
  }),

  // ─── Collections ────────────────────────────────────────────────────────────
  collections: router({
    list: adminProcedure.query(async () => {
      return await getAllCollections();
    }),
    create: adminProcedure
      .input(
        z.object({
          slug: z.string().min(1),
          nameTR: z.string().min(1),
          nameEN: z.string().min(1),
          nameAR: z.string().min(1),
          descriptionTR: z.string().optional(),
          descriptionEN: z.string().optional(),
          descriptionAR: z.string().optional(),
          imageUrl: z.string().optional(),
          isActive: z.boolean().default(true),
          sortOrder: z.number().default(0),
        }),
      )
      .mutation(async ({ input }) => {
        return await createCollection(input);
      }),
    update: adminProcedure
      .input(
        z.object({
          id: z.number(),
          slug: z.string().min(1).optional(),
          nameTR: z.string().min(1).optional(),
          nameEN: z.string().min(1).optional(),
          nameAR: z.string().min(1).optional(),
          descriptionTR: z.string().optional(),
          descriptionEN: z.string().optional(),
          descriptionAR: z.string().optional(),
          imageUrl: z.string().optional(),
          isActive: z.boolean().optional(),
          sortOrder: z.number().optional(),
        }),
      )
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return await updateCollection(id, data);
      }),
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return await deleteCollection(input.id);
      }),
  }),

  // ─── Media ──────────────────────────────────────────────────────────────────
  media: router({
    list: adminProcedure.query(async () => {
      return await getAllMediaItems();
    }),
    add: adminProcedure
      .input(
        z.object({
          url: z.string().url(),
          filename: z.string().optional(),
          mimeType: z.string().optional(),
          sizeBytes: z.number().optional(),
          alt: z.string().optional(),
        }),
      )
      .mutation(async ({ input }) => {
        return await createMediaItem(input);
      }),
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return await deleteMediaItem(input.id);
      }),
  }),

  // ─── Orders ─────────────────────────────────────────────────────────────────
  orders: router({
    list: adminProcedure.query(async () => {
      return await getAllOrders();
    }),
    detail: adminProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await getOrderWithItems(input.id);
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

  // ─── Returns ────────────────────────────────────────────────────────────────
  returns: router({
    list: adminProcedure.query(async () => {
      return await getAllReturns();
    }),
    updateStatus: adminProcedure
      .input(
        z.object({
          id: z.number(),
          status: z.enum(["requested", "accepted", "rejected", "processed"]),
          adminNote: z.string().optional(),
          refundAmount: z.string().optional(),
        }),
      )
      .mutation(async ({ input }) => {
        return await updateReturnStatus(input.id, input.status, input.adminNote, input.refundAmount);
      }),
  }),

  // ─── Newsletter ─────────────────────────────────────────────────────────────
  newsletter: router({
    list: adminProcedure.query(async () => {
      return await getNewsletterSubscriptions();
    }),
  }),

  // ─── Revenue ────────────────────────────────────────────────────────────────
  revenue: router({
    stats: adminProcedure.query(async () => {
      return await getRevenueStats();
    }),
  }),

  // ─── Discounts ──────────────────────────────────────────────────────────────
  discounts: router({
    list: adminProcedure.query(async () => {
      return await getAllDiscounts();
    }),
    create: adminProcedure
      .input(
        z.object({
          code: z.string().min(1),
          type: z.enum(["percentage", "fixed"]),
          value: z.string(),
          minOrderAmount: z.string().optional(),
          maxUses: z.number().optional(),
          isActive: z.boolean().default(true),
          expiresAt: z.string().datetime().optional(),
        }),
      )
      .mutation(async ({ input }) => {
        return await createDiscount({
          ...input,
          expiresAt: input.expiresAt ? new Date(input.expiresAt) : undefined,
        });
      }),
    update: adminProcedure
      .input(
        z.object({
          id: z.number(),
          code: z.string().min(1).optional(),
          type: z.enum(["percentage", "fixed"]).optional(),
          value: z.string().optional(),
          minOrderAmount: z.string().optional(),
          maxUses: z.number().optional(),
          isActive: z.boolean().optional(),
          expiresAt: z.string().datetime().optional().nullable(),
        }),
      )
      .mutation(async ({ input }) => {
        const { id, expiresAt, ...rest } = input;
        return await updateDiscount(id, {
          ...rest,
          expiresAt: expiresAt ? new Date(expiresAt) : expiresAt === null ? undefined : undefined,
        });
      }),
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return await deleteDiscount(input.id);
      }),
  }),

  // ─── Expenses ──────────────────────────────────────────────────────────────
  expenses: router({
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
  }),

  // ─── Webhooks ───────────────────────────────────────────────────────────────
  webhooks: router({
    list: adminProcedure.query(async () => {
      return await getAllWebhooks();
    }),
    create: adminProcedure
      .input(
        z.object({
          name: z.string().min(1),
          url: z.string().url(),
          event: z.enum([
            "order.created", "order.updated", "order.shipped",
            "order.delivered", "order.cancelled",
            "product.created", "product.updated", "product.deleted",
            "user.registered",
          ]),
          secret: z.string().optional(),
          isActive: z.boolean().default(true),
        }),
      )
      .mutation(async ({ input }) => {
        return await createWebhook(input);
      }),
    update: adminProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().min(1).optional(),
          url: z.string().url().optional(),
          event: z.enum([
            "order.created", "order.updated", "order.shipped",
            "order.delivered", "order.cancelled",
            "product.created", "product.updated", "product.deleted",
            "user.registered",
          ]).optional(),
          secret: z.string().optional(),
          isActive: z.boolean().optional(),
        }),
      )
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return await updateWebhook(id, data);
      }),
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return await deleteWebhook(input.id);
      }),
  }),

  // ─── CMS Pages ──────────────────────────────────────────────────────────────
  cms: router({
    list: adminProcedure.query(async () => {
      return await getAllCmsPages();
    }),
    get: adminProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await getCmsPage(input.id);
      }),
    create: adminProcedure
      .input(
        z.object({
          slug: z.string().min(1),
          titleTR: z.string().min(1),
          titleEN: z.string().min(1),
          titleAR: z.string().min(1),
          contentTR: z.string().optional(),
          contentEN: z.string().optional(),
          contentAR: z.string().optional(),
          isPublished: z.boolean().default(false),
        }),
      )
      .mutation(async ({ input }) => {
        return await createCmsPage(input);
      }),
    update: adminProcedure
      .input(
        z.object({
          id: z.number(),
          slug: z.string().min(1).optional(),
          titleTR: z.string().min(1).optional(),
          titleEN: z.string().min(1).optional(),
          titleAR: z.string().min(1).optional(),
          contentTR: z.string().optional(),
          contentEN: z.string().optional(),
          contentAR: z.string().optional(),
          isPublished: z.boolean().optional(),
        }),
      )
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return await updateCmsPage(id, data);
      }),
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return await deleteCmsPage(input.id);
      }),
  }),

  // ─── Email Templates ────────────────────────────────────────────────────────
  emailTemplates: router({
    list: adminProcedure.query(async () => {
      return await getAllEmailTemplates();
    }),
    upsert: adminProcedure
      .input(
        z.object({
          key: z.string().min(1),
          subject: z.string(),
          body: z.string(),
        }),
      )
      .mutation(async ({ input }) => {
        return await upsertEmailTemplate(input.key, input.subject, input.body);
      }),
    reset: adminProcedure
      .input(z.object({ key: z.string().min(1) }))
      .mutation(async ({ input }) => {
        return await resetEmailTemplate(input.key);
      }),
  }),

  // ─── Product Verifications (Doğrulama) ─────────────────────────────────────
  verifications: router({
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
  }),

  // ─── Settings ───────────────────────────────────────────────────────────────
  settings: router({
    get: adminProcedure.query(async () => {
      return await getStoreSettings();
    }),
    update: adminProcedure
      .input(
        z.object({
          storeName: z.string().optional(),
          storeEmail: z.string().email().optional().or(z.literal("")),
          storePhone: z.string().optional(),
          storeAddress: z.string().optional(),
          faviconUrl: z.string().optional(),
          instagramUrl: z.string().optional(),
          facebookUrl: z.string().optional(),
          twitterUrl: z.string().optional(),
          youtubeUrl: z.string().optional(),
          tiktokUrl: z.string().optional(),
          pinterestUrl: z.string().optional(),
          linkedinUrl: z.string().optional(),
          snapchatUrl: z.string().optional(),
          whatsappUrl: z.string().optional(),
          telegramUrl: z.string().optional(),
          freeShippingThreshold: z.string().optional(),
          shippingCostDomestic: z.string().optional(),
          shippingCostInternational: z.string().optional(),
          smtpHost: z.string().optional(),
          smtpPort: z.string().optional(),
          smtpSecure: z.boolean().optional(),
          smtpUser: z.string().optional(),
          smtpPass: z.string().optional(),
          smtpFrom: z.string().optional(),
        }),
      )
      .mutation(async ({ input }) => {
        return await upsertStoreSettings(input);
      }),
  }),
});
