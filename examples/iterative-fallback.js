/**
 * Iterative Fallback Scraper
 *
 * This example shows how to:
 * 1. Start with traffic interception to discover APIs (Phase 1 reconnaissance)
 * 2. Try simplest production approach first (Sitemap + API)
 * 3. Automatically fallback if it fails
 * 4. End with most complex (DOM scraping via Crawlee)
 *
 * Use this pattern for: Unknown sites, maximum reliability
 *
 * Note: Phase 1 (traffic interception) is done interactively with proxy-mcp
 * tools during reconnaissance. This script handles Phase 4 (implementation).
 */

import { RobotsFile, CheerioCrawler, PlaywrightCrawler, Dataset } from 'crawlee';
import { gotScraping } from 'got-scraping';

async function scrapeWithFallback(baseUrl) {
    console.log(`Starting intelligent scraping for ${baseUrl}`);

    // ============================================
    // Phase 1: Traffic Interception (Interactive)
    // ============================================
    // Done before this script runs, using proxy-mcp:
    //   proxy_start()
    //   interceptor_chrome_launch(baseUrl, stealthMode: true)
    //   interceptor_chrome_devtools_attach(target_id)
    //   proxy_list_traffic(url_filter: "api")
    //   proxy_get_exchange(exchange_id)
    //
    // Outcome: API endpoint discovered (or not)
    // This informs which attempt below to start with.

    // ============================================
    // Attempt 1: Sitemap + API (FASTEST)
    // ============================================
    try {
        console.log('\nAttempt 1: Sitemap + API');

        // Get URLs from sitemap
        const robots = await RobotsFile.find(baseUrl);
        const urls = await robots.parseUrlsFromSitemaps();

        if (urls.length === 0) {
            throw new Error('No URLs found in sitemap');
        }

        console.log(`Found ${urls.length} URLs in sitemap`);

        // Extract IDs
        const ids = urls
            .map(url => url.match(/\/products\/(\d+)/)?.[1])
            .filter(Boolean)
            .slice(0, 5); // Test with 5

        console.log(`Extracted ${ids.length} product IDs`);

        // Try API (endpoint discovered during traffic interception)
        console.log('Testing API...');
        const apiUrl = `https://api.${baseUrl.replace('https://', '')}/products/${ids[0]}`;

        const testResponse = await gotScraping({
            url: apiUrl,
            responseType: 'json',
            timeout: { request: 5000 },
        });

        console.log('API works! Using Sitemap + API approach');

        // Fetch all data via API
        const results = [];
        for (const id of ids) {
            const response = await gotScraping({
                url: `https://api.${baseUrl.replace('https://', '')}/products/${id}`,
                responseType: 'json',
            });
            results.push(response.body);
        }

        console.log(`Success with Sitemap + API: ${results.length} products`);
        return { method: 'sitemap-api', data: results };

    } catch (error) {
        console.log(`Sitemap + API failed: ${error.message}`);
    }

    // ============================================
    // Attempt 2: Sitemap + Cheerio (Static HTML)
    // ============================================
    try {
        console.log('\nAttempt 2: Sitemap + Cheerio');

        const robots = await RobotsFile.find(baseUrl);
        const urls = await robots.parseUrlsFromSitemaps();

        if (urls.length === 0) {
            throw new Error('No URLs found in sitemap');
        }

        console.log(`Found ${urls.length} URLs in sitemap`);

        const crawler = new CheerioCrawler({
            maxConcurrency: 5,
            async requestHandler({ $, request }) {
                const data = {
                    title: $('h1').text().trim(),
                    price: $('.price').text().trim(),
                };

                await Dataset.pushData({ url: request.url, ...data });
            },
        });

        await crawler.addRequests(urls.slice(0, 5)); // Test with 5
        await crawler.run();

        const results = await Dataset.getData();
        console.log(`Success with Sitemap + Cheerio: ${results.items.length} products`);
        return { method: 'sitemap-cheerio', data: results.items };

    } catch (error) {
        console.log(`Sitemap + Cheerio failed: ${error.message}`);
    }

    // ============================================
    // Attempt 3: Sitemap + Playwright (Dynamic Content)
    // ============================================
    try {
        console.log('\nAttempt 3: Sitemap + Playwright');

        const robots = await RobotsFile.find(baseUrl);
        const urls = await robots.parseUrlsFromSitemaps();

        if (urls.length === 0) {
            throw new Error('No URLs found in sitemap');
        }

        const crawler = new PlaywrightCrawler({
            maxConcurrency: 3,
            async requestHandler({ page, request }) {
                const data = await page.evaluate(() => ({
                    title: document.querySelector('h1')?.textContent,
                    price: document.querySelector('.price')?.textContent,
                }));

                await Dataset.pushData({ url: request.url, ...data });
            },
        });

        await crawler.addRequests(urls.slice(0, 5));
        await crawler.run();

        const results = await Dataset.getData();
        console.log(`Success with Sitemap + Playwright: ${results.items.length} products`);
        return { method: 'sitemap-playwright', data: results.items };

    } catch (error) {
        console.log(`Sitemap + Playwright failed: ${error.message}`);
    }

    // ============================================
    // Attempt 4: Pure Playwright Crawling (FALLBACK)
    // ============================================
    try {
        console.log('\nAttempt 4: Playwright Crawling (fallback)');

        const crawler = new PlaywrightCrawler({
            maxRequestsPerCrawl: 10,
            async requestHandler({ page, request, enqueueLinks }) {
                const data = await page.evaluate(() => ({
                    title: document.querySelector('h1')?.textContent,
                    price: document.querySelector('.price')?.textContent,
                }));

                await Dataset.pushData({ url: request.url, ...data });

                // Crawl links
                await enqueueLinks({
                    selector: 'a[href*="/products/"]',
                    strategy: 'same-domain',
                });
            },
        });

        await crawler.run([baseUrl]);

        const results = await Dataset.getData();
        console.log(`Success with Playwright Crawling: ${results.items.length} products`);
        return { method: 'playwright-crawl', data: results.items };

    } catch (error) {
        console.log(`Playwright Crawling failed: ${error.message}`);
    }

    // ============================================
    // All attempts failed
    // ============================================
    console.log('\nAll scraping methods failed');
    throw new Error('Unable to scrape site with any method');
}

// Usage
async function main() {
    try {
        const result = await scrapeWithFallback('https://example.com');
        console.log(`\nFinal result: Used ${result.method}, got ${result.data.length} items`);
    } catch (error) {
        console.error(`Scraping failed: ${error.message}`);
    }
}

main();
