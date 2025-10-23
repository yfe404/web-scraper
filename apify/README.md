# Apify Actor Development

Production-ready Actor creation with TypeScript and Apify CLI.

## When to Use This Module

Load this module when user requests:
- "Make this an Apify Actor"
- "Productionize this scraper"
- "Deploy to Apify"
- "Create an actor"

## Quick Start

```bash
# 1. Install Apify CLI
npm install -g apify-cli

# 2. Create actor (TypeScript recommended)
apify create my-scraper

# 3. Select template based on site type:
#    - project_cheerio_crawler_ts (static HTML, fastest)
#    - project_playwright_crawler_ts (JavaScript-heavy)

# 4. Develop and test
apify run

# 5. Deploy
apify push
```

## Files in This Directory

### Core Guides
1. **typescript-first.md** - Why TypeScript for Actors (STRONGLY RECOMMENDED)
2. **cli-workflow.md** - apify create workflow (CRITICAL - always use CLI)
3. **initialization.md** - Setup and authentication patterns
4. **input-schemas.md** - Input validation patterns (6 complete examples)
5. **configuration.md** - actor.json configuration patterns
6. **deployment.md** - Testing and deployment workflows

### Templates
- **templates/typescript-actor/** - Complete TypeScript actor template
  - `src/main.ts` - Full-featured main file
  - `src/types.ts` - Type definitions
  - `.actor/` - Configuration files
  - `package.json`, `tsconfig.json`, `Dockerfile`

### Examples
- **examples/basic-scraper/** - Sitemap + Playwright scraper
- **examples/anti-blocking/** - Fingerprinting + proxies
- **examples/hybrid-api/** - Sitemap + API (optimal pattern)

## TypeScript-First Philosophy

**For production Actors, TypeScript is STRONGLY RECOMMENDED**:

✅ Type safety (catch errors at compile time)
✅ IDE autocomplete for Apify/Crawlee APIs
✅ Better refactoring support
✅ Self-documenting code
✅ Industry standard for production

See `typescript-first.md` for details.

## CLI-First Workflow

**CRITICAL: Always use `apify create` command**

❌ DON'T create actors manually
✅ DO use `apify create` command

The CLI auto-generates:
- Proper project structure
- TypeScript configuration
- ESLint setup
- .actor/ directory
- Dockerfile
- npm scripts

See `cli-workflow.md` for details.

## Recommended Reading Order

1. **cli-workflow.md** - Start here (apify create)
2. **typescript-first.md** - Why TypeScript
3. **initialization.md** - Complete setup
4. **input-schemas.md** - Define inputs
5. **configuration.md** - Configure actor
6. **deployment.md** - Deploy to platform

---

Back to main skill: `../SKILL.md`
