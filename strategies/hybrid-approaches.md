# Hybrid Scraping Approaches

## Overview

Combine multiple strategies for optimal speed, reliability, and data quality. Hybrid approaches leverage the strengths of each method.

## Common Hybrid Patterns

### Pattern 1: Sitemap + API (Best Performance)

**Use case**: Site has sitemap + hidden API

**Advantages**:
- Instant URL discovery (sitemap)
- Clean structured data (API)
- 60x faster than crawling + scraping
- Most reliable data format

**Example**:
```javascript
import { RobotsFile } from 'crawlee';
import { gotScraping } from 'got-scraping';

// 1. Get all URLs from sitemap
const robots = await RobotsFile.find('https://shop.com');
const urls = await robots.parseUrlsFromSitemaps();

// 2. Extract IDs from URLs
const productIds = urls
    .map(url => url.match(/\/products\/(\d+)/)?.[1])
    .filter(Boolean);

console.log(`Found ${productIds.length} products`);

// 3. Fetch data via API (clean JSON)
for (const id of productIds) {
    const response = await gotScraping({
        url: `https://api.shop.com/v1/products/${id}`,
        responseType: 'json',
    });

    console.log(response.body); // Clean, structured data
}
```

**Performance**:
- URL discovery: 5-10 seconds (sitemap)
- Data fetching: 2-5 minutes (API)
- Total: ~5 minutes for 1000 products

### Pattern 2: Sitemap + Playwright

**Use case**: Site has sitemap but no API

**Advantages**:
- Fast URL discovery (sitemap)
- Can handle JavaScript (Playwright)
- No need to crawl for URLs

**Example**:
```javascript
import { PlaywrightCrawler, RobotsFile, Dataset } from 'crawlee';

// 1. Get URLs from sitemap
const robots = await RobotsFile.find('https://example.com');
const urls = await robots.parseUrlsFromSitemaps();

// 2. Scrape pages with Playwright
const crawler = new PlaywrightCrawler({
    maxConcurrency: 5,

    async requestHandler({ page, request, log }) {
        log.info(`Scraping: ${request.url}`);

        const data = await page.evaluate(() => ({
            title: document.querySelector('h1')?.textContent,
            price: document.querySelector('.price')?.textContent,
        }));

        await Dataset.pushData({ url: request.url, ...data });
    },
});

await crawler.addRequests(urls);
await crawler.run();
```

**Performance**:
- URL discovery: 5-10 seconds
- Scraping: 10-20 minutes (for 1000 pages)
- Total: ~20 minutes

### Pattern 3: Iterative Fallback

**Use case**: Unknown site, try simplest first

**Advantages**:
- Start with fastest approach
- Automatically fallback if fails
- Optimal for unknown sites

**Example**:
```javascript
async function scrapeWithFallback(url) {
    // Try 1: Sitemap + API
    try {
        console.log('Attempting: Sitemap + API...');
        const robots = await RobotsFile.find(url);
        const urls = await robots.parseUrlsFromSitemaps();

        if (urls.length > 0) {
            // Check for API
            const apiUrl = await discoverAPI(url);
            if (apiUrl) {
                console.log('✓ Using Sitemap + API (fastest)');
                return await scrapeSitemapAPI(urls, apiUrl);
            }
        }
    } catch (error) {
        console.log('✗ Sitemap + API failed');
    }

    // Try 2: Sitemap + Playwright
    try {
        console.log('Attempting: Sitemap + Playwright...');
        const robots = await RobotsFile.find(url);
        const urls = await robots.parseUrlsFromSitemaps();

        if (urls.length > 0) {
            console.log('✓ Using Sitemap + Playwright');
            return await scrapeSitemapPlaywright(urls);
        }
    } catch (error) {
        console.log('✗ Sitemap + Playwright failed');
    }

    // Try 3: Pure Playwright crawling
    try {
        console.log('Attempting: Playwright crawling...');
        console.log('✓ Using Playwright crawling (fallback)');
        return await scrapePlaywrightCrawl(url);
    } catch (error) {
        console.log('✗ All methods failed');
        throw error;
    }
}
```

### Pattern 4: API + Playwright Fallback

**Use case**: API for most data, Playwright for missing fields

**Advantages**:
- Fast API for core data
- Playwright for complex fields (reviews, dynamic content)
- Best data quality

**Example**:
```javascript
import { gotScraping } from 'got-scraping';
import { chromium } from 'playwright';

async function scrapeProduct(productId) {
    // 1. Get core data from API (fast)
    const apiData = await gotScraping({
        url: `https://api.shop.com/products/${productId}`,
        responseType: 'json',
    });

    // 2. Get complex data with Playwright
    const browser = await chromium.launch();
    const page = await browser.newPage();

    await page.goto(`https://shop.com/products/${productId}`);

    // Scrape reviews (dynamic content)
    const reviews = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('.review')).map(el => ({
            rating: el.querySelector('.rating')?.textContent,
            text: el.querySelector('.text')?.textContent,
        }));
    });

    await browser.close();

    // 3. Combine data
    return {
        ...apiData.body,
        reviews,
    };
}
```

### Pattern 5: Cheerio + Playwright Hybrid

**Use case**: Most pages static, some dynamic

**Advantages**:
- Fast Cheerio for static pages
- Playwright only when needed
- Optimal resource usage

**Example**:
```javascript
import { CheerioCrawler, PlaywrightCrawler, Dataset } from 'crawlee';

async function scrapeHybrid(urls) {
    // Try Cheerio first (fast)
    const cheerioCrawler = new CheerioCrawler({
        maxConcurrency: 30,
        async requestHandler({ $, request }) {
            // Check if content is present
            const title = $('h1').text();

            if (!title) {
                // Content missing (JavaScript-rendered)
                console.log(`Cheerio failed for ${request.url}, using Playwright...`);
                await playwrightCrawler.addRequests([request.url]);
                return;
            }

            // Extract with Cheerio (fast)
            await Dataset.pushData({
                url: request.url,
                title: title,
                price: $('.price').text(),
            });
        },
    });

    // Playwright for JavaScript pages
    const playwrightCrawler = new PlaywrightCrawler({
        async requestHandler({ page, request }) {
            const data = await page.evaluate(() => ({
                title: document.querySelector('h1')?.textContent,
                price: document.querySelector('.price')?.textContent,
            }));

            await Dataset.pushData({ url: request.url, ...data });
        },
    });

    await cheerioCrawler.run(urls);
}
```

## Decision Matrix

| Scenario | Best Approach | Speed | Data Quality |
|----------|---------------|-------|--------------|
| Sitemap + API exist | Sitemap + API | ⚡⚡⚡⚡⚡ | ⭐⭐⭐⭐⭐ |
| Sitemap + No API + Static | Sitemap + Cheerio | ⚡⚡⚡⚡ | ⭐⭐⭐⭐ |
| Sitemap + No API + Dynamic | Sitemap + Playwright | ⚡⚡⚡ | ⭐⭐⭐⭐ |
| No Sitemap + API | API Discovery | ⚡⚡⚡⭐ | ⭐⭐⭐⭐⭐ |
| Unknown Site | Iterative Fallback | ⚡⚡⚡ | ⭐⭐⭐⭐ |
| Mixed Static/Dynamic | Cheerio + Playwright | ⚡⚡⚡⚡ | ⭐⭐⭐⭐ |

## Best Practices

### ✅ DO:

- **Start with simplest approach** (sitemap/API)
- **Fallback to complex methods** if simple fails
- **Test small batch first** (5-10 items)
- **Log which method succeeded** for debugging
- **Combine strengths** (sitemap URLs + API data)
- **Use Cheerio for static content** (5x faster)
- **Reserve Playwright for when needed** (resource-intensive)

### ❌ DON'T:

- **Use Playwright if Cheerio works** (waste of resources)
- **Skip API discovery** (always check first!)
- **Forget fallback strategies** (sites change)
- **Mix approaches randomly** (be systematic)

## Complete Example: Full Hybrid

```javascript
import { RobotsFile } from 'crawlee';
import { gotScraping } from 'got-scraping';
import { chromium } from 'playwright';

async function scrapeWebsite(baseUrl) {
    console.log('🔍 Phase 1: Discovery');

    // Check for sitemap
    const robots = await RobotsFile.find(baseUrl);
    const sitemapUrls = await robots.parseUrlsFromSitemaps();

    console.log(`Found ${sitemapUrls.length} URLs in sitemap`);

    // Extract product IDs
    const productIds = sitemapUrls
        .map(url => url.match(/\/products\/(\d+)/)?.[1])
        .filter(Boolean);

    console.log(`Extracted ${productIds.length} product IDs`);

    console.log('🔍 Phase 2: API Discovery');

    // Try API first
    try {
        const testId = productIds[0];
        const apiResponse = await gotScraping({
            url: `https://api.${baseUrl.replace('https://', '')}/products/${testId}`,
            responseType: 'json',
            timeout: { request: 5000 },
        });

        console.log('✓ API found! Using API for data');

        // Use API for all products
        const results = [];
        for (const id of productIds) {
            const data = await gotScraping({
                url: `https://api.${baseUrl.replace('https://', '')}/products/${id}`,
                responseType: 'json',
            });
            results.push(data.body);
        }

        return results;

    } catch (error) {
        console.log('✗ No API found, using Playwright');
    }

    console.log('🔍 Phase 3: Playwright Scraping');

    // Fallback to Playwright
    const browser = await chromium.launch();
    const results = [];

    for (const url of sitemapUrls.slice(0, 10)) { // Test with 10 first
        const page = await browser.newPage();
        await page.goto(url);

        const data = await page.evaluate(() => ({
            title: document.querySelector('h1')?.textContent,
            price: document.querySelector('.price')?.textContent,
        }));

        results.push({ url, ...data });
        await page.close();
    }

    await browser.close();
    return results;
}

// Usage
const data = await scrapeWebsite('https://example.com');
console.log(`Scraped ${data.length} products`);
```

## Related Resources

- **Sitemap**: See `sitemap-discovery.md`
- **API**: See `api-discovery.md`
- **Playwright**: See `playwright-scraping.md`
- **Cheerio**: See `cheerio-scraping.md`
- **Examples**: See `../examples/hybrid-sitemap-api.js`
- **Examples**: See `../examples/iterative-fallback.js`

## Summary

**Hybrid approaches combine the best of each method!**

**Key takeaways**:
1. Sitemap + API = fastest (60x faster than crawling)
2. Start simple, fallback to complex
3. Test small batch first
4. Log which method succeeded
5. Combine strengths for optimal results
