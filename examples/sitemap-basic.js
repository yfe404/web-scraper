/**
 * Basic Sitemap-Based Scraper
 *
 * This example shows how to:
 * 1. Automatically discover sitemaps using RobotsFile
 * 2. Get all URLs from sitemaps
 * 3. Scrape pages using CheerioCrawler (fast, HTTP-only)
 *
 * Use this pattern for: E-commerce sites, blogs, news sites with sitemaps
 * Note: Sitemap URLs are static HTML — use CheerioCrawler (not Playwright)
 */

import { CheerioCrawler, RobotsFile, Dataset } from 'crawlee';

async function main() {
    const baseUrl = 'https://example.com';

    console.log(`Discovering sitemaps for ${baseUrl}...`);

    // Step 1: Automatically find and parse all sitemaps
    const robots = await RobotsFile.find(baseUrl);
    const urls = await robots.parseUrlsFromSitemaps();

    console.log(`Found ${urls.length} URLs from sitemaps`);

    // Optional: Filter URLs (e.g., only product pages)
    const productUrls = urls.filter(url => url.includes('/products/'));
    console.log(`Filtered to ${productUrls.length} product URLs`);

    // Step 2: Create crawler (CheerioCrawler for static HTML — faster than Playwright)
    const crawler = new CheerioCrawler({
        maxConcurrency: 10,
        maxRequestsPerMinute: 60,

        async requestHandler({ $, request, log }) {
            log.info(`Scraping: ${request.url}`);

            // Extract data using Cheerio (jQuery-like syntax)
            const data = {
                title: $('h1').text().trim(),
                price: $('.price').text().trim(),
                description: $('.description').text().trim(),
                image: $('img.main-image').attr('src'),
                inStock: $('.in-stock').length > 0,
            };

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

    console.log('Scraping completed');
}

main();
