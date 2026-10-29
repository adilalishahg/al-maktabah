# Rules: Design System & Centralized Design Tokens

**Design Theme:** Illuminated Classical Manuscript (Al-Makhṭūṭāt al-Islāmiyyah)  
**Tone:** Sacred, Scholarly, Distraction-Free, Timeless  
**Enforcement Level:** Strict Zero-Hardcoding Mandate  

---

## 1. Centralized Design Tokens (Single Source of Truth)

All visual attributes—colors, fonts, typography scales, spacing, breakpoints, borders, and elevation shadows—must strictly reference centralized constants defined in:
- `src/app/globals.css` / `src/index.css` (Tailwind `@theme` directive & `:root` variables)
- Designated token configurations (e.g., semantic token constants)

### The Zero-Hardcoding Law:
1. **Zero Raw Hex Codes in JSX:**
   - **Forbidden:** `<div className="bg-[#12241b] text-[#ffe088] border-[#21392e]">`
   - **Required:** Use semantic Tailwind tokens: `bg-surface-container`, `text-tertiary-fixed`, `border-outline-variant`.
2. **Zero Arbitrary Pixel Dimensions:**
   - **Forbidden:** `w-[340px]`, `h-[460px]`, `text-[44px]`, `gap-[14px]`
   - **Required:** Standard Tailwind spacing scale: `w-80`, `h-[28rem]`, `text-display-lg`, `gap-space-md`.
3. **Seamless Propagation:**
   - Modifying a central token in `@theme` must propagate instantly across all pages and components without requiring find-and-replace edits in UI files.

---

## 2. Central Token Reference Matrix

### Semantic Color Hierarchy

| Semantic Token | Design Token / Class | Hex Value | Semantic Purpose |
|----------------|----------------------|-----------|------------------|
| `--color-primary` | `text-primary`, `bg-primary` | `#002218` / `#0f382c` | Main headlines, brand accents, waqf insignia. |
| `--color-primary-container` | `bg-primary-container` | `#0f382c` | Top daily insight banner, active toolbar pills. |
| `--color-tertiary` | `text-tertiary`, `bg-tertiary` | `#735c00` / `#cba72f` | Classical gilded gold, illuminated chapter numbers. |
| `--color-tertiary-fixed` | `text-tertiary-fixed` | `#ffe088` | Calligraphic quotes, verified isnād grades. |
| `--color-surface` | `bg-surface` | `#fbf9f5` | Default vellum parchment reading canvas. |
| `--color-surface-container` | `bg-surface-container` | `#efeeea` | Reader toolbar cards, modal containers, panel borders. |
| `--color-surface-container-low` | `bg-surface-container-low` | `#f5f3ef` | Secondary cards, subtle backgrounds, table stripes. |
| `--color-surface-container-lowest`| `bg-surface-container-lowest`| `#ffffff` | Elevated codex cards, command palette popups. |
| `--color-on-surface` | `text-on-surface` | `#1b1c1a` | Primary text and Arabic classical matn. |
| `--color-on-surface-variant` | `text-on-surface-variant` | `#414845` | Subtitles, translator notes, narrator death dates. |

### Theme Mode Matrix (CSS Variables)

| Token | Light Parchment | Night Codex | Warm Sepia |
|-------|-----------------|-------------|------------|
| `--color-surface` | `#fbf9f5` | `#0a1410` | `#f5ede1` |
| `--color-surface-dim` | `#dbdad6` | `#060e0a` | `#ded3c1` |
| `--color-surface-container` | `#efeeea` | `#192e25` | `#e6dcce` |
| `--color-on-surface` | `#1b1c1a` | `#e5ede9` | `#26211a` |
| `--color-on-surface-variant` | `#414845` | `#a2b7ad` | `#4f473c` |

---

## 3. Typography Scales & Rules

1. **Font Families (Tokenized):**
   - `font-arabic`: `"Amiri", "Traditional Arabic", serif` (Sacred texts, Hadīth matn, isnād names).
   - `font-display`: `"Playfair Display", Georgia, serif` (Illuminated codex titles, volume headers).
   - `font-sans`: `"Plus Jakarta Sans", Roboto, sans-serif` (Administrative UI, buttons, controls).
2. **Typography Scale Tokens:**
   - Display: `text-display-lg` (44px/48px), `text-display-md` (36px).
   - Headlines: `text-headline-lg` (32px), `text-headline-md` (28px), `text-headline-sm` (24px).
   - Title: `text-title-lg` (20px), `text-title-md` (16px), `text-title-sm` (14px).
   - Body: `text-body-lg` (16px), `text-body-md` (14px), `text-body-sm` (12px).
   - Labels & Badges: `text-label-md` (12px), `text-label-sm` (10px).
3. **Line Heights & Diacritic Clearances:**
   - Arabic matn with full *tashkīl* requires minimum `leading-loose` (2.0) or `leading-[2.2]` to prevent vowel diacritic collisions.

---

## 4. Standardized Spacing & Geometry Tokens

- `space-xs`: `0.25rem` (4px)
- `space-sm`: `0.5rem` (8px)
- `space-md`: `1rem` (16px)
- `space-lg`: `1.5rem` (24px)
- `space-xl`: `2.5rem` (40px)
- `margin-container`: Max `max-w-7xl` (1280px), `max-w-[1400px]` (xl), `max-w-[1600px]` (2xl).
- **Responsive Viewports:**
  - `sm`: 640px (Tablet compact)
  - `md`: 768px (Tablet dual pane)
  - `lg`: 1024px (Desktop three-column)
  - `xl`: 1280px (Scholarly workstation)
  - `2xl`: 1536px (Archive studio wide)

---

## 5. UI Accents & Luxury Ornamentation

1. **Illuminated Border Accents:** Use tokenized border utilities (`border-tertiary/40`, `ring-1 ring-tertiary/20`).
2. **Pedestal Elevation:** Ambient golden glows must reference `bg-tertiary/15 blur-3xl`.
3. **Header Spacing:** Distance between fixed navigation and active reader toolbar must strictly maintain the tokenized `2px` clearance (`calc(var(--app-header-height) + 2px)`).
