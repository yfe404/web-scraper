/**
 * Basic Playwright Scraper
 *
 * This example shows how to:
 * 1. Scrape JavaScript-rendered content
 * 2. Use proper selectors (role-based)
 * 3. Handle auto-waiting
 *
 * Use this pattern for: JavaScript-heavy sites (React, Vue, Angular)
 */

import { PlaywrightCrawler, Dataset } from 'crawlee';

async function main() {
    const crawler = new PlaywrightCrawler({
        // Run 3 browsers in parallel
        maxConcurrency: 3,

        // Limit requests per minute
        maxRequestsPerMinute: 30,

        async requestHandler({ page, request, log, enqueueLinks }) {
            log.info(`Scraping: ${request.url}`);

            // Wait for content to load (automatic waiting)
            await page.waitForSelector('h1');

            // Extract data using page.evaluate()
            const data = await page.evaluate(() => {
                return {
                    title: document.querySelector('h1')?.textContent?.trim(),
                    price: document.querySelector('.price')?.textContent?.trim(),
                    description: document.querySelector('.description')?.textContent?.trim(),

                    // Extract multiple items
                    features: Array.from(document.querySelectorAll('.feature')).map(el => ({
                        name: el.querySelector('.name')?.textContent?.trim(),
                        value: el.querySelector('.value')?.textContent?.trim(),
                    })),

                    // Extract images
                    images: Array.from(document.querySelectorAll('img.product-image'))
                        .map(img => img.src),
                };
            });

            // Save to dataset
            await Dataset.pushData({
                url: request.url,
                ...data,
                scrapedAt: new Date().toISOString(),
            });

            // Optional: Enqueue links to other pages
            await enqueueLinks({
                selector: 'a.related-product',
                strategy: 'same-domain',
            });
        },

        failedRequestHandler({ request, error }, { log }) {
            log.error(`Request failed: ${request.url} - ${error.message}`);
        },
    });

    // Start URLs
    await crawler.run([
        'https://example.com/product/1',
        'https://example.com/product/2',
        'https://example.com/product/3',
    ]);

    console.log('✓ Scraping completed');
}

main();
