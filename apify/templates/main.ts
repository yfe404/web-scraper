/**
 * TypeScript Actor Template
 *
 * Use this as a starting point for your Apify Actor.
 * Generated via: apify create --template playwright-ts
 */

import { Actor } from 'apify';
import { PlaywrightCrawler, Dataset } from 'crawlee';

// Define input interface
interface Input {
    startUrls: { url: string }[];
    maxItems?: number;
    proxyConfiguration?: object;
}

// Define output interface
interface ScrapedData {
    url: string;
    title: string;
    price?: number;
    description?: string;
    scrapedAt: string;
}

await Actor.main(async () => {
    // Get input with type safety
    const input = await Actor.getInput<Input>();

    if (!input?.startUrls) {
        throw new Error('Input must contain startUrls array');
    }

    console.log(`Starting actor with ${input.startUrls.length} URLs`);

    // Create crawler
    const crawler = new PlaywrightCrawler({
        maxConcurrency: 5,
        maxRequestsPerMinute: 60,
        maxRequestsPerCrawl: input.maxItems,
        proxyConfiguration: input.proxyConfiguration,

        async requestHandler({ page, request, log }) {
            log.info(`Scraping: ${request.url}`);

            // Wait for content
            await page.waitForSelector('body');

            // Extract data with type safety
            const data: ScrapedData = await page.evaluate(() => ({
                url: window.location.href,
                title: document.querySelector('h1')?.textContent?.trim() ?? '',
                price: parseFloat(document.querySelector('.price')?.textContent?.replace(/[^0-9.]/g, '') ?? '0'),
                description: document.querySelector('.description')?.textContent?.trim(),
                scrapedAt: new Date().toISOString(),
            }));

            // Save to dataset
            await Dataset.pushData<ScrapedData>(data);
        },

        failedRequestHandler({ request, error }, { log }) {
            log.error(`Request failed: ${request.url} - ${error.message}`);
        },
    });

    // Run crawler
    await crawler.run(input.startUrls);

    console.log('Actor finished successfully');
});
