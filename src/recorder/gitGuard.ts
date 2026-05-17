// Browser-side guard that asks the Vite dev server whether the working copy is
// safe to record from (committed + pushed + ideally tagged). Pairs with the
// gitStatusPlugin in vite-plugins/git-status.ts.

export type GitStatus = {
    available: boolean;
    branch: string;
    sha: string;
    isClean: boolean;
    hasUpstream: boolean;
    ahead: number;
    behind: number;
    isOnTag: boolean;
    currentTag: string | null;
    latestTag: string | null;
    dirtyFiles: string[];
    error?: string;
};

export type GuardVerdict = {
    severity: "ok" | "warn" | "block";
    title: string;
    reasons: string[];
    suggestion: string;
    status: GitStatus | null;
};

export async function fetchGitStatus(): Promise<GitStatus | null> {
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 10_000);
    try {
        const res = await fetch("/__git-status", { signal: controller.signal });
        if (!res.ok) {
            return null;
        }
        return (await res.json()) as GitStatus;
    }
    catch {
        return null;
    }
    finally {
        window.clearTimeout(timer);
    }
}

export function evaluateGitStatus(s: GitStatus | null): GuardVerdict {
    // Infra failure: never block on it — fall back to a warning so users aren't
    // locked out by a missing endpoint or a transient network blip.
    if (!s) {
        return {
            severity: "warn",
            title: "Couldn't check the project state",
            reasons: ["The dev server didn't respond to the git-status check."],
            suggestion:
                "Recordings should be made from code that's committed and pushed, otherwise nobody can match them to a known version later. " +
                "You can start anyway, but if the code isn't pushed the recording won't be reproducible.",
            status: null
        };
    }

    if (!s.available) {
        return {
            severity: "warn",
            title: "This project isn't a git repository",
            reasons: [s.error ?? "git is not available."],
            suggestion:
                "Recordings are linked to a specific commit so consumers can find the matching code. " +
                "Without git there's no way to make that link.",
            status: s
        };
    }

    const blockers: string[] = [];

    if (!s.isClean) {
        const n = s.dirtyFiles.length;
        const examples = s.dirtyFiles.slice(0, 3)
            .map(l => l.replace(/^.{2,3}/, "").trim())
            .filter(Boolean)
            .join(", ");
        blockers.push(
            `There ${n === 1 ? "is" : "are"} uncommitted change${n === 1 ? "" : "s"} ` +
            `(${n}${n >= 10 ? "+" : ""} file${n === 1 ? "" : "s"}${examples ? ": " + examples : ""}).`
        );
    }

    if (!s.hasUpstream) {
        blockers.push(`Branch "${s.branch}" hasn't been pushed yet — it has no upstream on the remote.`);
    }
    else if (s.ahead > 0) {
        blockers.push(
            `Branch "${s.branch}" is ${s.ahead} commit${s.ahead === 1 ? "" : "s"} ahead of the remote (not pushed).`
        );
    }

    if (blockers.length) {
        return {
            severity: "block",
            title: "Can't start recording — commit and push first",
            reasons: blockers,
            suggestion:
                "Recordings are linked to a specific commit on the remote so other tools can find the matching code. " +
                "Ask a developer to commit and push the current changes, then try again.",
            status: s
        };
    }

    if (!s.isOnTag) {
        const shortSha = s.sha.slice(0, 7);
        const tagNote = s.latestTag ? ` The latest tag in the repo is "${s.latestTag}".` : "";
        return {
            severity: "warn",
            title: "Recording from an untagged commit",
            reasons: [
                `You're on commit ${shortSha} of "${s.branch}" — committed and pushed, but not tagged.${tagNote}`
            ],
            suggestion:
                "Tagged commits are easier to reproduce later. Ask a developer to tag this commit before recording, " +
                "or start anyway if this recording is just for short-term reference.",
            status: s
        };
    }

    return {
        severity: "ok",
        title: "Ready to record",
        reasons: [],
        suggestion: "",
        status: s
    };
}
