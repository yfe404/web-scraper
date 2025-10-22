# Hybrid Sitemap + API Scraper Example

Actor demonstrating the optimal pattern: sitemap for URL discovery, API for data fetching.

## What This Demonstrates

- Sitemap-based URL discovery
- ID extraction from URLs (regex)
- API-based data fetching (fast, reliable)
- TypeScript with got-scraping
- Hybrid approach (best of both worlds)

## Files

- `src/main.ts` - Main Actor code
- `.actor/actor.json` - Actor configuration
- `.actor/input_schema.json` - Input schema

## Usage

```bash
# Run locally
apify run --input='{"sitemapUrl":"https://example.com/sitemap.xml","apiBaseUrl":"https://api.example.com/products"}'

# Deploy
apify push

# Run on platform
apify call hybrid-api-scraper
```

## Input

```json
{
    "sitemapUrl": "https://example.com/sitemap.xml",
    "apiBaseUrl": "https://api.example.com/products",
    "idPattern": "/products/([^/]+)",
    "maxItems": 100
}
```

## Output

```json
{
    "id": "123",
    "url": "https://example.com/products/123",
    "name": "Product Name",
    "price": 99.99,
    "inStock": true,
    "scrapedAt": "2025-01-15T10:30:00.000Z"
}
```

## Pattern

1. Parse sitemap to get all URLs instantly
2. Extract IDs from URLs using regex
3. Fetch data via API (10-100x faster than HTML)
4. Save structured JSON to dataset

## Performance

For 1,000 products:
- Sitemap discovery: ~5 seconds
- API fetching: ~2-5 minutes
- **Total**: ~5 minutes vs ~45 minutes with pure Playwright
