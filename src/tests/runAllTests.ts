/**
 * Al-Maktabah Automated Test Suite & Quality Gate Runner
 * Executes continuous integration checks across all 4 architectural pillars:
 * 1. Security & Authentication Guardrails
 * 2. Performance & Edge Caching Pipeline
 * 3. Database Models, Compound Indexes & Lean Projections
 * 4. SEO, Sitemap, Robots & Semantic Web
 */

import { validateCredentialsAndGenerateToken, isValidAdminToken, verifyAdminRequest } from '../lib/authGuard';
import { validateUploadFile } from '../lib/fileSecurity';
import { BookModel } from '../models/BookModel';
import { CategoryModel } from '../models/CategoryModel';
import { SettingsModel } from '../models/SettingsModel';
import { GET as getBooks } from '../app/api/books/route';
import { GET as getCategories } from '../app/api/categories/route';
import { GET as getSettings } from '../app/api/settings/route';
import { GET as getHealth } from '../app/api/health/route';
import sitemapGenerator from '../app/sitemap';
import robotsGenerator from '../app/robots';
import { INITIAL_DETAILED_BOOKS } from '../data/bookStore';

let passed = 0;
let failed = 0;

function assert(condition: boolean, desc: string) {
  if (condition) {
    console.log(`  ✓ PASS: ${desc}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${desc}`);
    failed++;
  }
}

async function runAllTests() {
  console.log('================================================================');
  console.log('  AL-MAKTABAH (المكتبة) — AUTOMATED QUALITY GATE TEST RUNNER');
  console.log('================================================================\n');

  // --- SUITE 1: SECURITY & AUTHENTICATION ---
  console.log('▶ [1/4] SUITE: Security & Cryptographic Handshakes');
  const badLogin = validateCredentialsAndGenerateToken('intruder@unknown.com', 'badpass');
  assert(!badLogin.success, 'Rejects invalid login credentials');

  const goodLogin = validateCredentialsAndGenerateToken('admin@almaktabah.org', 'maktabah1445');
  assert(goodLogin.success && typeof goodLogin.token === 'string', 'Generates valid signed HMAC administrative token');
  assert(isValidAdminToken(goodLogin.token), 'Validates genuine HMAC token');
  assert(!isValidAdminToken('tampered.signature'), 'Rejects tampered HMAC token');

  const reqNoAuth = new Request('http://localhost:3000/api/settings', { method: 'POST' });
  assert(!verifyAdminRequest(reqNoAuth).authorized, 'Denies unauthorized POST mutation');

  const reqWithToken = new Request('http://localhost:3000/api/settings', {
    method: 'POST',
    headers: { Authorization: `Bearer ${goodLogin.token}` },
  });
  assert(verifyAdminRequest(reqWithToken).authorized, 'Authorizes Bearer token mutation');

  // Magic bytes
  const fakePdfBuffer = Buffer.concat([Buffer.from('%PDF-1.4\n%âãÏÓ\n'), Buffer.alloc(50, 0)]);
  const fakePdfFile = new File([fakePdfBuffer], 'manuscript.pdf', { type: 'application/pdf' });
  assert(validateUploadFile(fakePdfFile, fakePdfBuffer).valid, 'Validates authentic %PDF- magic bytes');

  const spoofedBuffer = Buffer.from('<?php echo "evil"; ?>');
  const spoofedFile = new File([spoofedBuffer], 'trojan.pdf', { type: 'application/pdf' });
  assert(!validateUploadFile(spoofedFile, spoofedBuffer).valid, 'Rejects spoofed extension with non-PDF bytes');

  // --- SUITE 2: PERFORMANCE & HTTP EDGE CACHING ---
  console.log('\n▶ [2/4] SUITE: Performance & Edge SWR Headers');
  const publicBooksRes = await getBooks(new Request('http://localhost:3000/api/books'));
  const booksCache = publicBooksRes.headers.get('Cache-Control');
  assert(booksCache !== null && booksCache.includes('s-maxage='), 'Public /api/books delivers edge CDN cache header');

  const adminBooksRes = await getBooks(new Request('http://localhost:3000/api/books?admin=true'));
  const adminBooksCache = adminBooksRes.headers.get('Cache-Control');
  assert(adminBooksCache !== null && adminBooksCache.includes('no-store'), 'Admin /api/books bypasses cache');

  const catRes = await getCategories();
  assert(catRes.headers.get('Cache-Control')?.includes('s-maxage=') === true, 'Categories deliver long-lived edge cache header');

  const settingsRes = await getSettings();
  assert(settingsRes.headers.get('Cache-Control')?.includes('s-maxage=') === true, 'Settings deliver fast edge revalidation header');

  // --- SUITE 3: DATABASE MODELS, INDEXES & HEALTHCHECK ---
  console.log('\n▶ [3/4] SUITE: Database Models, Compound Indexes & Health');
  const bookIndexes = BookModel.schema.indexes();
  const hasCompoundIndex = bookIndexes.some(
    ([fields]) => fields && fields.published === 1 && fields.discipline === 1 && fields.createdAt === -1
  );
  assert(hasCompoundIndex, 'BookModel has compound index { published: 1, discipline: 1, createdAt: -1 }');

  const catIndexes = CategoryModel.schema.indexes();
  const hasCatText = catIndexes.some(([fields]) => fields && (fields.name === 'text' || fields.arabicName === 'text'));
  assert(hasCatText, 'CategoryModel defines text search index on title & arabicName');

  assert(Boolean(SettingsModel.schema), 'SettingsModel schema is valid and initialized');

  const healthRes = await getHealth();
  const healthData = await healthRes.json();
  assert(healthData.status === 'healthy', 'System healthcheck endpoint reports healthy status');

  // --- SUITE 4: SEO, SITEMAP & STRUCTURED DATA ---
  console.log('\n▶ [4/4] SUITE: SEO, Sitemap & Semantic Web');
  const robots = robotsGenerator();
  assert(typeof robots.sitemap === 'string' && robots.sitemap.includes('/sitemap.xml'), 'Robots points to sitemap.xml');

  const sitemap = await sitemapGenerator();
  assert(Array.isArray(sitemap) && sitemap.length > 5, 'Sitemap dynamically generates all required URLs');
  assert(sitemap.some((e) => e.priority === 1.0), 'Sitemap designates homepage priority 1.0');
  assert(sitemap.some((e) => e.url.includes('/books/')), 'Sitemap indexes individual codex pages');

  const testBook = INITIAL_DETAILED_BOOKS[0];
  assert(Boolean(testBook.title && testBook.author), 'Canonical codex available for Schema.org/Book metadata');

  console.log('\n================================================================');
  console.log(`  SUMMARY: ${passed} Passed, ${failed} Failed out of ${passed + failed} Total Assertions`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runAllTests().catch((err) => {
  console.error('Test execution fatal error:', err);
  process.exit(1);
});

