# Phase 3: Iterative Implementation

Patterns for implementing scrapers incrementally, starting simple and adding complexity only as needed.

## Step 1: Implement Recommended Approach

### Progressive Enhancement Pattern

1. Start with minimal working code
2. Test with small sample (5-10 items)
3. Validate data quality
4. Scale to full dataset

### Reference Implementation Patterns

- **Sitemap**: See `../strategies/sitemap-discovery.md`
- **API**: See `../strategies/api-discovery.md`
- **Playwright**: See `../strategies/playwright-scraping.md`
- **Examples**: See `../examples/` directory

## Step 2: Test Small Batch First

```javascript
// Example: Test with first 10 URLs
const urls = await robots.parseUrlsFromSitemaps();
const testUrls = urls.slice(0, 10);

console.log(`Testing with ${testUrls.length} URLs first...`);
// Implement scraping logic
// Validate output quality
```

### Validation Checklist

- ✓ Data structure correct?
- ✓ All fields populated?
- ✓ Any errors or null values?
- ✓ Performance acceptable?

## Step 3: Scale or Fallback

### If Test Succeeds

```javascript
console.log('✓ Test successful, scaling to full dataset...');
await crawler.addRequests(urls); // All URLs
await crawler.run();
```

### If Test Fails

```javascript
console.log('✗ Issues detected, falling back to alternative strategy...');
// Try next approach from recommendations
```

## Step 4: Handle Blocking (If Encountered)

### Identify Blocking Type

- **Rate limiting** → Slow down requests (`maxRequestsPerMinute`)
- **IP blocking** → Use proxies
- **Bot detection** → Use fingerprinting + proxies
- **Cloudflare/CAPTCHA** → Advanced techniques

### Apply Anti-Blocking

See `../strategies/anti-blocking.md` for complete guide.

```typescript
const crawler = new PlaywrightCrawler({
    // Enable fingerprinting
    useSessionPool: true,
    fingerprintOptions: {
        devices: ['desktop'],
        operatingSystems: ['windows', 'macos'],
        browsers: ['chrome'],
    },

    // Add proxies
    proxyConfiguration: await Actor.createProxyConfiguration({
        groups: ['RESIDENTIAL'],
    }),

    // Slow down
    maxConcurrency: 3,
    maxRequestsPerMinute: 30,
});
```

### Test Incrementally

1. Start with fingerprinting only
2. Add datacenter proxies if still blocked
3. Upgrade to residential proxies if needed
4. Add session rotation

## Step 5: Add Robustness

### Error Handling Pattern

```javascript
const crawler = new PlaywrightCrawler({
    maxRequestRetries: 3,
    requestHandlerTimeoutSecs: 60,

    async requestHandler({ page, request, log }) {
        try {
            // Scraping logic
        } catch (error) {
            log.error(`Failed to scrape ${request.url}: ${error.message}`);
            throw error; // Retry
        }
    },

    failedRequestHandler({ request, error }, { log }) {
        log.error(`Request failed after retries: ${request.url}`);
    },
});
```

### Enhancements to Add

- Error handling (try/catch)
- Retries with exponential backoff
- Progress logging
- Data validation
- Rate limiting respect

---

Back to main workflow: `../SKILL.md`
