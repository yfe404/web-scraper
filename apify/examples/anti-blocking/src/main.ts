/**
 * Anti-Blocking Scraper
 *
 * Demonstrates:
 * - Browser fingerprinting
 * - Proxy configuration
 * - Session management
 * - Blocking detection
 */

import { Actor } from 'apify';
import { PlaywrightCrawler, Dataset } from 'crawlee';

// Input interface
interface Input {
    startUrls: { url: string }[];
    maxItems?: number;
    useFingerprinting?: boolean;
    proxyGroup?: 'RESIDENTIAL' | 'SHADER';
}

// Output interface
interface ScrapedData {
    url: string;
    title: string;
    content?: string;
    sessionId?: string;
    scrapedAt: string;
}

await Actor.main(async () => {
    // Get typed input
    const input = await Actor.getInput<Input>();

    if (!input?.startUrls) {
        throw new Error('startUrls is required');
    }

    console.log('Input:', input);

    // Configure proxy
    const proxyConfiguration = await Actor.createProxyConfiguration({
        groups: [input.proxyGroup || 'RESIDENTIAL'],
    });

    // Create Playwright crawler with anti-blocking
    const crawler = new PlaywrightCrawler({
        // Slow down to avoid rate limiting
        maxConcurrency: 3,
        maxRequestsPerMinute: 30,

        // Enable session management
        useSessionPool: true,
        sessionPoolOptions: {
            maxPoolSize: 20,
            sessionOptions: {
                maxUsageCount: 30, // Rotate after 30 requests
                maxErrorScore: 3, // Retire after 3 errors
            },
        },

        // Enable fingerprinting if requested
        ...(input.useFingerprinting && {
            fingerprintOptions: {
                devices: ['desktop'],
                operatingSystems: ['windows', 'macos'],
                browsers: ['chrome'],
            },
        }),

        // Add proxies
        proxyConfiguration,

        async requestHandler({ page, request, session, log }) {
            log.info(`Scraping: ${request.url} (Session: ${session?.id})`);

            try {
                // Wait for content
                await page.waitForSelector('body', { timeout: 10000 });

                // Check for blocking
                const isBlocked = await page.evaluate(() => {
                    const text = document.body.textContent?.toLowerCase() || '';
                    return (
                        text.includes('access denied') ||
                        text.includes('cloudflare') ||
                        text.includes('captcha') ||
                        text.includes('bot')
                    );
                });

                if (isBlocked) {
                    log.warning(`Detected blocking on ${request.url}, retiring session`);
                    session?.retire();
                    throw new Error('Blocked');
                }

                // Extract data
                const data: ScrapedData = await page.evaluate(() => ({
                    url: window.location.href,
                    title: document.querySelector('h1')?.textContent?.trim() ?? document.title,
                    content: document.querySelector('main, article, .content')?.textContent?.slice(0, 500),
                    sessionId: undefined,
                    scrapedAt: new Date().toISOString(),
                }));

                // Add session info
                data.sessionId = session?.id;

                // Save to dataset
                await Dataset.pushData<ScrapedData>(data);

                // Mark session as working
                session?.markGood();

                log.info(`✓ Scraped: ${data.title}`);
            } catch (error) {
                log.error(`Error scraping ${request.url}: ${(error as Error).message}`);
                session?.markBad();
                throw error; // Retry
            }
        },

        failedRequestHandler({ request, session }, { log }) {
            log.error(`Request failed after retries: ${request.url}`);
            session?.retire();
        },
    });

    // Add URLs and run
    await crawler.addRequests(input.startUrls);
    await crawler.run();

    console.log('✓ Scraping completed');
});
