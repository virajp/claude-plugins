// The base repo, per assets/membership.md, and the config and registry read
// from it. Rules: not-onboarded and early, both info (D29). A repo is a member
// when bootstrap's repo.home has a value, and acts as a base with null (D25);
// a failed bootstrap call is a ChecksError (D23, D33), save exit 2 in a
// submodule, which falls back to its git superproject (D38).

import { existsSync } from "node:fs";
import {
  dirname,
  join,
  resolve,
} from "node:path";
import {
  BootstrapError,
  readHome,
} from "./bootstrap.mjs";
import {
  ChecksError,
  git,
  readYaml,
  row,
} from "./util.mjs";

const CONFIG = join(".config", "vwf.yaml");
const REGISTRY = join("docs", "blueprint", "registry.yaml");

/** The repo root of `dir`, or `dir` itself outside a git repo. */
export function repoRoot(dir) {
  const top = git(dir, ["rev-parse", "--show-toplevel"]);
  return top.ok ? top.out : resolve(dir);
}

/** The main checkout of a linked worktree, else the repo root itself. */
export function mainCheckout(root) {
  const gitDir = git(root, ["rev-parse", "--path-format=absolute", "--git-dir"]);
  const common = git(root, ["rev-parse", "--path-format=absolute", "--git-common-dir"]);
  return gitDir.ok && common.ok && gitDir.out !== common.out ? dirname(common.out) : root;
}

/** repo.home of `dir`, a bootstrap failure turned into a ChecksError. */
export function homeOf(dir) {
  try {
    return readHome(dir);
  } catch (error) {
    if (error instanceof BootstrapError) {
      throw new ChecksError(error.message);
    }
    throw error;
  }
}

/** The superproject working tree of a submodule at `dir`, else "". */
function superproject(dir) {
  const r = git(dir, ["rev-parse", "--show-superproject-working-tree"]);
  return r.ok ? r.out : "";
}

/**
 * The base repo from `start`, or null when no config is reachable. A member
 * (repo.home set) takes the base its home folder names, from its main
 * checkout; a folder member's base is its git top level (D17). A submodule
 * with no repo.home, or none to read (bootstrap exit 2), falls back to its
 * git superproject (D38).
 */
export function resolveBase(start) {
  let dir = repoRoot(start);
  const seen = new Set();
  while (!seen.has(dir)) {
    seen.add(dir);
    const super_ = superproject(dir);
    let home;
    try {
      home = readHome(dir);
    } catch (error) {
      if (error instanceof BootstrapError && error.code === 2 && super_ !== "") {
        dir = super_;
        continue;
      }
      throw error instanceof BootstrapError ? new ChecksError(error.message) : error;
    }
    if (home !== null) {
      const there = repoRoot(resolve(mainCheckout(dir), home.folder));
      return existsSync(join(there, CONFIG)) ? there : null;
    }
    if (existsSync(join(dir, CONFIG))) {
      return dir;
    }
    const main = mainCheckout(dir);
    if (main !== dir) {
      dir = main;
      continue;
    }
    if (super_ !== "") {
      dir = super_;
      continue;
    }
    return null;
  }
  return null;
}

/**
 * Load the product from `start`: {base, config, registry, rows}. `base` is
 * null when the repo is not onboarded; `registry` is null when it is early.
 */
export function loadProduct(start) {
  const base = resolveBase(start);
  if (base === null) {
    return {
      base: null,
      config: null,
      registry: null,
      rows: [
        row(
          "not-onboarded",
          "info",
          null,
          repoRoot(start),
          "this repo is not onboarded: no .config/vwf.yaml is reachable",
          "/vwf:setup",
        ),
      ],
    };
  }
  const config = readYaml(join(base, CONFIG)) ?? {};
  const registry = readYaml(join(base, REGISTRY));
  const rows = registry === null
    ? [
      row(
        "early",
        "info",
        null,
        base,
        "early: a config and no docs/blueprint/registry.yaml; the project checks are skipped",
        "/vwf:product, then /vwf:architecture",
      ),
    ]
    : [];
  return { base, config, registry, rows };
}
