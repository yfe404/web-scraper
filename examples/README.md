# Scraping Examples

Runnable code examples demonstrating different scraping patterns.

## Files in This Directory

1. **traffic-interception-basic.js** - Proxy-based reconnaissance (MCP tool sequence)
2. **sitemap-basic.js** - Get URLs from sitemap, scrape with CheerioCrawler
3. **api-scraper.js** - Pure API-based scraping (fastest)
4. **hybrid-sitemap-api.js** - Sitemap URLs + API data (best approach)
5. **iterative-fallback.js** - Try multiple approaches automatically

## How to Run

### Prerequisites

```bash
npm install crawlee got-scraping
```

### Run an Example

```bash
node sitemap-basic.js
node api-scraper.js
node hybrid-sitemap-api.js
node iterative-fallback.js
```

Note: `traffic-interception-basic.js` is a reference for proxy-mcp MCP tool calls, not a standalone Node.js script. It documents the tool call sequence used during interactive reconnaissance with Claude.

## Example Selection Guide

| Scenario | Example to Use |
|----------|----------------|
| First time scraping a site | `traffic-interception-basic.js` (reconnaissance) |
| Site has sitemap, unknown if has API | `iterative-fallback.js` |
| Site has sitemap, no API | `sitemap-basic.js` |
| Site has sitemap + known API | `hybrid-sitemap-api.js` |
| Site has known API, no sitemap | `api-scraper.js` |

## Modifying Examples

Each example is fully commented and can be adapted to your needs:

1. Change the `baseUrl` variable
2. Adjust selectors to match your target site
3. Modify data extraction logic
4. Adjust concurrency/rate limits

## Performance Comparison

Running these examples on a 1000-page e-commerce site:

| Example | Time | Memory | Best For |
|---------|------|---------|----------|
| `hybrid-sitemap-api.js` | 5 min | Low | Production use |
| `api-scraper.js` | 8 min | Low | API-first |
| `sitemap-basic.js` | 15 min | Low | Sitemap available (CheerioCrawler) |
| `iterative-fallback.js` | Varies | Varies | Unknown sites |

## Next Steps

After understanding these examples:
1. Read strategy guides in `../strategies/`
2. Check reference materials in `../reference/`
3. For production deployment, see `../apify/`

---

Back to main skill: `../SKILL.md`
