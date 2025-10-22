# Actor Deployment Patterns

Testing and deployment workflows for Apify Actors.

## Local Testing

### Basic Run

```bash
# Run with default input
apify run

# Output shows:
# - Actor initialization
# - Logs
# - Results saved to ./storage/datasets/default/
```

### With Custom Input

```bash
# Inline JSON
apify run --input='{"startUrls":[{"url":"https://example.com"}]}'

# From file
apify run --input-file=./test-input.json

# Different input file
apify run --input-file=./inputs/production.json
```

### Clean Run

```bash
# Purge storage before running
apify run --purge

# Fresh start, no cached data
```

### Debug Mode

```bash
# Enable debug logging
DEBUG=crawlee:* apify run

# Multiple debug namespaces
DEBUG=crawlee:*,apify:* apify run

# Playwright debug
DEBUG=pw:api apify run
```

## TypeScript Build

### Build Before Run

```bash
# Compile TypeScript
npm run build

# Output: dist/main.js

# Then run
npm start
# Or
node dist/main.js
```

### Watch Mode (Development)

```bash
# Auto-rebuild on changes
npm run build -- --watch

# In another terminal
npm start
```

### Build Errors

```bash
# Check TypeScript errors
npm run build

# Fix errors, then retry
# Common issues:
# - Type mismatches
# - Missing imports
# - Syntax errors
```

## Deployment to Platform

### First Deployment

```bash
# Push to Apify platform
apify push

# Process:
# 1. Uploads source code
# 2. Builds Docker image
# 3. Creates new Actor version
# 4. Sets as latest
```

### With Build Tag

```bash
# Deploy to specific tag
apify push --build-tag beta

# Deploy to dev
apify push --build-tag dev

# Production release
apify push --build-tag latest
```

### With Version

```bash
# Set version number
apify push --version-number 1.2.3

# Updates .actor/actor.json version field
```

### Wait for Build

```bash
# Wait until build completes
apify push --wait-for-finish

# Useful in CI/CD pipelines
```

### Force Rebuild

```bash
# Force rebuild even if no changes
apify push --force

# Use when:
# - Dependencies updated
# - Dockerfile changed
# - Build cache issues
```

## Testing on Platform

### Run Actor

```bash
# Run latest version
apify call my-actor

# Run specific build
apify call my-actor --build=beta

# With input
apify call my-actor --input='{"maxItems":10}'

# With input file
apify call my-actor --input-file=./input.json
```

### Monitor Run

```bash
# Get run info
apify call my-actor --wait-for-finish

# Shows:
# - Run ID
# - Status
# - Duration
# - Results
```

## Version Management

### Semantic Versioning

```bash
# Major version (breaking changes)
apify push --version-number 2.0.0

# Minor version (new features)
apify push --version-number 1.1.0

# Patch version (bug fixes)
apify push --version-number 1.0.1
```

### Build Tags

```bash
# Development
apify push --build-tag dev

# Staging/testing
apify push --build-tag beta

# Production
apify push --build-tag latest
apify push --build-tag v1.0.0
```

### Tag Strategy

```
main branch    → --build-tag latest
develop branch → --build-tag dev
release/beta   → --build-tag beta
feature/*      → --build-tag feature-name
```

## Complete Workflow Patterns

### Pattern 1: Development Cycle

```bash
# 1. Make changes
vim src/main.ts

# 2. Build
npm run build

# 3. Test locally
apify run --purge

# 4. Fix issues, repeat 2-3

# 5. Lint code
npm run lint:fix

# 6. Deploy to dev
apify push --build-tag dev

# 7. Test on platform
apify call my-actor --build=dev

# 8. Deploy to production
apify push --build-tag latest --version-number 1.0.1
```

### Pattern 2: Quick Test

```bash
# Quick test without build
apify run --input='{"startUrls":[{"url":"https://example.com"}],"maxItems":5}'

# Check ./storage/datasets/default/
cat storage/datasets/default/*.json
```

### Pattern 3: CI/CD Deployment

```bash
#!/bin/bash
# deploy.sh

# Build TypeScript
npm run build

# Run tests
npm test

# Lint
npm run lint

# Push to platform
apify push --build-tag ${BUILD_TAG} --wait-for-finish

# Test deployment
apify call ${ACTOR_ID} --build=${BUILD_TAG} --wait-for-finish
```

### Pattern 4: Staged Release

```bash
# 1. Deploy to beta
apify push --build-tag beta --version-number 1.1.0

# 2. Test beta
apify call my-actor --build=beta

# 3. Monitor for issues
# ... wait 24 hours ...

# 4. Promote to production
apify push --build-tag latest --version-number 1.1.0
```

## Storage Inspection

### View Results

```bash
# Local datasets
ls storage/datasets/default/
cat storage/datasets/default/000000001.json

# Pretty print JSON
cat storage/datasets/default/*.json | jq '.'
```

### Key-Value Store

```bash
# View KV store
ls storage/key_value_stores/default/
cat storage/key_value_stores/default/INPUT.json
```

### Request Queue

```bash
# View queue
ls storage/request_queues/default/
```

## Troubleshooting Deployment

### Build Fails

```bash
# Check build log
apify push

# Common issues:
# - TypeScript errors → run npm run build locally
# - Missing dependencies → check package.json
# - Dockerfile errors → test docker build locally
```

### Actor Won't Start

```bash
# Check logs in Apify Console
# Or via CLI:
apify call my-actor --wait-for-finish

# Common issues:
# - Memory too low → increase in actor.json
# - Timeout → increase timeoutSecs
# - Missing environment variables
```

### Build Too Slow

```bash
# Use faster base image
# In Dockerfile:
FROM apify/actor-node-playwright-chrome:20-bookworm-slim

# Skip optional dependencies
RUN npm install --production --no-optional
```

### Deployment Fails

```bash
# Check auth
apify info

# Re-login if needed
apify logout
apify login

# Retry with force
apify push --force
```

## Platform Commands

### View Datasets

```bash
# List datasets
apify dataset ls

# Get dataset
apify dataset get <dataset-id>

# Download CSV
apify dataset get <dataset-id> --format csv > data.csv
```

### View Runs

```bash
# List recent runs
apify actor calls my-actor

# Get specific run
apify run get <run-id>

# Abort run
apify run abort <run-id>
```

### Manage Actor

```bash
# Get actor info
apify actor get my-actor

# Update actor
apify push

# Delete actor (careful!)
# Must be done via Console
```

## Best Practices

### ✅ DO:
- Test locally before pushing
- Use semantic versioning
- Tag dev/beta/latest appropriately
- Run `npm run build` before testing TypeScript
- Use `--purge` for clean tests
- Wait for build to complete in CI/CD
- Monitor first runs after deployment

### ❌ DON'T:
- Don't push untested code
- Don't skip version numbers
- Don't use `--force` unnecessarily
- Don't deploy directly to `latest` without testing
- Don't ignore build warnings
- Don't commit secrets to git

## Quick Reference

```bash
# Local development
apify run                        # Run locally
apify run --purge               # Clean run
apify run --input-file=input.json # Custom input
npm run build                    # Build TypeScript
npm start                        # Run built code

# Deployment
apify push                       # Deploy
apify push --build-tag beta     # Deploy to beta
apify push --version-number 1.0.0 # Set version
apify push --wait-for-finish    # Wait for build

# Testing
apify call my-actor             # Run on platform
apify call my-actor --build=beta # Run specific build

# Inspection
apify dataset ls                # List datasets
apify dataset get <id>          # Get dataset
```

## Resources

- [Deployment Docs](https://docs.apify.com/platform/actors/development/deployment)
- [Build Process](https://docs.apify.com/platform/actors/development/builds-and-runs/builds)
- [CLI Reference](https://docs.apify.com/cli/docs/reference)
