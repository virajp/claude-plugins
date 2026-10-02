// Every tool the script runs, it runs through mise, in the repo root: a tool
// only ever as `mise x -- <tool> …`, the version the repo's config pins —
// never `mise x <tool>@… --`, which can install a version the config does not
// name — and never before `mise which <tool>` says it is installed. The repo's
// mise config is trusted by the person beforehand; the script reads that
// trust and never grants it.

import { spawnSync } from "node:child_process";
import {
  realpathSync,
  statSync,
} from "node:fs";
import {
  delimiter,
  join,
  sep,
} from "node:path";
import { RefusalError } from "./rows.mjs";

export const MISSING_MISE =
  "mise is not on PATH — install mise (https://mise.jdx.dev), then re-run.";

/** What installs every tool the repo's mise config pins. */
export const SETUP_REMEDY = "MISE_ENV=dev mise run setup:all";

const TRUST_REMEDY =
  "trust it — add the repo's path to trusted_config_paths in the global mise config, or run `mise trust --all` in the repo — then re-run";

/** The last lines of a command's output, enough to say why it failed. */
function tail(res) {
  const text = `${res.stdout ?? ""}${res.stderr ?? ""}`.trim();
  return text.length > 4000 ? `…${text.slice(-4000)}` : text;
}

export function onPath(bin, path = process.env.PATH ?? "") {
  return path.split(delimiter).some(dir => {
    try {
      return dir && statSync(join(dir, bin)).isFile();
    }
    catch {
      return false;
    }
  });
}

export class Runner {
  constructor(repoRoot) {
    this.repoRoot = repoRoot;
    this.installed = new Set();
  }

  mise(args, env = {}) {
    const res = spawnSync("mise", args, {
      cwd: this.repoRoot,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
      maxBuffer: 64 * 1024 * 1024,
      env: { ...process.env, ...env },
    });
    if (res.error?.code === "ENOENT") {
      throw new RefusalError(MISSING_MISE);
    }
    if (res.error) {
      throw res.error;
    }
    return res;
  }

  /**
   * Refuse when mise reads any config at or under the repo root as untrusted.
   * Without mise on PATH there is nothing to ask — a call that needs mise is
   * refused where it does.
   */
  trust() {
    if (!onPath("mise")) {
      return;
    }
    const res = this.mise(["trust", "--show"]);
    const root = realpathSync(this.repoRoot);
    const untrusted = `${res.stdout ?? ""}`
      .split("\n")
      .map(l => /^(.*): untrusted$/.exec(l.trim())?.[1])
      .filter(p => p && (p === root || p.startsWith(root + sep)));
    if (untrusted.length) {
      throw new RefusalError(
        `the repo's mise config is not trusted (${
          untrusted.join(", ")
        }) — ${TRUST_REMEDY}`,
      );
    }
  }

  /** Refuse unless the repo's mise config has `tool` installed. */
  ensure(tool) {
    if (this.installed.has(tool)) {
      return;
    }
    const res = this.mise(["which", tool]);
    if (res.status !== 0) {
      throw new RefusalError(
        `${tool} is not installed by the repo's mise config — run ${SETUP_REMEDY}, then re-run`,
      );
    }
    this.installed.add(tool);
  }

  /** `mise x -- <tool> <args>` in the repo root, the one form a tool runs in; a failure refuses. */
  tool(tool, args) {
    this.ensure(tool);
    const res = this.mise(["x", "--", tool, ...args]);
    if (res.status !== 0) {
      throw new RefusalError(
        `mise x -- ${tool} ${args.join(" ")} failed:\n${tail(res)}`,
      );
    }
    return res;
  }

  /** `MISE_ENV=dev mise run setup:all` — installs and sets up everything the repo pins. */
  setupAll() {
    const res = this.mise(["run", "setup:all"], { MISE_ENV: "dev" });
    return { ok: res.status === 0, output: tail(res) };
  }
}
