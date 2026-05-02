# Stack Research — GA Project Information System
*Confidence: HIGH (verified via web search, 2025)*

## Standard 2025 Stack for Project Information System (Web)

### Frontend Framework
**Next.js 14+ (App Router)** — Industry standard for full-stack React apps in 2025
- Server-side rendering = fast public page loads
- API Routes = built-in backend
- `output: 'standalone'` for optimized Docker image
- Confidence: HIGH

### Language
**TypeScript** — De-facto standard for production Next.js apps
- Type safety for DB models, API responses
- Confidence: HIGH

### Styling
**Tailwind CSS + shadcn/ui**
- shadcn/ui provides unstyled, accessible component primitives
- Tailwind for utility-first custom styling
- SaaS aesthetic achievable with these tools
- Confidence: HIGH

### Database
**PostgreSQL 15+** — User-chosen, widely adopted in 2025
- Excellent for structured project data
- Supports JSON fields for flexible metadata
- Confidence: HIGH

### ORM
**Prisma** — Best-in-class ORM for Next.js + PostgreSQL in 2025
- Type-safe queries auto-generated from schema
- Built-in migration system
- Excellent Docker support
- Confidence: HIGH

### Authentication
**NextAuth.js v5 (Auth.js)** — Standard for Next.js auth
- Credential provider for admin login
- Session management via JWT
- Confidence: HIGH

### File Storage
**Two viable options for Docker environment:**

| Option | Pros | Cons |
|--------|------|------|
| **Local Volume Mount** | Simple, no extra service | No CDN, manual backup |
| **MinIO (S3-compatible)** | S3 API, scales well, UI | Extra Docker service |

**Recommendation:** Local volume mount for V1, MinIO for V2
- Confidence: MEDIUM (depends on photo volume)

### Container Stack
**Docker + Docker Compose** — User-chosen
- Development: Docker Desktop on Windows
- Production: Ubuntu + Portainer Stacks
- Multi-stage Dockerfile with `node:20-alpine`
- `restart: unless-stopped` for production services

### Reverse Proxy (Production)
**Nginx** — Recommended in front of Next.js
- SSL termination
- Static file serving
- Portainer-managed container
- Confidence: HIGH

---

## Recommended Package Versions (2025)
```
next: ^14.2
react: ^18.3
typescript: ^5.4
prisma: ^5.14
@prisma/client: ^5.14
next-auth: ^5.0
tailwindcss: ^3.4
@radix-ui/react-*: ^1.x (via shadcn/ui)
zod: ^3.23
uploadthing OR multer: for file uploads
```

---
*Last updated: 2026-04-28*
