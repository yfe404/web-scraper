/**
 * API-Based Scraper
 *
 * This example shows how to:
 * 1. Use APIs instead of scraping HTML
 * 2. Handle authentication (cookies, tokens)
 * 3. Process JSON responses
 *
 * Use this pattern for: Any site with a discoverable API
 */

import { gotScraping } from 'got-scraping';
import { setTimeout } from 'timers/promises';

async function main() {
    // Example: Scrape products via API
    const baseApiUrl = 'https://api.example.com/v1';
    const productIds = [123, 456, 789]; // Get these from sitemap or exploration

    const results = [];

    console.log(`🔍 Fetching ${productIds.length} products via API...`);

    for (const id of productIds) {
        try {
            console.log(`Fetching product ${id}...`);

            const response = await gotScraping({
                url: `${baseApiUrl}/products/${id}`,
                responseType: 'json',
                headers: {
                    'User-Agent': 'Mozilla/5.0 (compatible; Scraper/1.0)',
                    // Add authentication if needed:
                    // 'Authorization': 'Bearer YOUR_TOKEN',
                    // 'X-API-Key': 'YOUR_API_KEY',
                },
                timeout: {
                    request: 10000, // 10 second timeout
                },
                retry: {
                    limit: 3,
                    methods: ['GET'],
                },
            });

            // API returns clean JSON
            const product = response.body;

            results.push({
                id: product.id,
                name: product.name,
                price: product.price,
                inStock: product.in_stock,
                scrapedAt: new Date().toISOString(),
            });

            console.log(`✓ Fetched: ${product.name}`);

            // Rate limiting (respect API limits)
            await setTimeout(100); // 100ms delay = 10 requests/second

        } catch (error) {
            if (error.response?.statusCode === 404) {
                console.log(`✗ Product ${id} not found`);
            } else if (error.response?.statusCode === 429) {
                console.log(`⚠ Rate limited, waiting 5 seconds...`);
                await setTimeout(5000);
                // Retry this product
            } else {
                console.error(`✗ Error fetching product ${id}:`, error.message);
            }
        }
    }

    console.log(`✓ Fetched ${results.length}/${productIds.length} products`);
    console.log(JSON.stringify(results, null, 2));
}

main();
