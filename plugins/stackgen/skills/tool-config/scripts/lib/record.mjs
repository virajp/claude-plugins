// `.claude/stackgen/lock.yaml` — the materializer's record. Only entries whose
// `source` is `tool-config/…` are parsed and rewritten; every other entry and
// every other section is carried through byte for byte. No YAML dependency: a
// narrow reader for exactly this shape, and a writer in the file's own style.

import { createHash } from "node:crypto";

export const LOCK_PATH = ".claude/stackgen/lock.yaml";

export const sha256 = text => createHash("sha256").update(text).digest("hex");

// --- flow values: [a, "b"] and { k: v } -------------------------------------

function parseFlow(text) {
  let i = 0;
  const ws = () => {
    while (i < text.length && /\s/.test(text[i])) {
      i++;
    }
  };
  const value = () => {
    ws();
    if (text[i] === "[") {
      i++;
      const out = [];
      ws();
      if (text[i] === "]") {
        return i++, out;
      }
      for (;;) {
        out.push(value());
        ws();
        if (text[i] === ",") {
          i++;
        }
        else if (text[i] === "]") {
          return i++, out;
        }
        else {
          throw new Error(`lock.yaml: bad list near ${text.slice(i)}`);
        }
      }
    }
    if (text[i] === "{") {
      i++;
      const out = {};
      ws();
      if (text[i] === "}") {
        return i++, out;
      }
      for (;;) {
        const k = value();
        ws();
        if (text[i++] !== ":") {
          throw new Error(`lock.yaml: bad mapping near ${text.slice(i)}`);
        }
        out[k] = value();
        ws();
        if (text[i] === ",") {
          i++;
        }
        else if (text[i] === "}") {
          return i++, out;
        }
        else {
          throw new Error(`lock.yaml: bad mapping near ${text.slice(i)}`);
        }
      }
    }
    if (text[i] === "\"") {
      let j = i + 1;
      while (text[j] !== "\"") {
        j += text[j] === "\\" ? 2 : 1;
      }
      const s = JSON.parse(text.slice(i, j + 1));
      i = j + 1;
      return s;
    }
    if (text[i] === "'") {
      let j = i + 1;
      while (!(text[j] === "'" && text[j + 1] !== "'")) {
        j += text[j] === "'" ? 2 : 1;
      }
      const s = text.slice(i + 1, j).replaceAll("''", "'");
      i = j + 1;
      return s;
    }
    const m = /^[^,\]}:]+/.exec(text.slice(i))
      ?? /^[^,\]}]+/.exec(text.slice(i));
    i += m[0].length;
    return m[0].trim();
  };
  const v = value();
  return v;
}

function parseScalar(text) {
  const t = text.replace(/\s+#.*$/, "").trim();
  if (
    t.startsWith("[") || t.startsWith("{") || t
      .startsWith("\"") || t
      .startsWith("'")
  ) {
    return parseFlow(t);
  }
  return t;
}

const BARE = /^[A-Za-z_][A-Za-z0-9_./@+-]*$/;

function fmt(v) {
  if (Array.isArray(v)) {
    return `[${v.map(fmt).join(", ")}]`;
  }
  if (v && typeof v === "object") {
    return `{ ${
      Object.entries(v).map(([k, x]) => `${fmt(k)}: ${fmt(x)}`).join(", ")
    } }`;
  }
  const s = String(v);
  return BARE.test(s) && !/^(true|false|null|yes|no|on|off)$/i.test(s)
    ? s
    : JSON.stringify(s);
}

// --- the file ----------------------------------------------------------------

/** One tool-config entry from its raw item lines. */
function parseItem(raw, fieldIndent) {
  const entry = {};
  let nested = null;
  raw.forEach((line, n) => {
    const body = n === 0 ? line.replace(/^(\s*)- /, (_, s) => `${s}  `) : line;
    if (body.trim() === "" || body.trim().startsWith("#")) {
      return;
    }
    const indent = /^\s*/.exec(body)[0].length;
    const m = /^\s*("[^"]*"|[^:\s][^:]*?)\s*:(?:\s+(.*))?$/.exec(body);
    if (!m) {
      throw new Error(`lock.yaml: cannot read line: ${line}`);
    }
    const key = m[1].startsWith("\"") ? JSON.parse(m[1]) : m[1];
    if (indent > fieldIndent && nested) {
      entry[nested][key] = parseScalar(m[2] ?? "");
    }
    else if (m[2] === undefined || m[2].trim() === "") {
      nested = key;
      entry[key] = {};
    }
    else {
      nested = null;
      entry[key] = parseScalar(m[2]);
    }
  });
  return entry;
}

function serializeItem(e, itemIndent) {
  const pad = " ".repeat(itemIndent);
  const field = " ".repeat(itemIndent + 2);
  const out = [
    `${pad}- path: ${fmt(e.path)}`,
    `${field}source: ${e.source}`,
    `${field}hash: ${e.hash}`,
  ];
  if (e.mode) {
    out.push(`${field}mode: ${JSON.stringify(String(e.mode))}`);
  }
  if (e.blocks?.length) {
    out.push(`${field}blocks: ${fmt(e.blocks)}`);
  }
  for (const key of ["keys", "shares", "templates"]) {
    const map = e[key];
    if (!map || Object.keys(map).length === 0) {
      continue;
    }
    out.push(`${field}${key}:`);
    for (const [k, v] of Object.entries(map)) {
      out.push(`${field}  ${fmt(k)}: ${fmt(v)}`);
    }
  }
  return out;
}

export const isToolConfig = entry =>
  typeof entry?.source === "string" && entry.source.startsWith("tool-config/");

/** The tool a tool-config entry names, from `tool-config/<tool>@<version>`. */
export const sourceTool = entry =>
  /^tool-config\/([^@]+)@/.exec(entry.source)?.[1] ?? null;

/**
 * Read the lockfile's text (null when absent) into `{entries, write()}`:
 * `entries` holds each tool-config entry as an object, keyed by path; every
 * other part of the file is kept as it was read.
 */
export function readLock(text) {
  const lines = text === null ? [] : text.replace(/\n$/, "").split("\n");
  const sections = []; // { name, lines } — name null for the preamble
  for (const line of lines) {
    const m = /^([A-Za-z_][\w-]*):/.exec(line);
    if (m || sections.length === 0) {
      sections.push({ name: m ? m[1] : null, lines: [] });
    }
    sections.at(-1).lines.push(line);
  }
  let section = sections.find(s => s.name === "entries");
  if (!section) {
    section = { name: "entries", lines: ["entries:"] };
    const at = sections[0]?.name === null ? 1 : 0;
    sections.splice(at, 0, section);
  }
  // Items: `<indent>- ` at the first item's indent; comment and blank lines ride with the item above.
  const items = []; // { raw, entry | null }
  let itemIndent = 2;
  const head = [section.lines[0]];
  for (const line of section.lines.slice(1)) {
    const m = /^(\s*)- /.exec(line);
    if (m && (items.length === 0 || m[1].length === itemIndent)) {
      if (items.length === 0) {
        itemIndent = m[1].length;
      }
      items.push({ raw: [line] });
    }
    else if (items.length) {
      items.at(-1).raw.push(line);
    }
    else {
      head.push(line);
    }
  }
  const entries = new Map();
  const order = [];
  for (const item of items) {
    const isOurs = item.raw.some(l =>
      /^\s*-?\s*source:\s*tool-config\//.test(l)
    );
    if (isOurs) {
      const e = parseItem(item.raw, itemIndent + 2);
      entries.set(e.path, e);
      order.push({ path: e.path });
    }
    else {
      order.push({ raw: item.raw });
    }
  }
  return {
    entries,
    /** The file's text with `entries` written back: kept in place, new ones appended, gone ones dropped. */
    write() {
      const seen = new Set();
      const body = [];
      for (const o of order) {
        if (o.raw) {
          body.push(...o.raw);
        }
        else if (entries.has(o.path)) {
          body.push(...serializeItem(entries.get(o.path), itemIndent));
          seen.add(o.path);
        }
      }
      for (const [path, e] of entries) {
        if (!seen.has(path)) {
          body.push(...serializeItem(e, itemIndent));
        }
      }
      section.lines = [...head, ...body];
      if (section.lines.length === 1 && body.length === 0) {
        section.lines = ["entries: []"];
      }
      else if (section.lines[0].trim() === "entries: []") {
        section.lines[0] = "entries:";
      }
      return sections.flatMap(s => s.lines).join("\n") + "\n";
    },
  };
}
