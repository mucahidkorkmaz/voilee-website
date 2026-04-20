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
    defaultSubject: "Siparişiniz Alındı — VOILÉE #{{order_number}}",
    defaultBody: `Sayın {{customer_name}},

Siparişiniz başarıyla alındı. Her parçayı özenle hazırlıyor, en kısa sürede kargoya veriyoruz.

Sipariş detaylarınızı aşağıda ve hesabınızdan takip edebilirsiniz.

Teşekkür ederiz.
VOILÉE`,
    variables: ORDER_VARS,
  },
  orderDelivered: {
    label: "Sipariş Teslim Edildi",
    description: "Sipariş teslim edildi durumuna geçtiğinde müşteriye gönderilir.",
    defaultSubject: "Siparişiniz Teslim Edildi — VOILÉE",
    defaultBody: `Sayın {{customer_name}},

#{{order_number}} numaralı siparişiniz teslim edildi.

Yeni parçalarınızın tadını çıkarmanızı diliyoruz. Herhangi bir konuda yanınızdayız.

Teşekkür ederiz.
VOILÉE`,
    variables: ORDER_VARS,
  },
  orderCreatedWireTransfer: {
    label: "Sipariş Oluşturuldu (Havale Siparişler)",
    description: "Sipariş oluşturulması durumunda havale ile ilgili e-posta gönderin.",
    defaultSubject: "Sipariş #{{order_number}} — Havale Bilgileri",
    defaultBody: `Sayın {{customer_name}},

Siparişiniz alındı. Ödemenizi tamamlamak için aşağıdaki havale bilgilerini kullanabilirsiniz.

Banka: {{bank_name}}
IBAN: {{iban}}
Hesap Sahibi: {{account_holder}}

Havale açıklamasına sipariş numaranızı (#{{order_number}}) yazmayı unutmayınız. Ödemeniz onaylandıktan sonra siparişiniz hazırlanmaya başlanacaktır.

Teşekkür ederiz.
VOILÉE`,
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
    defaultBody: `Sayın {{customer_name}},

#{{order_number}} numaralı siparişinizin havale ödemesi onaylandı. Siparişiniz hazırlanmaya başlandı.

Teşekkür ederiz.
VOILÉE`,
    variables: ORDER_VARS,
  },
  orderCreatedStorePickup: {
    label: "Sipariş Oluşturuldu (Mağazadan Teslimat)",
    description: "Mağazadan teslimat ile oluşturulan siparişlerin onaylı e-postasını düzenleyebilirsiniz.",
    defaultSubject: "Sipariş #{{order_number}} — Mağazadan Teslim",
    defaultBody: `Sayın {{customer_name}},

Siparişiniz alındı. Hazır olduğunda sizi bilgilendireceğiz.

Teslim adresi: {{store_address}}

Teşekkür ederiz.
VOILÉE`,
    variables: [
      ...ORDER_VARS,
      { key: "store_address", description: "Mağaza adresi" },
    ],
  },
  orderReadyStorePickup: {
    label: "Sipariş Teslimata Hazır (Mağazadan Teslimat)",
    description: "Sipariş teslimata hazır durumuna geçtiğinde müşteriye gönderilir.",
    defaultSubject: "Siparişiniz Mağazada Hazır — #{{order_number}}",
    defaultBody: `Sayın {{customer_name}},

#{{order_number}} numaralı siparişiniz mağazadan teslim almaya hazır.

Adres: {{store_address}}

Teşekkür ederiz.
VOILÉE`,
    variables: [
      ...ORDER_VARS,
      { key: "store_address", description: "Mağaza adresi" },
    ],
  },
  orderInvoice: {
    label: "Sipariş Faturası",
    description: "Entegrasyonlardan oluşan fatura oluştuğunda müşteriye gönderilir.",
    defaultSubject: "Faturanız Hazır — Sipariş #{{order_number}}",
    defaultBody: `Sayın {{customer_name}},

#{{order_number}} numaralı siparişinize ait fatura ({{invoice_number}}) oluşturuldu.

Faturanıza aşağıdaki bağlantıdan ulaşabilirsiniz: {{invoice_url}}

Teşekkür ederiz.
VOILÉE`,
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
    defaultBody: `Sayın {{customer_name}},

#{{order_number}} numaralı siparişinizdeki dijital ürünleriniz hazır.

İndirme bağlantısı: {{download_url}}

Teşekkür ederiz.
VOILÉE`,
    variables: [
      ...ORDER_VARS,
      { key: "download_url", description: "İndirme bağlantısı" },
    ],
  },
  orderUpdated: {
    label: "Sipariş Güncellendi",
    description: "Siparişinizde yapılan değişiklikleri bildirmek için gönderilir.",
    defaultSubject: "Siparişiniz Güncellendi — #{{order_number}}",
    defaultBody: `Sayın {{customer_name}},

#{{order_number}} numaralı siparişinizde bir güncelleme yapıldı. Detaylar için hesabınızı inceleyebilirsiniz.

Teşekkür ederiz.
VOILÉE`,
    variables: ORDER_VARS,
  },
  orderAdditionalPayment: {
    label: "Sipariş Ek Ödeme Gerekiyor",
    description: "Siparişinizde yapılan değişiklikler nedeniyle ek bir ödeme gerekiyorsa müşteriye gönderilir.",
    defaultSubject: "Ek Ödeme Gerekiyor — Sipariş #{{order_number}}",
    defaultBody: `Sayın {{customer_name}},

#{{order_number}} numaralı siparişiniz için {{additional_amount}} tutarında ek ödeme gerekmektedir.

Ödeme yapmak için: {{payment_url}}

Sorularınız için bizimle iletişime geçebilirsiniz.

Teşekkür ederiz.
VOILÉE`,
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
    defaultBody: `Sayın {{customer_name}},

#{{order_number}} numaralı siparişiniz iptal edildi.
{{cancel_reason}}

Herhangi bir sorunuz olursa yanınızdayız.

VOILÉE`,
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
    defaultBody: `Sayın {{customer_name}},

#{{order_number}} numaralı siparişiniz kargoya hazırlanmaktadır. Kargoya verildiğinde tekrar bilgilendirileceğiz.

Teşekkür ederiz.
VOILÉE`,
    variables: ORDER_VARS,
  },
  shipmentSent: {
    label: "Sipariş Gönderildi",
    description: "Sipariş gönderildi durumuna geçtiğinde müşteriye gönderilir.",
    defaultSubject: "Siparişiniz Yola Çıktı — VOILÉE #{{order_number}}",
    defaultBody: `Sayın {{customer_name}},

#{{order_number}} numaralı siparişiniz kargoya verildi.

Kargo firması: {{cargo_company}}
Takip numarası: {{tracking_number}}

Teşekkür ederiz.
VOILÉE`,
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
    defaultBody: `Sayın {{customer_name}},

#{{order_number}} numaralı siparişinizin kargo bilgileri güncellendi.

Kargo firması: {{cargo_company}}
Yeni takip numarası: {{tracking_number}}

Teşekkür ederiz.
VOILÉE`,
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
    defaultBody: `Sayın {{customer_name}},

#{{order_number}} numaralı siparişiniz için {{refund_amount}} tutarındaki iade işleminiz tamamlandı.

İade tutarı ödeme yönteminize bağlı olarak birkaç iş günü içinde hesabınıza yansıyacaktır.

VOILÉE`,
    variables: [
      ...ORDER_VARS,
      { key: "refund_amount", description: "İade tutarı" },
    ],
  },
  refundRequested: {
    label: "İade Talep Edildi",
    description: "Müşteri, siparişin iade talebinde bulunduysa müşteriye gönderilir.",
    defaultSubject: "İade Talebiniz Alındı — Sipariş #{{order_number}}",
    defaultBody: `Sayın {{customer_name}},

#{{order_number}} numaralı sipariş için iade talebiniz alındı. En kısa sürede inceleyip size dönüş yapacağız.

VOILÉE`,
    variables: ORDER_VARS,
  },
  refundAccepted: {
    label: "İade Talebi Kabul Edildi",
    description: "Müşterinin iade talebi onaylanırsa müşteriye gönderilir.",
    defaultSubject: "İade Talebiniz Onaylandı — Sipariş #{{order_number}}",
    defaultBody: `Sayın {{customer_name}},

#{{order_number}} numaralı sipariş için iade talebiniz onaylandı. {{refund_amount}} tutarındaki iade işleminiz başlatıldı.

VOILÉE`,
    variables: [
      ...ORDER_VARS,
      { key: "refund_amount", description: "İade tutarı" },
    ],
  },
  refundRejected: {
    label: "İade Talebi Reddedildi",
    description: "Müşterinin iade talebi reddedilirse müşteriye gönderilir.",
    defaultSubject: "İade Talebi Hakkında — Sipariş #{{order_number}}",
    defaultBody: `Sayın {{customer_name}},

#{{order_number}} numaralı sipariş için iade talebiniz değerlendirildi.

{{reject_reason}}

Bu konuda daha fazla bilgi almak için bizimle iletişime geçebilirsiniz.

VOILÉE`,
    variables: [
      ...ORDER_VARS,
      { key: "reject_reason", description: "Red sebebi" },
    ],
  },

  // ── Müşteri ─────────────────────────────────────────────────────────────────
  customerPasswordReset: {
    label: "Şifre Sıfırlama",
    description: "Müşteri, hesap parolasını sıfırlamak istediğinde müşteriye gönderilir.",
    defaultSubject: "Şifre Sıfırlama — VOILÉE",
    defaultBody: `Sayın {{customer_name}},

Hesabınız için bir şifre sıfırlama talebinde bulunuldu. Aşağıdaki bağlantı 30 dakika geçerlidir.

{{reset_url}}

Bu isteği siz yapmadıysanız bu e-postayı görmezden gelebilirsiniz.

VOILÉE`,
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
    defaultSubject: "VOILÉE'ye Hoş Geldiniz",
    defaultBody: `Sayın {{customer_name}},

VOILÉE'ye hoş geldiniz.

Hesabınız oluşturuldu. Koleksiyonlarımızı keşfedebilir, siparişlerinizi takip edebilir ve daha fazlasını hesabınızdan yönetebilirsiniz.

Teşekkür ederiz.
VOILÉE`,
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
    defaultSubject: "Sepetinizde Bekleyen Parçalar Var",
    defaultBody: `Sayın {{customer_name}},

Sepetinize eklediğiniz parçalar sizi bekliyor. Stoklar sınırlı olduğundan siparişinizi tamamlamanızı öneririz.

VOILÉE`,
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
    defaultSubject: "Siparişiniz Hakkında Ne Düşünüyorsunuz?",
    defaultBody: `Sayın {{customer_name}},

#{{order_number}} numaralı siparişinizi teslim aldığınıza sevindik. Deneyiminizi birkaç kelimeyle paylaşır mısınız? Görüşleriniz bizim için değerli.

VOILÉE`,
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
    defaultSubject: "Takip Ettiğiniz Ürün Tekrar Stokta",
    defaultBody: `Sayın {{customer_name}},

Takip listenize eklediğiniz ürün tekrar stoğa girdi. Kaçırmamak için hızlı olmanızı öneririz.

VOILÉE`,
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
    defaultSubject: "Havale Ödemeniz Bekleniyor — Sipariş #{{order_number}}",
    defaultBody: `Sayın {{customer_name}},

#{{order_number}} numaralı siparişinizin havale ödemesi henüz alınmadı. Siparişinizin işleme alınması için ödemenizi tamamlamanızı rica ederiz.

Banka: {{bank_name}}
IBAN: {{iban}}
Hesap Sahibi: {{account_holder}}

VOILÉE`,
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
    defaultSubject: "Siparişiniz İptal Edildi — Ödeme Alınamadı",
    defaultBody: `Sayın {{customer_name}},

#{{order_number}} numaralı siparişiniz için belirlenen süre içinde havale ödemesi alınamadı. Sipariş otomatik olarak iptal edildi.

Yeniden sipariş vermek isterseniz her zaman buradayız.

VOILÉE`,
    variables: [
      { key: "customer_name", description: "Müşteri adı veya e-postası" },
      { key: "customer_email", description: "Müşteri e-postası" },
      { key: "order_number", description: "Sipariş numarası" },
      { key: "order_total", description: "Sipariş tutarı" },
      { key: "site_name", description: "Mağaza adı" },
    ],
  },
};
