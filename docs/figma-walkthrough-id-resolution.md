# Figma Walkthrough — ID Resolution Guide for Claude

This guide tells Claude how to resolve **walkthrough IDs** (pronounced on camera and captured in a transcript) to specific Figma nodes (sections, instances, components, variants).

You are reading this because someone has handed you (a) a transcript of a Figma walkthrough recording, and (b) a Figma file URL. The walkthrough refers to things on the canvas by short IDs like `B2`, `A1.message`, `1.2.3`. Your job is to translate those references back to specific layers in the Figma file so you can answer questions or perform tasks anchored to them.

The taxonomy and on-canvas annotations you see come from the `figma-walkthrough-markers` skill in this project. The contract below is what makes recordings cross-referenceable.

---

## TL;DR — the resolution rule

> **Every walkthrough ID maps to exactly one layer on the Figma page, identified by name-prefix match — except when the ID's last segment is a variant slug, in which case it maps to a specific variant inside a `COMPONENT_SET`.**

When you see an ID like `B2.message`:

1. Walk the page tree.
2. Find the layer whose name starts with `B2.` — this is the parent (a SECTION, INSTANCE, FRAME, or COMPONENT_SET).
3. If the parent is a `COMPONENT_SET` AND `message` is not itself a name-prefix match within that set's children, interpret `message` as a **variant slug**: find the COMPONENT child of the set whose `variantProperties` values slug to `message`.
4. Otherwise, treat `message` as a deeper name prefix and continue.

The whole grammar and edge cases are below.

---

## ID grammar

A walkthrough ID is a dot-separated sequence of segments. Each segment is one of:

| Segment type | Example | Match against |
|---|---|---|
| Numeric | `1`, `42`, `7` | Layer-name prefix |
| Letter-only | `A`, `B`, `Z` | Layer-name prefix (top-level page child) |
| Letter+digit | `A1`, `B2`, `D4` | Layer-name prefix |
| Letter.digit | `E.6`, `A.1` | Layer-name prefix (alternate style) |
| Slug (variant) | `initial`, `message`, `view-only`, `editor-video` | Variant property value, slugged |

A full ID is segments joined by `.`:

```
1.2.3              numeric-only
A                  letter-only (page-top)
A1                 letter+digit
A1.2               letter+digit . numeric (sub-element of A1)
B2                 letter+digit (page-section style)
B2.message         letter+digit . variant slug
1.2.3.initial      numeric . variant slug
A1.message-by-aud  letter+digit . compound variant slug
```

**A slug is always lowercase ASCII alphanumeric with internal hyphens.** Anything fully numeric is *not* a slug (it's a numeric segment, even if the variant happens to be Size=1). Anything containing uppercase letters or non-hyphen punctuation is *not* a slug.

The simplest disambiguation rule: **if a segment starts with a letter and the segment after it (if any) is also a letter-starting slug, the trailing segment is probably a variant slug.** When in doubt, prefer the name-prefix interpretation first; fall back to variant-slug interpretation only if that fails.

---

## The two resolution paths

### Path A — name-prefix match (the common case)

Used for every layer that has a name starting with `<ID>` followed by `.`, space, dash, colon, or end-of-string.

**Algorithm:**

```
function resolveByName(rootNode, fullId):
    candidates = []
    walk every descendant of rootNode (depth-first or breadth-first; order doesn't matter)
        prefix = detectPrefix(node.name)               # see "What counts as a prefix" below
        if prefix == fullId:
            candidates.push(node)
    if candidates.length == 1: return candidates[0]
    if candidates.length == 0: return null
    if candidates.length > 1:
        # The convention is violated — multiple layers with the same prefix.
        # Report the ambiguity rather than guessing.
        return AmbiguityError(candidates)
```

The name-prefix path works uniformly for SECTIONs, FRAMEs, INSTANCEs, COMPONENTs, and COMPONENT_SETs — anything whose layer name carries the prefix. SECTIONs in particular: the section's own name is the source of truth (e.g. `"A1. Bullet placholder <DialogContent>"`), so an ID like `A1` resolves directly via name-prefix match.

### Path B — variant slug resolution

Used when:
- The ID ends in a slug segment (letter-starting, hyphenated or single-word, not purely numeric).
- The prefix segments before that slug resolve to a `COMPONENT_SET` (or a SECTION/FRAME that *contains* a single COMPONENT_SET whose variants are being referenced).

**Algorithm:**

```
function resolveVariantSlug(fullId):
    parts = fullId.split(".")
    slug = parts[parts.length - 1]
    parentId = parts.slice(0, -1).join(".")

    parent = resolveByName(page, parentId)
    if parent == null: return null

    # If parent IS a COMPONENT_SET, look at its variants directly.
    componentSet = null
    if parent.type == "COMPONENT_SET":
        componentSet = parent
    elif parent.type == "SECTION" or parent.type == "FRAME":
        # COMPONENT_SET may be unprefixed inside the parent.
        # Take the single COMPONENT_SET descendant if there's exactly one.
        sets = findDescendants(parent, type: "COMPONENT_SET")
        if sets.length == 1: componentSet = sets[0]

    if componentSet == null: return null

    # Slug-match the variants
    for variant in componentSet.children where variant.type == "COMPONENT":
        props = variant.variantProperties
        if props == null: continue
        builtSlug = slugifyVariantProperties(props)
        if builtSlug == slug: return variant
        # Allow a "shortened" match: each property value slugged to first
        # 1–3 words. If the requested slug matches any variant uniquely at
        # 1-word granularity, that's the answer.

    return null
```

The slug-build function used by the skill is **adaptive** — it picks the smallest word count (1, 2, or 3 per property value) that keeps all slugs in the set unique. When resolving, try the same adaptive approach: 1-word slugs first, then 2-word, then 3-word.

If the slug is purely numeric (e.g., `A1.3`), it's a **numeric fallback slug** — used when the skill couldn't produce unique alphanumeric slugs. Resolve it by taking the *n*-th COMPONENT child of the set in document order (1-indexed).

---

## How the markers appear on the canvas (FYI — not needed for resolution)

The skill marks prefixed layers with **native Figma annotations** rather than separate child layers. The annotation pin sits next to the layer (Figma chooses the exact position; the skill can't override it). The pin color comes from the annotation's category:

- **Blue** — `Position` category. Default for every prefixed candidate.
- **Red** — `Suspicious` category. Used by the skill for `image-only` suspicions on FRAME/RECTANGLE, and available for the user to manually flag any frame.
- **Orange** — `Missing info` category. Available for the user to flag frames that need more design work.

**SECTIONs are not annotated** (the Figma API doesn't expose annotations on SECTION/GROUP nodes). The section's own name renders as a label at the top of the section on the canvas, which serves the same purpose for a recorder.

---

## The data-attribute round-trip

When you call `get_design_context` on an annotated frame, each annotation surfaces as a data attribute:

- `data-position-annotations="B3"` — a regular position marker
- `data-suspicious-annotations="B3"` — a position marker the user (or the skill) categorized as suspicious
- `data-missing-info-annotations="B3"` — a position marker categorized as needing more design work
- `data-suspicious-annotations="Suspicion / image-only"` — a suspicion annotation added automatically by the skill

The attribute key tells you the category (and therefore the visual state); the attribute value is the label.

For resolution, the data attribute is a *hint*, not the authoritative source. **The authoritative source remains the layer's name** — `data-name="A1. Bullet placeholder..."` matched by prefix. Use the annotation data attribute when you want extra context (e.g. "this frame was flagged Suspicious — there may be quality issues here").

---

## What counts as a "prefix" in a layer name

A prefix is the substring at the start of a layer's name, terminated by `.`, space, dash, colon, or end-of-string. Specifically the regex used:

```
^([A-Za-z]?\d+(?:\.\d+)*|[A-Za-z](?:\.\d+)+)(?=[\s.\-:]|$)
```

…plus a single-letter fallback when followed by `.`, `-`, or `:`:

```
^([A-Za-z])(?=[.\-:])
```

Matches (this is what counts as a prefix):
- `1` from `1. Foo`
- `1.2` from `1.2 Foo`
- `1.2.3` from `1.2.3 - Foo`
- `A` from `A. Foo`
- `A1` from `A1. Foo`
- `A.1` from `A.1 Foo`
- `B` from `B - Foo`

Does *not* match:
- `Frame 1` (the leading letter is not followed by `.`, `-`, or `:`)
- `<Button>` (starts with `<`)
- `Bulletpiont toolbar` (no leading digit/single letter+separator)

---

## Worked examples

Given a Figma page with these layers:

```
PAGE "____ZOE TESTS"
├── SECTION "A. Bullet placholder dialog"          (prefix: A)
│   └── SECTION "A1. Bullet placholder <DialogContent>"  (prefix: A1)
│       └── COMPONENT_SET "Bullet point placeholder- <DialogContent>"
│           ├── COMPONENT (variantProperties: {Personalization status: "Initial"})
│           ├── COMPONENT (variantProperties: {Personalization status: "Message by audience selected"})
│           ├── COMPONENT (variantProperties: {Personalization status: "Personalization token in text field"})
│           └── COMPONENT (variantProperties: {Personalization status: "Choose media source is for..."})
├── SECTION "B. Bullet toolbar"                    (prefix: B)
│   ├── INSTANCE "B1. Bulletpiont toolbar"         (prefix: B1)
│   ├── INSTANCE "B2. Bulletpiont toolbar- view only"  (prefix: B2)
│   ├── INSTANCE "B3. Bullet toolbar <Menu>"       (prefix: B3)
│   └── INSTANCE "B4. Bullet toolbar <Menu> view only" (prefix: B4)
└── SECTION "C. Placeholders library"              (prefix: C)
```

### Example 1: `"Let's start with B."`

ID: `B`. Resolution: name-prefix match → the SECTION named `B. Bullet toolbar`.

### Example 2: `"In B1, the icon-size button."`

ID: `B1`. Resolution: name-prefix match → INSTANCE `B1. Bulletpiont toolbar`. The "icon-size button" is a *sub-element reference* — describe it from the instance's structured children rather than expecting a marker.

### Example 3: `"Now look at A1 in the initial state."`

ID: `A1.initial`. Resolution path:
1. Name-prefix match for `A1.initial` across the page → no layer matches (variant names carry their `variantProperties=Initial` style, not `A1.initial`).
2. Fall back to variant-slug interpretation. Parent ID = `A1`; resolveByName(`A1`) → SECTION `A1. Bullet placholder <DialogContent>`.
3. Parent is a SECTION, not a COMPONENT_SET. Look for COMPONENT_SET descendants of A1 → exactly one (`Bullet point placeholder- <DialogContent>`).
4. Walk the COMPONENT_SET's COMPONENT children. Build 1-word slugs from `variantProperties`. Match `initial` → the variant with `variantProperties: {Personalization status: "Initial"}`. Return that COMPONENT node.

### Example 4: `"The message-by-audience variant of A1."`

ID: `A1.message-by-audience` (the user may also pronounce it as just `A1.message` and intend the same thing). Resolution:
1. Try name-prefix match → no layer named `A1.message-by-audience.*`.
2. Variant-slug fallback. Parent ID `A1` → SECTION. One COMPONENT_SET inside. Slug `message-by-audience` matches the 3-word slug of `Message by audience selected`. Return that variant.
3. **Adaptive note:** the skill's slugger picks the shortest unique form, so it might have chosen `message` (1 word) over `message-by-audience` (3 words). Try both — the 1-word slug is the canonical annotation label, but the speaker may use either.

### Example 5: `"In B2, the third button from the left."`

ID: `B2`. Resolution: name-prefix match → INSTANCE `B2. Bulletpiont toolbar- view only`. "The third button from the left" is a sub-element — read the instance's structured children, identify buttons by their layer-tree order or by their content.

### Example 6: `"E dot six video duration"` (pronounced)

ID: `E.6`. Resolution: name-prefix match → SECTION `E.6 Video duration`. Note that `E.6` uses the alternate "letter.digit" style (most peers use `E1`/`E2`/`E3`); both styles are valid prefix forms.

---

## Edge cases and ambiguity

### Two layers with the same prefix
The convention is supposed to prevent this, but if it happens, the resolution is **ambiguous** and you should surface that — don't pick arbitrarily. Tell the user the prefix appears in N places.

### Speaker says a slug that doesn't exist
E.g., speaker says `A1.draft` but no variant slugs to `draft`. Try slug variations (1/2/3-word). If still no match:
- Look for a *partial match* (substring of a variant slug) and surface as a likely-meant suggestion.
- Otherwise report unresolved.

### Speaker drops the parent prefix
E.g., speaker is "inside" B and says "look at three" instead of "B3". Resolve via context — if the surrounding transcript established a parent, prepend it. Otherwise ask.

### Speaker says a number that doesn't follow the convention
E.g., speaker says `A2.7` but variant numbering uses slugs in this set (so the annotation label is `A2.editor-video`, not `A2.7`). Try both interpretations:
- Numeric → if `A2` is a COMPONENT_SET, take the 7th variant in document order.
- If that fails, look for an INSTANCE/FRAME named `A2.7. *` (the user might be referring to a future element they planned to add).

### Variant slug shadows a real name prefix
Rare but possible: a child of section A1 has the actual name `A1.message. Foo` (literally), AND a variant slug also resolves to `message`. **Name-prefix match wins** — the explicit layer name takes precedence over the variant slug interpretation.

---

## Suspicion annotations — what to do with them

In addition to position annotations (blue), the page may contain **Suspicious-category annotations** whose labels start with `Suspicion / ` followed by a reason (`image-only` or `empty-section`). They are **not walkthrough IDs**. The speaker should not be referring to them.

Treat them as follows when resolving a transcript:

- **Never** resolve a transcript reference as if it were a suspicion annotation. Suspicion annotations have no pronounceable ID.
- **Read them as a hint** about the underlying page health. If the section the speaker referred to has a Suspicious-category annotation labeled `Suspicion / empty-section`, that *explains* why structured introspection of that section returned no content. Surface this to the user: "the speaker said `E3` but section E3 is flagged as empty — there's no structured content there, only the section label."
- Note that `empty-section` suspicions appear in the skill's inventory output but are NOT visually marked on the canvas (SECTIONs don't support annotations). Image-only suspicions on FRAMEs/RECTANGLEs DO get a red annotation pin.

A speaker saying something like "as you can see in this tooltip" while pointing at an `image-only` layer is asking you to introspect a raster image. Don't try; tell the user the layer is a flat image and the underlying structure isn't represented in the file.

---

## Quick reference card

| You see in transcript | First resolution try | Fallback |
|---|---|---|
| `B` | name-prefix match `B.` | — |
| `B2` | name-prefix match `B2.` | — |
| `1.2.3` | name-prefix match `1.2.3.` or `1.2.3 ` etc | — |
| `A1.message` | name-prefix match `A1.message.` | variant slug `message` inside A1's COMPONENT_SET |
| `A1.3` | name-prefix match `A1.3.` | numeric variant (3rd COMPONENT in A1's COMPONENT_SET) |
| `E.6` | name-prefix match — letter.digit is valid | — |

Always prefer the name-prefix path. The variant-slug path is the fallback for IDs whose final segment is a letter-led slug AND the prefix-before-it resolves to a section/frame containing exactly one COMPONENT_SET, or directly to a COMPONENT_SET.
