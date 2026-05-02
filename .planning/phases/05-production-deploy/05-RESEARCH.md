# Phase 5: Production Deployment — Research

## Implementation Approach
Since `docker-compose.yml`, `Dockerfile`, `.env.production.example`, and Nginx config were already bootstrapped in Phase 1 to ensure architectural soundness, Phase 5 focuses on finalizing the production readiness, applying resource constraints, fixing potential bottlenecks (like Nginx upload limits for batch file uploads), and providing a comprehensive guide for Portainer deployment.

## Libraries & Tools
| Tool | Purpose | Why | Confidence | Source |
|------|---------|-----|------------|--------|
| Docker Compose | Orchestration | V2 syntax is modern and supported natively by Portainer | HIGH | Official Docs |
| Nginx | Reverse Proxy | High performance, handles static files /uploads/ directly without hitting Node.js | HIGH | Official Docs |
| Portainer | Deployment UI | Requested by user in config, standard for simple container management | HIGH | Official Docs |

## Patterns to Follow
- **Resource Limits**: Add `deploy.resources.limits` to the Node.js application and PostgreSQL to prevent OOM (Out of Memory) crashes from affecting the entire host machine.
- **Client Max Body Size**: Next.js limits requests, but Nginx acts as the first gate. Since we allow uploading multiple documents (up to 10MB each), batch uploads of 5 files can reach 50MB. We must increase Nginx `client_max_body_size` to `50M` to prevent HTTP 413 Payload Too Large errors.
- **Standalone Build**: Next.js `output: 'standalone'` is already configured in `next.config.js`.

## Pitfalls to Avoid
- **Batch Upload Failures**: If a user selects 10 photos or 5 PDFs, the total payload can easily exceed 10MB.
  - *Prevention*: Set `client_max_body_size 50M;` in Nginx config.
- **Portainer Stack Environment Variables**: If `.env` is not handled correctly in Portainer, the DB won't start.
  - *Prevention*: Provide a clear `DEPLOY-PORTAINER.md` guide explaining how to paste the `.env` contents into the Portainer "Environment Variables" section.

## Key References
- [Next.js Docker Deployment](https://nextjs.org/docs/pages/building-your-application/deploying#docker-image)
- [Portainer Stacks](https://docs.portainer.io/user/docker/stacks/add)

---
*Researched: 2026-05-02*
