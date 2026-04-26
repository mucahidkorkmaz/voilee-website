# Changelog

## 3.2.0 — 2026-04-27

### Mağaza ayarları ve kalıcılık

- **Site logosu:** Şemada `siteLogoUrl` alanı mevcut PostgreSQL kolonu `logoUrl` ile eşlendi; yönetim paneli ve `settings.update` mutasyonu aynı isimle hizalandı.
- **`upsertStoreSettings`:** `undefined` değerli alanlar güncelleme/insert payload’ından çıkarılıyor; kısmi kayıtların diğer kolonları (ör. favicon, logo, banka) yanlışlıkla silinmesi engellendi.
- **Kaydet akışı:** Ayarlar başarıyla kaydedildiğinde `dirty` bayrağı sıfırlanıyor (mutasyon `onSuccess`); favicon/logo yüklemesi sonrası kayıt davranışı netleştirildi.
- **Banka bilgileri:** `storeSettings` için `bankName`, `iban`, `accountHolder` (migration 0012); Zod input, form state, Yasal sekmesinde düzenleme alanları ve API uyumu.

### Genel API

- **`GET /api/v1/store-settings`:** `siteLogoUrl` alanı; geriye dönük uyumluluk için `logoUrl` aynı değerle dönüyor. Navbar ve Footer önce `siteLogoUrl` okuyor.

### Terk edilen sepetler

- **Veritabanı:** `abandonedCarts` tablosu (migration 0011), oturum / müşteri / sepet özeti ve hatırlatma e-postası zaman damgası.
- **Yönetim paneli:** Terk sepetler listesi ve hatırlatma gönderimi; admin router entegrasyonu.
- **Sepet:** İstemci ve sunucu tarafı sepet senkronu / `cart` router ile checkout ile uyum.

### Siparişler ve müşteri bilgisi

- **Sipariş satırı:** `cargoCompany`, `deliveryMethod`, müşteri iletişim alanları (`customerEmail`, `customerName`, `customerPhone`), teslimat şehri, sipariş notları (migration 0012).
- **Admin:** Sipariş yönetimi ve ilgili DB katmanı güncellemeleri; Paraşüt entegrasyonu tarafında ilgili iyileştirmeler.

### E-posta ve iade

- **`server/_core/email.ts`:** Şablon ve otomasyon e-postalarında genişletmeler (banka / mağaza verisi kullanımı vb.).
- **E-posta şablonları yönetimi:** `MCEmailTemplates` güncellemeleri.
- **İadeler:** Admin iade akışında mağaza ayarları ve e-posta ile uyumlu düzenlemeler.

### Kimlik doğrulama ve sabitler

- **`userAuth` / `shared/const`:** Oturum ve hata mesajları ile uyumlu ince ayarlar.

**Dağıtım:** Üretimde `0011_abandoned_carts.sql` ve `0012_order_customer_cargo_bank.sql` migration’larını (veya proje standartlarına uygun eşdeğer) uygulayın.

---

## 1.1.0 — 2026-04-20

### Mağaza ve site ayarları

- **Sosyal medya:** `storeSettings` şemasına YouTube, TikTok, Pinterest, LinkedIn, Snapchat, WhatsApp ve Telegram URL alanları eklendi; yönetim panelinde (Mağaza Ayarları) tüm platformlar için giriş alanları.
- **Genel API:** `GET /api/v1/store-settings` — mağaza adı, iletişim bilgisi ve sosyal/favicon alanlarını (kimlik doğrulama olmadan) döndürür.
- **Footer:** Sosyal ikonlar ve linkler bu endpoint’ten okunur; yalnızca dolu olan platformlar gösterilir. WhatsApp URL’si varsa Destek bölümünde WhatsApp satırı çıkar; sahte `#` linkleri kaldırıldı.

### Favicon (sekme ikonu)

- **Veritabanı:** `faviconUrl` alanı (`storeSettings`).
- **Yönetim paneli:** Favicon için dosya yükleme (`/api/upload`, admin); önizleme ve kaldır butonu.
- **Ön yüz:** `client/public/favicon.png` (şeffaf yer tutucu), `index.html` içinde erken yükleme script’i ile DB’deki favicon uygulanır.
- **Sunucu:** `GET /favicon.ico` → 204 (tarayıcının varsayılan harf ikonunu tetiklememesi için).
- **Yükleme:** `.ico` MIME tipleri upload’a eklendi.

### Diğer

- Vite dev proxy: `/favicon.ico` → backend (Express).
- `pnpm-lock.yaml` ve çeşitli UI/yönetim paneli güncellemeleri bu sürümle birlikte.

**Dağıtım notu:** Şema değişiklikleri için üretimde `npm run db:push` (veya eşdeğer migration) çalıştırın. Docker imajı `docker compose build` ile üretilir; statik dosyalar için `pnpm build` sonrası `dist/public` Nginx’e mount edilir.
