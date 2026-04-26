/**
 * Paraşüt API Entegrasyonu
 * Dokümantasyon: https://apidocs.parasut.com/
 *
 * Kullanım:
 * 1. Admin panelinden Paraşüt bilgileri girilir (Settings > Entegrasyonlar)
 * 2. Sipariş teslim edildiğinde otomatik e-arşiv fatura oluşturulur
 * 3. İade onaylandığında otomatik iade faturası oluşturulur
 */

const PARASUT_API = "https://api.parasut.com/v4";

interface ParasutTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

let _tokens: ParasutTokens | null = null;

export async function getParasutToken(settings: {
  clientId: string;
  clientSecret: string;
  companyId: string;
}): Promise<string | null> {
  if (_tokens && _tokens.expiresAt > Date.now() + 60_000) {
    return _tokens.accessToken;
  }

  try {
    const res = await fetch("https://api.parasut.com/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        grant_type: "client_credentials",
        client_id: settings.clientId,
        client_secret: settings.clientSecret,
      }),
    });

    if (!res.ok) {
      console.error("[Paraşüt] Token alınamadı:", await res.text());
      return null;
    }

    const data = (await res.json()) as {
      access_token: string;
      refresh_token: string;
      expires_in: number;
    };

    _tokens = {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: Date.now() + data.expires_in * 1000,
    };

    return _tokens.accessToken;
  } catch (err) {
    console.error("[Paraşüt] Token hatası:", err);
    return null;
  }
}

export interface ParasutInvoicePayload {
  companyId: string;
  token: string;
  order: {
    orderNumber: string;
    billingName: string;
    billingAddress: string;
    billingCity: string;
    taxNumber?: string;
    invoiceDate: string;
    currency: string;
    items: {
      description: string;
      quantity: number;
      unitPrice: number;
      kdvRate: number;
    }[];
    shippingCost?: number;
  };
}

export async function createParasutSalesInvoice(
  payload: ParasutInvoicePayload,
): Promise<{ invoiceId: string; invoiceNumber: string } | null> {
  try {
    const lineItems = payload.order.items.map(item => ({
      type: "sales_invoice_details",
      attributes: {
        quantity: item.quantity,
        unit_price: item.unitPrice.toFixed(2),
        vat_rate: item.kdvRate,
        description: item.description,
      },
    }));

    if (payload.order.shippingCost && payload.order.shippingCost > 0) {
      lineItems.push({
        type: "sales_invoice_details",
        attributes: {
          quantity: 1,
          unit_price: (payload.order.shippingCost / 1.2).toFixed(2),
          vat_rate: 20,
          description: "Kargo Ücreti",
        },
      });
    }

    const body = {
      data: {
        type: "sales_invoices",
        attributes: {
          item_type: "invoice",
          description: `Sipariş #${payload.order.orderNumber}`,
          issue_date: payload.order.invoiceDate,
          due_date: payload.order.invoiceDate,
          currency: payload.order.currency,
          billing_address: payload.order.billingAddress,
          billing_city: payload.order.billingCity,
          billing_country: "Türkiye",
          tax_id: payload.order.taxNumber ?? "",
        },
        relationships: {
          details: { data: lineItems },
        },
      },
    };

    const res = await fetch(`${PARASUT_API}/${payload.companyId}/sales_invoices`, {
      method: "POST",
      headers: {
        "Content-Type": "application/vnd.api+json",
        Authorization: `Bearer ${payload.token}`,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("[Paraşüt] Fatura oluşturulamadı:", err);
      return null;
    }

    const data = (await res.json()) as {
      data: { id: string; attributes: { net_total: string } };
    };

    return {
      invoiceId: data.data.id,
      invoiceNumber: `PARASUT-${data.data.id}`,
    };
  } catch (err) {
    console.error("[Paraşüt] createSalesInvoice hatası:", err);
    return null;
  }
}

export async function createParasutCreditNote(
  companyId: string,
  token: string,
  originalInvoiceId: string,
  refundAmount: number,
  kdvRate: number,
): Promise<{ creditNoteId: string } | null> {
  try {
    const res = await fetch(`${PARASUT_API}/${companyId}/sales_invoices`, {
      method: "POST",
      headers: {
        "Content-Type": "application/vnd.api+json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        data: {
          type: "sales_invoices",
          attributes: {
            item_type: "refund",
            invoice_id: originalInvoiceId,
          },
          relationships: {
            details: {
              data: [
                {
                  type: "sales_invoice_details",
                  attributes: {
                    quantity: 1,
                    unit_price: (refundAmount / (1 + kdvRate / 100)).toFixed(2),
                    vat_rate: kdvRate,
                    description: "İade",
                  },
                },
              ],
            },
          },
        },
      }),
    });

    if (!res.ok) {
      console.error("[Paraşüt] İade faturası oluşturulamadı:", await res.text());
      return null;
    }

    const data = (await res.json()) as { data: { id: string } };
    return { creditNoteId: data.data.id };
  } catch (err) {
    console.error("[Paraşüt] createCreditNote hatası:", err);
    return null;
  }
}

export async function handleOrderDeliveredForInvoice(orderId: number): Promise<void> {
  const { getDb } = await import("../db/client");
  const { getStoreSettings } = await import("../db/settings");
  const { getOrderWithItems } = await import("../db/orders");

  const settings = await getStoreSettings();

  if (
    !settings?.parasutEnabled ||
    !settings.parasutClientId ||
    !settings.parasutClientSecret ||
    !settings.parasutCompanyId
  ) {
    return;
  }

  const order = await getOrderWithItems(orderId);
  if (!order || order.invoiceStatus === "issued") return;

  const token = await getParasutToken({
    clientId: settings.parasutClientId,
    clientSecret: settings.parasutClientSecret,
    companyId: settings.parasutCompanyId,
  });

  if (!token) return;

  const result = await createParasutSalesInvoice({
    companyId: settings.parasutCompanyId,
    token,
    order: {
      orderNumber: order.orderNumber,
      billingName: order.billingName ?? order.shippingAddress ?? "Müşteri",
      billingAddress: order.billingAddress ?? order.shippingAddress ?? "",
      billingCity: order.billingCity ?? order.shippingCountry ?? "İstanbul",
      taxNumber: order.taxNumber ?? undefined,
      invoiceDate: new Date().toISOString().split("T")[0],
      currency: order.currency ?? "TRY",
      items: order.items.map(item => ({
        description: `Ürün #${item.productId}`,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice ?? Number(item.price) / 1.2),
        kdvRate: Number(item.kdvRate ?? 20),
      })),
      shippingCost: Number(order.shippingCost ?? 0),
    },
  });

  if (result) {
    const db = await getDb();
    if (!db) return;
    const { orders } = await import("../../drizzle/schema");
    const { eq } = await import("drizzle-orm");
    await db
      .update(orders)
      .set({
        invoiceStatus: "issued",
        invoiceNumber: result.invoiceNumber,
        parasutInvoiceId: result.invoiceId,
        invoiceIssuedAt: new Date(),
      })
      .where(eq(orders.id, orderId));

    console.log(`[Paraşüt] ✓ Fatura oluşturuldu: ${result.invoiceNumber} → Sipariş #${order.orderNumber}`);

    try {
      const { ENV } = await import("../_core/env");
      const { sendOrderInvoice } = await import("../_core/email");
      const customerEmail = (order.customerEmail ?? "").trim();
      if (customerEmail) {
        const baseUrl = ENV.corsOrigin?.split(",")[0]?.trim() ?? "";
        const invoiceUrl = baseUrl
          ? `${baseUrl.replace(/\/$/, "")}/tr/account/orders/${encodeURIComponent(order.orderNumber)}`
          : "";
        await sendOrderInvoice({
          to: customerEmail,
          customerName: (order.customerName ?? order.billingName ?? customerEmail).trim(),
          customerEmail,
          orderNumber: order.orderNumber,
          orderTotal: `₺${Number(order.totalPrice).toFixed(2)}`,
          siteName: settings?.storeName ?? "",
          invoiceNumber: result.invoiceNumber,
          invoiceUrl,
        });
      }
    } catch (emailErr) {
      console.error("[Paraşüt] Fatura e-postası gönderilemedi:", emailErr);
    }
  }
}
