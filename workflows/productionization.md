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

## Step 2: Initialize with Apify CLI

**CRITICAL**: Always use `apify create` command

```bash
# Install CLI if needed
npm install -g apify-cli

# ALWAYS use apify create (not manual setup)
apify create my-scraper

# When prompted, select:
# → playwright-ts (for TypeScript)
# → playwright-crawler (for JavaScript)
```

### Why This Is Critical

- Auto-generates proper structure
- Includes ESLint, TypeScript config
- Creates .actor/ directory correctly
- Sets up npm scripts
- Adds proper Dockerfile

See `../apify/cli-workflow.md` for complete guide.

## Step 3: Port Scraping Logic

### Conversion Checklist

1. Wrap in `Actor.main()`
2. Add type definitions (if TypeScript)
3. Configure input schema
4. Set up dataset output
5. Add error handling

See `../apify/templates/` for complete templates.

## Step 4: Test & Deploy

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
| TypeScript setup | Use `playwright-ts` | `../apify/typescript-first.md` |
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
