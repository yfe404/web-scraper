# Web Scraping Skill

Intelligent web scraping with automatic strategy selection and TypeScript-first Apify Actor development.

## Overview

This skill provides:
- **Interactive reconnaissance** - Hands-on site exploration using Playwright MCP & Chrome DevTools
- **Proactive strategy discovery** - Automatically checks for sitemaps and APIs
- **Intelligent recommendations** - Suggests optimal approach (sitemap/API/Playwright/hybrid)
- **Iterative implementation** - Starts simple, adds complexity only if needed
- **Production-ready guidance** - TypeScript-first Apify Actor development

## Installation

Add this skill to Claude Code by placing this directory in the skills folder.

## Quick Start

### Scenario 1: Scrape a Website

```
User: "Scrape https://example.com"

Claude will automatically:
1. Open site in browser (Playwright MCP) - observe loading behavior
2. Monitor network traffic (DevTools) - discover API endpoints
3. Test interactions - pagination, filters, dynamic content
4. Assess protections - Cloudflare, rate limits, fingerprinting
5. Check for sitemaps (/sitemap.xml, robots.txt)
6. Generate intelligence report with optimal strategy
7. Implement recommended approach iteratively
8. Test with small batch (5-10 items)
9. Scale to full dataset
```

### Scenario 2: Create Apify Actor

```
User: "Make this an Apify Actor"

Claude will:
1. Recommend TypeScript (strongly)
2. Guide through `apify create` command
3. Help choose appropriate template (Cheerio vs Playwright)
4. Port scraping logic to Actor format
5. Configure input schema
6. Test and deploy
```

## Directory Structure

```
web-scraping/
├── SKILL.md                    # Main entry point (proactive workflow)
├── workflows/                  # Implementation patterns
│   ├── reconnaissance.md       # Phase 1 interactive reconnaissance (CRITICAL)
│   ├── implementation.md       # Phase 4 iterative implementation
│   └── productionization.md    # Phase 5 Actor creation
├── strategies/                 # Deep-dive guides
│   ├── sitemap-discovery.md   # 60x faster URL discovery
│   ├── api-discovery.md       # 10-100x faster than scraping
│   ├── playwright-scraping.md # Browser-based scraping
│   ├── cheerio-scraping.md    # HTTP-only (5x faster)
│   └── hybrid-approaches.md   # Combining strategies
├── examples/                   # Runnable code
│   ├── sitemap-basic.js
│   ├── api-scraper.js
│   ├── hybrid-sitemap-api.js
│   ├── playwright-basic.js
│   └── iterative-fallback.js
├── reference/                  # Quick lookup
│   ├── regex-patterns.md
│   ├── selector-guide.md
│   └── anti-patterns.md
├── apify/                      # Production deployment
│   ├── typescript-first.md    # Why TypeScript
│   ├── cli-workflow.md        # apify create (CRITICAL)
│   ├── templates/             # TypeScript boilerplate
│   └── examples/              # Working actors
└── README.md                   # This file
```

## Best Practices Applied

This skill follows Anthropic's official best practices for skill development:

### 1. Progressive Disclosure Architecture ✓

**Pattern**: Three-level loading system to manage context efficiently
- **Level 1**: YAML frontmatter (~85 tokens) - Always loaded
- **Level 2**: Main SKILL.md (~356 lines) - Loaded when skill invoked
- **Level 3**: Subdirectories - Loaded on-demand as needed

**Result**: 70-80% token reduction vs monolithic documentation

**Source**: [skill-creator/SKILL.md](https://github.com/anthropics/skills/blob/main/skill-creator/SKILL.md#progressive-disclosure-design-principle)

### 2. Imperative/Infinitive Form Writing Style ✓

**Pattern**: Write instructions using verb-first commands, not second-person language

**Examples**:
- ✅ "Load this workflow when user requests"
- ✅ "Check for sitemaps automatically"
- ❌ "You should load this workflow"
- ❌ "You need to check for sitemaps"

**Exception**: Second-person is acceptable in user-facing prompts, code comments, and tutorial examples

**Source**: [skill-creator/SKILL.md](https://github.com/anthropics/skills/blob/main/skill-creator/SKILL.md#update-skillmd)

### 3. Clear YAML Frontmatter ✓

**Pattern**: Concise, specific name and description that determine when Claude invokes the skill

**Applied**:
- `name: web-scraping` - Clear, hyphen-case identifier
- `description:` - Specific about activation triggers and capabilities (189 chars, optimized from 244)

**Source**: [agent_skills_spec.md](https://github.com/anthropics/skills/blob/main/agent_skills_spec.md#yaml-frontmatter)

### 4. Lean SKILL.md with Reference Files ✓

**Pattern**: Keep only essential procedural instructions in SKILL.md; move detailed information to subdirectories

**Applied**:
- SKILL.md: Core 4-phase workflow (~356 lines)
- `workflows/`: Detailed implementation patterns
- `strategies/`: Deep-dive guides
- `examples/`: Runnable code
- `reference/`: Quick lookup patterns
- `apify/`: Production deployment guides

**Source**: [skill-creator/SKILL.md](https://github.com/anthropics/skills/blob/main/skill-creator/SKILL.md#references-references)

### 5. Scripts, References, and Assets Organization ✓

**Pattern**: Separate executable code, documentation, and output resources

**Applied**:
- `examples/` - Executable JavaScript learning examples (like scripts/)
- `workflows/`, `strategies/`, `reference/`, `apify/` - Documentation loaded as needed (like references/)
- `apify/templates/`, `apify/examples/` - Boilerplate code and templates (like assets/)

**Source**: [skill-creator/SKILL.md](https://github.com/anthropics/skills/blob/main/skill-creator/SKILL.md#bundled-resources-optional)

### 6. Purpose-Driven Skill Scope ✓

**Pattern**: Create focused skills for specific purposes rather than one skill that does everything

**Applied**: This skill focuses specifically on web scraping and Apify Actor development, not general web development

**Source**: [Anthropic Skills Best Practices](https://www.anthropic.com/news/skills)

### 7. Objective, Instructional Language ✓

**Pattern**: Use clear, technical language focused on "what" and "how" rather than persuasive or promotional tone

**Applied**: Direct technical guidance throughout ("Check for sitemaps", "Implement iteratively") vs. marketing language

**Source**: [skill-creator/SKILL.md](https://github.com/anthropics/skills/blob/main/skill-creator/SKILL.md#update-skillmd)

## Key Features

### 1. Interactive Reconnaissance (Phase 1)

Before any implementation:
- **Playwright MCP**: Open site in real browser, observe loading behavior, test interactions
- **Chrome DevTools MCP**: Monitor network traffic, discover hidden APIs, analyze request patterns
- **Protection Analysis**: Detect Cloudflare, CAPTCHA, rate limiting, fingerprinting
- **Intelligence Report**: Generate structured findings with optimal strategy recommendation

**Why this matters**: Discovers hidden APIs (10-100x faster than HTML scraping), identifies blockers before coding, provides intelligence for informed strategy selection.

### 2. Proactive Discovery (Phase 2)

Automatically validates reconnaissance findings:
- Sitemaps (`/sitemap.xml`, `robots.txt`)
- API endpoints (confirmed from DevTools analysis)
- Site structure (JavaScript-heavy? Authentication?)

### 3. Strategic Recommendations (Phase 3)

Presents 2-3 options with:
- Time estimates
- Complexity rating
- Pros/cons
- Clear reasoning

### 4. Iterative Implementation (Phase 4)

- Start with simplest approach
- Test small batch (5-10 items)
- Scale or fallback based on results
- Add robustness last

### 5. TypeScript-First Apify (Phase 5)

For production actors:
- **Strongly recommend** TypeScript
- **Always use** `apify create` command
- **Choose template** based on site type (Cheerio for static, Playwright for JS-heavy)
- Type-safe input/output

## Example Workflows

### Workflow 1: Unknown Site

```
1. User: "Scrape example.com"
2. Claude opens site with Playwright MCP (Phase 1 reconnaissance)
3. Claude monitors DevTools, finds API endpoint GET /api/products
4. Claude tests pagination, detects Cloudflare protection
5. Claude checks sitemap (validates Phase 1 findings - 1,234 URLs)
6. Claude generates intelligence report
7. Claude recommends: Hybrid (Sitemap + API + Proxies)
8. Implements with discovered API endpoints
9. Tests with 10 items
10. Scales to full dataset
11. Result: 1000 products in 5 minutes, no blocks
```

### Workflow 2: Make it an Actor

```
1. User: "Make this an Apify Actor"
2. Claude loads apify/ module
3. Recommends TypeScript? (Yes)
4. Guides through: apify create
5. Analyzes site: Static HTML → Selects Cheerio template
6. Ports scraping logic to TypeScript
7. Adds input schema
8. Tests: apify run
9. Deploys: apify push
10. Result: Production-ready actor
```

## Performance Benefits

| Approach | Time (1000 pages) | vs Crawling |
|----------|-------------------|-------------|
| Sitemap + API | 5 minutes | 60x faster |
| Sitemap + Playwright | 20 minutes | 15x faster |
| API only | 8 minutes | 40x faster |
| Playwright crawl | 45 minutes | Baseline |

## Best Practices Summary

### Reconnaissance Phase (Phase 1)
✅ Always start with Playwright MCP + DevTools exploration
✅ Discover APIs before attempting HTML scraping
✅ Test site interactions to understand behavior
✅ Assess protections early (Cloudflare, CAPTCHA, rate limits)
✅ Generate intelligence report with findings

### Discovery Phase (Phase 2)
✅ Validate reconnaissance with automated sitemap checks
✅ Confirm API endpoints discovered in Phase 1
✅ Analyze site structure based on observations

### Implementation Phase (Phase 4)
✅ Start simple (sitemap → API → Playwright)
✅ Test small batch first
✅ Handle errors gracefully
✅ Respect rate limits

### Production Phase (Phase 5)
✅ Use TypeScript for Apify Actors
✅ Always use `apify create` command
✅ Choose template based on Phase 1 findings (Cheerio vs Playwright)
✅ Test locally with `apify run`
✅ Deploy with `apify push`

## Troubleshooting

### "No URLs found in sitemap"
→ See `strategies/sitemap-discovery.md` troubleshooting section

### "API requires authentication"
→ See `strategies/api-discovery.md` authentication section

### "Playwright too slow"
→ See `strategies/playwright-scraping.md` performance optimization

### "Actor deployment fails"
→ See `apify/cli-workflow.md` common issues section

## Resources

- **Main skill**: Read `SKILL.md` for complete workflow
- **Workflows**: Implementation patterns in `workflows/`
- **Strategies**: Browse `strategies/` for detailed guides
- **Examples**: Run code in `examples/` directory
- **Reference**: Quick lookups in `reference/`
- **Apify**: Production deployment in `apify/`

## Philosophy

**Intelligence first, implementation second!**

This skill prioritizes:
1. **Reconnaissance** - Understand before coding (APIs > Sitemaps > Scraping)
2. **Speed** - Fastest approach that works (API 10-100x faster than HTML)
3. **Reliability** - Structured data > HTML parsing
4. **Maintainability** - TypeScript, proper tooling
5. **Best practices** - Industry standards

## Version

**4.0.0** - Intelligence-driven scraping:
- **NEW**: Interactive reconnaissance phase (Playwright MCP + Chrome DevTools)
- **NEW**: API discovery before HTML scraping
- **NEW**: Protection analysis and countermeasures
- Progressive disclosure architecture
- Proactive strategy discovery
- TypeScript-first Apify guidance
- Comprehensive examples
- Modular organization

## References

All best practices sourced from official Anthropic documentation:
- [Anthropic Skills Repository](https://github.com/anthropics/skills)
- [Agent Skills Specification](https://github.com/anthropics/skills/blob/main/agent_skills_spec.md)
- [skill-creator/SKILL.md](https://github.com/anthropics/skills/blob/main/skill-creator/SKILL.md)
- [Anthropic Skills Announcement](https://www.anthropic.com/news/skills)

---

**Start here**: Read `SKILL.md` for the complete proactive workflow.
