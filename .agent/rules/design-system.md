# Rules: Design System & Visual Hierarchy

**Design Theme:** Illuminated Classical Manuscript (Al-Makhṭūṭāt al-Islāmiyyah)  
**Tone:** Sacred, Scholarly, Distraction-Free, Timeless  

---

## 1. Color Palette & Token Hierarchy

| Token Name | Hex / Class | Semantic Purpose |
|------------|-------------|------------------|
| **Sacred Waqf Emerald** | `#0f382c` / `bg-[#0f382c]` | Primary brand headers, active admin controls, calligraphic highlights. |
| **Gilded Amber / Gold** | `#cba72f` / `#ffe088` | Ornate manuscript borders, illuminated medallion vectors, verified badges. |
| **Parchment Canvas** | `#fbf9f5` | Default distraction-free reading canvas mimicking historic vellum. |
| **Night Codex** | `#0a1410` / `#0f1f18` | Nocturnal study theme protecting ocular fatigue during extended reading. |
| **Warm Sepia** | `#f5ede1` / `#ded1c1` | Antique manuscript codex reading theme. |
| **On-Surface High** | `#1b1c1a` | Primary Latin and Arabic high-contrast typography. |
| **On-Surface Variant**| `#5c6460` / `#a2b7ad`| Metadata, death dates, isnād labels, volume stats. |

---

## 2. Typography Rules

1. **Sacred Calligraphy & Matn:**
   - Font family: `font-arabic` (Amiri, Scheherazade New).
   - Line height: Minimum `leading-loose` (2.0) or `leading-[2.2]` for diacritized classical passages (*tashkīl*).
   - Dynamic scaling: Respect user font size preferences (`readerFontSize` from 14px to 28px).
2. **Display Headings & Latin Titles:**
   - Font family: `font-display` (Cinzel, Plus Jakarta Sans, Inter).
   - Letter spacing: `tracking-tight` on large titles, `tracking-wider` on uppercase metadata labels.
3. **Scholarly Transliteration:**
   - Retain full Unicode macron marks: `ā`, `ī`, `ū`, `ḍ`, `ṣ`, `ṭ`, `ẓ`, `ḥ`, `‘`, `’`.

---

## 3. Responsive Breakpoints & Canvas Geometry

- **Mobile (<640px):** Single-column stacked layouts. Drawer navigation in Header. Hide secondary TOC marginalia to prioritize the sacred Matn text.
- **Tablet (640px – 1024px):** Dual-pane translation with compact Isnād chain inspector.
- **Desktop (1024px – 1440px):** Three-column scholarly layout (Table of Contents / Isnād Nodes -> English Annotation -> Classical Arabic Matn).
- **Ultra-Wide (>1440px):** Constrain reader viewport to `max-w-7xl` or `max-w-[1600px]` with margin centering to maintain comfortable line-reading lengths (60–80 characters per line).

---

## 4. UI Accents & Luxury Ornamentation

1. **Illuminated Border Accents:** Use double-border frames (`border-2 border-[#cba72f]/40` and inner `ring-1 ring-[#cba72f]/20`).
2. **Pedestal Elevation:** Use multi-layered ambient glows behind 3D volume stacks (`filter blur-3xl bg-[#cba72f]/15`).
3. **Arabesque Vector Overlays:** Subtly place 8-point geometric stars or arabesque polygons in corner quadrants with `opacity-10 pointer-events-none`.
