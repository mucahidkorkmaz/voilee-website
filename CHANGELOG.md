# Changelog

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
