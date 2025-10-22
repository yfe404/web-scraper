# Common Regex Patterns for URL Filtering

Quick reference for filtering sitemap URLs with regex.

## Product Pages

```javascript
// Basic product pattern
/\/products\/[a-z0-9-]+$/i

// Product with numeric ID
/\/products\/(\d+)/

// Product with slug
/\/products\/([a-z0-9-]+)$/i

// Exclude category pages
/\/products\/[^\/]+$/
// Matches: /products/shoe-123
// Skips: /products/shoes/running

// Specific category
/\/products\/electronics\/[^\/]+$/
```

## Blog Posts

```javascript
// Blog with date
/\/blog\/\d{4}\/\d{2}\/[a-z0-9-]+/i
// Matches: /blog/2025/10/my-post

// Blog without date
/\/blog\/[a-z0-9-]+$/i

// WordPress pattern
/\/\d{4}\/\d{2}\/[a-z0-9-]+/
```

## Multiple Patterns

```javascript
// Products OR deals
/(\/products\/[^\/]+|\/deals\/[^\/]+)/

// Multiple categories
/\/(electronics|clothing|books)\/[^\/]+$/
```

## Exclude Patterns

```javascript
// Exclude pages
/^(?!.*(about|contact|help)).*$/

// Exclude file extensions
/^(?!.*\.(pdf|jpg|png)).*$/
```

## Usage with RequestList

```javascript
import { RequestList } from 'crawlee';

const requestList = await RequestList.open(null, [{
    requestsFromUrl: 'https://site.com/sitemap.xml',
    regex: /\/products\/[^\/]+$/,
}]);
```

## Testing Patterns

Test your regex before running:

```javascript
const pattern = /\/products\/[^\/]+$/;
const urls = [
    'https://shop.com/products/shoe-123',      // ✓ Match
    'https://shop.com/products/shoes/running', // ✗ No match (has /)
    'https://shop.com/products',               // ✗ No match (no product)
];

urls.forEach(url => {
    console.log(`${url}: ${pattern.test(url) ? '✓' : '✗'}`);
});
```
