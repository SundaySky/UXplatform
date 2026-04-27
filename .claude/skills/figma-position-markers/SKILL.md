---
name: figma-position-markers
description: Adds or updates "Position Marker" label chips on Figma frames whose names start with hierarchical numbers like 1.1 or 2.3.4 (e.g., "1.1.2 - submit for approval - video page"). Use this skill whenever a user provides a Figma URL and asks to annotate, number, label, mark, badge, or add visual indicators to numbered frames — even if they don't say "position marker" specifically. Also triggers when a user wants to sync, refresh, or update existing markers after renaming frames in a Figma flow diagram or design doc. Works on one Figma page at a time and requires the Figma Dev Mode MCP server (`Figma:use_figma`).
---

# Figma Position Markers

Annotates numbered frames in a Figma page with prominent "Position Marker" chips. Each chip's text mirrors the leading number in its parent frame's name, so re-running the skill after frame renames keeps everything in sync.

## Requirements

- The Figma Dev Mode MCP server must be available — specifically the `Figma:use_figma` tool.
- The user must supply a Figma URL containing a `node-id` query parameter. If they don't, ask for one before doing anything else.
- Figma Make URLs (`figma.com/make/...`) are not supported — bail out with a short explanation if the user passes one.

## Workflow

1. **Parse the Figma URL** — extract:
   - `fileKey`: the path segment after `/design/`. **Exception:** if the URL contains `/branch/<branchKey>/`, use the `branchKey` as the fileKey instead.
   - `nodeId`: the `node-id` query parameter, converted from URL form (`20226-113394`) to API form (`20226:113394`) by replacing the `-` with `:`.
2. **Read** `scripts/apply_markers.js` from this skill's directory.
3. **Substitute** the `{{NODE_ID}}` placeholder in the script with the API-form node ID.
4. **Call** `Figma:use_figma` once with:
   - `fileKey`: the value extracted in step 1
   - `code`: the substituted script from step 3
   - `description`: a short one-liner like `"Apply position markers to numbered frames on the page containing node <id>"`
5. **Summarize** the returned JSON for the user (see "Reporting" below).

The script is idempotent — it figures out for each numbered frame whether to create a new marker, update a stale one, or leave a correct one alone. There's no separate "create" vs "update" mode.

## Timeouts — CRITICAL

`Figma:use_figma` enforces a client-side timeout on the MCP transport. **A timeout response is NOT a failure signal.** The script keeps running on Figma's side after MCP gives up, and on a fresh page with ~40 numbered frames the first apply pass routinely takes longer than the MCP timeout. The work usually completes; only the result message is lost.

**Do NOT re-run the apply script after a timeout.** Re-running while the previous run is still executing on the Figma host produces concurrent runs against the same page, and concurrent runs can race past each other's "no marker exists" check and create duplicate chips on the same frame. (The next clean run will dedup, but only after the damage is visible.)

After a timeout, do one of these instead:

1. **Ask the user to look at the Figma page.** The markers are almost certainly already there.
2. **Run the read-only verification snippet below.** It walks the page once and reports counts without writing anything. Safe to repeat.

```js
// Verification snippet — pass via Figma:use_figma `code` after substituting NODE_ID.
const STARTING_NODE_ID = "{{NODE_ID}}";
const MARKER_PREFIX = "Position Marker / ";
const NUMBER_REGEX = /^(\d+\.\d+(?:\.\d+)?)\b/;
let node = await figma.getNodeByIdAsync(STARTING_NODE_ID);
while (node && node.type !== "PAGE") node = node.parent;
if (!node) return { error: "No page" };
const candidates = [];
(function walk(n) {
  for (const c of n.children) {
    if (c.type === "SECTION") walk(c);
    else if (c.type === "FRAME") {
      const m = c.name.match(NUMBER_REGEX);
      if (m) candidates.push({ frame: c, number: m[1] });
    }
  }
})(node);
let correct = 0, missing = 0, wrong = 0, duplicates = 0;
for (const { frame, number } of candidates) {
  const ms = frame.children.filter(c => c.name && c.name.startsWith(MARKER_PREFIX));
  if (ms.length === 0) missing++;
  else if (ms.length > 1) duplicates++;
  else if (ms[0].name.slice(MARKER_PREFIX.length).trim() === number) correct++;
  else wrong++;
}
return { pageName: node.name, total: candidates.length, correct, missing, wrong, duplicates };
```

Only re-run the apply script if verification shows missing/wrong/duplicate markers. The apply script also has a fast-path that bails in well under a second when everything is already in sync, so a re-run on a synced page is cheap — but verification first avoids the concurrent-run race entirely.

## What the script does

It walks up from the provided node to find the parent page (so the URL can point to the page itself or any node inside it). It then visits every section recursively, collecting frames whose names match `^(\d+\.\d+(?:\.\d+)?)\b`. For each match:

- No `Position Marker / *` child → creates a new pill chip
- Marker already correct → leaves it alone
- Marker has wrong number → updates the chip's text and layer name and re-anchors its position

Each chip is a child of its frame, positioned just outside the frame's left edge (16px gap) and aligned with the top edge.

### Chip style

- Pill shape (`cornerRadius: 999`)
- Indigo background `#4F46E5`, white Inter Bold 20px text, 2% letter spacing
- Auto-layout horizontal, padding 14×8
- Layer name: `Position Marker / <number>`

These constants live at the top of `scripts/apply_markers.js` — edit there for project-specific styling.

## Reporting

The script returns a JSON object shaped like this:

```
{
  "pageName": "Zoe - Test Area",
  "totalCandidates": 37,
  "createdCount": 4,
  "updatedCount": 1,
  "unchangedCount": 32,
  "clippedCount": 0,
  "errorCount": 0,
  "created":   [ { "frame": "...", "number": "1.1.2" }, ... ],
  "updated":   [ { "frame": "...", "from": "2.2.1", "to": "2.2.9" }, ... ],
  "unchanged": [ ... ],
  "clippedFrames": [ "..." ],
  "errors":    [ { "frame": "...", "error": "..." }, ... ]
}
```

Keep the summary tight. The user almost always cares about counts plus anomalies — not the full per-frame list. Two anomalies deserve explicit mention if present:

- **`clippedFrames`** — these frames have `clipsContent: true`, so their new chip exists but renders outside the visible area. Mention them and offer to disable clipping as a follow-up. Do not change `clipsContent` automatically; it can affect how the rest of the frame's content renders.
- **`errors`** — surface any failures verbatim. The most common cause is a font that couldn't be loaded.

If `createdCount` and `updatedCount` are both zero and there are no errors, say so plainly — the page is already in sync.

## Important details

- **Idempotency.** Re-running the skill is the intended way to "sync" markers after renaming frames. Safe to run repeatedly.
- **Auto-layout frames.** If a target frame uses auto-layout, the script sets `layoutPositioning = "ABSOLUTE"` on the chip so it can sit outside the frame's bounds without being managed by the layout engine.
- **Page scope.** Only the single page derived from the provided node ID is touched. Other pages in the same Figma file are not affected.
- **Number detection.** The regex matches `#.#` and `#.#.#` at the start of a frame name, terminated by any non-digit character. So `1.1 - foo`, `1.1.2 foo`, and bare `1.1.2` all match. `1.1.2.3 - foo` matches but only captures `1.1.2`. Names like `v1.2 release` or `frame 1` do not match.
- **Recursion.** The walker descends into nested SECTIONs but does not descend into FRAMEs — numbered frames are expected to live at the section level, and a frame's children are typically UI elements (also frames) that should not be marked.

## Example invocation

User says:

> Add position markers to https://www.figma.com/design/xsCOGY7tDR8qc0GcYEonH2/Workflow?node-id=20226-113394

You should:

1. Extract `fileKey="xsCOGY7tDR8qc0GcYEonH2"` and `nodeId="20226:113394"`.
2. Read `scripts/apply_markers.js`, replace `{{NODE_ID}}` with `20226:113394`.
3. Call `Figma:use_figma` with that script and `fileKey="xsCOGY7tDR8qc0GcYEonH2"`.
4. Report something like: *"Done — 36 markers created, 1 already existed, 0 errors."*
