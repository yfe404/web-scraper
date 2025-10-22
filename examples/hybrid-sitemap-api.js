/**
 * Hybrid: Sitemap + API Scraper
 *
 * This example shows how to:
 * 1. Get all URLs from sitemap (instant discovery)
 * 2. Extract IDs from URLs
 * 3. Fetch data via API (clean JSON)
 *
 * Use this pattern for: Best performance + data quality
 * Performance: 60x faster than crawling + more reliable than HTML scraping
 */

import { RobotsFile } from 'crawlee';
import { gotScraping } from 'got-scraping';
import { setTimeout } from 'timers/promises';

async function main() {
    const baseUrl = 'https://shop.example.com';

    console.log('🔍 Phase 1: Sitemap Discovery');

    // Step 1: Get all URLs from sitemap (instant!)
    const robots = await RobotsFile.find(baseUrl);
    const urls = await robots.parseUrlsFromSitemaps();

    console.log(`✓ Found ${urls.length} URLs from sitemap`);

    // Step 2: Extract product IDs from URLs
    const productIds = urls
        .map(url => {
            // Extract ID from URL pattern: /products/123
            const match = url.match(/\/products\/(\d+)/);
            return match ? match[1] : null;
        })
        .filter(Boolean); // Remove nulls

    console.log(`✓ Extracted ${productIds.length} product IDs`);

    console.log('🔍 Phase 2: API Data Fetching');

    // Step 3: Fetch data via API (much faster than scraping HTML!)
    const results = [];

    for (const id of productIds.slice(0, 50)) { // Limit to 50 for demo
        try {
            const response = await gotScraping({
                url: `https://api.example.com/v1/products/${id}`,
                responseType: 'json',
                headers: {
                    'User-Agent': 'Mozilla/5.0...',
                },
                timeout: {
                    request: 10000,
                },
            });

            results.push({
                id: response.body.id,
                name: response.body.name,
                price: response.body.price,
                url: `${baseUrl}/products/${id}`,
                scrapedAt: new Date().toISOString(),
            });

            if (results.length % 10 === 0) {
                console.log(`✓ Fetched ${results.length}/${productIds.length} products`);
            }

            // Rate limiting
            await setTimeout(50); // 20 requests/second

        } catch (error) {
            console.error(`✗ Failed to fetch product ${id}:`, error.message);
        }
    }

    console.log(`✓ Completed: ${results.length} products`);
    console.log('Sample result:', results[0]);

    // Save results (in real scenario)
    // await fs.writeFile('products.json', JSON.stringify(results, null, 2));
}

main();
