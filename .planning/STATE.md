# Project State — EUP Project Information System
## PT. Energi Unggul Persada

## Current Position
**Phase:** 5 — Production Deploy ✅ SELESAI
**Status:** All Milestone 1 Phases Complete
**Last activity:** 2026-05-02 — Milestone 1 completed and verified

## Phase Status

| Phase | Status |
|-------|--------|
| 1 — Foundation | ✅ Selesai |
| 2 — Public Portal | ✅ Selesai |
| 3 — Admin Panel | ✅ Selesai |
| 4 — Photo + Schedule | ✅ Selesai |
| 5 — Production Deploy | ✅ Selesai |

## Key Decisions

| Decision | Phase | Rationale |
|----------|-------|-----------|
| Next.js 14 App Router | Init | SSR untuk public pages |
| PostgreSQL + Prisma | Init | Type-safe, migration management |
| Docker Compose dev+prod | Init | Dev=Windows, Prod=Portainer Ubuntu |
| NextAuth v5 credential | Init | Admin-only simple login |
| Alpine + OpenSSL fix | Phase 1 | `apk add openssl libc6-compat` wajib |
| DB port 5433 (host) | Phase 1 | Hindari konflik port 5432 |
| Seed ID tanpa slash | Phase 1 | URL-safe: `seed-spr-2026-001` bukan `SPR/2026/001` |
| authorized() callback | Phase 3 | Wajib untuk middleware NextAuth v5 |
| Gantt per-bulan | Phase 4 | Lebih rapi untuk project >30 hari |
| Server+Client photo pattern | Phase 4 | Server fetch → Client lightbox state |

## Blockers/Concerns
Tidak ada blocker aktif.

## Confirmed Config
| Item | Value |
|------|-------|
| Perusahaan | PT. Energi Unggul Persada |
| Bahasa UI | Bahasa Indonesia |
| Port Production | 8020 |
| Admin default | admin / Admin@EUP2026 |
| Dev port | 3000 |
| DB host port | 5433 |

---
*Last updated: 2026-05-02 — Milestone 1 Production-Ready ✓*
