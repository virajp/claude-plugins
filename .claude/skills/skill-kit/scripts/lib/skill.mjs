// Reads a skill folder into one object. No dependencies: this runs with nothing
// installed beside it.
import {
  existsSync,
  readdirSync,
  readFileSync,
  statSync,
} from "node:fs";
import {
  dirname,
  join,
  relative,
  resolve,
} from "node:path";

const RESERVED = /^[[{*&!%@`]/;

function unquote(value) {
  const m = value.match(/^(["'])(.*)\1$/);
  return m ? m[2] : value;
}

function isQuoted(value) {
  return /^["']/.test(value);
}

function scalar(value, line, errors) {
  if (isQuoted(value)) { return unquote(value); }
  if (RESERVED.test(value) && !value.startsWith("[")) {
    errors.push({ line, msg: `plain value starts with a reserved character: ${value}` });
  }
  if (/:\s/.test(value)) {
    errors.push({ line, msg: `plain value holds ": ", quote or fold it: ${value}` });
  }
  return value;
}

function inlineList(value) {
  return value.slice(1, -1).split(",").map((v) => unquote(v.trim())).filter(Boolean);
}

/** Parses the frontmatter subset that skills use. Reports what it cannot read. */
export function parseFrontmatter(lines, offset) {
  const fm = {};
  const errors = [];
  let i = 0;

  const indented = () => i < lines.length && (lines[i].trim() === "" || /^\s/.test(lines[i]));

  while (i < lines.length) {
    const raw = lines[i];
    const number = offset + i;
    if (raw.includes("\t")) { errors.push({ line: number, msg: "tab in frontmatter" }); }
    if (raw.trim() === "" || raw.trim().startsWith("#")) {
      i += 1;
      continue;
    }
    const m = raw.match(/^([A-Za-z][\w-]*):\s*(.*)$/);
    if (!m) {
      errors.push({ line: number, msg: `cannot read line: ${raw}` });
      i += 1;
      continue;
    }
    const [, key, rest] = m;
    i += 1;
    if (/^[>|][-+]?$/.test(rest)) {
      const parts = [];
      while (indented()) { parts.push(lines[i++].trim()); }
      fm[key] = parts.join(" ").trim();
    } else if (rest === "") {
      const block = [];
      while (indented() || (i < lines.length && lines[i].startsWith("- "))) { block.push(lines[i++]); }
      fm[key] = readBlock(block);
    } else if (rest.startsWith("[") && rest.endsWith("]")) {
      fm[key] = inlineList(rest);
    } else {
      const parts = [rest];
      while (indented() && lines[i].trim() !== "") { parts.push(lines[i++].trim()); }
      const joined = parts.join(" ");
      fm[key] = scalar(joined, number, errors);
    }
  }
  return { fm, errors };
}

function readBlock(block) {
  const rows = block.filter((l) => l.trim() !== "");
  if (rows.length === 0) { return ""; }
  if (rows[0].trim().startsWith("- ")) {
    return rows.filter((l) => l.trim().startsWith("- ")).map((l) => unquote(l.trim().slice(2).trim()));
  }
  const width = rows[0].length - rows[0].trimStart().length;
  const map = {};
  let listKey = null;
  for (const row of rows) {
    const t = row.trim();
    if (row.length - row.trimStart().length !== width) {
      if (listKey && t.startsWith("- ")) { map[listKey].push(unquote(t.slice(2).trim())); }
      continue;
    }
    const m = t.match(/^([\w-]+):\s*(.*)$/);
    listKey = null;
    if (!m) { continue; }
    const value = m[2];
    if (value === "") {
      listKey = m[1];
      map[listKey] = [];
    } else {
      map[m[1]] = value.startsWith("[") && value.endsWith("]") ? inlineList(value) : unquote(value);
    }
  }
  return map;
}

export function countWords(text) {
  const t = text.trim();
  return t === "" ? 0 : t.split(/\s+/).length;
}

/** Blanks fenced blocks, and keeps line numbers. */
export function stripFences(text) {
  let open = false;
  return text
    .split("\n")
    .map((line) => {
      if (/^\s*(```|~~~)/.test(line)) {
        open = !open;
        return "";
      }
      return open ? "" : line;
    })
    .join("\n");
}

export function stripCode(line) {
  // Capital, so that a span can start a sentence in the sentence split.
  return line.replace(/`[^`]*`/g, "X");
}

export function cells(row) {
  return row.trim().replace(/^\|/, "").replace(/\|$/, "").split(/(?<!\\)\|/).map((c) => c.trim());
}

/** The tables in a block of text: header cells, and rows with line numbers. */
export function tables(text, firstLine = 1) {
  const out = [];
  const lines = text.split("\n");
  for (let i = 0; i < lines.length - 1; i++) {
    if (!lines[i].trim().startsWith("|") || !/^\s*\|[\s:|-]+\|\s*$/.test(lines[i + 1])) { continue; }
    const table = { header: cells(lines[i]), rows: [] };
    let j = i + 2;
    for (; j < lines.length && lines[j].trim().startsWith("|"); j++) {
      table.rows.push({ line: firstLine + j, cells: cells(lines[j]), raw: lines[j] });
    }
    out.push(table);
    i = j - 1;
  }
  return out;
}

export function sections(text, firstLine = 1) {
  const lines = stripFences(text).split("\n");
  const out = [];
  lines.forEach((line, i) => {
    const m = line.match(/^## +(.+?)\s*$/);
    if (m) { out.push({ title: m[1], line: firstLine + i, start: i + 1 }); }
  });
  out.forEach((s, i) => {
    s.text = lines.slice(s.start, i + 1 < out.length ? out[i + 1].start - 1 : lines.length).join("\n");
  });
  return out;
}

/** Relative link targets outside code. Placeholders and variables do not count. */
export function links(text, firstLine = 1) {
  const out = [];
  stripFences(text).split("\n").forEach((line, i) => {
    const clean = stripCode(line);
    const found = [...clean.matchAll(/\]\(([^)\s]+)\)/g), ...clean.matchAll(/^\[[^\]]+\]:\s*(\S+)/g)];
    for (const m of found) {
      const target = m[1].split("#")[0];
      if (!target || /^[a-z]+:/i.test(target) || /[<>$*{]/.test(target)) { continue; }
      out.push({ target, line: firstLine + i });
    }
  });
  return out;
}

export function walk(dir) {
  if (!existsSync(dir)) { return []; }
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

export function readSkill(dir) {
  const path = resolve(dir, "SKILL.md");
  const text = readFileSync(path, "utf8");
  const lines = text.split("\n");
  const skill = { dir: resolve(dir), path, fm: {}, errors: [], body: text, bodyLine: 1 };
  if (lines[0].trim() !== "---") {
    skill.errors.push({ line: 1, msg: "no frontmatter block" });
    return skill;
  }
  const end = lines.findIndex((l, i) => i > 0 && l.trim() === "---");
  if (end < 0) {
    skill.errors.push({ line: 1, msg: "frontmatter block is not closed" });
    return skill;
  }
  const { fm, errors } = parseFrontmatter(lines.slice(1, end), 2);
  skill.fm = fm;
  skill.errors = errors;
  skill.body = lines.slice(end + 1).join("\n");
  skill.bodyLine = end + 2;
  return skill;
}

export function invocationState(fm) {
  if (fm["user-invocable"] === "false") { return "model"; }
  if (fm["disable-model-invocation"] === "true") { return "user"; }
  return "both";
}

export function meta(skill) {
  return typeof skill.fm.metadata === "object" && !Array.isArray(skill.fm.metadata) ? skill.fm.metadata : {};
}

/** The names in metadata.depends-on, as a list and with no plugin prefix. */
export function dependencies(skill) {
  return [].concat(meta(skill)["depends-on"] ?? []).filter(Boolean).map((n) => n.split(":").pop());
}

/** Words of the body plus every file that a `Loads` table marks `always`. */
export function loadedWords(skill) {
  const body = countWords(skill.body);
  let always = body;
  const seen = new Set();
  for (const table of tables(skill.body)) {
    const col = table.header.findIndex((h) => h.toLowerCase() === "loads");
    if (col < 0) { continue; }
    for (const row of table.rows) {
      if ((row.cells[col] ?? "").toLowerCase() !== "always") { continue; }
      for (const { target } of links(row.raw)) {
        const file = resolve(skill.dir, target);
        if (seen.has(file) || !existsSync(file)) { continue; }
        seen.add(file);
        always += countWords(readFileSync(file, "utf8"));
      }
    }
  }
  const total = walk(skill.dir).filter((f) => f.endsWith(".md")).reduce(
    (sum, f) => sum + countWords(readFileSync(f, "utf8")),
    0,
  );
  return { body, always, total };
}

/** Markdown files reachable from SKILL.md by relative links. */
export function reachable(skill) {
  const seen = new Set();
  const queue = [skill.path];
  while (queue.length) {
    const file = queue.pop();
    if (seen.has(file) || !existsSync(file) || !file.endsWith(".md")) { continue; }
    seen.add(file);
    const text = readFileSync(file, "utf8");
    for (const { target } of links(text)) { queue.push(resolve(dirname(file), target)); }
    // A skill can also name a file as a plain path, with or without the plugin root.
    for (const m of text.matchAll(/\b(?:references|workflows)\/[\w.-]+\.md\b/g)) {
      queue.push(resolve(skill.dir, m[0]));
    }
  }
  return seen;
}

export function rel(root, path) {
  return relative(root, path) || ".";
}
