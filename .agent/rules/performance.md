# Rules: Performance Optimization & Scalability

**Target SLA:** LCP < 1.8s, FID/INP < 100ms, CLS < 0.05, 60fps Scrolling  
**Infrastructure Target:** High-Concurrency Global Access under Waqf Zero-Cost Budget  

---

## 1. Bundle Size & Code Splitting

1. **Heavy Library Dynamic Imports:**
   - Libraries such as `pdfjs-dist`, `pdf-parse`, and heavy SVG canvas renderers must be loaded dynamically using `React.lazy()` or Next.js `dynamic(() => import(...), { ssr: false })`.
   - Never import heavy administrative tools (`CodexPdfReader`, `pdfAnalyzer`) inside the public homepage bundle.
2. **Icon & Symbol Tree-Shaking:**
   - Prefer Google Material Symbols via single CSS class `<span className="material-symbols-outlined">...</span>` over importing hundreds of distinct Lucide SVG icons in the main bundle.

---

## 2. Rendering Optimization & React 19 Practices

1. **Virtualization on Massive Manuscripts:**
   - Treatises containing over 5,000 hadīth or 2,000 pages (e.g. Ṣaḥīḥ al-Bukhārī, Tafsīr Ibn Kathīr) must use virtual scrolling or paginated windowing (`BookReaderView.tsx`).
   - Never render more than 20 full text chapters into the DOM simultaneously.
2. **Memoization Strategy:**
   - Wrap expensive computation (e.g., morphological root indexing, filter tab calculations) in `useMemo`.
   - Avoid creating new anonymous inline functions inside loop iterators (`.map(...)`) when those callbacks trigger subcomponent re-renders.

---

## 3. Caching & Stale-While-Revalidate (SWR)

1. **Client Tier:**
   - Read from `localStorage` synchronously during initial state hydration to eliminate rendering flicker.
   - Dispatch background revalidation queries via `syncFromApi()`.
2. **HTTP Tier:**
   - Add `Cache-Control: public, s-maxage=3600, stale-while-revalidate=86400` headers on static codex reads (`/api/books/[id]`).
   - Revalidate cache tags immediately upon administrative mutations.

---

## 4. Image & Media Optimization

1. **Illuminated Manuscripts:** Serve manuscript cover bindings using modern WebP/AVIF formats with responsive `srcset` or Next.js `<Image />` component with blur-up placeholders.
2. **Audio Recitation Streams:** Stream audio buffers incrementally via HTTP 206 Partial Content rather than downloading entire MP3 codex files upfront.
