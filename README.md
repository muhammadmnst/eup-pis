# EUP Project Information System

Sistem informasi monitoring project **PT. Energi Unggul Persada** 2026.

## Stack
- **Next.js 14** (App Router) + TypeScript
- **PostgreSQL 15** + Prisma ORM
- **NextAuth v5** (autentikasi admin)
- **Docker** (dev: Docker Desktop Windows | prod: Portainer Ubuntu)
- **Nginx** sebagai reverse proxy (port **8020**)

---

## 🚀 Cara Menjalankan (Development)

### Prasyarat
- Docker Desktop terinstall dan berjalan
- Git

### Langkah

```bash
# 1. Clone dan masuk direktori
cd c:\Antigravity\GA

# 2. Salin environment file
copy .env.example .env.local

# 3. Jalankan dengan Docker Compose
docker compose -f docker-compose.dev.yml up -d --build

# 4. Tunggu sampai DB healthy, lalu jalankan migrasi
docker compose -f docker-compose.dev.yml exec app npx prisma migrate dev --name init
docker compose -f docker-compose.dev.yml exec app npm run db:seed

# 5. Buka di browser
# http://localhost:3000         ← Portal publik
# http://localhost:3000/admin   ← Admin panel
```

### Login Admin Default
| Username | Password |
|----------|----------|
| `admin` | `Admin@EUP2026` |

---

## 📁 Struktur Project

```
├── src/
│   ├── app/
│   │   ├── (public)/          ← Halaman publik
│   │   │   ├── page.tsx        ← Homepage
│   │   │   └── proyek/[id]/    ← Detail project
│   │   ├── admin/              ← Panel admin (protected)
│   │   │   ├── login/          ← Halaman login
│   │   │   ├── page.tsx        ← Dashboard
│   │   │   └── proyek/         ← CRUD project
│   │   └── api/                ← API routes
│   │       ├── proyek/         ← CRUD project API
│   │       ├── foto/           ← Upload & manage foto
│   │       └── jadwal/         ← Time schedule API
│   ├── components/
│   │   ├── StatusBadge.tsx
│   │   ├── ProgressBar.tsx
│   │   ├── TimeScheduleGrid.tsx
│   │   └── admin/
│   │       ├── ProjectForm.tsx
│   │       ├── FotoManager.tsx
│   │       ├── JadwalEditor.tsx
│   │       └── DeleteProjectButton.tsx
│   └── lib/
│       ├── db.ts              ← Prisma singleton
│       ├── auth.ts            ← NextAuth config
│       ├── utils.ts           ← Helpers + STATUS_CONFIG
│       └── constants.ts       ← App constants
├── prisma/
│   ├── schema.prisma          ← Data model
│   └── seed.ts                ← Data awal
├── nginx/
│   └── default.conf           ← Reverse proxy config
├── Dockerfile                 ← Production build
├── Dockerfile.dev             ← Development
├── docker-compose.yml         ← Production (port 8020)
└── docker-compose.dev.yml     ← Development (port 3000)
```

---

## 🌐 Deploy Production (Portainer)

Untuk panduan detail instalasi menggunakan Git dan Portainer Stacks, silakan baca:
👉 **[Panduan Deploy Portainer](DEPLOY-PORTAINER.md)**

Ringkasan:
1. Push kode ke Repository Git (GitHub/GitLab).
2. Di Portainer → **Stacks** → **Add Stack**.
3. Pilih **Repository** dan masukkan URL Git Anda.
4. Masukkan **Environment Variables** (lihat `.env.production.example`).
5. Klik **Deploy**. Aplikasi akan berjalan di port **8020**.


## 🗄️ Database Commands

```bash
# Buat migrasi baru
docker compose -f docker-compose.dev.yml exec app npx prisma migrate dev --name nama_migrasi

# Reset DB + seed ulang
docker compose -f docker-compose.dev.yml exec app npx prisma migrate reset

# Buka Prisma Studio
docker compose -f docker-compose.dev.yml exec app npx prisma studio
```

---

## 📊 Fitur

| Fitur | Publik | Admin |
|-------|--------|-------|
| Lihat daftar project | ✅ | ✅ |
| Search & filter status | ✅ | ✅ |
| Detail project | ✅ | ✅ |
| Time Schedule Gantt | ✅ (read) | ✅ (edit) |
| Gallery foto | ✅ (read) | ✅ (upload/hapus) |
| Tambah/edit project | ❌ | ✅ |
| Update status & progress | ❌ | ✅ |
| Riwayat status | ✅ | ✅ |
