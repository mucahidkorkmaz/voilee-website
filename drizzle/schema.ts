import {
  boolean,
  decimal,
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

// ─── Enums ────────────────────────────────────────────────────────────────────

export const roleEnum = pgEnum("role", ["user", "admin"]);
export const orderStatusEnum = pgEnum("order_status", [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
]);

// ─── Users ────────────────────────────────────────────────────────────────────

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  openId: varchar("openId", { length: 320 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 32 }),
  passwordHash: varchar("passwordHash", { length: 255 }),
  emailVerified: boolean("emailVerified").default(false).notNull(),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: roleEnum("role").default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── Silhouettes ──────────────────────────────────────────────────────────────

export const silhouettes = pgTable("silhouettes", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  nameTR: varchar("nameTR", { length: 255 }).notNull(),
  nameEN: varchar("nameEN", { length: 255 }).notNull(),
  nameAR: varchar("nameAR", { length: 255 }).notNull(),
  imageUrl: varchar("imageUrl", { length: 500 }),
  sortOrder: integer("sortOrder").default(0),
  isActive: boolean("isActive").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Silhouette = typeof silhouettes.$inferSelect;
export type InsertSilhouette = typeof silhouettes.$inferInsert;

// ─── Categories ───────────────────────────────────────────────────────────────

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  nameTR: varchar("nameTR", { length: 255 }).notNull(),
  nameEN: varchar("nameEN", { length: 255 }).notNull(),
  nameAR: varchar("nameAR", { length: 255 }).notNull(),
  silhouetteId: integer("silhouetteId"),
  imageUrl: varchar("imageUrl", { length: 500 }),
  sortOrder: integer("sortOrder").default(0),
  isActive: boolean("isActive").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Category = typeof categories.$inferSelect;
export type InsertCategory = typeof categories.$inferInsert;

// ─── Products ─────────────────────────────────────────────────────────────────

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  nameTR: varchar("nameTR", { length: 255 }).notNull(),
  nameEN: varchar("nameEN", { length: 255 }).notNull(),
  nameAR: varchar("nameAR", { length: 255 }).notNull(),
  descriptionTR: text("descriptionTR"),
  descriptionEN: text("descriptionEN"),
  descriptionAR: text("descriptionAR"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  kdvRate: decimal("kdvRate", { precision: 5, scale: 2 }).default("20.00"),
  currency: varchar("currency", { length: 3 }).default("TRY"),
  collection: varchar("collection", { length: 100 }),
  silhouetteId: integer("silhouetteId"),
  categoryId: integer("categoryId"),
  imageUrl: varchar("imageUrl", { length: 500 }),
  stock: integer("stock").default(0),
  isActive: boolean("isActive").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

// ─── Orders ───────────────────────────────────────────────────────────────────

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  orderNumber: varchar("orderNumber", { length: 50 }).notNull().unique(),
  totalPrice: decimal("totalPrice", { precision: 12, scale: 2 }).notNull(),
  status: orderStatusEnum("status").default("pending"),
  shippingAddress: text("shippingAddress"),
  shippingCountry: varchar("shippingCountry", { length: 100 }),
  trackingNumber: varchar("trackingNumber", { length: 100 }),
  kdvRate: decimal("kdvRate", { precision: 5, scale: 2 }).default("20.00"),
  kdvAmount: decimal("kdvAmount", { precision: 12, scale: 2 }),
  subtotal: decimal("subtotal", { precision: 12, scale: 2 }),
  shippingCost: decimal("shippingCost", { precision: 10, scale: 2 }).default("0"),
  discountAmount: decimal("discountAmount", { precision: 10, scale: 2 }).default("0"),
  currency: varchar("currency", { length: 3 }).default("TRY"),
  paymentMethod: varchar("paymentMethod", { length: 50 }),
  paymentStatus: varchar("paymentStatus", { length: 20 }).default("pending"),
  paidAt: timestamp("paidAt"),
  invoiceNumber: varchar("invoiceNumber", { length: 100 }),
  invoiceStatus: varchar("invoiceStatus", { length: 20 }).default("not_issued"),
  invoiceIssuedAt: timestamp("invoiceIssuedAt"),
  parasutInvoiceId: varchar("parasutInvoiceId", { length: 100 }),
  billingName: varchar("billingName", { length: 255 }),
  billingAddress: text("billingAddress"),
  billingCity: varchar("billingCity", { length: 100 }),
  billingCountry: varchar("billingCountry", { length: 100 }).default("TR"),
  taxNumber: varchar("taxNumber", { length: 20 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

// ─── Order Items ──────────────────────────────────────────────────────────────

export const orderItems = pgTable("orderItems", {
  id: serial("id").primaryKey(),
  orderId: integer("orderId").notNull(),
  productId: integer("productId").notNull(),
  quantity: integer("quantity").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  kdvRate: decimal("kdvRate", { precision: 5, scale: 2 }).default("20.00"),
  kdvAmount: decimal("kdvAmount", { precision: 10, scale: 2 }),
  unitPrice: decimal("unitPrice", { precision: 10, scale: 2 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = typeof orderItems.$inferInsert;

// ─── Wishlist ─────────────────────────────────────────────────────────────────

export const wishlist = pgTable("wishlist", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  productId: integer("productId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Wishlist = typeof wishlist.$inferSelect;
export type InsertWishlist = typeof wishlist.$inferInsert;

// ─── Newsletter ───────────────────────────────────────────────────────────────

export const newsletterSubscriptions = pgTable("newsletterSubscriptions", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  language: varchar("language", { length: 10 }).default("TR"),
  isActive: boolean("isActive").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type NewsletterSubscription = typeof newsletterSubscriptions.$inferSelect;
export type InsertNewsletterSubscription = typeof newsletterSubscriptions.$inferInsert;

// ─── Collections ─────────────────────────────────────────────────────────────

export const collections = pgTable("collections", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 200 }).notNull().unique(),
  nameTR: varchar("nameTR", { length: 255 }).notNull(),
  nameEN: varchar("nameEN", { length: 255 }).notNull(),
  nameAR: varchar("nameAR", { length: 255 }).notNull(),
  descriptionTR: text("descriptionTR"),
  descriptionEN: text("descriptionEN"),
  descriptionAR: text("descriptionAR"),
  imageUrl: varchar("imageUrl", { length: 500 }),
  isActive: boolean("isActive").default(true),
  sortOrder: integer("sortOrder").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Collection = typeof collections.$inferSelect;
export type InsertCollection = typeof collections.$inferInsert;

// ─── Hero Slides ───────────────────────────────────────────────────────────────

export const heroSlides = pgTable("heroSlides", {
  id: serial("id").primaryKey(),
  imgUrl: varchar("imgUrl", { length: 500 }).notNull(),
  imgUrlMobile: varchar("imgUrlMobile", { length: 500 }),
  duration: integer("duration").notNull().default(6000),
  linkUrl: varchar("linkUrl", { length: 500 }),
  tagTR: varchar("tagTR", { length: 255 }).notNull().default(""),
  tagEN: varchar("tagEN", { length: 255 }).notNull().default(""),
  tagAR: varchar("tagAR", { length: 255 }).notNull().default(""),
  titleTR: varchar("titleTR", { length: 500 }).notNull().default(""),
  titleEN: varchar("titleEN", { length: 500 }).notNull().default(""),
  titleAR: varchar("titleAR", { length: 500 }).notNull().default(""),
  subtitleTR: text("subtitleTR").notNull().default(""),
  subtitleEN: text("subtitleEN").notNull().default(""),
  subtitleAR: text("subtitleAR").notNull().default(""),
  ctaLabelTR: varchar("ctaLabelTR", { length: 255 }).notNull().default("Koleksiyonu Keşfet"),
  ctaLabelEN: varchar("ctaLabelEN", { length: 255 }).notNull().default("Explore Collection"),
  ctaLabelAR: varchar("ctaLabelAR", { length: 255 }).notNull().default("استكشف المجموعة"),
  ctaHrefTR: varchar("ctaHrefTR", { length: 500 }).notNull().default("/koleksiyonlar"),
  ctaHrefEN: varchar("ctaHrefEN", { length: 500 }).notNull().default("/en/collections"),
  ctaHrefAR: varchar("ctaHrefAR", { length: 500 }).notNull().default("/ar/collections"),
  ctaVisible: boolean("ctaVisible").notNull().default(true),
  secLabelTR: varchar("secLabelTR", { length: 255 }).notNull().default("Hikayemiz"),
  secLabelEN: varchar("secLabelEN", { length: 255 }).notNull().default("Our Story"),
  secLabelAR: varchar("secLabelAR", { length: 255 }).notNull().default("Our Story"),
  secHrefTR: varchar("secHrefTR", { length: 500 }).notNull().default("/hakkimizda"),
  secHrefEN: varchar("secHrefEN", { length: 500 }).notNull().default("/en/about"),
  secHrefAR: varchar("secHrefAR", { length: 500 }).notNull().default("/ar/about"),
  secVisible: boolean("secVisible").notNull().default(true),
  sortOrder: integer("sortOrder").notNull().default(0),
  isActive: boolean("isActive").notNull().default(true),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export type HeroSlide = typeof heroSlides.$inferSelect;
export type InsertHeroSlide = typeof heroSlides.$inferInsert;

// ─── Media ────────────────────────────────────────────────────────────────────

export const mediaItems = pgTable("mediaItems", {
  id: serial("id").primaryKey(),
  url: varchar("url", { length: 1000 }).notNull(),
  filename: varchar("filename", { length: 255 }),
  mimeType: varchar("mimeType", { length: 100 }),
  sizeBytes: integer("sizeBytes"),
  alt: varchar("alt", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type MediaItem = typeof mediaItems.$inferSelect;
export type InsertMediaItem = typeof mediaItems.$inferInsert;

// ─── Discounts ────────────────────────────────────────────────────────────────

export const discountTypeEnum = pgEnum("discount_type", ["percentage", "fixed"]);

export const discounts = pgTable("discounts", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 100 }).notNull().unique(),
  type: discountTypeEnum("type").notNull().default("percentage"),
  value: decimal("value", { precision: 10, scale: 2 }).notNull(),
  minOrderAmount: decimal("minOrderAmount", { precision: 10, scale: 2 }),
  maxUses: integer("maxUses"),
  usedCount: integer("usedCount").default(0),
  isActive: boolean("isActive").default(true),
  expiresAt: timestamp("expiresAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Discount = typeof discounts.$inferSelect;
export type InsertDiscount = typeof discounts.$inferInsert;

// ─── Webhooks ─────────────────────────────────────────────────────────────────

export const webhookEventEnum = pgEnum("webhook_event", [
  "order.created",
  "order.updated",
  "order.shipped",
  "order.delivered",
  "order.cancelled",
  "product.created",
  "product.updated",
  "product.deleted",
  "user.registered",
]);

export const webhooks = pgTable("webhooks", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  url: varchar("url", { length: 1000 }).notNull(),
  event: webhookEventEnum("event").notNull(),
  secret: varchar("secret", { length: 255 }),
  isActive: boolean("isActive").default(true),
  lastTriggeredAt: timestamp("lastTriggeredAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Webhook = typeof webhooks.$inferSelect;
export type InsertWebhook = typeof webhooks.$inferInsert;

// ─── CMS Pages ────────────────────────────────────────────────────────────────

export const cmsPages = pgTable("cmsPages", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 200 }).notNull().unique(),
  titleTR: varchar("titleTR", { length: 255 }).notNull(),
  titleEN: varchar("titleEN", { length: 255 }).notNull(),
  titleAR: varchar("titleAR", { length: 255 }).notNull(),
  contentTR: text("contentTR"),
  contentEN: text("contentEN"),
  contentAR: text("contentAR"),
  isPublished: boolean("isPublished").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type CmsPage = typeof cmsPages.$inferSelect;
export type InsertCmsPage = typeof cmsPages.$inferInsert;

// ─── Returns ──────────────────────────────────────────────────────────────────

export const returnStatusEnum = pgEnum("return_status", [
  "requested",
  "accepted",
  "rejected",
  "processed",
]);

export const returns = pgTable("returns", {
  id: serial("id").primaryKey(),
  returnNumber: varchar("returnNumber", { length: 50 }).notNull().unique(),
  orderNumber: varchar("orderNumber", { length: 50 }).notNull(),
  userId: integer("userId"),
  customerEmail: varchar("customerEmail", { length: 320 }),
  customerName: varchar("customerName", { length: 255 }),
  reason: varchar("reason", { length: 100 }).notNull(),
  notes: text("notes"),
  status: returnStatusEnum("status").default("requested").notNull(),
  refundAmount: decimal("refundAmount", { precision: 12, scale: 2 }),
  kdvRefundAmount: decimal("kdvRefundAmount", { precision: 12, scale: 2 }),
  parasutCreditNoteId: varchar("parasutCreditNoteId", { length: 100 }),
  adminNote: text("adminNote"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Return = typeof returns.$inferSelect;
export type InsertReturn = typeof returns.$inferInsert;

export const returnItems = pgTable("returnItems", {
  id: serial("id").primaryKey(),
  returnId: integer("returnId").notNull(),
  productId: integer("productId"),
  productName: varchar("productName", { length: 255 }).notNull(),
  quantity: integer("quantity").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }),
  imageUrl: varchar("imageUrl", { length: 500 }),
});

export type ReturnItem = typeof returnItems.$inferSelect;
export type InsertReturnItem = typeof returnItems.$inferInsert;

// ─── Email Templates ──────────────────────────────────────────────────────────

export const emailTemplates = pgTable("emailTemplates", {
  id: serial("id").primaryKey(),
  key: varchar("key", { length: 100 }).notNull().unique(),
  subject: varchar("subject", { length: 500 }),
  body: text("body"),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type EmailTemplate = typeof emailTemplates.$inferSelect;
export type InsertEmailTemplate = typeof emailTemplates.$inferInsert;

// ─── Expenses ──────────────────────────────────────────────────────────────────

export const expenseCategoryEnum = pgEnum("expense_category", [
  "shipping",
  "advertising",
  "material",
  "salary",
  "rent",
  "tax",
  "commission",
  "packaging",
  "software",
  "other",
]);

export const expenses = pgTable("expenses", {
  id: serial("id").primaryKey(),
  category: expenseCategoryEnum("category").notNull(),
  description: varchar("description", { length: 500 }).notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  date: timestamp("date").notNull(),
  isRecurring: boolean("isRecurring").default(false),
  notes: text("notes"),
  kdvRate: decimal("kdvRate", { precision: 5, scale: 2 }).default("20.00"),
  kdvAmount: decimal("kdvAmount", { precision: 12, scale: 2 }),
  netAmount: decimal("netAmount", { precision: 12, scale: 2 }),
  invoiceNumber: varchar("invoiceNumber", { length: 100 }),
  invoiceDate: timestamp("invoiceDate"),
  supplier: varchar("supplier", { length: 255 }),
  isKdvDeductible: boolean("isKdvDeductible").default(true),
  parasutExpenseId: varchar("parasutExpenseId", { length: 100 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Expense = typeof expenses.$inferSelect;
export type InsertExpense = typeof expenses.$inferInsert;

// ─── Product Verifications (Doğrulama) ────────────────────────────────────────

export const verificationStatusEnum = pgEnum("verification_status", [
  "unowned",
  "registered",
  "transferring",
]);

export const productVerifications = pgTable("productVerifications", {
  id: serial("id").primaryKey(),
  serialNumber: varchar("serialNumber", { length: 50 }).notNull().unique(),
  productId: integer("productId"),
  productNameTR: varchar("productNameTR", { length: 255 }),
  productNameEN: varchar("productNameEN", { length: 255 }),
  productNameAR: varchar("productNameAR", { length: 255 }),
  collection: varchar("collection", { length: 100 }),
  collectionYear: varchar("collectionYear", { length: 20 }),
  batchNumber: varchar("batchNumber", { length: 100 }),
  productionDate: varchar("productionDate", { length: 100 }),
  material: varchar("material", { length: 255 }),
  imageUrl: varchar("imageUrl", { length: 500 }),
  orderNumber: varchar("orderNumber", { length: 50 }),
  orderItemId: integer("orderItemId"),
  status: verificationStatusEnum("status").default("unowned").notNull(),
  ownerUserId: integer("ownerUserId"),
  ownerName: varchar("ownerName", { length: 255 }),
  ownerEmail: varchar("ownerEmail", { length: 320 }),
  registeredAt: timestamp("registeredAt"),
  transferToName: varchar("transferToName", { length: 255 }),
  transferToEmail: varchar("transferToEmail", { length: 320 }),
  transferNote: text("transferNote"),
  transferInitiatedAt: timestamp("transferInitiatedAt"),
  scanCount: integer("scanCount").default(0).notNull(),
  firstScannedAt: timestamp("firstScannedAt"),
  lastScannedAt: timestamp("lastScannedAt"),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type ProductVerification = typeof productVerifications.$inferSelect;
export type InsertProductVerification = typeof productVerifications.$inferInsert;

// ─── Store Settings ────────────────────────────────────────────────────────────

export const storeSettings = pgTable("storeSettings", {
  id: serial("id").primaryKey(),
  storeName: varchar("storeName", { length: 255 }).default("VOILÉE"),
  storeEmail: varchar("storeEmail", { length: 320 }),
  storePhone: varchar("storePhone", { length: 32 }),
  storeAddress: text("storeAddress"),
  faviconUrl: varchar("faviconUrl", { length: 500 }),
  logoUrl: varchar("logoUrl", { length: 500 }),
  instagramUrl: varchar("instagramUrl", { length: 500 }),
  facebookUrl: varchar("facebookUrl", { length: 500 }),
  twitterUrl: varchar("twitterUrl", { length: 500 }),
  youtubeUrl: varchar("youtubeUrl", { length: 500 }),
  tiktokUrl: varchar("tiktokUrl", { length: 500 }),
  pinterestUrl: varchar("pinterestUrl", { length: 500 }),
  linkedinUrl: varchar("linkedinUrl", { length: 500 }),
  snapchatUrl: varchar("snapchatUrl", { length: 500 }),
  whatsappUrl: varchar("whatsappUrl", { length: 500 }),
  telegramUrl: varchar("telegramUrl", { length: 500 }),
  freeShippingThreshold: decimal("freeShippingThreshold", { precision: 10, scale: 2 }).default("500"),
  shippingCostDomestic: decimal("shippingCostDomestic", { precision: 10, scale: 2 }).default("49.99"),
  shippingCostInternational: decimal("shippingCostInternational", { precision: 10, scale: 2 }).default("199.99"),
  smtpHost: varchar("smtpHost", { length: 255 }),
  smtpPort: varchar("smtpPort", { length: 10 }),
  smtpSecure: boolean("smtpSecure").default(false),
  smtpUser: varchar("smtpUser", { length: 320 }),
  smtpPass: varchar("smtpPass", { length: 500 }),
  smtpFrom: varchar("smtpFrom", { length: 320 }),
  taxNumber: varchar("taxNumber", { length: 20 }),
  taxOffice: varchar("taxOffice", { length: 100 }),
  companyType: varchar("companyType", { length: 50 }),
  mersis: varchar("mersis", { length: 20 }),
  parasutClientId: varchar("parasutClientId", { length: 255 }),
  parasutClientSecret: varchar("parasutClientSecret", { length: 500 }),
  parasutCompanyId: varchar("parasutCompanyId", { length: 100 }),
  parasutEnabled: boolean("parasutEnabled").default(false),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type StoreSettings = typeof storeSettings.$inferSelect;
export type InsertStoreSettings = typeof storeSettings.$inferInsert;

// ─── Password Reset Tokens ────────────────────────────────────────────────────

export const passwordResetTokens = pgTable("passwordResetTokens", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  token: varchar("token", { length: 255 }).notNull().unique(),
  expiresAt: timestamp("expiresAt").notNull(),
  usedAt: timestamp("usedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;
export type InsertPasswordResetToken = typeof passwordResetTokens.$inferInsert;
