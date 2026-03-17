# Proxy-MCP Tool Reference

Quick reference card for all proxy-mcp tools organized by functional layer.

**Source**: `/home/yms/Documents/proxy-mcp/`

---

## Initialization Sequence

Every proxy-mcp session follows this startup sequence:

```
1. proxy_start()                                          → Start MITM proxy
2. interceptor_chrome_launch(url, stealthMode: true)      → Launch Chrome through proxy with anti-detection
3. interceptor_chrome_devtools_attach(target_id)           → Attach DevTools bridge to browser tab
```

After initialization, all HTTP/HTTPS traffic flows through the proxy and is automatically captured. The DevTools bridge provides DOM access and the humanizer provides anti-detection interactions.

---

## Traffic Analysis

The MITM proxy automatically captures all traffic. These tools query the captured data.

| Tool | Purpose | Key Parameters |
|------|---------|----------------|
| `proxy_list_traffic(url_filter, method_filter)` | List captured HTTP exchanges | `url_filter`: substring match on URL; `method_filter`: GET/POST/etc. |
| `proxy_search_traffic(query)` | Full-text search across traffic | Searches URLs, headers, and body previews |
| `proxy_get_exchange(exchange_id)` | Get full request/response details | Returns headers, body, timing for a specific exchange |
| `proxy_clear_traffic()` | Clear captured traffic buffer | Use before navigating to isolate traffic from a specific action |

### Traffic Analysis Workflow

```
1. proxy_clear_traffic()                    → Clear buffer
2. humanizer_click(target_id, selector)     → Trigger an action
3. humanizer_idle(target_id, 2000)          → Wait for network
4. proxy_list_traffic(url_filter: "api")    → See what API calls the action triggered
5. proxy_get_exchange(exchange_id)          → Inspect full request/response
```

### API Discovery Filters

```
proxy_list_traffic(url_filter: "/api/")           → REST APIs
proxy_list_traffic(url_filter: "/graphql")         → GraphQL endpoints
proxy_list_traffic(url_filter: "/_next/data/")     → Next.js data endpoints
proxy_list_traffic(url_filter: "/wp-json/")        → WordPress REST API
proxy_search_traffic(query: "application/json")    → Any JSON responses
```

---

## Browser Control (DevTools Bridge)

After attaching with `interceptor_chrome_devtools_attach(target_id)`, these tools provide DOM-level access.

| Tool | Purpose | Key Parameters |
|------|---------|----------------|
| `interceptor_chrome_devtools_navigate(url)` | Navigate to URL | Use this (not `interceptor_chrome_navigate`) to preserve DevTools session |
| `interceptor_chrome_devtools_screenshot()` | Capture screenshot | Returns base64 image |
| `interceptor_chrome_devtools_snapshot()` | Get accessibility tree | Stable alternative to CSS selectors |
| `interceptor_chrome_devtools_list_network(resource_types)` | Browser-side network view | `resource_types`: e.g. `["xhr", "fetch"]` |
| `interceptor_chrome_devtools_list_console()` | Get console messages | Includes errors, warnings, logs |
| `interceptor_chrome_devtools_list_cookies(domain_filter)` | Get cookies | Filter by domain |
| `interceptor_chrome_devtools_list_storage_keys(storage_type)` | List storage keys | `storage_type`: "local" or "session" |
| `interceptor_chrome_devtools_get_storage_value(key, storage_type)` | Get storage value | Read localStorage/sessionStorage |
| `interceptor_chrome_devtools_get_network_field(request_id, field)` | Get specific network field | Inspect individual requests |

### Important

- **Always use `interceptor_chrome_devtools_navigate()`** for navigation, not `interceptor_chrome_navigate()`. The latter loses the DevTools session.
- **`interceptor_chrome_devtools_snapshot()`** returns an accessibility tree, which is more stable than CSS selectors for data extraction.

---

## Human Interaction (Humanizer)

Anti-detection interaction tools that mimic real human behavior. Use these instead of direct DOM manipulation.

| Tool | Purpose | Internal Behavior |
|------|---------|-------------------|
| `humanizer_click(target_id, selector)` | Click element | Bezier curve mouse movement with Fitts's law timing; random variance |
| `humanizer_type(target_id, text)` | Type text | WPM-based delays (default 40 WPM); bigram frequency modifier; shift penalty +50ms; optional typo injection with QWERTY neighbor mapping |
| `humanizer_scroll(target_id, direction, amount)` | Scroll page | easeInOutQuad acceleration/deceleration curve |
| `humanizer_move(target_id, x, y)` | Move mouse | Cubic Bezier curves with randomized control points; overshoot+correction for distances >200px |
| `humanizer_idle(target_id, duration_ms)` | Idle with micro-movements | Micro-jitter ±3-8px; occasional micro-scrolls to defeat idle detection |

### Interaction Patterns

**Click an element**:
```
humanizer_click(target_id, "button.submit")
```

**Fill a form field**:
```
humanizer_click(target_id, "input[name='search']")   → Focus the field
humanizer_type(target_id, "search query")              → Type with human timing
```

**Scroll and observe traffic**:
```
proxy_clear_traffic()
humanizer_scroll(target_id, "down", 500)
humanizer_idle(target_id, 2000)
proxy_list_traffic(url_filter: "page=")               → See pagination API calls
```

---

## Anti-Detection

### Layer 1: Stealth Mode (Browser Sessions)

**Tool**: `interceptor_chrome_launch(url, stealthMode: true)`

Automatically applied when `stealthMode: true`. Patches:
- `navigator.webdriver` → `false` (with `configurable:true` to match real Chrome)
- `chrome.runtime` → exists with expected shape (Akamai primary check)
- `Permissions.query` → correct response for notifications (CDP artifact fix)
- `Error.stack` → cleaned of CDP-injected traces (`InjectedScript`, `evaluate`)
- Curated Chrome flags: deliberately omits `--disable-extensions` (removes `chrome.runtime`), `--mute-audio` (detectable via AudioContext)

Injected via `Page.addScriptToEvaluateOnNewDocument` — runs before any page script, on every frame.

**When to use**: Always for protected sites. This is the default recommendation.

### Layer 2: TLS Fingerprint Spoofing (HTTP-Only Clients)

**Tool**: `proxy_set_fingerprint_spoof(preset)`

Uses **impit** (Rust NAPI module) for native TLS impersonation. Spoofs JA3 fingerprint + HTTP/2 frame ordering. Auto-normalizes User-Agent + UA Client Hints headers.

**Available presets**: `chrome_131`, `chrome_136`, `chrome_136_linux`, `firefox_133`, `okhttp3`, `okhttp4`, `okhttp5`

**When to use**: ONLY when switching from browser to HTTP-only tools (curl, gotScraping, fetch) AND the target blocks based on TLS fingerprint.

**Do NOT use for Chrome browser sessions** — Chrome already has a legitimate TLS fingerprint.

### Layer 3: Upstream Proxies

| Tool | Purpose |
|------|---------|
| `proxy_set_upstream(url)` | Chain to upstream proxy (e.g., Apify residential proxies) |
| `proxy_set_host_upstream(hostname, url)` | Set per-host upstream proxy |
| `proxy_remove_host_upstream(hostname)` | Remove per-host upstream |
| `proxy_clear_upstream()` | Remove all upstream proxies |

### Layer 4: Request Manipulation

| Tool | Purpose |
|------|---------|
| `proxy_add_rule(matcher, handler)` | Add interception rule (passthrough/mock/forward/drop) |
| `proxy_inject_headers(headers)` | Inject custom headers into all requests |
| `proxy_rewrite_url(pattern, replacement)` | Rewrite URLs matching pattern |
| `proxy_mock_response(matcher, response)` | Return mock response for matching requests |
| `proxy_list_rules()` | List active rules |
| `proxy_enable_rule(id)` / `proxy_disable_rule(id)` | Toggle rules |
| `proxy_remove_rule(id)` | Delete a rule |
| `proxy_test_rule_match(url)` | Test if URL matches any rule |

### TLS Analysis

| Tool | Purpose |
|------|---------|
| `proxy_get_tls_config()` | Get current TLS configuration |
| `proxy_get_tls_fingerprints()` | Get captured TLS fingerprints |
| `proxy_list_tls_fingerprints()` | List all observed fingerprints |
| `proxy_list_fingerprint_presets()` | List available spoofing presets |
| `proxy_check_fingerprint_runtime()` | Check if fingerprint runtime is available |

---

## Session Management

Record, replay, and analyze browsing sessions.

| Tool | Purpose |
|------|---------|
| `proxy_session_start(name, capture_profile)` | Start recording session |
| `proxy_session_stop(session_id)` | Stop recording |
| `proxy_session_status(session_id)` | Check session status |
| `proxy_list_sessions()` | List all sessions |
| `proxy_get_session(session_id)` | Get session details |
| `proxy_query_session(session_id, query)` | Search within a session |
| `proxy_session_recover(session_id)` | Recover interrupted session |
| `proxy_export_har(session_id, path)` | Export session as HAR file |
| `proxy_import_har(path)` | Import HAR file |
| `proxy_replay_session(session_id, mode)` | Replay session (`dry_run` or `execute`) |
| `proxy_delete_session(session_id)` | Delete session |

### Session Workflow

```
1. proxy_session_start("recon-shopcom")      → Start recording
2. ... perform reconnaissance ...
3. proxy_session_stop(session_id)            → Stop recording
4. proxy_export_har(session_id, "recon.har") → Export for analysis
5. proxy_replay_session(session_id, "dry_run") → Review what would happen
```

---

## Chrome Lifecycle

| Tool | Purpose |
|------|---------|
| `interceptor_chrome_launch(url, stealthMode)` | Launch Chrome through proxy |
| `interceptor_chrome_navigate(url)` | Navigate (loses DevTools — prefer devtools_navigate) |
| `interceptor_chrome_close()` | Close Chrome |
| `interceptor_chrome_cdp_info()` | Get CDP connection info |

---

## Proxy Lifecycle

| Tool | Purpose |
|------|---------|
| `proxy_start()` | Start the MITM proxy |
| `proxy_stop()` | Stop the proxy |
| `proxy_status()` | Check proxy status |
| `proxy_get_ca_cert()` | Get CA certificate for manual trust |

---

## Related

- **Traffic interception strategy**: See `../strategies/traffic-interception.md`
- **Anti-blocking layers**: See `../strategies/anti-blocking.md`
- **Session workflows**: See `../strategies/session-workflows.md`
- **DOM scraping via DevTools**: See `../strategies/dom-scraping.md`
