# Web Scraping Skill

Intelligent web scraping with automatic strategy selection and TypeScript-first Apify Actor development.

## Overview

This skill provides:
- **Adaptive reconnaissance** - Phases 0-5 with quality gates that skip unnecessary work (curl first, browser only if needed)
- **Framework-aware detection** - Identifies site framework before searching, skips irrelevant patterns
- **Validated findings** - Every claimed selector/path/API is tested before reporting
- **Self-critiquing reports** - Intelligence reports include gap analysis and staleness warnings
- **Iterative implementation** - Starts simple, adds complexity only if needed
- **Production-ready guidance** - TypeScript-first Apify Actor development

## Installation

Add this skill to Claude Code by placing this directory in the skills folder.

## Quick Start

### Scenario 1: Scrape a Website

```
User: "Scrape https://example.com"

Claude will automatically:
1. Phase 0: curl raw HTML — detect framework, search for data points, check sitemaps
2. QUALITY GATE: All data in HTML? → Skip browser, go to validation
3. Phase 1: Launch stealth browser (only if needed) — capture traffic, rendered DOM
4. Phase 2: Deep scan (only for missing data) — test interactions, sniff APIs
5. Phase 3: Validate every finding — test selectors, replay APIs, confirm paths
6. Phase 4: Protection testing (only if signals detected or user requested)
7. Phase 5: Generate intelligence report with self-critique
8. Implement recommended approach iteratively
9. Test with small batch, then scale
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
│   ├── framework-signatures.md # Framework detection lookup tables
│   ├── cheerio-vs-browser-test.md # Cheerio vs Browser decision + early exit
│   ├── proxy-escalation.md    # Protection testing skip/run conditions
│   ├── traffic-interception.md # MITM proxy traffic capture
│   ├── sitemap-discovery.md   # 60x faster URL discovery
│   ├── api-discovery.md       # 10-100x faster than scraping
│   ├── dom-scraping.md        # DevTools bridge + humanizer
│   ├── cheerio-scraping.md    # HTTP-only (5x faster)
│   ├── hybrid-approaches.md   # Combining strategies
│   ├── anti-blocking.md       # Multi-layer anti-detection
│   └── session-workflows.md   # Session recording, HAR, replay
├── examples/                   # Runnable code
│   ├── traffic-interception-basic.js
│   ├── sitemap-basic.js
│   ├── api-scraper.js
│   ├── hybrid-sitemap-api.js
│   └── iterative-fallback.js
├── reference/                  # Quick lookup
│   ├── report-schema.md       # Intelligence report format (Sections 1-7)
│   ├── proxy-tool-reference.md # Proxy-MCP tools (80+)
│   ├── regex-patterns.md
│   ├── fingerprint-patterns.md
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

### 1. Adaptive Reconnaissance (Phases 0-5)

Quality-gated workflow that skips unnecessary phases:
- **Phase 0**: curl-based assessment — detect framework, search for data, check protections
- **Phase 1**: Browser only if needed — stealth Chrome, traffic capture, rendered DOM
- **Phase 2**: Deep scan only for missing data — targeted interactions, framework-aware API sniffing
- **Phase 3**: Validate every finding — test selectors, replay APIs, confirm JSON paths
- **Phase 4**: Protection testing only if signals warrant — conditional escalation
- **Phase 5**: Self-critiquing report — gaps, assumptions, staleness warnings

### 2. Framework-Aware Detection

Uses `strategies/framework-signatures.md` lookup tables:
- Response headers → framework identification
- HTML signatures → data location mapping
- Known major sites → direct strategy (e.g., Amazon: custom SSR, no JSON-LD)
- Detect first, then search only relevant patterns

### 3. Validated Intelligence Reports

Reports follow `reference/report-schema.md` with:
- `Validated?` column for every extraction strategy (YES / PARTIAL / NO)
- Self-Critique section: gaps, skipped steps, assumptions, staleness risk
- Targeted re-investigation for fixable gaps

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
2. Phase 0: curl raw HTML → detect Next.js (__NEXT_DATA__), find product data in JSON
3. GATE A: All data in __NEXT_DATA__? → YES → Skip browser
4. Phase 3: Validate JSON paths resolve to expected values
5. Phase 5: Generate report with self-critique
6. Result: No browser needed, Cheerio + JSON parsing sufficient
```

### Workflow 1b: Site Needing Browser

```
1. User: "Scrape protected-shop.com"
2. Phase 0: curl returns 403 → protection detected, no data in HTML
3. GATE A: NO → Continue to Phase 1
4. Phase 1: Stealth browser loads page, traffic reveals API endpoint
5. GATE B: All data covered via API → Skip Phase 2
6. Phase 3: Replay API request, validate response structure
7. Phase 4: Protection testing (403 was detected) → stealth browser + proxy needed
8. Phase 5: Report + self-critique
9. Implements with discovered API + upstream proxies
10. Tests with 10 items, scales to full dataset
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

### Reconnaissance (Phases 0-5)
- Start with curl (Phase 0) before launching browser
- Detect framework first, then search relevant patterns only
- Quality gates skip phases when data is sufficient
- Validate every selector/path/API before reporting
- Self-critique: check for gaps, assumptions, staleness
- Protection testing only when signals warrant it

### Implementation Phase (Phase 4)
- Start simple (traffic interception → sitemap → API → DOM scraping)
- Test small batch first
- Handle errors gracefully
- Respect rate limits

### Production Phase (Phase 5)
- Use TypeScript for Apify Actors
- Always use `apify create` command
- Choose template based on Phase 1 findings (Cheerio vs Playwright)
- Test locally with `apify run`
- Deploy with `apify push`

## Troubleshooting

### "No URLs found in sitemap"
→ See `strategies/sitemap-discovery.md` troubleshooting section

### "API requires authentication"
→ See `strategies/api-discovery.md` authentication section

### "DOM scraping too slow"
→ See `strategies/dom-scraping.md` and consider API discovered via traffic capture

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

**5.0.0** - Traffic-interception-first scraping:
- **NEW**: Proxy-MCP integration (MITM traffic interception + stealth browser + humanizer)
- **NEW**: Automatic API discovery via traffic capture
- **NEW**: Multi-layer anti-detection (stealth mode, humanizer, upstream proxies, TLS spoofing)
- **NEW**: Session recording and HAR export/replay
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
