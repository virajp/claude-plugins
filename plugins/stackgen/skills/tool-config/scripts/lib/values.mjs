// The values a template reads: `.config/stackgen.yaml`, validated, each key
// named by upper-casing it and joining nested keys with `_`, plus REPO_URL and
// PROJECT_NAME derived from the repo's `origin` at load time — never stored,
// so they cannot go stale when the remote moves. A pack's template also sees
// its own `packs.<slug>.*` unprefixed; a clash with a global name is refused.

import { execFileSync } from "node:child_process";
import {
  existsSync,
  readFileSync,
} from "node:fs";
import { join } from "node:path";
import { parseYaml } from "./yaml.mjs";

export const STACKGEN_PATH = ".config/stackgen.yaml";

/** A `.config/stackgen.yaml` that parses but breaks the file's shape. */
export class ValuesError extends Error {}

const MERGE_MODELS = ["direct", "pr"];
const NAME = /^[A-Z][A-Z0-9_]*$/;

const isMap = v => v !== null && typeof v === "object" && !Array.isArray(v);
const isStringList = v =>
  Array.isArray(v) && v.every(x => typeof x === "string");
const isScalar = v => ["string", "number", "boolean"].includes(typeof v);

const kind = {
  string: [v => typeof v === "string", "a string"],
  bool: [v => typeof v === "boolean", "true or false"],
  list: [isStringList, "a list of strings"],
};

const TOP = {
  format: null,
  repo_name: kind.string,
  merge_model: null,
  members: kind.list,
  scopes: kind.list,
  node: kind.bool,
  external: kind.bool,
  forge: kind.string,
  secrets: kind.string,
  packs: null,
};

function refuse(key, message) {
  throw new ValuesError(`${STACKGEN_PATH}: ${key} ${message}`);
}

function validate(doc) {
  if (!isMap(doc)) {
    throw new ValuesError(`${STACKGEN_PATH}: the file must be a mapping`);
  }
  for (const key of Object.keys(doc)) {
    if (!Object.hasOwn(TOP, key)) {
      refuse(key, "is not a known key");
    }
    const check = TOP[key];
    if (check && !check[0](doc[key])) {
      refuse(key, `must be ${check[1]}`);
    }
  }
  if (doc.format !== 1) {
    refuse("format", `must be 1, got ${JSON.stringify(doc.format ?? null)}`);
  }
  if (doc.merge_model !== undefined) {
    if (!isMap(doc.merge_model)) {
      refuse("merge_model", "must be a mapping of develop and main");
    }
    for (const [branch, model] of Object.entries(doc.merge_model)) {
      if (branch !== "develop" && branch !== "main") {
        refuse(`merge_model.${branch}`, "is not a known key");
      }
      if (!MERGE_MODELS.includes(model)) {
        refuse(
          `merge_model.${branch}`,
          `must be "direct" or "pr", got ${JSON.stringify(model)}`,
        );
      }
    }
  }
  if (doc.packs !== undefined) {
    if (!isMap(doc.packs)) {
      refuse("packs", "must be a mapping of pack slugs");
    }
    for (const [slug, entries] of Object.entries(doc.packs)) {
      if (!isMap(entries)) {
        refuse(`packs.${slug}`, "must be a mapping");
      }
      for (const [key, value] of Object.entries(entries)) {
        if (!NAME.test(key.toUpperCase())) {
          refuse(
            `packs.${slug}.${key}`,
            "does not name a value — letters, digits and _ only",
          );
        }
        if (!isScalar(value) && !isStringList(value)) {
          refuse(
            `packs.${slug}.${key}`,
            "must be a scalar or a list of strings",
          );
        }
      }
    }
  }
  return doc;
}

/** The parsed, validated `.config/stackgen.yaml` under `repoRoot`, or null when absent. */
export function readStackgen(repoRoot) {
  const path = join(repoRoot, STACKGEN_PATH);
  if (!existsSync(path)) {
    return null;
  }
  return validate(
    parseYaml(readFileSync(path, "utf8"), { source: STACKGEN_PATH }),
  );
}

/** Key → name: upper-cased, nested keys joined with `_`; lists stay values. */
export function toNames(obj, prefix = "") {
  const out = {};
  for (const [key, value] of Object.entries(obj)) {
    const name = `${prefix}${key.toUpperCase()}`;
    if (isMap(value)) {
      Object.assign(out, toNames(value, `${name}_`));
    }
    else {
      out[name] = value;
    }
  }
  return out;
}

/** `{ host, path }` from an scp, ssh:// or https:// remote URL, or null. */
function parseRemote(url) {
  let m = /^(?:ssh|https):\/\/(?:[^@/]*@)?([^/:]+)(?::\d+)?\/(.+)$/i.exec(url);
  if (!m && !/^[a-z][a-z0-9+.-]*:\/\//i.test(url)) {
    m = /^[^@/\s]+@([^:/\s]+):(.+)$/.exec(url);
  }
  if (!m) {
    return null;
  }
  const path = m[2].replace(/\/+$/, "").replace(/\.git$/, "");
  if (!/^[^/\s]+(\/[^/\s]+)+$/.test(path)) {
    return null;
  }
  return { host: m[1].toLowerCase(), path };
}

/** REPO_URL and PROJECT_NAME from `origin`, or `{}` when there is none or it is not a forge URL. */
export function deriveOrigin(repoRoot) {
  let url;
  try {
    url = execFileSync("git", ["-C", repoRoot, "remote", "get-url", "origin"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    })
      .trim();
  }
  catch {
    return {};
  }
  const remote = parseRemote(url);
  if (!remote) {
    return {};
  }
  return {
    REPO_URL: `https://${remote.host}/${remote.path}`,
    PROJECT_NAME: remote.path,
  };
}

/** A line break, a C0/C1 control character, or U+2028/U+2029. */
const unsafe = c =>
  c <= 0x1f || (c >= 0x7f && c <= 0x9f) || c === 0x2028 || c === 0x2029;

function checkScalar(name, value) {
  if (
    typeof value === "string"
    && [...value].some(ch => unsafe(ch.codePointAt(0)))
  ) {
    throw new ValuesError(
      `${STACKGEN_PATH}: ${name} holds a line break, a control character or a line/paragraph separator — refused`,
    );
  }
}

/**
 * The flat name → value map a template reads: every stored key but `packs`,
 * the names derived from `origin`, and — when `pack` names a slug — that
 * pack's own keys unprefixed.
 */
export function loadValues(repoRoot, { pack } = {}) {
  const { packs = {}, ...stored } = readStackgen(repoRoot) ?? {};
  const values = { ...toNames(stored), ...deriveOrigin(repoRoot) };
  if (pack !== undefined) {
    for (const [key, value] of Object.entries(packs[pack] ?? {})) {
      const name = key.toUpperCase();
      if (Object.hasOwn(values, name)) {
        throw new ValuesError(
          `${STACKGEN_PATH}: packs.${pack}.${key} names ${name}, which is already a global name — refused`,
        );
      }
      values[name] = value;
    }
  }
  for (const [name, value] of Object.entries(values)) {
    for (const v of Array.isArray(value) ? value : [value]) {
      checkScalar(name, v);
    }
  }
  return values;
}
