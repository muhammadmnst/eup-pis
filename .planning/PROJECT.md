# EUP Project Information System (EUP-PIS)
## PT. Energi Unggul Persada

## Vision
Sistem informasi berbasis web untuk memantau dan mengelola status seluruh project yang sedang berjalan di **PT. Energi Unggul Persada** tahun 2026. Platform ini menyediakan dua lapisan akses: halaman **publik (view-only)** yang dapat diakses siapa saja untuk melihat progress project secara real-time, dan halaman **admin** terproteksi untuk tim internal melakukan update data, status, dan upload foto progress/hasil project. Dibangun dengan konsep **SaaS modern** — clean, professional, dan scalable.

## Core Value
Dashboard project tracker yang dapat diakses publik secara real-time, dengan kemampuan upload foto sebagai bukti visual progress — sehingga stakeholder eksternal maupun internal selalu mendapat informasi terkini tanpa perlu menghubungi tim secara manual.

## Target Users
- **Stakeholder / Publik** — Melihat status dan progress project tanpa login
- **Tim Admin / PM** — Update data project, status, dan upload foto progress
- **Manajemen** — Overview semua project dalam satu dashboard

## Technical Context

### Konfigurasi Confirmed (USER)
- **Nama Perusahaan:** PT. Energi Unggul Persada
- **Bahasa UI:** Bahasa Indonesia
- **Port Production:** 8020

### Stack (USER-chosen)
- **Frontend**: Next.js 14+ (App Router) + TypeScript — AI-suggested, user approved
- **Styling**: Tailwind CSS + shadcn/ui — UI SaaS modern
- **Database**: PostgreSQL — USER-chosen
- **ORM**: Prisma — AI-suggested
- **Auth**: NextAuth.js (credential-based untuk admin)
- **File Storage**: Local filesystem / cloud (MinIO di Docker) untuk foto
- **Runtime**: Node.js

### Infrastructure (USER-chosen)
- **Development**: Windows + Docker Desktop
- **Production**: Ubuntu Server + Portainer (Docker Compose)
- **Containerization**: Docker + Docker Compose

### Data Source
Based on "DATABASE GA - PROJECT - 2026 (1).xlsx" — existing Excel database yang akan dimigrasikan ke PostgreSQL.

## Requirements

### Active
- [ ] Public dashboard — list & detail semua project (no login required)
- [ ] Admin panel — login terproteksi
- [ ] CRUD project data (nama, deskripsi, status, tanggal, PIC, nilai kontrak, dll)
- [ ] Update status project (Planned / On Progress / Completed / On Hold / Cancelled)
- [ ] Upload foto progress & hasil project (multiple per project)
- [ ] Photo gallery per project
- [ ] Search & filter project (by status, tahun, kategori)
- [ ] Responsive UI — desktop & mobile
- [ ] Docker Compose setup (dev & prod)
- [ ] PostgreSQL database dengan migrations

### Out of Scope (V1)
- Real-time notifications — kompleksitas tinggi, bukan inti
- Multi-tenant — single company system
- Payment / billing — ini bukan SaaS komersial
- Reporting export PDF — bisa dikerjakan V2
- Mobile app native — web responsive sudah cukup

## Key Decisions

| Decision | Source | Rationale | Outcome |
|----------|--------|-----------|---------|
| Next.js App Router | AI-suggested | SSR/SSG untuk public page, API routes untuk admin | Decided |
| PostgreSQL | User | Existing preference, production-ready | Decided |
| Docker Compose | User | Dev=Docker Desktop, Prod=Portainer Ubuntu | Decided |
| Prisma ORM | AI-suggested | Type-safe DB access, migration management | Decided |
| NextAuth.js | AI-suggested | Admin-only auth, simple credential login | Decided |
| shadcn/ui + Tailwind | AI-suggested | SaaS UI concept, modern aesthetic | Decided |
| MinIO / Local Storage | AI-suggested | Photo upload storage dalam Docker | Pending User Decision |

---
*Last updated: 2026-04-28 — Project initialized from Excel database source*
