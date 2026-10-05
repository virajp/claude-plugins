// The writer of `.config/stackgen.yaml` — the script is its only writer. A
// call's values merge into what the file holds, and the result is written in
// one fixed key order, in the grammar lib/yaml.mjs reads and nothing wider.
// The text a call would write is also what that call renders from: it is
// loaded through lib/values.mjs exactly as a later call would read it.

import {
  mkdirSync,
  mkdtempSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  deriveOrigin,
  loadValues,
  STACKGEN_PATH,
} from "./values.mjs";

export { STACKGEN_PATH };

const HEADER = [
  "# stackgen's values for this repo, read by every tool-config render.",
  "# Written by the tool-config script alone: change a value through it.",
];

const ORDER = [
  "format",
  "repo_name",
  "merge_model",
  "members",
  "scopes",
  "node",
  "external",
  "forge",
  "secrets",
  "packs",
];

const quote = s => `"${s.replace(/\\/g, "\\\\").replace(/"/g, "\\\"")}"`;

function scalar(value) {
  if (typeof value === "string") {
    return quote(value);
  }
  return String(value);
}

/**
 * `key: value` at `indent`. A non-empty list is a block list, one item a line,
 * as the shipped formatter prints it: a flow list it wraps past 80 columns
 * is one the reader refuses.
 */
function entry(indent, key, value) {
  if (!Array.isArray(value)) {
    return [`${indent}${key}: ${scalar(value)}`];
  }
  if (!value.length) {
    return [`${indent}${key}: []`];
  }
  return [`${indent}${key}:`, ...value.map(v => `${indent}  - ${scalar(v)}`)];
}

/** The file's text for a parsed document. */
export function stackgenText(doc) {
  const lines = [...HEADER, ""];
  for (const key of ORDER) {
    if (doc[key] === undefined) {
      continue;
    }
    if (key === "merge_model") {
      lines.push("merge_model:");
      for (const branch of ["develop", "main"]) {
        if (doc.merge_model[branch] !== undefined) {
          lines.push(`  ${branch}: ${scalar(doc.merge_model[branch])}`);
        }
      }
      continue;
    }
    if (key === "packs") {
      const slugs = Object.keys(doc.packs).sort();
      if (!slugs.length) {
        continue;
      }
      lines.push("packs:");
      for (const slug of slugs) {
        const entries = Object.entries(doc.packs[slug]).sort(([a], [b]) =>
          a < b ? -1 : a > b ? 1 : 0
        );
        if (!entries.length) {
          continue;
        }
        lines.push(`  ${slug}:`);
        for (const [k, v] of entries) {
          lines.push(...entry("    ", k, v));
        }
      }
      if (lines.at(-1) === "packs:") {
        lines.pop();
      }
      continue;
    }
    lines.push(...entry("", key, doc[key]));
  }
  return lines.join("\n") + "\n";
}

/** `doc` with `all`'s values set — `merge_model.develop` and `.main` nested. */
export function withValues(doc, values) {
  const out = structuredClone(doc ?? {});
  out.format = 1;
  for (const [key, value] of Object.entries(values)) {
    if (key.startsWith("merge_model.")) {
      out.merge_model = {
        ...out.merge_model,
        [key.slice("merge_model.".length)]: value,
      };
    }
    else {
      out[key] = value;
    }
  }
  return out;
}

/** `doc` with a pack's values merged in (`sets`), or its entry dropped (`sets` null). */
export function withPack(doc, slug, sets) {
  const out = structuredClone(doc ?? {});
  out.format = 1;
  const packs = { ...out.packs };
  if (sets === null) {
    delete packs[slug];
  }
  else if (Object.keys(sets).length) {
    packs[slug] = { ...packs[slug], ...sets };
  }
  if (Object.keys(packs).length) {
    out.packs = packs;
  }
  else {
    delete out.packs;
  }
  return out;
}

/**
 * The values a template reads, loaded from `text` as the file would hold it
 * — validated by lib/values.mjs in a scratch directory, then given the repo's
 * own `origin` names. `pack` adds that pack's own keys.
 */
export function valuesFrom(text, repoRoot, pack) {
  const dir = mkdtempSync(join(tmpdir(), "stackgen-values-"));
  try {
    mkdirSync(join(dir, ".config"));
    writeFileSync(join(dir, STACKGEN_PATH), text);
    return { ...loadValues(dir, { pack }), ...deriveOrigin(repoRoot) };
  }
  finally {
    rmSync(dir, { recursive: true, force: true });
  }
}
