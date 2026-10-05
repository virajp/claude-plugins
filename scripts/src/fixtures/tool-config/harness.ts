/**
 * The tool-config suites' shared harness: a temp git repo, a fake `mise` on
 * PATH that records every call and answers from FAKE_MISE_* switches, and
 * the script run for real against them. No real mise runs in these suites.
 */
import { spawnSync } from "node:child_process";
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { expect } from "vitest";

export const pluginRoot = join(
  import.meta.dirname,
  "..",
  "..",
  "..",
  "..",
  "plugins",
  "stackgen",
);
export const skillDir = join(pluginRoot, "skills", "tool-config");
export const stacksDir = join(pluginRoot, "stacks");
const script = join(skillDir, "scripts", "tool-config.mjs");

/**
 * Records each call as `MISE_ENV=<v> <argv>` in $FAKE_MISE_LOG. `latest`
 * answers $FAKE_MISE_LATEST (default 1.2.3); a dprint `--stdin` call echoes
 * its input; FAKE_MISE_* switches pick failures.
 */
const FAKE_MISE = `#!/bin/sh
echo "MISE_ENV=\${MISE_ENV:-} $*" >> "$FAKE_MISE_LOG"
case "$1" in
  trust)
    p=$(pwd -P); h=$(cd "$HOME" && pwd -P)
    case "$p" in "$h" | "$h"/*) p="~\${p#"$h"}" ;; esac
    [ -n "$FAKE_MISE_UNTRUSTED" ] && echo "$p/.config/mise.toml: untrusted"
    exit 0 ;;
  which)
    [ "$2" = "$FAKE_MISE_MISSING" ] && { echo "mise ERROR $2 is not a mise bin" >&2; exit 1; }
    echo "/fake/bin/$2"
    exit 0 ;;
  latest)
    [ -n "$FAKE_MISE_LATEST_FAIL" ] && { echo "no such tool" >&2; exit 1; }
    echo "\${FAKE_MISE_LATEST:-1.2.3}"
    exit 0 ;;
  run)
    [ -n "$FAKE_MISE_SETUP_FAIL" ] && { echo "setup:all broke" >&2; exit 1; }
    exit 0 ;;
  x)
    [ "$2" = "--" ] || exit 1
    if [ "$3" = dprint ]; then
      if [ "$7" = "--stdin" ]; then cat; exit 0; fi
      shift 7
      if [ -n "$FAKE_MISE_FMT" ]; then for f; do echo "# formatted" >> "$f"; done; fi
      exit 0
    fi
    [ "$3" = pre-commit ] && [ -z "$FAKE_MISE_INVALID" ] && exit 0
    echo "invalid config" >&2
    exit 1 ;;
esac
exit 1
`;

export interface Row {
  id: string;
  kind: string;
  answers: string[];
  path?: string;
  added?: string[];
  removed?: string[];
  [key: string]: unknown;
}
export interface Out {
  error?: string;
  rows?: Row[];
  written?: string[];
  deleted?: string[];
  preview?: boolean;
  notes?: string[];
  [key: string]: unknown;
}

export interface Harness {
  repo: string;
  root: string;
  miseLog: string;
  env: Record<string, string>;
  run(
    args: string[],
    env?: Record<string, string>,
  ): { status: number | null; out: Out; };
  apply(
    args: string[],
    pick?: (row: Row) => string,
    env?: Record<string, string>,
  ): { status: number | null; out: Out; };
  read(path: string): string;
  write(path: string, text: string): void;
  log(): string[];
  cleanup(): void;
}

/** A fresh repo with an `origin`, a fake mise, and the script bound to both. */
export function harness(name: string): Harness {
  const root = mkdtempSync(join(tmpdir(), `tool-config-${name}-`));
  const repo = join(root, "repo");
  mkdirSync(repo);
  spawnSync("git", ["init", "-q"], { cwd: repo });
  spawnSync(
    "git",
    ["remote", "add", "origin", "git@github.com:acme/widget.git"],
    { cwd: repo },
  );
  const fakeBin = join(root, "bin");
  mkdirSync(fakeBin);
  writeFileSync(join(fakeBin, "mise"), FAKE_MISE, { mode: 0o755 });
  const miseLog = join(root, "mise.log");

  const h: Harness = {
    repo,
    root,
    miseLog,
    env: {},
    run(args, env = {}) {
      const res = spawnSync(process.execPath, [
        script,
        ...args,
        "--repo-root",
        repo,
      ], {
        cwd: root,
        encoding: "utf8",
        maxBuffer: 64 * 1024 * 1024,
        timeout: 20_000,
        env: {
          PATH: `${fakeBin}:${process.env["PATH"] ?? ""}`,
          HOME: root,
          FAKE_MISE_LOG: miseLog,
          ...h.env,
          ...env,
        },
      });
      let out: Out;
      try {
        out = JSON.parse(res.stdout) as Out;
      }
      catch {
        throw new Error(
          `not JSON (exit ${res.status}): ${res.stdout}\n${res.stderr}`,
        );
      }
      return { status: res.status, out };
    },
    apply(args, pick = row => row.answers[0] ?? "ok", env = {}) {
      const preview = h.run(["preview", ...args], env);
      expect(preview.out.error).toBeUndefined();
      expect(preview.status).toBe(0);
      const rows = preview.out.rows ?? [];
      if (rows.length === 0) {
        return h.run(args, env);
      }
      return h.run([
        ...args,
        "--answers",
        rows.map(r => `${r.id}:${pick(r)}`).join(","),
      ], env);
    },
    read: path => readFileSync(join(repo, path), "utf8"),
    write(path, text) {
      mkdirSync(join(repo, path, ".."), { recursive: true });
      writeFileSync(join(repo, path), text);
    },
    log: () => {
      try {
        return readFileSync(miseLog, "utf8").trimEnd().split("\n");
      }
      catch {
        return [];
      }
    },
    cleanup: () => rmSync(root, { recursive: true, force: true }),
  };
  return h;
}

/** The `all` call a node repo with two members and two scopes makes. */
export const NODE_ALL = [
  "all",
  "--repo-name",
  "widget",
  "--node",
  "true",
  "--members",
  "apps/web,svc/API_x",
  "--scopes",
  "web,api",
];
