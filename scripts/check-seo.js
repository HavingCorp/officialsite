#!/usr/bin/env node
/**
 * check-seo.js
 *
 * Validates the SEO setup. Exits non-zero if anything fails, so it can be
 * used as a pre-deploy gate.
 *
 * Checks
 *   - every configured page exists
 *   - exactly one <title>, one meta description, one canonical per page
 *   - canonical / og:url use the production origin and match the page path
 *   - Open Graph and Twitter tags present, no duplicates
 *   - referenced og:image files exist on disk
 *   - homepage carries valid Organization JSON-LD
 *   - sitemap.xml is well formed, every <loc> maps to a real file,
 *     and no page is missing from it
 *   - robots.txt points at the sitemap
 *   - CNAME still present and matching the origin
 *   - no havingcorp.github.io / /officialsite/ leakage anywhere
 *
 * Node standard library only. No dependencies.
 *
 *   node scripts/check-seo.js
 */

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const cfg = JSON.parse(fs.readFileSync(path.join(ROOT, 'seo.config.json'), 'utf8'));
const ORIGIN = cfg.site.origin.replace(/\/+$/, '');

let pass = 0;
const fails = [];
const warns = [];

function ok(msg) { pass++; }
function fail(msg) { fails.push(msg); }
function warn(msg) { warns.push(msg); }
function check(cond, msg) { cond ? ok(msg) : fail(msg); }

function countMatches(s, re) {
  const m = s.match(re);
  return m ? m.length : 0;
}
function attr(html, re) {
  const m = html.match(re);
  return m ? m[1] : null;
}
function headOf(html) {
  const m = html.match(/<head\b[^>]*>([\s\S]*?)<\/head>/i);
  return m ? m[1] : '';
}

/* ---------------------------------------------------------- pages ------ */
cfg.pages.forEach(function (p) {
  const file = path.join(ROOT, p.file);
  if (!fs.existsSync(file)) { fail(p.file + ': file not found'); return; }

  const html = fs.readFileSync(file, 'utf8');
  const head = headOf(html);
  const expectedUrl = ORIGIN + (p.path === '/' ? '/' : p.path);

  const nTitle = countMatches(head, /<title\b[^>]*>/gi);
  const nDesc = countMatches(head, /<meta\b[^>]*\bname=["']description["']/gi);
  const nCanon = countMatches(head, /<link\b[^>]*\brel=["']canonical["']/gi);

  check(nTitle === 1, p.file + ': expected 1 <title>, found ' + nTitle);
  check(nDesc === 1, p.file + ': expected 1 meta description, found ' + nDesc);
  check(nCanon === 1, p.file + ': expected 1 canonical, found ' + nCanon);

  const title = attr(head, /<title\b[^>]*>([\s\S]*?)<\/title>/i);
  check(title && title.trim().length > 0, p.file + ': title is empty');
  if (title && title.length > 65) warn(p.file + ': title is ' + title.length + ' chars (over ~60 may be truncated)');

  const desc = attr(head, /<meta\b[^>]*\bname=["']description["'][^>]*\bcontent=["']([^"']*)["']/i);
  check(desc && desc.trim().length > 0, p.file + ': description is empty');
  if (desc && (desc.length < 50 || desc.length > 165)) {
    warn(p.file + ': description is ' + desc.length + ' chars (recommended 50-160)');
  }

  const canon = attr(head, /<link\b[^>]*\brel=["']canonical["'][^>]*\bhref=["']([^"']*)["']/i);
  check(canon === expectedUrl, p.file + ': canonical should be ' + expectedUrl + ', got ' + canon);

  const ogUrl = attr(head, /<meta\b[^>]*\bproperty=["']og:url["'][^>]*\bcontent=["']([^"']*)["']/i);
  check(ogUrl === expectedUrl, p.file + ': og:url should be ' + expectedUrl + ', got ' + ogUrl);

  ['og:type', 'og:site_name', 'og:title', 'og:description'].forEach(function (k) {
    const n = countMatches(head, new RegExp('property=["\']' + k + '["\']', 'gi'));
    check(n === 1, p.file + ': expected 1 ' + k + ', found ' + n);
  });
  ['twitter:card', 'twitter:title', 'twitter:description'].forEach(function (k) {
    const n = countMatches(head, new RegExp('name=["\']' + k + '["\']', 'gi'));
    check(n === 1, p.file + ': expected 1 ' + k + ', found ' + n);
  });

  const ogImg = attr(head, /<meta\b[^>]*\bproperty=["']og:image["'][^>]*\bcontent=["']([^"']*)["']/i);
  if (p.ogImage) {
    check(!!ogImg, p.file + ': og:image expected but missing');
    if (ogImg) {
      check(ogImg.indexOf(ORIGIN + '/') === 0, p.file + ': og:image must be absolute on ' + ORIGIN);
      const rel = ogImg.slice(ORIGIN.length + 1);
      check(fs.existsSync(path.join(ROOT, rel)), p.file + ': og:image file missing on disk — ' + rel);
    }
  } else if (ogImg) {
    warn(p.file + ': og:image present but not configured');
  }

  if (p.path === '/') {
    const ld = head.match(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/i);
    check(!!ld, 'index.html: Organization JSON-LD missing');
    if (ld) {
      try {
        const node = JSON.parse(ld[1]);
        check(node['@type'] === 'Organization', 'index.html: JSON-LD @type should be Organization');
        check(node.url === ORIGIN + '/', 'index.html: JSON-LD url should be ' + ORIGIN + '/');
        check(typeof node.logo === 'string' && node.logo.indexOf(ORIGIN) === 0,
          'index.html: JSON-LD logo must be an absolute production URL');
        if (node.logo) {
          const rel = node.logo.slice(ORIGIN.length + 1);
          check(fs.existsSync(path.join(ROOT, rel)), 'index.html: JSON-LD logo file missing — ' + rel);
        }
      } catch (e) {
        fail('index.html: JSON-LD is not valid JSON — ' + e.message);
      }
    }
  }
});

/* -------------------------------------------------------- sitemap ------ */
const smPath = path.join(ROOT, 'sitemap.xml');
if (!fs.existsSync(smPath)) {
  fail('sitemap.xml not found');
} else {
  const sm = fs.readFileSync(smPath, 'utf8');
  check(/^<\?xml version="1\.0" encoding="UTF-8"\?>/.test(sm), 'sitemap.xml: missing XML declaration');
  check(/<urlset\b[^>]*xmlns="http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9"/.test(sm),
    'sitemap.xml: missing or wrong urlset namespace');
  check(countMatches(sm, /<url>/g) === countMatches(sm, /<\/url>/g), 'sitemap.xml: unbalanced <url> tags');

  const locs = (sm.match(/<loc>([^<]+)<\/loc>/g) || []).map(function (s) {
    return s.replace(/<\/?loc>/g, '');
  });
  check(locs.length > 0, 'sitemap.xml: contains no URLs');

  const dupes = locs.filter(function (v, i) { return locs.indexOf(v) !== i; });
  check(dupes.length === 0, 'sitemap.xml: duplicate URLs — ' + dupes.join(', '));

  locs.forEach(function (u) {
    check(u.indexOf(ORIGIN + '/') === 0, 'sitemap.xml: URL not on production origin — ' + u);
    const rel = u.slice(ORIGIN.length + 1) || 'index.html';
    check(fs.existsSync(path.join(ROOT, rel)), 'sitemap.xml: no file on disk for ' + u);
  });

  const excluded = new Set(cfg.excludeFromSitemap || []);
  cfg.pages.forEach(function (p) {
    if (excluded.has(p.file)) return;
    const want = ORIGIN + (p.path === '/' ? '/' : p.path);
    check(locs.indexOf(want) !== -1, 'sitemap.xml: missing configured page — ' + want);
  });

  excluded.forEach(function (f) {
    const bad = locs.some(function (u) { return u.endsWith('/' + f); });
    check(!bad, 'sitemap.xml: excluded file present — ' + f);
  });
}

/* --------------------------------------------------------- robots ------ */
const rbPath = path.join(ROOT, 'robots.txt');
if (!fs.existsSync(rbPath)) {
  fail('robots.txt not found');
} else {
  const rb = fs.readFileSync(rbPath, 'utf8');
  check(/^User-agent:\s*\*/m.test(rb), 'robots.txt: missing "User-agent: *"');
  check(/^Allow:\s*\//m.test(rb), 'robots.txt: missing "Allow: /"');
  check(rb.indexOf('Sitemap: ' + ORIGIN + '/sitemap.xml') !== -1,
    'robots.txt: must reference ' + ORIGIN + '/sitemap.xml');
}

/* ---------------------------------------------------------- CNAME ------ */
const cnPath = path.join(ROOT, 'CNAME');
if (!fs.existsSync(cnPath)) {
  fail('CNAME not found (custom domain would break)');
} else {
  const cn = fs.readFileSync(cnPath, 'utf8').trim();
  check(cn === ORIGIN.replace(/^https?:\/\//, ''),
    'CNAME should be ' + ORIGIN.replace(/^https?:\/\//, '') + ', got ' + cn);
}

/* ------------------------------------------------- domain leakage ------ */
function walk(dir, out) {
  fs.readdirSync(dir, { withFileTypes: true }).forEach(function (d) {
    if (d.name.startsWith('.') || d.name === 'node_modules') return;
    const full = path.join(dir, d.name);
    if (d.isDirectory()) walk(full, out);
    else if (/\.(html|js|css|json|xml|txt|md)$/i.test(d.name)) out.push(full);
  });
  return out;
}
const leaks = [];
walk(ROOT, []).forEach(function (f) {
  const rel = path.relative(ROOT, f);
  if (rel === 'SEARCH_ENGINE_SETUP.md' || rel.startsWith('scripts' + path.sep)) return;
  const t = fs.readFileSync(f, 'utf8');
  if (/havingcorp\.github\.io/i.test(t)) leaks.push(rel + ' → havingcorp.github.io');
  if (/\/officialsite\//i.test(t)) leaks.push(rel + ' → /officialsite/');
});
check(leaks.length === 0, 'domain leakage found:\n     ' + leaks.join('\n     '));

/* ---------------------------------------------------------- report ----- */
console.log('check-seo — origin ' + ORIGIN);
console.log('='.repeat(62));
if (warns.length) {
  console.log('\nWarnings (' + warns.length + '):');
  warns.forEach(function (w) { console.log('  ! ' + w); });
}
if (fails.length) {
  console.log('\nFailures (' + fails.length + '):');
  fails.forEach(function (f) { console.log('  x ' + f); });
}
console.log('\n' + '='.repeat(62));
console.log(pass + ' checks passed, ' + fails.length + ' failed, ' + warns.length + ' warnings');
process.exit(fails.length ? 1 : 0);
