#!/bin/sh
# deploy.sh — Güncel kodu Docker'a yükler, cache sorunu olmaz
#
# Kullanım:
#   ./deploy.sh          → build + deploy
#   ./deploy.sh --build  → yalnızca build (deploy etme)

set -e

# Her build'de benzersiz tarih damgası → Docker cache kesinlikle kırılır
export BUILD_DATE=$(date -u +"%Y%m%dT%H%M%SZ")

echo ""
echo "▶ Build tarihi: $BUILD_DATE"
echo ""

# Cache kullanmadan yeniden build al
docker compose build \
  --no-cache \
  --build-arg BUILD_DATE="$BUILD_DATE" \
  node frontend-sync

if [ "$1" = "--build" ]; then
  echo ""
  echo "✓ Build tamamlandı (deploy atlandı)"
  exit 0
fi

echo ""
echo "▶ Frontend volume sıfırlanıyor..."
docker volume rm voilee_com_tr_voilee_frontend 2>/dev/null || true
docker volume rm voilee-frontend 2>/dev/null || true
docker volume rm voilee_frontend 2>/dev/null || true

echo ""
echo "▶ Servisler yeniden başlatılıyor..."
docker compose up -d --force-recreate node frontend-sync nginx

echo ""
echo "▶ Frontend dosyaları kopyalanıyor (sync bekleniyor)..."
sleep 3
docker compose logs frontend-sync

echo ""
echo "✓ Deploy tamamlandı — http://localhost"
