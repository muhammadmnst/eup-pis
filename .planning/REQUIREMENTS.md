# Requirements — EUP Project Information System (EUP-PIS)
## PT. Energi Unggul Persada

## Overview
Sistem informasi web untuk monitoring dan pengelolaan status project PT. Energi Unggul Persada tahun 2026.
Dua lapisan akses: **publik (read-only)** dan **admin (full CRUD + upload foto)**.
Stack: Next.js 14 + PostgreSQL + Prisma + Docker.

---

## V1 — Must Have
*Sistem tidak berfungsi tanpa fitur-fitur ini.*

| ID | Requirement | Phase | Status |
|----|-------------|-------|--------|
| R01 | Setup proyek Next.js 14 + TypeScript + Tailwind + shadcn/ui | 1 | Planned |
| R02 | Docker Compose untuk development (app + postgres) | 1 | Planned |
| R03 | Dockerfile multi-stage untuk production | 1 | Planned |
| R04 | Prisma schema — model Project, Photo, StatusLog, Admin | 1 | Planned |
| R05 | Database migration & seeding (data dari Excel) | 1 | Planned |
| R06 | Public homepage — daftar project dengan status badge & filter | 2 | Planned |
| R07 | Public project detail page — info lengkap + gallery foto | 2 | Planned |
| R08 | Search & filter project (status, tahun, kategori) | 2 | Planned |
| R09 | Stats summary bar — total project, in progress, completed | 2 | Planned |
| R10 | Admin login page (credential-based via NextAuth.js) | 3 | Planned |
| R11 | Next.js middleware auth guard untuk `/admin/*` routes | 3 | Planned |
| R12 | Admin dashboard — overview stats + recent activity | 3 | Planned |
| R13 | Admin CRUD project (create, read, update, delete) | 3 | Planned |
| R14 | Update status project + progress percentage | 3 | Planned |
| R15 | Upload foto multiple per project (JPEG/PNG/WebP, max 5MB each) | 4 | Planned |
| R16 | Kelola foto — set thumbnail cover, hapus foto | 4 | Planned |
| R17 | Photo gallery publik (carousel/lightbox view) | 4 | Planned |
| R18 | Docker volume untuk persistent photo storage | 4 | Planned |
| R19 | Docker Compose production (app + postgres + nginx) | 5 | Planned |
| R20 | Environment config (.env.example, .env.production template) | 5 | Planned |
| R21 | Responsive UI — mobile & desktop | 2 | Planned |
| R22 | Status history / audit log per project | 3 | Planned |
| R23 | Time Schedule — Gantt grid per project (task × hari) | 3 | Planned |
| R24 | Admin: kelola task dalam Time Schedule (tambah, edit, hapus baris) | 3 | Planned |
| R25 | Admin: update status harian per task (W/R/T/Custom1/Custom2) | 3 | Planned |
| R26 | Publik: tampilan Time Schedule read-only di halaman detail project | 2 | Planned |
| R27 | Time Schedule: support scroll horizontal untuk banyak hari | 2 | Planned |
| R28 | Time Schedule: import data dari Excel (seed awal) | 1 | Planned |

---

## V2 — Nice to Have
*Differentiator setelah V1 stabil.*

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| R30 | Export laporan PDF per project | High | Backlog |
| R31 | Timeline / Gantt chart view | High | Backlog |
| R32 | MinIO / S3 cloud storage untuk foto | Medium | Backlog |
| R33 | Multi-user admin dengan role (superadmin / editor) | Medium | Backlog |
| R34 | Email notifikasi perubahan status | Medium | Backlog |
| R35 | Dark mode UI | Low | Backlog |
| R36 | API publik (JSON endpoint) untuk integrasi pihak ketiga | Low | Backlog |
| R37 | Comment / feedback publik per project | Low | Backlog |

---

## Out of Scope (V1)
- Mobile app native (iOS/Android) — web responsive sudah cukup untuk V1
- Multi-tenant / multi-perusahaan — single company system
- Payment / billing — bukan SaaS komersial
- Real-time websocket updates — polling atau SSR cukup untuk V1
- AI / predictive analytics — terlalu kompleks untuk V1

---

## Data Model (Confirmed dari Excel)

Berdasarkan screenshot kolom file `DATABASE GA - PROJECT - 2026 (1).xlsx`:

### Sheet 1: Data Project
| Kolom Excel | Field DB | Type | Keterangan |
|-------------|----------|------|------------|
| Project Name | `name` | String | Nama project |
| Position / Plant | `position` | String? | Posisi / plant lokasi |
| Start Date | `startDate` | DateTime? | Tanggal mulai |
| PIC (Report) | `pic` | String? | Person In Charge |
| Vendor / Pelaksana | `vendor` | String? | Kontraktor / pelaksana |
| Phone | `vendorPhone` | String? | No. telp vendor |
| Street Address | `address` | String? | Alamat lengkap |
| NO/SPR | `noSpr` | String? | Nomor SPR / dokumen |
| Correlated Date | `correlatedDate` | DateTime? | Tanggal korelasi / selesai |
| Status Pengerjaan | `status` | Enum | Status project |
| Remark | `remark` | String? | Catatan tambahan |

### Sheet 2: Time Schedule (BARU — Confirmed 2026-04-28)
| Elemen | Field DB | Keterangan |
|--------|----------|------------|
| Nama Pekerjaan (baris) | `Task.name` | Sub-task per project |
| Hari ke-N (kolom) | `DailySchedule.dayNumber` | Urutan hari (1,2,3...) |
| Tanggal spesifik | `DailySchedule.date` | Pemetaan ke tanggal nyata |
| W (Work) — biru | `DayStatus.WORK` | Hari kerja aktif |
| R (Rest) — kuning | `DayStatus.REST` | Hari istirahat/libur |
| T (Trouble) — teal | `DayStatus.TROUBLE` | Ada masalah/kendala |
| Custom 1 — abu | `DayStatus.CUSTOM1` | Status custom 1 |
| Custom 2 — coklat | `DayStatus.CUSTOM2` | Status custom 2 |
| (kosong) — hijau | `DayStatus.EMPTY` | Tidak ada status |

> ✅ **Confirmed dari screenshot Excel — 2026-04-28**

---
*Last updated: 2026-04-28*
