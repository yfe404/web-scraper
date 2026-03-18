# Framework Signatures

Lookup table for framework detection. Used in Phase 0 (Quick Assessment) and Phase 1 (Browser Reconnaissance) to focus searches on relevant data locations and skip patterns that don't apply.

## Response Header Signatures

| Header | Value Contains | Framework | Data Locations to Search |
|--------|---------------|-----------|--------------------------|
| `X-Powered-By` | `Next.js` | Next.js | `__NEXT_DATA__` script tag, `/_next/data/` API |
| `X-Powered-By` | `Nuxt` | Nuxt.js | `__NUXT__` / `__NUXT_DATA__` script tag |
| `X-Powered-By` | `Express` | Express/Node | JSON APIs, check `/api/` paths |
| `Server` | `cloudflare` | Cloudflare (CDN) | Not a framework — note protection layer |
| `Link` | `</wp-content/` | WordPress | `/wp-json/wp/v2/` REST API, `ld+json` |
| `X-Shopify-Stage` | any | Shopify | `ld+json`, `/products.json`, `/collections.json` |
| `X-Drupal-Cache` | any | Drupal | `/jsonapi/`, `ld+json` |

## HTML Signatures

Detect these patterns in raw HTML (curl output) to identify framework and data sources.

| Pattern | Framework | What to Search | What to Skip |
|---------|-----------|---------------|--------------|
| `<script id="__NEXT_DATA__"` | Next.js | Parse JSON from that script tag | Don't search for `__NUXT__` or `__INITIAL_STATE__` |
| `window.__NUXT__` or `__NUXT_DATA__` | Nuxt.js | Parse embedded state object | Don't search for `__NEXT_DATA__` |
| `window.__INITIAL_STATE__` | Vue/Redux SSR | Parse embedded state JSON | Skip API sniffing if state has all data |
| `/wp-content/` in `<link>` tags | WordPress | `/wp-json/wp/v2/` API, `ld+json` blocks | Don't search for SPA state objects |
| `ng-version=` | Angular | Look for XHR/fetch API calls | Skip SSR data extraction |
| `data-reactroot` | React (CSR) | Look for XHR/fetch API calls | Skip SSR data objects (none exist) |
| `<script type="application/ld+json"` | Any (structured data) | Parse JSON-LD for product/article data | May be partial — verify completeness |
| `data-turbo-` | Rails/Turbo | Standard HTML selectors, no SPA state | Skip SPA framework patterns |
| `_sveltekit` | SvelteKit | Embedded data in `__data` nodes | Don't search for React/Vue patterns |

## Known Major Sites

Sites with well-known structures. Skip generic detection when URL matches.

| Domain Pattern | Architecture | Data Strategy | Notes |
|----------------|-------------|---------------|-------|
| `amazon.com`, `amazon.*` | Custom SSR (no framework) | HTML selectors (`span.a-price`, `#productTitle`) | **No JSON-LD**, no `__NEXT_DATA__`, prices are geo-locked |
| `*.shopify.com`, Shopify stores | Shopify Liquid | `ld+json` + `/products.json` endpoint | Append `.json` to product URLs |
| `*.wordpress.com`, WP sites | WordPress | `/wp-json/wp/v2/` REST API | Check `robots.txt` for API access |
| `*.medium.com` | React SSR | `window.__APOLLO_STATE__` | GraphQL-backed |
| `linkedin.com` | Ember → React | Heavy protection, `ld+json` for public profiles | Requires authentication for most data |
| `*.wixsite.com` | Wix | `window.warmupData` or `window.wixEmbedsAPI` | Complex state structure |

## Framework → Search Strategy

After detecting framework, use this table to decide what to search and what to skip.

| Detected Framework | Search First | Search If Needed | Skip Entirely |
|-------------------|-------------|-----------------|---------------|
| **Next.js** | `__NEXT_DATA__` JSON | `/_next/data/` API routes | `__NUXT__`, `__INITIAL_STATE__`, `/wp-json/` |
| **Nuxt.js** | `__NUXT__` / `__NUXT_DATA__` | XHR/fetch API calls | `__NEXT_DATA__`, `/wp-json/` |
| **WordPress** | `/wp-json/wp/v2/` API | `ld+json`, HTML selectors | SPA state objects |
| **Shopify** | `ld+json` + `.json` URL suffix | `/products.json` collection endpoint | SPA state objects, `/wp-json/` |
| **React CSR** | XHR/fetch API calls (browser required) | DOM selectors from rendered page | SSR data objects |
| **Angular** | XHR/fetch API calls (browser required) | DOM selectors from rendered page | SSR data objects |
| **Custom SSR** (no framework detected) | HTML selectors, `ld+json` | API endpoints in traffic | SPA state objects |
| **Static HTML** | HTML selectors | Sitemaps for URL discovery | APIs, SPA state, framework patterns |

## Usage

**Phase 0** (curl-based): Check response headers, then search HTML body for signatures. Match against Known Major Sites first (by domain), then fall back to HTML Signatures table.

**Phase 1** (browser): If Phase 0 couldn't determine framework, check rendered DOM and network traffic against these patterns. Use the Framework → Search Strategy table to focus browser reconnaissance.

**Key principle**: Detect first, then search only relevant patterns. Never shotgun-search all patterns on every site.
