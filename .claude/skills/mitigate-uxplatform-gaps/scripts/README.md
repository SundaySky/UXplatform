# capture.mjs

Headless Chromium capture for the gap-mitigation skill. Writes a full-page PNG, the outerHTML of the target region, and a meta JSON to an output directory.

The user's local real app on `http://localhost:8080` is rigged to require **no authentication**, and the prototype on `http://localhost:5173` never needed any. So Playwright loads any URL directly — no cookies, no `storageState`, no login flow to worry about.

## One-time install

```bash
cd <prototype>/.claude/skills/mitigate-uxplatform-gaps/scripts
npm install
npx playwright install chromium
```

After install, `node_modules/playwright` and the Chromium binary are cached per-user; subsequent runs are fast.

## CLI

```bash
node capture.mjs \
  --url <url> \
  --name <prototype|real-app> \
  --out-dir <absolute-dir> \
  [--selector "<css>"] \
  [--viewport 1440x900] \
  [--wait-for "<css>"] \
  [--wait-ms <ms>] \
  [--click-sequence '<json>']
```

### Arguments

- `--url` — page to load. Use `http://localhost:8080` for the real app (it will redirect to `/account/:accountId/videos`; read `finalUrl` from the meta to extract the accountId).
- `--name` — file prefix. Use `prototype` or `real-app`.
- `--out-dir` — absolute directory; created if missing.
- `--selector` — optional CSS selector to capture `outerHTML` from. If omitted, captures `document.documentElement.outerHTML`.
- `--viewport` — `WIDTHxHEIGHT`, default `1440x900`.
- `--wait-for` — CSS selector that must be attached before capture. Use to wait for the main content to mount.
- `--wait-ms` — additional idle wait after load (default `800`).
- `--click-sequence` — JSON array of `{ "selector": "...", "waitAfterMs": 500 }` objects. Clicks each in order before capture. Useful for opening dialogs/menus (e.g. the Account Settings dialog).
- `--measure` — JSON array of `{ "name": "...", "selector": "...", "index": 0 }` objects. For each target, the script calls `getBoundingClientRect()` and `getComputedStyle()` on the matched element and records `{ rect: {x,y,w,h}, computed: {...}, tagName, className, matchCount }` into `meta.json` under `measurements`. The optional `index` picks the nth match (default 0). Use this for every comparison that hinges on dimensions (search height, icon size, title offset, input padding) — screenshots alone don't give reliable pixel numbers at small deltas.

### Example — prototype video library

```bash
node capture.mjs \
  --url http://localhost:5173/ \
  --name prototype \
  --out-dir <prototype>/.claude/uxplatform-gaps/videos-library/iteration-1 \
  --wait-for "main" \
  --wait-ms 1000
```

### Example — real app, extract account id

```bash
node capture.mjs \
  --url http://localhost:8080 \
  --name real-app-bootstrap \
  --out-dir /tmp/uxplat-bootstrap \
  --wait-ms 1500
# then read /tmp/uxplat-bootstrap/real-app-bootstrap.meta.json -> .finalUrl
# e.g. http://localhost:8080/account/0015a00002vOnhoAAC/videos
```

### Example — open the Account Settings dialog before capture

```bash
node capture.mjs \
  --url "http://localhost:8080/accounts/$ACCOUNT_ID/videos" \
  --name real-app \
  --out-dir .../iteration-1 \
  --click-sequence '[
    {"selector": "[data-testid=\"testid-user-avatar\"]", "waitAfterMs": 300},
    {"selector": "[data-testid=\"testid-account-settings-menu-item\"]", "waitAfterMs": 500}
  ]' \
  --selector "[role=\"dialog\"]"
```

(Verify the actual `data-testid` values against the live app — the selectors above are placeholders.)

## Output files

For each run, three files land in `--out-dir`:

- `<name>.png` — full-page screenshot
- `<name>.html` — outerHTML of `--selector` (or full document)
- `<name>.meta.json` — `{ requestedUrl, finalUrl, viewport, timestamp, selector, clickSequence, consoleErrorsCount, ok, error? }`

Non-zero exit code means capture failed — inspect the `error` field in `meta.json`.
