# Basic Sitemap Scraper Example

Simple Actor that scrapes URLs from a sitemap using Playwright.

## What This Demonstrates

- Sitemap-based URL discovery with `RobotsFile`
- TypeScript Actor structure
- Basic Playwright scraping
- Typed input/output
- Error handling

## Files

- `src/main.ts` - Main Actor code
- `.actor/actor.json` - Actor configuration
- `.actor/input_schema.json` - Input schema

## Usage

```bash
# Run locally
apify run --input='{"sitemapUrl":"https://example.com/sitemap.xml","maxItems":10}'

# Deploy
apify push

# Run on platform
apify call basic-scraper
```

## Input

```json
{
    "sitemapUrl": "https://example.com/sitemap.xml",
    "urlPattern": "/products/.*",
    "maxItems": 100
}
```

## Output

```json
{
    "url": "https://example.com/product/1",
    "title": "Product Name",
    "description": "Product description",
    "scrapedAt": "2025-01-15T10:30:00.000Z"
}
```

## Pattern

1. Parse sitemap URLs
2. Filter by regex pattern
3. Scrape each URL with Playwright
4. Save to dataset
