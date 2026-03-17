# Anti-Patterns to Avoid

Common mistakes and how to fix them.

## Ignoring Sitemaps

```javascript
// BAD: Crawling when sitemap exists
const crawler = new CheerioCrawler({
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

## Scraping DOM When Traffic Capture Found the API

```
// BAD: Scraping HTML when traffic capture revealed an API
interceptor_chrome_devtools_snapshot()    → Parsing accessibility tree for data
```

```javascript
// GOOD: Use the API discovered via proxy traffic capture
const data = await gotScraping({
    url: 'https://api.shop.com/products/123',  // Found via proxy_list_traffic()
    responseType: 'json',
});
```

## Using Arbitrary Waits

```
// BAD: Sleeping without anti-detection
// (no micro-movements, triggers idle detection)
sleep(5000)
```

```
// GOOD: Use humanizer_idle (includes micro-jitter and micro-scrolls)
humanizer_idle(target_id, 5000)
```

## Not Using `apify create`

```javascript
// BAD: Manual setup
mkdir my-actor && cd my-actor
npm init -y
// Missing ESLint, TypeScript, proper structure
```

```bash
# GOOD: Use CLI
apify create my-actor --template project_cheerio_crawler_ts
```

## Using proxy_set_fingerprint_spoof for Chrome Browser Sessions

```
// BAD: TLS spoofing for Chrome (Chrome already has a real TLS fingerprint)
proxy_set_fingerprint_spoof(preset: "chrome_136")
interceptor_chrome_launch("https://site.com", stealthMode: true)
```

```
// GOOD: Stealth mode is sufficient for Chrome browser sessions
interceptor_chrome_launch("https://site.com", stealthMode: true)
// TLS spoofing is only for HTTP-only clients (gotScraping, curl, fetch)
```

## Using interceptor_chrome_navigate Instead of DevTools Navigate

```
// BAD: Loses DevTools session
interceptor_chrome_devtools_attach(target_id)
interceptor_chrome_navigate("https://site.com/page2")    // DevTools detached!
```

```
// GOOD: Preserves DevTools attachment
interceptor_chrome_devtools_attach(target_id)
interceptor_chrome_devtools_navigate("https://site.com/page2")   // DevTools still attached
```

## Launching Chrome Without Stealth Mode on Protected Sites

```
// BAD: No stealth mode — bot detection will flag this
interceptor_chrome_launch("https://protected-site.com")
```

```
// GOOD: Always use stealth mode on protected sites
interceptor_chrome_launch("https://protected-site.com", stealthMode: true)
```

## No Error Handling

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

## Not Clearing Traffic Before Actions

```
// BAD: Noisy traffic from page load mixed with action traffic
humanizer_click(target_id, ".next-page")
proxy_list_traffic()    // Shows everything since page load — hard to find the relevant API call
```

```
// GOOD: Clear traffic before action to isolate API calls
proxy_clear_traffic()
humanizer_click(target_id, ".next-page")
humanizer_idle(target_id, 2000)
proxy_list_traffic()    // Only shows traffic triggered by the click
```
