// Figma Walkthrough Markers — single-file plugin script.
// Passed to `Figma:use_figma` as `code`. The skill substitutes the placeholders
// in the CONFIG block below before each invocation; CONFIG is the *only* thing
// it touches. Everything else stays as-is so re-runs share the prompt cache.
//
// `Figma:use_figma` wraps this in an async function, so top-level await + return
// are both supported.

const CONFIG = {
  // Required. Page node ID, or any descendant — we'll walk up to the page.
  // API form (colon-separated): "12345:678".
  nodeId: "{{NODE_ID}}",
  // "inventory" | "rename" | "mark" | "verify".
  mode: "{{MODE}}",
  // rename mode only. "auto" enumerates a section's unprefixed children and
  // assigns them next-available prefixes inheriting the section's scheme.
  // "explicit" takes a hand-built list of {nodeId, newPrefix} pairs.
  renameMode: "{{RENAME_MODE}}",
  // rename + auto. The SECTION whose unprefixed children should be numbered.
  renameTargetId: "{{RENAME_TARGET_ID}}",
  // rename + explicit. JSON list like [{"nodeId":"123:456","newPrefix":"B3"}].
  renameList: {{RENAME_LIST_JSON}},
  // rename. Default false (dry-run, returns what would change). Set true to apply.
  apply: {{APPLY}},
  // rename + auto. When true, also rewrite "weak-numeric" child prefixes to
  // strong extensions of the parent (e.g., child "2" under parent "B" → "B2").
  // Off by default — promotion changes user-typed names and is best opted into
  // explicitly per run, after the user reviews inventory's classification.
  promoteWeak: {{PROMOTE_WEAK}},
  // mark + COMPONENT_SET. "slug" derives variant sub-IDs from variantProperties
  // values (e.g. "A1.initial"); "numeric" uses sequential numbers
  // (e.g. "A1.1", "A1.2"). "slug" auto-falls-back to "numeric" per-set when the
  // computed slugs exceed budget or collide.
  variantNaming: "{{VARIANT_NAMING}}",
  // inventory + mark. When true (default), also detect layers that look UI-ish
  // to a human but carry no resolvable structure for Claude (e.g., a raster
  // image labelled "Tooltip on the fallback i icon", or a prefixed but empty
  // SECTION). Surfaces them in inventory and, in mark, drops a Suspicious-
  // category annotation on each one that supports annotations.
  flagSuspicions: {{FLAG_SUSPICIONS}},
};

// ─── Prefix detection ──────────────────────────────────────────────────────
// What counts as a "valid prefix" at the start of a layer name:
//   - Numeric: "1", "1.2", "1.2.3"
//   - Letter+digit (optionally dotted): "A1", "A1.2", "A1.2.3"
//   - Letter.digit: "A.1", "A.1.2"
//   - Single bare letter, but only if directly followed by a structural
//     separator (. - :) — so "A. Bullet dialog" matches as "A" but
//     "A quick fix" does NOT (the space alone is too weak a signal).
// The prefix must be followed by [.\s\-:] or end-of-string to count.

function detectPrefix(name) {
  if (!name) return null;
  let m = name.match(/^([A-Za-z]?\d+(?:\.\d+)*|[A-Za-z](?:\.\d+)+)(?=[\s.\-:]|$)/);
  if (m) return m[1];
  m = name.match(/^([A-Za-z])(?=[.\-:])/);
  if (m) return m[1];
  return null;
}

// Strip a known prefix off the front of a name, returning the rest, trimmed of
// the immediate separator (so "1.2. Foo" with prefix "1.2" returns "Foo").
function stripPrefix(name, prefix) {
  if (!name || !prefix) return name;
  if (!name.startsWith(prefix)) return name;
  let rest = name.slice(prefix.length);
  rest = rest.replace(/^[\s.\-:]+/, "");
  return rest;
}

// Classify a child's prefix in the context of its parent's prefix.
//
//   "strong"        child prefix strictly extends parent prefix
//                   (e.g., parent "B" + child "B2", or parent "1.2" + child "1.2.3")
//   "weak-numeric"  child is a bare integer (e.g., "2") inside a letter-keyed
//                   parent (e.g., "B") — most likely a partial prefix the user
//                   typed without thinking about the path
//   "weak-other"    has a prefix but doesn't fit either case — e.g. child
//                   "X1" inside parent "B". Flag for the user, don't auto-promote.
//   "unprefixed"    no prefix detected
//   "root"          parent has no prefix (page-level child) — any prefix is "strong"
function classifyPrefix(childPrefix, basePrefix) {
  if (!childPrefix) return "unprefixed";
  if (!basePrefix) return "root";
  if (childPrefix === basePrefix) return "strong"; // same prefix as parent — rare but OK
  if (childPrefix.startsWith(basePrefix)) {
    // Must be followed by a separator (. or .digit) to be a true extension
    const rest = childPrefix.slice(basePrefix.length);
    if (/^\.?[A-Za-z0-9]/.test(rest)) return "strong";
    return "weak-other";
  }
  // base is letter-only, child is bare numeric → most common "weak" case
  if (/^[A-Za-z]$/.test(basePrefix) && /^\d+$/.test(childPrefix)) return "weak-numeric";
  // base is numeric (e.g., "1.2"), child is bare numeric (e.g., "3") — treat as weak-numeric
  if (/^\d+(?:\.\d+)*$/.test(basePrefix) && /^\d+$/.test(childPrefix)) return "weak-numeric";
  return "weak-other";
}

// Given a basePrefix and a trailing number, build the next strong prefix.
// "Letter-only base joins without a dot" matches file-2 convention.
function buildStrongPrefix(basePrefix, n) {
  if (!basePrefix) return String(n);
  if (/^[A-Za-z]$/.test(basePrefix)) return `${basePrefix}${n}`;
  return `${basePrefix}.${n}`;
}

// ─── Variant slug generation ───────────────────────────────────────────────
// Variant annotations reference COMPONENT children of a COMPONENT_SET,
// identified by their variantProperties values (e.g. {"Personalization status":
// "Initial"}).
//
// We don't rename variants — Figma derives their variantProperties from the
// name, so a rename can break the variant system. Instead the annotation on
// the variant carries the sub-ID as its label, and Claude resolves transcripts
// → variants by matching the slug back to a variant's property values. See
// docs/figma-walkthrough-id-resolution.md.

// Lowercase, hyphenate, keep first 3 words, cap at 25 chars.
function slugVariantValue(value, maxWords = 3, maxLen = 25) {
  let s = String(value || "").toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const words = s.split("-").filter(Boolean);
  if (words.length === 0) return "";
  let acc = "";
  let count = 0;
  for (const w of words) {
    if (count >= maxWords) break;
    const next = acc ? `${acc}-${w}` : w;
    if (next.length > maxLen) break;
    acc = next;
    count++;
  }
  return acc || words[0].slice(0, maxLen);
}

// Compute a slug per variant. Returns Map<variantId, slug>. Adaptive: tries
// 1-word slugs first (shortest, most pronounceable); if any two collide,
// expands to 2 words, then 3. Falls back to numeric when even the 3-word
// version collides, has an empty entry, or any slug exceeds the budget.
function computeVariantSlugs(variants, scheme) {
  const result = new Map();
  if (!variants || variants.length === 0) return result;
  if (scheme === "numeric") {
    variants.forEach((v, i) => result.set(v.id, String(i + 1)));
    return result;
  }
  function buildSlugsAt(wordCount, maxLen) {
    return variants.map(v => {
      let props = null;
      try { props = v.variantProperties || null; } catch (e) { props = null; }
      if (!props) return null;
      const keys = Object.keys(props);
      if (keys.length === 0) return null;
      return keys.map(k => slugVariantValue(props[k], wordCount, maxLen)).filter(Boolean).join(".");
    });
  }
  for (const wordCount of [1, 2, 3]) {
    const slugs = buildSlugsAt(wordCount, 30);
    if (slugs.some(s => !s)) continue;
    if (slugs.some(s => s.length > 30)) continue;
    if (new Set(slugs).size !== slugs.length) continue;
    variants.forEach((v, i) => result.set(v.id, slugs[i]));
    return result;
  }
  variants.forEach((v, i) => result.set(v.id, String(i + 1)));
  return result;
}

// ─── Annotation categories ─────────────────────────────────────────────────
// Three skill-managed categories. They're created on first run if absent and
// reused on subsequent runs (idempotent by label — the Figma Plugin API has
// no method to delete or rename a category, so we always check before adding).
//
//   "Position"     blue   — default for every prefixed candidate
//   "Suspicious"   red    — for the skill's suspicion annotations, and for
//                            user-flagged frames (manual re-categorization)
//   "Missing info" orange — created but unused by the skill itself; available
//                            in Figma's category dropdown for the user to flag
//                            frames that need more design work
//
// When Claude later reads the design via `get_design_context`, each annotation
// surfaces as `data-<category-label-lowercased-with-spaces-as-dashes>-annotations="<label>"`,
// e.g. `data-position-annotations="B3"`, `data-suspicious-annotations="B3"`,
// `data-missing-info-annotations="B3"`. The category half of the attribute key
// is the visible signal that lets downstream Claude treat suspicious or missing-
// info frames differently from plain position references.

const SKILL_CATEGORIES = [
  { key: "position",   label: "Position",     color: "blue"   },
  { key: "suspicious", label: "Suspicious",   color: "red"    },
  { key: "missing",    label: "Missing info", color: "orange" }
];

// Label prefix used by THIS SKILL on annotations that flag a layer as
// suspicious. Distinct from a position-marker label (which is just the
// prefix string like "B3" or "A1.initial"). The label after the slash is one
// of the known reasons in SUSP_REASONS.
const SUSP_LABEL_PREFIX = "Suspicion / ";
const SUSP_REASONS = new Set(["image-only", "empty-section"]);

// Legacy on-canvas chip layer-name prefix from the previous chip-based version
// of this skill. The script removes any chip layer with these prefixes during
// the migration so annotations don't coexist with leftover chips.
const LEGACY_POSITION_CHIP_PREFIX = "Position Marker / ";
const LEGACY_SUSPICION_CHIP_PREFIX = "Suspicion / ";
// Legacy plugin-data namespaces used by the chip-based version. We don't
// actively clear them — the chip nodes that carried them get removed entirely,
// which orphans the plugin data into nothingness.
// "wt_markers" — position chip targetId pointers
// "wt_susp"    — suspicion marker targetId/reason pointers

// ─── Page traversal ────────────────────────────────────────────────────────
// "Markable" node types — the ones whose names we treat as the taxonomy AND
// that support Figma annotations.
//
// SECTION and GROUP nodes are NOT in this set because the Figma API does not
// expose `annotations` on those types ("no such property 'annotations' on
// SECTION/GROUP node"). The walker still descends THROUGH sections so their
// FRAME/INSTANCE/etc. children get marked, and section prefixes still serve
// as the "base" for child path-extension; sections just don't get markers of
// their own. (Their names render on the canvas above the section header and
// surface to `get_design_context` as `data-name="..."`, which is enough for
// both the recorder and downstream Claude.)
//
// COMPONENT children of a COMPONENT_SET (variants) are handled separately in
// the walker — they take annotations directly on the variant node, so the
// chip-placement gymnastics from the previous version are no longer needed.
const MARKABLE_TYPES = new Set(["FRAME", "INSTANCE", "COMPONENT", "COMPONENT_SET"]);

// Leaf node types (RECTANGLE, VECTOR, TEXT, ELLIPSE, ...) throw on `.children`
// access. Only container types expose children safely.
const CONTAINER_TYPES = new Set([
  "PAGE", "FRAME", "COMPONENT", "COMPONENT_SET", "INSTANCE", "GROUP",
  "SECTION", "BOOLEAN_OPERATION",
]);
function safeChildren(n) {
  if (!n || !CONTAINER_TYPES.has(n.type)) return [];
  try { return n.children || []; } catch (e) { return []; }
}
function safeFills(n) {
  try { return Array.isArray(n.fills) ? n.fills : []; } catch (e) { return []; }
}
function safeLayoutMode(n) {
  try { return n.layoutMode || null; } catch (e) { return null; }
}

// Walk the page collecting candidates per the depth contract:
//   - Descend through SECTIONs without limit (organizational, never a candidate).
//   - At the first non-section MARKABLE node, list it and stop descending
//     unless it has a prefix (in which case descend one more level so sub-
//     numbering shows).
//   - GROUPs are walked through (to find FRAMEs inside) but never listed.
//   - Never descend into an INSTANCE — its internals belong to the component.
function collectCandidates(page) {
  const out = [];
  function findBasePrefix(n) {
    let p = n.parent;
    while (p && p.type !== "PAGE") {
      const pp = detectPrefix(p.name);
      if (pp) return pp;
      p = p.parent;
    }
    return "";
  }
  const variantScheme = CONFIG.variantNaming || "slug";

  function visit(node, depth, descendOverride) {
    for (const child of safeChildren(node)) {
      // SECTION: transparent — walk through, never a candidate.
      if (child.type === "SECTION") { visit(child, depth, false); continue; }
      // GROUP: transparent — walk through, never a candidate.
      if (child.type === "GROUP") { visit(child, depth, false); continue; }
      // Skip anything else not in the markable set.
      if (!MARKABLE_TYPES.has(child.type)) continue;
      // Skip legacy chip layers — they're FRAMEs but represent the previous
      // marker mechanism, not user content.
      if (isLegacyChip(child) || isLegacySuspicionChip(child)) continue;

      const prefix = detectPrefix(child.name);
      out.push({ node: child, prefix, depth });

      // COMPONENT_SET: enumerate variants as their own candidates, but don't
      // descend with the generic rule below (variants aren't "inside" for our
      // purposes — they're enumerated and stopped at).
      if (child.type === "COMPONENT_SET") {
        const variants = safeChildren(child).filter(c => c.type === "COMPONENT");
        if (variants.length > 0) {
          const csPrefix = prefix || findBasePrefix(child);
          const slugs = computeVariantSlugs(variants, variantScheme);
          for (const v of variants) {
            const slug = slugs.get(v.id);
            if (!slug) continue;
            const variantPrefix = csPrefix ? `${csPrefix}.${slug}` : slug;
            out.push({
              node: v, prefix: variantPrefix, depth: depth + 1,
              isVariant: true, componentSetId: child.id, slug,
            });
          }
        }
        continue;
      }

      const canDescend = (descendOverride && child.type !== "INSTANCE")
        || (!!prefix && child.type !== "INSTANCE");
      if (canDescend) visit(child, depth + 1, false);
    }
  }
  visit(page, 0, false);
  return out;
}

// ─── Suspicion detection ───────────────────────────────────────────────────
// Two recurring "looks UI-ish but has nothing for Claude to resolve" cases:
//   1. image-only: a RECTANGLE/FRAME with an IMAGE fill, named like a UI
//      element (e.g. "Tooltip on the fallback i icon"). To Claude this is
//      an opaque raster — no text, no children, no interaction structure.
//   2. empty-section: a prefixed SECTION with no real children. The chip
//      works, the ID resolves, but the resolved node yields nothing.
//
// Detection is unchanged from the chip-based version. What's different is
// HOW we mark them: image-only suspicions get an annotation directly on the
// suspicious FRAME/RECTANGLE; empty-section suspicions are reported in
// inventory but NOT marked, because SECTIONs don't support annotations.
function detectSuspicion(node) {
  if (node.type === "RECTANGLE" || node.type === "FRAME") {
    const fills = safeFills(node);
    if (fills.some(f => f.type === "IMAGE")) {
      return { reason: "image-only", message: "IMAGE — no structure" };
    }
  }
  if (node.type === "SECTION") {
    const prefix = detectPrefix(node.name);
    if (prefix) {
      const real = safeChildren(node).filter(c => !isLegacyChip(c) && !isLegacySuspicionChip(c));
      if (real.length === 0) {
        return { reason: "empty-section", message: "EMPTY SECTION — no content" };
      }
    }
  }
  return null;
}

function collectSuspicions(page) {
  const out = [];
  function visit(node, depth) {
    for (const child of safeChildren(node)) {
      if (isLegacyChip(child) || isLegacySuspicionChip(child)) continue;
      const s = detectSuspicion(child);
      if (s) out.push({ node: child, ...s });
      const shouldDescend = child.type === "SECTION"
        || child.type === "COMPONENT_SET"
        || (child.type === "FRAME" && depth < 3);
      if (shouldDescend) visit(child, depth + 1);
    }
  }
  visit(page, 0);
  return out;
}

// ─── Legacy chip detection (for migration cleanup) ─────────────────────────
function isLegacyChip(node) {
  return node && node.name && node.name.startsWith(LEGACY_POSITION_CHIP_PREFIX);
}
function isLegacySuspicionChip(node) {
  return node && node.name && node.name.startsWith(LEGACY_SUSPICION_CHIP_PREFIX);
}

// Walk the page removing every legacy chip layer (Position Marker / *) and
// every legacy chip-style suspicion marker (Suspicion / *). Returns the
// number of nodes removed. Safe to run repeatedly — the recursive walk skips
// containers it can't read into.
function removeLegacyChips(page) {
  let removed = 0;
  // Collect first, then remove (don't mutate while iterating).
  const toRemove = [];
  function visit(node) {
    for (const child of safeChildren(node)) {
      if (isLegacyChip(child) || isLegacySuspicionChip(child)) {
        toRemove.push(child);
        continue; // don't descend into chips
      }
      if (child.type !== "INSTANCE") visit(child);
    }
  }
  visit(page);
  for (const n of toRemove) {
    try { n.remove(); removed++; } catch (e) { /* swallow */ }
  }
  return removed;
}

// ─── Annotation helpers ────────────────────────────────────────────────────

// Figma fills BOTH `label` and `labelMarkdown` on read but rejects both on
// write. When re-passing existing annotations through a frame.annotations = []
// reset, strip down to whichever was the source of truth.
function preserveAnnotation(a) {
  const out = {};
  if (a.labelMarkdown && a.labelMarkdown.length > 0) out.labelMarkdown = a.labelMarkdown;
  else out.label = (a.label || "");
  if (a.categoryId) out.categoryId = a.categoryId;
  if (a.properties && a.properties.length > 0) out.properties = a.properties;
  return out;
}

function nodeSupportsAnnotations(node) {
  return node && "annotations" in node;
}

// Position-annotation label test: is THIS label one our skill owns as a
// position marker? Rule: not a suspicion label, and is exactly a valid
// prefix-like string (regular prefix OR variant slug).
function isPositionLabel(label) {
  if (!label) return false;
  const trimmed = label.trim();
  if (!trimmed) return false;
  if (trimmed.startsWith(SUSP_LABEL_PREFIX)) return false;
  // Variant slug: <base>.<slug>[.<slug>]*  where slug starts with [a-z]
  // and is followed by [a-z0-9-]
  // Example: "A1.initial", "B2.editor-video.template"
  if (/^([A-Za-z]?\d+(?:\.\d+)*|[A-Za-z](?:\.\d+)+|[A-Za-z])(?:\.[a-z][a-z0-9-]*)+$/.test(trimmed)) return true;
  // Plain prefix: A, B3, 1, 1.2, A1.2, A.1, A.1.2 etc.
  if (/^([A-Za-z]?\d+(?:\.\d+)*|[A-Za-z](?:\.\d+)+|[A-Za-z])$/.test(trimmed)) return true;
  return false;
}

// Suspicion-annotation label test: starts with "Suspicion / " AND the trailing
// reason is one of the skill's known reasons. (User-created annotations in
// the Suspicious category with custom labels are left alone.)
function parseSuspicionLabel(label) {
  if (!label) return null;
  const trimmed = label.trim();
  if (!trimmed.startsWith(SUSP_LABEL_PREFIX)) return null;
  const reason = trimmed.slice(SUSP_LABEL_PREFIX.length).trim();
  if (!SUSP_REASONS.has(reason)) return null;
  return reason;
}

// ─── Resolve the starting page ─────────────────────────────────────────────
let startNode = await figma.getNodeByIdAsync(CONFIG.nodeId);
if (!startNode) return { error: "Node not found", nodeId: CONFIG.nodeId };
let page = startNode;
while (page && page.type !== "PAGE") page = page.parent;
if (!page) return { error: "Could not find a parent page from the provided node" };

// ─── Ensure skill categories exist (only when writing) ─────────────────────
async function ensureSkillCategories() {
  const cats = await figma.annotations.getAnnotationCategoriesAsync();
  const byLabel = {};
  const created = [];
  for (const spec of SKILL_CATEGORIES) {
    let cat = cats.find(c => c.label === spec.label);
    if (!cat) {
      cat = await figma.annotations.addAnnotationCategoryAsync({
        label: spec.label, color: spec.color
      });
      created.push({ label: spec.label, color: spec.color, id: cat.id });
    }
    byLabel[spec.label] = cat.id;
  }
  return { byLabel, created };
}

// Read-only equivalent for inventory/verify — just look up which of our
// categories already exist; don't create.
async function readSkillCategories() {
  const cats = await figma.annotations.getAnnotationCategoriesAsync();
  const byLabel = {};
  for (const spec of SKILL_CATEGORIES) {
    const cat = cats.find(c => c.label === spec.label);
    byLabel[spec.label] = cat ? cat.id : null;
  }
  return { byLabel };
}

// ─── Mode: inventory ───────────────────────────────────────────────────────
if (CONFIG.mode === "inventory") {
  const candidates = collectCandidates(page);
  const { byLabel: catByLabel } = await readSkillCategories();
  const skillCategoryIds = new Set(Object.values(catByLabel).filter(Boolean));

  function findBasePrefix(node) {
    let p = node.parent;
    while (p && p.type !== "PAGE") {
      const pp = detectPrefix(p.name);
      if (pp) return pp;
      p = p.parent;
    }
    return "";
  }

  // Compute marker status for each prefixed candidate. With annotations there
  // are no separate "chip" layers — the marker is the annotation on the node
  // itself, so there's no concept of "orphan markers" (a missing target node
  // means the annotation is gone too).
  const rows = candidates.map(({ node, prefix, depth, isVariant, componentSetId, slug }) => {
    let markerStatus = "n/a";
    let markerCategory = null;
    if (prefix && nodeSupportsAnnotations(node)) {
      const anns = (node.annotations || []).filter(a => skillCategoryIds.has(a.categoryId));
      const owned = anns.filter(a => {
        const lbl = (a.label || "").trim();
        return isPositionLabel(lbl);
      });
      if (owned.length === 0) markerStatus = "missing";
      else if (owned.length > 1) markerStatus = "duplicate";
      else {
        const lbl = (owned[0].label || "").trim();
        markerStatus = (lbl === prefix) ? "correct" : "wrong";
        // Figure out which of our categories holds this annotation.
        for (const [label, id] of Object.entries(catByLabel)) {
          if (id && owned[0].categoryId === id) { markerCategory = label; break; }
        }
      }
    }
    const basePrefix = findBasePrefix(node);
    const classification = classifyPrefix(prefix, basePrefix);
    return {
      id: node.id, type: node.type, name: node.name, depth,
      prefix, basePrefix: basePrefix || null, classification,
      markerStatus, markerCategory,
      ...(isVariant ? { isVariant: true, componentSetId, slug } : {}),
    };
  });

  // Count any legacy chip layers still lingering on the page so the user
  // knows a migration is pending. Don't actually remove them in inventory —
  // inventory is read-only.
  let legacyChipsRemaining = 0;
  let legacySuspicionChipsRemaining = 0;
  (function walk(n) {
    for (const c of safeChildren(n)) {
      if (isLegacyChip(c)) { legacyChipsRemaining++; continue; }
      if (isLegacySuspicionChip(c)) { legacySuspicionChipsRemaining++; continue; }
      if (c.type !== "INSTANCE") walk(c);
    }
  })(page);

  const summary = {
    candidates: candidates.length,
    prefixed: rows.filter(r => r.prefix).length,
    unprefixed: rows.filter(r => !r.prefix).length,
    strong: rows.filter(r => r.classification === "strong" || r.classification === "root").length,
    weakNumeric: rows.filter(r => r.classification === "weak-numeric").length,
    weakOther: rows.filter(r => r.classification === "weak-other").length,
    markerMissing: rows.filter(r => r.markerStatus === "missing").length,
    markerCorrect: rows.filter(r => r.markerStatus === "correct").length,
    markerWrong: rows.filter(r => r.markerStatus === "wrong").length,
    markerDuplicate: rows.filter(r => r.markerStatus === "duplicate").length,
    legacyChipsRemaining,
    legacySuspicionChipsRemaining,
    skillCategoriesPresent: Object.fromEntries(
      Object.entries(catByLabel).map(([k, v]) => [k, !!v])
    ),
  };

  const weakRows = rows.filter(r => r.classification === "weak-numeric" || r.classification === "weak-other");

  let suspicions = [];
  if (CONFIG.flagSuspicions !== false) {
    suspicions = collectSuspicions(page).map(s => ({
      id: s.node.id, type: s.node.type, name: s.node.name,
      reason: s.reason, message: s.message,
      parentId: s.node.parent ? s.node.parent.id : null,
      parentName: s.node.parent ? s.node.parent.name : null,
      markable: nodeSupportsAnnotations(s.node),
    }));
    summary.suspicions = suspicions.length;
    summary.suspicionsUnmarkable = suspicions.filter(s => !s.markable).length;
  }

  return { mode: "inventory", pageName: page.name, summary, rows, weakRows, suspicions };
}

// ─── Mode: verify ──────────────────────────────────────────────────────────
if (CONFIG.mode === "verify") {
  const candidates = collectCandidates(page);
  const { byLabel: catByLabel } = await readSkillCategories();
  const skillCategoryIds = new Set(Object.values(catByLabel).filter(Boolean));
  let correct = 0, missing = 0, wrong = 0, duplicate = 0, unprefixed = 0;
  for (const { node, prefix } of candidates) {
    if (!prefix) { unprefixed++; continue; }
    if (!nodeSupportsAnnotations(node)) { missing++; continue; }
    const owned = (node.annotations || []).filter(a =>
      skillCategoryIds.has(a.categoryId) && isPositionLabel(a.label || "")
    );
    if (owned.length === 0) missing++;
    else if (owned.length > 1) duplicate++;
    else if ((owned[0].label || "").trim() === prefix) correct++;
    else wrong++;
  }
  return {
    mode: "verify", pageName: page.name,
    total: candidates.length, unprefixed, correct, missing, wrong, duplicate,
  };
}

// ─── Mode: rename ──────────────────────────────────────────────────────────
// Unchanged from the previous version — annotations are independent of names,
// and renames just edit the underlying layer name. (After a rename, run `mark`
// to resync annotations.)
if (CONFIG.mode === "rename") {
  if (CONFIG.renameMode === "auto") {
    const target = await figma.getNodeByIdAsync(CONFIG.renameTargetId);
    if (!target) return { error: "rename target not found", id: CONFIG.renameTargetId };
    const targetPrefix = detectPrefix(target.name);
    // Direct non-section children of `target`. We exclude SECTION as before
    // (auto-rename is one-section-at-a-time), and we now also exclude GROUP
    // since it's no longer a markable type.
    const children = safeChildren(target)
      .filter(c => MARKABLE_TYPES.has(c.type) && c.type !== "SECTION" && !isLegacyChip(c));
    children.sort((a, b) => {
      const dy = (a.y ?? 0) - (b.y ?? 0);
      if (Math.abs(dy) > 1) return dy;
      const dx = (a.x ?? 0) - (b.x ?? 0);
      if (Math.abs(dx) > 1) return dx;
      return 0;
    });

    const basePrefix = targetPrefix || "";
    function trailingNumber(childPrefix) {
      if (!childPrefix) return null;
      if (basePrefix && childPrefix.startsWith(basePrefix)) {
        const rest = childPrefix.slice(basePrefix.length).replace(/^\./, "");
        const n = parseInt(rest, 10);
        return Number.isFinite(n) ? n : null;
      }
      if (/^\d+$/.test(childPrefix)) return parseInt(childPrefix, 10);
      return null;
    }

    const annotated = children.map(c => {
      const existing = detectPrefix(c.name);
      const cls = classifyPrefix(existing, basePrefix);
      return { node: c, existing, cls };
    });

    const taken = new Set();
    for (const a of annotated) {
      if (a.cls === "strong" || a.cls === "root") {
        const n = trailingNumber(a.existing);
        if (n !== null) taken.add(n);
      } else if (a.cls === "weak-numeric" && CONFIG.promoteWeak) {
        const n = trailingNumber(a.existing);
        if (n !== null) taken.add(n);
      }
    }

    let next = 1;
    function nextNumber() {
      while (taken.has(next)) next++;
      const n = next;
      taken.add(n);
      next++;
      return n;
    }

    const proposed = [];
    for (const a of annotated) {
      const { node, existing, cls } = a;
      if (cls === "strong" || cls === "root") {
        proposed.push({ id: node.id, type: node.type, oldName: node.name, newName: node.name, prefix: existing, action: "skip-strong", classification: cls });
        continue;
      }
      if (cls === "weak-numeric" && CONFIG.promoteWeak) {
        const n = trailingNumber(existing);
        const newPrefix = buildStrongPrefix(basePrefix, n);
        const stripped = stripPrefix(node.name, existing);
        const newName = `${newPrefix}. ${stripped}`.trim();
        proposed.push({ id: node.id, type: node.type, oldName: node.name, newName, prefix: newPrefix, action: "promote", classification: cls });
        continue;
      }
      if (cls === "weak-numeric" && !CONFIG.promoteWeak) {
        proposed.push({ id: node.id, type: node.type, oldName: node.name, newName: node.name, prefix: existing, action: "skip-weak-numeric", classification: cls, hint: "Run with promoteWeak: true to rewrite this as a strong prefix." });
        continue;
      }
      if (cls === "weak-other") {
        proposed.push({ id: node.id, type: node.type, oldName: node.name, newName: node.name, prefix: existing, action: "skip-weak-other", classification: cls, hint: "Prefix doesn't extend parent. Resolve via explicit rename." });
        continue;
      }
      const n = nextNumber();
      const newPrefix = buildStrongPrefix(basePrefix, n);
      const newName = `${newPrefix}. ${node.name}`.trim();
      proposed.push({ id: node.id, type: node.type, oldName: node.name, newName, prefix: newPrefix, action: "rename", classification: cls });
    }

    if (!CONFIG.apply) {
      return { mode: "rename", dryRun: true, targetName: target.name, basePrefix: basePrefix || null, promoteWeak: !!CONFIG.promoteWeak, proposed };
    }
    const applied = [];
    const errors = [];
    for (const p of proposed) {
      if (p.action !== "rename" && p.action !== "promote") { applied.push(p); continue; }
      try {
        const node = await figma.getNodeByIdAsync(p.id);
        if (!node) throw new Error("node disappeared");
        node.name = p.newName;
        applied.push({ ...p, action: p.action === "promote" ? "promoted" : "renamed" });
      } catch (e) {
        errors.push({ id: p.id, error: String(e) });
      }
    }
    return { mode: "rename", dryRun: false, targetName: target.name, promoteWeak: !!CONFIG.promoteWeak, applied, errors };
  }

  if (CONFIG.renameMode === "explicit") {
    const list = Array.isArray(CONFIG.renameList) ? CONFIG.renameList : [];
    const proposed = [];
    for (const entry of list) {
      const node = await figma.getNodeByIdAsync(entry.nodeId);
      if (!node) { proposed.push({ ...entry, action: "missing" }); continue; }
      const existing = detectPrefix(node.name);
      const stripped = existing ? stripPrefix(node.name, existing) : node.name;
      const newName = `${entry.newPrefix}. ${stripped}`.trim();
      proposed.push({ id: node.id, type: node.type, oldName: node.name, newName, prefix: entry.newPrefix, action: existing ? "replace" : "rename" });
    }
    if (!CONFIG.apply) return { mode: "rename", dryRun: true, mode2: "explicit", proposed };
    const applied = [];
    const errors = [];
    for (const p of proposed) {
      if (p.action === "missing") { errors.push({ id: p.nodeId, error: "node not found" }); continue; }
      try {
        const node = await figma.getNodeByIdAsync(p.id);
        node.name = p.newName;
        applied.push({ ...p, action: p.action === "replace" ? "replaced" : "renamed" });
      } catch (e) {
        errors.push({ id: p.id, error: String(e) });
      }
    }
    return { mode: "rename", dryRun: false, mode2: "explicit", applied, errors };
  }

  return { error: "rename requires renameMode 'auto' or 'explicit'" };
}

// ─── Mode: mark ────────────────────────────────────────────────────────────
if (CONFIG.mode === "mark") {
  const { byLabel: catByLabel, created: categoriesCreated } = await ensureSkillCategories();
  const skillCategoryIds = new Set(Object.values(catByLabel));
  const positionCategoryId = catByLabel.Position;
  const suspiciousCategoryId = catByLabel.Suspicious;

  // Migrate: remove every legacy chip layer (Position Marker / *) and chip-
  // style suspicion marker (Suspicion / *) from the page. Annotations replace
  // them.
  const legacyChipsRemoved = removeLegacyChips(page);

  const candidates = collectCandidates(page);
  const prefixed = candidates.filter(c => c.prefix);

  // Fast-path. Every prefixed, annotation-supporting candidate already has a
  // single skill-owned annotation whose label matches its prefix → no writes.
  // (Categories may have just been created on this run, in which case we
  // can't possibly be in sync — categoriesCreated.length > 0 breaks the fast
  // path.)
  let allInSync = prefixed.length > 0
    && legacyChipsRemoved === 0
    && categoriesCreated.length === 0;
  for (const { node, prefix } of prefixed) {
    if (!nodeSupportsAnnotations(node)) continue; // SECTION/GROUP — not markable
    const owned = (node.annotations || []).filter(a =>
      skillCategoryIds.has(a.categoryId) && isPositionLabel(a.label || "")
    );
    if (owned.length !== 1) { allInSync = false; break; }
    const lbl = (owned[0].label || "").trim();
    if (lbl !== prefix) { allInSync = false; break; }
  }

  const created = [];
  const updated = [];
  const unchanged = [];
  const deduped = [];
  const skipped = []; // node-type doesn't support annotations
  const errors = [];

  if (!allInSync) {
    for (const { node, prefix } of prefixed) {
      try {
        if (!nodeSupportsAnnotations(node)) {
          skipped.push({ id: node.id, type: node.type, name: node.name, prefix, reason: "annotations not supported on this node type" });
          continue;
        }
        const all = node.annotations || [];
        const owned = all.filter(a =>
          skillCategoryIds.has(a.categoryId) && isPositionLabel(a.label || "")
        );
        const others = all.filter(a => !owned.includes(a)).map(preserveAnnotation);

        if (owned.length === 0) {
          node.annotations = [...others, { label: prefix, categoryId: positionCategoryId }];
          created.push({ name: node.name, prefix, category: "Position" });
          continue;
        }
        // Keep first owned; remove duplicates.
        const ours = owned[0];
        const ourCategory = ours.categoryId;
        const ourCurrentLabel = (ours.label || "").trim();
        if (owned.length > 1) {
          deduped.push({ name: node.name, removed: owned.length - 1 });
        }
        if (ourCurrentLabel === prefix && owned.length === 1) {
          unchanged.push({ name: node.name, prefix });
          continue;
        }
        // Replace owned: keep first slot with correct label + preserved category.
        node.annotations = [...others, { label: prefix, categoryId: ourCategory }];
        if (ourCurrentLabel !== prefix) {
          updated.push({ name: node.name, from: ourCurrentLabel, to: prefix });
        }
      } catch (e) {
        errors.push({ name: node.name, error: String(e) });
      }
    }
  }

  // ─── Suspicion annotations ──────────────────────────────────────────────
  const suspCreated = [];
  const suspUpdated = [];
  const suspUnchanged = [];
  const suspRemoved = [];
  const suspSkipped = [];
  const suspErrors = [];

  if (CONFIG.flagSuspicions !== false) {
    const suspicions = collectSuspicions(page);
    const stillSuspiciousIds = new Map(suspicions.map(s => [s.node.id, s.reason]));

    // Orphan cleanup: walk all annotation-supporting nodes; if any have a
    // skill-owned suspicion annotation but the node is no longer suspicious,
    // remove that annotation (preserve other annotations on the same node).
    (function walk(n) {
      for (const c of safeChildren(n)) {
        if (isLegacyChip(c) || isLegacySuspicionChip(c)) continue;
        if (nodeSupportsAnnotations(c)) {
          const anns = c.annotations || [];
          const ourSusp = anns.filter(a =>
            a.categoryId === suspiciousCategoryId &&
            parseSuspicionLabel(a.label || "") !== null
          );
          if (ourSusp.length > 0) {
            const stillReason = stillSuspiciousIds.get(c.id);
            if (!stillReason) {
              try {
                const remaining = anns.filter(a => !ourSusp.includes(a)).map(preserveAnnotation);
                c.annotations = remaining;
                suspRemoved.push({ name: c.name, removed: ourSusp.length });
              } catch (e) {
                suspErrors.push({ name: c.name, error: "orphan remove failed: " + String(e) });
              }
            }
          }
        }
        if (c.type !== "INSTANCE") walk(c);
      }
    })(page);

    // Apply suspicions to currently-suspicious nodes that support annotations.
    for (const s of suspicions) {
      try {
        if (!nodeSupportsAnnotations(s.node)) {
          suspSkipped.push({ id: s.node.id, type: s.node.type, name: s.node.name, reason: s.reason, message: "annotations not supported on this node type" });
          continue;
        }
        const targetLabel = SUSP_LABEL_PREFIX + s.reason;
        const all = s.node.annotations || [];
        const ourSusp = all.filter(a =>
          a.categoryId === suspiciousCategoryId &&
          parseSuspicionLabel(a.label || "") !== null
        );
        const others = all.filter(a => !ourSusp.includes(a)).map(preserveAnnotation);
        if (ourSusp.length === 0) {
          s.node.annotations = [...others, { label: targetLabel, categoryId: suspiciousCategoryId }];
          suspCreated.push({ name: s.node.name, reason: s.reason });
          continue;
        }
        const ours = ourSusp[0];
        const ourLabel = (ours.label || "").trim();
        if (ourLabel === targetLabel && ourSusp.length === 1) {
          suspUnchanged.push({ name: s.node.name, reason: s.reason });
          continue;
        }
        s.node.annotations = [...others, { label: targetLabel, categoryId: suspiciousCategoryId }];
        suspUpdated.push({ name: s.node.name, reason: s.reason });
      } catch (e) {
        suspErrors.push({ name: s.node.name, error: String(e) });
      }
    }
  }

  return {
    mode: "mark", pageName: page.name,
    totalCandidates: prefixed.length,
    createdCount: created.length,
    updatedCount: updated.length,
    unchangedCount: unchanged.length,
    dedupedCount: deduped.length,
    skippedCount: skipped.length,
    legacyChipsRemovedCount: legacyChipsRemoved,
    categoriesCreated,
    errorCount: errors.length,
    created, updated, unchanged, deduped, skipped, errors,
    suspicions: {
      createdCount: suspCreated.length,
      updatedCount: suspUpdated.length,
      unchangedCount: suspUnchanged.length,
      removedCount: suspRemoved.length,
      skippedCount: suspSkipped.length,
      errorCount: suspErrors.length,
      created: suspCreated, updated: suspUpdated, unchanged: suspUnchanged,
      removed: suspRemoved, skipped: suspSkipped, errors: suspErrors,
    },
    ...(allInSync ? { inSync: true } : {}),
  };
}

return { error: "unknown mode", mode: CONFIG.mode };
