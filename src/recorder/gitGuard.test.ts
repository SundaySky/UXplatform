import { describe, expect, it } from "vitest";
import { evaluateGitStatus, type GitStatus } from "./gitGuard";

function status(overrides: Partial<GitStatus> = {}): GitStatus {
    return {
        available: true,
        branch: "main",
        sha: "abcdef1234567890abcdef1234567890abcdef12",
        isClean: true,
        hasUpstream: true,
        ahead: 0,
        behind: 0,
        isOnTag: false,
        currentTag: null,
        latestTag: null,
        dirtyFiles: [],
        ...overrides
    };
}

describe("evaluateGitStatus", () => {
    it("returns ok when committed, pushed, and on a tag", () => {
        const v = evaluateGitStatus(status({ isOnTag: true, currentTag: "v1.2.0" }));
        expect(v.severity).toBe("ok");
    });

    it("warns when committed and pushed but not tagged", () => {
        const v = evaluateGitStatus(status({ latestTag: "v1.1.0" }));
        expect(v.severity).toBe("warn");
        expect(v.title).toMatch(/untagged/i);
        expect(v.reasons.join(" ")).toContain("abcdef1");
        expect(v.reasons.join(" ")).toContain("v1.1.0");
    });

    it("blocks when the working tree is dirty", () => {
        const v = evaluateGitStatus(
            status({ isClean: false, dirtyFiles: [" M src/App.tsx", "?? new-file.ts"] })
        );
        expect(v.severity).toBe("block");
        expect(v.reasons.join(" ")).toContain("uncommitted");
        expect(v.reasons.join(" ")).toContain("src/App.tsx");
    });

    it("blocks when the branch has no upstream", () => {
        const v = evaluateGitStatus(status({ hasUpstream: false, branch: "feature/foo" }));
        expect(v.severity).toBe("block");
        expect(v.reasons.join(" ")).toContain("feature/foo");
        expect(v.reasons.join(" ")).toMatch(/hasn't been pushed|no upstream/i);
    });

    it("blocks when the branch is ahead of the remote", () => {
        const v = evaluateGitStatus(status({ ahead: 3 }));
        expect(v.severity).toBe("block");
        expect(v.reasons.join(" ")).toContain("3 commits");
    });

    it("warns (does not block) when git status cannot be fetched", () => {
        const v = evaluateGitStatus(null);
        expect(v.severity).toBe("warn");
        expect(v.title).toMatch(/couldn't check/i);
    });

    it("warns (does not block) when the folder is not a git repo", () => {
        const v = evaluateGitStatus(status({ available: false, error: "not a repo" }));
        expect(v.severity).toBe("warn");
        expect(v.reasons.join(" ")).toContain("not a repo");
    });

    it("reports all blockers, not just the first", () => {
        const v = evaluateGitStatus(
            status({ isClean: false, dirtyFiles: [" M App.tsx"], ahead: 2 })
        );
        expect(v.severity).toBe("block");
        expect(v.reasons.length).toBeGreaterThanOrEqual(2);
    });
});
