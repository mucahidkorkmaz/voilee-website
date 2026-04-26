import nodemailer, { Transporter } from "nodemailer";
import type { EmailTemplateKey } from "@shared/const";
import { getEmailTemplate, getStoreSettings } from "../db";

const DEFAULT_STORE_NAME = "VOILÉE";

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

export interface OrderInfoBlock {
  orderNumber: string;
  orderDate: string;
  orderTotal: string;
  orderUrl: string;
}

export async function buildLayout({
  bodyHtml,
  orderInfo,
}: {
  bodyHtml: string;
  orderInfo?: OrderInfoBlock;
}): Promise<string> {
  let settings: Awaited<ReturnType<typeof getStoreSettings>> = null;
  try {
    settings = await getStoreSettings();
  } catch {
    /* empty store settings → fall back to defaults */
  }

  const storeName = settings?.storeName || DEFAULT_STORE_NAME;

  const orderBlock = orderInfo
    ? `<table width="100%" cellpadding="0" cellspacing="0" border="0"
             style="border:1px solid #e8e0d5;margin:24px 0">
        <tr>
          <td bgcolor="#fafaf9" style="background-color:#fafaf9;padding:16px 20px">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="font-size:13px;color:#374151;
                           font-family:Arial,Helvetica,sans-serif;
                           padding:4px 0">
                  Sipariş No: <strong>#${esc(orderInfo.orderNumber)}</strong>
                </td>
              </tr>
              <tr>
                <td style="font-size:13px;color:#374151;
                           font-family:Arial,Helvetica,sans-serif;
                           padding:4px 0">
                  Tarih: ${esc(orderInfo.orderDate)}
                </td>
              </tr>
              <tr>
                <td style="font-size:13px;color:#374151;
                           font-family:Arial,Helvetica,sans-serif;
                           padding:4px 0">
                  Tutar: <strong>${esc(orderInfo.orderTotal)}</strong>
                </td>
              </tr>
              <tr>
                <td style="padding-top:16px;text-align:center">
                  <a href="${orderInfo.orderUrl}"
                     style="display:inline-block;background-color:#0f0f0f;
                            color:#C9A96E !important;text-decoration:none;
                            font-size:11px;letter-spacing:3px;
                            text-transform:uppercase;padding:12px 32px;
                            font-family:Georgia,serif;border:1px solid #C9A96E">
                    SİPARİŞİMİ GÖRÜNTÜLE
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>`
    : "";

  return `<!DOCTYPE html>
<html lang="tr" xmlns="http://www.w3.org/1999/xhtml"
      xmlns:v="urn:schemas-microsoft-com:vml"
      xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <meta http-equiv="X-UA-Compatible" content="IE=edge"/>
  <meta name="color-scheme" content="light"/>
  <meta name="supported-color-schemes" content="light"/>
  <title>${esc(storeName)}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    @font-face {
      font-family: 'The Seasons';
      src: url('https://voilee.com.tr/fonts/TheSeasons-Regular.woff2') format('woff2'),
           url('https://voilee.com.tr/fonts/TheSeasons-Regular.woff') format('woff');
      font-weight: 400;
      font-style: normal;
    }
    :root { color-scheme: light only; supported-color-schemes: light; }
    /* Gmail dark mode force override */
    [data-ogsc] body,
    [data-ogsc] table,
    [data-ogsc] td,
    [data-ogsc] a { color: inherit !important; background-color: inherit !important; }
    /* Apple Mail dark mode override */
    @media (prefers-color-scheme: dark) {
      .email-body { background-color: #FAF8F5 !important; }
      .email-card { background-color: #ffffff !important; }
      .email-header { background-color: #ffffff !important; }
      .email-footer { background-color: #F5F0EB !important; }
      .email-text { color: #374151 !important; }
      .email-logo { filter: none !important; }
    }
  </style>
</head>
<body class="email-body"
      style="margin:0;padding:0;background-color:#FAF8F5;
             font-family:Georgia,'Times New Roman',serif;
             -webkit-text-size-adjust:100%;-ms-text-size-adjust:100%">

  <!--[if mso | IE]>
  <table width="100%" bgcolor="#FAF8F5" cellpadding="0" cellspacing="0" border="0">
    <tr><td>
  <![endif]-->

  <table class="email-body" width="100%" cellpadding="0" cellspacing="0" border="0"
         bgcolor="#FAF8F5"
         style="background-color:#FAF8F5;min-height:100%">
    <tr>
      <td align="center" bgcolor="#FAF8F5"
          style="background-color:#FAF8F5;padding:40px 16px">

        <!-- Card container -->
        <table class="email-card" width="600" cellpadding="0" cellspacing="0" border="0"
               bgcolor="#ffffff"
               style="max-width:600px;width:100%;background-color:#ffffff">

          <!-- Logo header -->
          <tr>
            <td align="center" bgcolor="#ffffff"
                style="background-color:#ffffff;padding:44px 40px 28px">
              <p style="margin:0;padding:0;
                        font-family:'The Seasons',Georgia,'Times New Roman',serif;
                        font-size:36px;font-weight:400;
                        letter-spacing:12px;color:#1a1a1a;
                        line-height:1;text-align:center;
                        mso-line-height-rule:exactly">
                VOIL&Eacute;E
              </p>
              <p style="margin:8px 0 0;padding:0;
                        font-family:Georgia,'Times New Roman',serif;
                        font-size:9px;font-weight:400;
                        letter-spacing:4px;color:#C9A96E;
                        line-height:1;text-align:center;
                        mso-line-height-rule:exactly">
                designed with intention
              </p>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td bgcolor="#ffffff" style="background-color:#ffffff;padding:0 48px">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="border-top:1px solid #e8e0d5;
                             font-size:1px;line-height:1px;height:1px;
                             mso-line-height-rule:exactly">
                    &nbsp;
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td class="email-text" bgcolor="#ffffff"
                style="background-color:#ffffff;padding:32px 52px 40px;
                       color:#374151;font-size:15px;line-height:1.85;
                       font-family:Georgia,'Times New Roman',serif">
              ${bodyHtml}
              ${orderBlock}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td class="email-footer" align="center" bgcolor="#F5F0EB"
                style="background-color:#F5F0EB;padding:20px 40px;
                       border-top:1px solid #e8e0d5;
                       color:#9ca3af;font-size:10px;letter-spacing:2px;
                       text-transform:uppercase;
                       font-family:Arial,Helvetica,sans-serif">
              &copy; ${esc(storeName)} &mdash; BU E-POSTA MA&#286;AZA B&#304;LD&#304;R&#304;M
              S&#304;STEM&#304; TARAFINDAN G&Ouml;NDER&#304;LM&#304;&#350;T&#304;R.
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

  <!--[if mso | IE]>
    </td></tr>
  </table>
  <![endif]-->

</body>
</html>`;
}

async function resolveTemplate(key: EmailTemplateKey, vars: Variables) {
  const tpl = await getEmailTemplate(key);
  if (!tpl) { console.warn(`[Email] Template "${key}" DB'de bulunamadı.`); return null; }
  return { subject: interpolate(tpl.subject, vars), bodyHtml: textToHtml(interpolate(tpl.body, vars)) };
}

export interface PasswordResetPayload {
  to: string;
  customerName: string;
  resetUrl: string;
}

const PASSWORD_RESET_BODY_FALLBACK_HTML = `
    <p style="margin:0 0 16px;color:#374151;font-size:15px;line-height:1.8;
              font-family:Georgia,serif">
      Hesabınız için bir şifre sıfırlama talebinde bulunuldu.
      Aşağıdaki bağlantı <strong>30 dakika</strong> geçerlidir.
    </p>
    <p style="margin:0 0 32px;color:#374151;font-size:15px;line-height:1.8;
              font-family:Georgia,serif">
      Bu isteği siz yapmadıysanız bu e-postayı görmezden gelebilirsiniz.
    </p>`;

export async function sendPasswordReset(payload: PasswordResetPayload): Promise<SendEmailResult> {
  let storeName = DEFAULT_STORE_NAME;
  try {
    const settings = await getStoreSettings();
    storeName = settings?.storeName || DEFAULT_STORE_NAME;
  } catch {
    /* use DEFAULT_STORE_NAME */
  }

  const tpl = await getEmailTemplate("customerPasswordReset");
  const subject = tpl?.subject
    ? interpolate(tpl.subject, { customer_name: payload.customerName, site_name: storeName })
    : `Şifre Sıfırlama Talebi — ${storeName}`;

  const greeting =
    payload.customerName && payload.customerName !== "Müşteri"
      ? `Sayın ${esc(payload.customerName)},`
      : "Sayın Müşterimiz,";

  const hrefUrl = esc(payload.resetUrl);

  const bodyMiddleHtml = tpl?.body?.trim()
    ? textToHtml(
        interpolate(tpl.body, {
          customer_name: payload.customerName,
          site_name: storeName,
          customer_email: payload.to,
          reset_url: payload.resetUrl,
        }),
      )
    : PASSWORD_RESET_BODY_FALLBACK_HTML;

  const bodyHtml = `
    <p style="margin:0 0 20px;color:#1a1a1a;font-size:15px;line-height:1.8;
              font-family:Georgia,serif">${greeting}</p>
    ${bodyMiddleHtml}
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td align="center" style="padding:8px 0 32px">
          <a href="${hrefUrl}"
             style="display:inline-block;background-color:#0f0f0f;color:#C9A96E;
                    text-decoration:none;font-size:11px;letter-spacing:4px;
                    text-transform:uppercase;padding:16px 48px;
                    font-family:Georgia,serif;border:1px solid #C9A96E;
                    mso-padding-alt:16px 48px">
            ŞİFREMİ SIFIRLA
          </a>
        </td>
      </tr>
    </table>
    <p style="margin:0;color:#b0a898;font-size:12px;line-height:1.6;
              font-family:Arial,sans-serif">
      Bağlantı çalışmıyorsa aşağıdaki URL'yi tarayıcınıza kopyalayın:<br/>
      <a href="${hrefUrl}"
         style="color:#9ca3af;word-break:break-all">${hrefUrl}</a>
    </p>
  `;

  return sendEmail({
    to: payload.to,
    subject,
    html: await buildLayout({ bodyHtml }),
  });
}

export interface OrderCreatedPayload { to: string; customerName: string; orderNumber: string; orderDate: string; orderTotal: string; orderUrl: string; siteName: string; }
export async function sendOrderCreated(payload: OrderCreatedPayload): Promise<SendEmailResult> {
  const r = await resolveTemplate("orderCreated", { customer_name: payload.customerName, order_number: payload.orderNumber, order_date: payload.orderDate, order_total: payload.orderTotal, order_url: payload.orderUrl, site_name: payload.siteName });
  if (!r) return { success: false };
  return sendEmail({
    to: payload.to,
    subject: r.subject,
    html: await buildLayout({
      bodyHtml: r.bodyHtml,
      orderInfo: {
        orderNumber: payload.orderNumber,
        orderDate: payload.orderDate,
        orderTotal: payload.orderTotal,
        orderUrl: payload.orderUrl,
      },
    }),
  });
}

export interface OrderShippedPayload { to: string; customerName: string; orderNumber: string; trackingNumber: string; siteName: string; }
export async function sendOrderShipped(payload: OrderShippedPayload): Promise<SendEmailResult> {
  const r = await resolveTemplate("shipmentSent", {
    customer_name: payload.customerName,
    order_number: payload.orderNumber,
    tracking_number: payload.trackingNumber,
    site_name: payload.siteName,
    customer_email: "",
    order_total: "",
    cargo_company: "—",
  });
  if (!r) return { success: false };
  return sendEmail({ to: payload.to, subject: r.subject, html: await buildLayout({ bodyHtml: r.bodyHtml }) });
}

export interface OrderDeliveredPayload { to: string; customerName: string; orderNumber: string; siteName: string; }
export async function sendOrderDelivered(payload: OrderDeliveredPayload): Promise<SendEmailResult> {
  const r = await resolveTemplate("orderDelivered", {
    customer_name: payload.customerName,
    order_number: payload.orderNumber,
    site_name: payload.siteName,
    customer_email: "",
    order_total: "",
  });
  if (!r) return { success: false };
  return sendEmail({ to: payload.to, subject: r.subject, html: await buildLayout({ bodyHtml: r.bodyHtml }) });
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
