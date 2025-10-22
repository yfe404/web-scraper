/**
 * Hybrid Sitemap + API Scraper
 *
 * Demonstrates:
 * - Sitemap URL discovery (fast)
 * - ID extraction from URLs
 * - API-based data fetching (reliable)
 * - Optimal hybrid approach
 */

import { Actor } from 'apify';
import { Dataset, RobotsFile } from 'crawlee';
import { gotScraping } from 'got-scraping';

// Input interface
interface Input {
    sitemapUrl: string;
    apiBaseUrl: string;
    idPattern?: string;
    maxItems?: number;
}

// Output interface
interface ProductData {
    id: string;
    url: string;
    name: string;
    price?: number;
    inStock?: boolean;
    scrapedAt: string;
}

await Actor.main(async () => {
    // Get typed input
    const input = await Actor.getInput<Input>();

    if (!input?.sitemapUrl || !input?.apiBaseUrl) {
        throw new Error('sitemapUrl and apiBaseUrl are required');
    }

    console.log('Input:', input);

    // Step 1: Parse sitemap to get URLs
    console.log(`Fetching sitemap: ${input.sitemapUrl}`);
    const robots = await RobotsFile.find(input.sitemapUrl);
    let urls = await robots.parseUrlsFromSitemaps();

    console.log(`✓ Found ${urls.length} URLs in sitemap`);

    // Step 2: Extract IDs from URLs
    const idPattern = new RegExp(input.idPattern || '/products/([^/]+)');
    const ids: string[] = [];

    for (const url of urls) {
        const match = url.match(idPattern);
        if (match && match[1]) {
            ids.push(match[1]);
        }
    }

    console.log(`✓ Extracted ${ids.length} IDs from URLs`);

    // Limit IDs if maxItems specified
    const limitedIds = input.maxItems ? ids.slice(0, input.maxItems) : ids;
    console.log(`Processing ${limitedIds.length} products`);

    // Step 3: Fetch data via API
    let successCount = 0;
    let errorCount = 0;

    for (const id of limitedIds) {
        try {
            const apiUrl = `${input.apiBaseUrl}/${id}`;
            console.log(`Fetching: ${apiUrl}`);

            // Fetch from API
            const response = await gotScraping({
                url: apiUrl,
                responseType: 'json',
                timeout: {
                    request: 30000,
                },
            });

            const apiData = response.body as Record<string, unknown>;

            // Map API response to output format
            const data: ProductData = {
                id,
                url: `${input.sitemapUrl.replace('/sitemap.xml', '')}/products/${id}`,
                name: String(apiData.name || apiData.title || 'Unknown'),
                price: apiData.price ? Number(apiData.price) : undefined,
                inStock: apiData.inStock !== undefined ? Boolean(apiData.inStock) : undefined,
                scrapedAt: new Date().toISOString(),
            };

            // Save to dataset
            await Dataset.pushData<ProductData>(data);

            successCount++;
            console.log(`✓ [${successCount}/${limitedIds.length}] ${data.name}`);

            // Rate limiting
            await new Promise((resolve) => setTimeout(resolve, 100));
        } catch (error) {
            errorCount++;
            console.error(`✗ Error fetching ID ${id}: ${(error as Error).message}`);
        }
    }

    console.log(`\n✓ Scraping completed:`);
    console.log(`  - Success: ${successCount}`);
    console.log(`  - Errors: ${errorCount}`);
    console.log(`  - Total: ${limitedIds.length}`);
});
