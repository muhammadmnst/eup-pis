# Common Pitfalls — Project Information Systems
*Confidence: HIGH (from production experience + research)*

## Infrastructure Pitfalls

### 1. Prisma in Docker — Missing `generate` step
**Problem:** Prisma client not generated before build → runtime crash
**Fix:** Always run `npx prisma generate` before `npm run build` in Dockerfile

### 2. File Uploads — Container Restart Wipes Files
**Problem:** Photos uploaded to container filesystem are lost on restart
**Fix:** ALWAYS mount a named Docker volume for `/app/public/uploads`

### 3. Database Migrations on Production
**Problem:** Forgetting to run migrations after deploy → app crashes
**Fix:** Add `npx prisma migrate deploy` as an entrypoint script before starting app

### 4. NextAuth Secret Missing in Production
**Problem:** Sessions don't work / users get logged out randomly
**Fix:** Set `NEXTAUTH_SECRET` and `NEXTAUTH_URL` correctly in production env

### 5. Windows ↔ Linux Path Issues
**Problem:** Code works on Windows Docker Desktop but fails on Linux Portainer
**Fix:** Use forward slashes in paths, use `path.join()` not string concatenation

---

## Development Pitfalls

### 6. Hot Reload Not Working in Docker (Windows)
**Problem:** Next.js file watcher doesn't detect changes inside Docker on Windows
**Fix:** Add `WATCHPACK_POLLING=true` env var to dev compose file

### 7. PostgreSQL Data Lost on `docker compose down`
**Problem:** `docker compose down -v` deletes volumes → data loss
**Fix:** Always use named volumes (not anonymous), never use `-v` flag carelessly

### 8. `next/image` and Local Upload Storage
**Problem:** Next.js Image Optimization doesn't serve files from `/uploads` by default
**Fix:** Configure `remotePatterns` OR serve from `/public/uploads` with `unoptimized: true`

---

## Application Pitfalls

### 9. Large File Uploads Crashing Next.js API Route
**Problem:** Default Next.js body limit is 4MB → large photos fail silently
**Fix:** Configure `export const config = { api: { bodyParser: false } }` and use `formidable`/`multer`

### 10. N+1 Query Problem
**Problem:** Loading project list + photos triggers one DB query per project
**Fix:** Always use Prisma `include: { photos: { take: 1, where: { isCover: true } } }` for list views

### 11. Public URL Exposure of Admin Routes
**Problem:** Admin routes accessible without auth check
**Fix:** Use Next.js middleware (`middleware.ts`) to protect `/admin/*` routes at edge level

### 12. No Loading States on Admin Forms
**Problem:** Double-submit on slow networks → duplicate data
**Fix:** Disable submit button + show spinner during API calls

---

## Security Pitfalls

### 13. Unrestricted File Upload Types
**Problem:** Attackers upload `.php`, `.exe`, etc.
**Fix:** Validate MIME type AND file extension server-side. Accept only `image/jpeg`, `image/png`, `image/webp`

### 14. Hardcoded Credentials in docker-compose.yml
**Problem:** Database passwords in git history
**Fix:** Use `.env` file (git-ignored) for secrets, reference via `${VAR_NAME}` in compose

---
*Last updated: 2026-04-28*
