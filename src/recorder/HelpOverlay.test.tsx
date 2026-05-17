import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import HelpOverlay, { displayKey, isMacPlatform } from "./HelpOverlay";

function withUserAgent<T>(ua: string, run: () => T): T {
    const orig = Object.getOwnPropertyDescriptor(navigator, "userAgent");
    Object.defineProperty(navigator, "userAgent", { value: ua, configurable: true });
    try {
        return run();
    }
    finally {
        if (orig) {
            Object.defineProperty(navigator, "userAgent", orig);
        }
    }
}

let container: HTMLDivElement | null = null;
let root: Root | null = null;

function mount() {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    act(() => {
        root!.render(<HelpOverlay />);
    });
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

function dispatchQuestionMark(target: EventTarget = window) {
    act(() => {
        target.dispatchEvent(
            new KeyboardEvent("keydown", { key: "?", shiftKey: true, bubbles: true })
        );
    });
}

function helpDialog(): HTMLElement | null {
    // MUI portals dialogs to document.body — search there
    return document.body.querySelector("[role=\"dialog\"]");
}

describe("HelpOverlay", () => {
    beforeEach(() => mount());
    afterEach(() => {
        unmount();
        // The dialog portal lives on document.body; ensure no leftover portals
        document.body.querySelectorAll("[role=\"dialog\"]").forEach(el => el.remove());
        document.body.querySelectorAll(".MuiBackdrop-root").forEach(el => el.remove());
    });

    it("opens when '?' is pressed with focus on the body", () => {
        document.body.focus();
        expect(helpDialog()).toBeNull();
        dispatchQuestionMark();
        expect(helpDialog()).not.toBeNull();
    });

    it("does not open when '?' is pressed while focus is in an input", () => {
        const input = document.createElement("input");
        document.body.appendChild(input);
        input.focus();
        expect(document.activeElement).toBe(input);

        dispatchQuestionMark(input);
        expect(helpDialog()).toBeNull();

        input.remove();
    });

    it("does not open when '?' is pressed while focus is in a textarea", () => {
        const ta = document.createElement("textarea");
        document.body.appendChild(ta);
        ta.focus();

        dispatchQuestionMark(ta);
        expect(helpDialog()).toBeNull();

        ta.remove();
    });

    it("does not open when '?' is pressed while focus is in a contenteditable element", () => {
        const div = document.createElement("div");
        div.setAttribute("contenteditable", "true");
        div.tabIndex = 0;
        document.body.appendChild(div);
        div.focus();

        dispatchQuestionMark(div);
        expect(helpDialog()).toBeNull();

        div.remove();
    });

    it("ignores Ctrl+? and Alt+? — only plain '?' opens the dialog", () => {
        act(() => {
            window.dispatchEvent(
                new KeyboardEvent("keydown", { key: "?", ctrlKey: true, shiftKey: true })
            );
        });
        expect(helpDialog()).toBeNull();

        act(() => {
            window.dispatchEvent(
                new KeyboardEvent("keydown", { key: "?", altKey: true, shiftKey: true })
            );
        });
        expect(helpDialog()).toBeNull();
    });

    it("lists the recorder and playback shortcuts", () => {
        dispatchQuestionMark();
        const dlg = helpDialog();
        expect(dlg).not.toBeNull();
        const text = dlg!.textContent ?? "";
        // The labels themselves
        expect(text).toContain("Start or stop recording");
        expect(text).toContain("playback");
        // Key chips
        expect(text).toContain("Ctrl");
        expect(text).toContain("Alt");
        expect(text).toContain("Shift");
        expect(text).toContain("R");
        expect(text).toContain("P");
    });
});

describe("isMacPlatform", () => {
    it("returns true for a Mac userAgent", () => {
        withUserAgent(
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15",
            () => expect(isMacPlatform()).toBe(true)
        );
    });

    it("returns true for an iPad userAgent", () => {
        withUserAgent(
            "Mozilla/5.0 (iPad; CPU OS 16_0 like Mac OS X) AppleWebKit/605.1.15",
            () => expect(isMacPlatform()).toBe(true)
        );
    });

    it("returns false for a Windows userAgent", () => {
        withUserAgent(
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            () => expect(isMacPlatform()).toBe(false)
        );
    });

    it("returns false for a Linux userAgent", () => {
        withUserAgent(
            "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36",
            () => expect(isMacPlatform()).toBe(false)
        );
    });
});

describe("displayKey", () => {
    it("returns the key unchanged on non-Mac", () => {
        expect(displayKey("Ctrl", false)).toBe("Ctrl");
        expect(displayKey("Alt", false)).toBe("Alt");
        expect(displayKey("Shift", false)).toBe("Shift");
        expect(displayKey("R", false)).toBe("R");
        expect(displayKey("?", false)).toBe("?");
    });

    it("maps modifier keys to Mac glyphs on Mac", () => {
        expect(displayKey("Ctrl", true)).toBe("⌃");
        expect(displayKey("Alt", true)).toBe("⌥");
        expect(displayKey("Shift", true)).toBe("⇧");
        expect(displayKey("Cmd", true)).toBe("⌘");
        expect(displayKey("Meta", true)).toBe("⌘");
    });

    it("maps named keys to their Mac glyphs", () => {
        expect(displayKey("Enter", true)).toBe("⏎");
        expect(displayKey("Escape", true)).toBe("⎋");
        expect(displayKey("Backspace", true)).toBe("⌫");
        expect(displayKey("Tab", true)).toBe("⇥");
        expect(displayKey("ArrowUp", true)).toBe("↑");
    });

    it("passes through non-modifier letter keys unchanged on Mac", () => {
        expect(displayKey("R", true)).toBe("R");
        expect(displayKey("P", true)).toBe("P");
        expect(displayKey("?", true)).toBe("?");
    });
});
