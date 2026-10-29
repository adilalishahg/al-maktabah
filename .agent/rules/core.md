# Rules: Core Architectural Laws & Code Standards

**Enforcement Level:** Strict  
**Scope:** Universal across all layers (Frontend, Backend, Types, Stores, Scripts)  

---

## 1. Clean Architecture & DRY (Don't Repeat Yourself)
1. **Single Source of Truth:** Never duplicate domain interfaces or configuration shapes. All library types reside in `src/types/`, all persistent store keys in `src/data/`, and all Mongoose models in `src/models/`.
2. **Separation of Concerns:**
   - Presentation components (`src/views/`, `src/components/`) must never embed direct raw MongoDB queries.
   - Route handlers (`src/app/api/`) must handle request validation, database persistence, and standardized JSON error formatting.
   - Client stores (`src/data/*Store.ts`) encapsulate `localStorage` access and custom event broadcasting.

## 2. Strict TypeScript Typings
1. **No `any` Policy:** Explicitly disallow arbitrary `any` annotations. All book records, chapters, isnad nodes, and settings must be strictly typed using interfaces defined in `src/types/`.
2. **Null Safety & Optionality:** Use optional chaining (`?.`) and nullish coalescing (`??`) defensively. Array access on chapters or isnad chains must verify existence before accessing index 0.
3. **Immutability in State Updates:** Always produce new object references when updating React state or persistent stores (e.g., `JSON.parse(JSON.stringify(x))` or spread operators `[...items]`). Never mutate existing state arrays directly.

## 3. Atomic Design & Component Hierarchy
1. **Atoms / Primitives:** Badges, buttons, font-resizers, theme toggles, and icon wrappers (`components/`).
2. **Organisms / Sub-views:** Dual-pane reader canvas, isnād graph inspector, table of contents marginalia (`components/` & `views/`).
3. **Templates / Pages:** Full viewports like `HomeView.tsx`, `BookReaderView.tsx`, and `AdminDashboardView.tsx`.
4. **Modularity Law:** Any JSX component exceeding 400 lines must be reviewed for subcomponent extraction (e.g., `AdminHomeSettingsView.tsx` extracted from `app/admin/page.tsx`).

## 4. Documentation & Comments
1. **Preserve Documentation Integrity:** Preserve existing docstrings, Arabic transliterations, and explanatory comments when refactoring.
2. **Self-Documenting Code:** Write expressive variable and function names (e.g., `buildReadingSectionFromBook`, `handleSetBookAsHomeReader`).
