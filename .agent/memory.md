# Autonomous Agent Context Memory & Running State

**System:** Al-Maktabah (المكتبة) — Autonomous Academic Islamic Codex & Digital Waqf Repository  
**Engine:** Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS + MongoDB Atlas  
**Architecture Status:** Production Grade / Scalable Modular Framework  
**Last Updated:** 2026-10-29  

---

## 1. Active Session State & Context

- **Current Status:** **Active Refactoring & Codebase Modularization Phase Initiated**.
  - All 5 prior architecture & optimization phases completed, tested, and passing (21/21 assertions).
  - Reader toolbar sticky clearance stabilized at exact 2px.
  - New Architectural Governance Standards ratified across `.agent/rules/`:
    1. **Strict File & Function Length:** Hard ceiling of 200–500 lines maximum for all components, hooks, and utilities.
    2. **Strict Separation of Concerns (SoC):** Isolated UI views, dedicated `types/` declarations, decoupled custom hooks (`use*.ts`), and pure utilities (`lib/`/`utils/`).
    3. **Centralized Design Tokens (Zero Hardcoding):** Absolute ban on raw hex codes (`#...`) and arbitrary pixel dimensions (`w-[...px]`, `text-[...px]`) in JSX. Single source of truth in `@theme`.
- **Active Task:** Codebase Audit & Migration Execution (`.agent/refactor-plan.md`).

---

## 2. Completed Milestones & Architectural Decisions (ADRs)

| Date | Milestone / Component | Architectural Decision & Impact |
|------|------------------------|---------------------------------|
| 2026-10 | Phase 1 Refactor: Zero-Hardcoding Mandate & Design Tokens | Centralized full palette and scale in @theme, created src/lib/tokens.ts, replaced 620+ arbitrary colors & 180+ arbitrary px with semantic tokens across all 23 components. 0 violations remaining. |
| 2026-10 | Standards: SoC, File Limits & Zero-Hardcoded Tokens | Ratified strict architectural governance: 200–500 line limits, UI/Hook/Type separation of concerns, and centralized design tokens (zero raw hex/arbitrary pixels). |
| 2026-10 | Reader Toolbar Gap Optimization (1-2px) | Synchronized dynamic header measurement via `--app-header-height` CSS custom property, eliminated extraneous top margin and `space-y` selector bleeding, maintaining exact 2px sticky separation between header border and reader toolbar. |
| 2026-10 | Phase 5 CI/CD & Testing Hardening | Implemented `/api/health`, consolidated `npm test` runner, multi-stage Alpine Dockerfile, docker-compose, and GitHub Actions CI workflow. |
| 2026-10 | Phase 4 SEO & Semantic Metadata | Implemented Next.js 16 dynamic `sitemap.ts`, `robots.ts`, OpenGraph/Twitter cards, and Schema.org/Book JSON-LD scholarly metadata. |
| 2026-10 | Phase 3 Database Optimization | Deployed compound indexes on `BookModel`, text search on `CategoryModel`, lean projections on catalog queries, connection pool resilience, and SWR state hydration. |
| 2026-10 | Phase 2 Performance & Code Splitting | Implemented `React.lazy()` / `Suspense` chunking across all secondary views & modals, dynamic PDF.js canvas loading, edge SWR headers, `useMemo` filtering, and async/lazy image loading. |
| 2026-10 | Phase 1 Security Hardening | Deployed HMAC-SHA256 timing-safe auth tokens, protected all mutation endpoints, added ReDoS defense, magic-byte upload validation, and referential integrity. |
| 2026-10 | Next.js 16 + React 19 Unified Shell | Decoupled client SPA viewport in `App.tsx` with dedicated administrative Next.js route at `app/admin/page.tsx`. |
| 2026-10 | Dual-Store Data Persistence Layer | Hybrid storage strategy: MongoDB Atlas (`BookModel`, `CategoryModel`, `SettingsModel`) with automatic fallback to high-speed client-side local cache (`bookStore.ts`, `categoryStore.ts`, `homeSettingsStore.ts`). Guarantees 100% offline uptime. |
| 2026-10 | Multi-Modal Codex Reader System | Created two distinct reading interfaces: `BookReaderView` (chapter-by-chapter codex study with full pagination) and `CodexPdfReader` (direct interactive PDF manuscript rendering via canvas/PDF.js). |
| 2026-10 | Dynamic Isnād Graph Transmission | Normalized narrator nodes (`IsnadNode`) with scholastic reliability grades (`Thiqah Thabt`, `Sahabi`, etc.), death dates, and biographic inspector modals. |
| 2026-10 | Live Homepage Section Controls | Extracted hardcoded homepage blocks into configurable sections (`HomeSectionsConfig`) persisted via `/api/settings` and real-time custom window events. |

---

## 3. Active Roadmap & Optimization Phases

- [x] **Phase 1: Security Hardening & Input Sanitization** (HMAC-SHA256 Auth, ReDoS defense, Magic byte validation, Referential integrity).
- [x] **Phase 2: Performance Optimization & Code Splitting** (Dynamic imports for views & modals, PDF canvas lazy loading, Edge SWR headers, image optimizations).
- [x] **Phase 3: Database & State Architecture Optimization** (Mongoose query lean projections, compound index optimization on codex metadata, connection pool resilience).
- [x] **Phase 4: SEO, Scholarly Metadata & Semantic Web** (JSON-LD Schema.org/Book, OpenGraph tags, Arabic typography font optimization, sitemap & robots).
- [x] **Phase 5: Automated Testing & CI/CD Hardening** (Healthcheck probe, consolidated test runner, multi-stage Dockerfile, docker-compose, GitHub Actions).
- [ ] **Phase 6: Codebase Refactoring & Modularity**
  - [x] **Phase 6.1 (Phase 1): Token & Theme Extraction** (Zero-Hardcoding Mandate complete — 0 arbitrary tokens across codebase).
  - [ ] **Phase 6.2 (Phase 2): Types & Model Segregation** (Centralizing all 24 inline interfaces in `src/types/`).
  - [ ] **Phase 6.3 (Phase 3): Logic Decoupling** (Decoupling state & API side effects into `src/hooks/`).
  - [ ] **Phase 6.4 (Phase 4): Component Decomposition** (Deconstructing oversized views <500 lines).

---

## 4. Key Architectural Constants & Conventions

- **Storage Keys:**
  - `al_maktabah_books_live_v1`: Catalog of stored/uploaded books.
  - `al_maktabah_categories_v1`: Classification of 28 Islamic sciences.
  - `al_maktabah_home_settings_v1`: Master homepage sections & featured reader settings.
  - `al_maktabah_admin_session`: Authenticated admin session flag.
  - `al_maktabah_admin_token`: Cryptographically signed HMAC-SHA256 authentication token.
- **API Endpoints:**
  - `GET /api/health`: System & database health probe with uptime and memory statistics.
  - `POST /api/auth/login`: Admin authentication handshake returning signed token and cookie.
  - `GET /api/auth/verify`: Token validity probe.
  - `GET / POST /api/books`: Book collection management (POST protected, GET edge cached with lean projection).
