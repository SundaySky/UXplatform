---
name: figma-walkthrough-markers
description: Maintains a shared ID taxonomy on a Figma page so that recorded walkthroughs can be cross-referenced by Claude after transcription. Three modes — inventory (read-only audit), rename (assign hierarchical/alpha prefixes to layers), mark (add or sync native Figma annotations on prefixed layers) — plus verify (post-write sanity check). Use whenever a user provides a Figma URL and wants to prep a page for a walkthrough recording, audit annotation status, renumber sections, mark layers with annotations, or sync annotations after layer renames. Supports FRAME, INSTANCE, COMPONENT, and COMPONENT_SET candidates (SECTION and GROUP are walked through for context but the Figma API does not expose annotations on those node types). Triggers on phrases like "walkthrough markers", "prep this figma for a walkthrough recording", "audit / inventory annotations", "renumber section X", "add annotations/markers/badges to figma frames", "give these layers prefixes", "sync annotations after renames". Always triggers when a Figma URL appears alongside any of: annotation, chip, marker, badge, label, audit, prefix, rename, renumber, walkthrough, recording.
---

# Figma Walkthrough Markers

Skill for maintaining a stable ID taxonomy on a Figma page so a recorded walkthrough (designer narrating over the canvas) can be paired with a transcript and resolved by Claude later. Each referenceable frame gets a short pronounceable identifier (`1.1.2`, `A2`, `B3`, `A1.initial`) and a **native Figma annotation** carrying that identifier as its label. When you watch the recording you read the annotation pin; when Claude reads the transcript it either greps the layer name or — for variant slugs — looks up the COMPONENT_SET's variantProperties.

**Companion reference:** `docs/figma-walkthrough-id-resolution.md` is the canonical guide for **resolving IDs back to Figma nodes** from a transcript. Hand it to whichever Claude session is consuming the walkthrough recording.

## When to invoke

Trigger this skill whenever the user supplies a Figma URL and asks anything in the annotation / taxonomy / walkthrough family. Specifically:

- "audit / inventory / show annotations for this page" → **inventory**
- "give these layers prefixes" / "renumber section X" / "add an ID to this layer" → **rename**
- "add annotations / mark / badge this page" / "sync annotations after renames" → **mark**
- "verify / sanity check annotations on this page" (or after a `Figma:use_figma` timeout) → **verify**

If the user drops a Figma URL with no verb, default to **inventory** and report what's there — that's the safe first move.

## Requirements

- The `Figma:use_figma` MCP tool must be available.
- The user must supply a Figma URL with a `node-id` query parameter.
  - URL form (dash): `node-id=20226-113394`. API form (colon): `20226:113394`. Convert dash → colon.
  - From `figma.com/design/<fileKey>/<name>?node-id=…` extract `fileKey` from the path. If the path is `figma.com/design/<fileKey>/branch/<branchKey>/<name>` use `branchKey` as the fileKey.
- **The Figma file must be writable by the connected Figma account.** The Figma plugin runtime treats *any* plugin invocation — including read-only inventory — as a write attempt and refuses to run on view-only files. If the user shares a handoff URL they only have view access to, ask them to duplicate the file or have the owner share edit access.
- Figma Make URLs (`figma.com/make/...`) are not supported.

## Annotations replace the previous chip mechanism

This skill used to add visible indigo "Position Marker" pill chips as child layers on every prefixed candidate. The current version uses **Figma annotations** instead — native handoff metadata that:

- Are NOT layers, so they don't shift auto-layouts or appear in exported assets.
- Show up on the canvas as colored pins with the identifier as a label next to the pin (visible in both Design Mode and Dev Mode when annotation view is on — `View → Show annotations` in Design Mode).
- Round-trip through Figma's Dev Mode handoff: when a future Claude session calls `get_design_context` on an annotated frame, the annotation surfaces as `data-<category>-annotations="<label>"`, e.g. `data-position-annotations="B3"`.
- Carry a category that color-codes the marker (Position blue / Suspicious red / Missing info orange) — see "Categories" below.

The first `mark` run on a page that was previously chipped removes all legacy `Position Marker / *` and `Suspicion / *` child-layer chips automatically; the count is reported as `legacyChipsRemovedCount` in the response.

### Node types — annotations don't cover everything

The Figma Plugin API exposes annotations on FRAME, INSTANCE, COMPONENT, COMPONENT_SET, RECTANGLE, TEXT, and a few shape types. **It does NOT expose annotations on SECTION or GROUP nodes** (`TypeError: no such property 'annotations'`). The Figma REST API has the same restriction at the schema level.

Consequence for this skill:

- **SECTION and GROUP are no longer markable candidates.** They don't appear as rows in `inventory`. `mark` does not attempt to put an annotation on them.
- The walker still **descends through** sections and groups so their FRAME/INSTANCE/COMPONENT/COMPONENT_SET children get marked normally.
- Section prefixes still serve as **base prefixes** for path-extension classification of children (a SECTION named `A1. Foo` is the base prefix for child FRAMEs that should be named `A1.1`, `A1.2`, etc.).
- For walkthrough recording: a section's name renders as a label at the top of the section on the Figma canvas, so the recorder can read the section's prefix directly without a marker. The section's name also reaches downstream Claude via `data-name="A1. Foo"` in `get_design_context`.
- If you have prefixed GROUPs you need marked, convert them to FRAMEs.

## Categories

The skill creates three Figma annotation categories on first run (idempotent by label — re-creating across re-runs is a no-op):

| Label          | Color  | Default use                                                                                                                          |
|----------------|--------|--------------------------------------------------------------------------------------------------------------------------------------|
| `Position`     | blue   | Default for every prefixed candidate.                                                                                                |
| `Suspicious`   | red    | Used by the skill for `image-only` suspicions on FRAME/RECTANGLE. Also available for the user to manually flag a frame for review.   |
| `Missing info` | orange | Created but unused by the skill itself. Available in Figma's category dropdown for the user to flag frames that need more design work. |

When `mark` runs, every prefixed candidate gets a Position-category annotation by default. To flag a specific frame as suspicious or missing-info: in Figma, click its annotation pin and change its category from the dropdown. The skill **preserves the chosen category on every subsequent re-run** — it will only update the label if the frame is renumbered, never the category.

Because Figma normalizes category names when emitting them as data attributes (lowercase, spaces → dashes), the round-trip attribute key is:

- `data-position-annotations="B3"`
- `data-suspicious-annotations="B3"`
- `data-missing-info-annotations="B3"`

A downstream Claude reading the design via `get_design_context` will see all three forms. The category portion of the attribute key is the signal that lets downstream Claude treat suspicious or missing-info frames differently from plain position references.

> **Caveat about category lifetime:** the Figma Plugin API has no method to delete or rename an annotation category, so any category ever created on the file is permanent. The skill is careful to look up by label before creating, so re-runs never produce duplicates.

## The skill's contract — important

**The skill never auto-decides what's "leaf enough" to mark. You decide via naming.** If a layer name starts with a recognized prefix, the skill annotates it. If it doesn't, the skill leaves it alone. Inventory helps you see candidate layers and decide which deserve a prefix; rename writes the prefix; mark turns prefixes into annotations.

This means the depth question reduces to "where did the user put prefixes?" — which is the same as "which layers will Claude be able to grep by ID later?" Same answer, two purposes.

## The naming convention — STRICT

The annotation-to-layer link only works if **every prefix is a strict extension of its parent's prefix, and every prefix is globally unique on the page.** The reason: Claude resolves an ID from the transcript by walking the page and finding the layer whose name *starts with that ID*. If two layers share a prefix, lookup is ambiguous.

Concretely:

- Top-level page children get to be single-component: `A`, `B`, `1`, `2`.
- Children of a section with prefix `B` must extend it: `B1`, `B2`, `B.1`, `B1.2`. Not `1`, not `2`, not `X1`.
- Children of `B1` (a deeper level) must extend that: `B1.1`, `B1.2`. Not `B2.x` (collides with sibling `B2`), not bare `1` (ambiguous).

Letter-only parents join children without a dot (`B` + `1` = `B1`). Numeric or letter+digit parents join with a dot (`1.2` + `3` = `1.2.3`, `B1` + `2` = `B1.2`).

### Prefix classifications (used by inventory and rename)

For each prefixed candidate, the skill classifies its prefix relative to its nearest prefixed ancestor:

| Classification | Meaning | Example |
|---|---|---|
| `strong` | Strictly extends parent's prefix. | `B2` under `B`; `1.2.3` under `1.2` |
| `root` | Page-level child with no prefixed ancestor; any well-formed prefix counts. | `A`, `1` at page root |
| `weak-numeric` | Has a prefix, but it's a bare integer inside a letter-keyed (or differently-numbered) ancestor. | `2` under `B`; `5` under `A1` |
| `weak-other` | Has a prefix that doesn't fit either case (e.g., a different letter). | `X1` under `B` |
| `unprefixed` | No prefix detected. | `Bulletpiont toolbar` |

`weak-numeric` is the case the skill can fix automatically (see `promoteWeak` below). `weak-other` requires human judgement — the user resolves it via an explicit rename.

## Why Claude can resolve an ID to a layer

- Position annotations are **metadata on the target layer**, not separate child nodes. There's no separate "find the chip, follow the pointer" step.
- Claude resolves an ID from the transcript by walking the page and matching `name.startsWith(<ID> + separator)` — same as before. **The contract is enforced on layer names, not on annotations.** Annotations are the visible rendering of the convention for the person recording.
- For variants (COMPONENT children of a COMPONENT_SET), the annotation's label carries the sub-ID slug that the variant's name can't (Figma derives `variantProperties` from the variant name, so renaming breaks the variant system). Claude resolves variant slugs via the COMPONENT_SET's variantProperties — see `docs/figma-walkthrough-id-resolution.md`.

## The workflow arc

```
1. inventory      see what's there and what's annotated
2. rename         add prefixes to anything that should get an annotation   (optional, dry-run by default)
3. mark           add or sync the annotations
4. record         the designer walks through the canvas (with View → Show annotations enabled)
5. send to Claude transcript + Figma URL — Claude resolves IDs by layer-name match
```

Re-run mark whenever layers are renamed, moved, or added — it's idempotent.

## Modes at a glance

| Mode | Effect | When to use |
|---|---|---|
| `inventory` | Reports the candidate tree + per-candidate marker status + suspicion list. **Read-only.** | First pass on any new page; whenever you want to see what would change. |
| `rename` | Renames layers to add prefixes. **Dry-run by default**, applies only when `apply: true`. | When candidates are unprefixed and you want IDs assigned. |
| `mark` | Adds, updates, or de-dups Position-category annotations. Migrates away from legacy chip layers on first run. Also adds Suspicious-category annotations on `image-only` FRAMEs/RECTANGLEs. Idempotent. | After numbering is settled, before recording. |
| `verify` | Read-only summary of annotation counts (correct/missing/wrong/duplicate). | After a `Figma:use_figma` MCP timeout on `mark`, to check whether the write actually finished without risking a concurrent re-run. |

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
   - `{{FLAG_SUSPICIONS}}` → JS boolean literal `true` (default) or `false` — when true, inventory reports suspicious layers and mark adds Suspicious-category annotations on the ones that support annotations
3. Call `Figma:use_figma` with:
   - `fileKey` → extracted from URL
   - `code` → the substituted script
   - `description` → a one-liner like `"Walkthrough markers — mode=inventory on page <fileName>"`

The script returns JSON. Summarize for the user; don't dump the raw tree unless they ask.

## Mode: inventory

Read-only walk. Returns a flat list of candidate nodes (FRAME, INSTANCE, COMPONENT, COMPONENT_SET) with their detected prefix and marker status. Walks the page per this depth contract:

- Descend through SECTIONs and GROUPs without limit (they're transparent — never candidates).
- At the first non-section, non-group MARKABLE node, list it and stop descending — unless that node has a prefix, in which case descend one more level so sub-numbering is visible.
- Never descend into an INSTANCE. Its internals belong to the component definition, not to the user's layers.

What to report back to the user:

- **Total candidates** + breakdown by type
- **Prefixed vs unprefixed** counts
- **Marker status** counts: correct / missing / wrong / duplicate
- **Marker category** for each prefixed candidate (Position by default; Suspicious / Missing info if the user has re-categorized)
- **Legacy chips remaining** (`legacyChipsRemaining` + `legacySuspicionChipsRemaining` in the summary) — if non-zero, the page has not yet been migrated away from the old chip mechanism. Recommend running `mark` to clean them up.
- **`weakRows`** — prefixes that don't strictly extend their parent. Surface these explicitly.
- **`suspicions`** — see "Suspicions" below. Each entry has a `markable` flag — `false` means the suspicion was detected but cannot be marked because the suspicious node is a SECTION (annotations not supported).

Common phrasings that map here: "audit", "inventory", "what's annotated", "show me the IDs on this page", or just a bare URL.

## Mode: rename

Unchanged from the previous version. Annotations live in metadata, independent of names — `rename` just edits layer names. (After a rename, run `mark` to resync the annotation labels.)

### rename + auto (one section at a time)

Most common. Given a SECTION node, enumerate its non-section, non-group children (children of types `FRAME`, `INSTANCE`, `COMPONENT`, `COMPONENT_SET`), sort them visually (top-to-bottom, then left-to-right), and assign next-available prefixes inheriting the section's scheme:

- Section prefix `1.2` → children `1.2.1`, `1.2.2`, ...
- Section prefix `B` → children `B1`, `B2`, ...
- Section prefix `A1` → children `A1.1`, `A1.2`, ...
- Section has no prefix → children `1`, `2`, ...

Each child is classified before action is taken:

| Classification | Action (default) | Action (`promoteWeak: true`) |
|---|---|---|
| `strong` / `root` | Skip — prefix is correct. | Same. |
| `weak-numeric` | **Skip** — leave the bare integer alone, but report it so the user can decide. | **Promote** — rewrite as `<basePrefix><n>` (or `<basePrefix>.<n>` for non-letter bases). |
| `weak-other` | Skip — too ambiguous to fix automatically; the user should resolve via explicit rename. | Same. |
| `unprefixed` | Rename to next-available extension. | Same — but the slot set has `weak-numeric` reservations baked in. |

Why promotion is opt-in: it modifies a name the user typed. The default is conservative — `weak-numeric` is flagged in the dry-run output (`action: "skip-weak-numeric"`, `hint: "Run with promoteWeak: true to rewrite this as a strong prefix."`).

To invoke: pass `renameMode: "auto"`, `renameTargetId: <section-id>`, and `apply: false` (default). Show the user the proposed list, then re-run with `apply: true` if they approve.

### rename + explicit (hand-built list)

For when auto-numbering doesn't fit (e.g., assigning `B3` to one specific instance but leaving everything else alone). Pass `renameMode: "explicit"`, `renameTargetId: ""`, `renameList: [{nodeId, newPrefix}, ...]`, `apply: false`. Returns the proposed renames; re-run with `apply: true` to commit.

If an explicit target already has a prefix, it's replaced (action `"replace"` in the output). Unprefixed targets get a fresh prefix (action `"rename"`).

### Reporting

For dry-runs, present the proposed list as a short table: `oldName → newName`. Skipped-already-prefixed entries are usually noise — mention the count, not each one, unless something looks off.

## Mode: mark

Idempotent annotation sync. For each prefixed candidate the script ensures exactly one Position-category annotation exists whose label equals the candidate's prefix. The legacy chip migration runs first: every `Position Marker / *` and `Suspicion / *` child-layer chip is removed from the page so chips and annotations don't coexist.

### Ownership rule

An annotation is treated as **skill-owned** if BOTH:

1. Its `categoryId` is one of `Position` / `Suspicious` / `Missing info`, AND
2. Either:
   - It's a **position annotation**: its `label` is exactly a prefix-shaped string (e.g. `B3`, `1.1.2`, `A1.initial`), OR
   - It's a **suspicion annotation**: its `label` starts with `Suspicion / ` and the remainder is one of the skill's known reasons (`image-only`, `empty-section`).

Anything else on the same layer — a user note, a custom-labeled Suspicious annotation like `"this needs a redesign"` — is left alone. The skill never clobbers user content.

### Category preservation

When `mark` finds an existing skill-owned position annotation on a candidate:

- If the label matches the candidate's prefix → leave it alone (this includes user-changed categories — a Suspicious-category position annotation with label `B3` is left as Suspicious if `B3` is still its frame's prefix).
- If the label is wrong (the frame was renumbered) → update the label, **preserve the existing category**.
- If there are multiple → keep the first, remove duplicates (reported as `dedupedCount`).

### Variants

Component variants get their annotations directly on the variant `COMPONENT` node — annotations work on COMPONENT nodes, so no special placement is required (unlike the old chip mechanism, which had to put variant chips in the enclosing section). The annotation's label is the computed variant slug (e.g. `A1.initial`, `B2.editor-video.template`).

**Sub-ID naming** is controlled by `{{VARIANT_NAMING}}`:

- `"slug"` (default) — derive sub-IDs from `variantProperties` values. The slugger is *adaptive*: it picks the smallest word count (1, 2, or 3 per property value) that keeps every variant's slug unique within the set. Multi-property sets get joined slugs like `editor-video.template`. If the budget is exceeded (any slug > 30 chars, collision at 3 words) the set downgrades to numeric for that set only.
- `"numeric"` — force `<basePrefix>.1`, `<basePrefix>.2`, ... in document order across all sets.

### Idempotency + the fast path

If every prefixed candidate has a single correctly-labeled skill-owned annotation AND no legacy chips remain on the page AND the categories already exist, `mark` returns immediately with `inSync: true` and writes nothing.

## Suspicions

A walkthrough is only as good as the structural data behind it. Two recurring failure modes produce empty answers when Claude tries to introspect what an ID points at:

1. **Image-only layers posing as UI** — a RECTANGLE or FRAME with an IMAGE fill, named like a UI element (e.g. `Tooltip on the fallback i icon`). To Claude it's an opaque raster with no children, no text content, no interaction structure.
2. **Prefixed but empty sections** — `E3. Scale to` exists as a labeled grouping but contains no children. The ID resolves, but the resolved node yields nothing.

When `flagSuspicions: true` (the default), the skill detects these and surfaces them two ways:

- **Inventory** returns a `suspicions` array. Each entry includes a `markable` flag: `true` for image-only FRAMEs/RECTANGLEs (which support annotations), `false` for SECTIONs (which don't).
- **Mark**:
  - For `image-only` on a FRAME or RECTANGLE: adds a Suspicious-category annotation with label `Suspicion / image-only` directly on the target node. Visible as a red pin on the canvas.
  - For `empty-section` on a SECTION: detection still runs and surfaces in inventory, but **the skill cannot annotate sections**. The suspicion is reported (in `mark`'s `suspicions.skipped` list) but not visually marked. To fix the underlying issue, add content to the section or remove the prefix.

Re-running `mark` is idempotent for suspicions too: existing suspicion annotations are left alone, new suspicions get annotations, and **orphan suspicion annotations whose target is no longer suspicious are automatically removed** (so fixing the underlying issue and re-running `mark` cleans up the warning).

To turn off suspicion detection entirely (e.g., on a page where image-only mocks are intentional), pass `flagSuspicions: false`. The skill defaults to `true` because letting these slide is the failure mode worth catching by default.

## Mode: verify

Returns counts only — no per-row detail. Use it after a `Figma:use_figma` MCP-side timeout on mark, when you want to know whether the previous write actually finished without risking a concurrent re-run. Output fields: `total`, `unprefixed`, `correct`, `missing`, `wrong`, `duplicate`.

## Timeouts — CRITICAL

`Figma:use_figma` enforces a client-side timeout on the MCP transport. **A timeout response from `mark` is NOT a failure signal.** The script keeps running on Figma's side after MCP gives up. The work usually completes; only the result message is lost.

**Do NOT re-run `mark` after a timeout.** Concurrent runs can race past each other's checks and create duplicate annotations. The next clean `mark` run will dedup, but only after the damage is visible.

After a timeout, do one of these:

1. Ask the user to look at the canvas. The annotation pins are almost certainly already there (toggle `View → Show annotations` if needed).
2. Run **verify** — it's read-only and safe to repeat. Re-run mark only if verify shows missing/wrong/duplicate.

## What counts as a valid prefix

The detector matches at the start of a layer name, terminated by `.`, `-`, `:`, whitespace, or end-of-string. Matches:

- **Numeric**: `1`, `1.2`, `1.2.3`, `12.45.7`
- **Letter+digit (optionally dotted)**: `A1`, `A1.2`, `A1.2.3`
- **Letter.digit**: `A.1`, `A.1.2`
- **Bare single letter** — only when followed by a structural separator (`.` `-` `:`). So `A. Foo` matches (`A`), but `A quick fix` does *not*.

Non-matches: `v1.2 release`, `Frame 1`, `<Button>`, `Bulletpiont toolbar`, ` Text style <Menu>` (leading space).

## Canvas visibility for recordings

Figma annotations appear on the canvas as colored pins with the label rendered inline. In **Design Mode**, annotation view is OFF by default — toggle it on via `View → Show annotations` before recording a walkthrough. In **Dev Mode**, annotation view is on by default.

`Figma:get_screenshot` from the MCP server does NOT render annotation pins (they're an editor-only overlay, like comments). Don't try to verify visibility via screenshot; verify either by asking the user to look at the page directly, or by calling `get_design_context` and checking that the `data-<category>-annotations` attribute is present.

## Reporting style

Keep summaries short. The user almost always cares about counts + anomalies, not the full per-frame list. Surface these things explicitly when present:

- **`errors`** — verbatim.
- **`legacyChipsRemovedCount` / `legacyChipsRemaining`** — non-zero on the first migration run (or in inventory before migrating). Mention them so the user knows the chip-to-annotation migration is happening.
- **`categoriesCreated`** — only non-empty on the first run that creates the Position/Suspicious/Missing info categories. Mention which categories were freshly created so the user knows they're now part of their file's annotation category palette.
- **`dedupedCount`** — extras removed; mention that the dedup happened.
- **`skippedCount`** (and per-row `skipped`) — node-type doesn't support annotations. Currently this only fires for SECTION/GROUP candidates that slip through (the walker shouldn't produce these, so a non-zero count is a bug signal).
- **`suspicions.skipped`** — suspicions detected on SECTIONs. Surface them so the user knows the issues exist even though the skill can't mark them.
- **Duplicate prefixes** in the source — two candidates with the same prefix. Inventory will report `duplicate` marker status under each. Flag for the user to resolve by renaming.

If nothing changed (`createdCount` and `updatedCount` both zero, no errors), say so plainly. The page is in sync.

## Style customization

Annotation appearance is owned by Figma — the pin color comes from the category color, and the label is the annotation's `label` field. There's no "chip styling" to customize anymore. If you want different category colors, edit the `SKILL_CATEGORIES` constant at the top of `scripts/walkthrough.js`:

- `{ key: "position",   label: "Position",     color: "blue"   }`
- `{ key: "suspicious", label: "Suspicious",   color: "red"    }`
- `{ key: "missing",    label: "Missing info", color: "orange" }`

Valid colors per the Figma Plugin API: `blue`, `red`, `pink`, `orange`, `yellow`, `green`, `purple`, `gray`. Note that categories cannot be renamed or deleted via the Plugin API, so changing the `label` of an existing category creates a parallel category — the old one lingers in the file.

## Known limitations

- **Read-only files.** Any plugin invocation fails on view-only files, even inventory. Ask the user for edit access.
- **SECTION/GROUP candidates.** Figma doesn't expose annotations on SECTION or GROUP nodes. SECTIONs are walked through for context (their prefixes still serve as base for child path-extension) and their names render on the canvas / round-trip via `data-name`. GROUPs that need to be markable should be converted to FRAMEs.
- **Annotation pin position.** The Plugin API doesn't expose a position/anchor field for annotations — Figma chooses where the pin sits. Manually dragging a pin in Figma is not reliably supported either (the position isn't persisted in the Plugin API representation). If precise on-canvas placement matters, this is the wrong mechanism — use a different visual cue.
- **Category lifetime.** The Plugin API has no method to delete or rename annotation categories. Once `mark` has created `Position`, `Suspicious`, and `Missing info` on a file, they're permanent in that file. Renaming the constants in the script doesn't remove the old categories — they accumulate.
- **Sub-element references within an instance.** The instance gets the annotation; the sub-reference happens in spoken language during the recording, and Claude resolves it from the instance's structured children at transcript-processing time.

## Example invocations

User says:
> Add walkthrough markers to https://www.figma.com/design/zv2AOoz7CqCdmyauhpEymM/Bullet-point-toolbar?node-id=26498-5349

Default to mark (they said "add walkthrough markers"):

1. Extract `fileKey="zv2AOoz7CqCdmyauhpEymM"` and `nodeId="26498:5349"`.
2. Read `scripts/walkthrough.js`, substitute `{{NODE_ID}}=26498:5349`, `{{MODE}}=mark`, others default.
3. Call `Figma:use_figma`. Summarize counts (created/updated/unchanged + any legacy chips removed + any categories created).

---

User says:
> Audit the annotations on https://www.figma.com/design/xsCOGY7tDR8qc0GcYEonH2/Workflow?node-id=20226-113394

Inventory:

1. Same extraction. `{{MODE}}=inventory`.
2. Report: total candidates by type, prefixed/unprefixed, marker statuses (with category breakdown), any legacy chips still on the page, any unmarkable suspicions on sections.

---

User says:
> Renumber the children of section B in <URL>

Rename auto, dry-run:

1. Find section B's node id.
2. `{{MODE}}=rename`, `{{RENAME_MODE}}=auto`, `{{RENAME_TARGET_ID}}=<B-id>`, `{{APPLY}}=false`.
3. Show the proposed list. Wait for confirmation.
4. On confirmation, re-run with `{{APPLY}}=true`. Then run mark to resync annotations.

---

User says:
> The `Bulletpiont toolbar` instance in section B should be B1.

Rename explicit, dry-run:

1. `{{MODE}}=rename`, `{{RENAME_MODE}}=explicit`, `{{RENAME_LIST_JSON}}=[{"nodeId":"26498:5543","newPrefix":"B1"}]`, `{{APPLY}}=false`.
2. Show: "would rename `Bulletpiont toolbar` → `B1. Bulletpiont toolbar`". Confirm.
3. Re-run with `apply: true`. Then run mark to add the annotation.
