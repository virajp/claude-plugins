// The scripted tools, loaded on demand. A tool absent here is still the
// prose's — its references/<tool>.md — and `all` returns it as
// {tool, handled: "prose"} for the skill to follow. `all` is the module the
// cross-tool verb (`all add-exclude`) lives in; it lands no base.
//
// Below the registry, what the gate modules share: the comparison that
// survives the shipped formatter, the list positions requesters write into,
// and the landing every gate file's base goes through.

import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  joinLines,
  parseBlocks,
  splitLines,
} from "../blocks.mjs";
import {
  isToolConfig,
  LOCK_PATH,
  sha256,
} from "../record.mjs";

export const tools = {
  mise: () => import("./mise.mjs"),
  dprint: () => import("./dprint.mjs"),
  "pre-commit": () => import("./pre-commit.mjs"),
  gitleaks: () => import("./gitleaks.mjs"),
  grype: () => import("./grype.mjs"),
  all: () => import("./exclude.mjs"),
};

// --- content, as the shipped formatter leaves it ---------------------------------

/** A file a list position or a migration cannot read: a needs-edit row, never a guess. */
export class ListError extends Error {}

function unquote(raw) {
  if (raw.startsWith("'''") || raw.startsWith("\"\"\"")) {
    return raw.slice(3, -3);
  }
  if (raw.startsWith("'")) {
    return raw.slice(1, -1).replaceAll("''", "'");
  }
  try {
    return JSON.parse(raw);
  }
  catch {
    return raw.slice(1, -1);
  }
}

/** The end of a quoted string opening at `i`, past its closing quote, or -1. */
function quoteEnd(text, i) {
  const triple = text.slice(i, i + 3);
  if (triple === "'''" || triple === "\"\"\"") {
    const at = text.indexOf(triple, i + 3);
    return at < 0 ? -1 : at + 3;
  }
  const q = text[i];
  for (let j = i + 1; j < text.length; j++) {
    if (text[j] === "\n") {
      return -1;
    }
    if (q === "\"" && text[j] === "\\") {
      j++;
    }
    else if (text[j] === q) {
      if (q === "'" && text[j + 1] === "'") {
        j++;
        continue;
      }
      return j + 1;
    }
  }
  return -1;
}

/**
 * A text as the words the formatter cannot change: whitespace and line
 * breaks dropped, a quoted string read as its value however it is quoted,
 * brackets and commas their own words and a list's trailing comma dropped.
 * Two texts with the same words are one content, however dprint, taplo or
 * pretty_yaml laid either out — so a landed file the formatter rewrapped is
 * never a change.
 */
export function words(text) {
  const out = [];
  let word = "";
  const flush = () => {
    if (word) {
      out.push(word);
      word = "";
    }
  };
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (/\s/.test(c)) {
      flush();
      continue;
    }
    if ("[]{},".includes(c)) {
      flush();
      if ((c === "]" || c === "}") && out.at(-1) === ",") {
        out.pop();
      }
      out.push(c);
      continue;
    }
    if ((c === "\"" || c === "'") && word === "") {
      const end = quoteEnd(text, i);
      if (end > 0) {
        out.push(`\u0000${unquote(text.slice(i, end))}`);
        i = end - 1;
        continue;
      }
    }
    word += c;
  }
  flush();
  return out;
}

const KEY_LINE = /^(- )?([A-Za-z_][\w.-]*|"[^"]*"|'[^']*'):(\s|$)/;

/**
 * A YAML text as its structure: one entry per logical line — its nesting
 * depth (from the indentation stack, so a re-nested key is a change) and its
 * words — with a plain scalar's continuation lines folded into the line they
 * continue and comment lines kept without a depth. What pretty_yaml changes
 * — quote style, a rewrapped plain scalar, trailing whitespace, blank lines —
 * is never a change.
 */
function yamlShape(text) {
  const out = [];
  const stack = [];
  let scalar = null; // the indent of a block scalar's key, while inside it
  let open = null; // the indent of a line whose plain scalar a deeper line may continue
  for (const raw of text.split("\n")) {
    const line = raw.trimEnd();
    if (line.trim() === "") {
      continue;
    }
    const indent = line.length - line.trimStart().length;
    const body = line.trimStart();
    if (scalar !== null && indent > scalar) {
      out.push(`|${words(body).join(" ")}`);
      continue;
    }
    scalar = null;
    if (body.startsWith("#")) {
      out.push(`#${words(body.slice(1)).join(" ")}`);
      continue;
    }
    if (
      open !== null
      && indent > open
      && !KEY_LINE.test(body)
      && !body.startsWith("- ")
    ) {
      out[out.length - 1] += ` ${words(body).join(" ")}`;
      continue;
    }
    while (stack.length && stack.at(-1) >= indent) {
      stack.pop();
    }
    out.push(`${stack.length}:${words(body).join(" ")}`);
    stack.push(indent);
    const value = KEY_LINE.exec(body)
      ? body.slice(KEY_LINE.exec(body)[0].length).trim()
      : body.startsWith("- ")
      ? body.slice(2).trim()
      : "";
    scalar = /^[|>][-+]?\d*\s*(#.*)?$/.test(value) ? indent : null;
    open = value !== "" && !/^[|>[{"'&*!#]/.test(value) ? indent : null;
  }
  return out;
}

/**
 * Whether two texts of one file are one content, however the shipped
 * formatter laid either out: a YAML file compared by its structure, any other
 * by its words.
 */
export const sameContent = (path, a, b) =>
  a !== null
  && b !== null
  && JSON.stringify(/\.ya?ml$/.test(path) ? yamlShape(a) : words(a))
    === JSON.stringify(/\.ya?ml$/.test(path) ? yamlShape(b) : words(b));

// --- writing YAML values ----------------------------------------------------------------

/**
 * A YAML double-quoted scalar reading back exactly `v`: JSON's escapes, plus
 * the ones JSON leaves raw — DEL, the C1 controls (U+0085 among them) and
 * U+2028/U+2029 — so no value can break the line it is written on.
 */
// DEL, the C1 controls and the two Unicode line terminators, spelled as escapes
const BREAKERS = new RegExp("[\\u007f-\\u009f\\u2028\\u2029]", "g");

export const yamlQuote = v =>
  JSON.stringify(v).replace(
    BREAKERS,
    c => `\\u${c.charCodeAt(0).toString(16).padStart(4, "0")}`,
  );

/**
 * A value as a YAML scalar: plain only when it is printable ASCII and
 * nothing YAML reads specially — an indicator first, `: ` or ` #` inside, a
 * boolean, null or number lookalike — else double-quoted.
 */
export function yamlScalar(v) {
  const plain = /^[A-Za-z0-9(/.$^\\_~+=][\x20-\x7e]*$/.test(v)
    && !/: |\s#|:$|\s$/.test(v)
    && !/^(true|false|yes|no|on|off|null|~|[-+]?[0-9][0-9._eE+-]*)$/i.test(v);
  return plain ? v : yamlQuote(v);
}

// --- the base's landing -------------------------------------------------------------

/** One tool's asset, whichever module's context reads it — `ctx.asset` is the calling tool's own. */
export const assetOf = (ctx, tool, rel) =>
  readFileSync(
    join(ctx.pluginRoot, "skills", "tool-config", "assets", tool, rel),
    "utf8",
  );

/** Whether a file is byte for byte what tool-config last recorded for it. */
export function untouched(ctx, path, current) {
  return current !== null && ctx.record(path)?.hash === sha256(current);
}

/** The source of a path the retired `toolchain-gate/<tool>` pack landed, or null. */
export function oldPack(ctx, path, tool) {
  const source = ctx.source(path);
  return source?.startsWith(`pack/toolchain-gate/${tool}@`) ? source : null;
}

/** Whether a path is another source's, which the skill leaves alone. */
export function foreign(ctx, path, tool) {
  const source = ctx.source(path);
  return source !== null
    && !isToolConfig({ source })
    && oldPack(ctx, path, tool) === null;
}

/**
 * The ops that bring one base file to `rendered` on `all`: created when
 * absent, left alone when its words already are that, an update when nobody
 * edited it since it was landed or when the retired gate pack landed it
 * (`supersedes`), else the engine's drift row (recorded) or conflict row (a
 * file stackgen never recorded).
 */
export function landOps(ctx, path, current, rendered, supersedes) {
  if (current === null) {
    return [{ op: "whole", path, content: rendered }];
  }
  if (supersedes) {
    const write = {
      op: "whole",
      path,
      content: rendered,
      force: true,
      supersedes,
    };
    // a byte-equal file is still taken over, so its lock entry is re-recorded
    return current === rendered
      ? [{ op: "delete", path, supersedes }, write]
      : [write];
  }
  if (sameContent(path, current, rendered)) {
    return [];
  }
  if (untouched(ctx, path, current)) {
    return [{ op: "whole", path, content: rendered, force: true }];
  }
  return [{
    op: "whole",
    path,
    content: rendered,
    drift: ctx.record(path) !== null,
  }];
}

/**
 * On a migration, the lines of the old file the new layout does not carry —
 * a key the retired pack shipped differently, or a line of the person's own
 * outside every position `all` carries — as one needs-edit row, so nothing
 * is dropped unseen. Blank and comment lines, and `target` (its own row),
 * are not counted.
 */
export function droppedRows(ctx, path, current, rendered) {
  if (current === null) {
    return [];
  }
  // a regex alternative's `|` and a trailing comment are punctuation, never content
  const norm = l => {
    const w = words(l.trim().replace(/^\|/, "").replace(/\|$/, ""));
    const comment = w.findIndex(t => t.startsWith("#"));
    return (comment < 0 ? w : w.slice(0, comment))
      .filter(t => t !== ",")
      .join(" ");
  };
  const counted = l =>
    l.trim() !== "" && !l.trim().startsWith("#") && !/target\//.test(l);
  const have = new Map();
  for (const l of rendered.split("\n").filter(counted)) {
    have.set(norm(l), (have.get(norm(l)) ?? 0) + 1);
  }
  const dropped = current
    .split("\n")
    .filter(counted)
    .filter(l => {
      const n = have.get(norm(l)) ?? 0;
      have.set(norm(l), n - 1);
      return n < 1;
    })
    .map(l => l.trim());
  return dropped.length
    ? [ctx.needsEdit({
      file: path,
      reason:
        "the migration's rewrite does not carry these lines of the old file — re-add each that was the person's own, where the layout keeps it",
      target: dropped,
    })]
    : [];
}

/** `check`'s half: the file as it stands where its content is the rendering, else the rendering. */
export const expectedWhole = (path, text, rendered) => ({
  whole: sameContent(path, text, rendered) ? text : rendered,
});

/** A file a verb writes into: refused when absent, or — for a requester — when tool-config has no record of it. */
export function need(ctx, path, tool, requester) {
  const text = ctx.read(path);
  if (text === null) {
    throw new ctx.RefusalError(
      `${path} is not here — land ${tool}'s base first (all)`,
    );
  }
  if (requester && ctx.record(path) === null) {
    throw new ctx.RefusalError(
      `${path} has no tool-config record — run all first, so ${requester}'s lines can be told apart`,
    );
  }
  return text;
}

/** The hash another source's lock entry records for a path, read from the lock as written. */
function lockHash(ctx, path) {
  const lock = ctx.read(LOCK_PATH) ?? "";
  for (const item of lock.split(/\n(?=\s*- path:)/)) {
    const p = /^\s*- path:\s*("?)(.+?)\1\s*$/m.exec(item);
    if (p && p[2] === path) {
      return /^\s*hash:\s*([0-9a-f]+)/m.exec(item)?.[1] ?? null;
    }
  }
  return null;
}

/**
 * The repo-local skill the retired gate pack copied under
 * `.claude/skills/<tool>/`: deleted where it still matches its record, kept
 * and reported where it does not.
 */
export function oldSkill(ctx, tool, notes) {
  const path = `.claude/skills/${tool}/SKILL.md`;
  const text = ctx.read(path);
  const source = oldPack(ctx, path, tool);
  if (text === null || source === null) {
    return [];
  }
  if (lockHash(ctx, path) === sha256(text)) {
    return [{ op: "delete", path, supersedes: source }];
  }
  notes.push(
    `${path} kept: it was changed since the retired ${tool} gate pack landed it — delete it by hand`,
  );
  return [];
}

/** A needs-edit row for a file a module cannot read. */
export function unreadable(ctx, path, e, target) {
  return ctx.needsEdit({
    file: path,
    reason: `cannot read: ${e.message}`,
    target,
  });
}

// --- list positions -------------------------------------------------------------------
//
// A position requesters write into that is a list — a TOML array, a YAML
// sequence, the hook config's verbose regex. A spec names it:
//
//   {key, open: RegExp (the opener line), kind: "toml" | "yaml" | "regex",
//    indent, punct?: "comma" | "bar", order: "alpha" | "dirs-first", flow?}
//
// `flow` is a YAML key whose empty list is written `<key>: []`. Its units are
// blocks ({requester, lines}) and the person's own lines ({line}), in order.

const isEntry = line => line.trim() !== "" && !/^\s*#/.test(line);

/** The line range a list's entries sit in, or null when the file has no such list. */
export function listRegion(lines, spec) {
  const at = lines.findIndex(l => spec.open.test(l));
  if (at < 0) {
    return null;
  }
  let start = at + 1;
  if (spec.kind === "regex") {
    if (!/^\s+\(\?x\)\s*$/.test(lines[start] ?? "")) {
      throw new ListError(`the ${spec.key} is not a verbose (?x) regex`);
    }
    start++;
  }
  let end = start;
  if (spec.kind === "toml") {
    while (end < lines.length && !/^\s*\]\s*$/.test(lines[end])) {
      end++;
    }
    if (end === lines.length) {
      throw new ListError(`the ${spec.key} list is never closed`);
    }
  }
  else if (!/\[\]\s*$/.test(lines[at])) {
    while (
      end < lines.length && (lines[end].trim() === "" || /^\s/.test(lines[end]))
    ) {
      end++;
    }
    while (end > start && lines[end - 1].trim() === "") {
      end--;
    }
  }
  return { opener: at, start, end };
}

/**
 * An entry's identity — the key a share is recorded under: the line without
 * list punctuation (a leading `|` or `- `, a trailing comma) or a trailing
 * comment, a quoted entry read as its value.
 */
export function entryOf(line) {
  const t = line.trim().replace(/^\|/, "").replace(/^- /, "");
  if (t.startsWith("\"") || t.startsWith("'")) {
    const end = quoteEnd(t, 0);
    if (end > 0) {
      return unquote(t.slice(0, end));
    }
  }
  return t.replace(/\s+#.*$/, "").replace(/,$/, "").trim();
}

export function readList(lines, region, spec) {
  const found = parseBlocks(lines);
  const units = [];
  for (let i = region.start; i < region.end; i++) {
    const b = found.find(x => x.open === i);
    if (b) {
      if (b.close >= region.end) {
        throw new ListError(
          `block ${b.requester} runs past the ${spec.key} list`,
        );
      }
      units.push({
        requester: b.requester,
        lines: lines.slice(b.open + 1, b.close),
      });
      i = b.close;
    }
    else if (lines[i].trim() !== "") {
      units.push({ line: lines[i] });
    }
  }
  return units;
}

function punctuate(body, spec) {
  const at = body.map((l, i) => (isEntry(l) ? i : -1)).filter(i => i >= 0);
  at.forEach((i, n) => {
    if (spec.punct === "comma") {
      body[i] = `${body[i].replace(/,\s*$/, "")},`;
    }
    else if (spec.punct === "bar") {
      const [, pad, rest] = /^(\s*)\|?(.*)$/.exec(body[i]);
      body[i] = `${pad}${n === 0 ? "" : "|"}${rest}`;
    }
  });
}

/** The lines with the list's entries replaced by `units`, its punctuation re-derived. */
export function writeList(lines, region, spec, units) {
  const body = [];
  for (const u of units) {
    if (u.requester === undefined) {
      body.push(u.line);
    }
    else if (u.lines.length) {
      body.push(
        `${spec.indent}# >>> ${u.requester}`,
        ...u.lines,
        `${spec.indent}# <<< ${u.requester}`,
      );
    }
  }
  punctuate(body, spec);
  const out = [...lines];
  out.splice(region.start, region.end - region.start, ...body);
  if (spec.flow) {
    out[region.opener] = body.length ? `${spec.key}:` : `${spec.key}: []`;
  }
  return out;
}

export function sortLines(lines, order) {
  const key = l => entryOf(l);
  const glob = l => (order === "dirs-first" && !key(l).endsWith("/") ? 1 : 0);
  return [...lines].sort((a, b) =>
    glob(a) - glob(b) || (key(a) < key(b) ? -1 : key(a) > key(b) ? 1 : 0)
  );
}

/** Where a new block goes: after the last block, or at the end. */
const blockSlot = units => {
  const last = units.findLastIndex(u => u.requester !== undefined);
  return last < 0 ? units.length : last + 1;
};

/**
 * Add entries — spelled lines without punctuation — to `requester`'s block
 * in a list, or with no requester as the person's own lines at its end. An
 * entry its own block holds is present; one the base or a person's line holds
 * is satisfied, and noted; one another block holds is shared, recorded in
 * `shares` against that block, the holder first.
 */
export function listAdd(
  text,
  spec,
  { requester, entries, base, shares, notes, path },
) {
  const { lines, eol } = splitLines(text);
  const region = listRegion(lines, spec);
  if (!region) {
    throw new ListError(`${path} has no ${spec.key} list`);
  }
  const units = readList(lines, region, spec);
  const holder = key => {
    for (const u of units) {
      const held = u.requester === undefined
        ? entryOf(u.line) === key
        : u.lines.some(l => entryOf(l) === key);
      if (held) {
        return u.requester ?? null;
      }
    }
    return undefined;
  };
  const add = [];
  const shared = [];
  for (const entry of entries) {
    const key = entryOf(entry);
    const h = holder(key);
    if (h === undefined) {
      if (!add.some(a => entryOf(a) === key)) {
        add.push(`${spec.indent}${entry}`);
      }
    }
    else if (h === requester) {
      continue;
    }
    else if (!requester || h === base || h === null) {
      notes.push(
        `${path}: ${entry} is already held by ${
          h ?? "a line of the person's own"
        } — satisfied`,
      );
    }
    else {
      const holders = (shares[key] ??= [h]);
      if (!holders.includes(requester)) {
        holders.push(requester);
        shared.push(entry);
      }
    }
  }
  if (add.length && requester) {
    const own = units.find(u => u.requester === requester);
    if (own) {
      own.lines = sortLines([...own.lines, ...add], spec.order);
    }
    else {
      units.splice(blockSlot(units), 0, {
        requester,
        lines: sortLines(add, spec.order),
      });
    }
  }
  else if (add.length) {
    units.push(...add.map(line => ({ line })));
  }
  return {
    text: joinLines(writeList(lines, region, spec, units), eol),
    shared,
  };
}

/**
 * Take every block `requester` holds out of a list. An entry it holds that
 * others share moves to the next sharer's block — or takes the removed
 * block's place — and `requester` leaves every share list.
 */
export function listRemove(text, spec, { requester, shares }) {
  const { lines, eol } = splitLines(text);
  const region = listRegion(lines, spec);
  if (region) {
    const units = readList(lines, region, spec);
    for (const own of units.filter(u => u.requester === requester)) {
      const moving = new Map();
      for (const l of own.lines) {
        const holders = shares[entryOf(l)];
        if (holders?.[0] === requester && holders.length > 1) {
          moving.set(holders[1], [...(moving.get(holders[1]) ?? []), l]);
        }
      }
      const replacing = [];
      for (const [to, moved] of moving) {
        const target = units.find(u => u.requester === to);
        if (target) {
          target.lines = sortLines([...target.lines, ...moved], spec.order);
        }
        else {
          replacing.push({
            requester: to,
            lines: sortLines(moved, spec.order),
          });
        }
      }
      units.splice(units.indexOf(own), 1, ...replacing);
    }
    text = joinLines(writeList(lines, region, spec, units), eol);
  }
  leaveShares(shares, requester);
  return text;
}

/** Take a requester out of every share list; a list left with one holder is no share. */
export function leaveShares(shares, requester) {
  for (const [key, holders] of Object.entries(shares)) {
    const kept = holders.filter(r => r !== requester);
    if (kept.length < 2) {
      delete shares[key];
    }
    else {
      shares[key] = kept;
    }
  }
}

/**
 * The asset with its list position holding, after the asset's own entries,
 * every unit `current` holds there but the base's block — the blocks and the
 * person's lines `all` carries across — save a person's line the base block
 * already holds.
 */
export function carryList(assetText, currentText, spec, base) {
  const a = splitLines(assetText);
  const ra = listRegion(a.lines, spec);
  const c = currentText === null ? null : splitLines(currentText).lines;
  const rc = c && listRegion(c, spec);
  if (!rc) {
    return assetText;
  }
  const mine = readList(a.lines, ra, spec);
  const held = new Set(
    mine
      .flatMap(u => (u.requester === undefined ? [u.line] : u.lines))
      .map(entryOf),
  );
  const kept = readList(c, rc, spec).filter(u =>
    u.requester === undefined
      ? !held.has(entryOf(u.line))
      : u.requester !== base
  );
  return joinLines(writeList(a.lines, ra, spec, [...mine, ...kept]), a.eol);
}

/** A copy of one of a path's record maps — `shares`, `keys` — to change and hand back through recordOps. */
export const recordMap = (ctx, path, field) =>
  structuredClone(ctx.record(path)?.[field] ?? {});

/**
 * The engine's `record` op for the maps that differ from the path's record
 * — none when nothing moved. The engine shows the change as a row.
 */
export function recordOps(ctx, path, fields) {
  const rec = ctx.record(path);
  const moved = Object.fromEntries(
    Object.entries(fields).filter(([f, map]) =>
      JSON.stringify(rec?.[f] ?? {}) !== JSON.stringify(map ?? {})
    ),
  );
  return Object.keys(moved).length
    ? [{ op: "record", path, fields: moved }]
    : [];
}

/** A path's whole write when its text moved, then its record maps when they moved. */
export const writeOps = (ctx, path, before, after, fields = {}) => [
  ...(after === before
    ? []
    : [{ op: "whole", path, content: after, force: true }]),
  ...recordOps(ctx, path, fields),
];
