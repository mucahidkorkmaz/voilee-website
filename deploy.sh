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
echo "▶ [1/4] Build başlıyor — $BUILD_DATE"
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
echo "▶ [2/4] Stack durduruluyor..."
docker compose down --remove-orphans

echo ""
echo "▶ [3/4] Frontend volume sıfırlanıyor..."
docker volume rm voileecomtr_voilee_frontend 2>/dev/null || true

echo ""
echo "▶ [4/4] Servisler başlatılıyor..."
docker compose up -d postgres
echo "   Postgres bekleniyor..."
sleep 8

docker compose run --rm frontend-sync
docker compose up -d node nginx

echo ""
echo "✓ Deploy tamamlandı — http://localhost"
