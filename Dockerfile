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

# ── Frontend build ─────────────────────────────────────────────────────────────
FROM base AS frontend-builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm run build

# ── Backend build ──────────────────────────────────────────────────────────────
# (vite build zaten pnpm run build içinde, esbuild da aynı komutta çalışır)

# ── Production image ───────────────────────────────────────────────────────────
FROM node:22-alpine AS runner
WORKDIR /app

# Sadece production bağımlılıklarını kopyala
COPY package.json pnpm-lock.yaml ./
COPY patches ./patches
RUN corepack enable && pnpm install --frozen-lockfile --prod

# Backend build çıktıları (index.js + esbuild dynamic import chunk'ları)
# Not: dist/public/ nginx tarafından sunulur, buraya kopyalanmaz
COPY --from=frontend-builder /app/dist/*.js ./dist/

# Kullanıcı yetkilerini sınırla — root olarak çalıştırma
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

EXPOSE 3000

CMD ["node", "dist/index.js"]
