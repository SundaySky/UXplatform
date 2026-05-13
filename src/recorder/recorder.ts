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
    /** Whitelisted UI props pulled off the fiber */
    props?: Record<string, unknown>;
    /** Value of any data-rec-* attributes found on the element or an ancestor */
    dataAttrs?: Record<string, string>;
};

export type ComponentRef = {
    component: string;
    file?: string;
    line?: number;
};

export type RecordingLog = {
    startedAt: string;
    endedAt: string;
    durationMs: number;
    eventCount: number;
    initialUrl: string;
    userAgent: string;
    events: RecordedEvent[];
};

// ─── Module state ───────────────────────────────────────────────────────────
type Session = { startedAt: number; events: RecordedEvent[]; initialUrl: string };
let session: Session | null = null;
const listeners = new Set<() => void>();

// ─── Public API ─────────────────────────────────────────────────────────────
export function startRecording(): void {
    if (session) {
        return;
    }
    session = {
        startedAt: Date.now(),
        events: [],
        initialUrl: window.location.href
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

function onClick(e: Event): void {
    if (!session) {
        return;
    }
    const el = e.target;
    if (!(el instanceof Element)) {
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
            dataAttrs: Object.keys(dataAttrs).length ? dataAttrs : undefined
        },
        chain: chain.length > 1 ? chain.slice(0, 5).map(c => ({ component: c.name, file: c.callSite?.file, line: c.callSite?.line })) : undefined
    };
}

// ─── React fiber introspection ──────────────────────────────────────────────
// React 18 stores a fiber pointer on the DOM node under a key like
// `__reactFiber$<random>`. We walk the fiber's `return` chain to find the
// nearest user-owned component (one whose JSX was written inside /src/).

type FiberInfo = {
    name: string;
    callSite?: { file: string; line?: number; column?: number };
    props?: Record<string, unknown>;
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
};

function findComponentChain(el: Element, maxDepth = 30): FiberInfo[] {
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
            chain.push({
                name,
                callSite: source
                    ? {
                        file: normalizeSourcePath(source.fileName),
                        line: source.lineNumber,
                        column: source.columnNumber
                    }
                    : undefined,
                props: extractKeyProps(current.memoizedProps)
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

const KEY_PROPS = [
    "variant",
    "color",
    "size",
    "severity",
    "open",
    "selected",
    "checked",
    "disabled",
    "fullWidth",
    "type",
    "label",
    "title",
    "name",
    "placeholder",
    "aria-label"
];

function extractKeyProps(props: unknown): Record<string, unknown> | undefined {
    if (!props || typeof props !== "object") {
        return undefined;
    }
    const src = props as Record<string, unknown>;
    const out: Record<string, unknown> = {};
    for (const k of KEY_PROPS) {
        const v = src[k];
        if (v === undefined || v === null) {
            continue;
        }
        if (typeof v === "string" || typeof v === "number" || typeof v === "boolean") {
            out[k] = v;
        }
    }
    return Object.keys(out).length ? out : undefined;
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
        ...partial
    });
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
        events: s.events
    };
}

function downloadLog(log: RecordingLog): void {
    const blob = new Blob([JSON.stringify(log, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `recording-${new Date(log.startedAt).toISOString().replace(/[:.]/g, "-")}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function notify(): void {
    for (const fn of listeners) {
        fn();
    }
}
