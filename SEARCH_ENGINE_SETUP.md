# Search Engine Setup

Search indexing configuration for **https://having.co.kr** (repository: `HavingCorp/officialsite`, hosted on GitHub Pages).

---

## What is in place

| Item | Location | Notes |
|---|---|---|
| robots.txt | `/robots.txt` | Allows all crawlers, points to the sitemap |
| sitemap.xml | `/sitemap.xml` | 10 public pages, absolute `https://having.co.kr` URLs |
| Per-page `<title>` | every public page | Exactly one per page |
| Per-page `meta description` | every public page | Written per page, 91–150 characters |
| `link rel="canonical"` | every public page | Always on `https://having.co.kr` |
| Open Graph | every public page | `og:type`, `og:site_name`, `og:locale`, `og:title`, `og:description`, `og:url`, `og:image` |
| Twitter Card | every public page | `summary_large_image` where a share image exists |
| Organization JSON-LD | `index.html` only | Name, URL, logo, address, sales email |
| Share images | `/assets/og/og-*.jpg` | 1200×630, generated from the existing page hero art |
| `noindex` on orphans | `ingredients-en.html`, `ingredients-ko.html` | Superseded duplicates, kept out of the index |

Live URLs once deployed:

- Robots: `https://having.co.kr/robots.txt`
- Sitemap: `https://having.co.kr/sitemap.xml`

---

## How page SEO is managed

All per-page SEO lives in one file: **`seo.config.json`**.

```json
{
  "file": "about.html",
  "path": "/about.html",
  "title": "About Us · Having Corp.",
  "description": "Having Corp. is a Korean beauty trade partner ...",
  "ogImage": "assets/og/og-about.jpg",
  "ogType": "website"
}
```

| Field | Meaning |
|---|---|
| `file` | HTML file at the repository root |
| `path` | URL path on the production domain. Home page is `/` |
| `title` | `<title>`, `og:title`, `twitter:title` |
| `description` | `meta description`, `og:description`, `twitter:description` |
| `ogImage` | Optional. Repo-relative path. Omit if the page has no share image |
| `ogType` | Usually `website` |

Never hand-edit the SEO tags inside an HTML file. Everything between
`<!-- seo:begin -->` and `<!-- seo:end -->` is regenerated and will be
overwritten. Edit `seo.config.json` and re-run the scripts.

---

## Scripts

Node.js only, standard library, no dependencies and no build step.

```bash
node scripts/apply-seo.js         # write SEO tags into every HTML page
node scripts/generate-sitemap.js  # regenerate sitemap.xml and robots.txt
node scripts/check-seo.js         # validate everything (exit code 1 on failure)
```

`apply-seo.js --check` reports what would change without writing.

`apply-seo.js` is idempotent. It removes the previous generated block plus any
stray `title` / `description` / `canonical` / `og:` / `twitter:` /
Organization JSON-LD tag in `<head>` before writing a fresh block, so running
it repeatedly never produces duplicates.

### What `check-seo.js` verifies

- Every configured page exists
- Exactly one `title`, `meta description`, `canonical` per page
- `canonical` and `og:url` match the configured path on the production origin
- Open Graph and Twitter tags present exactly once
- Every referenced `og:image` file exists on disk
- Home page Organization JSON-LD parses and uses absolute production URLs
- `sitemap.xml` is well formed, has no duplicates, and every `<loc>` maps to a real file
- No configured page is missing from the sitemap, no excluded file is present
- `robots.txt` references the sitemap
- `CNAME` still exists and matches the origin
- No `havingcorp.github.io` or `/officialsite/` anywhere in the repository

---

## Adding a new page

1. Create the HTML file at the repository root.
2. Add an entry to the `pages` array in `seo.config.json`.
3. Optional: add a 1200×630 share image under `assets/og/` and set `ogImage`.
4. Run:

```bash
node scripts/apply-seo.js
node scripts/generate-sitemap.js
node scripts/check-seo.js
```

5. Commit and push. Deploy is automatic via GitHub Pages.
6. In Search Console, submit the new URL under **URL Inspection → Request indexing**.

To keep a page out of the sitemap, add its filename to `excludeFromSitemap`.
To also stop Google indexing it, add the filename to `noindexPages` — the
script writes `<meta name="robots" content="noindex, follow">` into that file.

---

## Google Search Console

Already completed, outside the scope of this work:

- `having.co.kr` property registered
- Ownership verified
- Gabia DNS configured
- GitHub Pages custom domain connected, `CNAME` present at the repository root

**Do not** modify DNS records, the `CNAME` file, or the ownership verification
token. No verification TXT or CNAME value is stored in this repository.

### After deploying, do this in Search Console

1. **Sitemaps** → submit `sitemap.xml`
2. **URL Inspection** → test the live URLs, starting with:
   - `https://having.co.kr/`
   - `https://having.co.kr/ingredients.html`
   - `https://having.co.kr/finished.html`
3. For each key page, click **Request indexing**
4. Check **Indexing → Pages** after a few days to see what was indexed and why anything was excluded

Indexing is never immediate or guaranteed. Google decides both whether and when
to index a page. A new site typically takes several days to a few weeks before
pages appear consistently in search results. Requesting indexing speeds up
discovery, it does not force inclusion.

---

## Files that should not be public

These were uploaded to the repository by mistake during earlier work. They are
served publicly at `https://having.co.kr/...` right now. Nothing breaks if they
stay, but deleting them is recommended:

| Path | What it is |
|---|---|
| `README.txt` | Notes from a past update package |
| `이미지변환/` | Logo conversion script and empty input folders |
| `ingredients-en.html`, `ingredients-ko.html` | Old split versions, replaced by `ingredients.html`. Not linked from anywhere |
| `ingredients-en.json`, `ingredients-ko.json` | Source data for the above |

The two orphan HTML files are the only ones with a real SEO cost: they hold the
same ingredient content as `ingredients.html`, so Google could index them as
duplicates. They are tagged `noindex` as a safeguard. Deleting them is cleaner —
after deleting, remove them from `noindexPages` and `excludeFromSitemap` in
`seo.config.json`.

---

## Known limitations

- **Bilingual content is not exposed to crawlers.** The site switches between
  English and Korean in the browser via `js/common.js` and a cookie. The HTML
  served to Google is always the English default, so only the English version
  can be indexed. Serving both languages properly would need separate URLs
  (for example `/ko/about.html`) plus `hreflang` tags. That is a structural
  change and was deliberately left out of this work.
- **`lastmod` is not set in the sitemap.** The repository carries no reliable
  per-page modification history, and an invented date is worse than none.
  If accurate dates become available, add a `lastmod` field per page in
  `seo.config.json` and extend `generate-sitemap.js`.
- **Share images are cropped from page hero art.** They are correctly sized at
  1200×630 but are not purpose-designed cards with the logo or a headline.
  A designed set would present better when links are shared.
- **`privacy.html` and `terms.html` are included in the sitemap.** They are
  genuine linked pages. Remove them via `excludeFromSitemap` if you would
  rather they not compete for search impressions.
