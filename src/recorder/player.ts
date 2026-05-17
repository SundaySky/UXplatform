// Playback engine for recorded logs. Replays a RecordingLog by matching each
// event's target against the current DOM (component name + text + ancestor
// chain), then dispatching the original interaction. Dev-only — same gating
// as the recorder.

import { findComponentChain } from "./recorder";
import type { ComponentRef, EventTarget as RecTarget, RecordedEvent, RecordingLog } from "./recorder";

export type PlayerStatus = "idle" | "loaded" | "playing" | "paused" | "finished";

export type DispatchOutcome = "ok" | "no-target" | "skipped";

export type StepInfo = {
    index: number;
    event: RecordedEvent;
    outcome: DispatchOutcome;
    matchScore?: number;
};

export type PlayerOptions = {
    speed: number;
    waitForElementMs: number;
    cursorEnabled: boolean;
    highlightMs: number;
};

const DEFAULT_OPTIONS: PlayerOptions = {
    speed: 1,
    waitForElementMs: 2000,
    cursorEnabled: true,
    highlightMs: 220
};

type Context = {
    log: RecordingLog | null;
    index: number;
    status: PlayerStatus;
    lastOutcome: StepInfo | null;
    options: PlayerOptions;
    cursor: { x: number; y: number; visible: boolean };
    token: { cancelled: boolean };
    // Continuous playback clock. `playbackMs` is the recording-time cursor; while
    // `tickerRunning` is true (during a gap-sleep) the displayed time advances at
    // (wall delta * speed) above `wallAnchorMs`. Otherwise it stays frozen.
    playbackMs: number;
    wallAnchorMs: number;
    tickerRunning: boolean;
};

const ctx: Context = {
    log: null,
    index: 0,
    status: "idle",
    lastOutcome: null,
    options: { ...DEFAULT_OPTIONS },
    cursor: { x: 0, y: 0, visible: false },
    token: { cancelled: false },
    playbackMs: 0,
    wallAnchorMs: 0,
    tickerRunning: false
};

const listeners = new Set<() => void>();

class Cancelled extends Error {}

// ─── Public API ─────────────────────────────────────────────────────────────
export function loadLog(log: RecordingLog): void {
    cancel();
    ctx.log = log;
    ctx.index = 0;
    ctx.status = "loaded";
    ctx.lastOutcome = null;
    ctx.playbackMs = 0;
    ctx.tickerRunning = false;
    hideCursor();
    notify();
}

export function unload(): void {
    cancel();
    ctx.log = null;
    ctx.index = 0;
    ctx.status = "idle";
    ctx.lastOutcome = null;
    ctx.playbackMs = 0;
    ctx.tickerRunning = false;
    hideCursor();
    notify();
}

export function play(): void {
    if (!ctx.log || ctx.status === "playing") {
        return;
    }
    if (ctx.index >= ctx.log.events.length) {
        ctx.index = 0;
        ctx.playbackMs = 0;
    }
    ctx.status = "playing";
    ctx.token = { cancelled: false };
    ctx.wallAnchorMs = Date.now();
    ctx.tickerRunning = true;
    notify();
    runLoop().catch(err => {
        if (!(err instanceof Cancelled)) {
            console.error("[player] loop error", err);
        }
    });
}

export function pause(): void {
    if (ctx.status !== "playing") {
        return;
    }
    ctx.playbackMs = computeCurrentMs();
    ctx.tickerRunning = false;
    cancel();
    ctx.status = "paused";
    hideCursor();
    notify();
}

export async function next(): Promise<void> {
    if (!ctx.log) {
        return;
    }
    if (ctx.status === "playing") {
        pause();
    }
    if (ctx.index >= ctx.log.events.length) {
        return;
    }
    ctx.token = { cancelled: false };
    const ev = ctx.log.events[ctx.index];
    try {
        const outcome = await dispatchEvent(ev, ctx.token);
        ctx.lastOutcome = { index: ctx.index, event: ev, ...outcome };
    }
    catch (err) {
        if (!(err instanceof Cancelled)) {
            throw err;
        }
    }
    ctx.index += 1;
    ctx.playbackMs = ev.t;
    ctx.tickerRunning = false;
    if (ctx.index >= ctx.log.events.length) {
        ctx.status = "finished";
    }
    notify();
}

export function prev(): void {
    if (!ctx.log) {
        return;
    }
    if (ctx.status === "playing") {
        pause();
    }
    if (ctx.index <= 0) {
        return;
    }
    ctx.index -= 1;
    if (ctx.status === "finished") {
        ctx.status = "paused";
    }
    ctx.playbackMs = ctx.log.events[ctx.index]?.t ?? 0;
    ctx.tickerRunning = false;
    ctx.lastOutcome = null;
    notify();
}

export function seek(index: number): void {
    if (!ctx.log) {
        return;
    }
    if (ctx.status === "playing") {
        pause();
    }
    const max = ctx.log.events.length;
    ctx.index = Math.max(0, Math.min(index, max));
    if (ctx.index >= max) {
        ctx.status = "finished";
        ctx.playbackMs = ctx.log.durationMs;
    }
    else {
        if (ctx.status === "finished") {
            ctx.status = "paused";
        }
        ctx.playbackMs = ctx.log.events[ctx.index]?.t ?? 0;
    }
    ctx.tickerRunning = false;
    ctx.lastOutcome = null;
    notify();
}

export function setSpeed(speed: number): void {
    // Re-anchor so the new speed applies from the current displayed time forward.
    if (ctx.status === "playing" && ctx.tickerRunning) {
        ctx.playbackMs = computeCurrentMs();
        ctx.wallAnchorMs = Date.now();
    }
    ctx.options.speed = speed;
    notify();
}

export function getCurrentPlaybackMs(): number {
    return computeCurrentMs();
}

function computeCurrentMs(): number {
    if (!ctx.log) {
        return 0;
    }
    if (ctx.status === "playing" && ctx.tickerRunning) {
        const elapsedWall = Date.now() - ctx.wallAnchorMs;
        return Math.min(ctx.playbackMs + elapsedWall * ctx.options.speed, ctx.log.durationMs);
    }
    return ctx.playbackMs;
}

export function setOptions(partial: Partial<PlayerOptions>): void {
    Object.assign(ctx.options, partial);
    notify();
}

export function getSnapshot(): Readonly<Context> {
    return ctx;
}

export function subscribe(fn: () => void): () => void {
    listeners.add(fn);
    return () => {
        listeners.delete(fn);
    };
}

// ─── Main loop ──────────────────────────────────────────────────────────────
async function runLoop(): Promise<void> {
    if (!ctx.log) {
        return;
    }
    const events = ctx.log.events;
    const token = ctx.token;
    while (ctx.index < events.length && ctx.status === "playing" && !token.cancelled) {
        const ev = events[ctx.index];
        const prevT = ctx.index > 0 ? events[ctx.index - 1].t : 0;
        // Resume from wherever the clock is now (handles pause+resume mid-gap and
        // post-seek positioning), but never earlier than the previous event.
        const fromT = Math.max(prevT, ctx.playbackMs);
        const remainingGap = Math.max(0, (ev.t - fromT) / ctx.options.speed);

        ctx.playbackMs = fromT;
        ctx.wallAnchorMs = Date.now();
        ctx.tickerRunning = true;
        notify();

        if (remainingGap > 0) {
            await cancellableSleep(Math.min(remainingGap, 8000), token);
        }
        if (token.cancelled || ctx.status !== "playing") {
            return;
        }

        // Freeze the clock at the event's time during dispatch.
        ctx.playbackMs = ev.t;
        ctx.tickerRunning = false;
        notify();

        const outcome = await dispatchEvent(ev, token);
        ctx.lastOutcome = { index: ctx.index, event: ev, ...outcome };
        ctx.index += 1;
        notify();
    }
    if (ctx.index >= events.length) {
        ctx.status = "finished";
        ctx.playbackMs = ctx.log.durationMs;
        ctx.tickerRunning = false;
        notify();
    }
}

function cancel(): void {
    ctx.token.cancelled = true;
}

function cancellableSleep(ms: number, token: { cancelled: boolean }): Promise<void> {
    return new Promise((resolve, reject) => {
        if (token.cancelled) {
            reject(new Cancelled());
            return;
        }
        let pollId: number | null = null;
        const timeoutId = window.setTimeout(() => {
            if (pollId !== null) {
                window.clearInterval(pollId);
            }
            if (token.cancelled) {
                reject(new Cancelled());
            }
            else {
                resolve();
            }
        }, ms);
        pollId = window.setInterval(() => {
            if (token.cancelled) {
                window.clearTimeout(timeoutId);
                if (pollId !== null) {
                    window.clearInterval(pollId);
                }
                reject(new Cancelled());
            }
        }, 60);
    });
}

// ─── Dispatch ───────────────────────────────────────────────────────────────
async function dispatchEvent(ev: RecordedEvent, token: { cancelled: boolean }): Promise<{ outcome: DispatchOutcome; matchScore?: number }> {
    if (ev.type === "custom") {
        return { outcome: "skipped" };
    }

    const match = await waitForTarget(ev.target, ev.chain, ctx.options.waitForElementMs, token);
    if (token.cancelled) {
        throw new Cancelled();
    }
    if (!match) {
        console.warn("[player] could not find target for event", ev);
        return { outcome: "no-target" };
    }
    const { el, score } = match;

    // Scroll into view (instant — smooth scroll has no completion promise).
    // Wrapped because jsdom doesn't implement scrollIntoView.
    if (typeof el.scrollIntoView === "function") {
        el.scrollIntoView({ behavior: "auto", block: "center", inline: "center" });
    }

    if (ctx.options.cursorEnabled) {
        moveCursorToElement(el);
        await cancellableSleep(ctx.options.highlightMs, token);
        if (token.cancelled) {
            throw new Cancelled();
        }
    }

    switch (ev.type) {
        case "click":
            if (el instanceof HTMLElement) {
                el.click();
            }
            break;
        case "input":
            dispatchInput(el, ev.detail?.value);
            break;
        case "change":
            dispatchChange(el, ev.detail?.value);
            break;
        case "keydown":
            dispatchKey(el, String(ev.detail?.key ?? ""));
            break;
    }

    return { outcome: "ok", matchScore: score };
}

function dispatchInput(el: Element, value: unknown): void {
    if (typeof value !== "string") {
        return;
    }
    if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
        setNativeValue(el, value);
        el.dispatchEvent(new Event("input", { bubbles: true }));
    }
}

function dispatchChange(el: Element, value: unknown): void {
    if (el instanceof HTMLInputElement && (el.type === "checkbox" || el.type === "radio")) {
        const desired = value === true || value === "true";
        if (el.checked !== desired) {
            el.click();
        }
        return;
    }
    if (typeof value !== "string") {
        return;
    }
    if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
        setNativeValue(el, value);
        el.dispatchEvent(new Event("change", { bubbles: true }));
    }
    else if (el instanceof HTMLSelectElement) {
        setSelectNativeValue(el, value);
        el.dispatchEvent(new Event("change", { bubbles: true }));
    }
}

function dispatchKey(el: Element, key: string): void {
    if (!key) {
        return;
    }
    // Focus the target so keydown handlers (Escape on dialogs, Enter to submit) actually fire on the right element.
    if (el instanceof HTMLElement) {
        el.focus();
    }
    const active = (document.activeElement as HTMLElement) ?? (el instanceof HTMLElement ? el : null);
    const target = active ?? el;
    target.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true }));
}

// React-controlled inputs: React monkey-patches the value descriptor on the
// instance. The native setter lives on the prototype — we pull it from there.
function setNativeValue(el: HTMLInputElement | HTMLTextAreaElement, value: string): void {
    const proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    const setter = Object.getOwnPropertyDescriptor(proto, "value")?.set;
    if (setter) {
        setter.call(el, value);
    }
    else {
        el.value = value;
    }
}

function setSelectNativeValue(el: HTMLSelectElement, value: string): void {
    const setter = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, "value")?.set;
    if (setter) {
        setter.call(el, value);
    }
    else {
        el.value = value;
    }
}

// ─── Target matching ────────────────────────────────────────────────────────
type Match = { el: Element; score: number };

async function waitForTarget(spec: RecTarget, chain: ComponentRef[] | undefined, maxMs: number, token: { cancelled: boolean }): Promise<Match | null> {
    const start = Date.now();
    let best: Match | null = null;
    while (Date.now() - start < maxMs) {
        if (token.cancelled) {
            return null;
        }
        const m = findBestMatch(spec, chain);
        if (m && (!best || m.score > best.score)) {
            best = m;
        }
        if (best && best.score >= STRONG_MATCH) {
            return best;
        }
        await cancellableSleep(80, token).catch(() => {});
    }
    return best && best.score >= MIN_MATCH ? best : null;
}

const MIN_MATCH = 40; // floor to accept a match
const STRONG_MATCH = 80; // stop polling early once we hit this

function findBestMatch(spec: RecTarget, chain: ComponentRef[] | undefined): Match | null {
    // Cheap pre-filter: restrict candidate set by tag and (when present) role.
    // Exclude the player's own UI so it never receives a replayed click.
    const candidates = collectCandidates(spec);

    let bestEl: Element | null = null;
    let bestScore = 0;
    for (const el of candidates) {
        if (isPlayerOwned(el)) {
            continue;
        }
        const score = scoreCandidate(el, spec, chain);
        if (score > bestScore) {
            bestScore = score;
            bestEl = el;
        }
    }
    return bestEl ? { el: bestEl, score: bestScore } : null;
}

function collectCandidates(spec: RecTarget): Element[] {
    const tag = (spec.tag ?? "*").toLowerCase();
    // Common actionable tags — broader than just spec.tag to handle minor DOM drift
    const baseSelectors = new Set<string>();
    if (tag && tag !== "*") {
        baseSelectors.add(tag);
    }
    // Always include role-tagged elements
    if (spec.role) {
        baseSelectors.add(`[role="${cssEscape(spec.role)}"]`);
    }
    // For clicks, expand to all common actionables
    baseSelectors.add("button");
    baseSelectors.add("a");
    baseSelectors.add("input");
    baseSelectors.add("textarea");
    baseSelectors.add("select");
    baseSelectors.add("[role='button']");
    baseSelectors.add("[role='menuitem']");
    baseSelectors.add("[role='tab']");
    baseSelectors.add("[role='option']");
    baseSelectors.add("[data-rec-component]");
    return Array.from(document.querySelectorAll(Array.from(baseSelectors).join(",")));
}

function scoreCandidate(el: Element, spec: RecTarget, chainSpec: ComponentRef[] | undefined): number {
    let score = 0;

    // Data-rec-component exact match wins decisively
    const recComp = spec.dataAttrs?.["rec-component"];
    if (recComp && el.getAttribute("data-rec-component") === recComp) {
        score += 120;
    }

    // Tag and role
    if (spec.tag && el.tagName.toLowerCase() === spec.tag) {
        score += 6;
    }
    if (spec.role && el.getAttribute("role") === spec.role) {
        score += 12;
    }

    // Text / aria match
    const elText = (el.textContent ?? "").trim().replace(/\s+/g, " ");
    const elAria = el.getAttribute("aria-label") ?? el.getAttribute("title") ?? el.getAttribute("placeholder") ?? "";
    if (spec.text) {
        const recText = spec.text.replace(/\.\.\.$/, "");
        if (elText === spec.text || elText === recText) {
            score += 38;
        }
        else if (elAria === spec.text || elAria === recText) {
            score += 32;
        }
        else if (elText.length > 0 && elText.startsWith(recText.slice(0, Math.min(20, recText.length)))) {
            score += 14;
        }
        else if (elText.length > 0 && elText.includes(recText.slice(0, Math.min(20, recText.length)))) {
            score += 8;
        }
    }

    // Component name (expensive — last)
    if (spec.component) {
        const chain = findComponentChain(el);
        const head = chain[0]?.name;
        if (head === spec.component) {
            score += 55;
        }
        else if (chain.some(c => c.name === spec.component)) {
            score += 28;
        }

        // Ancestor chain alignment
        if (chainSpec && chainSpec.length > 0) {
            const names = new Set(chain.map(c => c.name));
            const matched = chainSpec.filter(c => names.has(c.component)).length;
            score += Math.min(matched, 4) * 6;
        }
    }

    return score;
}

function isPlayerOwned(el: Element): boolean {
    return el.closest("[data-rec-player]") !== null;
}

function cssEscape(s: string): string {
    // narrow escape for attribute values
    return s.replace(/["\\]/g, "\\$&");
}

// ─── Cursor ─────────────────────────────────────────────────────────────────
function moveCursorToElement(el: Element): void {
    const r = el.getBoundingClientRect();
    ctx.cursor = { x: r.left + r.width / 2, y: r.top + r.height / 2, visible: true };
    notify();
}

function hideCursor(): void {
    if (!ctx.cursor.visible) {
        return;
    }
    ctx.cursor = { ...ctx.cursor, visible: false };
    notify();
}

function notify(): void {
    for (const fn of listeners) {
        fn();
    }
}
