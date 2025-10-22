# Sitemap-Based URL Discovery

## Overview

Sitemaps are XML files that list all URLs on a website, providing the fastest and most efficient way to discover pages to scrape. Instead of crawling page-by-page, you can get all URLs instantly.

## When to Use Sitemaps

### ✅ USE sitemaps when:
- Website has a sitemap (check `/sitemap.xml` or `robots.txt`)
- Large websites with 100+ pages
- Product catalogs, blogs, news sites
- Need complete site coverage
- URLs follow predictable patterns
- E-commerce sites (products, categories)
- Time-sensitive scraping (need fast results)

### ❌ DON'T use sitemaps when:
- Site doesn't have a sitemap
- Single-page applications with dynamic content
- Need to follow user flows (login, navigation, shopping cart)
- Sitemap is outdated or incomplete
- Crawling logic depends on page content
- Site uses heavy JavaScript for navigation

## Finding Sitemaps

Sitemaps are typically found at these locations:

```
https://example.com/sitemap.xml              ← Most common
https://example.com/robots.txt               ← Lists sitemap URLs
https://example.com/sitemap_index.xml        ← Sitemap of sitemaps
https://example.com/product-sitemap.xml      ← Product-specific
https://example.com/sitemap.xml.gz           ← Compressed
https://example.com/sitemaps/sitemap.xml     ← In subdirectory
```

### Always Check robots.txt First

```bash
curl https://example.com/robots.txt
```

Example robots.txt:
```
User-agent: *
Sitemap: https://example.com/sitemap_index.xml
Sitemap: https://example.com/products-sitemap.xml
Sitemap: https://example.com/blog-sitemap.xml
```

## Implementation Patterns

### Pattern 1: Automatic Discovery (Recommended)

Use `RobotsFile` to automatically find and parse all sitemaps:

```javascript
import { PlaywrightCrawler, RobotsFile, Dataset } from 'crawlee';

// Automatically finds robots.txt and parses ALL sitemaps
const robots = await RobotsFile.find('https://example.com');
const allUrls = await robots.parseUrlsFromSitemaps();

console.log(`Found ${allUrls.length} URLs from sitemaps`);

// Create crawler
const crawler = new PlaywrightCrawler({
    async requestHandler({ page, request, log }) {
        log.info(`Scraping: ${request.url}`);

        const data = await page.evaluate(() => ({
            title: document.title,
            price: document.querySelector('.price')?.textContent,
            description: document.querySelector('.description')?.textContent,
        }));

        await Dataset.pushData(data);
    },
});

// Add all sitemap URLs
await crawler.addRequests(allUrls);
await crawler.run();
```

**Benefits**:
- Handles sitemap indexes (nested sitemaps)
- Handles compressed sitemaps (.gz)
- Respects robots.txt rules
- No need to know sitemap URLs upfront

### Pattern 2: Filtered URLs with Regex

Use `RequestList` to filter only specific URL patterns:

```javascript
import { PlaywrightCrawler, RequestList, Dataset } from 'crawlee';

// Load sitemap and filter URLs with regex
const requestList = await RequestList.open(null, [{
    requestsFromUrl: 'https://shop.com/sitemap.xml',
    // Only product pages (not categories, help pages, etc.)
    regex: /\/products\/[a-z0-9-]+$/i,
}]);

const crawler = new PlaywrightCrawler({
    requestList,
    async requestHandler({ page, request, log }) {
        log.info(`Scraping product: ${request.url}`);

        const product = await page.evaluate(() => ({
            name: document.querySelector('h1')?.textContent,
            price: document.querySelector('[data-testid="price"]')?.textContent,
            sku: document.querySelector('[data-sku]')?.dataset.sku,
        }));

        await Dataset.pushData(product);
    },
});

await crawler.run();
```

**Common Regex Patterns**:

```javascript
// Products only
regex: /\/products\/[a-z0-9-]+$/i

// Blog posts (with date pattern)
regex: /\/blog\/\d{4}\/\d{2}\/[a-z0-9-]+/i

// Exclude categories, only products
regex: /\/products\/[^/<]+$/

// Multiple patterns (products OR deals)
regex: /(\/products\/[^/<]+|\/deals\/[^/<]+)/

// Specific category
regex: /\/products\/electronics\/[^/<]+$/
```

See `../reference/regex-patterns.md` for more patterns.

### Pattern 3: Multiple Specific Sitemaps

Load specific sitemap URLs directly:

```javascript
import { PlaywrightCrawler, Sitemap, Dataset } from 'crawlee';

// Load multiple sitemaps
const sitemap = await Sitemap.load([
    'https://example.com/product-sitemap.xml',
    'https://example.com/blog-sitemap.xml.gz', // Handles .gz automatically
]);

console.log(`Found ${sitemap.urls.length} URLs`);

const crawler = new PlaywrightCrawler({
    async requestHandler({ page, request, log }) {
        // Handle both products and blog posts
        if (request.url.includes('/products/')) {
            // Scrape product
            const product = await page.evaluate(() => ({
                name: document.querySelector('h1')?.textContent,
                price: document.querySelector('.price')?.textContent,
            }));
            await Dataset.pushData({ type: 'product', ...product });
        } else if (request.url.includes('/blog/')) {
            // Scrape blog post
            const post = await page.evaluate(() => ({
                title: document.querySelector('h1')?.textContent,
                content: document.querySelector('.content')?.textContent,
            }));
            await Dataset.pushData({ type: 'post', ...post });
        }
    },
});

await crawler.addRequests(sitemap.urls);
await crawler.run();
```

### Pattern 4: Hybrid (Sitemap + Crawling)

Start with sitemap, then also crawl discovered links:

```javascript
import { PlaywrightCrawler, RobotsFile, Dataset } from 'crawlee';

// Start with sitemap URLs
const robots = await RobotsFile.find('https://example.com');
const sitemapUrls = await robots.parseUrlsFromSitemaps();

const crawler = new PlaywrightCrawler({
    maxRequestsPerCrawl: 5000,
    async requestHandler({ page, enqueueLinks, request, log }) {
        log.info(`Processing: ${request.url}`);

        // Scrape data
        const data = await page.evaluate(() => ({
            title: document.title,
            links: Array.from(document.querySelectorAll('a')).map(a => a.href),
        }));

        await Dataset.pushData(data);

        // ALSO crawl discovered links (optional)
        await enqueueLinks({
            selector: 'a[href*="/products/"]',
            strategy: 'same-domain',
        });
    },
});

// Start with all sitemap URLs
await crawler.addRequests(sitemapUrls);
await crawler.run();
```

## URL Filtering Techniques

### Using lastmod Dates

Filter URLs by last modification date:

```javascript
import { Sitemap } from 'crawlee';

const sitemap = await Sitemap.load(['https://site.com/sitemap.xml']);

// Filter to recently updated URLs (last 30 days)
const recentUrls = sitemap.urls.filter(urlObj => {
    const lastMod = new Date(urlObj.lastmod);
    const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    return lastMod > monthAgo;
}).map(urlObj => urlObj.loc);

console.log(`Found ${recentUrls.length} recently updated URLs`);
```

### Using Priority

Filter by sitemap priority (0.0 to 1.0):

```javascript
// Get only high-priority pages
const highPriorityUrls = sitemap.urls.filter(urlObj => {
    return parseFloat(urlObj.priority) >= 0.8;
}).map(urlObj => urlObj.loc);
```

## Error Handling

Always handle cases where sitemaps might not exist or be malformed:

```javascript
import { PlaywrightCrawler, RobotsFile, Dataset } from 'crawlee';

try {
    // Try to find and parse sitemaps
    const robots = await RobotsFile.find('https://example.com');
    const urls = await robots.parseUrlsFromSitemaps();

    if (urls.length === 0) {
        console.log('⚠ No URLs found in sitemaps, falling back to crawling');
        // Fall back to traditional crawling
        await crawler.run(['https://example.com']);
    } else {
        console.log(`✓ Found ${urls.length} URLs, starting scrape`);

        const crawler = new PlaywrightCrawler({
            async requestHandler({ page, request, log }) {
                // Scrape logic
            },
            failedRequestHandler({ request, error }, { log }) {
                log.error(`Request ${request.url} failed: ${error.message}`);
            },
        });

        await crawler.addRequests(urls);
        await crawler.run();
    }
} catch (error) {
    console.error(`✗ Sitemap discovery failed: ${error.message}`);
    console.log('Falling back to traditional crawling');
    // Implement fallback strategy
}
```

## Best Practices

### ✅ DO:

- **Check robots.txt first** for sitemap locations
- **Use `RobotsFile.find()`** for automatic discovery
- **Filter URLs with regex** when you only need specific page types
- **Verify sitemap is current** before relying on it (check lastmod dates)
- **Use `lastmod` dates** to avoid re-scraping unchanged content
- **Handle compressed sitemaps** (.gz files) - Crawlee does this automatically
- **Combine with crawling** for completeness if needed
- **Test sitemap URLs** before running full scrape (sample 5-10 first)
- **Log progress** clearly (URLs found, filtered, scraped)

### ❌ DON'T:

- **Assume all sites have sitemaps** - always have a fallback
- **Trust sitemaps to be complete** - some pages may be missing
- **Use sitemaps for dynamic/SPA content** - crawling is better
- **Forget to filter URLs** - sitemaps often include pages you don't need
- **Ignore robots.txt rules** - respect crawl directives
- **Scrape login-protected pages** from sitemaps - won't work
- **Skip error handling** - some sitemap URLs may be broken
- **Ignore rate limits** - even with sitemaps, respect robots.txt crawl-delay

## Performance Comparison

| Metric | Sitemap | Traditional Crawling | Improvement |
|--------|---------|----------------------|-------------|
| **URL Discovery** | 5-10 seconds | 5-10 minutes | ⚡ 60x faster |
| **Bandwidth** | ~2 MB | ~200 MB | 💾 100x less |
| **Coverage** | 100% (if current) | 80-90% | ✅ Better |
| **Time to First Data** | 10-20 seconds | 5-10 minutes | ⏱️ 30x faster |

## Troubleshooting

### Problem: No URLs found in sitemap

**Solutions**:
```javascript
// 1. Check if sitemap exists manually
const response = await fetch('https://example.com/sitemap.xml');
if (!response.ok) {
    console.log('No sitemap found at /sitemap.xml');
}

// 2. Check robots.txt
const robotsResponse = await fetch('https://example.com/robots.txt');
const robotsText = await robotsResponse.text();
console.log('Sitemap directives:', robotsText.match(/Sitemap:.+/gi));

// 3. Fall back to crawling
console.log('Falling back to traditional crawling');
```

### Problem: Sitemap has too many irrelevant URLs

**Solution**: Use regex filtering
```javascript
const requestList = await RequestList.open(null, [{
    requestsFromUrl: 'https://site.com/sitemap.xml',
    regex: /\/products\/[^/<]+$/, // Only product pages
}]);
```

### Problem: Sitemap URLs return 404

**Solution**: Add error handling
```javascript
const crawler = new PlaywrightCrawler({
    failedRequestHandler({ request, error }, { log }) {
        log.warning(`URL from sitemap returned error: ${request.url}`);
        // Don't crash, just log and continue
    },
});
```

## Related Resources

- **Regex patterns**: See `../reference/regex-patterns.md`
- **Hybrid approaches**: See `hybrid-approaches.md`
- **API discovery**: See `api-discovery.md` (often better than scraping)
- **Examples**: See `../examples/sitemap-basic.js`

## Summary

**Sitemaps are the FASTEST way to discover URLs** - use them whenever possible!

**Key takeaways**:
1. Always check for sitemaps first (60x faster than crawling)
2. Use `RobotsFile.find()` for automatic discovery
3. Filter with regex to get only relevant URLs
4. Always have a fallback to crawling
5. Combine with API discovery for best results
