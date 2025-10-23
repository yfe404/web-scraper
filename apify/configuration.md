# Actor Configuration Patterns

Patterns for `.actor/actor.json` configuration.

## Basic Structure

```json
{
    "actorSpecification": 1,
    "name": "my-actor",
    "title": "My Actor",
    "description": "Short description",
    "version": "1.0",
    "meta": {
        "templateId": "project_playwright_crawler_ts"
    },
    "input": "./input_schema.json",
    "dockerfile": "./Dockerfile"
}
```

## Essential Fields

### Actor Identity

```json
{
    "name": "my-scraper",
    "title": "My Scraper",
    "description": "Scrapes data from example.com",
    "version": "1.0.0"
}
```

### Documentation

```json
{
    "readme": "./README.md",
    "changelog": "./CHANGELOG.md"
}
```

### Input/Output

```json
{
    "input": "./input_schema.json",
    "storages": {
        "dataset": {
            "actorSpecification": 1,
            "title": "Scraped data",
            "views": {
                "overview": {
                    "title": "Overview",
                    "transformation": {
                        "fields": ["title", "price", "url"]
                    },
                    "display": {
                        "component": "table"
                    }
                }
            }
        }
    }
}
```

## Resource Configuration

### Memory Settings

```json
{
    "defaultRunOptions": {
        "build": "latest",
        "timeoutSecs": 3600,
        "memoryMbytes": 4096
    }
}
```

Memory recommendations:
- **256-512 MB**: Simple HTTP scrapers
- **1024 MB**: Basic Playwright scrapers
- **2048 MB**: Medium-scale Playwright
- **4096 MB**: Large-scale or multiple browsers
- **8192+ MB**: Very large datasets

### Build Configuration

```json
{
    "dockerfile": "./Dockerfile",
    "dockerContextDir": "./",
    "buildTag": "latest"
}
```

## Environment Variables

### Pattern 1: Public Variables

```json
{
    "environmentVariables": {
        "LOG_LEVEL": "info",
        "MAX_RETRY": "3"
    }
}
```

### Pattern 2: With Descriptions

```json
{
    "environmentVariables": {
        "API_ENDPOINT": {
            "value": "https://api.example.com",
            "description": "API base URL"
        },
        "RATE_LIMIT": {
            "value": "60",
            "description": "Requests per minute"
        }
    }
}
```

## Complete Examples

### Pattern 1: Simple Scraper

```json
{
    "actorSpecification": 1,
    "name": "simple-scraper",
    "title": "Simple Web Scraper",
    "description": "Scrapes product data from e-commerce sites",
    "version": "1.0.0",
    "meta": {
        "templateId": "project_playwright_crawler_ts"
    },
    "input": "./input_schema.json",
    "dockerfile": "./Dockerfile",
    "readme": "./README.md",
    "defaultRunOptions": {
        "build": "latest",
        "timeoutSecs": 3600,
        "memoryMbytes": 2048
    },
    "storages": {
        "dataset": {
            "actorSpecification": 1,
            "title": "Scraped products",
            "views": {
                "overview": {
                    "title": "Product overview",
                    "transformation": {
                        "fields": ["name", "price", "inStock", "url"]
                    },
                    "display": {
                        "component": "table"
                    }
                }
            }
        }
    }
}
```

### Pattern 2: High-Performance Scraper

```json
{
    "actorSpecification": 1,
    "name": "fast-scraper",
    "title": "High-Performance Scraper",
    "description": "Fast scraping with concurrent requests",
    "version": "2.0.0",
    "input": "./input_schema.json",
    "dockerfile": "./Dockerfile",
    "defaultRunOptions": {
        "build": "latest",
        "timeoutSecs": 7200,
        "memoryMbytes": 4096
    },
    "environmentVariables": {
        "MAX_CONCURRENCY": "10",
        "MAX_REQUESTS_PER_MINUTE": "120"
    }
}
```

### Pattern 3: With Anti-Blocking

```json
{
    "actorSpecification": 1,
    "name": "stealth-scraper",
    "title": "Anti-Blocking Scraper",
    "description": "Scraper with fingerprinting and proxies",
    "version": "1.5.0",
    "input": "./input_schema.json",
    "dockerfile": "./Dockerfile",
    "defaultRunOptions": {
        "build": "latest",
        "timeoutSecs": 3600,
        "memoryMbytes": 4096
    },
    "environmentVariables": {
        "USE_FINGERPRINTING": "true",
        "PROXY_GROUP": "RESIDENTIAL"
    }
}
```

### Pattern 4: API-Based Scraper

```json
{
    "actorSpecification": 1,
    "name": "api-scraper",
    "title": "API Data Scraper",
    "description": "Fetches data via REST API",
    "version": "1.0.0",
    "input": "./input_schema.json",
    "dockerfile": "./Dockerfile",
    "defaultRunOptions": {
        "build": "latest",
        "timeoutSecs": 1800,
        "memoryMbytes": 1024
    },
    "environmentVariables": {
        "API_TIMEOUT": "30000",
        "RATE_LIMIT": "60"
    }
}
```

## Dataset Schema Configuration

### Basic Table View

```json
{
    "storages": {
        "dataset": {
            "actorSpecification": 1,
            "title": "Scraped data",
            "views": {
                "overview": {
                    "title": "Overview",
                    "transformation": {
                        "fields": ["title", "price", "url"]
                    },
                    "display": {
                        "component": "table",
                        "properties": {
                            "title": {
                                "label": "Product Name"
                            },
                            "price": {
                                "label": "Price ($)"
                            }
                        }
                    }
                }
            }
        }
    }
}
```

### Multiple Views

```json
{
    "storages": {
        "dataset": {
            "actorSpecification": 1,
            "title": "Product data",
            "views": {
                "overview": {
                    "title": "Product List",
                    "transformation": {
                        "fields": ["name", "price", "url"]
                    }
                },
                "detailed": {
                    "title": "Detailed View",
                    "transformation": {
                        "fields": ["name", "price", "description", "reviews", "url"]
                    }
                }
            }
        }
    }
}
```

## Build Tags and Versions

### Version Tagging

```json
{
    "version": "1.2.3",
    "buildTag": "latest"
}
```

Versioning pattern:
- `1.0.0` - Major version (breaking changes)
- `1.1.0` - Minor version (new features)
- `1.1.1` - Patch version (bug fixes)

### Build Tags

```bash
# Deploy with specific tag
apify push --build-tag beta

# Use in configuration
{
    "defaultRunOptions": {
        "build": "beta"
    }
}
```

Common tags:
- `latest` - Production release
- `beta` - Testing version
- `dev` - Development version

## Dockerfile Configuration

### Standard Playwright

```dockerfile
FROM apify/actor-node-playwright-chrome:20

COPY package*.json ./
RUN npm install --production

COPY . ./

RUN npm run build

CMD npm start
```

### With Custom Dependencies

```dockerfile
FROM apify/actor-node-playwright-chrome:20

# Install system dependencies
RUN apt-get update && apt-get install -y \
    imagemagick \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm install --production

COPY . ./
RUN npm run build

CMD npm start
```

## Timeout Configuration

```json
{
    "defaultRunOptions": {
        "timeoutSecs": 3600
    }
}
```

Timeout recommendations:
- **300s (5 min)**: Quick scrapers
- **1800s (30 min)**: Medium datasets
- **3600s (1 hour)**: Large datasets
- **7200s (2 hours)**: Very large datasets
- **86400s (24 hours)**: Maximum allowed

## Best Practices

### ✅ DO:
- Set appropriate memory for task
- Use semantic versioning
- Configure dataset views
- Set reasonable timeouts
- Document environment variables
- Use build tags for staging

### ❌ DON'T:
- Don't set too little memory (causes OOM)
- Don't set excessive timeouts
- Don't hardcode secrets in config
- Don't skip version numbers
- Don't use `latest` for dependencies

## Common Patterns

### Low Memory (HTTP Only)

```json
{
    "defaultRunOptions": {
        "memoryMbytes": 512,
        "timeoutSecs": 1800
    }
}
```

### Standard Playwright

```json
{
    "defaultRunOptions": {
        "memoryMbytes": 2048,
        "timeoutSecs": 3600
    }
}
```

### High Performance

```json
{
    "defaultRunOptions": {
        "memoryMbytes": 4096,
        "timeoutSecs": 7200
    },
    "environmentVariables": {
        "MAX_CONCURRENCY": "10"
    }
}
```

### API Scraping

```json
{
    "defaultRunOptions": {
        "memoryMbytes": 1024,
        "timeoutSecs": 1800
    }
}
```

## Resources

- [actor.json Docs](https://docs.apify.com/platform/actors/development/actor-definition/actor-json)
- [Dataset Schema](https://docs.apify.com/platform/actors/development/actor-definition/dataset-schema)
- [Docker Images](https://docs.apify.com/platform/actors/development/actor-definition/dockerfile)
