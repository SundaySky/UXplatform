#!/usr/bin/env node
// Captures DOM + screenshot from a single URL in headless Chromium.
// Writes: <out-dir>/<name>.png, <name>.html, <name>.meta.json
//
// CLI:
//   node capture.mjs \
//     --url <url> \
//     --name <prototype|real-app> \
//     --out-dir <absolute-dir> \
//     [--selector "<css>"]            region to capture DOM from (full page otherwise)
//     [--viewport 1440x900]           default 1440x900
//     [--wait-for "<css>"]            wait for this selector to be attached before capture
//     [--wait-ms <ms>]                additional idle wait after load (default 800)
//     [--click-sequence '<json>']     JSON array of {selector, waitAfterMs?} clicks before capture
//     [--reuse-state <path>]          path to a storageState.json (for authenticated sessions)
//
// Exit code 0 on success. Prints meta JSON to stdout.

import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

function parseArgs(argv) {
  const out = {};
  for (let i = 2; i < argv.length; i++) {
    const k = argv[i];
    if (!k.startsWith("--")) continue;
    const key = k.slice(2);
    const val = argv[i + 1];
    if (val === undefined || val.startsWith("--")) { out[key] = true; continue; }
    out[key] = val;
    i++;
  }
  return out;
}

const args = parseArgs(process.argv);
const required = ["url", "name", "out-dir"];
for (const r of required) {
  if (!args[r]) {
    console.error(`Missing required --${r}`);
    process.exit(2);
  }
}

const url = args.url;
const name = args.name;
const outDir = args["out-dir"];
const selector = args.selector || null;
const [vw, vh] = (args.viewport || "1440x900").split("x").map(Number);
const waitFor = args["wait-for"] || null;
const waitMs = Number(args["wait-ms"] ?? 800);
const clickSequenceRaw = args["click-sequence"] || null;
const reuseState = args["reuse-state"] || null;
const measureRaw = args["measure"] || null;

let clickSequence = [];
if (clickSequenceRaw) {
  try { clickSequence = JSON.parse(clickSequenceRaw); }
  catch (e) {
    console.error(`Invalid --click-sequence JSON: ${e.message}`);
    process.exit(2);
  }
}

let measureTargets = [];
if (measureRaw) {
  try { measureTargets = JSON.parse(measureRaw); }
  catch (e) {
    console.error(`Invalid --measure JSON: ${e.message}`);
    process.exit(2);
  }
}

await mkdir(outDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const contextOptions = { viewport: { width: vw, height: vh } };
if (reuseState && existsSync(reuseState)) contextOptions.storageState = reuseState;
const context = await browser.newContext(contextOptions);
const page = await context.newPage();

const consoleErrors = [];
page.on("console", (msg) => {
  if (msg.type() === "error") consoleErrors.push(msg.text());
});

let meta = {
  name,
  requestedUrl: url,
  finalUrl: null,
  viewport: { width: vw, height: vh },
  timestamp: new Date().toISOString(),
  selector,
  clickSequence,
  consoleErrorsCount: 0,
  ok: false,
  error: null,
};

try {
  await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });
  if (waitFor) {
    await page.waitForSelector(waitFor, { timeout: 15000 });
  }
  for (const step of clickSequence) {
    if (!step || !step.selector) continue;
    await page.waitForSelector(step.selector, { timeout: 10000 });
    await page.click(step.selector);
    if (step.waitAfterMs) await page.waitForTimeout(step.waitAfterMs);
  }
  if (waitMs > 0) await page.waitForTimeout(waitMs);

  meta.finalUrl = page.url();

  const screenshotPath = path.join(outDir, `${name}.png`);
  await page.screenshot({ path: screenshotPath, fullPage: true });

  let html;
  if (selector) {
    html = await page.$eval(selector, (el) => el.outerHTML).catch(() => null);
    if (html === null) {
      // Selector did not match — fall back to full document and record as a warning, not a fatal error.
      if (!Array.isArray(meta.warnings)) meta.warnings = [];
      meta.warnings.push(`selector did not match: ${selector}; falling back to full document`);
      html = await page.content();
    }
  } else {
    html = await page.content();
  }
  await writeFile(path.join(outDir, `${name}.html`), html, "utf8");

  if (measureTargets.length) {
    meta.measurements = await page.evaluate((targets) => {
      const out = [];
      for (const t of targets) {
        const els = document.querySelectorAll(t.selector);
        const el = t.index != null ? els[t.index] : els[0];
        if (!el) {
          out.push({ name: t.name, selector: t.selector, found: false });
          continue;
        }
        const r = el.getBoundingClientRect();
        const cs = window.getComputedStyle(el);
        out.push({
          name: t.name,
          selector: t.selector,
          found: true,
          matchCount: els.length,
          rect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) },
          computed: {
            fontSize: cs.fontSize,
            lineHeight: cs.lineHeight,
            padding: cs.padding,
            margin: cs.margin,
            width: cs.width,
            height: cs.height,
            color: cs.color,
            backgroundColor: cs.backgroundColor,
            display: cs.display,
            boxSizing: cs.boxSizing,
            border: cs.border
          },
          tagName: el.tagName.toLowerCase(),
          className: typeof el.className === "string" ? el.className : (el.className?.baseVal ?? "")
        });
      }
      return out;
    }, measureTargets);
  }

  meta.consoleErrorsCount = consoleErrors.length;
  if (consoleErrors.length) meta.consoleErrorsFirst = consoleErrors.slice(0, 5);
  meta.ok = true;
} catch (e) {
  meta.error = String(e && e.message ? e.message : e);
  meta.ok = false;
} finally {
  try { await context.close(); } catch {}
  try { await browser.close(); } catch {}
}

await writeFile(
  path.join(outDir, `${name}.meta.json`),
  JSON.stringify(meta, null, 2),
  "utf8",
);

process.stdout.write(JSON.stringify(meta, null, 2) + "\n");
process.exit(meta.ok ? 0 : 1);
