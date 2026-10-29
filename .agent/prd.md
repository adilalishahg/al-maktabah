# Product Requirements Document (PRD) — Al-Maktabah (المكتبة)

**Platform:** Al-Maktabah Digital Waqf Knowledge Hub & Scholarly Archives  
**Target Release:** Production 2.0  
**Owner:** Principal Architect & Product Engineering  

---

## 1. Executive Summary & Vision

Al-Maktabah is an autonomous, open-access scholarly digital library and critical codex repository dedicated to classical Islamic scholarship (Hadīth, Qur'anic Exegesis, Jurisprudence, Theology, and Arabic Philology). Built under the Waqf Lillāh (perpetual endowment) framework, the platform guarantees zero commercial paywalls, distraction-free typographic codex reading, verifiable isnād transmission mapping, and an administrative control system for cataloging and highlighting manuscripts.

---

## 2. Target User Personas

| Persona | Role | Key Needs & JTBD (Jobs to Be Done) |
|---------|------|------------------------------------|
| **Dr. Ahmad (Researcher / Scholar)** | Academic Specialist in Islamic Philology & Hadīth Sciences | Needs high-fidelity Arabic text with tashkīl, instant root word morphology analysis, scholarly marginalia (ta‘līqāt/sharḥ), and verified isnād lineage graphs. |
| **Maryam (Student of Knowledge / Seeker)** | Comparative Religion & Fiqh Student | Needs dual-language parallel translations (Arabic/English), thematic searches across disciplines, audio recitation accompaniment, and mobile-responsive reading canvases. |
| **Ustadh Bilal (Library Administrator / Custodian)** | Waqf Archive Administrator | Needs seamless tools to upload codices (PDF or text extraction), curate homepage featured treatises, toggle public visibility of sections, and manage classified disciplines. |

---

## 3. Product Features & Scope

### 3.1 Public Portal (`/`)
- **Top Daily Insight Banner:** Displays daily Quranic Ayah or Prophetic Hadith with citations.
- **Hero 3D Showcase:** Visual representation of foundational texts with an illuminated center pedestal codex.
- **Tartīb al-‘Ulūm (Classified Sciences):** Systematically organized primary sources across 28 traditional disciplines.
- **Featured Critical Editions Shelf:** Filterable book shelf (All Works, Most Read, Recently Digitized, Bilingual, Rare Manuscripts) with instant reader shortcuts.
- **The Scholarly Codex Reader Preview:** Dual-pane distraction-free reading canvas with isnād transmission nodes, vocal recitation equalizer, parallel English commentary, and morphological word inspect.
- **Waqf & Licensing Charter:** Clear statements of perpetual free access under CC-BY-NC.
- **Monthly Scholarly Dispatch:** Patron email newsletter subscription.

### 3.2 Reading Studio & Dedicated Book Viewer (`/book-viewer`, `/reader-studio`)
- Chapter-by-chapter table of contents navigation.
- Three specialized reading palettes: Parchment (light), Night Emerald (dark), and Sepia.
- Dynamic font scaling (14px – 28px).
- Isnād chain inspector modal with biographical cards and reliability grading.
- Full PDF Codex canvas viewer with zoom, page navigation, and search.

### 3.3 Administration Portal (`/admin`)
- **Analytics Dashboard:** Live metrics on published codices, total pages, active disciplines, and database sync status.
- **Book Manager:** Full CRUD on books, PDF upload with automatic layout analysis, bulk text ingestion, chapter editing, and single-click `"Set as Home Reader"`.
- **Discipline / Category Manager:** Classification hierarchy, icon selection, volume counts, and association management.
- **Homepage & Reader Controller (`Sections & Reader`):**
  - Section toggles (Active / Hidden) for all 7 homepage modules.
  - Featured Reader Content Manager: Dropdown book/chapter loader or custom text editor for Arabic sanad/matn, English translation, isnad nodes, footnotes, and reciter audio.
  - In-Admin Live Reader Preview matching the public interface.

---

## 4. Acceptance Criteria

1. **Section Visibility Rule:** If any section (e.g., Categories Grid, Codex Reader) is toggled to Inactive in Admin, it must immediately disappear from the public homepage without layout shifts or console errors.
2. **Reader Content Binding:** When an administrator chooses a book and chapter via "Set as Home Reader" or the dropdown loader, the homepage reader canvas must reflect that book's title, chapter title, Arabic matn, and English translation immediately.
3. **Resilient Persistence:** In the absence of a live MongoDB URI, the application must seamlessly operate via localStorage cache without crashing, displaying appropriate non-blocking UI indicators.
4. **Performance Benchmark:** Core Web Vitals LCP < 1.8s, CLS < 0.05, and first contentful paint < 1.2s on standard 4G connections.
5. **Accessibility & RTL:** Strict RTL alignment for Arabic typography, full keyboard navigation for reader controls, and contrast ratios conforming to WCAG 2.1 AA standards.
