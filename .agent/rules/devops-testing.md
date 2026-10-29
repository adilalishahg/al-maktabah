# Rules: DevOps, CI/CD Pipeline & Automated Testing

**Standard:** Cloud-Native 12-Factor App + Automated Quality Gates  
**Environments:** Development (Local), Staging (Preview), Production (Vercel / Docker / Node Server)  

---

## 1. Environment Variable Management

1. **Principle of Least Privilege:**
   - Secrets (`MONGODB_URI`, `ADMIN_PASSWORD_HASH`, `JWT_SECRET`) must never be checked into version control.
   - Maintain `.env.example` with sanitized placeholders.
2. **Environment Hierarchy:**
   - `.env.local`: Local developer overrides (ignored by git).
   - `.env.production`: Production environment variables injected via deployment orchestrator.
3. **Required Environment Keys:**
   ```bash
   # MongoDB Atlas Connection URI
   MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/al_maktabah?retryWrites=true&w=majority
   # Node Environment
   NODE_ENV=production
   # Base URL
   NEXT_PUBLIC_SITE_URL=https://almaktabah.org
   ```

---

## 2. CI/CD Automated Quality Gates

Every Pull Request must pass the following three gates before merge:
1. **Gate 1: Static Type Verification (`npm run lint`):**
   - Command: `tsc --noEmit`
   - Must exit with code 0 without any type suppressions (`@ts-ignore` or loose casts).
2. **Gate 2: Next.js Production Build (`npm run build`):**
   - Validates tree-shaking, static page generation, and bundle chunk sizes.
3. **Gate 3: Automated Unit & API Route Tests:**
   - Test suites in `__tests__/` verifying store calculations, isnad serialization, and API CRUD envelopes.

---

## 3. Docker Containerization Standard

Multi-stage production `Dockerfile` template:

```dockerfile
# Stage 1: Dependencies
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml* package-lock.json* ./
RUN npm ci

# Stage 2: Builder
FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

# Stage 3: Runner
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
ENV PORT 3000
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
EXPOSE 3000
CMD ["node", "server.js"]
```

---

## 4. Structured Logging & Observability

1. **Structured JSON Logs:** All server-side route errors in `/api/*` must log structured JSON objects containing timestamp, request route, HTTP method, client IP hash, and stack trace.
2. **Healthcheck Probe:** The `/api/health` endpoint must return database connectivity status (`status: "healthy" | "degraded"`) for container orchestrator readiness and liveness probes.
