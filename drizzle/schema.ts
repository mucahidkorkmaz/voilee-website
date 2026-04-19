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

// ─── Store Settings ────────────────────────────────────────────────────────────

export const storeSettings = pgTable("storeSettings", {
  id: serial("id").primaryKey(),
  storeName: varchar("storeName", { length: 255 }).default("VOILÉE"),
  storeEmail: varchar("storeEmail", { length: 320 }),
  storePhone: varchar("storePhone", { length: 32 }),
  storeAddress: text("storeAddress"),
  instagramUrl: varchar("instagramUrl", { length: 500 }),
  facebookUrl: varchar("facebookUrl", { length: 500 }),
  twitterUrl: varchar("twitterUrl", { length: 500 }),
  freeShippingThreshold: decimal("freeShippingThreshold", { precision: 10, scale: 2 }).default("500"),
  shippingCostDomestic: decimal("shippingCostDomestic", { precision: 10, scale: 2 }).default("49.99"),
  shippingCostInternational: decimal("shippingCostInternational", { precision: 10, scale: 2 }).default("199.99"),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type StoreSettings = typeof storeSettings.$inferSelect;
export type InsertStoreSettings = typeof storeSettings.$inferInsert;
