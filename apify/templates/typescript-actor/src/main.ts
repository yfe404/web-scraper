/**
 * TypeScript Actor Template
 *
 * Full-featured template demonstrating best practices
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
    // Get typed input
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
        proxyConfiguration: input.proxyConfiguration as any,

        async requestHandler({ page, request, log }) {
            log.info(`Scraping: ${request.url}`);

            try {
                // Wait for content
                await page.waitForSelector('body', { timeout: 10000 });

                // Extract data with type safety
                const data: ScrapedData = await page.evaluate(() => ({
                    url: window.location.href,
                    title: document.querySelector('h1')?.textContent?.trim() ?? document.title,
                    price: parseFloat(
                        document.querySelector('.price')?.textContent?.replace(/[^0-9.]/g, '') ?? '0'
                    ),
                    description: document.querySelector('.description')?.textContent?.trim(),
                    scrapedAt: new Date().toISOString(),
                }));

                // Save to dataset
                await Dataset.pushData<ScrapedData>(data);

                log.info(`✓ Scraped: ${data.title}`);
            } catch (error) {
                log.error(`Failed to scrape ${request.url}: ${(error as Error).message}`);
                throw error; // Retry
            }
        },

        failedRequestHandler({ request }, { log }) {
            log.error(`Request failed after retries: ${request.url}`);
        },
    });

    // Run crawler
    await crawler.run(input.startUrls);

    console.log('✓ Actor finished successfully');
});
