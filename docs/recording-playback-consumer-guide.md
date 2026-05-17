# Recording JSON — Consumer Guide for Claude

> **Audience.** A Claude session in a *different* project (the production app) that has been given (a) a recording JSON produced by this prototype's recorder and (b) a time range, and is asked: *"implement the component being demonstrated in this window as a production-grade version."*
>
> **What this doc gives you.** The JSON schema, a recipe for slicing by time, and the mapping rules from a recorded event back to the exact prototype source — component file, props snapshot, internal state, and the data driving the UI.
>
> **Source of truth.** Field shapes are defined by `src/recorder/recorder.ts` in this repo (`UXplatform`). If this guide and the code disagree, the code wins — re-check it.

---

## 1. What the recorder captures

The recorder runs in **dev only** (depends on React's `_debugSource`, which Vite strips in prod). It captures every `click`, `input`, `change`, and a small whitelist of `keydown` events (`Escape`, `Enter`, `Tab`, arrow keys). Each event includes:

- the React component the user actually targeted, resolved from the DOM via fiber introspection
- the JSX call-site (`file` + `line`) where that component is *used* in the parent
- the chain of ancestor user components (up to 5)
- a JSON-safe snapshot of the matched component's **props**
- a best-effort positional snapshot of its **hooks** (useState/useReducer values)
- the URL at the moment of the event
- any `data-rec-*` attributes on the element or up to 6 ancestors

The recorder excludes its own UI (anything inside `[data-rec-player]`). Recording start/stop emit bookend `custom` events.

---

## 2. JSON schema

### Top-level: `RecordingLog`

```ts
{
    startedAt: string,        // ISO timestamp
    endedAt: string,
    durationMs: number,
    eventCount: number,
    initialUrl: string,       // Full URL at recording start
    userAgent: string,
    git?: {                   // Present when recorded from a git checkout
        branch: string,       // Branch HEAD was on at recording start
        sha: string,          // Full SHA of HEAD at recording start
        tag: string | null    // Exact tag at HEAD, or null
    },
    events: RecordedEvent[]   // Ordered, oldest first
}
```

**`log.git.sha` is the durable identifier**. The recorder also enforces that this SHA was pushed to the remote at recording start (see §9.1), so `git checkout <sha>` from the same repo reproduces the codebase as it was during the recording. If `log.git.tag` is set, `git checkout <tag>` is equivalent and friendlier.

The downloaded filename follows `recording-<ISO>-<tag>-<short-sha>.json` when git info is present, so the SHA is visible in both the JSON body and the file on disk.

### Per-event: `RecordedEvent`

```ts
{
    t: number,                // ms since startedAt — slice by THIS for time ranges
    timestamp: string,        // ISO at moment of event
    type: "click" | "input" | "change" | "keydown" | "custom",
    url?: string,             // pathname + search + hash at the moment. May be undefined.
    target: EventTarget,
    chain?: ComponentRef[],   // Closest ancestor user components, closest first, up to 5
    detail?: Record<string, unknown>  // type-specific: { value } for input/change, { key } for keydown, { event } for custom
}
```

### `EventTarget` — the matched component

```ts
{
    component?: string,       // React component name (displayName || name); resolved through forwardRef + memo wrappers
    callSite?: {              // Where the JSX is WRITTEN in the parent — file:line of the <Component /> usage
        file: string,         // Normalized to start with "src/...", e.g. "src/pages/VideoLibrary/VideoCard.tsx"
        line?: number,
        column?: number
    },
    text?: string,            // Visible text of the actionable element (≤80 chars). Falls back to aria-label / title / placeholder.
    role?: string,            // ARIA role if set
    tag?: string,             // lowercase HTML tag
    selector?: string,        // Short CSS path (up to 4 levels), e.g. "div.MuiDialog-root > div > button"
    props?: Record<string, unknown>,   // See §6
    hooks?: unknown[],        // POSITIONAL useState/useReducer values. See §7.
    dataAttrs?: Record<string, string> // Strings from data-rec-* on the element or up to 6 ancestors. The `data-rec-component` value overrides `component`.
}
```

### `ComponentRef` — chain entries

```ts
{
    component: string,        // e.g. "ApprovalDialog"
    file?: string,            // "src/dialogs/ApprovalDialog.tsx"
    line?: number             // line of the <ApprovalDialog /> usage
}
```

Note: **chain entries carry name + file only — NOT props or hooks.** Only `target.props` / `target.hooks` (chain[0]) are captured. If you need to know what state the *containing dialog* was in, you must read the source and trace data flow yourself.

---

## 3. Slicing by time

Time-range input is a wall-clock span, e.g. "12:30–12:40 into the recording" = `[750000, 760000]` ms.

```js
const tStart = 750_000;
const tEnd   = 760_000;

const inWindow = log.events.filter(e => e.t >= tStart && e.t < tEnd);
```

Three slices you'll typically want, in order of usefulness:

1. **Events inside the window** — what the user did during this segment.
2. **Last event strictly before the window** — what was on screen entering the window, if no events fire inside it.
3. **First event strictly after the window** — useful tiebreaker: it confirms the visible state the user left the window in.

```js
const lastBefore = [...log.events].reverse().find(e => e.t < tStart && e.type !== "custom");
const firstAfter = log.events.find(e => e.t >= tEnd && e.type !== "custom");
```

**Skip `custom` events** when looking for "what was the user looking at" — they are bookends and markers, not interactions.

---

## 4. "Which prototype component was being demonstrated?"

The prototype is a single-page app. **`event.url` is essentially constant.** Page identity lives in component state, not the URL. Use the chain.

### Step 4.1 — Find the page

Walk `chain` (closest first) for the first entry whose name ends in `Page`:

```js
const pageRef = chain?.find(c => /Page$/.test(c.component));
// → { component: "VideoLibraryPage", file: "src/pages/VideoLibrary/VideoLibraryPage.tsx" }
```

Page names you can expect (from `src/pages/`):

| Component name | File |
|---|---|
| `VideoLibraryPage` | `src/pages/VideoLibrary/VideoLibraryPage.tsx` |
| `VideoOverviewPage` | `src/pages/VideoOverview/VideoOverviewPage.tsx` |
| `StudioPage` | `src/pages/Studio/StudioPage.tsx` |
| `TemplateLibraryPage` | `src/pages/TemplateLibrary/TemplateLibraryPage.tsx` |
| `TemplatePage` | `src/pages/Template/TemplatePage.tsx` |
| `TemplateStudioPage` | `src/pages/TemplateStudio/TemplateStudioPage.tsx` |

### Step 4.2 — Find the overlay (dialog or panel), if any

If the user was inside a modal or floating panel, that's what the demonstration is about, not the page behind it. Walk the chain again:

```js
const overlayRef = chain?.find(c =>
    /Dialog$/.test(c.component) || /Panel$/.test(c.component) || /Stepper$/.test(c.component)
);
```

By folder convention:

- `src/dialogs/*.tsx` — every modal dialog (`ApprovalDialog`, `ApproveVideoDialog`, `AddApproverDialog`, `ManageAccessDialog`, etc.). Includes `WorkflowApprovalStepper`.
- `src/panels/*.tsx` — floating/docked side panels (`NotificationsPanel`, `MediaLibraryPanel`, `AvatarLibraryPanel`, `LanguagesPanel`).
- `src/components/*.tsx` — cross-area reusable (`AppSidebar`, `PermAvatarGroup`, `TasksPanel`).
- Editor-scoped panels live in their area folder (e.g. `CommentsPanel` is in `src/pages/Studio/`, not `src/panels/`).

### Step 4.3 — Find the leaf component the user actually targeted

```js
const leafComponent = event.target.component;       // e.g. "VideoCard"
const leafFile      = event.target.callSite?.file;  // e.g. "src/pages/VideoLibrary/VideoCard.tsx"
const leafLine      = event.target.callSite?.line;  // line of <VideoCard ... /> in the parent
```

### Step 4.4 — Sanity check with `target.text` and `dataAttrs`

`target.text` is the visible label or aria-label at click time — e.g. `"Approve"`, `"Cancel approval"`, `"Add approver"`. If the demonstrator narrates *"I clicked Approve"* and `target.text === "Approve"`, you have triangulation. If `dataAttrs["rec-component"]` is set, treat it as authoritative — it's an explicit override placed by the developer.

### Worked example

Window contains one event:
```json
{
  "t": 752340, "type": "click",
  "target": {
    "component": "VideoCard",
    "callSite": { "file": "src/pages/VideoLibrary/VideoCard.tsx", "line": 87 },
    "text": "Approve",
    "tag": "button"
  },
  "chain": [
    { "component": "VideoCard",        "file": "src/pages/VideoLibrary/VideoCard.tsx" },
    { "component": "VideoLibraryPage", "file": "src/pages/VideoLibrary/VideoLibraryPage.tsx" },
    { "component": "App",              "file": "src/App.tsx" }
  ]
}
```

Conclusion: the demonstration is **the Approve button on a `VideoCard`**, on the Video Library page. The button's JSX is at `src/pages/VideoLibrary/VideoCard.tsx:87`.

---

## 5. "What sub-section or variation was rendered?"

The matched component is rarely interesting alone — you also need the *variant* of it (e.g., is the card in "approved" status? is the dialog on step 2?). Read in this priority order:

1. **`target.props`** — the inputs at render time. **Start here.** §6 details what's captured.
2. **`target.hooks`** — internal state. Positional and unnamed; you'll resolve them by reading the component source. §7 details.
3. **`target.text`** — the visible label disambiguates two same-typed buttons (e.g. an Approve vs. Cancel inside the same dialog).
4. **Surrounding events** — events just before the window often establish state. E.g. an earlier click that opened the dialog will have a `target.text` like `"Approve"` and a `chain[0]` named after the opening button.
5. **`dataAttrs`** — `data-rec-*` is a developer-placed override. Trust it if present.

### Two same-named components

If the window contains clicks on two `<VideoCard />` instances, they share `component` and `callSite`. Disambiguate by:
- `target.text` — typically a unique title per card
- `target.props` — e.g. `{ id: "...", status: "approved" }`
- `selector` — index inside the parent list reveals position

---

## 6. Props

`target.props` is a JSON-safe shallow snapshot of `fiber.memoizedProps`. **What's IN:**

- primitives (string, number, boolean, bigint as `"123n"`, null)
- strings truncated at 200 chars
- arrays of primitives, ≤10 items (longer arrays end with `"...+N"`)
- one level of shallow plain-object values
- `Date` → ISO string, `RegExp` → its source, `Map`/`Set` → `"<Map(N)>"` / `"<Set(N)>"`

**What's OUT (silently dropped):**

- functions (every `onClick`, `onChange`, `onSelect`, etc. — gone)
- React elements / JSX (`children`, `icon`, `startIcon`, `action`, etc., when they hold JSX)
- DOM nodes, refs
- the keys `children`, `key`, `ref`, `className`, `style`, `sx`, `classes`
- anything beyond depth 1

If the whole object exceeds ~2 KB serialized, the rest is truncated and `__truncated: true` is appended. So the absence of a key in `target.props` **does not mean the component didn't have that prop** — it may have been a function, a JSX element, deep, or pushed over the byte cap.

### What this lets you do

Treat `target.props` as the **input contract** of the production component you're building. Anything in here is a real prop the prototype consumes. Anything missing that you *expect* (callbacks, children) must be inferred from the prototype source.

---

## 7. Hooks

`target.hooks` is a **positional** snapshot of the matched component's hook list (`fiber.memoizedState` linked list). **Hooks have no names.** `hooks[0]` is the value of whatever hook the component declared first, `hooks[1]` second, and so on.

### Resolution recipe

1. Open the matched component's source file (`target.callSite.file`).
2. Read its function body, top to bottom, listing every `useState` / `useReducer` / `useRef` / `useEffect` / `useMemo` / `useContext` / `useCallback` in declaration order.
3. Index that list 0..N. `hooks[i]` corresponds to entry `i`.

### What's in each entry

| Entry shape | Most likely hook | How to read it |
|---|---|---|
| primitive / plain object / array of primitives | `useState` / `useReducer` | This **is** the state value |
| `{ ref: ... }` | `useRef` | `ref` field is the `.current` value |
| `"<effect>"` | `useEffect` / `useLayoutEffect` | Opaque marker; the effect itself isn't useful for replay |
| `"<fn>"` | a memoized function (rare in memoizedState) | Opaque |
| `"<object>"` | something not serializable | Opaque; treat the slot as "present but unknown" |

### Example

```js
// In src/dialogs/ApprovalDialog.tsx
export default function ApprovalDialog({ open, onClose }: Props) {
    const [step, setStep] = useState<"form" | "review" | "done">("form");   // hooks[0]
    const [comment, setComment] = useState("");                              // hooks[1]
    const submitRef = useRef<HTMLButtonElement>(null);                       // hooks[2]
    useEffect(() => { ... }, [open]);                                        // hooks[3]
    ...
}
```

Recorded event:
```json
"hooks": ["review", "Looks good to me", { "ref": null }, "<effect>"]
```

Reads as: *user was on the `review` step, had typed `"Looks good to me"` into the comment field*. Combined with `target.props.open === true` and the chain showing `<ApprovalDialog />`, you know exactly which screen of which dialog the demonstrator was on.

### Cautions

- The walker is **best-effort**. React 18 internals; later versions may shift the shape and the walker will silently return `undefined`.
- Components built with `forwardRef` or `memo` are unwrapped for name resolution, but their hooks list is on the inner function and should still be reached.
- Class components have no hooks — `target.hooks` will be undefined.
- Hook order must match source order. If the component branches its hook calls (it shouldn't, per the Rules of Hooks), all bets are off.

---

## 8. What drives the data (where state lives)

The prototype lifts a lot of state to `src/App.tsx` so it survives page switches. **`App.tsx` is the de-facto data layer.** Read it whenever you need to know:

- which "page" is rendered (`currentPage` state — there's no router)
- what videos exist, their per-video state (`videoStates`), selected video
- what templates exist (`createdTemplates`, `createdTemplateDataByTitle`, `currentTemplateData`)
- enabled / selected languages
- user role, app version, panel visibility
- approvals state, approver lists
- whether various dialogs are open (`approveDialogOpen`, `cancelApprovalDialogOpen`, `accountSettingsOpen`, `videoPermDialogOpen`, …)

Patterns to know:

- Anything passed into a page component as props originates from `App.tsx`.
- Anything a child mutates is plumbed back through callback props.
- Dialog open/close is App-level state; the dialog component receives `open` as a prop. So if `target.props.open === true` on a dialog, the corresponding `App` state was true at that moment.

When the production app uses a real router and a proper data layer, **don't replicate `App.tsx`'s lifted-state pattern verbatim** — recognize it as a prototype shortcut and map each piece to the appropriate production primitive (route param, query, store, server state).

---

## 9. Reproducing the codebase the recording was made against

`log.git` lets a consumer go from "I have this recording" to "I have the exact source the prototype rendered". Recipe:

```bash
git fetch --all --tags
git checkout <log.git.tag || log.git.sha>
npm install        # if package-lock changed
```

The recorder's pre-flight guard refuses to start a recording when the working tree is dirty or the branch is ahead of its remote, so `log.git.sha` is always a remote-reachable commit. (Tag pushing is not currently verified — see §12 caveats.)

If `log.git` is absent, the recording predates this feature or was made in an environment without git. The recording is still usable for structural / textual analysis but you can't pin it to a specific commit.

---

## 10. URL caveat

`event.url` is recorded but rarely informative in this prototype because there's no client-side router. Expect `url` to be the same string on essentially every event. **Do not infer page identity from URL — use the component chain (§4.1).**

The `routeChanged` cue in the player UI exists for future-proofing; today it almost never fires.

---

## 11. End-to-end recipe

Given `(log, tStart, tEnd)`:

```
1.  Slice events: inWindow, lastBefore, firstAfter (skip type:"custom")
2.  Anchor event: 
        primary = inWindow[0] ?? lastBefore
        If still nothing → the window has no usable interaction; expand the range.
3.  Page:
        page = primary.chain.find(c => c.component.endsWith("Page"))
        → source file at page.file
4.  Overlay (if any):
        overlay = primary.chain.find(c => /Dialog$|Panel$|Stepper$/.test(c.component))
        → source file at overlay.file
        If overlay exists, the demonstration is about the overlay, not the page.
5.  Leaf component:
        leaf = primary.target.component
        → source at primary.target.callSite.file:line
6.  Variant determination:
        a. Open primary.target.callSite.file. Read the component signature.
        b. Cross-reference primary.target.props against the prop interface.
        c. List the component's useState/useReducer in declaration order, map
           primary.target.hooks[i] to each. Note opaque slots ("<effect>", "<object>").
        d. If overlay exists, open overlay.file too — its source tells you what
           sub-step / mode the demonstration was in (often a step state machine).
7.  Data origins:
        For each prop whose origin you need: open page.file (or App.tsx), grep for the
        prop name, follow the binding up to where it's defined. See §8.
8.  Behavior the snapshot does NOT show:
        - any onClick / onChange callbacks (functions are dropped from props)
        - any children / JSX-valued props (dropped)
        - any state that lives above the leaf component (read the source)
9.  Disambiguation if two events in the window share component+file:
        - compare target.text, target.props identity fields, target.selector
10. Cross-check with subsequent events:
        - Events firing AFTER the leaf event inside the window often reveal what
          the leaf component DID (e.g. "click VideoCard.Approve" → "click ApprovalDialog.Submit"
          confirms the Approve button opens ApprovalDialog).
```

---

## 12. Caveats & gotchas

- **Prod recordings are degraded.** `_debugSource` is dev-only, so `callSite` and component name resolution depend on the recording being made with a dev build. If you receive a recording where most events have empty `target.component` and no `callSite`, it was made in prod and is much harder to use.
- **The recorder excludes its own UI.** Anything inside `[data-rec-player]` won't appear in events. Don't expect to see player overlay interactions.
- **Bookend events.** The first and last events of the log are `type: "custom"` with `detail.event` of `"recording-started"` / `"recording-stopped"`. Skip them.
- **Truncation markers.** `target.props.__truncated === true` means the props snapshot hit the byte cap; not every prop is represented. `"...+N"` inside arrays / strings ending in `"..."` means truncation. `"<truncated>"`, `"<redacted>"` (for password inputs), `"<fn>"`, `"<effect>"`, `"<object>"`, `"<unserializable>"` are sentinel strings.
- **Synthetic typing.** `type: "input"` events on text fields carry `detail.value` — the value being committed. The recorder *does not* replay each keystroke; one event per committed value.
- **Keydown is filtered.** Only `Escape, Enter, Tab, ArrowUp, ArrowDown, ArrowLeft, ArrowRight` are recorded. Typing is captured via `input` events, not `keydown`.
- **`change` is selectively recorded.** For text inputs we record `input`; for checkboxes / radios / selects / files / colors / ranges we record `change`. Don't expect both.
- **Custom markers.** Developers can call `recordCustomEvent(name, detail)` to drop a labeled marker. These appear as `type: "custom"` with `target.component = name`. Useful for "X dialog opened" beacons that aren't tied to a DOM event.

---

## 13. The component / folder map

To go from a `component` string to a source file, follow this convention (defined in `CLAUDE.md`, "File-organization rules"):

| Folder | Purpose | Examples |
|---|---|---|
| `src/pages/<Area>/` | Page components and everything used only within that area | `VideoLibraryPage`, `VideoCard`, `FolderCard`, `StudioPage`, `CommentsPanel`, `SceneThumbnails` |
| `src/dialogs/` | Modal dialogs (anything opened with `<Dialog>` or `SimpleDialogBase`) | `ApprovalDialog`, `ApproveVideoDialog`, `AddApproverDialog`, `ManageAccessDialog`, `LanguagePickerDialog`, `WorkflowApprovalStepper` |
| `src/panels/` | Floating / docked side panels (NOT editor-scoped) | `NotificationsPanel`, `MediaLibraryPanel`, `AvatarLibraryPanel`, `LanguagesPanel` |
| `src/components/` | Cross-area reusable, imported by 2+ pages or App | `AppSidebar`, `PermAvatarGroup`, `TasksPanel` |
| `src/` (root) | Entry points + the temporary `AccountSettingsDialog.tsx` carve-out | `App.tsx`, `main.tsx`, `theme.ts`, `AccountSettingsDialog.tsx` |

When in doubt, prefer the `callSite.file` value — it tells you exactly where the JSX was written.

---

## 14. Reference: the actual TypeScript types

The authoritative definitions live in `src/recorder/recorder.ts`:

- `RecordingLog`
- `RecordedEvent`
- `EventTarget`
- `ComponentRef`
- `FiberInfo`

If anything in this doc looks off, open that file and trust it over this text.
