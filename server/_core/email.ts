import nodemailer, { Transporter } from "nodemailer";
import { getEmailTemplate, getStoreSettings } from "../db";

type Variables = Record<string, string | number>;

export interface SendEmailOptions { to: string | string[]; subject: string; html: string; }
export interface SendEmailResult { success: boolean; messageId?: string; error?: unknown; }

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

export function esc(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export function buildLayout({
  bodyHtml,
  orderInfo,
}: {
  bodyHtml: string;
  orderInfo?: {
    orderNumber: string;
    orderDate: string;
    orderTotal: string;
    orderUrl: string;
  };
}): string {
  const orderBlock = orderInfo
    ? `
<table width="100%" cellpadding="0" cellspacing="0"
  style="border:1px solid #E8E2D9;border-collapse:collapse;margin:32px 0">
  <tr style="background:#F7F3EC">
    <td style="padding:14px 20px;font-family:'DM Sans','Helvetica Neue',Arial,sans-serif;
        font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#8B7355;
        width:40%;border-bottom:1px solid #E8E2D9">Sipariş No</td>
    <td style="padding:14px 20px;font-family:'DM Sans','Helvetica Neue',Arial,sans-serif;
        font-size:13px;color:#1C1C1E;font-weight:500;border-bottom:1px solid #E8E2D9">
      #${esc(orderInfo.orderNumber)}</td>
  </tr>
  <tr>
    <td style="padding:14px 20px;font-family:'DM Sans','Helvetica Neue',Arial,sans-serif;
        font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#8B7355;
        border-bottom:1px solid #E8E2D9">Tarih</td>
    <td style="padding:14px 20px;font-family:'DM Sans','Helvetica Neue',Arial,sans-serif;
        font-size:13px;color:#1C1C1E;border-bottom:1px solid #E8E2D9">
      ${esc(orderInfo.orderDate)}</td>
  </tr>
  <tr>
    <td style="padding:14px 20px;font-family:'DM Sans','Helvetica Neue',Arial,sans-serif;
        font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#8B7355">
      Tutar</td>
    <td style="padding:14px 20px;font-family:'Cormorant Garamond',Georgia,serif;
        font-size:18px;color:#1C1C1E">
      ${esc(orderInfo.orderTotal)}</td>
  </tr>
</table>
<p style="text-align:center;margin:36px 0 0">
  <a href="${esc(orderInfo.orderUrl)}"
     style="display:inline-block;background:#1C1C1E;color:#C9A96E;
            padding:14px 48px;text-decoration:none;
            font-family:'DM Sans','Helvetica Neue',Arial,sans-serif;
            font-size:10px;letter-spacing:3px;text-transform:uppercase;
            border:1px solid #C9A96E">
    SİPARİŞİ GÖRÜNTÜLE
  </a>
</p>`
    : "";

  return `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300&family=DM+Sans:wght@300;400&display=swap" rel="stylesheet">
</head>
<body style="margin:0;padding:0;background:#F7F3EC">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#F7F3EC;min-height:100vh">
  <tr><td align="center" style="padding:48px 16px">
    <table width="600" cellpadding="0" cellspacing="0"
      style="background:#FAFAF8;max-width:100%;box-shadow:0 2px 12px rgba(28,28,30,0.08)">

      <tr>
        <td style="background:#FAFAF8;padding:28px 40px;text-align:center;
                   border-bottom:1px solid #E8E2D9">
          <img
            src="https://d2xsxph8kpxj0f.cloudfront.net/310519663539077798/3fydJdkTrUbQF5VyRYKBGS/voilee_logo_2e68b438.webp"
            alt="VOILÉE"
            width="140"
            style="display:block;margin:0 auto;max-width:140px;height:auto"
          />
          <!--[if !mso]><!-->
          <noscript>
            <span style="font-family:'Cormorant Garamond',Georgia,'Times New Roman',serif;
                         font-size:22px;font-weight:300;letter-spacing:6px;
                         text-transform:uppercase;color:#C9A96E">
              VOILÉE
            </span>
          </noscript>
          <!--<![endif]-->
        </td>
      </tr>

      <tr>
        <td style="padding:44px 48px 48px">
          <div style="font-family:'DM Sans','Helvetica Neue',Arial,sans-serif;
                      font-size:14px;line-height:1.85;color:#1C1C1E;font-weight:300">
            ${bodyHtml}
          </div>
          ${orderBlock}
        </td>
      </tr>

      <tr>
        <td style="padding:0 40px">
          <div style="height:1px;background:#E8E2D9"></div>
        </td>
      </tr>

      <tr>
        <td style="background:#1C1C1E;padding:20px 40px;text-align:center">
          <p style="margin:0;font-family:'DM Sans','Helvetica Neue',Arial,sans-serif;
                    font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#8B7355">
            © VOILÉE — Bu e-posta mağaza bildirim sistemi tarafından gönderilmiştir.
          </p>
        </td>
      </tr>

    </table>
  </td></tr>
</table>
</body>
</html>`;
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

export function textToHtmlInline(text: string): string {
  return text
    .split(/\n/)
    .map(l => l.trim())
    .map(l =>
      l
        ? `<p style="margin:0 0 14px;font-family:'DM Sans','Helvetica Neue',Arial,sans-serif;font-size:14px;line-height:1.85;color:#1C1C1E;font-weight:300">${esc(l)}</p>`
        : `<p style="margin:0 0 8px">&nbsp;</p>`
    )
    .join("\n");
}

function textToHtml(text: string): string {
  return textToHtmlInline(text);
}

function stripHtml(html: string): string { return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim(); }
