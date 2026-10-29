# Autonomous Agent Skills & Domain Recipes — Al-Maktabah

This document indexes specialized agent operational capabilities, recurring domain recipes, and tool usage patterns across the Al-Maktabah project.

---

## 1. Core Competencies

### 1.1 Arabic Scholastic Typography & RTL Handling
- **Diacritics Preservation:** Preserve full Arabic vowelization (*tashkīl* / *i‘rāb*) during parsing, regex searching, and database storage. Never strip tashkīl unless performing specialized bare-root lemmatization.
- **Bi-directional Layouts:** Explicitly manage `dir="rtl"` containers for Arabic passages while maintaining `dir="ltr"` for apparatus footnotes, Latin transliterations, and isnād tree inspect controls.
- **Font Stack Hierarchy:**
  - Traditional Calligraphic Matn: `'Amiri', 'Scheherazade New', 'Lateef', serif`
  - Scholarly Latin Display: `'Plus Jakarta Sans', 'Cinzel', sans-serif`
  - Annotations & Transliteration: `'IBM Plex Serif', 'Amiri', serif`

### 1.2 Isnād Transmission Graph Synthesis
- **Lineage Verification:** Every `IsnadNode` must include reliability grading (`Thiqah Thabt`, `Sahabi`, `Saduq`), generation classification (`Companion`, `Senior Tābi‘ī`, `Tābi‘ī`, `Atbā‘ at-Tābi‘īn`, `Leading Imām`), death date in Hijri format (`d. XX AH`), and geographic center.
- **Graph Traversal:** Support rendering linear chains from Companion down to the compiler (e.g., Al-Humaydi -> Sufyan -> Yahya -> Muhammad -> 'Alqamah -> 'Umar ibn al-Khattab).

### 1.3 PDF & Manuscript Heuristics
- Heuristic detection of Arabic chapter headings (*Bāb*, *Kitāb*, *Faṣl*).
- Demarcation of Matn (prophetic text) from Sanad (transmitter chain).
- Extraction of scholarly footnotes and commentary glosses (*ḥāshiyah*).

---

## 2. Common Domain Recipes

### Recipe A: Registering a New Homepage Section
1. **Define Schema:** Add configuration interface in `src/types/homeSettings.ts`.
2. **Update Defaults:** Add initial defaults in `DEFAULT_HOME_SETTINGS` in `src/data/homeSettingsStore.ts`.
3. **Mount in View:** In `src/views/HomeView.tsx`, wrap the JSX block with `{sections.<sectionKey>.enabled && (<section>...</section>)}`.
4. **Admin Control:** In `src/components/admin/AdminHomeSettingsView.tsx`, add the toggle switch and configuration inputs.
5. **Verify:** Run `npm run lint` inside `al-maktabah` to ensure zero type errors.

### Recipe B: Ingesting an Uploaded Book into the Codex Reader
1. Call `buildReadingSectionFromBook(book, chapterId)` from `src/data/homeSettingsStore.ts`.
2. Map book metadata (title, arabic title, author, chapters) into a compliant `ReadingSection` structure.
3. Update `homeSettings.readerSection` and trigger `saveHomeSettings(updated)`.
4. The homepage reader view re-renders instantaneously via the window event bus.

### Recipe C: Windows & Node Environment Guardrails
- **CRLF vs LF Normalization:** When editing TypeScript/JSX files on Windows, maintain LF line endings to prevent regex mismatch errors during automated diffing.
- **Path Separation:** Always use forward slashes (`/`) for URLs and imports, and standard Windows paths for local CLI operations.
