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
# Compile seed script for production
RUN npx esbuild prisma/seed.ts --bundle --platform=node --outfile=prisma/seed.js --external:@prisma/client --external:bcryptjs
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

# Stage 3: Runner (ringan)
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Install runtime dependencies
RUN apk add --no-cache libc6-compat openssl wget curl su-exec

RUN addgroup --system --gid 1001 nodejs
RUN adduser  --system --uid 1001 nextjs

# Copy standalone build
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static     ./.next/static
COPY --from=builder /app/public           ./public
COPY --from=builder /app/prisma           ./prisma

# Direktori upload
RUN mkdir -p public/uploads

EXPOSE 3000

# Jalankan migrate, fix permissions, lalu seed, lalu server sebagai user nextjs
ENTRYPOINT ["sh", "-c", "echo 'Fixing permissions...' && chown -R nextjs:nodejs /app && echo 'Starting migrations...' && npx prisma@5.10.0 migrate deploy && echo 'Seeding database...' && node prisma/seed.js || echo 'Seed failed' && echo 'Starting server...' && exec su-exec nextjs node server.js"]
