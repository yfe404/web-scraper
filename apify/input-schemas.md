# Input Schema Patterns

Patterns for defining Actor input validation in `.actor/input_schema.json`.

## Schema Structure

```json
{
    "title": "Actor Input",
    "type": "object",
    "schemaVersion": 1,
    "properties": {
        "fieldName": {
            "title": "Field Label",
            "type": "string",
            "description": "Help text",
            "editor": "textfield"
        }
    },
    "required": ["fieldName"]
}
```

## Common Field Types

### String Field

```json
{
    "url": {
        "title": "URL",
        "type": "string",
        "description": "Website URL to scrape",
        "editor": "textfield",
        "pattern": "https?://.+",
        "example": "https://example.com"
    }
}
```

### Number Field

```json
{
    "maxItems": {
        "title": "Maximum items",
        "type": "integer",
        "description": "Max number of items to scrape",
        "editor": "number",
        "default": 100,
        "minimum": 1,
        "maximum": 10000
    }
}
```

### Boolean Field

```json
{
    "saveHtml": {
        "title": "Save HTML",
        "type": "boolean",
        "description": "Save raw HTML",
        "editor": "checkbox",
        "default": false
    }
}
```

### Array of URLs

```json
{
    "startUrls": {
        "title": "Start URLs",
        "type": "array",
        "description": "List of URLs to scrape",
        "editor": "requestListSources",
        "placeholderValue": [{"url": "https://example.com"}],
        "minItems": 1
    }
}
```

### Select Dropdown

```json
{
    "mode": {
        "title": "Scraping mode",
        "type": "string",
        "description": "Choose scraping strategy",
        "editor": "select",
        "enum": ["fast", "thorough", "balanced"],
        "enumTitles": ["Fast", "Thorough", "Balanced"],
        "default": "balanced"
    }
}
```

### Object Field

```json
{
    "proxyConfiguration": {
        "title": "Proxy configuration",
        "type": "object",
        "description": "Proxy settings",
        "editor": "proxy",
        "default": {"useApifyProxy": true}
    }
}
```

### Text Area

```json
{
    "customJs": {
        "title": "Custom JavaScript",
        "type": "string",
        "description": "Custom page function",
        "editor": "javascript",
        "prefill": "async ({ page }) => {\n    // Your code\n}"
    }
}
```

### Hidden Field

```json
{
    "version": {
        "title": "Version",
        "type": "string",
        "description": "Internal version",
        "editor": "hidden",
        "default": "1.0.0"
    }
}
```

## Complete Examples

### Pattern 1: Basic Scraper

```json
{
    "title": "Basic Scraper Input",
    "type": "object",
    "schemaVersion": 1,
    "properties": {
        "startUrls": {
            "title": "Start URLs",
            "type": "array",
            "description": "URLs to scrape",
            "editor": "requestListSources",
            "minItems": 1
        },
        "maxItems": {
            "title": "Maximum items",
            "type": "integer",
            "description": "Max results",
            "editor": "number",
            "default": 100,
            "minimum": 1
        }
    },
    "required": ["startUrls"]
}
```

### Pattern 2: E-commerce Scraper

```json
{
    "title": "E-commerce Scraper Input",
    "type": "object",
    "schemaVersion": 1,
    "properties": {
        "startUrls": {
            "title": "Product URLs",
            "type": "array",
            "description": "Product pages to scrape",
            "editor": "requestListSources"
        },
        "maxItems": {
            "title": "Max products",
            "type": "integer",
            "description": "Maximum products to scrape",
            "editor": "number",
            "default": 1000
        },
        "includeReviews": {
            "title": "Include reviews",
            "type": "boolean",
            "description": "Scrape product reviews",
            "editor": "checkbox",
            "default": false
        },
        "minPrice": {
            "title": "Minimum price",
            "type": "number",
            "description": "Filter by minimum price",
            "editor": "number",
            "minimum": 0
        },
        "proxyConfiguration": {
            "title": "Proxy configuration",
            "type": "object",
            "description": "Proxy settings",
            "editor": "proxy"
        }
    },
    "required": ["startUrls"]
}
```

### Pattern 3: Advanced Scraper with Options

```json
{
    "title": "Advanced Scraper Input",
    "type": "object",
    "schemaVersion": 1,
    "properties": {
        "startUrls": {
            "title": "Start URLs",
            "type": "array",
            "description": "URLs to scrape",
            "editor": "requestListSources"
        },
        "mode": {
            "title": "Scraping mode",
            "type": "string",
            "description": "Choose strategy",
            "editor": "select",
            "enum": ["sitemap", "api", "playwright", "hybrid"],
            "enumTitles": ["Sitemap", "API", "Playwright", "Hybrid"],
            "default": "hybrid"
        },
        "maxConcurrency": {
            "title": "Max concurrency",
            "type": "integer",
            "description": "Parallel requests",
            "editor": "number",
            "default": 5,
            "minimum": 1,
            "maximum": 50
        },
        "maxRequestsPerMinute": {
            "title": "Max requests/min",
            "type": "integer",
            "description": "Rate limit",
            "editor": "number",
            "default": 60
        },
        "useFingerprinting": {
            "title": "Use fingerprinting",
            "type": "boolean",
            "description": "Anti-blocking",
            "editor": "checkbox",
            "default": false
        },
        "proxyConfiguration": {
            "title": "Proxy configuration",
            "type": "object",
            "description": "Proxy settings",
            "editor": "proxy"
        }
    },
    "required": ["startUrls", "mode"]
}
```

### Pattern 4: API-based Scraper

```json
{
    "title": "API Scraper Input",
    "type": "object",
    "schemaVersion": 1,
    "properties": {
        "apiUrl": {
            "title": "API URL",
            "type": "string",
            "description": "API endpoint",
            "editor": "textfield",
            "pattern": "https?://.+"
        },
        "apiKey": {
            "title": "API Key",
            "type": "string",
            "description": "Authentication key",
            "editor": "textfield",
            "isSecret": true
        },
        "pageSize": {
            "title": "Page size",
            "type": "integer",
            "description": "Items per page",
            "editor": "number",
            "default": 100
        },
        "maxPages": {
            "title": "Max pages",
            "type": "integer",
            "description": "Maximum pages to fetch",
            "editor": "number",
            "default": 10
        }
    },
    "required": ["apiUrl"]
}
```

### Pattern 5: Sitemap + Playwright

```json
{
    "title": "Sitemap Scraper Input",
    "type": "object",
    "schemaVersion": 1,
    "properties": {
        "sitemapUrl": {
            "title": "Sitemap URL",
            "type": "string",
            "description": "URL to sitemap.xml",
            "editor": "textfield",
            "example": "https://example.com/sitemap.xml"
        },
        "urlPattern": {
            "title": "URL pattern (regex)",
            "type": "string",
            "description": "Filter URLs by regex",
            "editor": "textfield",
            "example": "/products/.*"
        },
        "maxItems": {
            "title": "Maximum items",
            "type": "integer",
            "description": "Max URLs to scrape",
            "editor": "number",
            "default": 1000
        },
        "proxyConfiguration": {
            "title": "Proxy configuration",
            "type": "object",
            "editor": "proxy"
        }
    },
    "required": ["sitemapUrl"]
}
```

### Pattern 6: With Custom Fields

```json
{
    "title": "Custom Scraper Input",
    "type": "object",
    "schemaVersion": 1,
    "properties": {
        "startUrls": {
            "title": "Start URLs",
            "type": "array",
            "editor": "requestListSources"
        },
        "selectors": {
            "title": "Custom selectors",
            "type": "object",
            "description": "CSS selectors for data",
            "editor": "json",
            "prefill": "{\n  \"title\": \"h1\",\n  \"price\": \".price\"\n}"
        },
        "customFunction": {
            "title": "Custom function",
            "type": "string",
            "description": "Custom extraction logic",
            "editor": "javascript",
            "prefill": "async ({ page }) => {\n    return { title: await page.title() };\n}"
        }
    },
    "required": ["startUrls"]
}
```

## Field Editors

Available editor types:

| Editor | Use For | Type |
|--------|---------|------|
| `textfield` | Short text | string |
| `textarea` | Long text | string |
| `number` | Numbers | integer/number |
| `checkbox` | Boolean | boolean |
| `select` | Dropdown | string |
| `json` | JSON object | object |
| `javascript` | Code | string |
| `proxy` | Proxy config | object |
| `requestListSources` | URL arrays | array |
| `hidden` | Hidden field | any |

## Validation Patterns

### URL Validation

```json
{
    "pattern": "^https?://.*",
    "example": "https://example.com"
}
```

### Email Validation

```json
{
    "pattern": "^[^@]+@[^@]+\\.[^@]+$",
    "example": "user@example.com"
}
```

### Number Range

```json
{
    "minimum": 1,
    "maximum": 1000,
    "default": 100
}
```

### Required Array

```json
{
    "type": "array",
    "minItems": 1
}
```

### Secret Field

```json
{
    "isSecret": true,
    "editor": "textfield"
}
```

## TypeScript Usage

```typescript
// Define matching interface
interface Input {
    startUrls: { url: string }[];
    maxItems?: number;
    proxyConfiguration?: object;
}

// Use in Actor
await Actor.main(async () => {
    const input = await Actor.getInput<Input>();

    if (!input?.startUrls) {
        throw new Error('startUrls is required');
    }
});
```

## Best Practices

### ✅ DO:
- Provide clear `description` for each field
- Set sensible `default` values
- Use appropriate `editor` types
- Add `example` values
- Validate with `pattern`, `minimum`, `maximum`
- Mark secrets with `isSecret: true`

### ❌ DON'T:
- Don't use `any` type
- Don't skip descriptions
- Don't hardcode large defaults
- Don't forget `required` fields
- Don't expose secrets in prefill

## Resources

- [Input Schema Docs](https://docs.apify.com/platform/actors/development/actor-definition/input-schema)
- [JSON Schema Spec](https://json-schema.org/)
- [Apify Editor Types](https://docs.apify.com/platform/actors/development/actor-definition/input-schema/specification/v1#editor-types)
