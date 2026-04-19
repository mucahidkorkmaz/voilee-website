export const COOKIE_NAME = "app_session_id";
export const ONE_YEAR_MS = 1000 * 60 * 60 * 24 * 365;
export const AXIOS_TIMEOUT_MS = 30_000;
export const UNAUTHED_ERR_MSG = 'Please login (10001)';
export const NOT_ADMIN_ERR_MSG = 'You do not have required permission (10002)';

// ─── E-posta Şablonları ───────────────────────────────────────────────────────

export const EMAIL_TEMPLATE_KEYS = [
  // Siparişler
  "orderCreated",
  "orderDelivered",
  "orderCreatedWireTransfer",
  "orderPaymentApprovedWireTransfer",
  "orderCreatedStorePickup",
  "orderReadyStorePickup",
  "orderInvoice",
  "orderDigitalProduct",
  "orderUpdated",
  "orderAdditionalPayment",
  "orderCancelled",
  // Kargo
  "shipmentReady",
  "shipmentSent",
  "shipmentUpdated",
  // İadeler
  "refundProcessed",
  "refundRequested",
  "refundAccepted",
  "refundRejected",
  // Müşteri
  "customerPasswordReset",
  "customerWelcome",
  // Otomasyonlar
  "automationAbandonedCart",
  "automationProductReview",
  "automationBackInStock",
  "automationWireTransferReminder",
  "automationWireTransferExpiry",
] as const;

export type EmailTemplateKey = (typeof EMAIL_TEMPLATE_KEYS)[number];

export type EmailTemplate = {
  subject?: string;
  body?: string;
};

export type SiteEmailTemplates = Partial<Record<EmailTemplateKey, EmailTemplate>>;

export type EmailTemplateMeta = {
  label: string;
  description: string;
  defaultSubject: string;
  defaultBody: string;
  variables: Array<{ key: string; description: string }>;
};

export type EmailTemplateGroup = {
  id: string;
  label: string;
  keys: readonly EmailTemplateKey[];
};

export const EMAIL_TEMPLATE_GROUPS: EmailTemplateGroup[] = [
  {
    id: "orders",
    label: "Siparişler",
    keys: [
      "orderCreated",
      "orderDelivered",
      "orderCreatedWireTransfer",
      "orderPaymentApprovedWireTransfer",
      "orderCreatedStorePickup",
      "orderReadyStorePickup",
      "orderInvoice",
      "orderDigitalProduct",
      "orderUpdated",
      "orderAdditionalPayment",
      "orderCancelled",
    ],
  },
  {
    id: "shipping",
    label: "Kargo",
    keys: ["shipmentReady", "shipmentSent", "shipmentUpdated"],
  },
  {
    id: "returns",
    label: "İadeler",
    keys: ["refundProcessed", "refundRequested", "refundAccepted", "refundRejected"],
  },
  {
    id: "customer",
    label: "Müşteri",
    keys: ["customerPasswordReset", "customerWelcome"],
  },
  {
    id: "automations",
    label: "Otomasyonlar",
    keys: [
      "automationAbandonedCart",
      "automationProductReview",
      "automationBackInStock",
      "automationWireTransferReminder",
      "automationWireTransferExpiry",
    ],
  },
];

const ORDER_VARS = [
  { key: "customer_name", description: "Müşteri adı veya e-postası" },
  { key: "customer_email", description: "Müşteri e-postası" },
  { key: "order_number", description: "Sipariş numarası" },
  { key: "order_total", description: "Sipariş tutarı" },
  { key: "site_name", description: "Mağaza adı" },
];

export const EMAIL_TEMPLATE_META: Record<EmailTemplateKey, EmailTemplateMeta> = {
  // ── Siparişler ──────────────────────────────────────────────────────────────
  orderCreated: {
    label: "Sipariş Oluşturuldu",
    description: "Müşteri, siparişini verdikten sonra müşteriye gönderilir.",
    defaultSubject: "Sipariş #{{order_number}} alındı — {{site_name}}",
    defaultBody: "Merhaba {{customer_name}},\nSiparişiniz başarıyla oluşturuldu. Aşağıda sipariş detaylarınızı bulabilirsiniz.",
    variables: ORDER_VARS,
  },
  orderDelivered: {
    label: "Sipariş Teslim Edildi",
    description: "Sipariş teslim edildi durumuna geçtiğinde müşteriye gönderilir.",
    defaultSubject: "Sipariş #{{order_number}} teslim edildi — {{site_name}}",
    defaultBody: "Merhaba {{customer_name}},\n#{{order_number}} numaralı siparişiniz teslim edildi. Alışverişiniz için teşekkür ederiz.",
    variables: ORDER_VARS,
  },
  orderCreatedWireTransfer: {
    label: "Sipariş Oluşturuldu (Havale Siparişler)",
    description: "Sipariş oluşturulması durumunda havale ile ilgili e-posta gönderin.",
    defaultSubject: "Sipariş #{{order_number}} — Havale Bilgileriniz",
    defaultBody: "Merhaba {{customer_name}},\nSiparişiniz alındı. Ödemenizi aşağıdaki havale bilgilerini kullanarak tamamlayabilirsiniz.",
    variables: [
      ...ORDER_VARS,
      { key: "bank_name", description: "Banka adı" },
      { key: "iban", description: "IBAN numarası" },
      { key: "account_holder", description: "Hesap sahibi adı" },
    ],
  },
  orderPaymentApprovedWireTransfer: {
    label: "Ödeme Onaylandı (Havale Siparişler)",
    description: "Sipariş için havale ödemesi onaylandığında müşteriye gönderilir.",
    defaultSubject: "Ödemeniz Onaylandı — Sipariş #{{order_number}}",
    defaultBody: "Merhaba {{customer_name}},\n#{{order_number}} numaralı siparişinizin havale ödemesi onaylandı. Siparişiniz işleme alındı.",
    variables: ORDER_VARS,
  },
  orderCreatedStorePickup: {
    label: "Sipariş Oluşturuldu (Mağazadan Teslimat)",
    description: "Mağazadan teslimat ile oluşturulan siparişlerin onaylı e-postasını düzenleyebilirsiniz.",
    defaultSubject: "Sipariş #{{order_number}} — Mağazadan Teslim",
    defaultBody: "Merhaba {{customer_name}},\nSiparişiniz alındı. Siparişinizi mağazamızdan teslim alabilirsiniz.",
    variables: [
      ...ORDER_VARS,
      { key: "store_address", description: "Mağaza adresi" },
    ],
  },
  orderReadyStorePickup: {
    label: "Sipariş Teslimata Hazır (Mağazadan Teslimat)",
    description: "Sipariş teslimata hazır durumuna geçtiğinde müşteriye gönderilir.",
    defaultSubject: "Siparişiniz Hazır — #{{order_number}}",
    defaultBody: "Merhaba {{customer_name}},\n#{{order_number}} numaralı siparişiniz mağazadan teslim almaya hazır.",
    variables: [
      ...ORDER_VARS,
      { key: "store_address", description: "Mağaza adresi" },
    ],
  },
  orderInvoice: {
    label: "Sipariş Faturası",
    description: "Entegrasyonlardan oluşan fatura oluştuğunda müşteriye gönderilir.",
    defaultSubject: "Faturanız Hazır — Sipariş #{{order_number}}",
    defaultBody: "Merhaba {{customer_name}},\n#{{order_number}} numaralı siparişinize ait faturanız oluşturuldu.",
    variables: [
      ...ORDER_VARS,
      { key: "invoice_number", description: "Fatura numarası" },
      { key: "invoice_url", description: "Fatura indirme bağlantısı" },
    ],
  },
  orderDigitalProduct: {
    label: "Dijital Ürün Bilgilendirme",
    description: "Sipariş içerisinde kullanılabilir/indirilebilir dijital ürün olduğunda müşteriye gönderilir.",
    defaultSubject: "Dijital Ürününüz Hazır — Sipariş #{{order_number}}",
    defaultBody: "Merhaba {{customer_name}},\n#{{order_number}} numaralı siparişinizdeki dijital ürünlerinize aşağıdan erişebilirsiniz.",
    variables: [
      ...ORDER_VARS,
      { key: "download_url", description: "İndirme bağlantısı" },
    ],
  },
  orderUpdated: {
    label: "Sipariş Güncellendi",
    description: "Siparişinizde yapılan değişiklikleri bildirmek için gönderilir.",
    defaultSubject: "Siparişiniz Güncellendi — #{{order_number}}",
    defaultBody: "Merhaba {{customer_name}},\n#{{order_number}} numaralı siparişinizde değişiklik yapıldı.",
    variables: ORDER_VARS,
  },
  orderAdditionalPayment: {
    label: "Sipariş Ek Ödeme Gerekiyor",
    description: "Siparişinizde yapılan değişiklikler nedeniyle ek bir ödeme gerekiyorsa müşteriye gönderilir.",
    defaultSubject: "Ek Ödeme Gerekiyor — Sipariş #{{order_number}}",
    defaultBody: "Merhaba {{customer_name}},\n#{{order_number}} numaralı siparişiniz için ek ödeme yapmanız gerekmektedir.",
    variables: [
      ...ORDER_VARS,
      { key: "additional_amount", description: "Ek ödeme tutarı" },
      { key: "payment_url", description: "Ödeme bağlantısı" },
    ],
  },
  orderCancelled: {
    label: "Sipariş İptal Edildi",
    description: "Siparişin iptal edilmesi durumunda müşteriye gönderilir.",
    defaultSubject: "Sipariş #{{order_number}} İptal Edildi",
    defaultBody: "Merhaba {{customer_name}},\n#{{order_number}} numaralı siparişiniz iptal edildi.",
    variables: [
      ...ORDER_VARS,
      { key: "cancel_reason", description: "İptal sebebi" },
    ],
  },

  // ── Kargo ───────────────────────────────────────────────────────────────────
  shipmentReady: {
    label: "Sipariş Gönderilmeye Hazır",
    description: "Müşterinin siparişinin kargolanmaya hazır durumda olduğunu bildirmek için müşteriye gönderilir.",
    defaultSubject: "Siparişiniz Kargoya Hazırlanıyor — #{{order_number}}",
    defaultBody: "Merhaba {{customer_name}},\n#{{order_number}} numaralı siparişiniz kargoya hazırlanmaktadır.",
    variables: ORDER_VARS,
  },
  shipmentSent: {
    label: "Sipariş Gönderildi",
    description: "Sipariş gönderildi durumuna geçtiğinde müşteriye gönderilir.",
    defaultSubject: "Sipariş #{{order_number}} Kargoya Verildi",
    defaultBody: "Merhaba {{customer_name}},\n#{{order_number}} numaralı siparişiniz kargoya verildi!",
    variables: [
      ...ORDER_VARS,
      { key: "tracking_number", description: "Kargo takip numarası" },
      { key: "cargo_company", description: "Kargo firması" },
    ],
  },
  shipmentUpdated: {
    label: "Kargo Bilgileri Güncellendi",
    description: "Müşterinin siparişinde kargo bilgileri güncellenirse müşteriye gönderilir.",
    defaultSubject: "Kargo Bilgileri Güncellendi — #{{order_number}}",
    defaultBody: "Merhaba {{customer_name}},\n#{{order_number}} numaralı siparişinizin kargo bilgileri güncellendi.",
    variables: [
      ...ORDER_VARS,
      { key: "tracking_number", description: "Kargo takip numarası" },
      { key: "cargo_company", description: "Kargo firması" },
    ],
  },

  // ── İadeler ─────────────────────────────────────────────────────────────────
  refundProcessed: {
    label: "Sipariş İade Edildi",
    description: "Müşterinin siparişi için para iadesi yapılırsa müşteriye gönderilir.",
    defaultSubject: "İade İşleminiz Tamamlandı — Sipariş #{{order_number}}",
    defaultBody: "Merhaba {{customer_name}},\n#{{order_number}} numaralı siparişiniz için iade işleminiz tamamlandı.",
    variables: [
      ...ORDER_VARS,
      { key: "refund_amount", description: "İade tutarı" },
    ],
  },
  refundRequested: {
    label: "İade Talep Edildi",
    description: "Müşteri, siparişin iade talebinde bulunduysa müşteriye gönderilir.",
    defaultSubject: "İade Talebiniz Alındı — Sipariş #{{order_number}}",
    defaultBody: "Merhaba {{customer_name}},\n#{{order_number}} numaralı sipariş için iade talebiniz alındı. En kısa sürede incelenecektir.",
    variables: ORDER_VARS,
  },
  refundAccepted: {
    label: "İade Talebi Kabul Edildi",
    description: "Müşterinin iade talebi onaylanırsa müşteriye gönderilir.",
    defaultSubject: "İade Talebiniz Onaylandı — Sipariş #{{order_number}}",
    defaultBody: "Merhaba {{customer_name}},\n#{{order_number}} numaralı sipariş için iade talebiniz onaylandı.",
    variables: [
      ...ORDER_VARS,
      { key: "refund_amount", description: "İade tutarı" },
    ],
  },
  refundRejected: {
    label: "İade Talebi Reddedildi",
    description: "Müşterinin iade talebi reddedilirse müşteriye gönderilir.",
    defaultSubject: "İade Talebiniz Reddedildi — Sipariş #{{order_number}}",
    defaultBody: "Merhaba {{customer_name}},\n#{{order_number}} numaralı sipariş için iade talebiniz maalesef reddedildi.",
    variables: [
      ...ORDER_VARS,
      { key: "reject_reason", description: "Red sebebi" },
    ],
  },

  // ── Müşteri ─────────────────────────────────────────────────────────────────
  customerPasswordReset: {
    label: "Şifre Sıfırlama",
    description: "Müşteri, hesap parolasını sıfırlamak istediğinde müşteriye gönderilir.",
    defaultSubject: "{{site_name}} — Şifre Sıfırlama",
    defaultBody: "Merhaba {{customer_name}},\n{{site_name}} hesabınız için şifre sıfırlama talebinde bulundunuz. Aşağıdaki butona tıklayarak yeni şifrenizi belirleyebilirsiniz.",
    variables: [
      { key: "customer_name", description: "Müşteri adı veya e-postası" },
      { key: "customer_email", description: "Müşteri e-postası" },
      { key: "site_name", description: "Mağaza adı" },
      { key: "reset_url", description: "Şifre sıfırlama bağlantısı" },
    ],
  },
  customerWelcome: {
    label: "Müşteri Hoş Geldin Mesajı",
    description: "Müşteri, ilk hesap oluşturduğunda kendisine otomatik olarak gönderilir.",
    defaultSubject: "{{site_name}}'e Hoş Geldiniz!",
    defaultBody: "Merhaba {{customer_name}},\n{{site_name}} mağazasına başarıyla kayıt oldunuz. Artık hesabınızla alışveriş yapabilir, siparişlerinizi takip edebilirsiniz.",
    variables: [
      { key: "customer_name", description: "Müşteri adı veya e-postası" },
      { key: "customer_email", description: "Müşteri e-postası" },
      { key: "site_name", description: "Mağaza adı" },
      { key: "site_domain", description: "Mağaza domaini" },
    ],
  },

  // ── Otomasyonlar ─────────────────────────────────────────────────────────────
  automationAbandonedCart: {
    label: "Terkedilmiş Sepet",
    description: "Müşteri, ödemeyi tamamlamadan sepeti terkederse müşteriye gönderilir.",
    defaultSubject: "Sepetinizde Ürünler Sizi Bekliyor — {{site_name}}",
    defaultBody: "Merhaba {{customer_name}},\nSepetinizde bıraktığınız ürünler sizi bekliyor. Alışverişinizi tamamlamak için sepetinize dönebilirsiniz.",
    variables: [
      { key: "customer_name", description: "Müşteri adı veya e-postası" },
      { key: "customer_email", description: "Müşteri e-postası" },
      { key: "site_name", description: "Mağaza adı" },
      { key: "cart_url", description: "Sepet bağlantısı" },
      { key: "cart_total", description: "Sepet tutarı" },
    ],
  },
  automationProductReview: {
    label: "Ürün Yorumu",
    description: "Otomasyon ayarlarındaki kurallara göre ürün yorumu toplamak için müşteriye gönderilir.",
    defaultSubject: "Satın Aldığınız Ürünü Değerlendirin — {{site_name}}",
    defaultBody: "Merhaba {{customer_name}},\nSatın aldığınız ürün hakkında yorum yaparak diğer müşterilere yardımcı olabilirsiniz.",
    variables: [
      { key: "customer_name", description: "Müşteri adı veya e-postası" },
      { key: "customer_email", description: "Müşteri e-postası" },
      { key: "site_name", description: "Mağaza adı" },
      { key: "order_number", description: "Sipariş numarası" },
      { key: "review_url", description: "Yorum bağlantısı" },
    ],
  },
  automationBackInStock: {
    label: "İstediğin Ürün Tekrar Stokta",
    description: "Müşterinin istediği ürünün stoğa geldiğinde müşteriye gönderilir.",
    defaultSubject: "İstediğiniz Ürün Tekrar Stokta — {{site_name}}",
    defaultBody: "Merhaba {{customer_name}},\nBeklediğiniz ürün tekrar stoğa girdi! Hemen sipariş vermek için tıklayın.",
    variables: [
      { key: "customer_name", description: "Müşteri adı veya e-postası" },
      { key: "customer_email", description: "Müşteri e-postası" },
      { key: "site_name", description: "Mağaza adı" },
      { key: "product_name", description: "Ürün adı" },
      { key: "product_url", description: "Ürün bağlantısı" },
    ],
  },
  automationWireTransferReminder: {
    label: "Havale Hatırlatma Otomasyonu",
    description: "Müşterilerinize ödemesi tamamlanmamış sipariş ile ilgili e-posta gönderin.",
    defaultSubject: "Ödemenizi Tamamlamayı Unutmayın — Sipariş #{{order_number}}",
    defaultBody: "Merhaba {{customer_name}},\n#{{order_number}} numaralı siparişinizin havale ödemesi henüz tamamlanmadı. Siparişinizin iptal edilmemesi için ödemenizi yapmanızı rica ederiz.",
    variables: [
      { key: "customer_name", description: "Müşteri adı veya e-postası" },
      { key: "customer_email", description: "Müşteri e-postası" },
      { key: "order_number", description: "Sipariş numarası" },
      { key: "order_total", description: "Sipariş tutarı" },
      { key: "site_name", description: "Mağaza adı" },
      { key: "deadline", description: "Ödeme son tarihi" },
      { key: "bank_name", description: "Banka adı" },
      { key: "iban", description: "IBAN numarası" },
    ],
  },
  automationWireTransferExpiry: {
    label: "Havale Ödeme Kontrol",
    description: "Ödemesi süresi içinde tamamlanmayan siparişler için iptal bilgilendirmesi müşteriye gönderilir.",
    defaultSubject: "Siparişiniz İptal Edildi — #{{order_number}}",
    defaultBody: "Merhaba {{customer_name}},\n#{{order_number}} numaralı siparişinizin havale ödemesi belirtilen süre içinde yapılmadığı için siparişiniz iptal edildi.",
    variables: [
      { key: "customer_name", description: "Müşteri adı veya e-postası" },
      { key: "customer_email", description: "Müşteri e-postası" },
      { key: "order_number", description: "Sipariş numarası" },
      { key: "order_total", description: "Sipariş tutarı" },
      { key: "site_name", description: "Mağaza adı" },
    ],
  },
};
