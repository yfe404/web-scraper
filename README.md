# Web Scraping Skill

Intelligent web scraping with automatic strategy selection and TypeScript-first Apify Actor development.

## Overview

This skill provides:
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
1. Check for sitemaps (/sitemap.xml, robots.txt)
2. Look for APIs (prompts to check DevTools)
3. Recommend optimal approach
4. Implement iteratively (test small batch first)
5. Scale to full dataset
```

### Scenario 2: Create Apify Actor

```
User: "Make this an Apify Actor"

Claude will:
1. Recommend TypeScript (strongly)
2. Guide through `apify create` command
3. Help choose `playwright-ts` template
4. Port scraping logic to Actor format
5. Configure input schema
6. Test and deploy
```

## Directory Structure

```
web-scraping/
├── SKILL.md                    # Main entry point (proactive workflow)
├── workflows/                  # Implementation patterns
│   ├── implementation.md       # Phase 3 iterative implementation
│   └── productionization.md    # Phase 4 Actor creation
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

### 1. Proactive Discovery

Automatically checks for:
- Sitemaps (`/sitemap.xml`, `robots.txt`)
- APIs (DevTools Network tab analysis)
- Site structure (JavaScript-heavy? Authentication?)

### 2. Strategic Recommendations

Presents 2-3 options with:
- Time estimates
- Complexity rating
- Pros/cons
- Clear reasoning

### 3. Iterative Implementation

- Start with simplest approach
- Test small batch (5-10 items)
- Scale or fallback based on results
- Add robustness last

### 4. TypeScript-First Apify

For production actors:
- **Strongly recommend** TypeScript
- **Always use** `apify create` command
- **Prefer** `playwright-ts` template
- Type-safe input/output

## Example Workflows

### Workflow 1: Unknown Site

```
1. User: "Scrape example.com"
2. Claude checks sitemap (found!)
3. Claude asks to check API (found!)
4. Claude recommends: Sitemap + API (fastest)
5. Implements hybrid approach
6. Tests with 10 items
7. Scales to full dataset
8. Result: 1000 products in 5 minutes
```

### Workflow 2: Make it an Actor

```
1. User: "Make this an Apify Actor"
2. Claude loads apify/ module
3. Recommends TypeScript? (Yes)
4. Guides through: apify create
5. Selects: playwright-ts template
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

### Discovery Phase
✅ Always check for sitemaps first
✅ Always look for APIs
✅ Analyze site structure

### Implementation Phase
✅ Start simple (sitemap → API → Playwright)
✅ Test small batch first
✅ Handle errors gracefully
✅ Respect rate limits

### Production Phase
✅ Use TypeScript for Apify Actors
✅ Always use `apify create` command
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

**Sitemaps first, APIs second, scraping last!**

This skill prioritizes:
1. **Speed** - Fastest approach that works
2. **Reliability** - Structured data > HTML parsing
3. **Maintainability** - TypeScript, proper tooling
4. **Best practices** - Industry standards

## Version

**3.0.0** - Complete rewrite with:
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
