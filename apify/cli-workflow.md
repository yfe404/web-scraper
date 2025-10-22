# Apify CLI Workflow

## Overview

**CRITICAL: Always use `apify create` command when starting a new Actor.**

This is THE recommended and ONLY proper way to initialize Apify Actors.

## Why apify create is CRITICAL

### ✅ Auto-Generated Files

The `apify create` command generates:

- ✅ `package.json` with correct dependencies and scripts
- ✅ `.actor/actor.json` with proper structure
- ✅ `.actor/input_schema.json` template
- ✅ `Dockerfile` with correct base image
- ✅ `tsconfig.json` (for TypeScript templates)
- ✅ `eslint.config.js` for code quality
- ✅ `.gitignore` with Apify-specific entries
- ✅ `storage/` directory structure
- ✅ `README.md` template
- ✅ Example source code

### ✅ Proper Tooling Setup

Automatically configures:

- ESLint for code quality
- TypeScript compilation (for TS templates)
- npm scripts (`start`, `build`, `test`)
- Apify SDK with correct version
- Crawlee with correct version

### ❌ What Happens Without apify create

Manual setup leads to:

- ❌ Missing ESLint configuration
- ❌ Incorrect dependencies/versions
- ❌ Poor project structure
- ❌ Missing `.actor/` directory
- ❌ Incorrect Dockerfile
- ❌ More debugging time
- ❌ Deployment failures

## Step-by-Step Workflow

### Step 1: Install Apify CLI

```bash
# Check if already installed
apify --version

# If not installed
npm install -g apify-cli

# Verify installation
apify --version
```

### Step 2: Login to Apify

```bash
# Login (required for push/deployment)
apify login

# This opens browser for authentication
```

### Step 3: Create New Actor

```bash
# Create actor
apify create my-scraper

# You'll be prompted:
# → What type of Actor do you want to create?
```

### Step 4: Choose Template

**RECOMMENDED: playwright-ts (TypeScript)**

Available templates:

| Template | Language | Best For |
|----------|----------|----------|
| **playwright-ts** | TypeScript | **Production actors (RECOMMENDED)** |
| playwright-crawler | JavaScript | Simple JS actors |
| playwright-python | Python | Python developers |
| cheerio-crawler | JavaScript | Static HTML sites |

**For production, always choose `playwright-ts`**:

```
? What type of Actor do you want to create?
❯ playwright-ts (TypeScript) ← SELECT THIS
  playwright-crawler (JavaScript)
  cheerio-crawler (JavaScript)
  playwright-python (Python)
```

### Step 5: Navigate to Project

```bash
cd my-scraper

# View generated structure
ls -la
```

### Step 6: Review Generated Files

```
my-scraper/
├── .actor/
│   ├── actor.json                 ← Actor configuration
│   └── input_schema.json          ← Input validation
├── src/
│   └── main.ts                    ← Your code here
├── storage/                       ← Local storage
├── .dockerignore
├── .gitignore
├── .prettierrc
├── Dockerfile                     ← Production build
├── eslint.config.js               ← Code quality
├── package.json                   ← Dependencies & scripts
├── tsconfig.json                  ← TypeScript config
└── README.md                      ← Documentation
```

### Step 7: Install Dependencies

```bash
npm install
```

### Step 8: Develop Your Actor

Edit `src/main.ts`:

```typescript
import { Actor } from 'apify';
import { PlaywrightCrawler, Dataset } from 'crawlee';

await Actor.main(async () => {
    const input = await Actor.getInput();

    const crawler = new PlaywrightCrawler({
        async requestHandler({ page, request }) {
            // Your scraping logic here
        },
    });

    await crawler.run(input.startUrls);
});
```

### Step 9: Test Locally

```bash
# Run actor locally
apify run

# With specific input
apify run --input='{"startUrls":[{"url":"https://example.com"}]}'

# Debug mode
DEBUG=crawlee:* apify run
```

### Step 10: Build (TypeScript Only)

```bash
# Compile TypeScript
npm run build

# Output in dist/ directory
```

### Step 11: Push to Apify Platform

```bash
# Deploy to Apify
apify push

# With specific build tag
apify push --build-tag beta

# Force rebuild
apify push --force
```

### Step 12: Call Your Actor

```bash
# Run actor on Apify platform
apify call my-scraper

# With input
apify call my-scraper --input='{"startUrls":[{"url":"https://example.com"}]}'
```

## Complete CLI Command Reference

### Project Management

```bash
# Create new actor
apify create [name]

# Initialize in existing directory
apify init

# Login/logout
apify login
apify logout

# Check login status
apify info
```

### Development

```bash
# Run locally
apify run
apify run --purge           # Clear storage first
apify run --input-file=input.json

# Run specific actor
apify call [actor-id]
apify call [actor-id] --build=beta
```

### Deployment

```bash
# Push to platform
apify push
apify push --build-tag [tag]
apify push --version-number [version]
apify push --wait-for-finish

# Pull actor from platform
apify pull [actor-id]
```

### Storage Management

```bash
# Manage datasets
apify dataset ls
apify dataset get [id]

# Manage key-value stores
apify kv-store ls
apify kv-store get [id]
```

## npm Scripts (Generated by apify create)

The CLI generates these useful scripts:

```json
{
    "scripts": {
        "start": "npm run build && node dist/main.js",
        "build": "tsc",
        "test": "echo \"No tests yet\"",
        "lint": "eslint src",
        "lint:fix": "eslint src --fix"
    }
}
```

Usage:

```bash
npm start          # Build and run
npm run build      # Compile TypeScript
npm test           # Run tests
npm run lint       # Check code quality
npm run lint:fix   # Auto-fix linting issues
```

## Development Workflow

### Typical Development Cycle

```bash
# 1. Create actor
apify create my-scraper
cd my-scraper

# 2. Develop
# Edit src/main.ts

# 3. Test locally
apify run

# 4. Fix issues, repeat step 3

# 5. Lint code
npm run lint:fix

# 6. Push to platform
apify push

# 7. Test on platform
apify call my-scraper

# 8. Iterate
# Edit code, repeat from step 3
```

## Common Issues

### Issue: "Command not found: apify"

**Solution**:
```bash
npm install -g apify-cli
```

### Issue: "Not logged in"

**Solution**:
```bash
apify login
```

### Issue: Build fails

**Solution**:
```bash
# Check TypeScript errors
npm run build

# Fix errors in src/
# Then try again:
apify push
```

## Anti-Pattern: Manual Creation

### ❌ DON'T Do This

```bash
# BAD: Manual setup
mkdir my-actor
cd my-actor
npm init -y
npm install apify crawlee
# ... missing tons of configuration
```

**Why this is wrong**:
- Missing `.actor/` directory
- No input schema
- Incorrect Dockerfile
- No ESLint config
- No TypeScript setup
- Missing npm scripts
- Will fail deployment

### ✅ DO This Instead

```bash
# GOOD: Use CLI
apify create my-actor
cd my-actor
# Everything configured correctly!
```

## Best Practices

### ✅ DO:

- **Always use `apify create`** (not manual setup)
- **Choose `playwright-ts` template** for production
- **Test locally first** with `apify run`
- **Use build tags** for staging (`--build-tag beta`)
- **Keep CLI updated** (`npm update -g apify-cli`)
- **Use `.env` file** for local secrets
- **Commit to git** (except storage/, dist/)

### ❌ DON'T:

- **Create actors manually** - use CLI!
- **Skip local testing** - test before push
- **Hardcode secrets** - use environment variables
- **Push without building** (TypeScript actors)
- **Ignore linting errors** - fix them
- **Skip version tags** - use semantic versioning

## Resources

- [Apify CLI Docs](https://docs.apify.com/cli)
- [CLI Reference](https://docs.apify.com/cli/docs/reference)
- [Actor Development](https://docs.apify.com/platform/actors)

## Summary

**The Apify CLI is THE way to create Actors**

**Key commands**:
1. `apify create` - Create new actor (CRITICAL)
2. `apify run` - Test locally
3. `apify push` - Deploy to platform
4. `apify call` - Run on platform

**Remember**: Always use `apify create`, never manual setup!
