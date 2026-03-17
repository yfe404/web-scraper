/**
 * Traffic Interception Reconnaissance (Proxy-MCP)
 *
 * This example shows the MCP tool call sequence for proxy-based reconnaissance.
 * These are proxy-mcp tool calls, not JavaScript code — they run via Claude's MCP integration.
 *
 * Use this pattern for: Initial reconnaissance on any website
 *
 * Workflow:
 *   1. Start MITM proxy
 *   2. Launch Chrome with stealth mode (anti-detection)
 *   3. Attach DevTools bridge
 *   4. Browse with humanizer (anti-detection interactions)
 *   5. Analyze captured traffic for APIs
 *   6. Inspect discovered endpoints
 *   7. Switch to gotScraping for production extraction
 */

// ============================================
// Step 1: Initialize proxy and stealth browser
// ============================================

// Start the MITM proxy (captures all HTTP/HTTPS traffic)
// proxy_start()

// Launch Chrome through proxy with stealth mode
// Stealth mode patches: navigator.webdriver, chrome.runtime, Permissions.query, Error.stack
// interceptor_chrome_launch("https://shop.example.com", stealthMode: true)

// Attach DevTools bridge for DOM access and screenshots
// interceptor_chrome_devtools_attach(target_id)

// Take initial screenshot for visual reference
// interceptor_chrome_devtools_screenshot()

// ============================================
// Step 2: Discover APIs via traffic capture
// ============================================

// All traffic is automatically captured by the MITM proxy
// Search for API endpoints in captured traffic
// proxy_list_traffic(url_filter: "/api/")
// proxy_list_traffic(url_filter: "/graphql")
// proxy_search_traffic(query: "application/json")

// ============================================
// Step 3: Browse with humanizer to trigger more API calls
// ============================================

// Clear traffic buffer to isolate new requests
// proxy_clear_traffic()

// Click a category link (Bezier curve mouse movement, Fitts's law timing)
// humanizer_click(target_id, ".category-link")

// Wait with anti-idle behavior (micro-jitter, micro-scrolls)
// humanizer_idle(target_id, 2000)

// See what API calls the click triggered
// proxy_list_traffic(url_filter: "products")

// ============================================
// Step 4: Test pagination
// ============================================

// proxy_clear_traffic()
// humanizer_click(target_id, ".next-page")
// humanizer_idle(target_id, 2000)
// proxy_list_traffic(url_filter: "page=")

// ============================================
// Step 5: Test infinite scroll
// ============================================

// proxy_clear_traffic()
// humanizer_scroll(target_id, "down", 2000)
// humanizer_idle(target_id, 2000)
// proxy_list_traffic(url_filter: "offset")

// ============================================
// Step 6: Inspect discovered API endpoint
// ============================================

// Get full request/response details for a discovered endpoint
// proxy_get_exchange(exchange_id)
//
// This returns:
// - Request: method, URL, headers, body
// - Response: status, headers, body (JSON data!)
// - Timing information
//
// Example discovery:
//   GET /api/v2/products?page=1&limit=20
//   Response: { products: [...], total: 5000, hasMore: true }
//   Auth: None required
//   Rate limit: ~60/min (from response headers)

// ============================================
// Step 7: Check for anti-bot protection
// ============================================

// Check for Cloudflare cookies
// interceptor_chrome_devtools_list_cookies(domain_filter: "cloudflare")

// Check for tracking in localStorage
// interceptor_chrome_devtools_list_storage_keys(storage_type: "local")

// Look for blocked requests
// proxy_list_traffic(url_filter: "403")

// ============================================
// Step 8: Record session for later replay
// ============================================

// proxy_session_start("recon-shop-example")
// ... (additional browsing) ...
// proxy_session_stop(session_id)
// proxy_export_har(session_id, "recon-shop-example.har")

// ============================================
// Step 9: Switch to gotScraping for production
// ============================================

// Once API is discovered, use direct HTTP for production extraction:

import { gotScraping } from 'got-scraping';

async function scrapeViaDiscoveredAPI() {
    const allProducts = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
        const response = await gotScraping({
            // API endpoint discovered via traffic interception
            url: `https://shop.example.com/api/v2/products?page=${page}&limit=100`,
            responseType: 'json',
            retry: { limit: 3 },
        });

        allProducts.push(...response.body.products);
        hasMore = response.body.hasMore;
        page++;

        // Respect rate limit discovered during recon (~60/min)
        await new Promise(resolve => setTimeout(resolve, 1100));
    }

    console.log(`Scraped ${allProducts.length} products via discovered API`);
    return allProducts;
}

scrapeViaDiscoveredAPI();
