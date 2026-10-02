// The pre-commit tool module — references/pre-commit.md, on the engine's
// interface (the header of tool-config.mjs). `all` lands the hook config, the
// commit convention and the linter config, filling `commitScopes` from
// `--scopes` and the changelog links from `origin`; `add-hook`,
// `add-linter-ignore` and `set-scopes` are its verbs; `remove` takes a
// requester's blocks out of both positions of the hook config and the
// linter's `ignores:`.
//
// The hook config holds a requester's blocks at two positions: the global
// `(?x)` exclude, where the `|` opening every alternative but the first is
// re-derived on every write, and `repos:`, where a block follows the last
// entry and one blank line separates two entries, a block included.

import {
  BlockParseError,
  joinLines,
  parseBlocks,
  splitLines,
} from "../blocks.mjs";
import {
  GATE_VERBS,
  PATTERNS,
  POST_STAGES,
} from "../schema.mjs";
import { targetRows } from "./dprint.mjs";
import {
  assetOf,
  carryList,
  expectedWhole,
  foreign,
  landOps,
  listAdd,
  ListError,
  listRegion,
  listRemove,
  need,
  oldPack,
  oldSkill,
  recordMap,
  sameContent,
  unreadable,
  words,
  writeOps,
} from "./index.mjs";

const BASE = "pre-commit";
export const HOOKS = ".config/pre-commit-config.yaml";
const CONVENTION = ".config/git-conventional-commits.yaml";
const LINTER = ".config/linter.yaml";
const FRAGMENTS = ".config/pre-commit.d";

/** The global exclude: the hook config's spelling of the exclusion set. */
export const EXCLUDE = {
  key: "exclude",
  open: /^exclude:\s*\|-?\s*$/,
  kind: "regex",
  indent: "  ",
  punct: "bar",
  order: "dirs-first",
};

const IGNORES = {
  key: "ignores",
  open: /^ignores:\s*(\[\]\s*)?$/,
  kind: "yaml",
  indent: "  ",
  order: "alpha",
  flow: true,
};

const MARKER = /^(\s*)(#|\/\/) (>>>|<<<) (\S+)\s*$/;

/** A YAML scalar's value: unquoted, its trailing comment dropped. */
function scalarValue(text) {
  const w = words(text);
  const t = w[0] ?? "";
  return t.startsWith("\u0000")
    ? t.slice(1)
    : text.replace(/\s+#.*$/, "").trim();
}

/** A value as a YAML scalar reading back the same characters: plain where that is safe, else double-quoted. */
function yamlScalar(v) {
  const plain = /^[A-Za-z0-9(/.$^\\_~+=][^\n]*$/.test(v)
    && !/: |\s#|:$|\s$/.test(v)
    && !/^(true|false|yes|no|on|off|null|~|[-+]?[0-9][0-9._eE+-]*)$/i.test(v);
  return plain ? v : JSON.stringify(v);
}

// --- repos: --------------------------------------------------------------------------

function reposRegion(lines) {
  const at = lines.findIndex(l => /^repos:\s*$/.test(l));
  if (at < 0) {
    return null;
  }
  let end = at + 1;
  while (end < lines.length && !/^[^\s#]/.test(lines[end])) {
    end++;
  }
  while (end > at + 1 && lines[end - 1].trim() === "") {
    end--;
  }
  return { start: at + 1, end };
}

const indentOf = l => /^\s*/.exec(l)[0].length;

/**
 * `repos:` as units, in order: a block ({requester, lines, lead}) or one
 * `- repo:` entry ({repo, lines}) with the comment lines directly above it;
 * `owner` is the requester, the base for the asset's own entries, null for
 * the person's.
 */
function repoUnits(lines, region, baseRepos) {
  const found = parseBlocks(lines);
  const at = lines
    .slice(region.start, region.end)
    .filter(l => /^\s*- repo:/.test(l))
    .map(indentOf);
  const pad = at.length ? Math.min(...at) : 2;
  const units = [];
  let lead = [];
  let cur = null;
  const close = () => {
    if (cur) {
      while (cur.lines.at(-1)?.trim() === "") {
        cur.lines.pop();
      }
      units.push(cur);
      cur = null;
    }
  };
  for (let i = region.start; i < region.end; i++) {
    const l = lines[i];
    const b = found.find(x => x.open === i);
    if (b) {
      if (b.close >= region.end) {
        throw new ListError(`block ${b.requester} runs past repos:`);
      }
      close();
      units.push({
        requester: b.requester,
        owner: b.requester,
        lines: lines.slice(b.open + 1, b.close),
        lead,
      });
      lead = [];
      i = b.close;
      continue;
    }
    const m = /^(\s*)- repo:\s*(.*?)\s*$/.exec(l);
    if (m && m[1].length === pad) {
      close();
      cur = { repo: scalarValue(m[2]), lines: [...lead, l] };
      lead = [];
    }
    else if (/^\s*#/.test(l) && indentOf(l) === pad) {
      close();
      lead.push(l);
    }
    else if (cur) {
      cur.lines.push(l);
    }
    else if (l.trim() !== "") {
      throw new ListError(`repos: cannot read ${l.trim()}`);
    }
  }
  close();
  const seen = new Map();
  for (const u of units) {
    if (u.requester !== undefined) {
      continue;
    }
    const n = (seen.get(u.repo) ?? 0) + 1;
    seen.set(u.repo, n);
    u.owner = n <= baseRepos.filter(r => r === u.repo).length ? BASE : null;
  }
  return units;
}

const unitLines = u =>
  u.requester === undefined
    ? u.lines
    : [
      ...u.lead,
      `  # >>> ${u.requester}`,
      ...u.lines,
      `  # <<< ${u.requester}`,
    ];

/** The text with `repos:` rebuilt from units, one blank line between two. */
function withRepos(text, units) {
  const { lines, eol } = splitLines(text);
  const region = reposRegion(lines);
  const body = units.flatMap((u, n) => [...(n ? [""] : []), ...unitLines(u)]);
  lines.splice(region.start, region.end - region.start, ...body);
  return joinLines(lines, eol);
}

function baseRepos(ctx) {
  const { lines } = splitLines(assetOf(ctx, BASE, HOOKS));
  return repoUnits(lines, reposRegion(lines), [])
    .filter(u => u.repo !== undefined)
    .map(u => u.repo);
}

function unitsOf(ctx, text) {
  const { lines } = splitLines(text);
  const region = reposRegion(lines);
  if (!region) {
    throw new ListError(`${HOOKS} has no repos: list`);
  }
  return repoUnits(lines, region, baseRepos(ctx));
}

/** A block's entries: [{repo, rev, hooks: [{id, lines}]}]. */
function parseEntries(lines) {
  const entries = [];
  let e = null;
  let h = null;
  for (const l of lines) {
    if (l.trim() === "") {
      continue;
    }
    let m;
    if ((m = /^\s*- repo:\s*(.*?)\s*$/.exec(l))) {
      e = { repo: scalarValue(m[1]), rev: null, hooks: [] };
      entries.push(e);
      h = null;
    }
    else if (!e) {
      throw new ListError(`a block in repos: opens with ${l.trim()}`);
    }
    else if (!h && (m = /^\s*rev:\s*(.*?)\s*$/.exec(l))) {
      e.rev = scalarValue(m[1]);
    }
    else if (!h && /^\s*hooks:\s*$/.test(l)) {
      continue;
    }
    else if ((m = /^\s*- id:\s*(.*?)\s*$/.exec(l))) {
      h = { id: scalarValue(m[1]), lines: [l] };
      e.hooks.push(h);
    }
    else if (h) {
      h.lines.push(l);
    }
    else {
      throw new ListError(`a block in repos: holds ${l.trim()}`);
    }
  }
  return entries;
}

const blockBody = entries =>
  entries.flatMap((e, n) => [
    ...(n ? [""] : []),
    `  - repo: ${yamlScalar(e.repo)}`,
    ...(e.rev ? [`    rev: ${yamlScalar(e.rev)}`] : []),
    "    hooks:",
    ...e.hooks.flatMap(h => h.lines),
  ]);

/** The lines of hook `id` in a unit, or null. */
function hookLines(unit, id) {
  if (unit.requester !== undefined) {
    for (const e of parseEntries(unit.lines)) {
      const h = e.hooks.find(x => x.id === id);
      if (h) {
        return h.lines;
      }
    }
    return null;
  }
  const at = unit.lines.findIndex(l =>
    /^\s*- id:/.test(l) && scalarValue(l.replace(/^\s*- id:/, "")) === id
  );
  if (at < 0) {
    return null;
  }
  let end = at + 1;
  while (
    end < unit.lines.length
    && (unit.lines[end].trim() === ""
      || indentOf(unit.lines[end]) > indentOf(unit.lines[at]))
  ) {
    end++;
  }
  while (end > at + 1 && unit.lines[end - 1].trim() === "") {
    end--;
  }
  return unit.lines.slice(at, end);
}

/** The units with hook `id` taken out of `unit`; a repo or block left with no hook goes too. */
function dropHook(units, unit, id) {
  if (unit.requester !== undefined) {
    const entries = parseEntries(unit.lines)
      .map(e => ({ ...e, hooks: e.hooks.filter(h => h.id !== id) }))
      .filter(e => e.hooks.length);
    return entries.length
      ? units.map(u => (u === unit ? { ...u, lines: blockBody(entries) } : u))
      : units.filter(u => u !== unit);
  }
  const hook = hookLines(unit, id);
  const at = unit.lines.indexOf(hook[0]);
  const lines = [...unit.lines];
  lines.splice(at, hook.length);
  if (lines[at]?.trim() === "" && (at === 0 || lines[at - 1].trim() === "")) {
    lines.splice(at, 1);
  }
  return lines.some(l => /^\s*- id:/.test(l))
    ? units.map(u => (u === unit ? { ...u, lines } : u))
    : units.filter(u => u !== unit);
}

/** A hook's lines, as add-hook writes them: references/pre-commit.md's key order. */
function renderHook(f) {
  const out = [`      - id: ${f.id}`];
  for (const key of GATE_KEYS) {
    const v = f[key];
    if (v === undefined || v === "") {
      continue;
    }
    const yaml = key.replace("-", "_");
    if (key === "types" || key === "args") {
      out.push(
        `        ${yaml}: [${
          v.split(",").map(x => JSON.stringify(x)).join(", ")
        }]`,
      );
    }
    else if (key === "pass-filenames" || key === "always-run") {
      out.push(`        ${yaml}: ${v}`);
    }
    else {
      out.push(`        ${yaml}: ${yamlScalar(v)}`);
    }
  }
  if (f.stage !== "pre-commit") {
    out.push(`        stages: [${f.stage}]`);
  }
  return out;
}

const GATE_KEYS = [
  "name",
  "description",
  "entry",
  "language",
  "files",
  "types",
  "args",
  "pass-filenames",
  "always-run",
];

/** The units with the hook written where `requester` writes — its block, or the person's own entries. */
function putHook(units, requester, f, hook) {
  if (requester) {
    const block = units.find(u => u.requester === requester);
    const entries = block ? parseEntries(block.lines) : [];
    let e = entries.find(x => x.repo === f.repo);
    if (!e) {
      e = { repo: f.repo, rev: null, hooks: [] };
      entries.push(e);
    }
    e.rev = f.rev || e.rev;
    const at = e.hooks.findIndex(h => h.id === f.id);
    e.hooks.splice(at < 0 ? e.hooks.length : at, at < 0 ? 0 : 1, hook);
    const next = { requester, owner: requester, lines: blockBody(entries) };
    if (block) {
      return units.map(u => (u === block ? { ...next, lead: block.lead } : u));
    }
    const slot = units.findLastIndex(u => u.requester !== undefined) + 1
      || units.length;
    return [
      ...units.slice(0, slot),
      { ...next, lead: [] },
      ...units.slice(slot),
    ];
  }
  const mine = units.find(u => u.owner === null && u.repo === f.repo);
  if (mine) {
    const old = hookLines(mine, f.id);
    const lines = [...mine.lines];
    if (old) {
      lines.splice(lines.indexOf(old[0]), old.length, ...hook.lines);
    }
    else {
      lines.push(...hook.lines);
    }
    return units.map(u => (u === mine ? { ...u, lines } : u));
  }
  const lines = blockBody([{
    repo: f.repo,
    rev: f.rev || null,
    hooks: [hook],
  }]);
  return [...units, { repo: f.repo, owner: null, lines }];
}

function addHook(ctx, { flags, for: requester }) {
  const text = need(ctx, HOOKS, BASE, requester);
  const f = { ...flags };
  if (POST_STAGES.includes(f.stage)) {
    f["always-run"] = "true";
  }
  const hook = { id: f.id, lines: renderHook(f) };
  let units;
  try {
    units = unitsOf(ctx, text);
  }
  catch (e) {
    if (!(e instanceof ListError || e instanceof BlockParseError)) {
      throw e;
    }
    return {
      ops: [],
      rows: [unreadable(ctx, HOOKS, e, "the skill's repos: layout")],
    };
  }
  const self = u =>
    requester
      ? u.requester === requester
      : u.owner === null && u.repo === f.repo;
  const holders = units.filter(u => hookLines(u, f.id));
  const mine = holders.find(self);
  const others = holders.filter(u => u !== mine);
  if (
    mine && others.length === 0 && sameContent(
      HOOKS,
      hookLines(mine, f.id).join("\n"),
      hook.lines.join("\n"),
    )
  ) {
    return { ops: [] };
  }
  const next = putHook(units, requester, f, hook);
  if (others.length === 0) {
    return {
      ops: [{
        op: "whole",
        path: HOOKS,
        content: withRepos(text, next),
        force: true,
      }],
    };
  }
  const over = others.reduce((us, u) => dropHook(us, u, f.id), next);
  return {
    ops: [],
    rows: [{
      kind: "conflict",
      path: HOOKS,
      hook: f.id,
      held: others.map(u => u.owner ?? "user"),
      reason:
        `hook id ${f.id} is already defined — never a second hook of one id`,
      answers: ["keep-existing", "overwrite"],
      effects: {
        "keep-existing": [],
        overwrite: [{
          op: "whole",
          path: HOOKS,
          content: withRepos(text, over),
          force: true,
        }],
      },
    }],
  };
}

/** The asset's repos: entries, then every block and person's entry `current` holds there. */
function carryRepos(ctx, text, current) {
  const base = unitsOf(ctx, text).filter(u => u.owner === BASE);
  const kept = unitsOf(ctx, current).filter(u => u.owner !== BASE);
  return withRepos(text, [...base, ...kept]);
}

// --- the migration ------------------------------------------------------------------------

/**
 * A hook config the retired gate pack shaped, read onto this layout: each
 * `pre-commit.d/<name>.yaml` marker pair a `<name>` block, the comment that
 * described the merge gone, and the single exclude regex's alternatives the
 * person's lines (the base's are the base block's). An unrecognised marker,
 * a non-verbose regex or a multi-group alternative cannot be read.
 */
function migrateHooks(text) {
  const { lines, eol } = splitLines(text);
  const out = [];
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    if (/^# Fragments from /.test(l)) {
      while (i + 1 < lines.length && /^#/.test(lines[i + 1])) {
        i++;
      }
      while (out.at(-1)?.trim() === "") {
        out.pop();
      }
      continue;
    }
    const frag =
      /^(\s*)# (>>>|<<<) pre-commit\.d\/([a-z0-9][a-z0-9-]*)\.yaml\s*$/
        .exec(l);
    if (frag) {
      out.push(`${frag[1]}# ${frag[2]} ${frag[3]}`);
      continue;
    }
    const m = MARKER.exec(l);
    if (
      /^\s*(#|\/\/)\s*(>>>|<<<)/.test(l)
      && (!m || !PATTERNS.requester.test(m[4]))
    ) {
      throw new ListError(`an unrecognised marker: ${l.trim()}`);
    }
    out.push(l);
  }
  const region = listRegion(out, EXCLUDE);
  if (!region && out.some(l => /^exclude:/.test(l))) {
    throw new ListError("the exclude is not a verbose (?x) block scalar");
  }
  const marked = region
    && parseBlocks(out).some(b =>
      b.requester === BASE && b.open >= region.start && b.close < region.end
    );
  if (region && !marked) {
    const alts = [];
    for (let i = region.start; i < region.end; i++) {
      const l = out[i];
      if (l.trim() === "" || /^\s*#/.test(l)) {
        continue;
      }
      const alt = l.trim().replace(/^\|/, "").replace(/\|$/, "");
      if (alt.replace(/^\(\^\|\/\)/, "").includes("|")) {
        throw new ListError(
          `the exclude holds a multi-group alternative: ${alt}`,
        );
      }
      alts.push(`${EXCLUDE.indent}${alt}`);
    }
    out.splice(region.start, region.end - region.start, ...alts);
  }
  return joinLines(out, eol);
}

function renderHooks(ctx, current) {
  const asset = assetOf(ctx, BASE, HOOKS);
  if (current === null) {
    return asset;
  }
  const migrated = migrateHooks(current);
  return carryRepos(ctx, carryList(asset, migrated, EXCLUDE, BASE), migrated);
}

// --- the commit convention -----------------------------------------------------------------

const TYPES = [
  "feat",
  "fix",
  "perf",
  "refactor",
  "revert",
  "test",
  "ops",
  "docs",
  "merge",
  "wip",
];

/** references/pre-commit.md's rename table. */
const RENAMES = {
  chore: "ops",
  build: "ops",
  ci: "ops",
  deps: "ops",
  config: "ops",
  release: "ops",
  style: "refactor",
  spec: "docs",
  blueprint: "docs",
  add: "feat",
};

const LINKS = ["commitUrl", "commitRangeUrl", "issueRegexPattern", "issueUrl"];
const LINK = new RegExp(`^(\\s*)#?\\s*(${LINKS.join("|")}):`);

/** The `commitScopes` position: its lines and its scopes, each with whether it is retired. */
function scopePosition(text) {
  const lines = splitLines(text).lines;
  const at = lines.findIndex(l => /^\s+commitScopes:/.test(l));
  if (at < 0) {
    throw new ListError(`${CONVENTION} has no commitScopes position`);
  }
  const [, pad, rest] = /^(\s+)commitScopes:\s*(.*?)\s*$/.exec(lines[at]);
  const items = [];
  let end = at + 1;
  if (rest.startsWith("[")) {
    for (const t of words(rest).filter(t => !"[],".includes(t))) {
      items.push({
        scope: t.startsWith("\u0000") ? t.slice(1) : t,
        retired: false,
      });
    }
  }
  else if (rest === "") {
    while (
      end < lines.length
      && lines[end].trim() !== ""
      && indentOf(lines[end]) > pad.length
    ) {
      const m = /^\s*- ("[^"]*"|'[^']*'|[^\s#]+)\s*(#\s*retired\b.*)?$/.exec(
        lines[end],
      );
      if (!m) {
        throw new ListError(`commitScopes holds ${lines[end].trim()}`);
      }
      items.push({ scope: scalarValue(m[1]), retired: Boolean(m[2]) });
      end++;
    }
  }
  else {
    throw new ListError(`commitScopes is ${rest}`);
  }
  return { at, end, pad, items };
}

/** The scopes after an argument: every listed scope kept, one the argument omits retired, a new one appended. */
function nextScopes(items, scopes) {
  if (scopes === undefined) {
    return items;
  }
  const out = items.map(i => ({
    scope: i.scope,
    retired: !scopes.includes(i.scope),
  }));
  for (const s of scopes) {
    if (!items.some(i => i.scope === s)) {
      out.push({ scope: s, retired: false });
    }
  }
  return out;
}

function withScopes(text, items) {
  const { lines, eol } = splitLines(text);
  const pos = scopePosition(text);
  const key = `${pos.pad}commitScopes:`;
  lines.splice(
    pos.at,
    pos.end - pos.at,
    ...(items.length
      ? [
        key,
        ...items.map(i =>
          `${pos.pad}  - ${i.scope}${i.retired ? " # retired" : ""}`
        ),
      ]
      : [`${key} []`]),
  );
  return joinLines(lines, eol);
}

/**
 * The changelog links from `origin` — scp, ssh and https alike, userinfo
 * stripped from the authority, a trailing `.git` dropped — for a github or
 * gitlab host or a subdomain of one; null for any other host or no remote.
 */
export function forgeLinks(ctx) {
  const res = ctx.exec("git", ["remote", "get-url", "origin"]);
  const url = res.status === 0 ? (res.stdout ?? "").trim() : "";
  let host;
  let path;
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(url)) {
    const rest = url.replace(/^[^:]+:\/\//, "");
    const authority = rest.split("/")[0];
    host = authority.replace(/^.*@/, "").replace(/:.*$/, "");
    path = rest.slice(authority.length + 1);
  }
  else {
    const m = /^(?:[^@/]+@)?([^:/]+):(.+)$/.exec(url);
    if (!m) {
      return null;
    }
    [, host, path] = m;
  }
  host = host.toLowerCase();
  path = path.replace(/\/+$/, "").replace(/\.git$/, "").replace(/^\/+/, "");
  if (!/^[^/\s]+(\/[^/\s]+)+$/.test(path)) {
    return null;
  }
  const base = `https://${host}/${path}`;
  const on = forge => host === forge || host.endsWith(`.${forge}`);
  if (on("github.com")) {
    return {
      commitUrl: `${base}/commit/%commit%`,
      commitRangeUrl: `${base}/compare/%from%...%to%?diff=split`,
      issueRegexPattern: "\"#[0-9]+\"",
      issueUrl: `${base}/issues/%issue%`,
    };
  }
  if (on("gitlab.com")) {
    return {
      commitUrl: `${base}/-/commit/%commit%`,
      commitRangeUrl: `${base}/-/compare/%from%...%to%`,
      issueRegexPattern: "\"#[0-9]+\"",
      issueUrl: `${base}/-/issues/%issue%`,
    };
  }
  return null;
}

/** The link lines as the file holds them, uncommented; null while they are commented. */
function linksIn(text) {
  const out = {};
  for (const l of splitLines(text).lines) {
    const m = new RegExp(`^\\s*(${LINKS.join("|")}):\\s*(.*)$`).exec(l);
    if (m) {
      out[m[1]] = m[2];
    }
  }
  return Object.keys(out).length === LINKS.length ? out : null;
}

function withLinks(text, links) {
  if (!links) {
    return text;
  }
  const { lines, eol } = splitLines(text);
  return joinLines(
    lines.map(l => {
      const m = LINK.exec(l);
      return m ? `${m[1]}${m[2]}: ${links[m[2]]}` : l;
    }),
    eol,
  );
}

/** The convention with its two marked positions and its repo's own types set aside — what the base is compared on. */
function skeleton(text) {
  const pos = scopePosition(text);
  return splitLines(text)
    .lines
    .filter((l, i) => i < pos.at || i >= pos.end)
    .filter(l => !LINK.test(l))
    .filter(l => {
      const m = /^\s+- ([A-Za-z][\w-]*)\b/.exec(l);
      return !m || TYPES.includes(m[1]);
    })
    .join("\n");
}

/** The types `convention.commitTypes` lists outside the ten. */
function ownTypes(text) {
  const lines = splitLines(text).lines;
  const at = lines.findIndex(l => /^\s+commitTypes:\s*$/.test(l));
  const out = [];
  for (let i = at + 1; at >= 0 && i < lines.length; i++) {
    const l = lines[i];
    if (l.trim() === "" || /^\s*#/.test(l)) {
      continue;
    }
    if (indentOf(l) <= indentOf(lines[at])) {
      break;
    }
    const m = /^\s*- ([A-Za-z][\w-]*)/.exec(l);
    if (m && !TYPES.includes(m[1])) {
      out.push(m[1]);
    }
  }
  return [...new Set(out)];
}

/** The text with `types` listed after the last of `convention.commitTypes`, where a rename row settles each. */
function withTypes(text, types) {
  const { lines, eol } = splitLines(text);
  const at = lines.findIndex(l => /^\s+commitTypes:\s*$/.test(l));
  let end = at + 1;
  while (
    end < lines.length
    && lines[end].trim() !== ""
    && indentOf(lines[end]) > indentOf(lines[at])
  ) {
    end++;
  }
  const pad = " ".repeat(indentOf(lines[at + 1] ?? lines[at]));
  lines.splice(end, 0, ...types.map(t => `${pad}- ${t}`));
  return joinLines(lines, eol);
}

/** One row per type outside the ten: renamed into one of them, the mapped one proposed first, or kept. */
function renameRows(text, supersedes) {
  return ownTypes(text).map(type => {
    const to = RENAMES[type] ?? null;
    const drop = [{
      op: "drop-lines",
      path: CONVENTION,
      match: `- ${type}`,
      supersedes: supersedes ?? undefined,
    }];
    return {
      kind: "rename",
      path: CONVENTION,
      type,
      proposed: to,
      reason: to
        ? `${type} is outside the ten commit types; the rename table maps it to ${to}`
        : `${type} is outside the ten commit types and the rename table names no destination — ask, never guess`,
      answers: [
        ...(to ? [`rename-${to}`] : []),
        ...TYPES.filter(t => t !== to).map(t => `rename-${t}`),
        "keep-existing",
      ],
      effects: {
        ...Object.fromEntries(TYPES.map(t => [`rename-${t}`, drop])),
        "keep-existing": [],
      },
    };
  });
}

function conventionOps(ctx, current, scopes, old, notes) {
  const asset = assetOf(ctx, BASE, CONVENTION);
  const links = forgeLinks(ctx);
  if (!links) {
    notes.push(
      `${CONVENTION}: origin is not a github or gitlab remote — the changelog links stay as they are`,
    );
  }
  if (current === null) {
    return {
      ops: [{
        op: "whole",
        path: CONVENTION,
        content: withLinks(
          withScopes(asset, nextScopes([], scopes ?? [])),
          links,
        ),
      }],
      rows: [],
    };
  }
  const have = scopePosition(current).items;
  const rows = renameRows(current, old);
  if (!old && sameContent(CONVENTION, skeleton(current), skeleton(asset))) {
    const next = withLinks(
      withScopes(current, nextScopes(have, scopes)),
      links,
    );
    return {
      ops: sameContent(CONVENTION, next, current)
        ? []
        : [{ op: "whole", path: CONVENTION, content: next, force: true }],
      rows,
    };
  }
  const rendered = withLinks(
    withScopes(withTypes(asset, ownTypes(current)), nextScopes(have, scopes)),
    links ?? linksIn(current),
  );
  return { ops: landOps(ctx, CONVENTION, current, rendered, old), rows };
}

/** `--scopes` as a list of slugs; undefined when it was not given. */
function scopesArg(ctx, value) {
  if (value === undefined) {
    return undefined;
  }
  const scopes = value === "" ? [] : value.split(",");
  for (const s of scopes) {
    if (!PATTERNS.slug.test(s)) {
      throw new ctx.RefusalError(
        `--scopes ${
          JSON.stringify(s)
        } is not a project id (lowercase letters, digits, -)`,
      );
    }
  }
  return scopes;
}

// --- all ----------------------------------------------------------------------------

function render(ctx, path, current) {
  if (path === HOOKS) {
    return renderHooks(ctx, current);
  }
  return carryList(assetOf(ctx, BASE, LINTER), current, IGNORES, BASE);
}

function all(ctx, keys) {
  const scopes = scopesArg(ctx, keys.scopes);
  const ops = [];
  const rows = [];
  const notes = [];
  let hooksRead = true;
  for (const path of [HOOKS, CONVENTION, LINTER]) {
    if (foreign(ctx, path, BASE)) {
      notes.push(`${path} is ${ctx.source(path)}'s — left alone`);
      continue;
    }
    const current = ctx.read(path);
    const old = oldPack(ctx, path, BASE);
    try {
      if (path === CONVENTION) {
        const res = conventionOps(ctx, current, scopes, old, notes);
        ops.push(...res.ops);
        rows.push(...res.rows);
        continue;
      }
      const rendered = render(ctx, path, current);
      ops.push(...landOps(ctx, path, current, rendered, old));
      if (old || (current !== null && ctx.record(path) === null)) {
        rows.push(...targetRows(path, rendered, old));
      }
    }
    catch (e) {
      if (!(e instanceof ListError || e instanceof BlockParseError)) {
        throw e;
      }
      hooksRead &&= path !== HOOKS;
      rows.push(unreadable(ctx, path, e, `the layout of the skill's ${path}`));
    }
  }
  if (hooksRead) {
    for (const path of ctx.list(FRAGMENTS)) {
      ops.push({
        op: "delete",
        path,
        supersedes: ctx.source(path) ?? undefined,
      });
    }
  }
  ops.push(...oldSkill(ctx, BASE, notes));
  return { ops, rows, notes };
}

// --- the other verbs -------------------------------------------------------------------

function addLinterIgnore(ctx, { flags, for: requester }) {
  const text = need(ctx, LINTER, BASE, requester);
  const names = flags.paths.split(",").map(p => p.replace(/\/$/, ""));
  const notes = [];
  const shares = recordMap(ctx, LINTER, "shares");
  const res = listAdd(text, IGNORES, {
    requester,
    entries: names.map(n => `- "**/${n}/"`),
    base: BASE,
    shares,
    notes,
    path: LINTER,
  });
  const ops = writeOps(
    ctx,
    LINTER,
    text,
    res.text,
    requester ? { shares } : {},
  );
  const rows = [];
  if (!requester) {
    const tracked = names.filter(n =>
      (ctx.exec("git", ["ls-files", "--", `:(glob)**/${n}/**`]).stdout ?? "")
        .trim()
    );
    if (tracked.length) {
      rows.push({
        kind: "warning",
        path: LINTER,
        paths: tracked,
        reason:
          "git tracks files under these — the linter's ignores are for generated trees only, and an ignored source tree goes unlinted",
        answers: ["ok"],
      });
    }
  }
  return { ops, rows, notes };
}

function setScopes(ctx, { flags }) {
  const text = need(ctx, CONVENTION, BASE);
  const next = withScopes(
    text,
    nextScopes(scopePosition(text).items, scopesArg(ctx, flags.scopes)),
  );
  return {
    ops: next === text
      ? []
      : [{ op: "whole", path: CONVENTION, content: next, force: true }],
  };
}

/** Every pre-commit file without `requester`'s blocks. */
export function removeOps(ctx, requester) {
  const ops = [];
  const hooks = ctx.read(HOOKS);
  if (hooks !== null) {
    const shares = recordMap(ctx, HOOKS, "shares");
    let next = listRemove(hooks, EXCLUDE, { requester, shares });
    const units = unitsOf(ctx, next);
    if (units.some(u => u.requester === requester)) {
      next = withRepos(next, units.filter(u => u.requester !== requester));
    }
    ops.push(...writeOps(ctx, HOOKS, hooks, next, { shares }));
  }
  const linter = ctx.read(LINTER);
  if (linter !== null) {
    const shares = recordMap(ctx, LINTER, "shares");
    const next = listRemove(linter, IGNORES, { requester, shares });
    ops.push(...writeOps(ctx, LINTER, linter, next, { shares }));
  }
  return ops;
}

const VERBS = {
  "add-hook": addHook,
  "add-linter-ignore": addLinterIgnore,
  "set-scopes": setScopes,
  "add-exclude": ctx => {
    throw new ctx.RefusalError(
      "an exclude is added only through all add-exclude — every gate's list at once",
    );
  },
  remove: (ctx, call) => ({ ops: removeOps(ctx, call.for) }),
};

function plan(ctx, call) {
  try {
    return VERBS[call.verb](ctx, call);
  }
  catch (e) {
    if (!(e instanceof ListError || e instanceof BlockParseError)) {
      throw e;
    }
    return {
      ops: [],
      rows: [unreadable(ctx, HOOKS, e, "the layout pre-commit.md names")],
    };
  }
}

function expected(ctx, { path, text }) {
  if (path === CONVENTION) {
    const asset = assetOf(ctx, BASE, CONVENTION);
    if (sameContent(CONVENTION, skeleton(text), skeleton(asset))) {
      return { whole: text };
    }
    return {
      whole: withLinks(
        withScopes(
          withTypes(asset, ownTypes(text)),
          scopePosition(text).items,
        ),
        linksIn(text),
      ),
    };
  }
  if (path !== HOOKS && path !== LINTER) {
    return null;
  }
  return expectedWhole(path, text, render(ctx, path, text));
}

export default {
  verbs: {
    ...GATE_VERBS["pre-commit"],
    "add-exclude": {
      flags: { paths: { type: "pathList" }, generated: { type: "bool" } },
      requester: "optional",
    },
    remove: { flags: {}, requester: "required" },
  },
  plan,
  all,
  allNeedsMise: false,
  expected,
};
