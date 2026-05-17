// Recording mode — captures user interactions and traces them back to React
// components via fiber introspection. Dev-only: relies on _debugSource, which
// is populated by @vitejs/plugin-react (babel-plugin-transform-react-jsx-source)
// and stripped from production builds. Targets React 18 fiber internals.

type EventType = "click" | "input" | "change" | "keydown" | "custom";

export type RecordedEvent = {
    /** Milliseconds since recording started */
    t: number;
    /** ISO timestamp */
    timestamp: string;
    type: EventType;
    /** Route at the moment of the event: pathname + search + hash. Captured per event so in-app navigation is visible in the log. */
    url?: string;
    target: EventTarget;
    /** Up to 5 ancestor user components, closest first */
    chain?: ComponentRef[];
    detail?: Record<string, unknown>;
};

export type EventTarget = {
    /** React component name from displayName || name (closest user-owned) */
    component?: string;
    /** Where the JSX was written, e.g. "src/pages/VideoLibrary/VideoCard.tsx" */
    callSite?: { file: string; line?: number; column?: number };
    /** Visible text of the actionable element, truncated */
    text?: string;
    /** ARIA role if set */
    role?: string;
    /** HTML tag */
    tag?: string;
    /** Short CSS path (up to 4 levels) for debugging */
    selector?: string;
    /** JSON-safe snapshot of the matched component's props. */
    props?: Record<string, unknown>;
    /** Best-effort positional snapshot of useState/useReducer values on the matched component. Hooks have no names — order matches declaration order in the component source. */
    hooks?: unknown[];
    /** Value of any data-rec-* attributes found on the element or an ancestor */
    dataAttrs?: Record<string, string>;
};

export type ComponentRef = {
    component: string;
    file?: string;
    line?: number;
};

export type GitInfo = {
    /** Branch HEAD was on at recording start */
    branch: string;
    /** Full SHA of HEAD at recording start */
    sha: string;
    /** Exact tag at HEAD, if any */
    tag: string | null;
};

export type RecordingLog = {
    startedAt: string;
    endedAt: string;
    durationMs: number;
    eventCount: number;
    initialUrl: string;
    userAgent: string;
    /** Git snapshot at recording start. Lets consumers map the log back to a specific commit. */
    git?: GitInfo;
    events: RecordedEvent[];
};

// ─── Module state ───────────────────────────────────────────────────────────
type Session = { startedAt: number; events: RecordedEvent[]; initialUrl: string; git?: GitInfo };
let session: Session | null = null;
const listeners = new Set<() => void>();

// ─── Public API ─────────────────────────────────────────────────────────────
export function startRecording(git?: GitInfo): void {
    if (session) {
        return;
    }
    session = {
        startedAt: Date.now(),
        events: [],
        initialUrl: window.location.href,
        git
    };
    attachListeners();
    pushEvent({
        type: "custom",
        target: {},
        detail: { event: "recording-started", url: window.location.href }
    });
    notify();
}

export function stopRecording(): RecordingLog | null {
    if (!session) {
        return null;
    }
    pushEvent({ type: "custom", target: {}, detail: { event: "recording-stopped" } });
    detachListeners();
    const log = buildLog(session);
    session = null;
    downloadLog(log);
    notify();
    return log;
}

export function isRecording(): boolean {
    return session !== null;
}

export function getEventCount(): number {
    return session?.events.length ?? 0;
}

/** Allow components to emit a named event into the log, e.g. dialog opens. */
export function recordCustomEvent(name: string, detail?: Record<string, unknown>): void {
    if (!session) {
        return;
    }
    pushEvent({ type: "custom", target: { component: name }, detail });
}

export function subscribe(fn: () => void): () => void {
    listeners.add(fn);
    return () => {
        listeners.delete(fn);
    };
}

// ─── Event handlers ─────────────────────────────────────────────────────────
function attachListeners(): void {
    document.addEventListener("click", onClick, true);
    document.addEventListener("input", onInput, true);
    document.addEventListener("change", onChange, true);
    document.addEventListener("keydown", onKeydown, true);
}

function detachListeners(): void {
    document.removeEventListener("click", onClick, true);
    document.removeEventListener("input", onInput, true);
    document.removeEventListener("change", onChange, true);
    document.removeEventListener("keydown", onKeydown, true);
}

function isOwnUI(el: Element): boolean {
    return el.closest("[data-rec-player]") !== null;
}

function onClick(e: Event): void {
    if (!session) {
        return;
    }
    const el = e.target;
    if (!(el instanceof Element)) {
        return;
    }
    if (isOwnUI(el)) {
        return;
    }
    const actionable = findActionable(el);
    pushEvent({
        type: "click",
        ...describeElement(actionable)
    });
}

function onInput(e: Event): void {
    if (!session) {
        return;
    }
    const el = e.target;
    if (!isFormControl(el)) {
        return;
    }
    if (isOwnUI(el)) {
        return;
    }
    pushEvent({
        type: "input",
        ...describeElement(el),
        detail: { value: redactedValue(el) }
    });
}

function onChange(e: Event): void {
    if (!session) {
        return;
    }
    const el = e.target;
    if (!isFormControl(el)) {
        return;
    }
    if (isOwnUI(el)) {
        return;
    }
    // Avoid duplicating `input` for text fields. `change` is useful for selects,
    // checkboxes, radios — those fire change but not input on user action.
    const tag = el.tagName.toLowerCase();
    const type = "type" in el ? (el as HTMLInputElement).type : "";
    const isText = tag === "textarea" || (tag === "input" && !["checkbox", "radio", "file", "color", "range"].includes(type));
    if (isText) {
        return;
    }
    pushEvent({
        type: "change",
        ...describeElement(el),
        detail: { value: redactedValue(el) }
    });
}

function onKeydown(e: KeyboardEvent): void {
    if (!session) {
        return;
    }
    // Only log meaningful navigation/control keys, not typing.
    const interesting = ["Escape", "Enter", "Tab", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"];
    if (!interesting.includes(e.key)) {
        return;
    }
    const el = e.target instanceof Element ? e.target : null;
    if (!el) {
        return;
    }
    if (isOwnUI(el)) {
        return;
    }
    pushEvent({
        type: "keydown",
        ...describeElement(el),
        detail: { key: e.key }
    });
}

// ─── Element introspection ──────────────────────────────────────────────────
function findActionable(el: Element): Element {
    return (
        el.closest(
            "[data-rec-component], button, a, [role='button'], [role='menuitem'], [role='tab'], [role='option'], [role='checkbox'], [role='switch'], [role='radio'], input, select, textarea, label"
        ) ?? el
    );
}

function isFormControl(el: unknown): el is HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement {
    return el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement;
}

function describeElement(el: Element): { target: EventTarget; chain?: ComponentRef[] } {
    const chain = findComponentChain(el);
    const primary = chain[0];
    const dataAttrs = collectDataAttrs(el);
    return {
        target: {
            component: dataAttrs["rec-component"] ?? primary?.name,
            callSite: primary?.callSite,
            text: shortText(el),
            role: el.getAttribute("role") ?? undefined,
            tag: el.tagName.toLowerCase(),
            selector: cssPath(el),
            props: primary?.props,
            hooks: primary?.hooks,
            dataAttrs: Object.keys(dataAttrs).length ? dataAttrs : undefined
        },
        chain: chain.length > 1 ? chain.slice(0, 5).map(c => ({ component: c.name, file: c.callSite?.file, line: c.callSite?.line })) : undefined
    };
}

// ─── React fiber introspection ──────────────────────────────────────────────
// React 18 stores a fiber pointer on the DOM node under a key like
// `__reactFiber$<random>`. We walk the fiber's `return` chain to find the
// nearest user-owned component (one whose JSX was written inside /src/).

export type FiberInfo = {
    name: string;
    callSite?: { file: string; line?: number; column?: number };
    props?: Record<string, unknown>;
    /** Populated only for the closest (chain[0]) user-component. Positional. */
    hooks?: unknown[];
};

const INTERNAL_NAMES = new Set([
    "Provider",
    "Consumer",
    "ForwardRef",
    "Memo",
    "Anonymous",
    "Unknown",
    "Fragment",
    "Suspense",
    "Profiler"
]);

function getFiber(el: Element): unknown {
    const key = Object.keys(el).find(k => k.startsWith("__reactFiber$"));
    return key ? (el as unknown as Record<string, unknown>)[key] : null;
}

function fiberTypeName(type: unknown): string | undefined {
    if (!type) {
        return undefined;
    }
    if (typeof type === "string") {
        return undefined;
    } // host element, e.g. "div"
    const t = type as { displayName?: string; name?: string; render?: { displayName?: string; name?: string }; type?: unknown };
    if (t.displayName) {
        return t.displayName;
    }
    if (t.name) {
        return t.name;
    }
    // forwardRef: type.render is the wrapped function
    if (t.render) {
        return t.render.displayName || t.render.name;
    }
    // memo: type.type is the wrapped component
    if (t.type) {
        return fiberTypeName(t.type);
    }
    return undefined;
}

type FiberNode = {
    type?: unknown;
    return?: FiberNode | null;
    _debugSource?: { fileName: string; lineNumber?: number; columnNumber?: number };
    memoizedProps?: unknown;
    memoizedState?: unknown;
};

export function findComponentChain(el: Element, maxDepth = 30): FiberInfo[] {
    const fiber = getFiber(el) as FiberNode | null;
    if (!fiber) {
        return [];
    }
    const chain: FiberInfo[] = [];
    let current: FiberNode | null | undefined = fiber;
    let depth = 0;
    while (current && depth < maxDepth) {
        depth += 1;
        const name = fiberTypeName(current.type);
        const source = current._debugSource;
        if (name && !INTERNAL_NAMES.has(name) && isAppSource(source)) {
            // Only walk hooks for the closest match — that's the component the
            // user actually interacted with. Walking every ancestor is noisy.
            const isPrimary = chain.length === 0;
            chain.push({
                name,
                callSite: source
                    ? {
                        file: normalizeSourcePath(source.fileName),
                        line: source.lineNumber,
                        column: source.columnNumber
                    }
                    : undefined,
                props: extractProps(current.memoizedProps),
                hooks: isPrimary ? extractHookState(current) : undefined
            });
        }
        current = current.return;
    }
    return chain;
}

function isAppSource(source: { fileName: string } | undefined): boolean {
    if (!source?.fileName) {
        return false;
    }
    const f = source.fileName;
    if (f.includes("/node_modules/")) {
        return false;
    }
    return f.includes("/src/");
}

function normalizeSourcePath(p: string): string {
    const idx = p.lastIndexOf("/src/");
    return idx >= 0 ? "src/" + p.slice(idx + 5) : p;
}

// ─── Prop & hook serialization ──────────────────────────────────────────────
// Soft caps. Logs are intended to be human-readable JSON, not full DOM dumps.
const MAX_STRING_LENGTH = 200;
const MAX_PROPS_BYTES = 2048;
const MAX_ARRAY_ITEMS = 10;
const SKIPPED_PROP_KEYS = new Set(["children", "key", "ref", "className", "style", "sx", "classes"]);

function isReactElement(v: unknown): boolean {
    if (!v || typeof v !== "object") {
        return false;
    }
    const t = (v as { $$typeof?: unknown }).$$typeof;
    // React 18 marks elements with a symbol $$typeof of Symbol.for("react.element")
    return typeof t === "symbol";
}

/**
 * Convert a value into a JSON-safe shallow snapshot. Returns undefined when the
 * value is something we want to drop (function, React element, DOM node, deep
 * nested object, etc.). Depth is capped at 1 so we don't recurse into a huge
 * tree by accident.
 */
function serializeValue(v: unknown, depth: number): unknown {
    if (v === null || v === undefined) {
        return v;
    }
    const t = typeof v;
    if (t === "string") {
        const s = v as string;
        return s.length > MAX_STRING_LENGTH ? s.slice(0, MAX_STRING_LENGTH) + "..." : s;
    }
    if (t === "number" || t === "boolean") {
        return v;
    }
    if (t === "bigint") {
        return String(v) + "n";
    }
    if (t === "function" || t === "symbol") {
        return undefined;
    }
    if (Array.isArray(v)) {
        if (depth >= 1) {
            return undefined;
        }
        const arr: unknown[] = [];
        for (let i = 0; i < Math.min(v.length, MAX_ARRAY_ITEMS); i += 1) {
            const s = serializeValue(v[i], depth + 1);
            if (s !== undefined) {
                arr.push(s);
            }
        }
        if (v.length > MAX_ARRAY_ITEMS) {
            arr.push(`...+${v.length - MAX_ARRAY_ITEMS}`);
        }
        return arr;
    }
    if (t === "object") {
        if (isReactElement(v)) {
            return undefined;
        }
        if (typeof Node !== "undefined" && v instanceof Node) {
            return undefined;
        }
        if (v instanceof Date) {
            return (v as Date).toISOString();
        }
        if (v instanceof RegExp) {
            return v.toString();
        }
        if (v instanceof Map || v instanceof Set) {
            return `<${v.constructor.name}(${v.size})>`;
        }
        if (depth >= 1) {
            return undefined;
        }
        const src = v as Record<string, unknown>;
        const obj: Record<string, unknown> = {};
        for (const k of Object.keys(src)) {
            if (SKIPPED_PROP_KEYS.has(k)) {
                continue;
            }
            const child = src[k];
            if (typeof child === "function") {
                continue;
            }
            const s = serializeValue(child, depth + 1);
            if (s !== undefined) {
                obj[k] = s;
            }
        }
        return Object.keys(obj).length ? obj : undefined;
    }
    return undefined;
}

function extractProps(props: unknown): Record<string, unknown> | undefined {
    if (!props || typeof props !== "object") {
        return undefined;
    }
    const src = props as Record<string, unknown>;
    const out: Record<string, unknown> = {};
    let truncated = false;
    for (const k of Object.keys(src)) {
        if (SKIPPED_PROP_KEYS.has(k)) {
            continue;
        }
        const v = src[k];
        if (typeof v === "function") {
            continue; // drop callbacks (onClick, onChange, etc.)
        }
        const s = serializeValue(v, 0);
        if (s === undefined) {
            continue;
        }
        out[k] = s;
        // Soft byte cap — bail out cleanly once we exceed it.
        try {
            if (JSON.stringify(out).length > MAX_PROPS_BYTES) {
                delete out[k];
                truncated = true;
                break;
            }
        }
        catch {
            delete out[k];
        }
    }
    if (truncated) {
        out.__truncated = true;
    }
    return Object.keys(out).length ? out : undefined;
}

/**
 * Best-effort walk over a fiber's hook linked list. The shape is React-internal
 * and may drift across versions. Hooks have no names — entries are positional
 * and match the order in which the component declares them.
 */
function extractHookState(fiber: FiberNode): unknown[] | undefined {
    const head = fiber.memoizedState as FiberHook | null | undefined;
    if (!head || typeof head !== "object") {
        return undefined;
    }
    // Filter to real hook list nodes. A function-component fiber's memoizedState
    // is the head of a linked list; nodes have `next` plus either `queue`,
    // `baseState`, or `baseQueue`. Class-component state objects don't match.
    if (!("next" in head)) {
        return undefined;
    }
    if (!("queue" in head) && !("baseState" in head) && !("baseQueue" in head)) {
        return undefined;
    }

    const out: unknown[] = [];
    let node: FiberHook | null | undefined = head;
    let guard = 0;
    while (node && guard < 50) {
        guard += 1;
        out.push(classifyHook(node.memoizedState));
        node = node.next;
    }
    return out.length ? out : undefined;
}

type FiberHook = {
    memoizedState?: unknown;
    baseState?: unknown;
    baseQueue?: unknown;
    queue?: unknown;
    next?: FiberHook | null;
};

function classifyHook(val: unknown): unknown {
    if (val === null || val === undefined) {
        return val;
    }
    const t = typeof val;
    if (t === "string" || t === "number" || t === "boolean") {
        return serializeValue(val, 0);
    }
    if (t === "function") {
        return "<fn>";
    }
    if (Array.isArray(val)) {
        // useMemo / useCallback dependency tuples often look like [value, deps].
        return serializeValue(val, 0);
    }
    if (t === "object") {
        const o = val as Record<string, unknown>;
        // useRef: { current: ... }
        const keys = Object.keys(o);
        if (keys.length === 1 && keys[0] === "current") {
            const inner = serializeValue(o.current, 0);
            return { ref: inner === undefined ? "<unserializable>" : inner };
        }
        // useEffect record: { tag, create, destroy, deps, next }
        if (typeof o.create === "function" || typeof o.destroy === "function") {
            return "<effect>";
        }
        const s = serializeValue(val, 0);
        return s === undefined ? "<object>" : s;
    }
    return "<unknown>";
}

// ─── DOM helpers ────────────────────────────────────────────────────────────
function shortText(el: Element, max = 80): string | undefined {
    const raw = (el.textContent ?? "").trim().replace(/\s+/g, " ");
    if (!raw) {
        // Fall back to aria-label / title / placeholder if there's no visible text
        const alt = el.getAttribute("aria-label") || el.getAttribute("title") || el.getAttribute("placeholder");
        return alt ?? undefined;
    }
    return raw.length > max ? raw.slice(0, max) + "..." : raw;
}

function cssPath(el: Element, maxDepth = 4): string {
    const parts: string[] = [];
    let cur: Element | null = el;
    while (cur && parts.length < maxDepth && cur.tagName.toLowerCase() !== "body") {
        let part = cur.tagName.toLowerCase();
        if (cur.id) {
            part += "#" + cur.id;
        }
        else if (cur.classList.length) {
            const cls = Array.from(cur.classList)
                .filter(c => !c.startsWith("css-")) // emotion-generated, noisy
                .slice(0, 2);
            if (cls.length) {
                part += "." + cls.join(".");
            }
        }
        parts.unshift(part);
        cur = cur.parentElement;
    }
    return parts.join(" > ");
}

function collectDataAttrs(el: Element): Record<string, string> {
    const out: Record<string, string> = {};
    let cur: Element | null = el;
    let hops = 0;
    while (cur && hops < 6) {
        for (const attr of Array.from(cur.attributes)) {
            if (attr.name.startsWith("data-rec-") && !(attr.name.slice(9) in out)) {
                out[attr.name.slice(9)] = attr.value;
            }
        }
        cur = cur.parentElement;
        hops += 1;
    }
    return out;
}

function redactedValue(el: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement): string {
    if (el instanceof HTMLInputElement && el.type === "password") {
        return "<redacted>";
    }
    if (el instanceof HTMLInputElement && (el.type === "checkbox" || el.type === "radio")) {
        return String(el.checked);
    }
    const v = String(el.value ?? "");
    return v.length > 80 ? v.slice(0, 80) + "..." : v;
}

// ─── Log management ─────────────────────────────────────────────────────────
function pushEvent(partial: { type: EventType; target: EventTarget; chain?: ComponentRef[]; detail?: Record<string, unknown> }): void {
    if (!session) {
        return;
    }
    const now = Date.now();
    session.events.push({
        t: now - session.startedAt,
        timestamp: new Date(now).toISOString(),
        url: currentUrl(),
        ...partial
    });
}

function currentUrl(): string | undefined {
    if (typeof location === "undefined") {
        return undefined;
    }
    return location.pathname + location.search + location.hash;
}

function buildLog(s: Session): RecordingLog {
    const endedAt = Date.now();
    return {
        startedAt: new Date(s.startedAt).toISOString(),
        endedAt: new Date(endedAt).toISOString(),
        durationMs: endedAt - s.startedAt,
        eventCount: s.events.length,
        initialUrl: s.initialUrl,
        userAgent: navigator.userAgent,
        git: s.git,
        events: s.events
    };
}

function downloadLog(log: RecordingLog): void {
    const blob = new Blob([JSON.stringify(log, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = suggestedFilename(log);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

/**
 * `recording-<ISO timestamp>[-<tag>][-<short sha>].json`. Tag and sha are
 * appended only when present so the filename is still readable for non-git
 * recordings.
 */
export function suggestedFilename(log: RecordingLog): string {
    const ts = new Date(log.startedAt).toISOString().replace(/[:.]/g, "-");
    const tagPart = log.git?.tag ? `-${sanitizeForFilename(log.git.tag)}` : "";
    const shaPart = log.git?.sha ? `-${log.git.sha.slice(0, 7)}` : "";
    return `recording-${ts}${tagPart}${shaPart}.json`;
}

function sanitizeForFilename(s: string): string {
    return s.replace(/[^a-zA-Z0-9._-]+/g, "_");
}

function notify(): void {
    for (const fn of listeners) {
        fn();
    }
}
