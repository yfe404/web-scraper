# Scraping Strategies

This directory contains detailed guides for each web scraping approach.

## Strategy Selection Guide

Choose your strategy based on site characteristics:

```
Start with traffic interception → traffic-interception.md (ALWAYS FIRST)
    ↓
Does site have sitemap? → sitemap-discovery.md
    ↓
Does site have API? → api-discovery.md (FASTEST)
    ↓
Is site static HTML? → cheerio-scraping.md (FAST)
    ↓
Requires JavaScript? → dom-scraping.md (DevTools bridge)
    ↓
Want to combine? → hybrid-approaches.md (OPTIMAL)
    ↓
Getting blocked? → anti-blocking.md (MULTI-LAYER ANTI-DETECTION)
    ↓
Need session recording? → session-workflows.md (HAR EXPORT/REPLAY)
```

## Files in This Directory

1. **traffic-interception.md** - MITM proxy traffic capture (primary strategy)
2. **sitemap-discovery.md** - Fastest URL discovery (60x faster than crawling)
3. **api-discovery.md** - Best data quality (10-100x faster than scraping)
4. **dom-scraping.md** - DOM scraping via DevTools bridge + humanizer
5. **cheerio-scraping.md** - HTTP-only scraping for static HTML (5x faster)
6. **hybrid-approaches.md** - Combining strategies for optimal results
7. **anti-blocking.md** - Multi-layer anti-detection (stealth, humanizer, proxies, TLS)
8. **session-workflows.md** - Session recording, HAR export, replay

## Quick Comparison

| Strategy | Speed | Complexity | Best For |
|----------|-------|-----------|----------|
| Traffic Interception + API | ⚡⚡⚡⚡⚡ | Low | API discovery, all sites |
| Sitemap + API | ⚡⚡⚡⚡⚡ | Low | E-commerce, large catalogs |
| API only | ⚡⚡⚡⚡ | Medium | Structured data needs |
| Sitemap + Cheerio | ⚡⚡⚡⚡ | Low | Static sites with sitemaps |
| Cheerio | ⚡⚡⚡ | Low | Small static sites |
| DOM Scraping (DevTools) | ⚡⚡ | Medium | JavaScript-heavy sites |
| Anti-blocking | ⚡⚡ | High | Sites with bot detection |

## Recommended Reading Order

1. Start with `traffic-interception.md` (always capture traffic first)
2. Read `sitemap-discovery.md` (check for sitemaps)
3. Read `api-discovery.md` (APIs are best when available)
4. Read `dom-scraping.md` OR `cheerio-scraping.md` (based on site type)
5. Read `hybrid-approaches.md` (learn to combine strategies)
6. Read `anti-blocking.md` (when encountering 403/bot detection)
7. Read `session-workflows.md` (for recording and replay)

---

Back to main skill: `../SKILL.md`
