# TypeScript-First Actor Development

## Overview

For production Apify Actors, **TypeScript is STRONGLY RECOMMENDED** over JavaScript.

## Why TypeScript?

### 1. Type Safety

**Catch errors at compile time, not runtime**:

```typescript
// TypeScript catches this error BEFORE deployment
interface Input {
    startUrls: { url: string }[];
    maxItems: number; // Expects number
}

const input = await Actor.getInput<Input>();
input.maxItems = "100"; // ❌ TypeScript error: Type 'string' is not assignable to type 'number'
```

```javascript
// JavaScript fails AT RUNTIME in production
const input = await Actor.getInput();
input.maxItems = "100"; // ❌ Runtime error when used in math operation
```

### 2. IDE Autocomplete

TypeScript provides IntelliSense for all Apify/Crawlee APIs:

```typescript
import { Actor } from 'apify';
import { PlaywrightCrawler } from 'crawlee';

// IDE shows all available methods and their parameters
await Actor.main(async () => {
    const input = await Actor.getInput(); // Autocomplete for Actor methods

    const crawler = new PlaywrightCrawler({
        // Autocomplete shows all config options
        maxConcurrency: 5,
        maxRequestsPerMinute: 60,
        // IDE warns if you use invalid options
    });
});
```

### 3. Self-Documenting Code

Types serve as inline documentation:

```typescript
// Clear interface = instant understanding
interface Product {
    id: number;
    name: string;
    price: number;
    inStock: boolean;
    images: string[];
    metadata?: {
        brand: string;
        category: string;
    };
}

// Function signature is self-documenting
async function scrapeProduct(url: string): Promise<Product> {
    // Implementation
}
```

### 4. Better Refactoring

Rename variables/functions with confidence:

```typescript
// Rename 'maxItems' to 'limit'
// TypeScript updates ALL usages automatically
// JavaScript might miss some references
```

### 5. Team Collaboration

New team members understand code faster:

```typescript
// Clear types = less documentation needed
interface ActorInput {
    startUrls: { url: string }[];
    maxItems?: number; // Optional
    proxyConfiguration?: object;
}

// Anyone reading this knows exactly what to expect
```

## Setting Up TypeScript Actor

### Use apify create (Recommended)

```bash
# Create new actor with TypeScript template
apify create my-scraper

# Select: playwright-ts (TypeScript template)
```

This auto-generates:
- `tsconfig.json` - TypeScript configuration
- `src/main.ts` - TypeScript source
- `package.json` - Build scripts
- Type definitions for Apify/Crawlee

### Generated Structure

```
my-scraper/
├── src/
│   ├── main.ts          ← TypeScript source
│   └── types.ts         ← Custom type definitions
├── .actor/
│   ├── actor.json
│   └── input_schema.json
├── tsconfig.json        ← TypeScript config
├── package.json         ← Build scripts
├── Dockerfile
└── README.md
```

## TypeScript Patterns for Actors

### Pattern 1: Typed Input

```typescript
import { Actor } from 'apify';

// Define input interface
interface Input {
    startUrls: { url: string }[];
    maxItems?: number;
    proxyConfiguration?: object;
}

await Actor.main(async () => {
    // Get typed input
    const input = await Actor.getInput<Input>();

    if (!input) {
        throw new Error('Input is required');
    }

    // TypeScript knows input.startUrls exists and is an array
    console.log(`Processing ${input.startUrls.length} URLs`);

    // Optional chaining with type safety
    const limit = input.maxItems ?? 100;
});
```

### Pattern 2: Typed Dataset Output

```typescript
import { Dataset } from 'crawlee';

// Define output interface
interface Product {
    url: string;
    name: string;
    price: number;
    inStock: boolean;
}

// TypeScript ensures correct shape
await Dataset.pushData<Product>({
    url: 'https://...',
    name: 'Product Name',
    price: 99.99,
    inStock: true,
    // extraField: 'value' // ❌ TypeScript error
});
```

### Pattern 3: Typed Request Handler

```typescript
import { PlaywrightCrawler, Dataset } from 'crawlee';

interface Product {
    name: string;
    price: number;
}

const crawler = new PlaywrightCrawler({
    async requestHandler({ page, request, log }) {
        // Extract with type safety
        const product: Product = await page.evaluate(() => ({
            name: document.querySelector('h1')?.textContent ?? '',
            price: parseFloat(document.querySelector('.price')?.textContent ?? '0'),
        }));

        await Dataset.pushData<Product>(product);
    },
});
```

### Pattern 4: Custom Types

```typescript
// types.ts
export interface ScrapedProduct {
    id: number;
    name: string;
    price: number;
    url: string;
}

export interface ScraperConfig {
    maxConcurrency: number;
    requestsPerMinute: number;
}

// main.ts
import { ScrapedProduct, ScraperConfig } from './types';

const config: ScraperConfig = {
    maxConcurrency: 5,
    requestsPerMinute: 60,
};
```

## Build Process

TypeScript actors require compilation:

```bash
# Build TypeScript to JavaScript
npm run build

# Output goes to dist/ directory
```

The build process is automatic when using `apify push`.

## TypeScript Configuration

Example `tsconfig.json`:

```json
{
    "compilerOptions": {
        "target": "ES2022",
        "module": "NodeNext",
        "moduleResolution": "NodeNext",
        "outDir": "dist",
        "strict": true,
        "esModuleInterop": true,
        "skipLibCheck": true,
        "resolveJsonModule": true
    },
    "include": ["src/**/*"],
    "exclude": ["node_modules", "dist"]
}
```

## Common TypeScript Patterns

### Null Safety

```typescript
// Handle potentially null values safely
const price = document.querySelector('.price')?.textContent ?? 'N/A';

// TypeScript enforces null checks
if (element) {
    const text = element.textContent; // Safe
}
```

### Enum for Constants

```typescript
enum ScraperMode {
    FAST = 'fast',
    THOROUGH = 'thorough',
    BALANCED = 'balanced',
}

const mode: ScraperMode = ScraperMode.BALANCED;
```

### Type Guards

```typescript
function isValidProduct(data: any): data is Product {
    return (
        typeof data.name === 'string' &&
        typeof data.price === 'number' &&
        typeof data.inStock === 'boolean'
    );
}

const scraped = await page.evaluate(/* ... */);
if (isValidProduct(scraped)) {
    await Dataset.pushData(scraped); // Type-safe
}
```

## Best Practices

### ✅ DO:

- **Use TypeScript for all production Actors**
- **Define interfaces for input/output**
- **Enable strict mode** in tsconfig.json
- **Use type imports** from Apify/Crawlee
- **Document complex types** with JSDoc
- **Use enums** for constant values
- **Leverage IDE autocomplete**

### ❌ DON'T:

- **Use `any` type** (defeats purpose of TypeScript)
- **Disable strict checks** (loses type safety)
- **Skip type definitions** for custom data
- **Forget to compile** before testing locally
- **Ignore TypeScript errors** (fix them!)

## Migration from JavaScript

If you have existing JavaScript actor:

1. Rename `.js` files to `.ts`
2. Add type annotations gradually
3. Fix TypeScript errors
4. Add `tsconfig.json`
5. Update build scripts
6. Test thoroughly

Or better: Create new TypeScript actor with `apify create` and port logic.

## Resources

- [Apify TypeScript Docs](https://docs.apify.com/sdk/js/docs/guides/type-script-actor)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Crawlee TypeScript Examples](https://crawlee.dev/docs/examples)

## Summary

**TypeScript = Better Actors**

**Key benefits**:
1. Catch errors before deployment
2. IDE autocomplete for all APIs
3. Self-documenting code
4. Easier refactoring
5. Better team collaboration
6. Industry standard

**Always use `playwright-ts` template when creating new actors!**
