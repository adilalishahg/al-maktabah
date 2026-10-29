# Rules: Frontend Architecture & Conventions

**Framework:** React 19 + Next.js 16 (App Router)  
**Styling Engine:** Tailwind CSS + PostCSS + CSS Variables  
**Target:** Distraction-Free Illuminated Codex UI  

---

## 1. React 19 & Next.js App Router Standards
1. **Directive Placement:** Every file utilizing React client-side state (`useState`, `useEffect`, event handlers) must explicitly declare `'use client';` on line 1.
2. **Hydration Resilience:** Never render client-only primitives (e.g. `localStorage` reads, `window.innerWidth`, or `new Date()`) directly in server component render trees without a client-side wrapper or `useEffect` mount check.
3. **Optimistic UI:** When updating toggles or saving settings, update client state instantly, dispatch local window events, and handle API network calls asynchronously with non-blocking feedback.

## 2. Tailwind & CSS Tokens
1. **Semantic Color Tokens:**
   - Surface Tokens: `bg-surface`, `bg-surface-container`, `bg-surface-container-low`, `bg-surface-container-high`, `bg-surface-container-lowest`.
   - Text Tokens: `text-primary`, `text-tertiary`, `text-on-surface`, `text-on-surface-variant`.
   - Brand Metallic: Gold leaf accents (`border-[#cba72f]/40`, `text-[#ffe088]`, `bg-gradient-to-r from-[#d4af37] via-[#e5c053] to-[#cba72f]`).
   - Sacred Emerald: Deep forest and waqf greens (`bg-[#022c22]`, `bg-[#0f382c]`, `text-emerald-400`).
2. **Theme Classes:**
   - Default: Light Parchment (`#fbf9f5` canvas, `#1b1c1a` typography).
   - Night: Deep Emerald Dark Mode (`#0a1410` canvas, `#e5ede9` typography).
   - Sepia: Historic Codex Brown (`#f5ede1` canvas, `#26211a` typography).

## 3. Typography & Bi-directional (RTL/LTR) Flow
1. **Arabic Font Class:** Use `font-arabic` with `leading-loose` or `leading-relaxed` on Arabic texts to prevent diacritic clipping.
2. **Direction Isolation:**
   - Always wrap classical Arabic passages in containers with `dir="rtl"`.
   - Always wrap Latin transliterations, isnād inspector titles, and buttons in containers with `dir="ltr"`.
3. **Material Symbols:** Use `<span className="material-symbols-outlined text-[size]">icon_name</span>` consistently for UI glyphs.

## 4. Accessibility (a11y)
1. Provide descriptive `aria-label` or `title` attributes on icon-only buttons (e.g. font-resizers, theme switchers, audio toggles).
2. Keyboard navigation: Modals (`BookDetailModal`, `CommandPalette`) must close on `Escape` keypress.
3. Maintain high contrast ratios for sacred Arabic calligraphic glyphs against ambient background watermarks.
