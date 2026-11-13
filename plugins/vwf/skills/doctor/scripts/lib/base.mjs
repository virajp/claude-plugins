// The base repo, per assets/membership.md, and the config and registry read
// from it. Rules: not-onboarded and early, both info (D29).

import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { git, readYaml, row } from "./util.mjs";

const CONFIG = join(".config", "vwf.yaml");
const MEMBERSHIP = join(".config", "vwf-membership.yaml");
const REGISTRY = join("docs", "blueprint", "registry.yaml");

/** The repo root of `dir`, or `dir` itself outside a git repo. */
export function repoRoot(dir) {
  const top = git(dir, ["rev-parse", "--show-toplevel"]);
  return top.ok ? top.out : resolve(dir);
}

/**
 * The base repo from `start`, the five steps of membership.md, or null when
 * no config is reachable.
 */
export function resolveBase(start) {
  let dir = repoRoot(start);
  const seen = new Set();
  while (!seen.has(dir)) {
    seen.add(dir);
    if (existsSync(join(dir, CONFIG))) {
      return dir;
    }
    if (existsSync(join(dir, MEMBERSHIP))) {
      const host = readYaml(join(dir, MEMBERSHIP))?.host;
      if (typeof host !== "string" || host === "") {
        return null;
      }
      const there = resolve(dir, host);
      return existsSync(join(there, CONFIG)) ? there : null;
    }
    const superproject = git(dir, ["rev-parse", "--show-superproject-working-tree"]);
    if (superproject.ok && superproject.out !== "") {
      dir = repoRoot(superproject.out);
      continue;
    }
    const gitDir = git(dir, ["rev-parse", "--path-format=absolute", "--git-dir"]);
    const common = git(dir, ["rev-parse", "--path-format=absolute", "--git-common-dir"]);
    if (gitDir.ok && common.ok && gitDir.out !== common.out) {
      dir = dirname(common.out);
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
