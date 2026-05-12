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
  // SECTION). Surfaces them in inventory and, in mark, drops a distinctive
  // amber "Suspicion" marker on each so a human can review before recording.
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
// Variant chips reference COMPONENT children of a COMPONENT_SET, identified by
// their variantProperties values (e.g. {"Personalization status":"Initial"}).
//
// We don't rename variants — Figma derives their variantProperties from the
// name, so a rename can break the variant system. Instead the chip carries the
// sub-ID as its visible label, and Claude resolves transcripts → variants by
// matching the slug back to a variant's property values. See
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
  // scheme === "slug": build adaptive property-value slugs
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
  // Fallback to numeric
  variants.forEach((v, i) => result.set(v.id, String(i + 1)));
  return result;
}

// ─── Page traversal ────────────────────────────────────────────────────────
// "Markable" node types — the ones whose names we treat as the taxonomy. We
// deliberately exclude SYMBOL (variant defs inside a component set) — those
// proliferate by combinatorics and aren't the user's own layers.
const MARKABLE_TYPES = new Set(["FRAME", "INSTANCE", "SECTION", "COMPONENT", "COMPONENT_SET", "GROUP"]);

// Walk the page collecting candidates per the depth contract:
//   - Descend through SECTIONs without limit (organizational).
//   - At the first non-section node, list it and stop descending unless it has
//     a prefix (in which case descend one more level so sub-numbering shows).
//   - Never descend into an INSTANCE — its internals belong to the component.
async function collectCandidates(page) {
  const out = [];
  // Walk up `node` to find the nearest prefixed ancestor's prefix, used as
  // the base for variant chip IDs when the COMPONENT_SET itself is unprefixed.
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
      if (!MARKABLE_TYPES.has(child.type)) continue;
      if (isChip(child) || isSuspicionMarker(child)) continue;
      const prefix = detectPrefix(child.name);
      out.push({ node: child, prefix, depth });

      // Special case: a COMPONENT_SET's children are its variants. Enumerate
      // them, give them computed prefixes, then DON'T fall through to the
      // generic descent (we don't want to walk inside the variants themselves).
      if (child.type === "COMPONENT_SET") {
        const variants = safeChildren(child).filter(c => c.type === "COMPONENT");
        if (variants.length > 0) {
          // Effective base: COMPONENT_SET's own prefix if it has one, else the
          // nearest prefixed ancestor's prefix.
          const csPrefix = prefix || findBasePrefix(child);
          const slugs = computeVariantSlugs(variants, variantScheme);
          for (const v of variants) {
            const slug = slugs.get(v.id);
            if (!slug) continue;
            // Variant prefix = base + "." + slug. (Always dot-separated because
            // slugs are alphanumeric and can't be confused with letter+digit.)
            const variantPrefix = csPrefix ? `${csPrefix}.${slug}` : slug;
            out.push({
              node: v, prefix: variantPrefix, depth: depth + 1,
              isVariant: true, componentSetId: child.id, slug,
            });
          }
        }
        continue; // skip the generic-descent rule below
      }

      const canDescend = child.type === "SECTION"
        || (descendOverride && child.type !== "INSTANCE")
        || (!!prefix && child.type !== "INSTANCE");
      if (canDescend) visit(child, depth + 1, /*descendOverride*/ false);
    }
  }
  visit(page, 0, false);
  return out;
}

// ─── Chip styling + plugin-data namespace ──────────────────────────────────
const BG = { r: 0.310, g: 0.275, b: 0.898 }; // #4F46E5 indigo
const FG = { r: 1, g: 1, b: 1 };
const FONT = { family: "Inter", style: "Bold" };
const FONT_SIZE = 20;
const PADDING_X = 14;
const PADDING_Y = 8;
const CORNER_RADIUS = 999;
const GAP = 4;
const MARKER_PREFIX = "Position Marker / ";
const NS = "wt_markers"; // shared-plugin-data namespace (>=3 chars, alphanum/_/.)

function chipDisplayName(prefix) { return MARKER_PREFIX + prefix; }

function isChip(node) {
  return node.name && node.name.startsWith(MARKER_PREFIX);
}

// ─── Suspicion markers ─────────────────────────────────────────────────────
// A separate visual class from position chips. These mark layers that *look*
// like content to a human but offer nothing for Claude to resolve — a raster
// image labelled like a UI element, or a prefixed-but-empty section. The
// marker color and shape are intentionally different so the two never get
// confused on the canvas or in inventory.
const SUSP_BG = { r: 0.961, g: 0.620, b: 0.043 }; // #F59E0B amber
const SUSP_BORDER = { r: 0.722, g: 0.420, b: 0.000 }; // #B86B00
const SUSP_FG = { r: 1, g: 1, b: 1 };
const SUSP_FONT_SIZE = 18;
const SUSP_PADDING_X = 20;
const SUSP_PADDING_Y = 12;
const SUSP_CORNER = 8;
const SUSP_PREFIX = "Suspicion / ";
const SUSP_NS = "wt_susp";

function isSuspicionMarker(node) {
  return node.name && node.name.startsWith(SUSP_PREFIX);
}

function safeFills(n) {
  try { return Array.isArray(n.fills) ? n.fills : []; } catch (e) { return []; }
}

// Categorize a node as suspicious if any of the rules below hits. Returns
// null when the node is fine.
function detectSuspicion(node) {
  // Rule: image-fill rectangle or frame masquerading as content
  if (node.type === "RECTANGLE" || node.type === "FRAME") {
    const fills = safeFills(node);
    if (fills.some(f => f.type === "IMAGE")) {
      return {
        reason: "image-only",
        message: "IMAGE — no structure",
      };
    }
  }
  // Rule: prefixed section with no real children
  if (node.type === "SECTION") {
    const prefix = detectPrefix(node.name);
    if (prefix) {
      const real = safeChildren(node).filter(c => !isChip(c) && !isSuspicionMarker(c));
      if (real.length === 0) {
        return {
          reason: "empty-section",
          message: "EMPTY SECTION — no content",
        };
      }
    }
  }
  return null;
}

// Walk the page collecting suspicions. We descend through SECTIONs and
// COMPONENT_SETs (and FRAMEs only at shallow depth) but never into INSTANCEs
// (those internals are the component definition, not user-authored layers).
function collectSuspicions(page) {
  const out = [];
  function visit(node, depth) {
    for (const child of safeChildren(node)) {
      if (isChip(child) || isSuspicionMarker(child)) continue;
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

function createSuspicionMarker(reason, message) {
  const m = figma.createFrame();
  m.name = SUSP_PREFIX + reason;
  m.layoutMode = "HORIZONTAL";
  m.primaryAxisSizingMode = "AUTO";
  m.counterAxisSizingMode = "AUTO";
  m.paddingLeft = SUSP_PADDING_X;
  m.paddingRight = SUSP_PADDING_X;
  m.paddingTop = SUSP_PADDING_Y;
  m.paddingBottom = SUSP_PADDING_Y;
  m.cornerRadius = SUSP_CORNER;
  m.fills = [{ type: "SOLID", color: SUSP_BG }];
  m.strokes = [{ type: "SOLID", color: SUSP_BORDER }];
  m.strokeWeight = 2;
  const t = figma.createText();
  t.fontName = FONT;
  t.characters = `⚠  ${message}`;
  t.fontSize = SUSP_FONT_SIZE;
  t.fills = [{ type: "SOLID", color: SUSP_FG }];
  m.appendChild(t);
  return m;
}

// Suspicion markers can't live inside a RECTANGLE (no children) or a
// COMPONENT_SET (only COMPONENT children). Walk up past those to find the
// nearest writable ancestor — usually the enclosing SECTION.
function suspicionHostFor(node) {
  let host = node.parent;
  while (host && (
    host.type === "INSTANCE" ||
    host.type === "COMPONENT_SET" ||
    !CONTAINER_TYPES.has(host.type)
  )) {
    host = host.parent;
  }
  return host || null;
}

function findSuspicionMarkerFor(node) {
  const host = suspicionHostFor(node);
  if (!host) return null;
  for (const c of safeChildren(host)) {
    if (!isSuspicionMarker(c)) continue;
    if (c.getSharedPluginData(SUSP_NS, "targetId") === node.id) return c;
  }
  return null;
}

// Some node types throw on property access rather than returning undefined.
// Wrap any potentially-unsupported read behind a try/catch.
function safeLayoutMode(n) {
  try { return n.layoutMode || null; } catch (e) { return null; }
}
function safeClipsContent(n) {
  try { return !!n.clipsContent; } catch (e) { return false; }
}
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

// ─── Resolve the starting page ─────────────────────────────────────────────
let startNode = await figma.getNodeByIdAsync(CONFIG.nodeId);
if (!startNode) return { error: "Node not found", nodeId: CONFIG.nodeId };
let page = startNode;
while (page && page.type !== "PAGE") page = page.parent;
if (!page) return { error: "Could not find a parent page from the provided node" };

// Inventory and verify are read-only; mark and rename mutate.
const writeModes = new Set(["mark", "rename"]);
const needsFont = new Set(["mark"]);
if (needsFont.has(CONFIG.mode)) {
  try { await figma.loadFontAsync(FONT); }
  catch (e) { return { error: `Could not load font ${FONT.family} ${FONT.style}: ${String(e)}` }; }
}

// ─── Mode: inventory ───────────────────────────────────────────────────────
// Read-only audit. Returns a tree-like list of candidates with prefix + chip
// status so the user can decide which layers need renaming or chipping.
if (CONFIG.mode === "inventory") {
  const candidates = await collectCandidates(page);

  // Index chips so we can report on already-chipped candidates.
  // We collect chips from the whole page tree so orphan chips surface too.
  const allChips = [];
  (function collect(n) {
    for (const c of safeChildren(n)) {
      if (isChip(c)) {
        const targetId = c.getSharedPluginData(NS, "targetId") || null;
        allChips.push({ chip: c, targetId, prefixOnChip: c.name.slice(MARKER_PREFIX.length).trim() });
      }
      if (c.type !== "INSTANCE") collect(c);
    }
  })(page);

  // For each candidate determine chip status + classification relative to its
  // nearest *prefixed* ancestor (the "base" for path-extension comparison).
  function findBasePrefix(node) {
    let p = node.parent;
    while (p && p.type !== "PAGE") {
      const pp = detectPrefix(p.name);
      if (pp) return pp;
      p = p.parent;
    }
    return "";
  }
  const rows = candidates.map(({ node, prefix, depth }) => {
    let chipStatus = "n/a";
    let chipsForThis = [];
    if (prefix) {
      chipsForThis = allChips.filter(ch => ch.targetId === node.id);
      if (chipsForThis.length === 0) {
        const insideChips = safeChildren(node).filter(isChip);
        const sibChips = safeChildren(node.parent).filter(isChip);
        const matchByText = (chips) => chips.filter(c => c.name.slice(MARKER_PREFIX.length).trim() === prefix);
        chipsForThis = matchByText(insideChips).concat(matchByText(sibChips));
      }
      if (chipsForThis.length === 0) chipStatus = "missing";
      else if (chipsForThis.length > 1) chipStatus = "duplicate";
      else if (chipsForThis[0].prefixOnChip === prefix) chipStatus = "correct";
      else chipStatus = "wrong";
    }
    const basePrefix = findBasePrefix(node);
    const classification = classifyPrefix(prefix, basePrefix);
    return {
      id: node.id, type: node.type, name: node.name, depth,
      prefix, basePrefix: basePrefix || null, classification, chipStatus,
    };
  });

  // Orphan chips: chips whose targetId no longer resolves to a candidate.
  const candidateIds = new Set(candidates.map(c => c.node.id));
  const orphans = allChips
    .filter(ch => ch.targetId && !candidateIds.has(ch.targetId))
    .map(ch => ({ id: ch.chip.id, name: ch.chip.name, parentName: ch.chip.parent ? ch.chip.parent.name : null }));

  const summary = {
    candidates: candidates.length,
    prefixed: rows.filter(r => r.prefix).length,
    unprefixed: rows.filter(r => !r.prefix).length,
    strong: rows.filter(r => r.classification === "strong" || r.classification === "root").length,
    weakNumeric: rows.filter(r => r.classification === "weak-numeric").length,
    weakOther: rows.filter(r => r.classification === "weak-other").length,
    chipMissing: rows.filter(r => r.chipStatus === "missing").length,
    chipCorrect: rows.filter(r => r.chipStatus === "correct").length,
    chipWrong: rows.filter(r => r.chipStatus === "wrong").length,
    chipDuplicate: rows.filter(r => r.chipStatus === "duplicate").length,
    orphanChips: orphans.length,
  };

  // Surface weak prefixes explicitly — these are the cases most likely to
  // cause walkthrough-time ambiguity.
  const weakRows = rows.filter(r => r.classification === "weak-numeric" || r.classification === "weak-other");

  // Surface suspicions (image-only layers, empty prefixed sections, etc.).
  let suspicions = [];
  if (CONFIG.flagSuspicions !== false) {
    suspicions = collectSuspicions(page).map(s => ({
      id: s.node.id, type: s.node.type, name: s.node.name,
      reason: s.reason, message: s.message,
      parentId: s.node.parent ? s.node.parent.id : null,
      parentName: s.node.parent ? s.node.parent.name : null,
    }));
    summary.suspicions = suspicions.length;
  }

  return { mode: "inventory", pageName: page.name, summary, rows, weakRows, suspicions, orphans };
}

// ─── Mode: verify ──────────────────────────────────────────────────────────
// Lightweight summary used after a mark-mode timeout to confirm state without
// risking a concurrent write run.
if (CONFIG.mode === "verify") {
  const candidates = await collectCandidates(page);
  let correct = 0, missing = 0, wrong = 0, duplicate = 0, unprefixed = 0;
  for (const { node, prefix } of candidates) {
    if (!prefix) { unprefixed++; continue; }
    const insideChips = safeChildren(node).filter(isChip);
    const sibChips = safeChildren(node.parent).filter(isChip);
    const linked = insideChips.concat(sibChips).filter(c => c.getSharedPluginData(NS, "targetId") === node.id);
    const byText = insideChips.concat(sibChips).filter(c => c.name.slice(MARKER_PREFIX.length).trim() === prefix);
    const chips = linked.length ? linked : byText;
    if (chips.length === 0) missing++;
    else if (chips.length > 1) duplicate++;
    else if (chips[0].name.slice(MARKER_PREFIX.length).trim() === prefix) correct++;
    else wrong++;
  }
  return {
    mode: "verify", pageName: page.name,
    total: candidates.length, unprefixed, correct, missing, wrong, duplicate,
  };
}

// ─── Mode: rename ──────────────────────────────────────────────────────────
// Two flavors:
//   auto:     given a SECTION, enumerate its unprefixed non-section children
//             and assign each a next-available prefix inheriting the section's
//             scheme (e.g. section "1.2" → children "1.2.1", "1.2.2", ...).
//             If the section has no prefix and its parent does, inherit from
//             the parent and start a new level.
//   explicit: rename each (nodeId, newPrefix) pair in renameList.
// Default dry-run (apply=false) returns the proposed renames without writing.
if (CONFIG.mode === "rename") {
  if (CONFIG.renameMode === "auto") {
    const target = await figma.getNodeByIdAsync(CONFIG.renameTargetId);
    if (!target) return { error: "rename target not found", id: CONFIG.renameTargetId };
    const targetPrefix = detectPrefix(target.name);
    // Children to consider: direct non-section children of `target`, excluding
    // any chips the skill owns. We don't recurse — auto-rename is intentionally
    // one-section-at-a-time so the user stays in control of where numbering happens.
    const children = safeChildren(target)
      .filter(c => MARKABLE_TYPES.has(c.type) && c.type !== "SECTION" && !isChip(c));
    // Visual order: top-to-bottom, then left-to-right.
    children.sort((a, b) => {
      const dy = (a.y ?? 0) - (b.y ?? 0);
      if (Math.abs(dy) > 1) return dy;
      const dx = (a.x ?? 0) - (b.x ?? 0);
      if (Math.abs(dx) > 1) return dx;
      return 0;
    });

    const basePrefix = targetPrefix || "";
    // Classify each child, build a slot-reservation set from prefixes that are
    // (or will become) strong extensions of basePrefix.
    function trailingNumber(childPrefix) {
      if (!childPrefix) return null;
      if (basePrefix && childPrefix.startsWith(basePrefix)) {
        const rest = childPrefix.slice(basePrefix.length).replace(/^\./, "");
        const n = parseInt(rest, 10);
        return Number.isFinite(n) ? n : null;
      }
      if (/^\d+$/.test(childPrefix)) return parseInt(childPrefix, 10); // bare numeric
      return null;
    }

    // Two-pass approach: first reserve trailing numbers from strong + (if
    // promoting) weak-numeric children, then assign next-available to the rest.
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
        proposed.push({
          id: node.id, type: node.type, oldName: node.name, newName: node.name,
          prefix: existing, action: "skip-strong", classification: cls,
        });
        continue;
      }
      if (cls === "weak-numeric" && CONFIG.promoteWeak) {
        const n = trailingNumber(existing); // already in taken
        const newPrefix = buildStrongPrefix(basePrefix, n);
        const stripped = stripPrefix(node.name, existing);
        const newName = `${newPrefix}. ${stripped}`.trim();
        proposed.push({
          id: node.id, type: node.type, oldName: node.name, newName,
          prefix: newPrefix, action: "promote", classification: cls,
        });
        continue;
      }
      if (cls === "weak-numeric" && !CONFIG.promoteWeak) {
        proposed.push({
          id: node.id, type: node.type, oldName: node.name, newName: node.name,
          prefix: existing, action: "skip-weak-numeric",
          classification: cls,
          hint: "Run with promoteWeak: true to rewrite this as a strong prefix.",
        });
        continue;
      }
      if (cls === "weak-other") {
        proposed.push({
          id: node.id, type: node.type, oldName: node.name, newName: node.name,
          prefix: existing, action: "skip-weak-other",
          classification: cls,
          hint: "Prefix doesn't extend parent. Resolve via explicit rename.",
        });
        continue;
      }
      // unprefixed → assign next available
      const n = nextNumber();
      const newPrefix = buildStrongPrefix(basePrefix, n);
      const newName = `${newPrefix}. ${node.name}`.trim();
      proposed.push({
        id: node.id, type: node.type, oldName: node.name, newName,
        prefix: newPrefix, action: "rename", classification: cls,
      });
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
    if (!CONFIG.apply) {
      return { mode: "rename", dryRun: true, mode2: "explicit", proposed };
    }
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
// Idempotent chip sync. For each prefixed candidate, ensure exactly one chip
// is present, correctly named, and correctly anchored.
//
// Placement strategy by candidate type:
//   - SECTION / FRAME / COMPONENT / COMPONENT_SET / GROUP → chip is CHILD of
//     the candidate, positioned just outside its left edge at y=0.
//   - INSTANCE → chip is a SIBLING (child of nearest writable ancestor),
//     positioned at (candidate.x - chipW - gap, candidate.y) in parent coords.
//     Instances reject appendChild, so child placement is impossible there.
//
// Tracking: every chip stores `targetId` in shared plugin data (namespace
// "wt_markers") pointing back to the candidate. This lets re-sync find the
// chip even if its name went out of date or the candidate moved.

if (CONFIG.mode === "mark") {
  const candidates = await collectCandidates(page);
  const prefixed = candidates.filter(c => c.prefix);

  // Fast-path: every prefixed candidate already has a single correctly-named
  // chip wired up via plugin data → return without writing.
  let allInSync = prefixed.length > 0;
  for (const { node, prefix } of prefixed) {
    const chips = findChipsForCandidate(node);
    if (chips.length !== 1) { allInSync = false; break; }
    if (chips[0].name.slice(MARKER_PREFIX.length).trim() !== prefix) { allInSync = false; break; }
  }
  if (allInSync) {
    return {
      mode: "mark", pageName: page.name,
      totalCandidates: prefixed.length,
      createdCount: 0, updatedCount: 0, unchangedCount: prefixed.length,
      dedupedCount: 0, clippedCount: 0, errorCount: 0, inSync: true,
    };
  }

  const created = [];
  const updated = [];
  const unchanged = [];
  const dedupedFrames = [];
  const clippedFrames = [];
  const errors = [];

  for (const { node, prefix } of prefixed) {
    try {
      let chips = findChipsForCandidate(node);
      // Dedup: keep the first, remove the rest.
      if (chips.length > 1) {
        for (let i = 1; i < chips.length; i++) chips[i].remove();
        dedupedFrames.push({ frame: node.name, removed: chips.length - 1 });
        chips = chips.slice(0, 1);
      }
      const existing = chips[0];

      const placement = chipPlacementFor(node);
      if (!placement) {
        errors.push({ frame: node.name, error: "no writable ancestor for chip placement" });
        continue;
      }

      if (existing) {
        const currentText = existing.name.slice(MARKER_PREFIX.length).trim();
        if (currentText === prefix) {
          // Re-anchor in case the candidate moved.
          reanchor(existing, node, placement);
          unchanged.push({ frame: node.name, prefix });
          continue;
        }
        existing.name = chipDisplayName(prefix);
        const txt = safeChildren(existing).find(c => c.type === "TEXT");
        if (txt) txt.characters = prefix;
        existing.setSharedPluginData(NS, "targetId", node.id);
        reanchor(existing, node, placement);
        updated.push({ frame: node.name, from: currentText, to: prefix });
      } else {
        const chip = createChip(prefix);
        placement.host.appendChild(chip);
        chip.setSharedPluginData(NS, "targetId", node.id);
        const hostLM = safeLayoutMode(placement.host);
        if (hostLM && hostLM !== "NONE") chip.layoutPositioning = "ABSOLUTE";
        reanchor(chip, node, placement);
        if (safeClipsContent(placement.host)) clippedFrames.push(placement.host.name);
        created.push({ frame: node.name, prefix, placement: placement.kind });
      }
    } catch (e) {
      errors.push({ frame: node.name, error: String(e) });
    }
  }

  // ─── Suspicion markers ───────────────────────────────────────────────
  // Same idempotency model: find existing by plugin-data targetId, create
  // missing, update if the reason changed, remove orphan markers whose target
  // is no longer suspicious.
  const suspCreated = [];
  const suspUpdated = [];
  const suspUnchanged = [];
  const suspRemoved = [];
  const suspErrors = [];
  if (CONFIG.flagSuspicions !== false) {
    const suspicions = collectSuspicions(page);
    const stillSuspiciousIds = new Set(suspicions.map(s => s.node.id));

    // Walk page for ALL existing suspicion markers, so we can remove orphans
    // whose targets are no longer suspicious (or no longer exist).
    const allMarkers = [];
    (function walk(n) {
      for (const c of safeChildren(n)) {
        if (isSuspicionMarker(c)) {
          const tid = c.getSharedPluginData(SUSP_NS, "targetId");
          allMarkers.push({ marker: c, targetId: tid });
        }
        if (c.type !== "INSTANCE") walk(c);
      }
    })(page);

    for (const m of allMarkers) {
      if (!m.targetId || !stillSuspiciousIds.has(m.targetId)) {
        try {
          const name = m.marker.name;
          m.marker.remove();
          suspRemoved.push({ markerName: name, targetId: m.targetId || null });
        } catch (e) {
          suspErrors.push({ id: m.marker.id, error: "remove failed: " + String(e) });
        }
      }
    }

    for (const s of suspicions) {
      try {
        const host = suspicionHostFor(s.node);
        if (!host) { suspErrors.push({ id: s.node.id, error: "no writable host for marker" }); continue; }
        const existing = findSuspicionMarkerFor(s.node);
        if (existing) {
          const currentReason = existing.getSharedPluginData(SUSP_NS, "reason");
          if (currentReason === s.reason) {
            // Re-anchor in case the target moved
            const pos = positionRelativeTo(s.node, host);
            if (pos) { existing.x = pos.x; existing.y = pos.y; }
            suspUnchanged.push({ targetName: s.node.name, reason: s.reason });
            continue;
          }
          // Reason changed → update name + plugin data + text
          existing.name = SUSP_PREFIX + s.reason;
          existing.setSharedPluginData(SUSP_NS, "reason", s.reason);
          const txt = safeChildren(existing).find(c => c.type === "TEXT");
          if (txt) txt.characters = `⚠  ${s.message}`;
          const pos = positionRelativeTo(s.node, host);
          if (pos) { existing.x = pos.x; existing.y = pos.y; }
          suspUpdated.push({ targetName: s.node.name, reason: s.reason });
          continue;
        }
        const marker = createSuspicionMarker(s.reason, s.message);
        host.appendChild(marker);
        marker.setSharedPluginData(SUSP_NS, "targetId", s.node.id);
        marker.setSharedPluginData(SUSP_NS, "reason", s.reason);
        const lm = safeLayoutMode(host);
        if (lm && lm !== "NONE") marker.layoutPositioning = "ABSOLUTE";
        const pos = positionRelativeTo(s.node, host);
        if (!pos) { suspErrors.push({ id: s.node.id, error: "could not compute position" }); continue; }
        marker.x = pos.x;
        marker.y = pos.y;
        suspCreated.push({ targetName: s.node.name, reason: s.reason });
      } catch (e) {
        suspErrors.push({ id: s.node.id, error: String(e) });
      }
    }
  }

  return {
    mode: "mark", pageName: page.name,
    totalCandidates: prefixed.length,
    createdCount: created.length,
    updatedCount: updated.length,
    unchangedCount: unchanged.length,
    dedupedCount: dedupedFrames.length,
    clippedCount: clippedFrames.length,
    errorCount: errors.length,
    created, updated, unchanged, dedupedFrames, clippedFrames, errors,
    suspicions: {
      createdCount: suspCreated.length,
      updatedCount: suspUpdated.length,
      unchangedCount: suspUnchanged.length,
      removedCount: suspRemoved.length,
      errorCount: suspErrors.length,
      created: suspCreated, updated: suspUpdated, unchanged: suspUnchanged,
      removed: suspRemoved, errors: suspErrors,
    },
  };
}

return { error: "unknown mode", mode: CONFIG.mode };

// ─── Helpers used by mark + (read-only) inventory/verify ───────────────────

// Find all chips that belong to `node` — first by plugin-data link, falling
// back to a name match within the same logical area (children for non-instance
// candidates, siblings for instances).
function findChipsForCandidate(node) {
  const out = [];
  // Where to look depends on placement kind for this node type.
  const placement = chipPlacementFor(node);
  const searchHost = placement ? placement.host : node.parent;
  const isSelfHost = placement && placement.kind === "child";
  for (const c of safeChildren(searchHost)) {
    if (!isChip(c)) continue;
    if (c.getSharedPluginData(NS, "targetId") === node.id) out.push(c);
  }
  // For child-placement, also check inside the node (in case a previous run
  // put the chip there — same case in practice, since host === node).
  if (isSelfHost && searchHost !== node) {
    for (const c of safeChildren(node)) {
      if (!isChip(c)) continue;
      if (c.getSharedPluginData(NS, "targetId") === node.id) out.push(c);
    }
  }
  if (out.length > 0) return out;
  // Plugin-data fallback by text match. Variants don't go through this path —
  // their chip text is a slug that the variant's name doesn't carry.
  const expected = detectPrefix(node.name);
  if (!expected) return out;
  const sameTextChips = (parent) => safeChildren(parent).filter(c => isChip(c) && c.name.slice(MARKER_PREFIX.length).trim() === expected);
  const candidates = sameTextChips(searchHost);
  for (const c of candidates) {
    c.setSharedPluginData(NS, "targetId", node.id);
    out.push(c);
  }
  return out;
}

// Decide where a chip for `node` should live and how it should be anchored.
// Returns { host, kind } where host is the node we'll appendChild on, plus
// (for sibling-style placements) any intermediate ancestors whose offsets
// must be accumulated when computing the chip's absolute position.
function chipPlacementFor(node) {
  if (node.type === "INSTANCE") {
    let host = node.parent;
    while (host && host.type === "INSTANCE") host = host.parent;
    if (!host) return null;
    return { host, kind: "sibling" };
  }
  // Variant component inside a COMPONENT_SET. Two facts force the placement:
  //   1. Modifying the variant (the master COMPONENT) propagates to all instances
  //      of that component — chips inside the variant are a non-starter.
  //   2. COMPONENT_SET rejects any child that isn't a COMPONENT — chips can't
  //      live inside the set either.
  // So the chip is placed in the *enclosing* writable ancestor (the SECTION
  // or FRAME above the COMPONENT_SET). Its position is offset by the set's
  // own coordinates within that ancestor.
  if (node.type === "COMPONENT" && node.parent && node.parent.type === "COMPONENT_SET") {
    let host = node.parent.parent;
    while (host && (host.type === "INSTANCE" || host.type === "COMPONENT_SET")) {
      host = host.parent;
    }
    if (!host) return null;
    return { host, kind: "variant-sibling" };
  }
  // Default: child placement.
  return { host: node, kind: "child" };
}

// Sum positions from `node` up to (but not including) `ancestor`. Lets us put
// a chip in `ancestor`'s coordinate space at the visual location of `node`.
function positionRelativeTo(node, ancestor) {
  let x = 0, y = 0;
  let cur = node;
  while (cur && cur !== ancestor) {
    x += cur.x ?? 0;
    y += cur.y ?? 0;
    cur = cur.parent;
  }
  if (cur !== ancestor) return null;
  return { x, y };
}

function reanchor(chip, node, placement) {
  const lm = placement.kind === "child" ? safeLayoutMode(node) : safeLayoutMode(placement.host);
  if (lm && lm !== "NONE" && chip.layoutPositioning !== "ABSOLUTE") {
    chip.layoutPositioning = "ABSOLUTE";
  }
  if (placement.kind === "child") {
    chip.x = -(chip.width + GAP);
    chip.y = 0;
    return;
  }
  if (placement.kind === "sibling") {
    chip.x = (node.x ?? 0) - chip.width - GAP;
    chip.y = (node.y ?? 0);
    return;
  }
  if (placement.kind === "variant-sibling") {
    const pos = positionRelativeTo(node, placement.host);
    if (!pos) return;
    chip.x = pos.x - chip.width - GAP;
    chip.y = pos.y;
    return;
  }
}

function createChip(prefix) {
  const chip = figma.createFrame();
  chip.name = chipDisplayName(prefix);
  chip.layoutMode = "HORIZONTAL";
  chip.primaryAxisSizingMode = "AUTO";
  chip.counterAxisSizingMode = "AUTO";
  chip.paddingLeft = PADDING_X;
  chip.paddingRight = PADDING_X;
  chip.paddingTop = PADDING_Y;
  chip.paddingBottom = PADDING_Y;
  chip.cornerRadius = CORNER_RADIUS;
  chip.fills = [{ type: "SOLID", color: BG }];
  const text = figma.createText();
  text.fontName = FONT;
  text.characters = prefix;
  text.fontSize = FONT_SIZE;
  text.fills = [{ type: "SOLID", color: FG }];
  text.letterSpacing = { value: 2, unit: "PERCENT" };
  chip.appendChild(text);
  return chip;
}
