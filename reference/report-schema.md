# Intelligence Report Schema

Standard format for reconnaissance reports generated in Phase 5 (Report + Self-Critique).

## Report Structure

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
INTELLIGENCE REPORT: {domain}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Section 1: SITE ARCHITECTURE
Section 2: DATA POINTS REQUESTED
Section 3: DISCOVERED ENDPOINTS
Section 4: PROTECTION ASSESSMENT
Section 5: EXTRACTION STRATEGIES
Section 6: IMPLEMENTATION CHECKLIST
Section 7: SELF-CRITIQUE

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
END OF REPORT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Section Details

### Section 1: SITE ARCHITECTURE

| Field | Description |
|-------|-------------|
| Framework | Detected framework or "Custom SSR" / "Static HTML" (from `strategies/framework-signatures.md`) |
| Rendering | SSR / CSR / Hybrid / Static |
| Detection Method | How framework was identified (header, HTML signature, known site) |

### Section 2: DATA POINTS REQUESTED

List each data point the user wants extracted, with status:

| Data Point | Found In | Phase Found | Extraction Method | Validated? |
|-----------|----------|-------------|-------------------|------------|
| Product name | Raw HTML | Phase 0 | `#productTitle` selector | YES |
| Price | Rendered DOM | Phase 1 | `span.a-price .a-offscreen` | PARTIAL |
| Reviews | API | Phase 2 | `/api/reviews?asin={id}` | YES |
| Stock status | Not found | — | — | NO |

### Section 3: DISCOVERED ENDPOINTS

For each discovered API or data source:

| Field | Description |
|-------|-------------|
| Endpoint | Full URL pattern with parameters |
| Method | GET / POST |
| Authentication | None / Cookie / Token / API Key |
| Response Format | JSON / HTML / XML |
| Pagination | Type and parameters |
| Rate Limit | Observed or estimated |
| Validated? | YES if replayed successfully, NO if untested |

### Section 4: PROTECTION ASSESSMENT

| Mechanism | Status | Evidence | Impact |
|-----------|--------|----------|--------|
| Cloudflare | Active / Not detected | Header, cookies, challenge | Description of impact |
| Rate Limiting | Threshold / Not detected | 429 responses, header hints | Requests/minute limit |
| CAPTCHA | Triggered / Not triggered | Element detected, challenge page | Block risk |
| Geo-blocking | Detected / Not detected | Different content by region | Data accuracy impact |
| Authentication | Required / Not required | Login wall, auth tokens | Access limitation |

### Section 5: EXTRACTION STRATEGIES

Ranked list of recommended approaches:

| Rank | Strategy | Data Points Covered | Validated? | Complexity | Speed |
|------|----------|-------------------|------------|------------|-------|
| 1 | Cheerio + CSS selectors | name, price, description | YES | Low | Fast |
| 2 | API endpoint | reviews, ratings | YES | Low | Very Fast |
| 3 | Browser + DOM | stock status (JS-rendered) | PARTIAL | Medium | Slow |

**Validated? column values**:
- **YES**: Extraction method tested and confirmed working (selector matches, API returns expected data)
- **PARTIAL**: Method identified but not fully verified (e.g., selector found in HTML but not tested with parser, or API found but pagination untested)
- **NO**: Theoretical / assumed — not tested at all

### Section 6: IMPLEMENTATION CHECKLIST

Actionable steps derived from findings:

```
- [ ] Step 1: ...
- [ ] Step 2: ...
```

### Section 7: SELF-CRITIQUE

**Required** at the end of every report. Covers:

| Item | Description |
|------|-------------|
| **Gaps** | Data points not found or not fully covered. Why, and what would be needed to find them. |
| **Skipped Steps** | Which phases were skipped and why (with quality gate reasoning). |
| **Unvalidated Claims** | Any strategy marked PARTIAL or NO in Validated? column. What would full validation require. |
| **Assumptions** | Things assumed but not verified (e.g., "pagination follows standard pattern" without testing page 2+). |
| **Staleness Risk** | Findings that may change (geo-dependent prices, session-dependent content, A/B tested layouts). |
| **Recommendations** | Specific next steps for deeper investigation if needed. |

Example:
```
## 7. SELF-CRITIQUE

**Gaps**: Stock status not found in raw HTML or rendered DOM. May require
authenticated session or specific product variant selection.

**Skipped Steps**: Phase 2 (Deep Scan) skipped — all requested data points
except stock status found in Phase 0/1. Phase 4 (Protection Testing) skipped —
no protection signals detected, curl requests succeeded without blocks.

**Unvalidated Claims**: Price selector `span.a-price .a-offscreen` found in
rendered DOM but not tested with Cheerio against raw HTML (price may be
JS-rendered). Marked PARTIAL.

**Assumptions**: Product page structure is consistent across categories.
Only tested 1 product page — recommend validating against 3-5 different
categories before implementation.

**Staleness Risk**: Amazon prices vary by geo-location and login status.
Reported price reflects anonymous US access. Production scraper should
account for locale headers.

**Recommendations**:
- Test price extraction with `Accept-Language` and geo headers
- Investigate authenticated session for stock status
- Validate selectors across product categories before scaling
```

## Field Definitions

| Term | Definition |
|------|-----------|
| **Data Point** | A specific piece of information the user wants to extract (e.g., "product price") |
| **Extraction Method** | The technical approach: CSS selector, JSON path, API endpoint, or XPath |
| **Validated?** | Whether the extraction method was actually tested (not just theorized) — YES / PARTIAL / NO |
| **Phase Found** | Which reconnaissance phase discovered this data point (0-2) |
| **Quality Gate** | Decision point where the workflow checks if enough data has been gathered to skip remaining phases |
