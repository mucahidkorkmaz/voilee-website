FROM node:22-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# ── Bağımlılıklar ──────────────────────────────────────────────────────────────
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
COPY patches ./patches
RUN pnpm install --frozen-lockfile

# ── Frontend + Backend build ────────────────────────────────────────────────────
# COPY . . her zaman tüm kaynak kodu kopyalar; cache sorununu önlemek için
# --no-cache ile build alın ya da aşağıdaki ARG CACHE_BUST tekniğini kullanın.
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
# Kaynak dosyaları ayrı katmanlarda kopyala — sadece değişen katman yeniden build edilir
COPY package.json pnpm-lock.yaml tsconfig*.json vite.config.* ./
COPY patches ./patches
COPY drizzle ./drizzle
COPY shared ./shared
COPY client ./client
COPY server ./server
# Cache'i kırmak için build zamanı argümanı — docker compose build node ile otomatik değişir
ARG BUILD_DATE
RUN echo "Build date: ${BUILD_DATE}" && pnpm run build

# ── Production image ────────────────────────────────────────────────────────────
FROM node:22-alpine AS runner
WORKDIR /app

# Sadece production bağımlılıklarını kopyala
COPY package.json pnpm-lock.yaml ./
COPY patches ./patches
RUN corepack enable && pnpm install --frozen-lockfile --prod

# Backend JS dosyaları (esbuild çıktısı)
COPY --from=builder /app/dist/*.js ./dist/

# Frontend static dosyaları (vite build çıktısı) — nginx /dist/public'i sunar
COPY --from=builder /app/dist/public ./dist/public

# Drizzle schema (runtime'da gerekirse)
COPY --from=builder /app/drizzle ./drizzle

# Yetki kısıtla
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

EXPOSE 3000

CMD ["node", "dist/index.js"]
