# Actor Initialization Patterns

Quick reference for setting up Apify Actor development environment.

## Prerequisites

```bash
# Node.js 16+ required
node --version

# npm 8+ required
npm --version
```

## Installation

### Install Apify CLI

```bash
# Global installation
npm install -g apify-cli

# Verify installation
apify --version

# Update to latest
npm update -g apify-cli
```

## Authentication

### Login to Apify Platform

```bash
# Interactive login (opens browser)
apify login

# Check login status
apify info

# View current user
apify info --json

# Logout
apify logout
```

### API Token (Alternative)

```bash
# Set token via environment variable
export APIFY_TOKEN=your_token_here

# Or add to .env file
echo "APIFY_TOKEN=your_token" > .env
```

## Project Initialization

### Pattern 1: New Actor (Recommended)

```bash
# Create new actor with CLI
apify create my-actor

# CLI prompts:
? What type of Actor do you want to create?
❯ playwright-ts (TypeScript) ← RECOMMENDED
  playwright-crawler (JavaScript)
  cheerio-crawler (JavaScript)
  playwright-python (Python)

# Navigate to project
cd my-actor

# Install dependencies
npm install

# Run locally
apify run
```

### Pattern 2: Initialize Existing Directory

```bash
# If you have existing code
cd existing-project

# Initialize as Actor
apify init

# Select template
# Add .actor/ configuration files
# Update package.json
```

### Pattern 3: Clone Existing Actor

```bash
# Pull actor from platform
apify pull username/actor-name

# Or by ID
apify pull actor-id

# Makes local copy with all configuration
```

## Generated Structure

### TypeScript Actor (playwright-ts)

```
my-actor/
├── .actor/
│   ├── actor.json              # Actor configuration
│   └── input_schema.json       # Input validation
├── src/
│   └── main.ts                 # Main source file
├── storage/
│   ├── datasets/
│   ├── key_value_stores/
│   └── request_queues/
├── .dockerignore
├── .gitignore
├── .prettierrc
├── Dockerfile                  # Build configuration
├── eslint.config.js           # Linting rules
├── package.json               # Dependencies
├── tsconfig.json              # TypeScript config
└── README.md                  # Documentation
```

## Environment Setup

### Local Development

```bash
# Create .env file for secrets
cat > .env << 'EOF'
APIFY_TOKEN=your_token_here
PROXY_PASSWORD=your_proxy_password
EOF

# Add to .gitignore
echo ".env" >> .gitignore
```

### Environment Variables

```bash
# Available in Actor runs
APIFY_TOKEN              # Authentication token
APIFY_IS_AT_HOME        # Running on platform?
APIFY_DEFAULT_DATASET_ID
APIFY_DEFAULT_KEY_VALUE_STORE_ID
APIFY_DEFAULT_REQUEST_QUEUE_ID
```

## First Run

### Local Testing

```bash
# Run with default input
apify run

# Run with custom input
apify run --input='{"startUrls":[{"url":"https://example.com"}]}'

# Run with input file
apify run --input-file=input.json

# Purge storage before run
apify run --purge

# Debug mode
DEBUG=crawlee:* apify run
```

### Input File Example

```json
{
  "startUrls": [
    { "url": "https://example.com" }
  ],
  "maxItems": 100,
  "proxyConfiguration": {
    "useApifyProxy": true
  }
}
```

## Troubleshooting

### Issue: "Command not found: apify"

```bash
# Reinstall CLI
npm install -g apify-cli

# Check PATH
echo $PATH

# Verify installation location
npm root -g
```

### Issue: "Not logged in"

```bash
# Login
apify login

# Or use token
export APIFY_TOKEN=your_token
```

### Issue: "Permission denied"

```bash
# Use sudo (Linux/Mac)
sudo npm install -g apify-cli

# Or use nvm to manage Node without sudo
```

### Issue: Build Fails

```bash
# Check TypeScript errors
npm run build

# Clean install
rm -rf node_modules package-lock.json
npm install

# Update dependencies
npm update
```

### Issue: Storage Not Created

```bash
# Ensure storage/ directory exists
mkdir -p storage/{datasets,key_value_stores,request_queues}

# Run with --purge once
apify run --purge
```

## Quick Command Reference

```bash
# Project setup
apify create <name>              # New actor
apify init                       # Init existing dir
apify pull <actor-id>           # Clone actor

# Authentication
apify login                      # Login
apify logout                     # Logout
apify info                       # Check status

# Development
apify run                        # Run locally
apify run --purge               # Clear storage first
apify run --input-file=file.json # Custom input

# Deployment
apify push                       # Deploy to platform
apify push --build-tag beta     # Tag build
apify call <actor-id>           # Run on platform
```

## Best Practices

### ✅ DO:
- Always use `apify create` for new actors
- Keep CLI updated (`npm update -g apify-cli`)
- Use `.env` for local secrets
- Test locally before pushing
- Use TypeScript template (`playwright-ts`)

### ❌ DON'T:
- Don't create actors manually
- Don't commit `.env` files
- Don't skip local testing
- Don't use old CLI versions
- Don't hardcode tokens

## Next Steps

After initialization:
1. Review generated files
2. Customize input schema (`.actor/input_schema.json`)
3. Update actor config (`.actor/actor.json`)
4. Write scraping logic (`src/main.ts`)
5. Test locally (`apify run`)
6. Deploy (`apify push`)

See:
- `input-schemas.md` - Input schema patterns
- `configuration.md` - Actor configuration
- `deployment.md` - Deployment workflow
