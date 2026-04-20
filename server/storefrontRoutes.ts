import type { Express, Request, Response } from "express";
import { eq, desc, and } from "drizzle-orm";
import { getDb } from "./db";
import { getStoreSettings } from "./db";
import { products, collections, silhouettes, categories, orders, orderItems } from "../drizzle/schema";

const STOREFRONT_API_KEY = process.env.VITE_STOREFRONT_API_KEY ?? "";

function authenticateApiKey(req: Request, res: Response): boolean {
  if (!STOREFRONT_API_KEY) return true;
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer ")) {
    res.status(401).json({ error: "Missing API key" });
    return false;
  }
  if (auth.slice(7) !== STOREFRONT_API_KEY) {
    res.status(403).json({ error: "Invalid API key" });
    return false;
  }
  return true;
}

export function registerStorefrontRoutes(app: Express) {
  // ─── Products ────────────────────────────────────────────────────────────────
  app.get("/api/v1/products", async (req: Request, res: Response) => {
    if (!authenticateApiKey(req, res)) return;
    try {
      const db = await getDb();
      if (!db) return res.status(503).json({ error: "Database not available" });

      const limit = Math.min(parseInt(req.query.limit as string) || 100, 500);
      const offset = parseInt(req.query.offset as string) || 0;
      const silhouetteId = req.query.silhouetteId as string | undefined;
      const categoryId = req.query.categoryId as string | undefined;

      const conditions = [eq(products.isActive, true)];
      if (silhouetteId) {
        conditions.push(eq(products.silhouetteId, parseInt(silhouetteId)));
      }
      if (categoryId) {
        conditions.push(eq(products.categoryId, parseInt(categoryId)));
      }

      const rows = await db
        .select()
        .from(products)
        .where(and(...conditions))
        .orderBy(desc(products.createdAt))
        .limit(limit)
        .offset(offset);

      const mapped = rows.map(p => ({
        id: p.id,
        name: p.nameTR,
        slug: String(p.id),
        description: p.descriptionTR,
        price: p.price,
        compareAtPrice: null,
        imageUrls: p.imageUrl ? [p.imageUrl] : [],
        categoryId: p.categoryId,
        silhouetteId: p.silhouetteId,
        isActive: p.isActive,
        metadata: { collection: p.collection, stock: p.stock },
      }));

      return res.json({ data: mapped });
    } catch (error) {
      console.error("[Storefront] Products error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/v1/products/:slug", async (req: Request, res: Response) => {
    if (!authenticateApiKey(req, res)) return;
    try {
      const db = await getDb();
      if (!db) return res.status(503).json({ error: "Database not available" });

      const slug = req.params.slug;
      const id = parseInt(slug);
      const condition = isNaN(id)
        ? eq(products.nameTR, slug)
        : eq(products.id, id);

      const [product] = await db.select().from(products).where(condition).limit(1);

      if (!product) return res.status(404).json({ error: "Product not found" });

      return res.json({
        data: {
          id: product.id,
          name: product.nameTR,
          slug: String(product.id),
          description: product.descriptionTR,
          price: product.price,
          compareAtPrice: null,
          imageUrls: product.imageUrl ? [product.imageUrl] : [],
          categoryId: product.categoryId,
          silhouetteId: product.silhouetteId,
          isActive: product.isActive,
          metadata: { collection: product.collection, stock: product.stock },
        },
      });
    } catch (error) {
      console.error("[Storefront] Product detail error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // ─── Silhouettes ────────────────────────────────────────────────────────────
  app.get("/api/v1/silhouettes", async (req: Request, res: Response) => {
    if (!authenticateApiKey(req, res)) return;
    try {
      const db = await getDb();
      if (!db) return res.status(503).json({ error: "Database not available" });

      const rows = await db
        .select()
        .from(silhouettes)
        .where(eq(silhouettes.isActive, true))
        .orderBy(silhouettes.sortOrder, silhouettes.createdAt);

      const mapped = rows.map(s => ({
        id: s.id,
        name: s.nameTR,
        slug: s.slug,
        imageUrl: s.imageUrl,
        sortOrder: s.sortOrder,
      }));

      return res.json({ data: mapped });
    } catch (error) {
      console.error("[Storefront] Silhouettes error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // ─── Collections ─────────────────────────────────────────────────────────────
  app.get("/api/v1/collections", async (req: Request, res: Response) => {
    if (!authenticateApiKey(req, res)) return;
    try {
      const db = await getDb();
      if (!db) return res.status(503).json({ error: "Database not available" });

      const rows = await db
        .select()
        .from(collections)
        .where(eq(collections.isActive, true))
        .orderBy(collections.sortOrder, collections.createdAt);

      const mapped = rows.map(c => ({
        id: c.id,
        name: c.nameTR,
        slug: c.slug,
        description: c.descriptionTR,
        imageUrl: c.imageUrl,
        sortOrder: c.sortOrder,
      }));

      return res.json({ data: mapped });
    } catch (error) {
      console.error("[Storefront] Collections error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // ─── Categories ──────────────────────────────────────────────────────────────
  app.get("/api/v1/categories", async (req: Request, res: Response) => {
    if (!authenticateApiKey(req, res)) return;
    try {
      const db = await getDb();
      if (!db) return res.status(503).json({ error: "Database not available" });

      const silhouetteId = req.query.silhouetteId as string | undefined;
      const conditions = [eq(categories.isActive, true)];
      if (silhouetteId) {
        conditions.push(eq(categories.silhouetteId, parseInt(silhouetteId)));
      }

      const rows = await db
        .select()
        .from(categories)
        .where(and(...conditions))
        .orderBy(categories.sortOrder, categories.createdAt);

      const mapped = rows.map(c => ({
        id: c.id,
        name: c.nameTR,
        silhouetteId: c.silhouetteId,
        imageUrl: c.imageUrl,
        sortOrder: c.sortOrder,
      }));

      return res.json({ data: mapped });
    } catch (error) {
      console.error("[Storefront] Categories error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // ─── Orders ──────────────────────────────────────────────────────────────────
  app.post("/api/v1/orders", async (req: Request, res: Response) => {
    if (!authenticateApiKey(req, res)) return;
    try {
      const db = await getDb();
      if (!db) return res.status(503).json({ error: "Database not available" });

      const { items, customerEmail, customerName, shippingAddress, shippingCountry } = req.body ?? {};

      if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: "Order must have at least one item" });
      }

      const orderNumber = `VO-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
      const totalPrice = items.reduce(
        (sum: number, item: { price: string; quantity: number }) =>
          sum + parseFloat(item.price || "0") * (item.quantity || 1),
        0
      );

      const [order] = await db
        .insert(orders)
        .values({
          userId: 0,
          orderNumber,
          totalPrice: totalPrice.toFixed(2),
          shippingAddress: shippingAddress ?? null,
          shippingCountry: shippingCountry ?? null,
        })
        .returning();

      for (const item of items) {
        await db.insert(orderItems).values({
          orderId: order.id,
          productId: item.productId ?? 0,
          quantity: item.quantity || 1,
          price: item.price || "0",
        });
      }

      return res.status(201).json({
        data: {
          id: order.id,
          orderNumber: order.orderNumber,
          status: order.status,
          totalPrice: order.totalPrice,
        },
      });
    } catch (error) {
      console.error("[Storefront] Create order error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/v1/orders/:orderNumber", async (req: Request, res: Response) => {
    if (!authenticateApiKey(req, res)) return;
    try {
      const db = await getDb();
      if (!db) return res.status(503).json({ error: "Database not available" });

      const [order] = await db
        .select()
        .from(orders)
        .where(eq(orders.orderNumber, req.params.orderNumber))
        .limit(1);

      if (!order) return res.status(404).json({ error: "Order not found" });

      const items = await db
        .select({
          productId: orderItems.productId,
          productName: products.nameTR,
          quantity: orderItems.quantity,
          price: orderItems.price,
        })
        .from(orderItems)
        .leftJoin(products, eq(orderItems.productId, products.id))
        .where(eq(orderItems.orderId, order.id));

      return res.json({
        data: {
          id: order.id,
          orderNumber: order.orderNumber,
          status: order.status,
          totalPrice: order.totalPrice,
          items: items.map(i => ({
            productId: i.productId,
            productName: i.productName ?? "Unknown",
            quantity: i.quantity,
            price: i.price,
          })),
        },
      });
    } catch (error) {
      console.error("[Storefront] Order detail error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // ─── Public Store Settings (social links, contact info) ──────────────────────
  app.get("/api/v1/store-settings", async (_req: Request, res: Response) => {
    try {
      const settings = await getStoreSettings();
      if (!settings) return res.json({});
      return res.json({
        storeName: settings.storeName,
        storeEmail: settings.storeEmail,
        storePhone: settings.storePhone,
        faviconUrl: settings.faviconUrl,
        instagramUrl: settings.instagramUrl,
        facebookUrl: settings.facebookUrl,
        twitterUrl: settings.twitterUrl,
        youtubeUrl: settings.youtubeUrl,
        tiktokUrl: settings.tiktokUrl,
        pinterestUrl: settings.pinterestUrl,
        linkedinUrl: settings.linkedinUrl,
        snapchatUrl: settings.snapchatUrl,
        whatsappUrl: settings.whatsappUrl,
        telegramUrl: settings.telegramUrl,
      });
    } catch (error) {
      console.error("[Storefront] Store settings error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });
}
