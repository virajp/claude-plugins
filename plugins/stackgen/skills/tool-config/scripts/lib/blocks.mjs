// Requester blocks — `# >>> <req>` / `# <<< <req>` (`// >>>` in JSONC) — read,
// written and removed per SKILL.md's Blocks section. Every function takes and
// returns a file's text; lines outside every block are never touched except
// where a caller passes a settled row's change.

const MARKER = /^(\s*)(#|\/\/) (>>>|<<<) (\S+)\s*$/;

export class BlockParseError extends Error {}

export function splitLines(text) {
  const lines = text.split("\n");
  const eol = lines.at(-1) === "";
  if (eol) {
    lines.pop();
  }
  return { lines, eol };
}

export function joinLines(lines, eol = true) {
  if (lines.length === 0) {
    return "";
  }
  return lines.join("\n") + (eol ? "\n" : "");
}

/** Every block, in file order: requester, open and close line indices. */
export function parseBlocks(lines) {
  const blocks = [];
  let open = null;
  lines.forEach((line, i) => {
    const m = MARKER.exec(line);
    if (!m) {
      return;
    }
    const [, indent, comment, dir, requester] = m;
    if (dir === ">>>") {
      if (open) {
        throw new BlockParseError(
          `line ${
            i + 1
          }: block ${requester} opens inside block ${open.requester}`,
        );
      }
      open = { requester, open: i, indent, comment };
    }
    else {
      if (!open || open.requester !== requester) {
        throw new BlockParseError(
          `line ${i + 1}: block ${requester} closes without its opening marker`,
        );
      }
      blocks.push({ ...open, close: i });
      open = null;
    }
  });
  if (open) {
    throw new BlockParseError(
      `line ${open.open + 1}: block ${open.requester} is never closed`,
    );
  }
  return blocks;
}

/** The requesters holding a block in this text, in file order, each once. */
export function blockRequesters(text) {
  const { lines } = splitLines(text);
  return [...new Set(parseBlocks(lines).map(b => b.requester))];
}

/** Each block's body lines, keyed by requester; a requester with two blocks has two arrays. */
export function blockBodies(text) {
  const { lines } = splitLines(text);
  const out = {};
  for (const b of parseBlocks(lines)) {
    (out[b.requester] ??= []).push(lines.slice(b.open + 1, b.close));
  }
  return out;
}

/** A list entry's identity: its text without indentation or list punctuation. */
export function entryKey(line) {
  return line.trim().replace(/[,|]$/, "").trim();
}

function isComment(line) {
  return /^\s*(#|\/\/)/.test(line) && !MARKER.test(line);
}

/** Index of the first line after the frame's leading comment run and the blank lines below it. */
function frameEnd(lines) {
  let i = 0;
  while (i < lines.length && isComment(lines[i])) {
    i++;
  }
  if (i === 0) {
    return 0;
  }
  while (i < lines.length && lines[i].trim() === "") {
    i++;
  }
  return i;
}

const escape = s => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * The line range a position covers: `{kind: "whole"}` (below the frame),
 * `{kind: "table", name}` (a TOML table) or `{kind: "array", key}` (a TOML or
 * JSON list held one entry per line). Null when the position is absent.
 */
export function findRegion(lines, region = { kind: "whole" }) {
  if (region.kind === "whole") {
    return {
      start: frameEnd(lines),
      end: lines.length,
      opener: -1,
      list: false,
    };
  }
  if (region.kind === "table") {
    const header = new RegExp(`^\\s*\\[${escape(region.name)}\\]\\s*(#.*)?$`);
    const at = lines.findIndex(l => header.test(l));
    if (at < 0) {
      return null;
    }
    let end = at + 1;
    while (end < lines.length && !/^\s*\[[^\]]+\]\s*(#.*)?$/.test(lines[end])) {
      end++;
    }
    return { start: at + 1, end, opener: at, list: false };
  }
  if (region.kind === "array") {
    const opener = new RegExp(
      `^\\s*"?${escape(region.key)}"?\\s*[=:]\\s*\\[\\s*$`,
    );
    const at = lines.findIndex(l => opener.test(l));
    if (at < 0) {
      return null;
    }
    let end = at + 1;
    while (end < lines.length && !/^\s*\],?\s*$/.test(lines[end])) {
      end++;
    }
    if (end === lines.length) {
      throw new BlockParseError(`list ${region.key} is never closed`);
    }
    return { start: at + 1, end, opener: at, list: true };
  }
  throw new Error(`unknown region kind ${region.kind}`);
}

/** As findRegion, appending a missing TOML table at the end of the file. */
function ensureRegion(lines, region) {
  const found = findRegion(lines, region);
  if (found) {
    return found;
  }
  if (region.kind !== "table") {
    throw new BlockParseError(
      `no ${region.key ?? region.kind} position in the file`,
    );
  }
  if (lines.length && lines.at(-1).trim() !== "") {
    lines.push("");
  }
  lines.push(`[${region.name}]`);
  return findRegion(lines, region);
}

function sortBody(body, sort) {
  if (!sort) {
    return body;
  }
  const glob = l => /[*?]/.test(l);
  return [...body].sort((a, b) => {
    if (sort === "dirs-first" && glob(a) !== glob(b)) {
      return glob(a) ? 1 : -1;
    }
    return entryKey(a) < entryKey(b) ? -1 : entryKey(a) > entryKey(b) ? 1 : 0;
  });
}

/** Re-derive a list's separators: every entry line ends with one, or all but the last. */
function punctuate(lines, region, list) {
  if (!region.list || !list?.separator) {
    return;
  }
  const sep = list.separator;
  const entries = [];
  for (let i = region.start; i < region.end; i++) {
    const l = lines[i];
    if (l.trim() === "" || MARKER.test(l) || isComment(l)) {
      continue;
    }
    entries.push(i);
  }
  entries.forEach((i, n) => {
    const bare = lines[i].replace(new RegExp(`${escape(sep)}\\s*$`), "");
    lines[i] = list.trailing === false && n === entries.length - 1
      ? bare
      : bare + sep;
  });
}

function removeBlockAt(lines, b) {
  let start = b.open;
  let count = b.close - b.open + 1;
  if (start > 0 && lines[start - 1].trim() === "") {
    start--;
    count++;
  }
  else if (lines[b.close + 1]?.trim() === "") {
    count++;
  }
  lines.splice(start, count);
}

function markers(requester, indent, comment) {
  return [
    `${indent}${comment} >>> ${requester}`,
    `${indent}${comment} <<< ${requester}`,
  ];
}

/**
 * Set a requester's block in one position to `body` — created after the last
 * block there, replaced in place, or removed when `body` is empty.
 */
export function setBlock(
  text,
  { requester, body, region, comment = "#", sort, list },
) {
  const { lines, eol } = splitLines(text);
  const reg = ensureRegion(lines, region ?? { kind: "whole" });
  const inRegion = parseBlocks(lines).filter(b =>
    b.open >= reg.start && b.close < reg.end
  );
  const existing = inRegion.find(b => b.requester === requester);
  const sorted = sortBody(body, sort);
  if (existing) {
    if (sorted.length === 0) {
      removeBlockAt(lines, existing);
    }
    else {
      lines.splice(
        existing.open + 1,
        existing.close - existing.open - 1,
        ...sorted,
      );
    }
  }
  else if (sorted.length) {
    const indent = /^\s*/.exec(sorted[0])[0];
    const [open, close] = markers(requester, indent, comment);
    const block = [open, ...sorted, close];
    const last = inRegion.at(-1);
    if (last) {
      lines.splice(last.close + 1, 0, ...(reg.list ? block : ["", ...block]));
    }
    else {
      let p = reg.end;
      while (p > reg.start && lines[p - 1].trim() === "") {
        p--;
      }
      const gap = !reg.list
        && p > 0
        && p - 1 !== reg.opener
        && lines[p - 1].trim() !== "";
      lines.splice(p, 0, ...(gap ? ["", ...block] : block));
    }
  }
  const after = findRegion(lines, region ?? { kind: "whole" });
  if (after) {
    punctuate(lines, after, list);
  }
  return joinLines(lines, eol || lines.length > 0);
}

/**
 * Add one list entry for a requester. Returns the new text and what happened:
 * `added`; `present` (its own block holds it); `satisfied` (the base or a user
 * line holds it — not shared); `shared` with `holder` (another block holds it,
 * the text unchanged, the caller records the share).
 */
export function addEntry(
  text,
  { requester, line, region, base, key, comment = "#", sort, list },
) {
  const k = key ?? entryKey(line);
  const { lines } = splitLines(text);
  const reg = findRegion(lines, region ?? { kind: "whole" });
  if (reg) {
    const blocks = parseBlocks(lines);
    const inBlock = new Set();
    for (const b of blocks) {
      for (let i = b.open; i <= b.close; i++) {
        inBlock.add(i);
      }
      if (b.open < reg.start || b.close >= reg.end) {
        continue;
      }
      const hit = lines.slice(b.open + 1, b.close).some(l => entryKey(l) === k);
      if (!hit) {
        continue;
      }
      if (b.requester === requester) {
        return { text, outcome: "present" };
      }
      if (b.requester === base) {
        return { text, outcome: "satisfied", holder: base };
      }
      return { text, outcome: "shared", holder: b.requester };
    }
    for (let i = reg.start; i < reg.end; i++) {
      if (!inBlock.has(i) && entryKey(lines[i]) === k) {
        return { text, outcome: "satisfied", holder: null };
      }
    }
  }
  const body = [...(reg ? bodiesIn(lines, reg, requester) : []), line];
  return {
    text: setBlock(text, { requester, body, region, comment, sort, list }),
    outcome: "added",
  };
}

function bodiesIn(lines, reg, requester) {
  const b = parseBlocks(lines).find(x =>
    x.requester === requester && x.open >= reg.start && x.close < reg.end
  );
  return b ? lines.slice(b.open + 1, b.close) : [];
}

/** A requester's block body in one position, or null when it holds none there. */
export function regionBody(text, requester, region = { kind: "whole" }) {
  const { lines } = splitLines(text);
  const reg = findRegion(lines, region);
  if (!reg) {
    return null;
  }
  const inside = parseBlocks(lines).some(x =>
    x.requester === requester && x.open >= reg.start && x.close < reg.end
  );
  return inside ? bodiesIn(lines, reg, requester) : null;
}

/** The blocks of the contiguous run (blocks separated only by blank lines) holding `target`. */
function runOf(lines, blocks, target) {
  const at = blocks.indexOf(target);
  let lo = at;
  let hi = at;
  const gapBlank = (a, b) =>
    lines.slice(a.close + 1, b.open).every(l => l.trim() === "");
  while (lo > 0 && gapBlank(blocks[lo - 1], blocks[lo])) {
    lo--;
  }
  while (hi < blocks.length - 1 && gapBlank(blocks[hi], blocks[hi + 1])) {
    hi++;
  }
  return blocks.slice(lo, hi + 1);
}

/**
 * Remove every block a requester holds. A line it holds that others share
 * moves to the next sharer's block in the same run — or takes over the
 * removed block's place — and `shares` (`{key: [holder, …sharers]}`) is
 * returned updated, the requester gone from every list.
 */
export function removeRequester(text, requester, shares = {}) {
  const { lines, eol } = splitLines(text);
  const next = Object.fromEntries(
    Object.entries(shares).map(([k, v]) => [k, [...v]]),
  );
  for (;;) {
    const blocks = parseBlocks(lines);
    const b = blocks.find(x => x.requester === requester);
    if (!b) {
      break;
    }
    const body = lines.slice(b.open + 1, b.close);
    const groups = new Map();
    for (const l of body) {
      const holders = next[entryKey(l)];
      if (!holders || holders[0] !== requester || holders.length < 2) {
        continue;
      }
      const to = holders[1];
      if (!groups.has(to)) {
        groups.set(to, []);
      }
      groups.get(to).push(l);
    }
    const run = runOf(lines, blocks, b);
    let reused = false;
    // Appends below b first, so b's indices still hold; then b itself.
    const targets = [...groups.keys()]
      .map(to => ({ to, target: run.find(x => x.requester === to) }))
      .sort((x, y) => (y.target?.close ?? -1) - (x.target?.close ?? -1));
    let before = 0;
    for (const { to, target } of targets) {
      if (!target) {
        continue;
      }
      lines.splice(target.close, 0, ...groups.get(to));
      if (target.close < b.open) {
        before += groups.get(to).length;
      }
      groups.delete(to);
    }
    const open = b.open + before;
    const close = b.close + before;
    const leftover = [...groups.entries()];
    if (leftover.length) {
      const [[to, moved], ...rest] = leftover;
      const [o, c] = markers(to, b.indent, b.comment);
      const extra = rest.flatMap(([t, m]) => {
        const [o2, c2] = markers(t, b.indent, b.comment);
        return ["", o2, ...m, c2];
      });
      lines.splice(open, close - open + 1, o, ...moved, c, ...extra);
      reused = true;
    }
    if (!reused) {
      removeBlockAt(lines, { ...b, open, close });
    }
  }
  for (const [k, holders] of Object.entries(next)) {
    const kept = holders.filter(r => r !== requester);
    if (kept.length < 2) {
      delete next[k];
    }
    else {
      next[k] = kept;
    }
  }
  return { text: joinLines(lines, eol), shares: next };
}

/** Whether anything beyond the frame is left: a block, or a user line. */
export function hasContent(text) {
  const { lines } = splitLines(text);
  if (parseBlocks(lines).length) {
    return true;
  }
  let i = frameEnd(lines);
  if (i < lines.length && /^\s*\[[^\]]+\]\s*$/.test(lines[i])) {
    i++;
  }
  return lines.slice(i).some(l => l.trim() !== "");
}

/** Replace, or append below the frame, a user line whose key part starts with `match`. */
export function setUserLine(text, { line, match, region }) {
  const { lines, eol } = splitLines(text);
  const reg = ensureRegion(lines, region ?? { kind: "whole" });
  const inBlock = new Set();
  for (const b of parseBlocks(lines)) {
    for (let i = b.open; i <= b.close; i++) {
      inBlock.add(i);
    }
  }
  for (let i = reg.start; i < reg.end; i++) {
    if (!inBlock.has(i) && match && lines[i].trimStart().startsWith(match)) {
      lines[i] = line;
      return joinLines(lines, eol);
    }
  }
  let p = reg.end;
  while (p > reg.start && lines[p - 1].trim() === "") {
    p--;
  }
  lines.splice(p, 0, line);
  return joinLines(lines, true);
}

/**
 * Drop lines whose trimmed text starts with `match` — only `requester`'s
 * (null: only the user's) when one is given. A block left empty goes too.
 */
export function dropLines(text, { match, requester }) {
  const { lines, eol } = splitLines(text);
  const owner = new Map();
  for (const b of parseBlocks(lines)) {
    for (let i = b.open + 1; i < b.close; i++) {
      owner.set(i, b.requester);
    }
  }
  const keep = lines.filter((l, i) => {
    if (MARKER.test(l)) {
      return true;
    }
    if (requester !== undefined && (owner.get(i) ?? null) !== requester) {
      return true;
    }
    return !l.trimStart().startsWith(match);
  });
  for (;;) {
    const empty = parseBlocks(keep).find(b => b.close === b.open + 1);
    if (!empty) {
      break;
    }
    removeBlockAt(keep, empty);
  }
  return joinLines(keep, eol);
}
