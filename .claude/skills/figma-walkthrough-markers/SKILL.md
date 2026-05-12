---
name: figma-walkthrough-markers
description: Maintains a shared ID taxonomy on a Figma page so that recorded walkthroughs can be cross-referenced by Claude after transcription. Three modes — inventory (read-only audit), rename (assign hierarchical/alpha prefixes to layers), mark (add or sync visible chip badges on prefixed layers) — plus verify (post-write sanity check). Use whenever a user provides a Figma URL and wants to prep a page for a walkthrough recording, audit chip status, renumber sections, mark layers with chips, or sync chips after layer renames. Supports FRAME, INSTANCE, SECTION, COMPONENT, COMPONENT_SET, and GROUP candidates. Triggers on phrases like "walkthrough markers", "prep this figma for a walkthrough recording", "audit / inventory chips", "renumber section X", "add chips/badges/markers to figma frames", "give these layers prefixes", "sync chips after renames". Always triggers when a Figma URL appears alongside any of: chip, marker, badge, label, audit, prefix, rename, renumber, walkthrough, recording.
---

# Figma Walkthrough Markers

Skill for maintaining a stable ID taxonomy on a Figma page so a recorded walkthrough (designer narrating over the canvas) can be paired with a transcript and resolved by Claude later. Each referenceable frame gets a short pronounceable identifier (`1.1.2`, `A2`, `B3`, `A1.initial`) and a visible indigo chip placed against its left edge. When you watch the recording you read the chip; when Claude reads the transcript it greps the layer name (or, for variant slugs, looks up the COMPONENT_SET's variantProperties).

**Companion reference:** `docs/figma-walkthrough-id-resolution.md` is the canonical guide for **resolving IDs back to Figma nodes** from a transcript. Hand it to whichever Claude session is consuming the walkthrough recording.

## When to invoke

Trigger this skill whenever the user supplies a Figma URL and asks anything in the chip / taxonomy / walkthrough family. Specifically:

- "audit / inventory / show chips for this page" → **inventory**
- "give these layers prefixes" / "renumber section X" / "add an ID to this layer" → **rename**
- "add chips / mark / badge this page" / "sync chips after renames" → **mark**
- "verify / sanity check chips on this page" (or after a `Figma:use_figma` timeout) → **verify**

If the user drops a Figma URL with no verb, default to **inventory** and report what's there — that's the safe first move.

## Requirements

- The `Figma:use_figma` MCP tool must be available.
- The user must supply a Figma URL with a `node-id` query parameter.
  - URL form (dash): `node-id=20226-113394`. API form (colon): `20226:113394`. Convert dash → colon.
  - From `figma.com/design/<fileKey>/<name>?node-id=…` extract `fileKey` from the path. If the path is `figma.com/design/<fileKey>/branch/<branchKey>/<name>` use `branchKey` as the fileKey.
- **The Figma file must be writable by the connected Figma account.** The Figma plugin runtime treats *any* plugin invocation — including read-only inventory — as a write attempt and refuses to run on view-only files. If the user shares a handoff URL they only have view access to, ask them to duplicate the file or have the owner share edit access.
- Figma Make URLs (`figma.com/make/...`) are not supported.

## The skill's contract — important

**The skill never auto-decides what's "leaf enough" to mark. You decide via naming.** If a layer name starts with a recognized prefix, the skill chips it. If it doesn't, the skill leaves it alone. Inventory helps you see candidate layers and decide which deserve a prefix; rename writes the prefix; mark turns prefixes into chips.

This means the depth question reduces to "where did the user put prefixes?" — which is the same as "which layers will Claude be able to grep by ID later?" Same answer, two purposes.

## The naming convention — STRICT

The chip-to-layer link only works if **every prefix is a strict extension of its parent's prefix, and every prefix is globally unique on the page.** The reason: Claude resolves an ID from the transcript by walking the page and finding the layer whose name *starts with that ID*. If two layers share a prefix, lookup is ambiguous. If a chip says `2` inside section `B`, there's no way to tell whether the speaker meant that specific instance or any other `2`-prefixed layer elsewhere.

Concretely:

- Top-level page children get to be single-component: `A`, `B`, `1`, `2`.
- Children of a section with prefix `B` must extend it: `B1`, `B2`, `B.1`, `B1.2`. Not `1`, not `2`, not `X1`.
- Children of `B1` (a deeper level) must extend that: `B1.1`, `B1.2`. Not `B2.x` (collides with sibling `B2`), not bare `1` (ambiguous).

Letter-only parents join children without a dot (`B` + `1` = `B1`), matching the file-2 convention. Numeric or letter+digit parents join with a dot (`1.2` + `3` = `1.2.3`, `B1` + `2` = `B1.2`).

### Prefix classifications (used by inventory and rename)

For each prefixed candidate, the skill classifies its prefix relative to its nearest prefixed ancestor:

| Classification | Meaning | Example |
|---|---|---|
| `strong` | Strictly extends parent's prefix. | `B2` under `B`; `1.2.3` under `1.2` |
| `root` | Page-level child with no prefixed ancestor; any well-formed prefix counts. | `A`, `1` at page root |
| `weak-numeric` | Has a prefix, but it's a bare integer inside a letter-keyed (or differently-numbered) ancestor. | `2` under `B`; `5` under `A1` |
| `weak-other` | Has a prefix that doesn't fit either case (e.g., a different letter). | `X1` under `B` |
| `unprefixed` | No prefix detected. | `Bulletpiont toolbar` |

`weak-numeric` is the case the skill can fix automatically (see `promoteWeak` below). `weak-other` requires human judgement — the user resolves it via an explicit rename. Inventory surfaces both in a dedicated `weakRows` list so the user sees what needs attention before recording.

## Why Claude can resolve a chip ID to a layer

Just to be unambiguous about the lookup contract:

- The **plugin data** on a chip (`wt_markers.targetId`) is for the *skill's* bookkeeping — it lets re-sync find the right chip even if its text drifted.
- Claude doesn't read plugin data. Claude resolves an ID from the transcript by walking the page and matching `name.startsWith(<ID> + separator)`.
- So **the contract is enforced on layer names, not on chips.** Chips are a visual rendering of the convention for the person recording.

If a chip text disagrees with its target's name prefix, mark will fix the chip on next run. But if two layers share a name prefix, Claude has no way to disambiguate — that's the convention's job.

## The workflow arc

```
1. inventory      see what's there and what's chipped
2. rename         add prefixes to anything that should get a chip   (optional, dry-run by default)
3. mark           add or sync the chips
4. record         the designer walks through the canvas
5. send to Claude transcript + Figma URL — Claude resolves IDs by layer-name match
```

Re-run mark whenever layers are renamed, moved, or added — it's idempotent.

## Modes at a glance

| Mode | Effect | When to use |
|---|---|---|
| `inventory` | Reports the candidate tree + per-candidate chip status + suspicion list. **Read-only.** | First pass on any new page; whenever you want to see what would change. |
| `rename` | Renames layers to add prefixes. **Dry-run by default**, applies only when `apply: true`. | When candidates are unprefixed and you want IDs assigned. |
| `mark` | Adds, updates, or de-dups indigo position chips. Also drops/syncs amber **suspicion markers** on problematic layers (image-only rects, empty prefixed sections). Idempotent. | After numbering is settled, before recording. |
| `verify` | Read-only summary of chip counts (correct/missing/wrong/duplicate). | After a `Figma:use_figma` MCP timeout on `mark`, to check whether the write actually finished without risking a concurrent re-run. |

## How to run any mode

The skill's executable is `scripts/walkthrough.js`. For every invocation:

1. Read the script.
2. Substitute placeholders in the `CONFIG` block at the top of the file (and ONLY in that block — leave the rest verbatim so the prompt cache helps subsequent runs):
   - `{{NODE_ID}}` → API-form node id (e.g. `"20226:113394"`)
   - `{{MODE}}` → `"inventory"` | `"rename"` | `"mark"` | `"verify"`
   - `{{RENAME_MODE}}` → `"auto"` | `"explicit"` | `""` if not rename
   - `{{RENAME_TARGET_ID}}` → API-form section id, or `""` if not rename/auto
   - `{{RENAME_LIST_JSON}}` → JSON array (e.g. `[{"nodeId":"26498:5545","newPrefix":"B3"}]`) or `[]`
   - `{{APPLY}}` → JS boolean literal `true` or `false` (no quotes)
   - `{{PROMOTE_WEAK}}` → JS boolean literal `true` or `false` (rename + auto only; default `false`)
   - `{{VARIANT_NAMING}}` → `"slug"` (default) or `"numeric"` — used by inventory and mark when enumerating COMPONENT_SET variants
   - `{{FLAG_SUSPICIONS}}` → JS boolean literal `true` (default) or `false` — when true, inventory reports suspicious layers and mark adds amber suspicion markers
3. Call `Figma:use_figma` with:
   - `fileKey` → extracted from URL
   - `code` → the substituted script
   - `description` → a one-liner like `"Walkthrough markers — mode=inventory on page <fileName>"`

The script returns JSON. Summarize for the user; don't dump the raw tree unless they ask.

## Mode: inventory

Read-only walk. Returns a flat tree of candidate nodes (FRAME, INSTANCE, SECTION, COMPONENT, COMPONENT_SET, GROUP) with their detected prefix and chip status. Walks the page per this depth contract:

- Descend through SECTIONs without limit (organizational, never the boundary).
- At the first non-section node, list it and stop descending — unless that node has a prefix, in which case descend one more level so sub-numbering is visible.
- Never descend into an INSTANCE. Its internals belong to the component definition, not to the user's layers.

What to report back to the user:

- **Total candidates** + breakdown by type
- **Prefixed vs unprefixed** counts
- **Chip status** counts: correct / missing / wrong / duplicate
- **Orphan chips** (chips whose linked node no longer exists) — flag them
- The full row list is in the JSON; mention specific anomalies but don't dump everything unless asked

Common phrasings that map here: "audit", "inventory", "what's chipped", "show me the IDs on this page", or just a bare URL.

## Mode: rename

Adds a prefix to the start of a layer's name. Always dry-runs first — the user reviews the proposed renames, then confirms with `apply: true`. Two flavors:

### rename + auto (one section at a time)

Most common. Given a SECTION node, enumerate its non-section children, sort them visually (top-to-bottom, then left-to-right), and assign next-available prefixes inheriting the section's scheme:

- Section prefix `1.2` → children `1.2.1`, `1.2.2`, ...
- Section prefix `B` → children `B1`, `B2`, ... (letter-only base joins without a dot)
- Section prefix `A1` → children `A1.1`, `A1.2`, ...
- Section has no prefix → children `1`, `2`, ...

Each child is classified before action is taken:

| Classification | Action (default) | Action (`promoteWeak: true`) |
|---|---|---|
| `strong` / `root` | Skip — prefix is correct. | Same. |
| `weak-numeric` | **Skip** — leave the bare integer alone, but report it so the user can decide. | **Promote** — rewrite as `<basePrefix><n>` (or `<basePrefix>.<n>` for non-letter bases) preserving the trailing number, and reserve that slot. |
| `weak-other` | Skip — too ambiguous to fix automatically; the user should resolve via explicit rename. | Same. |
| `unprefixed` | Rename to next-available extension. | Same — but the slot set has `weak-numeric` reservations baked in. |

Why promotion is opt-in: it modifies a name the user typed. The default is conservative — `weak-numeric` is flagged in the dry-run output (`action: "skip-weak-numeric"`, `hint: "Run with promoteWeak: true to rewrite this as a strong prefix."`) so the user can review before opting in.

To invoke: pass `renameMode: "auto"`, `renameTargetId: <section-id>`, and `apply: false` (default). Show the user the proposed list (including which actions would happen), then re-run with `apply: true` if they approve. If the dry-run shows weak-numeric children and the user wants them fixed in the same pass, re-run with `promoteWeak: true, apply: true`.

### rename + explicit (hand-built list)

For when auto-numbering doesn't fit (e.g., assigning `B3` to one specific instance but leaving everything else alone). Pass `renameMode: "explicit"`, `renameTargetId: ""`, `renameList: [{nodeId, newPrefix}, ...]`, `apply: false`. Returns the proposed renames; re-run with `apply: true` to commit.

If an explicit target already has a prefix, it's replaced (action `"replace"` in the output). Unprefixed targets get a fresh prefix (action `"rename"`).

### Reporting

For dry-runs, present the proposed list as a short table: `oldName → newName`. Skipped-already-prefixed entries are usually noise — mention the count, not each one, unless something looks off (e.g., one of them has a numbering that conflicts with what the user expected).

## Mode: mark

Idempotent chip sync. For each prefixed candidate the script ensures exactly one correctly-named chip exists and is correctly anchored. Walks the same candidate tree as inventory.

### Placement rules

| Candidate type | Where the chip lives | How it's anchored |
|---|---|---|
| SECTION / FRAME / COMPONENT / COMPONENT_SET / GROUP | Child of the candidate | `chip.x = -(chip.width + gap)`, `chip.y = 0` (just outside left edge) |
| **INSTANCE** | Sibling — child of nearest writable ancestor (walks up past nested INSTANCEs) | `chip.x = node.x - chip.width - gap`, `chip.y = node.y` (in the host's coordinate space) |

**Why instances are different:** the Figma Plugin API rejects `appendChild` on INSTANCE nodes with "Cannot move node. New parent is an instance or is inside of an instance." There's no way to nest the chip inside the instance, so the chip becomes a sibling in the nearest writable ancestor — almost always the enclosing SECTION.

If a frame's parent uses auto-layout, the chip is set to `layoutPositioning: "ABSOLUTE"` so it doesn't get arranged by the flow.

### Plugin-data tracking

Every chip stores a `targetId` in shared plugin data under namespace `wt_markers`. This is how re-sync finds the chip even if its name drifted or its candidate moved. A chip without plugin data is matched by text fallback and adopted (plugin data stamped) on first successful sync.

### Idempotency + the fast path

If every prefixed candidate has a single correctly-named chip wired up via plugin data, mark returns immediately with `inSync: true` and writes nothing. The first run after upgrading from the legacy skill will still write (to adopt existing chips and stamp plugin data); subsequent runs are cheap.

### Variants in COMPONENT_SETs

Component variants are first-class candidates. When the walker encounters a `COMPONENT_SET`, it enumerates the set's `COMPONENT` children (the variants) and computes a sub-ID for each. The sub-ID is appended to the COMPONENT_SET's effective prefix — either the set's own name prefix, or the nearest prefixed ancestor's prefix if the set itself is unprefixed. So a variant inside an unprefixed COMPONENT_SET sitting in section `A1` gets a prefix like `A1.initial`.

**Variant prefixes are not stored in the variant's layer name.** Renaming a variant breaks Figma's variant-property system (Figma derives `variantProperties` from the name following the `Property=Value` pattern). The chip therefore carries the only visible representation of the sub-ID, and the resolution path differs from regular prefixes — see `docs/figma-walkthrough-id-resolution.md` for the contract Claude uses to map variant sub-IDs back to specific COMPONENTs.

**Sub-ID naming** is controlled by the `{{VARIANT_NAMING}}` config:

- `"slug"` (default) — derive sub-IDs from `variantProperties` values. The slugger is *adaptive*: it picks the smallest word count (1, 2, or 3 per property value) that keeps every variant's slug unique within the set. The user's `Personalization status` variants slug to `initial`, `message`, `personalization`, `choose` — short and pronounceable. Multi-property sets get joined slugs like `editor-video.template`. If the budget is exceeded (any slug > 30 chars, collision at 3 words) the set downgrades to numeric for that set only.
- `"numeric"` — force `<basePrefix>.1`, `<basePrefix>.2`, ... in document order across all sets. Use this when slugs would be unreadable or you want consistency with other sub-numbered children.

**Chip placement for variants.** A `COMPONENT_SET` only accepts `COMPONENT` children — it rejects any other node type. And modifying the variant master would propagate the chip to every instance of that component. So the variant chip is placed in the nearest writable ancestor *outside* the COMPONENT_SET (typically the enclosing SECTION), positioned at the variant's accumulated offset relative to that ancestor. It still looks visually anchored to the variant; structurally it's a sibling-of-the-COMPONENT_SET.

If the COMPONENT_SET's only writable ancestor is the PAGE, the chip goes on the page at the variant's absolute position.

**Inventory output for variants.** Each enumerated variant appears as a row with `isVariant: true` and its computed `prefix`. The `componentSetId` field links back to the parent set. Variant rows count toward `prefixed` (they all have a prefix by construction).

## Suspicions — flagging things Claude can't see

A walkthrough is only as good as the structural data behind it. Two recurring failure modes don't produce ID-resolution errors but *do* produce empty answers when Claude tries to introspect what a chip points at:

1. **Image-only layers posing as UI** — a RECTANGLE or FRAME with an IMAGE fill, named like a UI element (e.g. `Tooltip on the fallback i icon`). To a human glancing at the canvas it looks like a real screen; to Claude it's an opaque raster with no children, no text content, no interaction structure. Recording a walkthrough that points at one of these means you're pointing at content Claude can't read.
2. **Prefixed but empty sections** — `E3. Scale to` exists as a labeled grouping but contains no children. The chip works, the ID resolves, but the resolved node yields nothing. Same class of problem: the chip is making a promise the data doesn't keep.

When `flagSuspicions: true` (the default), the skill detects these and surfaces them two ways:

- **Inventory** returns a `suspicions` array per layer, with `reason` (`image-only` or `empty-section`) and a short human-readable `message`.
- **Mark** drops a distinctive **amber** marker on each suspicious layer — `Suspicion / image-only` or `Suspicion / empty-section`. The marker is a different shape and color from position chips so they're never confused on the canvas: rounded rectangle with a 2px border, `⚠` glyph, larger text. Positioned at the suspicious layer's top-left corner, overlapping the layer itself (specifically chosen to be hard to miss).

Suspicion markers are tracked separately under shared-plugin-data namespace `wt_susp` (vs. `wt_markers` for position chips). They're **not** walkthrough IDs and Claude should ignore them when resolving transcripts — see `docs/figma-walkthrough-id-resolution.md`.

Re-running `mark` is idempotent for suspicions too: existing markers are left alone, new suspicions get markers, and **orphan markers whose target is no longer suspicious are automatically removed** (so fixing the underlying issue and re-running mark cleans up the warning).

To turn off suspicion detection entirely (e.g., on a page where image-only mocks are intentional), pass `flagSuspicions: false`. The skill defaults to `true` because letting these slide is the failure mode worth catching by default.

## Mode: verify

Returns counts only — no per-row detail. Use it after a `Figma:use_figma` MCP-side timeout on mark, when you want to know whether the previous write actually finished without risking a concurrent re-run. Output fields: `total`, `unprefixed`, `correct`, `missing`, `wrong`, `duplicate`.

## Timeouts — CRITICAL

`Figma:use_figma` enforces a client-side timeout on the MCP transport. **A timeout response from `mark` is NOT a failure signal.** The script keeps running on Figma's side after MCP gives up. On a fresh page with ~40 prefixed candidates the first mark pass routinely takes longer than the MCP timeout. The work usually completes; only the result message is lost.

**Do NOT re-run `mark` after a timeout.** Concurrent runs can race past each other's "no chip exists" check and create duplicate chips. The next clean mark run will dedup, but only after the damage is visible.

After a timeout, do one of these:

1. Ask the user to look at the canvas. The chips are almost certainly already there.
2. Run **verify** — it's read-only and safe to repeat. Re-run mark only if verify shows missing/wrong/duplicate.

## What counts as a valid prefix

The detector matches at the start of a layer name, terminated by `.`, `-`, `:`, whitespace, or end-of-string. Matches:

- **Numeric**: `1`, `1.2`, `1.2.3`, `12.45.7`
- **Letter+digit (optionally dotted)**: `A1`, `A1.2`, `A1.2.3`
- **Letter.digit**: `A.1`, `A.1.2`
- **Bare single letter** — only when followed by a structural separator (`.` `-` `:`). So `A. Foo` matches (`A`), but `A quick fix` does *not* — a space alone is too weak a signal.

Non-matches: `v1.2 release`, `Frame 1`, `<Button>`, `Bulletpiont toolbar`, ` Text style <Menu>` (leading space).

If a user wants something to be referenceable but it doesn't currently match, run rename to add a prefix.

## Reporting style

Keep summaries short. The user almost always cares about counts + anomalies, not the full per-frame list. Surface these things explicitly when present:

- **`errors`** — verbatim. Most common cause is a font-load failure.
- **`clippedFrames`** — chips inside `clipsContent: true` frames are clipped out of view. Offer to disable clipping as a follow-up; don't change it automatically since clip can affect how other content renders.
- **`dedupedFrames`** — extras removed; mention that the dedup happened.
- **`orphans`** (inventory) — chips whose target node was deleted or moved out of scope.
- **Duplicate prefixes** in the source — two candidates with the same prefix. Inventory will report `duplicate` chip status under each. Flag for the user to resolve by renaming.

If nothing changed (`createdCount` and `updatedCount` both zero, no errors), say so plainly. The page is in sync.

## Style customization

Chip appearance constants live at the top of `scripts/walkthrough.js`:

- `BG = { r: 0.310, g: 0.275, b: 0.898 }` — indigo `#4F46E5`
- `FONT = { family: "Inter", style: "Bold" }`, `FONT_SIZE = 20`
- `PADDING_X = 14`, `PADDING_Y = 8`, `CORNER_RADIUS = 999`, `GAP = 4`
- `MARKER_PREFIX = "Position Marker / "` — the chip layer name prefix; do not change without migrating existing chips.

Project-specific overrides (different color, different font) belong in this file, not in a parallel skill.

## Known limitations

- **Read-only files.** Any plugin invocation fails on view-only files, even inventory. Ask the user for edit access.
- **Component variants (SYMBOLs)** inside a `COMPONENT_SET` are not enumerated as candidates. The variant set itself is. If you need per-variant chips, that's a future feature.
- **Duplicate prefixes** confuse plugin-data adoption. The first run after the upgrade will likely match two candidates to the same legacy chip via text fallback; mark will create a second chip for one of them. Re-runs are clean. If the page has many duplicates, surface them in inventory and renaming them is the fix.
- **Sub-element references within an instance** (e.g., "the OK button inside `1.1.2`") are *not* chipped. The instance gets the chip; the sub-reference happens in spoken language during the recording, and Claude resolves it from the instance's structured children at transcript-processing time. If the same sub-element keeps coming up, promote it: detach the instance, copy out the sub-piece, or give it its own number under a new container.

## Example invocations

User says:
> Add walkthrough markers to https://www.figma.com/design/zv2AOoz7CqCdmyauhpEymM/Bullet-point-toolbar?node-id=26498-5349

Default to mark (they said "add walkthrough markers"):

1. Extract `fileKey="zv2AOoz7CqCdmyauhpEymM"` and `nodeId="26498:5349"`.
2. Read `scripts/walkthrough.js`, substitute `{{NODE_ID}}=26498:5349`, `{{MODE}}=mark`, others default.
3. Call `Figma:use_figma`. Summarize counts.

---

User says:
> Audit the chips on https://www.figma.com/design/xsCOGY7tDR8qc0GcYEonH2/Workflow?node-id=20226-113394

Inventory:

1. Same extraction. `{{MODE}}=inventory`.
2. Report: total candidates by type, prefixed/unprefixed, chip statuses, any orphans or duplicate-prefixed candidates.

---

User says:
> Renumber the children of section B in <URL>

Rename auto, dry-run:

1. Find section B's node id (either from the URL `node-id` if pointing at B, or by reading the page if needed).
2. `{{MODE}}=rename`, `{{RENAME_MODE}}=auto`, `{{RENAME_TARGET_ID}}=<B-id>`, `{{APPLY}}=false`.
3. Show the proposed list: "Here's what would change…". Wait for confirmation.
4. On confirmation, re-run with `{{APPLY}}=true`.

---

User says:
> The `Bulletpiont toolbar` instance in section B should be B1.

Rename explicit, dry-run:

1. `{{MODE}}=rename`, `{{RENAME_MODE}}=explicit`, `{{RENAME_LIST_JSON}}=[{"nodeId":"26498:5543","newPrefix":"B1"}]`, `{{APPLY}}=false`.
2. Show: "would rename `Bulletpiont toolbar` → `B1. Bulletpiont toolbar`". Confirm.
3. Re-run with `apply: true`. Then run mark to add the chip.
