import type { Plugin } from "vite";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileP = promisify(execFile);

export type GitStatusPayload = {
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
    /** Sample of dirty/untracked files in `git status --porcelain` form, capped. */
    dirtyFiles: string[];
    error?: string;
};

async function git(args: string[]): Promise<{ ok: true; out: string } | { ok: false }> {
    try {
        const { stdout } = await execFileP("git", args, { timeout: 5000 });
        return { ok: true, out: stdout.trim() };
    } catch {
        return { ok: false };
    }
}

async function readGitStatus(): Promise<GitStatusPayload> {
    const payload: GitStatusPayload = {
        available: false,
        branch: "",
        sha: "",
        isClean: false,
        hasUpstream: false,
        ahead: 0,
        behind: 0,
        isOnTag: false,
        currentTag: null,
        latestTag: null,
        dirtyFiles: []
    };

    // The branch lookup is also our "is git available + are we in a repo" probe.
    const branch = await git(["rev-parse", "--abbrev-ref", "HEAD"]);
    if (!branch.ok) {
        payload.error = "git is not installed or this folder is not a git repository";
        return payload;
    }
    payload.available = true;
    payload.branch = branch.out;

    const sha = await git(["rev-parse", "HEAD"]);
    if (sha.ok) {
        payload.sha = sha.out;
    }

    const porcelain = await git(["status", "--porcelain"]);
    if (porcelain.ok) {
        const lines = porcelain.out ? porcelain.out.split("\n") : [];
        payload.isClean = lines.length === 0;
        payload.dirtyFiles = lines.slice(0, 10);
    }

    const upstream = await git(["rev-parse", "--abbrev-ref", "--symbolic-full-name", "@{u}"]);
    if (upstream.ok) {
        payload.hasUpstream = true;
        const ahead = await git(["rev-list", "--count", "@{u}..HEAD"]);
        const behind = await git(["rev-list", "--count", "HEAD..@{u}"]);
        if (ahead.ok) {
            payload.ahead = Number(ahead.out) || 0;
        }
        if (behind.ok) {
            payload.behind = Number(behind.out) || 0;
        }
    }

    const exactTag = await git(["describe", "--tags", "--exact-match", "HEAD"]);
    if (exactTag.ok) {
        payload.isOnTag = true;
        payload.currentTag = exactTag.out;
    }

    const recentTag = await git(["describe", "--tags", "--abbrev=0"]);
    if (recentTag.ok) {
        payload.latestTag = recentTag.out;
    }

    return payload;
}

/**
 * Dev-server only. Exposes `/__git-status` returning a snapshot of the working
 * copy so the in-browser recorder guard can decide whether starting a recording
 * is safe (committed + pushed + preferably tagged).
 */
export function gitStatusPlugin(): Plugin {
    return {
        name: "uxplatform-git-status",
        apply: "serve",
        configureServer(server) {
            server.middlewares.use("/__git-status", async (_req, res) => {
                try {
                    const data = await readGitStatus();
                    res.setHeader("Content-Type", "application/json");
                    res.setHeader("Cache-Control", "no-store");
                    res.end(JSON.stringify(data));
                } catch (e) {
                    res.statusCode = 500;
                    res.setHeader("Content-Type", "application/json");
                    res.end(JSON.stringify({ available: false, error: String(e) }));
                }
            });
        }
    };
}
