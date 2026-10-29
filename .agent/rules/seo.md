# Rules: Search Engine Optimization (SEO) & Semantic Scholarly Web

**Standard:** Google Academic Scholar + Schema.org + OpenGraph + Dublin Core  
**Domain:** Classical Islamic Manuscripts & Scholarly Treatises  

---

## 1. Document Head & Semantic Metadata

1. **Title Structure:**  
   `[Treatise Title] ([Arabic Title]) — [Author] | Al-Maktabah Digital Archives`  
   *Example:* `Ṣaḥīḥ al-Bukhārī (صحيح البخاري) — Imām al-Bukhārī | Al-Maktabah`
2. **Meta Description:**  
   Summarize the discipline, recension verification, volume count, and Waqf open-access availability in 140–160 characters.
3. **Canonical Tags:**  
   Every dynamic book and chapter route must declare a self-referential `<link rel="canonical" href="..." />` to prevent duplicate indexing across pagination mirrors.

---

## 2. Schema.org JSON-LD Structured Data

Every book page must inject structured scholarly metadata into the `<head>`:

```json
{
  "@context": "https://schema.org",
  "@type": "Book",
  "name": "Ṣaḥīḥ al-Bukhārī",
  "alternateName": "صحيح البخاري — الجامع المسند الصحيح",
  "author": {
    "@type": "Person",
    "name": "Imām Muḥammad ibn Ismā‘īl al-Bukhārī",
    "birthDate": "0194-01-01",
    "deathDate": "0256-01-01"
  },
  "inLanguage": ["ar", "en"],
  "genre": "Prophetic Traditions (Hadīth)",
  "numberOfPages": 2840,
  "isAccessibleForFree": true,
  "license": "https://creativecommons.org/licenses/by-nc/4.0/",
  "publisher": {
    "@type": "Organization",
    "name": "Al-Maktabah Digital Waqf"
  }
}
```

---

## 3. Multilingual & RTL Indexing Guardrails

1. **HTML Language Tagging:**
   - Root document: `<html lang="en" dir="ltr">`
   - Classical Arabic blocks: Explicitly declare `<div lang="ar" dir="rtl">` so search engine crawlers correctly tokenize Arabic stems and diacritics.
2. **HrefLang Annotations:**
   - Where parallel English and Arabic translations exist, link alternates via `<link rel="alternate" hreflang="ar" href="..." />` and `<link rel="alternate" hreflang="en" href="..." />`.

---

## 4. OpenGraph & Social Cards

1. Provide 1200x630 dynamic OpenGraph social cards (`og:image`) featuring the illuminated gold book cover, Arabic calligraphy, and verified Waqf seal.
2. Set `twitter:card` to `summary_large_image`.
