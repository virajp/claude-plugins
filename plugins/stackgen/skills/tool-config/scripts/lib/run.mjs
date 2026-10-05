// Every tool the script runs, it runs through mise, in the repo root: a tool
// only ever as `MISE_ENV=dev mise x -- <tool> …`, the version the repo's config pins —
// never `mise x <tool>@… --`, which can install a version the config does not
// name — and never before `mise which <tool>` says it is installed. The repo's
// mise config is trusted by the person beforehand; the script reads that
// trust and never grants it.

import { spawnSync } from "node:child_process";
import {
  realpathSync,
  statSync,
} from "node:fs";
import { homedir } from "node:os";
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

/** dprint and pre-commit are pinned in conf.d/_base/mise.dev.toml — every tool runs in dev. */
const TOOL_ENV = { MISE_ENV: "dev" };

/** A path as mise prints it — `~/…` under the home directory — made real for comparing. */
function realOf(printed) {
  const abs = printed === "~" || printed.startsWith("~/")
    ? join(homedir(), printed.slice(1))
    : printed;
  try {
    return realpathSync(abs);
  }
  catch {
    return abs;
  }
}

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
      .filter(p => {
        const real = p && realOf(p);
        return real && (real === root || real.startsWith(root + sep));
      });
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
    const res = this.mise(["which", tool], TOOL_ENV);
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
    const res = this.mise(["x", "--", tool, ...args], TOOL_ENV);
    if (res.status !== 0) {
      throw new RefusalError(
        `mise x -- ${tool} ${args.join(" ")} failed:\n${tail(res)}`,
      );
    }
    return res;
  }

  /** Whether the repo's mise config has `tool` installed — asked once, never refused. */
  has(tool) {
    if (!onPath("mise")) {
      return false;
    }
    try {
      this.ensure(tool);
      return true;
    }
    catch (e) {
      if (e instanceof RefusalError) {
        return false;
      }
      throw e;
    }
  }

  /**
   * `text` as the repo's formatter leaves it for `path` — `mise x -- dprint
   * fmt --stdin` under the repo's own config — or null when it cannot say.
   */
  format(path, text, config) {
    const res = spawnSync(
      "mise",
      ["x", "--", "dprint", "fmt", "--config", config, "--stdin", path],
      {
        cwd: this.repoRoot,
        encoding: "utf8",
        input: text,
        stdio: ["pipe", "pipe", "pipe"],
        maxBuffer: 64 * 1024 * 1024,
        env: { ...process.env, ...TOOL_ENV },
      },
    );
    return res.status === 0 && !res.error ? res.stdout : null;
  }

  /** `mise latest <tool>`, once per tool per call; no version refuses, naming the tool. */
  latest(tool) {
    this.latests ??= new Map();
    if (!this.latests.has(tool)) {
      const res = this.mise(["latest", tool]);
      const out = (res.stdout ?? "").trim().split("\n")[0]?.trim() ?? "";
      if (res.status !== 0 || !out || /\s/.test(out)) {
        const why = (res.stderr ?? "").trim().split("\n")[0]
          || `exit ${res.status}`;
        throw new RefusalError(
          `mise latest ${tool} gave no version (${why}) — a pin CI loads is only ever written exact`,
        );
      }
      this.latests.set(tool, out);
    }
    return this.latests.get(tool);
  }

  /** `MISE_ENV=dev mise run setup:all` — installs and sets up everything the repo pins. */
  setupAll() {
    const res = this.mise(["run", "setup:all"], TOOL_ENV);
    // colour codes stripped: the output lands in a JSON report, warnings included
    return {
      ok: res.status === 0,
      output: tail(res).replace(
        new RegExp(`${String.fromCharCode(27)}\\[[0-9;]*m`, "g"),
        "",
      ),
    };
  }
}
