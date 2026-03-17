# Session Workflows

Record, replay, and analyze browsing sessions with proxy-mcp's session management.

## Overview

Session management is a unique capability of proxy-mcp with no equivalent in traditional browser automation. Sessions capture all HTTP traffic as NDJSON on disk, enabling:

- **Recording** reconnaissance for later review
- **Replaying** recorded sessions to verify behavior
- **Exporting** sessions as HAR files for analysis
- **Querying** session data for specific patterns
- **Recovering** interrupted sessions

## Session Recording

### Start Recording

```
proxy_session_start("recon-shopcom")
```

Parameters:
- `name`: Human-readable session name
- `capture_profile`: Optional — `"preview"` (4KB body previews, default) or `"full"` (complete bodies)

### Perform Actions

While recording, all HTTP traffic is captured:

```
interceptor_chrome_devtools_navigate("https://shop.com/products")
humanizer_scroll(target_id, "down", 1000)
humanizer_click(target_id, ".category-link")
humanizer_idle(target_id, 2000)
```

### Stop Recording

```
proxy_session_stop(session_id)
```

### Check Session Status

```
proxy_session_status(session_id)
```

## HAR Export and Import

### Export Session as HAR

```
proxy_export_har(session_id, "recon-shopcom.har")
```

HAR (HTTP Archive) is a standard format understood by:
- Chrome DevTools (import in Network tab)
- Postman
- Charles Proxy
- Most network analysis tools

### Import HAR for Analysis

```
proxy_import_har("captured-traffic.har")
```

Use imported HAR data for:
- Analyzing traffic captured by other tools
- Replaying previously recorded sessions
- Sharing reconnaissance data between team members

## Session Replay

### Dry Run (Preview)

```
proxy_replay_session(session_id, mode: "dry_run")
```

Shows what requests would be made without executing them. Use this to:
- Verify the session captured the right traffic
- Understand the request sequence before replaying
- Identify requests that may need modification

### Execute Replay

```
proxy_replay_session(session_id, mode: "execute")
```

Re-sends all captured requests. Useful for:
- Verifying API responses haven't changed
- Re-collecting data from known-good endpoints
- Testing if anti-bot measures have changed

## Token and Cookie Persistence

### Extract Authentication Data

After navigating through a login flow:

```
interceptor_chrome_devtools_list_cookies()
interceptor_chrome_devtools_list_storage_keys(storage_type: "local")
interceptor_chrome_devtools_get_storage_value("auth_token", storage_type: "local")
```

### Persist Across Sessions

Record the authentication flow:

```
proxy_session_start("auth-flow")
# ... perform login ...
proxy_session_stop(session_id)
```

Later, replay the auth flow to get fresh tokens:

```
proxy_replay_session(session_id, mode: "execute")
```

## Query and Filter

### Search Within a Session

```
proxy_query_session(session_id, query: "products")
```

Find specific requests within a recorded session by URL, header, or body content.

### List All Sessions

```
proxy_list_sessions()
```

### Get Session Details

```
proxy_get_session(session_id)
```

### Recover Interrupted Session

If a session was interrupted (crash, disconnect):

```
proxy_session_recover(session_id)
```

Recovers NDJSON data from the on-disk recording.

### Delete Session

```
proxy_delete_session(session_id)
```

## Practical Workflows

### Workflow 1: Record Reconnaissance for Replay

```
# Start recording
proxy_session_start("recon-example-com")

# Perform reconnaissance
proxy_start()
interceptor_chrome_launch("https://example.com", stealthMode: true)
interceptor_chrome_devtools_attach(target_id)

# Browse and discover APIs
humanizer_click(target_id, ".products-link")
humanizer_idle(target_id, 2000)
proxy_list_traffic(url_filter: "api")

# Stop recording
proxy_session_stop(session_id)

# Export for team review
proxy_export_har(session_id, "recon-example-com.har")
```

### Workflow 2: Capture Authentication Flow

```
# Start recording
proxy_session_start("auth-example-com")

# Navigate to login
interceptor_chrome_devtools_navigate("https://example.com/login")

# Fill credentials
humanizer_click(target_id, "input[name='email']")
humanizer_type(target_id, "user@example.com")
humanizer_click(target_id, "input[name='password']")
humanizer_type(target_id, "password123")
humanizer_click(target_id, "button[type='submit']")
humanizer_idle(target_id, 3000)

# Extract tokens
interceptor_chrome_devtools_list_cookies()
interceptor_chrome_devtools_get_storage_value("auth_token", "local")

# Stop recording
proxy_session_stop(session_id)
```

### Workflow 3: Import HAR for Analysis

```
# Import HAR captured by another tool
proxy_import_har("external-capture.har")

# Query for API endpoints
proxy_query_session(session_id, query: "api")

# Analyze specific exchanges
proxy_get_exchange(exchange_id)
```

### Workflow 4: Compare Before/After

```
# Record baseline
proxy_session_start("baseline")
# ... browse site ...
proxy_session_stop(session_id_baseline)

# Make changes (deploy new version, etc.)

# Record new state
proxy_session_start("after-change")
# ... browse same pages ...
proxy_session_stop(session_id_after)

# Query both sessions to compare
proxy_query_session(session_id_baseline, query: "products")
proxy_query_session(session_id_after, query: "products")
```

## Best Practices

### DO:
- **Name sessions descriptively** — include site name and purpose
- **Use `capture_profile: "full"`** when you need complete response bodies
- **Export HAR files** for archival and sharing
- **Use dry_run** before executing a replay
- **Record auth flows** for easy token refresh

### DON'T:
- **Record unnecessarily long sessions** — they consume disk space
- **Replay without reviewing** — APIs may have changed
- **Store sessions with sensitive credentials** indefinitely — delete when done
- **Forget to stop recording** — use `proxy_session_status()` to check

## Related

- **Traffic interception**: See `traffic-interception.md`
- **Tool reference**: See `../reference/proxy-tool-reference.md`
- **Reconnaissance workflow**: See `../workflows/reconnaissance.md`
