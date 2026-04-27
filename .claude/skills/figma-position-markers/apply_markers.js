// Plugin code passed to the Figma:use_figma tool's `code` parameter.
// Before passing, replace {{NODE_ID}} with the API-format node ID
// (colon-separated, e.g. "20226:113394"). Top-level await and return are
// supported because Figma:use_figma wraps the code in an async function.

const STARTING_NODE_ID = "{{NODE_ID}}";

// ---- Style constants (edit to customize chip appearance) ----
const BG = { r: 0.310, g: 0.275, b: 0.898 }; // #4F46E5 indigo
const FG = { r: 1, g: 1, b: 1 };             // white
const FONT = { family: "Inter", style: "Bold" };
const FONT_SIZE = 20;
const PADDING_X = 14;
const PADDING_Y = 8;
const CORNER_RADIUS = 999; // pill
const GAP = 4;            // px between frame's left edge and chip's right edge
const MARKER_PREFIX = "Position Marker / ";
// Matches "1.1", "1.1.2", "12.3.45" at the start of a name, followed by a
// non-digit boundary so "1.1.2.3" is captured as "1.1.2".
const NUMBER_REGEX = /^(\d+\.\d+(?:\.\d+)?)\b/;
// -------------------------------------------------------------

let node = await figma.getNodeByIdAsync(STARTING_NODE_ID);
if (!node) return { error: "Node not found", nodeId: STARTING_NODE_ID };

// The provided node may be the page itself or any descendant — walk up to the page.
while (node && node.type !== "PAGE") node = node.parent;
if (!node) return { error: "Could not find a parent page from the provided node" };
const page = node;

try {
  await figma.loadFontAsync(FONT);
} catch (e) {
  return { error: `Could not load font ${FONT.family} ${FONT.style}: ${String(e)}` };
}

// Collect numbered frames. Recurse through SECTIONs (frames are usually
// grouped inside sections) but do not recurse into FRAMEs — numbered frames
// live at the section level, and their children are typically UI elements
// that happen to be frames.
const candidates = [];
function walk(n) {
  for (const child of n.children) {
    if (child.type === "SECTION") walk(child);
    else if (child.type === "FRAME") {
      const m = child.name.match(NUMBER_REGEX);
      if (m) candidates.push({ frame: child, number: m[1] });
    }
  }
}
walk(page);

// Fast read-only pre-check. If every candidate already has exactly one
// correctly-named marker, return immediately without doing any writes.
// This makes re-runs (e.g. after an MCP-side timeout where the previous
// invocation actually completed on Figma) finish in well under a second
// instead of re-walking the write loop.
let allInSync = candidates.length > 0;
for (const { frame, number } of candidates) {
  const markers = frame.children.filter(
    c => c.name && c.name.startsWith(MARKER_PREFIX)
  );
  if (markers.length !== 1
      || markers[0].name.slice(MARKER_PREFIX.length).trim() !== number) {
    allInSync = false;
    break;
  }
}
if (allInSync) {
  return {
    pageName: page.name,
    totalCandidates: candidates.length,
    createdCount: 0,
    updatedCount: 0,
    unchangedCount: candidates.length,
    dedupedCount: 0,
    clippedCount: 0,
    errorCount: 0,
    inSync: true
  };
}

const created = [];
const updated = [];
const unchanged = [];
const dedupedFrames = [];
const clippedFrames = [];
const errors = [];

for (const { frame, number } of candidates) {
  try {
    // Gather ALL existing markers in this frame, not just the first.
    // Concurrent or partially-failed prior runs (e.g. when the MCP client
    // times out but the Figma side keeps executing) can leave duplicates.
    // We keep the first chip and remove the rest, so re-runs are self-healing.
    const allMarkers = frame.children.filter(
      c => c.name && c.name.startsWith(MARKER_PREFIX)
    );
    const existing = allMarkers[0];
    if (allMarkers.length > 1) {
      for (let i = 1; i < allMarkers.length; i++) allMarkers[i].remove();
      dedupedFrames.push({ frame: frame.name, removed: allMarkers.length - 1 });
    }

    if (existing) {
      const current = existing.name.slice(MARKER_PREFIX.length).trim();
      if (current === number) {
        unchanged.push({ frame: frame.name, number });
        continue;
      }
      // Update marker name + text to match the (renamed) frame
      existing.name = MARKER_PREFIX + number;
      const text = existing.children.find(c => c.type === "TEXT");
      // Font is the same FONT we loaded at the top — no per-update reload.
      if (text) text.characters = number;
      // Make sure it stays absolutely positioned if the frame uses auto-layout
      if (frame.layoutMode && frame.layoutMode !== "NONE"
          && existing.layoutPositioning !== "ABSOLUTE") {
        existing.layoutPositioning = "ABSOLUTE";
      }
      // Re-anchor in case width changed
      existing.x = -(existing.width + GAP);
      existing.y = 0;
      updated.push({ frame: frame.name, from: current, to: number });
    } else {
      const chip = figma.createFrame();
      chip.name = MARKER_PREFIX + number;
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
      text.characters = number;
      text.fontSize = FONT_SIZE;
      text.fills = [{ type: "SOLID", color: FG }];
      text.letterSpacing = { value: 2, unit: "PERCENT" };
      chip.appendChild(text);

      frame.appendChild(chip);

      // Opt out of parent auto-layout so we can position the chip outside the
      // frame's bounds without it being arranged as a flow child.
      if (frame.layoutMode && frame.layoutMode !== "NONE") {
        chip.layoutPositioning = "ABSOLUTE";
      }
      chip.x = -(chip.width + GAP);
      chip.y = 0;

      if (frame.clipsContent) clippedFrames.push(frame.name);
      created.push({ frame: frame.name, number });
    }
  } catch (e) {
    errors.push({ frame: frame.name, error: String(e) });
  }
}

return {
  pageName: page.name,
  totalCandidates: candidates.length,
  createdCount: created.length,
  updatedCount: updated.length,
  unchangedCount: unchanged.length,
  dedupedCount: dedupedFrames.length,
  clippedCount: clippedFrames.length,
  errorCount: errors.length,
  created,
  updated,
  unchanged,
  dedupedFrames,
  clippedFrames,
  errors
};
