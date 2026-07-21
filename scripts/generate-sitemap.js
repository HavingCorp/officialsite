#!/usr/bin/env node
/**
 * generate-sitemap.js
 *
 * Writes sitemap.xml and robots.txt at the repository root from
 * seo.config.json. Only pages that exist on disk are included.
 *
 * lastmod is intentionally omitted: the repository has no reliable
 * per-page modification history, and a guessed date is worse than none.
 *
 * Node standard library only. No dependencies.
 *
 *   node scripts/generate-sitemap.js
 */

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const CONFIG = path.join(ROOT, 'seo.config.json');

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function main() {
  const cfg = JSON.parse(fs.readFileSync(CONFIG, 'utf8'));
  const origin = cfg.site.origin.replace(/\/+$/, '');
  const excluded = new Set(cfg.excludeFromSitemap || []);

  const entries = [];
  const skipped = [];

  cfg.pages.forEach(function (p) {
    if (excluded.has(p.file)) { skipped.push(p.file + ' (excluded)'); return; }
    if (!fs.existsSync(path.join(ROOT, p.file))) { skipped.push(p.file + ' (file not found)'); return; }
    entries.push(origin + (p.path === '/' ? '/' : p.path));
  });

  const xml =
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    entries.map(function (u) { return '  <url>\n    <loc>' + esc(u) + '</loc>\n  </url>'; }).join('\n') +
    '\n</urlset>\n';

  fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), xml, 'utf8');

  const robots =
    'User-agent: *\n' +
    'Allow: /\n' +
    '\n' +
    'Sitemap: ' + origin + '/sitemap.xml\n';

  fs.writeFileSync(path.join(ROOT, 'robots.txt'), robots, 'utf8');

  console.log('generate-sitemap — origin ' + origin);
  console.log('-'.repeat(60));
  entries.forEach(function (u) { console.log('  + ' + u); });
  skipped.forEach(function (s) { console.log('  - ' + s); });
  console.log('-'.repeat(60));
  console.log('sitemap.xml: ' + entries.length + ' urls');
  console.log('robots.txt : written');
}

main();
