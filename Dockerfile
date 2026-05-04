# ============================================
# Dockerfile — Production (Multi-stage build)
# ============================================

# Stage 1: Dependencies
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

# Stage 3: Runner (ringan)
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Install runtime dependencies
RUN apk add --no-cache libc6-compat openssl wget curl

RUN addgroup --system --gid 1001 nodejs
RUN adduser  --system --uid 1001 nextjs

# Copy standalone build
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static     ./.next/static
COPY --from=builder /app/public           ./public
COPY --from=builder /app/prisma           ./prisma

# Direktori upload
RUN mkdir -p public/uploads && chown -R nextjs:nodejs /app

USER nextjs
EXPOSE 3000

# Jalankan migrate dulu, lalu server
ENTRYPOINT ["sh", "-c", "echo 'Starting migrations...' && npx prisma@5.10.0 migrate deploy && echo 'Migrations completed.' && node server.js"]
