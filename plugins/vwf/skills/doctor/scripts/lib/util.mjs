// Shared helpers of the doctor checks: the row shape, git and PATH reads, and
// the YAML file reader. Every child process takes an argument array.

import { spawnSync } from "node:child_process";
import {
  accessSync,
  constants,
  existsSync,
  readFileSync,
  realpathSync,
  statSync,
} from "node:fs";
import { delimiter, join } from "node:path";
import { parseFrontmatter, parseYaml } from "../../../plan-management/scripts/lib/yaml.mjs";

/** A usage or internal error; checks.mjs exits 2 on it. */
export class ChecksError extends Error {
  constructor(message) {
    super(message);
    this.name = "ChecksError";
  }
}

/** One finding row: {rule, severity, project, subject, message, remedy}. */
export function row(rule, severity, project, subject, message, remedy) {
  return { rule, severity, project: project ?? null, subject, message, remedy };
}

export function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

/** The parsed YAML file, or null when it does not exist. */
export function readYaml(file) {
  if (!existsSync(file)) {
    return null;
  }
  try {
    return parseYaml(readFileSync(file, "utf8"));
  } catch (error) {
    throw new ChecksError(`${file}: ${error.message}`);
  }
}

/** The frontmatter map of a file, or null when the file does not exist. */
export function readFrontmatter(file) {
  if (!existsSync(file)) {
    return null;
  }
  try {
    return parseFrontmatter(readFileSync(file, "utf8")) ?? {};
  } catch (error) {
    throw new ChecksError(`${file}: ${error.message}`);
  }
}

/** git in `cwd`: {ok, out}. */
export function git(cwd, args) {
  const r = spawnSync("git", args, { cwd, encoding: "utf8" });
  return { ok: r.status === 0, out: (r.stdout ?? "").trim() };
}

/** The realpath of a path, or the path itself when it does not exist. */
export function real(path) {
  try {
    return realpathSync(path);
  } catch {
    return path;
  }
}

export function isDir(path) {
  try {
    return statSync(path).isDirectory();
  } catch {
    return false;
  }
}

/** True when `dir` exists and is a git work tree. */
export function isWorkTree(dir) {
  return isDir(dir) && git(dir, ["rev-parse", "--is-inside-work-tree"]).out === "true";
}

/** The executable `name` resolves to on PATH, or null — `command -v`. */
export function onPath(name) {
  for (const dir of (process.env.PATH ?? "").split(delimiter)) {
    if (dir === "") {
      continue;
    }
    const file = join(dir, name);
    try {
      if (statSync(file).isFile()) {
        accessSync(file, constants.X_OK);
        return file;
      }
    } catch {
      // not here
    }
  }
  return null;
}

/** An axis value that is pinned: a slug, or a non-empty list. */
export function isPinned(value) {
  if (Array.isArray(value)) {
    return value.length > 0;
  }
  return typeof value === "string" && value !== "" && value !== "unresolved";
}

/** A pin's slug: the axis prefix (project/, repo/) stripped. */
export function slugOf(pin) {
  return pin.replace(/^(?:project|repo)\//, "");
}
