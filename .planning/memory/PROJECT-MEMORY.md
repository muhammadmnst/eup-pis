# PROJECT MEMORY — EUP Project Information System
## PT. Energi Unggul Persada

---

## Entry 001 — 2026-04-28
**Phase Covered:** Phase 1 (Foundation) + Phase 2 (Public Portal) + Phase 3 (Admin Panel) + Phase 4 (Photo Management)
**Session Summary:** Full implementation dari inisialisasi hingga fitur foto lightbox berjalan di Docker Development.

---

### 🏛️ Architectural Principles

**1. Project ID — Tidak Boleh Mengandung Karakter URL-Unsafe**
- **Prinsip:** ID yang digunakan sebagai URL segment (`/proyek/[id]`) TIDAK boleh mengandung `/`, `?`, `#`, atau karakter URL-reserved lainnya.
- **Keputusan:** Seed data menggunakan format `seed-spr-2026-001` bukan `seed-SPR/2026/001`.
- **Implikasi:** Saat import data Excel nyata, noSpr harus di-sanitize sebelum dijadikan ID.

**2. NextAuth Middleware — `authorized()` Callback Wajib**
- **Prinsip:** Menggunakan `export { auth as middleware }` dari NextAuth v5 saja TIDAK cukup untuk melindungi route.
- **Keputusan:** Auth config `callbacks.authorized()` wajib diimplementasikan untuk menentukan logika akses per-pathname.
- **Pattern:**
  ```ts
  async authorized({ auth, request }) {
    if (pathname.startsWith('/admin/login')) return true
    if (pathname.startsWith('/admin')) return !!auth?.user
    return true
  }
  ```

**3. Prisma di Alpine Linux — Butuh OpenSSL**
- **Prinsip:** Image `node:20-alpine` tidak menyertakan OpenSSL secara default; Prisma akan crash saat migration/seed.
- **Fix wajib di `Dockerfile.dev`:**
  ```dockerfile
  RUN apk add --no-cache openssl libc6-compat
  ```

**4. Port Conflict — PostgreSQL di Host Windows**
- **Prinsip:** Port `5432` default Postgres sering sudah dipakai oleh container atau service lain di Windows.
- **Keputusan:** DB container di dev environment dipetakan ke port host `5433:5432` (host:container).
- **Catatan:** `DATABASE_URL` di dalam Docker network tetap menggunakan `db:5432` (internal).

**5. Gantt/Time Schedule — Layout Per Bulan Lebih Baik**
- **Prinsip:** Grid horizontal dengan 30+ kolom tidak dapat dibaca di layar normal.
- **Keputusan:** Setiap bulan dirender sebagai blok tabel terpisah yang collapsible.
- **Benefit:** Project multi-bulan (60–90 hari) tetap terbaca; bulan yang tidak relevan bisa di-collapse.

**6. Photo Gallery — Server Component + Client Wrapper Pattern**
- **Prinsip:** Next.js Server Components tidak dapat menggunakan hooks (`useState`, `useEffect`). Lightbox/modal memerlukan state interaktif.
- **Pattern:** Server page fetch data → pass props ke Client Component (`PhotoGalleryClient`) yang mengelola state lightbox.
- **File pattern:** `page.tsx` (server) → `PhotoGalleryClient.tsx` (client, `'use client'`).

**7. Docker Compose — Tidak Perlu `version:` di Compose V2**
- **Prinsip:** Field `version: '3.8'` sudah obsolete di Docker Compose v2+ dan menghasilkan warning.
- **Keputusan:** Hapus field `version` dari semua docker-compose files.

---

### 📁 Struktur File Kunci

```
src/
├── app/
│   ├── (public)/           ← Route group publik, tidak ada auth
│   │   ├── layout.tsx       ← Navbar + Footer publik
│   │   ├── page.tsx         ← Homepage grid project
│   │   └── proyek/[id]/     ← Detail project
│   ├── admin/               ← Protected oleh middleware
│   │   ├── login/           ← Satu-satunya admin route yang public
│   │   ├── layout.tsx       ← Sidebar admin
│   │   └── proyek/[id]/
│   │       ├── edit/        ← Form edit project
│   │       ├── foto/        ← Upload & manage foto
│   │       └── jadwal/      ← Time schedule editor
│   └── api/
│       ├── proyek/          ← CRUD project
│       ├── foto/            ← Upload, delete, set cover
│       └── jadwal/          ← Bulk save schedule, task CRUD
├── components/
│   ├── PhotoGalleryClient.tsx  ← Client wrapper untuk lightbox
│   ├── PhotoLightbox.tsx       ← Lightbox component
│   ├── TimeScheduleGrid.tsx    ← Read-only gantt (public)
│   └── admin/
│       └── JadwalEditor.tsx    ← Interactive gantt editor
└── lib/
    ├── auth.ts    ← NextAuth config + authorized callback
    ├── utils.ts   ← STATUS_CONFIG, DAY_STATUS_CONFIG, helpers
    └── constants.ts
```

---

### 🔑 Credentials & Config

| Item | Value |
|------|-------|
| Admin default | `admin` / `Admin@EUP2026` |
| Dev URL | `http://localhost:3000` |
| DB host port | `5433` (mapped dari container `5432`) |
| Prod port | `8020` (via Nginx) |
| Upload volume | `eup-pis-uploads-dev` (dev) |
| Upload max size | 5MB per file |

---

### ✅ Status per Phase (2026-04-28)

| Phase | Status | Catatan |
|-------|--------|---------|
| 1 — Foundation | ✅ Selesai | Docker, Prisma, schema, seed |
| 2 — Public Portal | ✅ Selesai | Homepage, detail, search/filter |
| 3 — Admin Panel | ✅ Selesai | Login, CRUD project, dashboard |
| 4 — Photo Management | ✅ Selesai | Upload, lightbox, set cover |
| 4b — Time Schedule | ✅ Selesai | Gantt per bulan, collapsible |
| 5 — Production Deploy | 🔲 Belum | Portainer Ubuntu, port 8020 |

---

---

## Entry 002 — 2026-05-02
**Phase Covered:** Phase 5 (Production Deploy) + Milestone 1 Wrap-up
**Session Summary:** Finalisasi konfigurasi produksi, peningkatan limit upload Nginx, pembatasan resource container, dan perbaikan build error pada App Router.

---

### 🏛️ Architectural Principles & Lessons Learned

**1. App Router API Route Config — Deprecated Pattern**
- **Prinsip:** Next.js 14 App Router (`route.ts`) TIDAK lagi mendukung `export const config = { api: { bodyParser: false } }`.
- **Keputusan:** Hapus config tersebut. Gunakan `await request.formData()` secara langsung untuk memproses payload multipart/form-data.
- **Hidden Gotcha:** Menggunakan pola Pages Router di App Router akan menyebabkan build gagal total dengan pesan error yang samar tentang "Page config is deprecated".

**2. Docker Build Cache Corruption**
- **Prinsip:** Menjalankan `npm run build` di host sementara container dev sedang melakukan hot-reloading dapat menyebabkan korupsi pada file `webpack-runtime.js` di dalam folder `.next`.
- **Fix:** Jika muncul error `Cannot find module './XXX.js'` setelah build, hapus folder `.next` secara manual dan restart container.

**3. Nginx Payload Size Consistency**
- **Prinsip:** Limit upload di sisi aplikasi (Prisma/Next.js) harus selaras dengan konfigurasi Reverse Proxy (Nginx).
- **Keputusan:** `client_max_body_size` di Nginx ditingkatkan menjadi `50M` untuk mendukung batch upload dokumen pendukung yang ukurannya lebih besar dari foto biasa.

**4. Resource Governance in Production**
- **Prinsip:** Container tanpa batas resource dapat menyebabkan *host-wide performance degradation* jika terjadi memory leak.
- **Keputusan:** Menambahkan `deploy.resources.limits` (CPU: 1.0, Memory: 1G) pada `docker-compose.yml` sebagai standar keamanan produksi.

**5. Portainer Stacks Workflow**
- **Prinsip:** Portainer Stacks tidak membaca file `.env` secara otomatis dari filesystem.
- **Keputusan:** Environment variables harus di-copy-paste ke UI Portainer menggunakan "Advanced Mode" saat melakukan deploy stack.

---

### ✅ Status per Phase (2026-05-02)

| Phase | Status | Catatan |
|-------|--------|---------|
| 1 — Foundation | ✅ Selesai | Infrastructure solid |
| 2 — Public Portal | ✅ Selesai | Public grid & details |
| 3 — Admin Panel | ✅ Selesai | Protected CRUD |
| 4 — Photo + Schedule | ✅ Selesai | Lightbox & Gantt monthly |
| 5 — Production Deploy | ✅ Selesai | Portainer-ready, limits added |

---

### 🔲 Next Steps (Milestone 2)

1. **PDF Reports** — Export detail project ke format PDF.
2. **Timeline View Enhancement** — Fitur zoom atau filter per kategori pada Gantt.
3. **Multi-role Admin** — Memisahkan akses Super Admin dan Viewer Internal.
4. **Cloud Storage (Optional)** — Migrasi dari local volumes ke MinIO/S3 jika volume data meningkat pesat.

---
*Last updated: 2026-05-02 · Session: 1dcf0bed*
