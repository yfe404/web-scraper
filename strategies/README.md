# Scraping Strategies

This directory contains detailed guides for each web scraping approach.

## Strategy Selection Guide

Choose your strategy based on site characteristics:

```
Does site have sitemap? → sitemap-discovery.md
    ↓
Does site have API? → api-discovery.md (FASTEST)
    ↓
Is site static HTML? → cheerio-scraping.md (FAST)
    ↓
Requires JavaScript? → playwright-scraping.md (FLEXIBLE)
    ↓
Want to combine? → hybrid-approaches.md (OPTIMAL)
    ↓
Getting blocked? → anti-blocking.md (FINGERPRINTING + PROXIES)
```

## Files in This Directory

1. **sitemap-discovery.md** - Fastest URL discovery (60x faster than crawling)
2. **api-discovery.md** - Best data quality (10-100x faster than scraping)
3. **playwright-scraping.md** - Browser-based scraping for JavaScript sites
4. **cheerio-scraping.md** - HTTP-only scraping for static HTML (5x faster)
5. **hybrid-approaches.md** - Combining strategies for optimal results
6. **anti-blocking.md** - Fingerprinting & proxies for blocked sites

## Quick Comparison

| Strategy | Speed | Complexity | Best For |
|----------|-------|-----------|----------|
| Sitemap + API | ⚡⚡⚡⚡⚡ | Low | E-commerce, large catalogs |
| API only | ⚡⚡⚡⚡ | Medium | Structured data needs |
| Sitemap + Cheerio | ⚡⚡⚡⚡ | Low | Static sites with sitemaps |
| Cheerio | ⚡⚡⚡ | Low | Small static sites |
| Playwright | ⚡⚡ | High | JavaScript-heavy sites |
| Anti-blocking | ⚡⚡ | High | Sites with bot detection |

## Recommended Reading Order

1. Start with `sitemap-discovery.md` (always check for sitemaps first)
2. Read `api-discovery.md` (APIs are best when available)
3. Read `playwright-scraping.md` OR `cheerio-scraping.md` (based on site type)
4. Read `hybrid-approaches.md` (learn to combine strategies)
5. Read `anti-blocking.md` (when encountering 403/bot detection)

---

Back to main skill: `../SKILL.md`
