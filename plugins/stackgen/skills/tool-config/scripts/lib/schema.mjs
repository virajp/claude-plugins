// The structured pack entry, the value rules every call is held to, and the
// narrow pack.yaml reader the entry and drift paths share. scripts/src/check.ts
// imports TOOL_CONFIG_ENTRY_SCHEMA and validateEntry from here, so the checker
// and the script refuse the same entries.

import {
  existsSync,
  readdirSync,
  readFileSync,
} from "node:fs";
import { join } from "node:path";

/** What a name, a key or a value may hold — references/mise.md, what a call may carry. */
export const PATTERNS = {
  envKey: /^[A-Za-z_][A-Za-z0-9_]*$/,
  aliasName: /^[A-Za-z_][A-Za-z0-9_-]*$/,
  toolName: /^[A-Za-z0-9:/._@-]+$/,
  requester: /^([a-z0-9][a-z0-9-]*|gitignore:[A-Za-z0-9._+-]+)$/,
  template: /\{\{|\{%|\{#/,
  slug: /^[a-z0-9][a-z0-9-]*$/,
  pluginName: /^[a-z][a-z0-9_-]*$/,
  hookId: /^[A-Za-z0-9_-]+$/,
  hookRepo: /^(local|https:\/\/\S+)$/,
  advisoryId: /^[A-Za-z0-9-]+$/,
  packageRef: /^@?[^@\s]+@[^@\s]+$/,
  date: /^\d{4}-\d{2}-\d{2}$/,
};

const ENVS = ["all", "dev", "ci", "test"];

/**
 * An exclude or ignore path, classified (G1): a trailing `/` marks a
 * directory, globs included (`*.xcassets/`), excluded with everything inside;
 * a `*` or `?` with no trailing `/` is a file glob; a bare name with neither
 * is a directory. `name` is the path without its trailing `/`.
 */
export function classifyPath(path) {
  const dir = path.endsWith("/");
  const name = dir ? path.slice(0, -1) : path;
  const glob = /[*?]/.test(name);
  return { path, name, kind: dir || !glob ? "directory" : "file", glob };
}

/** Why a path is not one an exclude takes, or null. */
export function pathFault(path) {
  const name = path.endsWith("/") ? path.slice(0, -1) : path;
  if (name === "") {
    return "is empty";
  }
  if (/\s|,/.test(name)) {
    return "holds a space or a comma";
  }
  if (
    name.startsWith("/")
    || name.split("/").some(p => p === "" || p === "." || p === "..")
  ) {
    return "is not a relative name — no leading /, no empty, . or .. part";
  }
  return null;
}

/** Why a date is not a real YYYY-MM-DD calendar day, or null. */
function dateFault(value) {
  if (!PATTERNS.date.test(value)) {
    return "is not a YYYY-MM-DD date";
  }
  const d = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().startsWith(value)
    ? null
    : "is not a calendar day";
}

const listOf = itemFault => value => {
  const items = value.split(",");
  for (const item of items) {
    const fault = item === "" ? "is empty" : itemFault(item);
    if (fault) {
      return `item ${JSON.stringify(item)} ${fault}`;
    }
  }
  return null;
};

const matching =
  (name, what) => v => (PATTERNS[name].test(v) ? null : `is not ${what}`);

/**
 * The flag value types beyond cli.mjs's mise ones, each a fault-or-null
 * function over the flag's string. A list is comma-separated; a `bool` is
 * `true` or `false` (a bare flag reads `true`).
 */
export const FLAG_TYPES = {
  slug: matching("slug", "a slug (lowercase letters, digits, -)"),
  pluginName: matching(
    "pluginName",
    "a dprint plugin name (lowercase letters, digits, -, _)",
  ),
  hookId: matching("hookId", "a hook id (letters, digits, -, _)"),
  hookRepo: matching("hookRepo", "local or an https:// URL"),
  advisoryId: matching("advisoryId", "an advisory id (letters, digits, -)"),
  packageRef: matching("packageRef", "a <name>@<version>"),
  date: dateFault,
  line: v => (/[\r\n]/.test(v) ? "holds a line break" : null),
  bool: v => (v === "true" || v === "false" ? null : "is not true or false"),
  list: listOf(() => null),
  pathList: listOf(pathFault),
  slugList: listOf(v => (PATTERNS.slug.test(v) ? null : "is not a slug")),
};

/** The stages `default_install_hook_types` installs, plus manual (G6). */
export const HOOK_STAGES = [
  "pre-commit",
  "commit-msg",
  "post-commit",
  "post-merge",
  "manual",
];

/** A stage that runs after the fact, where a hook is always written `always_run: true` (G6). */
export const POST_STAGES = ["post-commit", "post-merge"];

/** The cross-flag faults of an add-hook call (pre-commit.md, add hook). */
function hookFaults(flags) {
  const faults = [];
  if (flags.repo === "local") {
    for (const key of ["name", "entry"]) {
      if (!flags[key]) {
        faults.push(`a local hook needs --${key}`);
      }
    }
    if (flags.language !== "system") {
      faults.push("a local hook needs --language system");
    }
    if (flags.entry && !flags.entry.startsWith("mise x -- ")) {
      faults.push("a local hook's --entry begins `mise x -- `");
    }
    if (flags.rev) {
      faults.push("a local hook takes no --rev");
    }
  }
  else if (flags.repo && !flags.rev) {
    faults.push("a URL hook repo needs --rev, a pinned tag");
  }
  if (POST_STAGES.includes(flags.stage) && flags["always-run"] === "false") {
    faults.push(`a ${flags.stage} hook is always written --always-run true`);
  }
  return faults;
}

/**
 * The gate tools' verbs and the cross-tool `all` verb — their flags, as
 * validateCall reads them, and whether a requester rides along. A tool module
 * spreads its own table into its `verbs`; `check(flags)`, where present, is
 * the cross-flag rule validateCall and validateEntry both apply.
 */
export const GATE_VERBS = {
  dprint: {
    "add-plugin": {
      flags: { name: { type: "pluginName", required: true } },
      requester: "optional",
    },
  },
  "pre-commit": {
    "add-hook": {
      flags: {
        repo: { type: "hookRepo", required: true },
        id: { type: "hookId", required: true },
        stage: { required: true, values: HOOK_STAGES },
        name: { type: "line" },
        entry: { type: "line" },
        language: { type: "line" },
        files: { type: "line" },
        types: { type: "list" },
        args: { type: "list" },
        rev: { type: "line" },
        description: { type: "line" },
        "pass-filenames": { type: "bool" },
        "always-run": { type: "bool" },
      },
      requester: "optional",
      check: hookFaults,
    },
    "add-linter-ignore": {
      flags: { paths: { type: "pathList", required: true } },
      requester: "optional",
    },
    "set-scopes": {
      flags: { scopes: { type: "slugList", required: true } },
      requester: "forbidden",
    },
  },
  grype: {
    "add-ignore": {
      flags: {
        id: { type: "advisoryId", required: true },
        package: { type: "packageRef", required: true },
        reason: { type: "line", required: true },
        expires: { type: "date", required: true },
      },
      requester: "optional",
    },
    "remove-ignore": {
      flags: { id: { type: "advisoryId", required: true } },
      requester: "forbidden",
    },
  },
  all: {
    "add-exclude": {
      flags: {
        paths: { type: "pathList", required: true },
        generated: { type: "bool", default: "false" },
      },
      requester: "optional",
    },
  },
};

/** The structured-entry keys of a gate verb: a list flag is a YAML list, a bool a YAML boolean. */
function gateEntry(tool, verb) {
  const spec = GATE_VERBS[tool][verb];
  const keys = {};
  const optional = [];
  for (const [name, f] of Object.entries(spec.flags)) {
    keys[name] = /list$/i.test(f.type ?? "")
      ? "list"
      : f.type === "bool"
      ? "bool"
      : (f.values ?? "string");
    if (!f.required) {
      optional.push(name);
    }
  }
  return { keys, optional };
}

/**
 * A structured `tool-config:` entry: required `tool` and `verb`, and per
 * (tool, verb) the keys it takes. Every key named is required unless listed
 * under `optional`; a type is "string", "list" (of strings), "bool" or an
 * enum list.
 */
export const TOOL_CONFIG_ENTRY_SCHEMA = {
  required: ["tool", "verb"],
  tools: {
    mise: {
      "add-tool": {
        keys: { name: "string", version: "string", env: ENVS },
        optional: [],
      },
      "add-env": {
        keys: { key: "string", value: "string", env: ENVS },
        optional: [],
      },
      "add-alias": {
        keys: { name: "string", command: "string" },
        optional: [],
      },
    },
    dprint: { "add-plugin": gateEntry("dprint", "add-plugin") },
    "pre-commit": {
      "add-hook": gateEntry("pre-commit", "add-hook"),
      "add-linter-ignore": gateEntry("pre-commit", "add-linter-ignore"),
    },
    grype: { "add-ignore": gateEntry("grype", "add-ignore") },
    all: { "add-exclude": gateEntry("all", "add-exclude") },
  },
};

/** An entry value as the flag string the script reads: a list joined with `,`, a bool spelled. */
export function entryFlag(value) {
  return Array.isArray(value) ? value.join(",") : String(value);
}

const KEY_PATTERN = {
  mise: {
    "add-tool": { name: "toolName" },
    "add-env": { key: "envKey" },
    "add-alias": { name: "aliasName" },
  },
};

// The keys the script reads as values (its `type: "value"` flags), held to the
// same rules validateCall applies to a pack's own line: a TOML basic string
// when given quoted, never empty where the flag is required, and a template
// only where the flag allows one (`template: "own"` — a pack line carries --for).
const VALUE_KEYS = {
  mise: {
    "add-tool": { version: { required: true, template: false } },
    "add-env": { value: { required: false, template: true } },
    "add-alias": { command: { required: true, template: false } },
  },
};

// A control character, tab excepted for the parse — TOML's basic-string rule.
export const isControl = c =>
  c.charCodeAt(0) < 0x20 || c.charCodeAt(0) === 0x7f;
const ESCAPE = /^\\(?:[btnfre"\\]|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/;

/** Whether a quoted value parses as a TOML basic string. */
export function isBasicString(value) {
  if (value.length < 2 || !value.endsWith("\"")) {
    return false;
  }
  const body = value.slice(1, -1);
  for (let i = 0; i < body.length; i++) {
    const c = body[i];
    if (c === "\\") {
      const m = ESCAPE.exec(body.slice(i));
      if (!m) {
        return false;
      }
      i += m[0].length - 1;
    }
    else if (c === "\"" || (isControl(c) && c !== "\t")) {
      return false;
    }
  }
  return true;
}

function valueFaults(entry, key, value) {
  const rule = VALUE_KEYS[entry.tool]?.[entry.verb]?.[key];
  if (!rule) {
    return [];
  }
  if (value === "") {
    return rule.required ? [`${key} is empty`] : [];
  }
  const faults = [];
  if (value.startsWith("\"") && !isBasicString(value)) {
    faults.push(`${key} ${value} does not parse as a TOML basic string`);
  }
  if (!rule.template && PATTERNS.template.test(value)) {
    faults.push(
      `${key} holds a template ({{, {% or {#) — legal only in add-env's value`,
    );
  }
  return faults;
}

/** The faults of one structured entry; empty when it is valid. */
export function validateEntry(entry) {
  const faults = [];
  if (entry === null || typeof entry !== "object" || Array.isArray(entry)) {
    return ["an entry must be a mapping"];
  }
  for (const key of TOOL_CONFIG_ENTRY_SCHEMA.required) {
    if (typeof entry[key] !== "string" || entry[key] === "") {
      faults.push(`missing ${key}`);
    }
  }
  if (faults.length) {
    return faults;
  }
  const verbs = TOOL_CONFIG_ENTRY_SCHEMA.tools[entry.tool];
  if (!verbs) {
    const known = Object.keys(TOOL_CONFIG_ENTRY_SCHEMA.tools).join(", ");
    return [`unknown tool ${entry.tool} — structured entries take: ${known}`];
  }
  const spec = verbs[entry.verb];
  if (!spec) {
    const known = Object.keys(verbs).join(", ");
    return [`unknown verb ${entry.verb} for ${entry.tool} — valid: ${known}`];
  }
  for (const key of Object.keys(entry)) {
    if (key === "tool" || key === "verb") {
      continue;
    }
    if (!(key in spec.keys)) {
      const known = Object.keys(spec.keys).join(", ");
      faults.push(
        `unknown key ${key} for ${entry.tool} ${entry.verb} — valid: ${known}`,
      );
    }
  }
  for (const [key, type] of Object.entries(spec.keys)) {
    if (!(key in entry)) {
      if (!spec.optional.includes(key)) {
        faults.push(`missing ${key}`);
      }
      continue;
    }
    const value = entry[key];
    if (type === "list") {
      if (
        !Array.isArray(value)
        || value.length === 0
        || !value.every(v => typeof v === "string")
      ) {
        faults.push(`${key} must be a non-empty list of strings`);
        continue;
      }
    }
    else if (type === "bool") {
      if (typeof value !== "boolean") {
        faults.push(`${key} must be true or false`);
        continue;
      }
    }
    else if (typeof value !== "string") {
      faults.push(`${key} must be a string — quote it`);
      continue;
    }
    if (Array.isArray(type) && !type.includes(value)) {
      faults.push(`${key} must be one of ${type.join(", ")}, not ${value}`);
    }
    const pattern = KEY_PATTERN[entry.tool]?.[entry.verb]?.[key];
    if (pattern && !PATTERNS[pattern].test(value)) {
      faults.push(`${key} ${JSON.stringify(value)} is not a valid ${pattern}`);
    }
    faults.push(...valueFaults(entry, key, value));
    faults.push(...gateFaults(entry, key, value));
  }
  const check = GATE_VERBS[entry.tool]?.[entry.verb]?.check;
  if (check && faults.length === 0) {
    const flags = Object.fromEntries(
      Object
        .entries(entry)
        .filter(([k]) => k !== "tool" && k !== "verb")
        .map(([k, v]) => [k, entryFlag(v)]),
    );
    faults.push(...check(flags));
  }
  return faults;
}

/** A gate verb's per-flag rule over one entry value, as validateCall applies it. */
function gateFaults(entry, key, value) {
  const f = GATE_VERBS[entry.tool]?.[entry.verb]?.flags[key];
  const type = f && FLAG_TYPES[f.type];
  if (!type) {
    return [];
  }
  const text = entryFlag(value);
  if (text === "") {
    return f.required ? [`${key} is empty`] : [];
  }
  const fault = type(text);
  return fault ? [`${key} ${JSON.stringify(text)} ${fault}`] : [];
}

// ---------------------------------------------------------------------------
// The narrow YAML reader: a pack.yaml's top-level `tool-config:` list, and its
// `machine_env:` names. Not a YAML parser — exactly the shapes packs carry.

function scalar(text) {
  const t = text.trim();
  if (t.startsWith("[") && t.endsWith("]")) {
    return splitFlow(t.slice(1, -1)).map(scalar);
  }
  if (t.startsWith("\"")) {
    return JSON.parse(t);
  }
  if (t.startsWith("'")) {
    return t.slice(1, -1).replaceAll("''", "'");
  }
  if (/^-?\d+(\.\d+)?$/.test(t)) {
    return Number(t);
  }
  if (t === "true" || t === "false") {
    return t === "true";
  }
  if (t === "null" || t === "~" || t === "") {
    return null;
  }
  return t;
}

/** Strip a trailing ` # comment` outside quotes. */
function stripComment(line) {
  let quote = null;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (quote) {
      if (c === "\\" && quote === "\"") {
        i++;
      }
      else if (c === quote) {
        quote = null;
      }
    }
    else if (c === "\"" || c === "'") {
      quote = c;
    }
    else if (c === "#" && (i === 0 || /\s/.test(line[i - 1]))) {
      return line.slice(0, i);
    }
  }
  return line;
}

/** Split a flow mapping's or sequence's body on top-level commas. */
function splitFlow(body) {
  const parts = [];
  let quote = null;
  let depth = 0;
  let start = 0;
  for (let i = 0; i < body.length; i++) {
    const c = body[i];
    if (quote) {
      if (c === "\\" && quote === "\"") {
        i++;
      }
      else if (c === quote) {
        quote = null;
      }
    }
    else if (c === "\"" || c === "'") {
      quote = c;
    }
    else if (c === "[" || c === "{") {
      depth++;
    }
    else if (c === "]" || c === "}") {
      depth--;
    }
    else if (c === "," && depth === 0) {
      parts.push(body.slice(start, i));
      start = i + 1;
    }
  }
  parts.push(body.slice(start));
  return parts.map(p => p.trim()).filter(p => p !== "");
}

function keyValue(text) {
  const m = /^("[^"]*"|'[^']*'|[^:]+?)\s*:(?:\s+(.*))?$/.exec(text.trim());
  if (!m) {
    throw new Error(`not a key: value pair: ${text}`);
  }
  return [scalar(m[1]), scalar(m[2] ?? "")];
}

function flowMapping(text) {
  const body = text.trim().slice(1, -1);
  return Object.fromEntries(splitFlow(body).map(keyValue));
}

/** The lines of one top-level key's block, its own line excluded. */
function topLevelBlock(text, key) {
  const lines = text.split("\n");
  const at = lines.findIndex(l => new RegExp(`^${key}:\\s*(#.*)?$`).test(l));
  if (at < 0) {
    return null;
  }
  const out = [];
  for (let i = at + 1; i < lines.length; i++) {
    const l = lines[i];
    if (/^\S/.test(l) && !l.startsWith("#")) {
      break;
    }
    out.push(l);
  }
  return out;
}

/**
 * A pack's `tool-config:` list, in order: a structured entry as an object, a
 * string entry (the word grammar plans 2–3 retire) as a string.
 */
export function parseToolConfigList(text) {
  const block = topLevelBlock(text, "tool-config");
  if (!block) {
    return [];
  }
  const items = [];
  let indent = null;
  for (const raw of block) {
    const line = stripComment(raw);
    if (line.trim() === "") {
      continue;
    }
    const m = /^(\s*)- (.*)$/.exec(line);
    if (m && (indent === null || m[1].length === indent)) {
      indent = m[1].length;
      items.push([m[2]]);
    }
    else if (items.length) {
      items.at(-1).push(line);
    }
    else {
      throw new Error(`tool-config: unexpected line: ${raw}`);
    }
  }
  return items.map(parts => {
    const head = parts[0].trim();
    if (head.startsWith("{")) {
      return flowMapping(parts.map(p => p.trim()).join(" "));
    }
    if (/^[A-Za-z_][\w-]*:(\s|$)/.test(head)) {
      // a block mapping; a key with no value takes the `- item` lines below it
      const pairs = [];
      for (const part of [head, ...parts.slice(1)]) {
        const item = /^\s*- (.*)$/.exec(part);
        if (item && pairs.length && Array.isArray(pairs.at(-1)[1])) {
          pairs.at(-1)[1].push(scalar(item[1]));
          continue;
        }
        const [k, v] = keyValue(part);
        pairs.push([k, v === null ? [] : v]);
      }
      return Object.fromEntries(pairs);
    }
    const joined = parts.map(p => p.trim()).join(" ");
    return typeof scalar(joined) === "string" ? scalar(joined) : joined;
  });
}

/** The `name:`s a pack's `machine_env:` list declares. */
export function parseMachineEnv(text) {
  const block = topLevelBlock(text, "machine_env");
  if (!block) {
    return [];
  }
  const names = [];
  for (const raw of block) {
    const m = /^\s*-?\s*name:\s*(.+)$/.exec(stripComment(raw));
    if (m) {
      names.push(String(scalar(m[1])));
    }
  }
  return names;
}

/** The pack.yaml text of `<plugin-root>/stacks/*\/<slug>/`, or null. */
export function readPack(pluginRoot, slug) {
  const stacks = join(pluginRoot, "stacks");
  if (!existsSync(stacks)) {
    return null;
  }
  for (const type of readdirSync(stacks, { withFileTypes: true })) {
    if (!type.isDirectory()) {
      continue;
    }
    const path = join(stacks, type.name, slug, "pack.yaml");
    if (existsSync(path)) {
      return readFileSync(path, "utf8");
    }
  }
  return null;
}
