/**
 * Basic Sitemap-Based Scraper
 *
 * This example shows how to:
 * 1. Automatically discover sitemaps using RobotsFile
 * 2. Get all URLs from sitemaps
 * 3. Scrape pages using Playwright
 *
 * Use this pattern for: E-commerce sites, blogs, news sites with sitemaps
 */

import { PlaywrightCrawler, RobotsFile, Dataset } from 'crawlee';

async function main() {
    const baseUrl = 'https://example.com';

    console.log(`🔍 Discovering sitemaps for ${baseUrl}...`);

    // Step 1: Automatically find and parse all sitemaps
    const robots = await RobotsFile.find(baseUrl);
    const urls = await robots.parseUrlsFromSitemaps();

    console.log(`✓ Found ${urls.length} URLs from sitemaps`);

    // Optional: Filter URLs (e.g., only product pages)
    const productUrls = urls.filter(url => url.includes('/products/'));
    console.log(`✓ Filtered to ${productUrls.length} product URLs`);

    // Step 2: Create crawler
    const crawler = new PlaywrightCrawler({
        maxConcurrency: 5,
        maxRequestsPerMinute: 60,

        async requestHandler({ page, request, log }) {
            log.info(`Scraping: ${request.url}`);

            // Wait for content to load
            await page.waitForSelector('body');

            // Extract data
            const data = await page.evaluate(() => ({
                title: document.querySelector('h1')?.textContent?.trim(),
                price: document.querySelector('.price')?.textContent?.trim(),
                description: document.querySelector('.description')?.textContent?.trim(),
                image: document.querySelector('img.main-image')?.src,
                inStock: document.querySelector('.in-stock') !== null,
            }));

            // Save to dataset
            await Dataset.pushData({
                url: request.url,
                ...data,
                scrapedAt: new Date().toISOString(),
            });
        },

        failedRequestHandler({ request, error }, { log }) {
            log.error(`Failed to scrape ${request.url}: ${error.message}`);
        },
    });

    // Step 3: Add URLs and run
    await crawler.addRequests(productUrls.slice(0, 10)); // Test with first 10
    await crawler.run();

    console.log('✓ Scraping completed');
}

main();
