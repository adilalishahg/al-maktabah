# Rules: Frontend Architecture & Conventions

**Framework:** React 19 + Next.js 16 (App Router)  
**Styling Engine:** Tailwind CSS + PostCSS + CSS Variables  
**Target:** Distraction-Free Illuminated Codex UI  

---

## 1. Strict Separation of Concerns (SoC)
All frontend development must strictly adhere to modular separation across distinct layers:

1. **Presentational Components (View Layer):**
   - Pure UI rendering based on props.
   - **Zero Inline Business Logic:** No complex algorithms, text parsing, or search ranking calculations inside components.
   - **Zero Raw Queries & Data Fetching:** No direct `fetch()`, API calls, or `localStorage` mutations directly within JSX render trees.
   - **Zero Inline Type Dumps:** Multi-line interfaces (e.g. `interface ComponentProps`) must be moved to dedicated `types/` files or an adjacent `[Component].types.ts` file when they exceed basic inline definitions.
2. **Custom Hooks (Logic & State Layer):**
   - Extract state management, event listeners, timer loops, and API synchronization into dedicated custom hooks in `src/hooks/use[Feature].ts`.
   - Examples: `useBookReader`, `usePdfViewer`, `useCatalogSearch`, `useHomeSettings`.
   - Views must simply consume the hook: `const { state, actions } = use[Feature]()`.
3. **Utility Layer (`src/lib/` or `src/utils/`):**
   - Deterministic calculations, diacritic strip helpers, string sanitizers, and formatters must live as pure functions in utility modules.

---

## 2. File Size & Modularity Enforcement
1. **Strict 200–500 Lines Limit:**
   - Every view, component, and custom hook must strictly remain within **200 to 500 lines**.
   - Any component exceeding 500 lines must be immediately broken down into atomic sub-components (e.g., splitting a mega-view into header strip, content canvas, sidebar drawer, and footer controls).
   - Ideal component size: 100–300 lines.
2. **Atomic Component Decomposition:**
   - Deconstruct complex screens into single-purpose atomic components (Atoms -> Molecules -> Organisms).

---

## 3. React 19 & Next.js App Router Standards
1. **Directive Placement:** Every file utilizing React client-side state (`useState`, `useEffect`, event handlers) must explicitly declare `'use client';` on line 1.
2. **Hydration Resilience:** Never render client-only primitives (e.g. `localStorage` reads, `window.innerWidth`, or `new Date()`) directly in server component render trees without a client-side wrapper or `useEffect` mount check.
3. **Optimistic UI:** When updating toggles or saving settings, update client state instantly, dispatch local window events, and handle API network calls asynchronously with non-blocking feedback.

---

## 4. Centralized Styling & Tokens
1. **Single Source of Truth:** All colors, font families, font sizes, and layout geometries must strictly reference centralized tokens defined in `@theme` / `globals.css` / `index.css`.
2. **Zero Hardcoded Styles:**
   - Never use raw hex codes (e.g., `text-[#0f382c]`, `bg-[#13241d]`) in JSX.
   - Never use arbitrary inline pixel sizes (e.g., `w-[340px]`, `h-[460px]`, `text-[44px]`).
   - Use semantic Tailwind classes: `bg-surface`, `bg-primary`, `text-on-surface`, `text-tertiary`, `font-arabic`, `font-display`.

---

## 5. Typography & Bi-directional (RTL/LTR) Flow
1. **Arabic Font Class:** Use `font-arabic` with `leading-loose` or `leading-relaxed` on Arabic texts to prevent diacritic clipping.
2. **Direction Isolation:**
   - Always wrap classical Arabic passages in containers with `dir="rtl"`.
   - Always wrap Latin transliterations, isnād inspector titles, and buttons in containers with `dir="ltr"`.
3. **Material Symbols:** Use `<span className="material-symbols-outlined text-[size]">icon_name</span>` consistently for UI glyphs.

---

## 6. Accessibility (a11y)
1. Provide descriptive `aria-label` or `title` attributes on icon-only buttons (e.g. font-resizers, theme switchers, audio toggles).
2. Keyboard navigation: Modals (`BookDetailModal`, `CommandPalette`) must close on `Escape` keypress.
3. Maintain high contrast ratios for sacred Arabic calligraphic glyphs against ambient background watermarks.
