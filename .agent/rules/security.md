# Rules: Security Engineering & Defensive Hardening

**Security Level:** Production / Zero-Trust Architecture  
**Standards:** OWASP Top 10 + CIS Benchmarks  

---

## 1. Authentication & Administrative Access

1. **Authentication Gate:** Administrative routes and mutation endpoints (`/admin`, `POST /api/books`, `POST /api/settings`, `DELETE /api/books/[id]`) must be strictly protected.
2. **Session Hardening:**
   - Client session storage must not store unencrypted passwords or secrets.
   - For production environments, migrate from `sessionStorage` flags to cryptographically signed, `HttpOnly`, `SameSite=Strict`, `Secure` JWT session cookies.
3. **Default Credentials Rule:** Never hardcode administrator credentials in client-facing components. In production, pull verified admin hashes from environment variables (`ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH`).

---

## 2. Input Validation & Injection Prevention

1. **NoSQL Injection:** Never pass raw client JSON objects directly into Mongoose filter clauses (e.g. `BookModel.find(req.body)`). Always whitelist query keys (`q`, `category`, `admin`) and validate strings against injection payloads.
2. **Regex Query Sanitation:** When performing case-insensitive text search via `$regex`, escape special regex metacharacters (`.*+?^${}()|[]\`) to avoid ReDoS (Regular Expression Denial of Service).
3. **Cross-Site Scripting (XSS):**
   - React automatically escapes interpolated JSX strings.
   - Never use `dangerouslySetInnerHTML` unless rendering sanitized SVG calligraphic watermarks from a trusted internal source.
   - For user-supplied HTML/markdown annotations, run output through DOMPurify or equivalent sanitizer before rendering.

---

## 3. Safe File Uploads & PDF Parsing

1. **MIME Type & Magic Number Verification:** Never trust client-provided file extensions (`.pdf`). Inspect binary magic bytes (`%PDF-`) before passing to PDF parsing engines.
2. **File Size Limits:** Strictly enforce a 50MB maximum payload limit on manuscript PDF uploads to prevent memory-exhaustion DoS attacks.
3. **Sandboxed PDF Execution:** Ensure `pdfjs-dist` or `pdf-parse` runs in an isolated worker or unprivileged execution context without filesystem write permissions.

---

## 4. HTTP Headers & Content Security Policy (CSP)

Implement standard security headers via Next.js middleware or `next.config.ts`:
- `X-Frame-Options: SAMEORIGIN` (prevents clickjacking attacks).
- `X-Content-Type-Options: nosniff` (prevents MIME type sniffing).
- `Referrer-Policy: strict-origin-when-cross-origin`.
- `Content-Security-Policy`:
  - `default-src 'self';`
  - `img-src 'self' data: https://lh3.googleusercontent.com https://images.unsplash.com;`
  - `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;`
  - `font-src 'self' https://fonts.gstatic.com;`
