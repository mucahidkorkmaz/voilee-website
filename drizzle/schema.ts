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
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: roleEnum("role").default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

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
  collection: varchar("collection", { length: 100 }).notNull(),
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
