import nodemailer, { Transporter } from "nodemailer";
import { getEmailTemplate, getStoreSettings } from "../db";

type Variables = Record<string, string | number>;

export interface SendEmailOptions { to: string | string[]; subject: string; html: string; }
export interface SendEmailResult { success: boolean; messageId?: string; error?: unknown; }
interface OrderInfoBlock { orderNumber: string; orderDate: string; orderTotal: string; orderUrl: string; }

let _transporter: Transporter | null = null;

export function resetTransporter(): void { _transporter = null; }

export async function getTransporter(): Promise<Transporter> {
  if (_transporter) return _transporter;

  const settings = await getStoreSettings();
  const host   = settings?.smtpHost ?? "";
  const port   = Number(settings?.smtpPort) || 587;
  const secure = settings?.smtpSecure ?? false;
  const user   = settings?.smtpUser ?? "";
  const pass   = settings?.smtpPass ?? "";

  if (!host) throw new Error("[Email] SMTP yapılandırılmamış. Admin panelinden SMTP ayarlarını girin.");

  _transporter = nodemailer.createTransport({
    host, port, secure,
    auth: user && pass ? { user, pass } : undefined,
    connectionTimeout: 10_000,
    greetingTimeout: 5_000,
    socketTimeout: 10_000,
  });

  return _transporter;
}

export async function sendEmail(options: SendEmailOptions): Promise<SendEmailResult> {
  const settings = await getStoreSettings();
  const from = settings?.smtpFrom ?? "";
  const to = Array.isArray(options.to) ? options.to.join(", ") : options.to;
  try {
    const transporter = await getTransporter();
    const info = await transporter.sendMail({ from, to, subject: options.subject, html: options.html, text: stripHtml(options.html) });
    console.log(`[Email] ✓ "${options.subject}" → ${to}`);
    return { success: true, messageId: info.messageId as string };
  } catch (err) {
    console.error(`[Email] ✗ "${options.subject}" → ${to}:`, err);
    return { success: false, error: err };
  }
}

function interpolate(text: string, vars: Variables): string {
  return text.replace(/\{\{(\w+)\}\}/g, (match, key: string) => { const v = vars[key]; return v !== undefined ? String(v) : match; });
}

function buildLayout({ bodyHtml, orderInfo }: { bodyHtml: string; orderInfo?: OrderInfoBlock }): string {
  const orderBlock = orderInfo ? `
    <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:8px;margin:24px 0;border-collapse:collapse">
      <tr style="border-bottom:1px solid #e5e7eb"><td style="padding:12px 16px;color:#6b7280;font-size:14px;width:40%">Sipariş No</td><td style="padding:12px 16px;font-weight:600;font-size:14px">#${esc(orderInfo.orderNumber)}</td></tr>
      <tr style="border-bottom:1px solid #e5e7eb"><td style="padding:12px 16px;color:#6b7280;font-size:14px">Tarih</td><td style="padding:12px 16px;font-size:14px">${esc(orderInfo.orderDate)}</td></tr>
      <tr><td style="padding:12px 16px;color:#6b7280;font-size:14px">Tutar</td><td style="padding:12px 16px;font-weight:600;font-size:14px">${esc(orderInfo.orderTotal)}</td></tr>
    </table>
    <p style="text-align:center;margin:28px 0 0"><a href="${orderInfo.orderUrl}" style="display:inline-block;background:#111827;color:#fff;padding:13px 32px;border-radius:6px;font-size:15px;font-weight:600;text-decoration:none">Siparişi Görüntüle</a></p>` : "";

  return `<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f3f0eb;font-family:'Segoe UI',Arial,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f0eb;min-height:100vh"><tr><td align="center" style="padding:48px 16px">
<table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;box-shadow:0 4px 16px rgba(0,0,0,.10);max-width:100%;overflow:hidden">
<tr><td style="background:#111827;padding:22px 32px;text-align:center"><span style="font-size:22px;margin-right:10px">✉</span><span style="color:#fff;font-size:16px;font-weight:700;letter-spacing:2px;text-transform:uppercase">BİLDİRİM</span></td></tr>
<tr><td style="padding:36px 40px 40px"><div style="color:#374151;font-size:15px;line-height:1.7">${bodyHtml}</div>${orderBlock}</td></tr>
<tr><td style="background:#f9f9f8;padding:18px 40px;border-top:1px solid #e5e7eb;text-align:center;color:#9ca3af;font-size:12px">Bu e-posta mağaza bildirim sistemi tarafından gönderilmiştir.</td></tr>
</table></td></tr></table></body></html>`;
}

async function resolveTemplate(key: string, vars: Variables) {
  const tpl = await getEmailTemplate(key);
  if (!tpl) { console.warn(`[Email] Template "${key}" DB'de bulunamadı.`); return null; }
  return { subject: interpolate(tpl.subject, vars), bodyHtml: textToHtml(interpolate(tpl.body, vars)) };
}

export interface OrderCreatedPayload { to: string; customerName: string; orderNumber: string; orderDate: string; orderTotal: string; orderUrl: string; siteName: string; }
export async function sendOrderCreated(payload: OrderCreatedPayload): Promise<SendEmailResult> {
  const r = await resolveTemplate("order_created", { customer_name: payload.customerName, order_number: payload.orderNumber, order_date: payload.orderDate, order_total: payload.orderTotal, order_url: payload.orderUrl, site_name: payload.siteName });
  if (!r) return { success: false };
  return sendEmail({ to: payload.to, subject: r.subject, html: buildLayout({ bodyHtml: r.bodyHtml, orderInfo: { orderNumber: payload.orderNumber, orderDate: payload.orderDate, orderTotal: payload.orderTotal, orderUrl: payload.orderUrl } }) });
}

export interface OrderShippedPayload { to: string; customerName: string; orderNumber: string; trackingNumber: string; siteName: string; }
export async function sendOrderShipped(payload: OrderShippedPayload): Promise<SendEmailResult> {
  const r = await resolveTemplate("order_shipped", { customer_name: payload.customerName, order_number: payload.orderNumber, tracking_number: payload.trackingNumber, site_name: payload.siteName });
  if (!r) return { success: false };
  return sendEmail({ to: payload.to, subject: r.subject, html: buildLayout({ bodyHtml: r.bodyHtml }) });
}

export interface OrderDeliveredPayload { to: string; customerName: string; orderNumber: string; siteName: string; }
export async function sendOrderDelivered(payload: OrderDeliveredPayload): Promise<SendEmailResult> {
  const r = await resolveTemplate("order_delivered", { customer_name: payload.customerName, order_number: payload.orderNumber, site_name: payload.siteName });
  if (!r) return { success: false };
  return sendEmail({ to: payload.to, subject: r.subject, html: buildLayout({ bodyHtml: r.bodyHtml }) });
}

function esc(str: string): string { return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
function textToHtml(text: string): string { return text.split(/\n/).map(l => l.trim()).map(l => l ? `<p style="margin:0 0 12px">${esc(l)}</p>` : "").join("\n"); }
function stripHtml(html: string): string { return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim(); }
