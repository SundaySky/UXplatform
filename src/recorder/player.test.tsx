import { act, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
    isRecording,
    startRecording,
    stopRecording,
    type RecordingLog
} from "./recorder";
import {
    getSnapshot,
    loadLog,
    next,
    play,
    setOptions,
    unload
} from "./player";

// ─── Fixtures ───────────────────────────────────────────────────────────────
function ApproveButton({ onClick }: { onClick: () => void }) {
    return <button onClick={onClick}>Approve</button>;
}

function CancelButton({ onClick }: { onClick: () => void }) {
    return <button onClick={onClick}>Cancel</button>;
}

function PlayerLookalike() {
    // Simulates the player's own UI being in the DOM during replay. The matcher
    // must NOT route a recorded "Approve" click here even if text matches.
    return (
        <div data-rec-player="true">
            <button>Approve</button>
        </div>
    );
}

function NameField() {
    const [v, setV] = useState("");
    return <input aria-label="name" value={v} onChange={e => setV(e.target.value)} />;
}

// ─── DOM render helpers ─────────────────────────────────────────────────────
let containers: HTMLDivElement[] = [];
let roots: Root[] = [];

function mount(node: React.ReactNode): HTMLDivElement {
    const c = document.createElement("div");
    document.body.appendChild(c);
    const r = createRoot(c);
    act(() => {
        r.render(node);
    });
    containers.push(c);
    roots.push(r);
    return c;
}

function unmountAll() {
    for (const r of roots) {
        act(() => r.unmount());
    }
    for (const c of containers) {
        c.remove();
    }
    roots = [];
    containers = [];
}

// Stub URL.createObjectURL for stopRecording's blob download
function withStubbedDownload<T>(run: () => T): T {
    const origCreate = URL.createObjectURL;
    const origRevoke = URL.revokeObjectURL;
    URL.createObjectURL = vi.fn(() => "blob:test");
    URL.revokeObjectURL = vi.fn();
    try {
        return run();
    }
    finally {
        URL.createObjectURL = origCreate;
        URL.revokeObjectURL = origRevoke;
    }
}

// Native value setter — same trick the player uses, here so tests can simulate
// real user typing into a React-controlled input during the recording phase.
function setNativeValue(el: HTMLInputElement, value: string) {
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;
    setter?.call(el, value);
}

// Advance the player one non-custom event (i.e., skip the recording-started bookend)
async function nextNonCustom() {
    let guard = 0;
    while (guard < 20) {
        const snap = getSnapshot();
        if (!snap.log || snap.index >= snap.log.events.length) {
            return;
        }
        const ev = snap.log.events[snap.index];
        await next();
        if (ev.type !== "custom") {
            return;
        }
        guard += 1;
    }
}

describe("player", () => {
    beforeEach(() => {
        if (isRecording()) {
            withStubbedDownload(() => stopRecording());
        }
        unload();
        // Make tests fast: no waiting, no cursor highlight delay
        setOptions({ waitForElementMs: 250, highlightMs: 0, cursorEnabled: false, speed: 1000 });
    });

    afterEach(() => {
        if (isRecording()) {
            withStubbedDownload(() => stopRecording());
        }
        unload();
        unmountAll();
    });

    it("replays a click on the correct component", async () => {
        let recordCount = 0;
        let replayCount = 0;

        const c = mount(<ApproveButton onClick={() => {
            recordCount += 1; 
        }} />);
        startRecording();
        c.querySelector("button")!.click();
        const log = withStubbedDownload(() => stopRecording()) as RecordingLog;
        expect(recordCount).toBe(1);

        // Re-render with a fresh handler so we can see the replayed click
        unmountAll();
        mount(<ApproveButton onClick={() => {
            replayCount += 1; 
        }} />);

        loadLog(log);
        await nextNonCustom(); // dispatch the recorded click
        expect(replayCount).toBe(1);
    });

    it("distinguishes between two same-text buttons by component name", async () => {
        let approveHits = 0;
        let cancelHits = 0;

        const c = mount(
            <>
                <ApproveButton onClick={() => {
                    approveHits += 1; 
                }} />
                <CancelButton onClick={() => {
                    cancelHits += 1; 
                }} />
            </>
        );

        startRecording();
        // Click only the Cancel button
        const buttons = c.querySelectorAll("button");
        (buttons[1] as HTMLButtonElement).click();
        const log = withStubbedDownload(() => stopRecording()) as RecordingLog;
        expect(cancelHits).toBe(1);
        expect(approveHits).toBe(0);

        // Reset hit counts
        unmountAll();
        approveHits = 0;
        cancelHits = 0;
        mount(
            <>
                <ApproveButton onClick={() => {
                    approveHits += 1; 
                }} />
                <CancelButton onClick={() => {
                    cancelHits += 1; 
                }} />
            </>
        );

        loadLog(log);
        await nextNonCustom();
        expect(cancelHits).toBe(1);
        expect(approveHits).toBe(0);
    });

    it("ignores elements inside data-rec-player containers when matching", async () => {
        // Record a click on the real Approve button
        let realHits = 0;
        const c = mount(<ApproveButton onClick={() => {
            realHits += 1; 
        }} />);
        startRecording();
        c.querySelector("button")!.click();
        const log = withStubbedDownload(() => stopRecording()) as RecordingLog;

        // Now in the replay DOM, place a lookalike inside data-rec-player.
        // Without exclusion, the matcher could route the click there.
        unmountAll();
        realHits = 0;
        let lookalikeHits = 0;
        mount(
            <>
                <ApproveButton onClick={() => {
                    realHits += 1; 
                }} />
                <div onClick={() => {
                    lookalikeHits += 1; 
                }}>
                    <PlayerLookalike />
                </div>
            </>
        );

        loadLog(log);
        await nextNonCustom();
        expect(realHits).toBe(1);
        expect(lookalikeHits).toBe(0);
    });

    it("replays an input event into a React-controlled input via the native setter", async () => {
        const c = mount(<NameField />);
        const input = c.querySelector("input") as HTMLInputElement;

        startRecording();
        setNativeValue(input, "Zoe");
        input.dispatchEvent(new Event("input", { bubbles: true }));
        const log = withStubbedDownload(() => stopRecording()) as RecordingLog;
        expect(input.value).toBe("Zoe");

        // Re-mount the field — value resets to empty
        unmountAll();
        const c2 = mount(<NameField />);
        const input2 = c2.querySelector("input") as HTMLInputElement;
        expect(input2.value).toBe("");

        loadLog(log);
        await nextNonCustom();
        // React state actually updated, not just the DOM value
        expect(input2.value).toBe("Zoe");
    });

    it("reports outcome=no-target when the recorded element is gone", async () => {
        const c = mount(<ApproveButton onClick={() => {}} />);
        startRecording();
        c.querySelector("button")!.click();
        const log = withStubbedDownload(() => stopRecording()) as RecordingLog;

        // Unmount, so the target is no longer in the DOM
        unmountAll();
        loadLog(log);
        await nextNonCustom();
        const snap = getSnapshot();
        expect(snap.lastOutcome?.outcome).toBe("no-target");
    });

    it("scrubs through the event list via play and reaches finished", async () => {
        mount(<ApproveButton onClick={() => {}} />);
        startRecording();
        document.querySelector("button")!.click();
        document.querySelector("button")!.click();
        const log = withStubbedDownload(() => stopRecording()) as RecordingLog;

        loadLog(log);
        play();
        // Drain with a polling wait
        await new Promise<void>(resolve => {
            const id = setInterval(() => {
                if (getSnapshot().status === "finished") {
                    clearInterval(id);
                    resolve();
                }
            }, 20);
        });
        const snap = getSnapshot();
        expect(snap.status).toBe("finished");
        expect(snap.index).toBe(log.events.length);
    });
});
