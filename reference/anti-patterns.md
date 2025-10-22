# Anti-Patterns to Avoid

Common mistakes and how to fix them.

## ❌ Ignoring Sitemaps

```javascript
// BAD: Crawling when sitemap exists
const crawler = new PlaywrightCrawler({
    async requestHandler({ enqueueLinks }) {
        await enqueueLinks(); // Slow!
    },
});
```

```javascript
// GOOD: Use sitemap
const robots = await RobotsFile.find(url);
const urls = await robots.parseUrlsFromSitemaps();
await crawler.addRequests(urls); // Fast!
```

## ❌ Scraping When API Exists

```javascript
// BAD: Scraping HTML
const title = await page.$eval('.product-title', el => el.textContent);
```

```javascript
// GOOD: Use API
const data = await gotScraping({
    url: 'https://api.shop.com/products/123',
    responseType: 'json',
});
```

## ❌ Using Arbitrary Waits

```javascript
// BAD
await page.waitForTimeout(5000); // DON'T!
```

```javascript
// GOOD
await page.waitForSelector('.loaded');
await expect(page.locator('.loaded')).toBeVisible();
```

## ❌ Not Using `apify create`

```javascript
// BAD: Manual setup
mkdir my-actor && cd my-actor
npm init -y
// Missing ESLint, TypeScript, proper structure
```

```bash
# GOOD: Use CLI
apify create my-actor --template playwright-ts
```

## ❌ Fragile Selectors

```javascript
// BAD: CSS classes (break easily)
await page.locator('.btn.btn-primary.add-cart-btn').click();
```

```javascript
// GOOD: Role-based
await page.getByRole('button', { name: 'Add to cart' }).click();
```

## ❌ No Error Handling

```javascript
// BAD: Crashes on error
const price = await page.$eval('.price', el => el.textContent);
```

```javascript
// GOOD: Graceful handling
try {
    const price = await page.$eval('.price', el => el.textContent);
} catch (error) {
    log.warning('Price not found');
    return null;
}
```
