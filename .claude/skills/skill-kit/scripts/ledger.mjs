#!/usr/bin/env node
// The rule ledger of a rewrite. Usage:
//   ledger.mjs extract <old-skill-dir> <ledger-dir>
//   ledger.mjs check <ledger-dir> <new-skill-dir>
// `extract` writes every block of the old text as one pending entry, so a rule
// cannot escape by selection, and a manifest that `check` holds the ledger to.
// `check` exits 1 unless every entry is settled. A file with the same bytes in
// the new skill settles all its entries.
import { createHash } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import {
  isAbsolute,
  join,
  relative,
  resolve,
} from "node:path";
import { walk } from "./lib/skill.mjs";

const MANIFEST = ".manifest.json";
const MIN_QUOTE_WORDS = 3;

function sha(data) {
  return createHash("sha256").update(data).digest("hex");
}

function digest(entries) {
  return sha(JSON.stringify(entries.map((e) => [e.id, e.text])));
}

/** Splits markdown into paragraphs, list items, table rows and fenced blocks. */
export function blocks(text) {
  const out = [];
  const lines = text.split("\n");
  let i = 0;
  if (lines[0]?.trim() === "---") {
    const end = lines.findIndex((l, n) => n > 0 && l.trim() === "---");
    if (end > 0) {
      for (const [n, line] of lines.slice(1, end).entries()) {
        if (line.trim()) { out.push({ line: n + 2, kind: "frontmatter", text: line.trim() }); }
      }
      i = end + 1;
    }
  }
  let para = null;
  const flush = () => {
    if (para) { out.push(para); }
    para = null;
  };
  for (; i < lines.length; i++) {
    const line = lines[i];
    const t = line.trim();
    if (/^(```|~~~)/.test(t)) {
      flush();
      const start = i;
      i += 1;
      while (i < lines.length && !/^(```|~~~)/.test(lines[i].trim())) { i += 1; }
      out.push({ line: start + 1, kind: "code", text: lines.slice(start, i + 1).join("\n") });
    } else if (t === "") {
      flush();
    } else if (t.startsWith("#")) {
      flush();
      out.push({ line: i + 1, kind: "heading", text: t });
    } else if (t.startsWith("|")) {
      flush();
      if (!/^\|[\s:|-]+\|$/.test(t)) { out.push({ line: i + 1, kind: "table-row", text: t }); }
    } else if (/^([-*]|\d+\.)\s/.test(t)) {
      flush();
      para = { line: i + 1, kind: "list-item", text: t };
    } else if (para) {
      para.text += ` ${t}`;
    } else {
      para = { line: i + 1, kind: "paragraph", text: t };
    }
  }
  flush();
  return out;
}

function extract(oldDir, ledgerDir) {
  if (existsSync(ledgerDir) && readdirSync(ledgerDir).length > 0) {
    throw new Error(`folder is not empty, and a settled ledger must survive: ${ledgerDir}`);
  }
  mkdirSync(ledgerDir, { recursive: true });
  const manifest = {};
  let total = 0;
  for (const file of walk(oldDir)) {
    const bytes = readFileSync(file);
    if (bytes.includes(0)) { continue; }
    const text = bytes.toString("utf8");
    const source = relative(oldDir, file);
    const prefix = source.replaceAll("/", "__").replace(/\.md$/, "");
    const parts = file.endsWith(".md") ? blocks(text) : [{ line: 1, kind: "file", text }];
    const entries = parts.map((b, n) => ({ id: `${prefix}-${n + 1}`, ...b, status: "pending" }));
    total += entries.length;
    manifest[`${prefix}.json`] = { source, sha: sha(bytes), digest: digest(entries) };
    writeFileSync(join(ledgerDir, `${prefix}.json`), `${JSON.stringify({ source, entries }, null, 2)}\n`);
    console.log(`${source}: ${entries.length} entries`);
  }
  writeFileSync(join(ledgerDir, MANIFEST), `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(`${total} entries pending`);
  return 0;
}

function flat(text) {
  return text.replace(/\s+/g, " ").trim();
}

function settle(entry, newDir) {
  switch (entry.status) {
    case "kept": {
      if (!entry.where || !entry.quote) { return "kept needs where and quote"; }
      const file = resolve(newDir, entry.where);
      const inside = relative(newDir, file);
      if (inside.startsWith("..") || isAbsolute(inside)) { return `where leaves the new skill: ${entry.where}`; }
      if (!existsSync(file)) { return `where does not exist: ${entry.where}`; }
      const quote = flat(entry.quote);
      const needed = Math.min(MIN_QUOTE_WORDS, flat(entry.text).split(" ").length);
      if (quote.split(" ").length < needed) { return `quote has under ${needed} words`; }
      if (!flat(readFileSync(file, "utf8")).includes(quote)) { return `quote is not in ${entry.where}`; }
      return null;
    }
    case "no-rule":
      return entry.reason ? null : "no-rule needs a reason";
    case "dropped":
      if (!entry.reason) { return "dropped needs a reason"; }
      return entry.approved === true ? null : "dropped needs approved: true from the user";
    case "missing":
      return "no match in the new text";
    default:
      return `not settled: ${entry.status}`;
  }
}

function check(ledgerDir, newDir) {
  const manifestPath = join(ledgerDir, MANIFEST);
  if (!existsSync(manifestPath)) { throw new Error(`no manifest in ${ledgerDir}: run extract first`); }
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  const counts = {};
  const failures = [];
  const notes = [];

  for (const name of readdirSync(ledgerDir)) {
    if (name.endsWith(".json") && name !== MANIFEST && !manifest[name]) {
      failures.push(`${name} is not in the manifest`);
    }
  }
  for (const [name, expected] of Object.entries(manifest)) {
    const path = join(ledgerDir, name);
    if (!existsSync(path)) {
      failures.push(`${name} is missing from the ledger`);
      continue;
    }
    const { source, entries } = JSON.parse(readFileSync(path, "utf8"));
    if (digest(entries) !== expected.digest) {
      failures.push(`${name} entries differ from the extract`);
      continue;
    }
    const same = join(newDir, source);
    if (existsSync(same) && sha(readFileSync(same)) === expected.sha) {
      counts.unchanged = (counts.unchanged ?? 0) + entries.length;
      continue;
    }
    for (const entry of entries) {
      counts[entry.status] = (counts[entry.status] ?? 0) + 1;
      const problem = settle(entry, newDir);
      if (problem) { failures.push(`${entry.id} ${source}:${entry.line} ${problem}`); }
      else if (entry.status !== "kept") {
        notes.push(`${entry.status} ${entry.id} ${source}:${entry.line} ${entry.reason}`);
      }
    }
  }
  for (const n of notes) { console.log(n); }
  for (const f of failures) { console.log(f); }
  const summary = Object.entries(counts).sort().map(([k, v]) => `${k}=${v}`).join(" ");
  console.log(`${failures.length} open. ${summary}`);
  return failures.length ? 1 : 0;
}

try {
  const [command, a, b] = process.argv.slice(2);
  if (command === "extract" && a && b) { process.exitCode = extract(a, b); }
  else if (command === "check" && a && b) { process.exitCode = check(a, resolve(b)); }
  else { throw new Error("usage: ledger.mjs extract <old-dir> <ledger-dir> | check <ledger-dir> <new-dir>"); }
} catch (e) {
  console.error(`ledger: ${e.message}`);
  process.exitCode = 2;
}
