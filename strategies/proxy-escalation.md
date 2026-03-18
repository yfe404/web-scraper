# Proxy Escalation & Protection Testing

Guide for when and how to test anti-bot protections during reconnaissance.

## Overview

Protection testing (Phase 4) is the most expensive reconnaissance phase — it requires browser sessions, multiple requests, and proxy configuration. Skip it when unnecessary, run it when signals warrant.

## When to Skip Protection Testing

Skip Phase 4 and note the skip in the report (Section 7: Self-Critique) when **all** of these are true:

- **No protection signals detected**: No 403/429 responses, no Cloudflare/DataDome cookies, no challenge pages during Phase 0-2
- **All data points covered**: Every requested data point has a validated extraction method
- **User didn't request it**: No "full recon" mode, no explicit protection testing request
- **Low-volume use case**: One-time extraction or small batch, not continuous scraping

Skip and note as limitation when:
- **Proxy credentials not configured**: Cannot test IP rotation — note this in report so user knows production scraping may hit blocks not seen during recon

## When to Always Run Protection Testing

Run Phase 4 regardless of other signals when **any** of these are true:

- **403 or challenge page observed**: During any phase, a request returned 403, a Cloudflare challenge, CAPTCHA, or "Access Denied"
- **Known high-protection domain**: Site is in the high-protection list (e.g., LinkedIn, major airlines, ticketing sites)
- **High-volume intent**: User mentions continuous scraping, monitoring, thousands of pages, or production deployment
- **User explicitly requested it**: "full recon" mode or explicit mention of protection testing
- **Geo-blocking detected**: Different content returned based on IP/region — need to test proxy behavior

## Escalation Sequence

When protection testing is warranted, follow this escalation order (stop when access is confirmed):

### Level 1: Raw HTTP (curl)
Test if simple HTTP requests succeed without browser overhead.
```
curl -s -o /dev/null -w "%{http_code}" https://target.com/page
```
- **200**: No browser needed for this endpoint — use Cheerio/HTTP client
- **403/503**: Escalate to Level 2

### Level 2: Stealth Browser
```
interceptor_chrome_launch(url, stealthMode: true)
```
- **Page loads normally**: Stealth browser sufficient — use for JS-rendered content
- **Challenge persists**: Escalate to Level 3

### Level 3: Upstream Proxy
```
proxy_set_upstream("http://user:pass@proxy-provider:port")
```
- **Access granted**: Note proxy requirement in report
- **Still blocked**: Escalate to Level 4

### Level 4: TLS Fingerprint Spoofing
```
proxy_set_fingerprint_spoof(preset: "chrome_latest")
```
- Test with HTTP client (gotScraping) through proxy
- **Access granted**: Note fingerprint + proxy requirement
- **Still blocked**: Document as high-protection, recommend specialized approach

## Reporting Protection Results

In the intelligence report (Section 4: Protection Assessment), include:

- **What was tested**: Which escalation levels were attempted
- **What worked**: Minimum access level for each data point
- **What was skipped**: With reasoning (link back to skip conditions above)
- **Production implications**: What the production scraper will need (proxies, browser, fingerprinting)
