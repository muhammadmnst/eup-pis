# Architecture Research — EUP Project Information System
## PT. Energi Unggul Persada
*Confidence: HIGH (verified against Next.js, Docker, Portainer docs 2025)*

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                   BROWSER (Client)                          │
│         Public Pages      │      Admin Panel (/admin/*)     │
└───────────────────────────┼─────────────────────────────────┘
                            │ HTTPS
                  ┌─────────▼──────────┐
                  │    Nginx (Reverse  │  ← SSL termination
                  │       Proxy)       │     Port 80/443
                  └─────────┬──────────┘
                            │ HTTP internal
                  ┌─────────▼──────────┐
                  │   Next.js App      │  ← Port 3000
                  │  (App Router +     │     SSR + API Routes
                  │   API Routes)      │
                  └──────┬──────┬──────┘
                         │      │
              ┌──────────▼─┐  ┌─▼────────────┐
              │ PostgreSQL │  │ /uploads Vol  │
              │  (Port     │  │ (Photo Files) │
              │   5432)    │  │               │
              └────────────┘  └───────────────┘
```

## Next.js App Structure

```
src/
├── app/
│   ├── (public)/              ← Public layout (no auth)
│   │   ├── page.tsx           ← Project list / homepage
│   │   ├── projects/[id]/     ← Project detail page
│   │   └── layout.tsx
│   ├── admin/                 ← Protected admin section
│   │   ├── login/page.tsx
│   │   ├── dashboard/page.tsx
│   │   ├── projects/
│   │   │   ├── page.tsx       ← Project data table
│   │   │   ├── new/page.tsx
│   │   │   └── [id]/edit/
│   │   └── layout.tsx         ← Auth guard middleware
│   └── api/
│       ├── projects/          ← CRUD API
│       ├── photos/            ← Upload API
│       └── auth/              ← NextAuth endpoints
├── components/
│   ├── ui/                    ← shadcn/ui base components
│   ├── public/                ← Public-facing components
│   └── admin/                 ← Admin-only components
├── lib/
│   ├── db.ts                  ← Prisma client
│   ├── auth.ts                ← NextAuth config
│   └── utils.ts
└── prisma/
    ├── schema.prisma
    └── migrations/
```

## Database Schema (Prisma) — CONFIRMED dari Excel

```prisma
// ✅ Field confirmed dari screenshot Excel 2026-04-28
model Project {
  id             String      @id @default(cuid())
  name           String      // Project Name
  position       String?     // Position / Plant
  startDate      DateTime?   // Start Date
  pic            String?     // PIC (Report)
  vendor         String?     // Vendor / Pelaksana
  vendorPhone    String?     // Phone
  address        String?     // Street Address
  noSpr          String?     // NO/SPR
  correlatedDate DateTime?   // Correlated Date
  status         Status      @default(PLANNED) // Status Pengerjaan
  remark         String?     // Remark
  progress       Int         @default(0)  // 0-100% (ditambahkan untuk web)
  year           Int         @default(2026)
  photos         Photo[]
  tasks          Task[]      // ← Time schedule tasks
  statusHistory  StatusLog[]
  createdAt      DateTime    @default(now())
  updatedAt      DateTime    @updatedAt
}

// Time Schedule: baris pekerjaan per project
model Task {
  id        String          @id @default(cuid())
  projectId String
  project   Project         @relation(fields: [projectId], references: [id], onDelete: Cascade)
  name      String          // Nama pekerjaan: "ACP Desain Wall 5R"
  order     Int             @default(0)
  schedule  DailySchedule[]
  createdAt DateTime        @default(now())
  updatedAt DateTime        @updatedAt
}

// Time Schedule: status per hari per task
model DailySchedule {
  id        String    @id @default(cuid())
  taskId    String
  task      Task      @relation(fields: [taskId], references: [id], onDelete: Cascade)
  date      DateTime  // Tanggal spesifik
  dayNumber Int       // Urutan hari (1, 2, 3...)
  dayStatus DayStatus @default(EMPTY)
  note      String?
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt

  @@unique([taskId, date])
}

model Photo {
  id        String   @id @default(cuid())
  projectId String
  project   Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  filename  String
  url       String
  caption   String?
  isCover   Boolean  @default(false)
  order     Int      @default(0)
  createdAt DateTime @default(now())
}

model StatusLog {
  id        String   @id @default(cuid())
  projectId String
  project   Project  @relation(fields: [projectId], references: [id])
  oldStatus Status?
  newStatus Status
  note      String?
  changedBy String?
  changedAt DateTime @default(now())
}

model Admin {
  id           String   @id @default(cuid())
  username     String   @unique
  passwordHash String
  createdAt    DateTime @default(now())
}

enum Status {
  PLANNED       // Direncanakan
  ON_PROGRESS   // Sedang Dikerjakan
  COMPLETED     // Selesai
  ON_HOLD       // Ditunda
  CANCELLED     // Dibatalkan
}

enum DayStatus {
  WORK      // W — Biru   → Hari kerja aktif
  REST      // R — Kuning → Hari istirahat/libur
  TROUBLE   // T — Teal   → Ada masalah/kendala
  CUSTOM1   //   — Abu    → Custom 1
  CUSTOM2   //   — Coklat → Custom 2
  EMPTY     //   — Hijau  → Tidak ada status
}
```

## Docker Compose Structure

### Development (docker-compose.dev.yml)
```yaml
services:
  app:
    build: { context: ., dockerfile: Dockerfile.dev }
    volumes: [".:/app", "/app/node_modules", "uploads:/app/public/uploads"]
    ports: ["3000:3000"]
    environment:
      - DATABASE_URL=postgresql://eupadmin:password@db:5432/eup_pis
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
      - WATCHPACK_POLLING=true  # wajib untuk Windows Docker Desktop
    depends_on: [db]

  db:
    image: postgres:15-alpine
    ports: ["5432:5432"]
    volumes: [pgdata_dev:/var/lib/postgresql/data]
    environment:
      - POSTGRES_DB=eup_pis
      - POSTGRES_USER=eupadmin
      - POSTGRES_PASSWORD=password

volumes:
  pgdata_dev:
  uploads:
```

### Production (docker-compose.yml) — Port 8020
```yaml
services:
  nginx:
    image: nginx:alpine
    ports: ["8020:80"]   # ← PORT PRODUCTION: 8020
    volumes: [./nginx/default.conf:/etc/nginx/conf.d/default.conf]
    depends_on: [app]
    restart: unless-stopped

  app:
    image: eup-pis:latest
    restart: unless-stopped
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
      - NEXTAUTH_URL=${NEXTAUTH_URL}  # http://SERVER_IP:8020
    volumes: [uploads:/app/public/uploads]
    depends_on: [db]

  db:
    image: postgres:15-alpine
    restart: unless-stopped
    volumes: [pgdata:/var/lib/postgresql/data]
    environment:
      - POSTGRES_DB=${POSTGRES_DB}
      - POSTGRES_USER=${POSTGRES_USER}
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}

volumes:
  pgdata:
  uploads:
```

## Multi-stage Dockerfile (Production)

```dockerfile
# Stage 1: Install & Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

# Stage 2: Production Runner
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup -S nodejs && adduser -S nextjs -G nodejs
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
```

---
*Last updated: 2026-04-28 — Confidence: HIGH*
