# Cheerio (HTTP-Only) Scraping

## Overview

Cheerio is a fast, lightweight library for parsing HTML using jQuery-like syntax. It's perfect for static HTML sites that don't require JavaScript rendering.

## When to Use Cheerio

### ✅ USE Cheerio when:
- Website serves static HTML (server-side rendered)
- No JavaScript rendering needed
- Simple HTML structure
- High-volume scraping (5x faster than Playwright)
- Low memory requirements
- API doesn't exist but HTML is simple

### ❌ DON'T use Cheerio when:
- Site requires JavaScript (React, Vue, Angular)
- Content loads dynamically via AJAX
- Need to interact with page (clicks, forms)
- Need to execute JavaScript
- Single-page application (SPA)

## Quick Example

```javascript
import { CheerioCrawler, Dataset } from 'crawlee';

const crawler = new Cheer ioCrawler({
    async requestHandler({ $, request, log }) {
        log.info(`Scraping: ${request.url}`);

        // Use jQuery-like selectors
        const title = $('h1').text().trim();
        const price = $('.price').text().trim();
        const description = $('.description').text().trim();

        // Extract multiple items
        const products = [];
        $('.product').each((index, element) => {
            products.push({
                name: $(element).find('.name').text(),
                price: $(element).find('.price').text(),
            });
        });

        await Dataset.pushData({
            title,
            price,
            description,
            products,
        });
    },
});

await crawler.run(['https://example.com']);
```

## jQuery Selectors

Cheerio uses the same selector syntax as jQuery:

```javascript
// Basic selectors
$('h1')                          // Tag
$('.class-name')                 // Class
$('#id')                         // ID
$('div.product')                 // Tag + class
$('a[href]')                     // Attribute exists
$('a[href="https://..."]')       // Attribute value

// Hierarchy
$('div > p')                     // Direct child
$('div p')                       // Descendant
$('div + p')                     // Next sibling

// Traversal
$('h1').parent()                 // Parent element
$('div').find('.price')          // Find descendant
$('li').first()                  // First element
$('li').last()                   // Last element
$('li').eq(2)                    // Element at index

// Extraction
$('h1').text()                   // Text content
$('img').attr('src')             // Attribute value
$('div').html()                  // Inner HTML
```

## Common Patterns

### Pattern 1: Extract Single Values

```javascript
async requestHandler({ $, request }) {
    const data = {
        title: $('h1.title').text().trim(),
        price: $('.price').first().text().trim(),
        image: $('img.main-image').attr('src'),
        description: $('.description').text().trim(),
        rating: $('[data-rating]').attr('data-rating'),
    };

    await Dataset.pushData(data);
}
```

### Pattern 2: Extract Lists

```javascript
async requestHandler({ $, request }) {
    const products = [];

    $('.product-item').each((index, element) => {
        const $el = $(element);

        products.push({
            name: $el.find('.name').text().trim(),
            price: $el.find('.price').text().trim(),
            url: $el.find('a').attr('href'),
            image: $el.find('img').attr('src'),
        });
    });

    await Dataset.pushData(products);
}
```

### Pattern 3: Follow Links (Crawling)

```javascript
const crawler = new CheerioCrawler({
    async requestHandler({ $, request, enqueueLinks }) {
        // Extract data from current page
        const products = [];
        $('.product').each((i, el) => {
            products.push({
                name: $(el).find('.name').text(),
                price: $(el).find('.price').text(),
            });
        });

        await Dataset.pushData(products);

        // Enqueue links to other pages
        await enqueueLinks({
            selector: 'a.product-link',
            strategy: 'same-domain',
        });
    },
    maxRequestsPerCrawl: 100,
});

await crawler.run(['https://example.com']);
```

## Performance Comparison

| Metric | Cheerio | Playwright | Difference |
|--------|---------|-----------|------------|
| **Speed** | Very fast | Slow | 5-10x faster |
| **Memory** | Low (~50 MB) | High (~500 MB) | 10x less |
| **CPU** | Low | High | 5-10x less |
| **Concurrency** | High (50+) | Low (5-10) | Can run more in parallel |

**When scraping 1000 pages**:
- Cheerio: 5-10 minutes
- Playwright: 30-60 minutes

## Best Practices

### ✅ DO:

- **Use for static HTML sites**
- **High concurrency** (30-50 parallel requests)
- **Chain selectors** for complex queries
- **Trim text content** (`.text().trim()`)
- **Handle missing elements** (`?.`)
- **Combine with sitemaps** for URL discovery

### ❌ DON'T:

- **Use for JavaScript-heavy sites** (use Playwright)
- **Expect JavaScript execution**
- **Forget to handle missing elements**
- **Skip rate limiting** (respect robots.txt)

## Complete Example

```javascript
import { CheerioCrawler, Dataset } from 'crawlee';

const crawler = new CheerioCrawler({
    maxConcurrency: 30, // High concurrency for Cheerio
    maxRequestsPerMinute: 120,

    async requestHandler({ $, request, log }) {
        log.info(`Scraping: ${request.url}`);

        try {
            const data = {
                url: request.url,
                title: $('h1').text().trim(),
                price: $('.price').first().text().trim(),
                images: $('img.product-image')
                    .map((i, el) => $(el).attr('src'))
                    .get(),
                specs: {},
            };

            // Extract specifications
            $('.spec-row').each((i, el) => {
                const key = $(el).find('.spec-name').text().trim();
                const value = $(el).find('.spec-value').text().trim();
                data.specs[key] = value;
            });

            await Dataset.pushData(data);

        } catch (error) {
            log.error(`Error scraping ${request.url}: ${error.message}`);
        }
    },

    failedRequestHandler({ request }, { log }) {
        log.error(`Request failed: ${request.url}`);
    },
});

await crawler.run(['https://example.com']);
```

## When to Use Playwright Instead

Switch to Playwright if you see:
- Empty content (JavaScript-rendered)
- Infinite scroll
- "Load More" buttons
- Content appears after delay
- React/Vue/Angular indicators

## Related Resources

- **For JavaScript sites**: See `playwright-scraping.md`
- **For APIs**: See `api-discovery.md`
- **Selectors**: See `../reference/selector-guide.md`

## Summary

**Cheerio is 5-10x faster than Playwright** for static HTML!

**Key takeaways**:
1. Use for static HTML sites only
2. 5-10x faster than Playwright
3. High concurrency possible (30-50 parallel)
4. jQuery-like syntax (easy to use)
5. Falls back to Playwright for JavaScript sites
