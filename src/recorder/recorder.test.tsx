import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
    isRecording,
    recordCustomEvent,
    startRecording,
    stopRecording,
    suggestedFilename,
    type RecordingLog
} from "./recorder";

function ApproveButton({ label }: { label: string }) {
    return <button>{label}</button>;
}

function DemoFixture() {
    return (
        <div>
            <ApproveButton label="Approve" />
            <input aria-label="title" defaultValue="" />
        </div>
    );
}

// ─── DOM render helpers ─────────────────────────────────────────────────────
let container: HTMLDivElement | null = null;
let root: Root | null = null;

function mount(node: React.ReactNode) {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    act(() => {
        root!.render(node);
    });
    return container;
}

function unmount() {
    if (root) {
        act(() => {
            root!.unmount();
        });
        root = null;
    }
    if (container) {
        container.remove();
        container = null;
    }
}

// stopRecording creates a Blob URL and clicks an anchor — stub those out in jsdom
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

describe("recorder", () => {
    beforeEach(() => {
        if (isRecording()) {
            withStubbedDownload(() => stopRecording());
        }
    });

    afterEach(() => {
        if (isRecording()) {
            withStubbedDownload(() => stopRecording());
        }
        unmount();
    });

    it("captures click events and maps them to the React component name + call-site file", () => {
        const c = mount(<DemoFixture />);
        const button = c.querySelector("button")!;

        startRecording();
        button.click();
        const log = withStubbedDownload(() => stopRecording()) as RecordingLog;

        const clicks = log.events.filter(e => e.type === "click");
        expect(clicks.length).toBe(1);
        const ev = clicks[0];
        expect(ev.target.component).toBe("ApproveButton");
        expect(ev.target.text).toBe("Approve");
        expect(ev.target.tag).toBe("button");
        expect(ev.target.callSite?.file).toMatch(/recorder\.test/);
    });

    it("captures input changes with the typed value", () => {
        const c = mount(<DemoFixture />);
        const input = c.querySelector("input")!;

        startRecording();
        input.value = "Hello world";
        input.dispatchEvent(new Event("input", { bubbles: true }));
        const log = withStubbedDownload(() => stopRecording()) as RecordingLog;

        const inputs = log.events.filter(e => e.type === "input");
        expect(inputs.length).toBe(1);
        expect(inputs[0].detail?.value).toBe("Hello world");
        expect(inputs[0].target.tag).toBe("input");
    });

    it("records custom events from app code", () => {
        startRecording();
        recordCustomEvent("ApprovalDialog", { state: "opened", videoId: "v123" });
        const log = withStubbedDownload(() => stopRecording()) as RecordingLog;

        const custom = log.events.filter(e => e.type === "custom" && e.target.component === "ApprovalDialog");
        expect(custom.length).toBe(1);
        expect(custom[0].detail?.state).toBe("opened");
        expect(custom[0].detail?.videoId).toBe("v123");
    });

    it("produces a log with metadata + monotonic ms offsets", () => {
        const c = mount(<DemoFixture />);
        startRecording();
        c.querySelector("button")!.click();
        const input = c.querySelector("input")!;
        input.value = "x";
        input.dispatchEvent(new Event("input", { bubbles: true }));
        const log = withStubbedDownload(() => stopRecording()) as RecordingLog;

        expect(log.startedAt).toEqual(expect.any(String));
        expect(log.endedAt).toEqual(expect.any(String));
        expect(log.durationMs).toBeGreaterThanOrEqual(0);
        expect(log.eventCount).toBe(log.events.length);
        expect(log.events[0].type).toBe("custom");
        expect(log.events[log.events.length - 1].type).toBe("custom");
        for (let i = 1; i < log.events.length; i += 1) {
            expect(log.events[i].t).toBeGreaterThanOrEqual(log.events[i - 1].t);
        }
    });

    it("isRecording reflects start/stop state", () => {
        expect(isRecording()).toBe(false);
        startRecording();
        expect(isRecording()).toBe(true);
        withStubbedDownload(() => stopRecording());
        expect(isRecording()).toBe(false);
    });

    it("embeds git info in the log when supplied at start", () => {
        startRecording({
            branch: "main",
            sha: "abcdef1234567890abcdef1234567890abcdef12",
            tag: "v1.2.0"
        });
        const log = withStubbedDownload(() => stopRecording()) as RecordingLog;
        expect(log.git).toEqual({
            branch: "main",
            sha: "abcdef1234567890abcdef1234567890abcdef12",
            tag: "v1.2.0"
        });
    });

    it("omits git info when not supplied", () => {
        startRecording();
        const log = withStubbedDownload(() => stopRecording()) as RecordingLog;
        expect(log.git).toBeUndefined();
    });

    it("includes tag and short sha in the suggested filename", () => {
        const log: RecordingLog = {
            startedAt: "2026-05-17T10:00:00.000Z",
            endedAt: "2026-05-17T10:00:30.000Z",
            durationMs: 30000,
            eventCount: 0,
            initialUrl: "http://localhost/",
            userAgent: "test",
            git: {
                branch: "main",
                sha: "abcdef1234567890abcdef1234567890abcdef12",
                tag: "v1.2.0"
            },
            events: []
        };
        expect(suggestedFilename(log)).toBe(
            "recording-2026-05-17T10-00-00-000Z-v1.2.0-abcdef1.json"
        );
    });

    it("falls back to timestamp-only filename when git info is absent", () => {
        const log: RecordingLog = {
            startedAt: "2026-05-17T10:00:00.000Z",
            endedAt: "2026-05-17T10:00:30.000Z",
            durationMs: 30000,
            eventCount: 0,
            initialUrl: "http://localhost/",
            userAgent: "test",
            events: []
        };
        expect(suggestedFilename(log)).toBe("recording-2026-05-17T10-00-00-000Z.json");
    });

    it("includes short sha without tag when commit isn't tagged", () => {
        const log: RecordingLog = {
            startedAt: "2026-05-17T10:00:00.000Z",
            endedAt: "2026-05-17T10:00:30.000Z",
            durationMs: 30000,
            eventCount: 0,
            initialUrl: "http://localhost/",
            userAgent: "test",
            git: {
                branch: "main",
                sha: "abcdef1234567890abcdef1234567890abcdef12",
                tag: null
            },
            events: []
        };
        expect(suggestedFilename(log)).toBe(
            "recording-2026-05-17T10-00-00-000Z-abcdef1.json"
        );
    });
});
