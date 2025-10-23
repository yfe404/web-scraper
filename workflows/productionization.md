# Phase 4: Productionization (Apify Actor Creation)

Patterns for converting scrapers into production-ready Apify Actors.

## Activation Triggers

Load this workflow when user requests:
- "Make this an Apify Actor"
- "Productionize this scraper"
- "Deploy to Apify"
- "Create an actor from this"

## Step 1: Confirm TypeScript Preference

```
For production Actors, TypeScript is STRONGLY RECOMMENDED:

Benefits:
✓ Type safety (catch errors at compile time)
✓ IDE autocomplete for Apify/Crawlee APIs
✓ Better refactoring support
✓ Self-documenting code
✓ Industry standard for production code

Use TypeScript for this Actor? [Y/n]
```

## Step 2: Select Appropriate Template

Based on Phase 1 site analysis, choose the optimal template:

### Decision Tree

**1. Analyze site characteristics** (from Phase 1 reconnaissance):
   - Static HTML / Server-Side Rendering → Use Cheerio
   - JavaScript-rendered content → Use Playwright
   - Anti-bot challenges → Consider Camoufox variant

**2. Template recommendations**:

#### Option A: `project_cheerio_crawler_ts` (Recommended for most cases)
**Use when:**
- Site serves static HTML or SSR content
- No JavaScript execution needed
- Speed and efficiency are priorities (~10x faster than Playwright)
- Simple scraping without complex interactions

**Benefits:**
- Fastest option (raw HTTP requests)
- Lower resource usage
- Perfect for: blogs, news sites, e-commerce product pages (non-SPA)

#### Option B: `project_playwright_crawler_ts`
**Use when:**
- JavaScript frameworks (React, Vue, Angular, Next.js)
- Dynamic content loading (infinite scroll, lazy loading)
- Need browser interactions (clicking, scrolling, forms)
- Anti-scraping measures present

**Benefits:**
- Full browser automation
- Handles complex JavaScript
- Better for modern SPAs

#### Option C: `project_playwright_camoufox_crawler_ts` (Advanced)
**Use when:**
- Facing serious anti-bot challenges
- Standard Playwright is being blocked
- Need stealth browser fingerprinting

**Note**: Mentioned in `../strategies/anti-blocking.md`

### Easy Migration
Switching from CheerioCrawler to PlaywrightCrawler requires minimal changes:
- Change import: `CheerioCrawler` → `PlaywrightCrawler`
- Adjust selectors if needed (both use similar syntax)
- Core logic remains identical

### Hybrid Approach (Advanced)
```typescript
// Try Cheerio first for speed
const cheerioCrawler = new CheerioCrawler({ /* ... */ });

// Fallback to Playwright for failed requests
const playwrightCrawler = new PlaywrightCrawler({
    requestHandler: async ({ page, request }) => {
        // Handle failed Cheerio requests
    }
});
```

## Step 3: Initialize with Apify CLI

**CRITICAL**: Always use `apify create` command

```bash
# Install CLI if needed
npm install -g apify-cli

# ALWAYS use apify create (not manual setup)
apify create my-scraper

# When prompted, select the appropriate template:
# → project_cheerio_crawler_ts (static HTML, fastest)
# → project_playwright_crawler_ts (JavaScript-heavy sites)
# → project_playwright_camoufox_crawler_ts (anti-bot challenges)
```

### Why This Is Critical

- Auto-generates proper structure
- Includes ESLint, TypeScript config
- Creates .actor/ directory correctly
- Sets up npm scripts
- Adds proper Dockerfile

See `../apify/cli-workflow.md` for complete guide.

## Step 4: Port Scraping Logic

### Conversion Checklist

1. Wrap in `Actor.main()`
2. Add type definitions (if TypeScript)
3. Configure input schema
4. Set up dataset output
5. Add error handling

**Reference AGENTS.md**: After running `apify create`, the template includes `AGENTS.md` with detailed guidance on:
- Input/output schema specifications
- Dataset and key-value store patterns
- Do/Don't best practices for Actor development
- SDK usage patterns

See `../apify/templates/` for complete templates and `../apify/agents-md-guide.md` for how AGENTS.md complements this skill.

## Step 5: Test & Deploy

```bash
# Test locally
apify run

# Build (for TypeScript)
npm run build

# Deploy to platform
apify push
```

See `../apify/deployment.md` for full deployment guide.

## Quick Apify Reference

| Task | Command/Pattern | Documentation |
|------|----------------|---------------|
| Create Actor | `apify create` | `../apify/cli-workflow.md` |
| Template selection | Decision tree above | This guide |
| Input schema | `.actor/input_schema.json` | `../apify/input-schemas.md` |
| Configuration | `.actor/actor.json` | `../apify/configuration.md` |
| Deploy actor | `apify push` | `../apify/deployment.md` |

## Complete Apify Module

See `../apify/` directory for:
- **Core Guides**: TypeScript-first, CLI workflow, initialization, input schemas, configuration, deployment
- **Templates**: Complete TypeScript actor template
- **Examples**: 3 production-ready actor examples

---

Back to main workflow: `../SKILL.md`
