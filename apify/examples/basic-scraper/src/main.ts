/**
 * Basic Sitemap Scraper
 *
 * Demonstrates:
 * - Sitemap URL discovery
 * - TypeScript Actor pattern
 * - Basic Playwright scraping
 */

import { Actor } from 'apify';
import { PlaywrightCrawler, Dataset, RobotsFile } from 'crawlee';

// Input interface
interface Input {
    sitemapUrl: string;
    urlPattern?: string;
    maxItems?: number;
}

// Output interface
interface ScrapedData {
    url: string;
    title: string;
    description?: string;
    scrapedAt: string;
}

await Actor.main(async () => {
    // Get typed input
    const input = await Actor.getInput<Input>();

    if (!input?.sitemapUrl) {
        throw new Error('sitemapUrl is required');
    }

    console.log('Input:', input);

    // Parse sitemap
    console.log(`Fetching sitemap: ${input.sitemapUrl}`);
    const robots = await RobotsFile.find(input.sitemapUrl);
    let urls = await robots.parseUrlsFromSitemaps();

    console.log(`Found ${urls.length} URLs in sitemap`);

    // Filter by pattern if provided
    if (input.urlPattern) {
        const pattern = new RegExp(input.urlPattern);
        urls = urls.filter((url) => pattern.test(url));
        console.log(`Filtered to ${urls.length} URLs matching pattern: ${input.urlPattern}`);
    }

    // Limit URLs if maxItems specified
    if (input.maxItems) {
        urls = urls.slice(0, input.maxItems);
        console.log(`Limited to ${urls.length} URLs`);
    }

    // Create Playwright crawler
    const crawler = new PlaywrightCrawler({
        maxConcurrency: 5,
        maxRequestsPerMinute: 60,

        async requestHandler({ page, request, log }) {
            log.info(`Scraping: ${request.url}`);

            try {
                // Wait for content
                await page.waitForSelector('body', { timeout: 10000 });

                // Extract data with type safety
                const data: ScrapedData = await page.evaluate(() => ({
                    url: window.location.href,
                    title: document.querySelector('h1')?.textContent?.trim() ?? document.title,
                    description: document.querySelector('meta[name="description"]')?.getAttribute('content') ?? undefined,
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

    // Add URLs and run
    await crawler.addRequests(urls);
    await crawler.run();

    console.log('✓ Scraping completed');
});
