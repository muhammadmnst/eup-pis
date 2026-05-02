# Research Summary — GA Project Information System
*Completed: 2026-04-28*

## Key Findings

### Stack Decision (Confidence: HIGH)
| Layer | Choice | Confidence |
|-------|--------|-----------|
| Framework | Next.js 14 App Router + TypeScript | HIGH |
| Styling | Tailwind CSS + shadcn/ui | HIGH |
| Database | PostgreSQL 15 | HIGH (user-chosen) |
| ORM | Prisma | HIGH |
| Auth | NextAuth.js v5 | HIGH |
| File Storage | Local Docker Volume (V1) | HIGH |
| Containerization | Docker + Docker Compose | HIGH (user-chosen) |
| Production | Ubuntu + Portainer + Nginx | HIGH (user-chosen) |

### Critical Architecture Insights
1. **Standalone output mode** in Next.js is mandatory for optimized Docker images
2. **Named Docker volumes** must be used for both database AND photo uploads
3. **`WATCHPACK_POLLING=true`** needed for hot reload in Docker on Windows
4. **Prisma generate + migrate** must be part of Docker build and startup process
5. **Next.js middleware** is the correct layer to protect `/admin/*` routes

### Must-Have Features (Table Stakes)
- Public project list with status badges + search/filter
- Project detail with photo gallery
- Admin login → CRUD projects → upload photos
- Status progression tracking
- Mobile responsive

### Top Risks to Mitigate
| Risk | Mitigation |
|------|-----------|
| File uploads lost on restart | Named Docker volume for `/uploads` |
| Prisma not generated in Docker | Add `prisma generate` to Dockerfile |
| Admin routes exposed | Next.js middleware auth guard |
| Windows→Linux path issues | Always use `path.join()`, test in Docker |
| Large photo upload failure | Disable body parser, use formidable |

### Photo Storage Decision
- **V1**: Local filesystem via Docker named volume — simple, no extra service
- **V2**: MinIO (S3-compatible) — if storage needs grow or CDN needed
- **Recommendation**: Start with local volume, abstract behind a storage service layer

---
*All findings are HIGH confidence unless noted. Sources: Next.js docs, Prisma docs, Docker docs, Portainer docs.*
