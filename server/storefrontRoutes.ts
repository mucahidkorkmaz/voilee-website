import type { Express, Request, Response } from "express";
import { eq, desc, and, asc } from "drizzle-orm";
import { getDb } from "./db";
import { getStoreSettings } from "./db";
import { getCombinationBySlugPublished, getCombinationStock } from "./db/combinations";
import {
  products,
  collections,
  silhouettes,
  categories,
  orders,
  orderItems,
  combinations,
  combinationItems,
  productVariants,
} from "../drizzle/schema";
import { ayrıstırKdv } from "./finance";
import { ENV } from "./_core/env";
import {
  sendOrderCreated,
  sendOrderCreatedStorePickup,
  sendOrderCreatedWireTransfer,
} from "./_core/email";

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

      const variants = await db
        .select()
        .from(productVariants)
        .where(and(eq(productVariants.productId, product.id), eq(productVariants.isActive, true)))
        .orderBy(asc(productVariants.sortOrder), asc(productVariants.id));

      const effectiveStock =
        variants.length > 0
          ? variants.reduce((sum, v) => sum + (v.stock ?? 0), 0)
          : (product.stock ?? 0);

      const lang = typeof req.query.lang === "string" ? req.query.lang.toUpperCase() : "TR";
      const variantName = (v: (typeof variants)[number]) =>
        lang === "EN" ? v.nameEN : lang === "AR" ? v.nameAR : v.nameTR;

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
          variants: variants.map(v => ({
            id: v.id,
            name: variantName(v),
            nameTR: v.nameTR,
            nameEN: v.nameEN,
            nameAR: v.nameAR,
            sku: v.sku,
            price: v.price,
            stock: v.stock,
            imageUrl: v.imageUrl,
            colorHex: v.colorHex,
          })),
          hasVariants: variants.length > 0,
          effectiveStock,
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
        nameTR: s.nameTR,
        nameEN: s.nameEN,
        nameAR: s.nameAR,
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
        nameTR: c.nameTR,
        nameEN: c.nameEN,
        nameAR: c.nameAR,
        slug: c.slug,
        descriptionTR: c.descriptionTR,
        descriptionEN: c.descriptionEN,
        descriptionAR: c.descriptionAR,
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

  // ─── Combinations (public) ───────────────────────────────────────────────────
  app.get("/api/v1/combinations", async (req: Request, res: Response) => {
    if (!authenticateApiKey(req, res)) return;
    try {
      const db = await getDb();
      if (!db) return res.status(503).json({ error: "Database not available" });

      const silhouetteId = req.query.silhouetteId as string | undefined;
      const conditions = [eq(combinations.status, "published"), eq(combinations.isActive, true)];
      if (silhouetteId) {
        conditions.push(eq(combinations.silhouetteId, parseInt(silhouetteId, 10)));
      }

      const rows = await db
        .select()
        .from(combinations)
        .where(and(...conditions))
        .orderBy(combinations.sortOrder, combinations.createdAt);

      const mapped = await Promise.all(
        rows.map(async c => {
          const items = await db
            .select({
              productId: combinationItems.productId,
              categoryId: combinationItems.categoryId,
              variantId: combinationItems.variantId,
              productName: products.nameTR,
              productPrice: products.price,
              productImage: products.imageUrl,
              categoryName: categories.nameTR,
              variantName: productVariants.nameTR,
              variantPrice: productVariants.price,
              variantImage: productVariants.imageUrl,
              variantColorHex: productVariants.colorHex,
            })
            .from(combinationItems)
            .leftJoin(products, eq(combinationItems.productId, products.id))
            .leftJoin(categories, eq(combinationItems.categoryId, categories.id))
            .leftJoin(productVariants, eq(combinationItems.variantId, productVariants.id))
            .where(eq(combinationItems.combinationId, c.id));

          let galleryUrls: string[] = [];
          if (c.galleryUrls) {
            try {
              const parsed = JSON.parse(c.galleryUrls) as unknown;
              if (Array.isArray(parsed)) {
                galleryUrls = parsed.filter((x): x is string => typeof x === "string");
              }
            } catch {
              galleryUrls = [];
            }
          }

          const stock = await getCombinationStock(c.id);

          return {
            id: c.id,
            silhouetteId: c.silhouetteId,
            slug: c.slug,
            name: c.nameTR,
            nameTR: c.nameTR,
            nameEN: c.nameEN,
            nameAR: c.nameAR,
            description: c.descriptionTR,
            descriptionEN: c.descriptionEN,
            descriptionAR: c.descriptionAR,
            price: c.price,
            imageUrl: c.imageUrl,
            galleryUrls,
            stock,
            inStock: stock > 0,
            items,
          };
        }),
      );

      return res.json({ data: mapped });
    } catch (error) {
      console.error("[Storefront] Combinations error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/v1/combinations/:slug", async (req: Request, res: Response) => {
    if (!authenticateApiKey(req, res)) return;
    try {
      const db = await getDb();
      if (!db) return res.status(503).json({ error: "Database not available" });

      const combo = await getCombinationBySlugPublished(req.params.slug);
      if (!combo) return res.status(404).json({ error: "Combination not found" });

      let galleryUrls: string[] = [];
      if (combo.galleryUrls) {
        try {
          const parsed = JSON.parse(combo.galleryUrls) as unknown;
          if (Array.isArray(parsed)) {
            galleryUrls = parsed.filter((x): x is string => typeof x === "string");
          }
        } catch {
          galleryUrls = [];
        }
      }

      const lang = typeof req.query.lang === "string" ? req.query.lang.toUpperCase() : "TR";
      const name =
        lang === "EN" ? combo.nameEN : lang === "AR" ? combo.nameAR : combo.nameTR;
      const description =
        lang === "EN" ? combo.descriptionEN : lang === "AR" ? combo.descriptionAR : combo.descriptionTR;

      const stock = typeof combo.stock === "number" ? combo.stock : await getCombinationStock(combo.id);

      return res.json({
        data: {
          kind: "combination" as const,
          id: combo.id,
          slug: combo.slug,
          silhouetteId: combo.silhouetteId,
          name,
          nameTR: combo.nameTR,
          nameEN: combo.nameEN,
          nameAR: combo.nameAR,
          description,
          price: combo.price,
          imageUrl: combo.imageUrl,
          galleryUrls,
          stock,
          inStock: stock > 0,
          items: combo.items,
        },
      });
    } catch (error) {
      console.error("[Storefront] Combination detail error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // ─── Orders ──────────────────────────────────────────────────────────────────
  app.post("/api/v1/orders", async (req: Request, res: Response) => {
    if (!authenticateApiKey(req, res)) return;
    try {
      const db = await getDb();
      if (!db) return res.status(503).json({ error: "Database not available" });

      const body = req.body ?? {};
      const {
        items,
        customerEmail,
        customerName,
        customerPhone,
        shippingAddress,
        shippingCity,
        shippingCountry,
        paymentMethod: rawPaymentMethod,
        deliveryMethod: rawDeliveryMethod,
        notes,
      } = body as Record<string, unknown>;

      if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: "Order must have at least one item" });
      }

      const orderNumber = `VO-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
      const totalPriceNumber = items.reduce(
        (sum: number, item: { price: string; quantity: number }) =>
          sum + parseFloat(item.price || "0") * (item.quantity || 1),
        0
      );

      const { kdvHaric: subtotalNum, kdv: kdvAmountNum } = ayrıstırKdv(totalPriceNumber, 20);

      const paymentMethod = rawPaymentMethod === "bank" ? "bank" : "card";
      const deliveryMethod = rawDeliveryMethod === "store_pickup" ? "store_pickup" : "shipping";

      const emailStr = typeof customerEmail === "string" ? customerEmail.trim() : "";
      const nameStr = typeof customerName === "string" ? customerName.trim() : "";
      const phoneStr = typeof customerPhone === "string" ? customerPhone.trim() : "";
      const notesStr = typeof notes === "string" ? notes.trim() : "";

      const [order] = await db
        .insert(orders)
        .values({
          userId: null,
          orderNumber,
          totalPrice: totalPriceNumber.toFixed(2),
          subtotal: subtotalNum.toFixed(2),
          kdvAmount: kdvAmountNum.toFixed(2),
          kdvRate: "20.00",
          shippingAddress: typeof shippingAddress === "string" ? shippingAddress : null,
          shippingCountry: typeof shippingCountry === "string" ? shippingCountry : null,
          shippingCity: typeof shippingCity === "string" ? shippingCity : null,
          customerEmail: emailStr || null,
          customerName: nameStr || null,
          customerPhone: phoneStr || null,
          orderNotes: notesStr || null,
          paymentMethod,
          deliveryMethod,
        })
        .returning();

      for (const item of items) {
        const it = item as Record<string, unknown>;
        const quantity =
          typeof it.quantity === "number" ? it.quantity : parseInt(String(it.quantity ?? 1), 10) || 1;
        const price = typeof it.price === "string" ? it.price : String(it.price ?? "0");

        let productId = 0;
        if (typeof it.productId === "number") productId = it.productId;
        else if (it.productId != null && it.productId !== "") {
          productId = parseInt(String(it.productId), 10) || 0;
        }

        let combinationId: number | null = null;
        if (typeof it.combinationId === "number") combinationId = it.combinationId;
        else if (it.combinationId != null && it.combinationId !== "") {
          const n = parseInt(String(it.combinationId), 10);
          combinationId = Number.isNaN(n) ? null : n;
        }

        if (combinationId != null && productId === 0) {
          const [row] = await db
            .select({ productId: combinationItems.productId })
            .from(combinationItems)
            .where(eq(combinationItems.combinationId, combinationId))
            .orderBy(asc(combinationItems.categoryId))
            .limit(1);
          productId = row?.productId ?? 0;
        }

        await db.insert(orderItems).values({
          orderId: order.id,
          productId,
          combinationId: combinationId ?? null,
          quantity,
          price,
        });
      }

      if (emailStr) {
        try {
          const settings = await getStoreSettings();
          const siteName = settings?.storeName ?? "";
          const baseUrl = ENV.corsOrigin?.split(",")[0]?.trim() ?? "";
          const orderUrl = baseUrl
            ? `${baseUrl.replace(/\/$/, "")}/tr/account/orders/${encodeURIComponent(order.orderNumber)}`
            : "";
          const orderDate = new Date(order.createdAt).toLocaleDateString("tr-TR");
          const orderTotal = `₺${Number(order.totalPrice).toFixed(2)}`;
          const displayName = nameStr || emailStr;
          const bankName = (settings?.bankName ?? "").trim() || "—";
          const iban = (settings?.iban ?? "").trim() || "—";
          const accountHolder = (settings?.accountHolder ?? "").trim() || "—";
          const storeAddress = (settings?.storeAddress ?? "").trim() || "—";

          if (deliveryMethod === "store_pickup") {
            await sendOrderCreatedStorePickup({
              to: emailStr,
              customerName: displayName,
              customerEmail: emailStr,
              orderNumber: order.orderNumber,
              orderTotal,
              orderDate,
              orderUrl,
              siteName,
              storeAddress,
            });
          } else if (paymentMethod === "bank") {
            await sendOrderCreatedWireTransfer({
              to: emailStr,
              customerName: displayName,
              customerEmail: emailStr,
              orderNumber: order.orderNumber,
              orderTotal,
              orderDate,
              orderUrl,
              siteName,
              bankName,
              iban,
              accountHolder,
            });
          } else {
            await sendOrderCreated({
              to: emailStr,
              customerName: displayName,
              orderNumber: order.orderNumber,
              orderDate,
              orderTotal,
              orderUrl,
              siteName,
            });
          }
        } catch (emailErr) {
          console.error("[Storefront] Order confirmation email failed:", emailErr);
        }
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
        siteLogoUrl: settings.siteLogoUrl,
        logoUrl: settings.siteLogoUrl,
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
