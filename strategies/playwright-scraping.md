# Playwright-Based Scraping

## Overview

Use Playwright when websites require JavaScript rendering, user interactions, or when APIs and sitemaps aren't available. Playwright provides a real browser environment for complex scraping scenarios.

## When to Use Playwright

### ✅ USE Playwright when:
- Site requires JavaScript rendering (React, Vue, Angular, etc.)
- Need to interact with page elements (clicks, forms, scrolling)
- Content loads dynamically (AJAX, infinite scroll)
- No sitemap or API available
- Authentication flows required (login, cookies)
- Need to capture screenshots or PDFs
- Single-page applications (SPAs)

### ❌ DON'T use Playwright when:
- Site has an API (use API instead - 10x faster)
- Static HTML works fine (use Cheerio - 5x faster)
- Simple GET requests sufficient
- Site has sitemaps (combine with sitemap for URLs)
- High-volume scraping (resource intensive)

## Selector Strategies (Priority Order)

Always use selectors in this priority order (most stable → least stable):

### 1. Role-Based Selectors (Most Stable)

```javascript
// Get by role and name
await page.getByRole('button', { name: 'Add to cart' }).click();
await page.getByRole('heading', { level: 1 }).textContent();
await page.getByRole('link', { name: 'Next page' }).click();

// Common roles
page.getByRole('button')
page.getByRole('link')
page.getByRole('textbox')
page.getByRole('checkbox')
page.getByRole('heading')
page.getByRole('list')
page.getByRole('listitem')
```

**Why**: Based on semantic HTML, survives CSS/class name changes.

### 2. Test IDs (Developer-Friendly)

```javascript
await page.getByTestId('product-price').textContent();
await page.getByTestId('add-to-cart-button').click();
```

**Why**: Designed for testing, stable across refactors.

### 3. Labels (Form Elements)

```javascript
await page.getByLabel('Email').fill('test@example.com');
await page.getByLabel('Password').fill('password123');
await page.getByLabel('Remember me').check();
```

**Why**: Accessible, user-centric, stable.

### 4. Text Content

```javascript
await page.getByText('Sign in').click();
await page.getByText('Add to cart').click();
```

**Why**: Works when text is stable, intuitive.

### 5. CSS/XPath (Last Resort)

```javascript
// CSS selectors
const price = await page.locator('.product-price').textContent();
const title = await page.locator('h1.title').textContent();

// XPath
const element = await page.locator('xpath=//div[@class="content"]');
```

**Why**: Fragile, breaks when HTML structure changes. Use only when nothing else works.

## Auto-Waiting (Never Use setTimeout!)

Playwright automatically waits for elements. **Never use arbitrary timeouts**.

### ❌ BAD - Arbitrary Waits

```javascript
await page.waitForTimeout(5000); // DON'T DO THIS!
await page.waitForTimeout(3000); // NEVER!
```

### ✅ GOOD - Wait for Specific Conditions

```javascript
// Wait for element to be visible
await page.waitForSelector('.product-loaded');

// Wait for network to be idle
await page.waitForLoadState('networkidle');

// Wait for specific URL
await page.waitForURL('**/products/**');

// Wait with assertions (best)
await expect(page.getByRole('heading')).toBeVisible();
```

### ✅ BETTER - Implicit Waiting

Playwright actions automatically wait:

```javascript
// Automatically waits for element to be:
// - Attached to DOM
// - Visible
// - Stable (not animating)
// - Enabled
await page.getByRole('button').click();

// Automatically waits for element
const title = await page.getByRole('heading').textContent();
```

## Basic Scraping Pattern

```javascript
import { PlaywrightCrawler, Dataset } from 'crawlee';

const crawler = new PlaywrightCrawler({
    async requestHandler({ page, request, log }) {
        log.info(`Scraping: ${request.url}`);

        // Navigate if needed
        await page.goto(request.url, {
            waitUntil: 'domcontentloaded',
        });

        // Wait for content
        await page.waitForSelector('.product-info');

        // Extract data
        const data = await page.evaluate(() => ({
            title: document.querySelector('h1')?.textContent?.trim(),
            price: document.querySelector('.price')?.textContent?.trim(),
            description: document.querySelector('.description')?.textContent?.trim(),
            images: Array.from(document.querySelectorAll('.product-image'))
                .map(img => img.src),
            inStock: document.querySelector('.in-stock') !== null,
        }));

        // Save data
        await Dataset.pushData({
            url: request.url,
            ...data,
            scrapedAt: new Date().toISOString(),
        });
    },
});

await crawler.run(['https://example.com/product/123']);
```

## Common Patterns

### Pattern 1: Extract with page.evaluate()

```javascript
const data = await page.evaluate(() => {
    return {
        title: document.title,
        price: document.querySelector('.price')?.textContent,
        // Extract multiple items
        products: Array.from(document.querySelectorAll('.product')).map(el => ({
            name: el.querySelector('.name')?.textContent,
            price: el.querySelector('.price')?.textContent,
        })),
    };
});
```

### Pattern 2: Extract with Playwright Locators

```javascript
const title = await page.locator('h1').textContent();
const price = await page.locator('.price').textContent();

// Extract multiple elements
const productNames = await page.locator('.product-name').allTextContents();
```

### Pattern 3: Handle Dynamic Content

```javascript
// Infinite scroll
async function scrollToBottom(page) {
    let previousHeight = 0;
    let currentHeight = await page.evaluate(() => document.body.scrollHeight);

    while (previousHeight !== currentHeight) {
        previousHeight = currentHeight;
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await page.waitForTimeout(1000); // Small delay for content to load
        currentHeight = await page.evaluate(() => document.body.scrollHeight);
    }
}

await scrollToBottom(page);
// Now extract all loaded content
```

### Pattern 4: Click "Load More" Buttons

```javascript
while (true) {
    const loadMore = await page.locator('button:has-text("Load More")').count();

    if (loadMore === 0) {
        break; // No more button
    }

    await page.getByRole('button', { name: 'Load More' }).click();
    await page.waitForLoadState('networkidle');
}

// Now extract all loaded products
```

### Pattern 5: Handle Pagination

```javascript
let currentPage = 1;
const maxPages = 10;

while (currentPage <= maxPages) {
    console.log(`Scraping page ${currentPage}...`);

    // Extract data from current page
    const products = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('.product')).map(el => ({
            name: el.querySelector('.name')?.textContent,
            price: el.querySelector('.price')?.textContent,
        }));
    });

    await Dataset.pushData(products);

    // Check if next page exists
    const nextButton = await page.locator('a.next-page').count();
    if (nextButton === 0) {
        break;
    }

    // Go to next page
    await page.getByRole('link', { name: 'Next' }).click();
    await page.waitForLoadState('networkidle');

    currentPage++;
}
```

## Authentication

### Pattern 1: Login Flow

```javascript
import { PlaywrightCrawler } from 'crawlee';

const crawler = new PlaywrightCrawler({
    async requestHandler({ page, request, log }) {
        // Navigate to login page
        await page.goto('https://example.com/login');

        // Fill login form
        await page.getByLabel('Email').fill('user@example.com');
        await page.getByLabel('Password').fill('password123');
        await page.getByRole('button', { name: 'Sign in' }).click();

        // Wait for redirect
        await page.waitForURL('**/dashboard');

        // Now navigate to target page
        await page.goto(request.url);

        // Extract data
        // ...
    },
});
```

### Pattern 2: Reuse Authenticated Session

```javascript
// Save session after first login
const context = await browser.newContext();
const page = await context.newPage();

// Login once
await page.goto('https://example.com/login');
// ... login flow ...

// Save cookies/localStorage
const cookies = await context.cookies();
const localStorage = await page.evaluate(() => JSON.stringify(localStorage));

// Reuse in new sessions
const newContext = await browser.newContext({
    storageState: {
        cookies: cookies,
        origins: [{
            origin: 'https://example.com',
            localStorage: JSON.parse(localStorage),
        }],
    },
});
```

## Error Handling

```javascript
const crawler = new PlaywrightCrawler({
    async requestHandler({ page, request, log }) {
        try {
            await page.goto(request.url, {
                waitUntil: 'domcontentloaded',
                timeout: 30000,
            });

            // Verify page loaded
            const isLoaded = await page.locator('body').isVisible();
            if (!isLoaded) {
                throw new Error('Page did not load properly');
            }

            // Extract data
            const data = await page.evaluate(() => {
                return {
                    title: document.title,
                };
            });

            await Dataset.pushData(data);

        } catch (error) {
            log.error(`Failed to scrape ${request.url}: ${error.message}`);
            // Don't throw - let Crawlee handle retry
        }
    },

    failedRequestHandler({ request, error }, { log }) {
        log.error(`Request failed after retries: ${request.url}`);
    },

    maxRequestRetries: 3,
    requestHandlerTimeoutSecs: 60,
});
```

## Performance Optimization

### 1. Block Unnecessary Resources

```javascript
const crawler = new PlaywrightCrawler({
    preNavigationHooks: [async ({ page, request }) => {
        // Block images, fonts, etc.
        await page.route('**/*', (route) => {
            const resourceType = route.request().resourceType();
            if (['image', 'font', 'media'].includes(resourceType)) {
                route.abort();
            } else {
                route.continue();
            }
        });
    }],
    // ...
});
```

### 2. Use Headless Mode

```javascript
const crawler = new PlaywrightCrawler({
    headless: true, // Faster than headed mode
    // ...
});
```

### 3. Control Concurrency

```javascript
const crawler = new PlaywrightCrawler({
    maxConcurrency: 5, // Run 5 browsers in parallel
    maxRequestsPerMinute: 60, // Rate limiting
    // ...
});
```

## Best Practices

### ✅ DO:

- **Use role-based selectors** first (most stable)
- **Let Playwright auto-wait** (never use setTimeout)
- **Extract data with page.evaluate()** for complex queries
- **Handle errors gracefully** (try/catch, failedRequestHandler)
- **Block unnecessary resources** (images, fonts)
- **Use headless mode** for production
- **Respect rate limits** (maxRequestsPerMinute)
- **Log progress clearly** for debugging

### ❌ DON'T:

- **Use arbitrary timeouts** (`waitForTimeout(5000)`)
- **Use fragile CSS selectors** as first choice
- **Forget error handling** - pages fail!
- **Run too many concurrent browsers** - memory intensive
- **Scrape if API exists** - use API instead (10x faster)
- **Forget to close browsers** - memory leaks

## Related Resources

- **Sitemap discovery**: See `sitemap-discovery.md` (get URLs first)
- **API discovery**: See `api-discovery.md` (prefer APIs!)
- **Hybrid approach**: See `hybrid-approaches.md`
- **Selectors**: See `../reference/selector-guide.md`
- **Examples**: See `../examples/playwright-basic.js`

## Summary

**Playwright is powerful but resource-intensive** - use when necessary!

**Key takeaways**:
1. Check for APIs first (10x faster than Playwright)
2. Use role-based selectors (most stable)
3. Let Playwright auto-wait (no setTimeout)
4. Handle errors and retries properly
5. Block unnecessary resources for speed
6. Combine with sitemaps for complete coverage
