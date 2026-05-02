# Roadmap — GA Project Information System (GA-PIS)

## Milestone 1: Production-Ready Project Tracker

### Progress Overview

| Phase | Name | Status | Requirements | Estimated |
|-------|------|--------|-------------|-----------|
| 1 | Foundation & Infrastructure | Planned | R01–R05 | 1–2 days |
| 2 | Public Portal | Planned | R06–R09, R21 | 2–3 days |
| 3 | Admin Panel & Auth | Planned | R10–R14, R22 | 2–3 days |
| 4 | Photo Management | Planned | R15–R18 | 1–2 days |
| 5 | Production Deployment | ✅ Selesai | R19–R20 | 1 day |

---

### Phase 1: Foundation & Infrastructure
**Goal:** Setup seluruh fondasi teknis — proyek Next.js, database, ORM, dan Docker — sehingga semua fase berikutnya bisa dibangun di atas fondasi yang solid.

**Requirements:** R01, R02, R03, R04, R05

**Deliverables:**
- [ ] Inisialisasi proyek Next.js 14 + TypeScript + Tailwind CSS + shadcn/ui
- [ ] Setup Prisma dengan koneksi ke PostgreSQL
- [ ] Schema lengkap: `Project`, `Photo`, `StatusLog`, `Admin`
- [ ] `docker-compose.dev.yml` — app (hot reload) + postgres
- [ ] `Dockerfile` multi-stage untuk production
- [ ] `.env.example` dengan semua variabel environment
- [ ] Prisma migration pertama + seed script (atau import data Excel)
- [ ] Health check endpoint `/api/health`
- [ ] Verifikasi: app berjalan di `http://localhost:3000` via Docker Desktop

---

### Phase 2: Public Portal
**Goal:** Stakeholder dan publik dapat mengakses daftar project, detail project, dan melihat status terkini — tanpa login.

**Requirements:** R06, R07, R08, R09, R21

**Deliverables:**
- [ ] Homepage — grid/list project dengan status badge berwarna
- [ ] Header dengan logo GA + navigasi
- [ ] Summary stats bar (Total, On Progress, Completed, On Hold)
- [ ] Search bar (project name / client / location)
- [ ] Filter panel (status, tahun, kategori)
- [ ] Project card dengan: nama, status, progress bar, thumbnail foto, lokasi
- [ ] Project detail page `/projects/[id]`
  - Info lengkap (klien, PIC, nilai kontrak, tanggal, deskripsi)
  - Progress bar visual
  - Status badge + tanggal terakhir update
  - Photo gallery (jika ada foto)
- [ ] Skeleton loading states untuk UX cepat
- [ ] Fully responsive (mobile & desktop)
- [ ] SEO meta tags per halaman

---

### Phase 3: Admin Panel & Authentication
**Goal:** Tim internal dapat login secara aman dan melakukan update data project serta status.

**Requirements:** R10, R11, R12, R13, R14, R22

**Deliverables:**
- [ ] Admin login page `/admin/login` — form + credential auth
- [ ] NextAuth.js setup dengan credential provider + JWT session
- [ ] `middleware.ts` — proteksi semua route `/admin/*`
- [ ] Admin layout dengan sidebar navigasi
- [ ] Admin dashboard `/admin` — stats cards + tabel recent projects
- [ ] Halaman data project `/admin/projects` — tabel dengan sort, filter, pagination
- [ ] Form tambah project baru `/admin/projects/new`
- [ ] Form edit project `/admin/projects/[id]/edit`
  - Semua field project
  - Update status dengan dropdown
  - Update progress (0-100%)
  - Catatan perubahan status
- [ ] Hapus project (dengan konfirmasi)
- [ ] Status history / audit log per project
- [ ] Toast notifications untuk setiap aksi CRUD
- [ ] Admin user seed (default: admin / password)

---

### Phase 4: Photo Management
**Goal:** Admin dapat mengupload foto progress dan hasil project; publik dapat melihatnya sebagai gallery visual.

**Requirements:** R15, R16, R17, R18

**Deliverables:**
- [ ] Upload foto API route — validasi MIME type + ukuran (max 5MB)
- [ ] Upload multiple foto sekaligus (drag & drop atau file picker)
- [ ] Penyimpanan ke Docker named volume (`/app/public/uploads`)
- [ ] Preview foto setelah upload
- [ ] Set foto sebagai cover/thumbnail
- [ ] Hapus foto individual
- [ ] Urutkan foto dengan drag & drop (opsional)
- [ ] Thumbnail auto-resize untuk performa
- [ ] Public gallery view — carousel/lightbox per project
- [ ] Foto cover ditampilkan di project card (homepage)

---

### Phase 5: Production Deployment
**Goal:** Aplikasi dapat di-deploy ke Ubuntu server via Portainer dengan konfigurasi production yang benar dan aman.

**Requirements:** R19, R20

**Deliverables:**
- [ ] `docker-compose.yml` production — app + postgres + nginx
- [ ] Nginx config — reverse proxy ke Next.js, static file serving
- [ ] `docker-compose.prod.yml` — resource limits, restart policies, health checks
- [ ] `.env.production.example` — template semua env vars
- [ ] Entrypoint script — `prisma migrate deploy` + `node server.js`
- [ ] `.dockerignore` yang proper
- [ ] Panduan deploy Portainer (Stacks upload)
- [ ] Verifikasi: app live di server Ubuntu via Portainer

---

## Milestone 2: Enhanced Features (V2)
*Dikerjakan setelah Milestone 1 production-ready dan stabil*

| Phase | Name | Status |
|-------|------|--------|
| 6 | PDF Reports & Timeline View | Backlog |
| 7 | Multi-role Admin & Email Notifications | Backlog |
| 8 | Cloud Storage (MinIO) | Backlog |

---
*Last updated: 2026-04-28*
