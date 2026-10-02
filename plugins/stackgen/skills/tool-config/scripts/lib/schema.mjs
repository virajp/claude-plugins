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
};

const ENVS = ["all", "dev", "ci", "test"];

/**
 * A structured `tool-config:` entry: required `tool` and `verb`, and per
 * (tool, verb) the keys it takes. Every key named is required unless listed
 * under `optional`; a type is "string" or an enum list.
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
  },
};

const KEY_PATTERN = {
  mise: {
    "add-tool": { name: "toolName" },
    "add-env": { key: "envKey" },
    "add-alias": { name: "aliasName" },
  },
};

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
    if (typeof value !== "string") {
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
  }
  return faults;
}

// ---------------------------------------------------------------------------
// The narrow YAML reader: a pack.yaml's top-level `tool-config:` list, and its
// `machine_env:` names. Not a YAML parser — exactly the shapes packs carry.

function scalar(text) {
  const t = text.trim();
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

/** Split a flow mapping's body on top-level commas. */
function splitFlow(body) {
  const parts = [];
  let quote = null;
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
    else if (c === ",") {
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
      return Object.fromEntries([
        keyValue(head),
        ...parts.slice(1).map(keyValue),
      ]);
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
