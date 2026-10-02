#!/usr/bin/env node
// stackgen:tool-config's script: lands and edits a repo's tool configs from
// one call, showing every change as a numbered row before it writes. The
// grammar is lib/cli.mjs's; the output is JSON on stdout, always — exit 0 on
// success, 2 on a refused call ({error, rows?}), 1 on an internal fault.
//
// The engine here knows no tool. A tool module (lib/tools/<tool>.mjs, listed
// by lib/tools/index.mjs as `export const tools = {<name>: () => import(…)}`)
// default-exports:
//
//   verbs:   {<verb>: {flags: {<name>: {type, required, values, default, template}},
//                      requester: "required" | "forbidden" | "optional",
//                      needsMise: boolean}}
//   plan(ctx, call)         → {ops, rows?, notes?}   call = {verb, flags, for}
//   all(ctx, keys)          → {ops, rows?, notes?}   keys = the all flags given
//   allNeedsMise:           boolean
//   expected(ctx, {path, record, text})
//                           → {whole} | {blocks: {<req>: lines | lines[]}, normalize?(req, line)}
//
// `remove` is the engine's unless the module defines it. The cross-tool verbs
// (`all add-exclude`) are the module registered as `all`, which lands no base.
// An op is one of:
//
//   {op: "block", path, requester, body, region?, comment?, sort?, list?, frame?, drift?}
//   {op: "entry", path, requester, line, key?, region?, comment?, sort?, list?, frame?}
//   {op: "whole", path, content, mode?, drift?, force?, ifUnchanged?}
//
// `ifUnchanged` guards a whole write a row replays later: the sha256 of the
// file as the module read it (ctx.read; null for an absent file). When the
// file reads otherwise by the time the op applies — another op in the same
// call wrote it — the call is refused, never clobbered.
//   {op: "user-line", path, line, match, region?, frame?}
//   {op: "drop-lines", path, match, requester?}
//   {op: "delete", path}
//   {op: "remove", requester, tools?}   tools: the files of these tools, not the caller's
//   {op: "record", path, fields: {keys?, shares?, templates?}}
//
// `record` sets those lock-record maps for a path the call leaves in place —
// each given map replaces the field whole, an empty one drops it — and a
// change shows as a row like any write (kind `record`, or `share` when only
// `shares` moved). A module never mutates ctx.record() itself.
//
// A path another source's lock entry names is left alone, unless the op
// carries `supersedes: <that exact source>` (ctx.source(path)); a path the
// call deletes or takes over loses that entry.
//
// A row a module raises carries `effects: {<answer>: ops | "needs-edit"}`.
//
// A call that writes then runs, in order: on `all`, `MISE_ENV=dev mise run
// setup:all`; the formatter over every file it wrote, when the repo has
// `.config/dprint.json`; `pre-commit validate-config` when it wrote the hook
// config; and only then records the hashes. Every tool runs as `mise x --
// <tool>` (lib/run.mjs); a module reaches it as `ctx.runTool(tool, args)`.

import { spawnSync } from "node:child_process";
import {
  chmodSync,
  existsSync,
  lstatSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  realpathSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import {
  dirname,
  join,
  relative,
  resolve,
  sep,
} from "node:path";
import {
  fileURLToPath,
  pathToFileURL,
} from "node:url";
import * as blocks from "./lib/blocks.mjs";
import {
  parseArgs,
  tomlString,
  validateCall,
} from "./lib/cli.mjs";
import {
  check,
  driftRow,
} from "./lib/drift.mjs";
import {
  checkRelPath,
  isToolConfig,
  LOCK_PATH,
  readLock,
  sha256,
  sourceTool,
  UnsafePathError,
} from "./lib/record.mjs";
import {
  ANSWERS,
  checkAnswers,
  needsEdit,
  numberRows,
  previewStore,
  publicRow,
  RefusalError,
} from "./lib/rows.mjs";
import {
  MISSING_MISE,
  onPath,
  Runner,
} from "./lib/run.mjs";
import {
  entryFlag,
  parseMachineEnv,
  parseToolConfigList,
  readPack,
  validateEntry,
} from "./lib/schema.mjs";

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));

/** The lock-record maps a `record` op sets and fileRows diffs. */
const RECORD_FIELDS = ["keys", "shares", "templates"];

const DPRINT_CONFIG = ".config/dprint.json";
const HOOK_CONFIG = ".config/pre-commit-config.yaml";

/** SKILL.md's table order — `all` lands the tools in it. */
const TOOL_ORDER = [
  "mise",
  "dprint",
  "pre-commit",
  "gitleaks",
  "grype",
  "git",
  "graphify",
  "renovate",
];

// --- the workspace: the repo as the call would leave it --------------------------

class Workspace {
  constructor(root) {
    this.root = root;
    this.files = new Map(); // path → text | null (deleted)
    this.modes = new Map();
    this.owner = new Map(); // path → the tool whose call first wrote it
    this.order = []; // touched paths, first touch first
    this.unhashed = new Set(); // paths an op marked unhashed: recorded with hash none
    const text = this.disk(LOCK_PATH);
    this.lockText = text;
    this.lock = readLock(text);
    this.base = new Map(
      [...this.lock.entries].map(([p, e]) => [p, structuredClone(e)]),
    );
  }

  /**
   * The absolute path of a repo-relative one, for any read, write, delete or
   * list: refused when it is absolute or climbs with `..`, when it or any
   * parent inside the repo is a symlink, or when it resolves outside the root.
   */
  safe(path) {
    checkRelPath(path);
    this.realRoot ??= realpathSync(this.root);
    const parts = path.split("/").filter(p => p !== "" && p !== ".");
    let at = this.realRoot;
    for (const part of parts) {
      at = join(at, part);
      let st;
      try {
        st = lstatSync(at);
      }
      catch (e) {
        if (e.code === "ENOENT" || e.code === "ENOTDIR") {
          break;
        }
        throw e;
      }
      if (st.isSymbolicLink()) {
        throw new UnsafePathError(
          `${path}: ${relative(this.realRoot, at)} is a symlink — refused`,
        );
      }
    }
    const abs = join(this.realRoot, ...parts);
    if (abs !== this.realRoot && !abs.startsWith(this.realRoot + sep)) {
      throw new UnsafePathError(`${path} resolves outside the repo — refused`);
    }
    return abs;
  }

  disk(path) {
    const abs = this.safe(path);
    return existsSync(abs) && statSync(abs).isFile()
      ? readFileSync(abs, "utf8")
      : null;
  }

  read(path) {
    return this.files.has(path) ? this.files.get(path) : this.disk(path);
  }

  touch(path, tool) {
    if (!this.order.includes(path)) {
      this.order.push(path);
    }
    if (tool && !this.owner.has(path)) {
      this.owner.set(path, tool);
    }
  }

  write(path, text, tool, mode) {
    this.touch(path, tool);
    this.files.set(path, text);
    if (mode) {
      this.modes.set(path, mode);
    }
  }

  remove(path, tool) {
    this.touch(path, tool);
    this.files.set(path, null);
  }

  record(path) {
    return this.lock.entries.get(path) ?? null;
  }

  /** The source any lock entry names for a path — tool-config's or another's — or null. */
  sourceOf(path) {
    return this.record(path)?.source ?? this.lock.foreign.get(path) ?? null;
  }

  /** Repo-relative files under `dir`, as the call would leave them. */
  list(dir) {
    const out = new Set();
    // the directory and its parents are held to safe(); a symlink inside it is never followed or listed
    const walk = rel => {
      const abs = rel ? this.safe(rel) : realpathSync(this.root);
      if (!existsSync(abs)) {
        return;
      }
      for (const d of readdirSync(abs, { withFileTypes: true })) {
        if (d.name === ".git" || d.isSymbolicLink()) {
          continue;
        }
        const p = rel ? `${rel}/${d.name}` : d.name;
        if (d.isDirectory()) {
          walk(p);
        }
        else {
          out.add(p);
        }
      }
    };
    walk(dir.replace(/\/$/, ""));
    for (const [p, text] of this.files) {
      if (!p.startsWith(dir.replace(/\/$/, "") + "/")) {
        continue;
      }
      if (text === null) {
        out.delete(p);
      }
      else {
        out.add(p);
      }
    }
    return [...out].sort();
  }

  /** Bring each touched path's record in line with its text. */
  settleRecords(version) {
    for (const path of this.order) {
      const text = this.read(path);
      const entries = this.lock.entries;
      if (text === null) {
        entries.delete(path);
        this.lock.drop(path);
        continue;
      }
      this.lock.drop(path);
      const prev = entries.get(path);
      const tool = (prev && sourceTool(prev)) ?? this.owner.get(path);
      const rec = prev ?? { path };
      rec.source = `tool-config/${tool}@${version}`;
      rec.hash = this.unhashed.has(path) ? "none" : sha256(text);
      if (this.modes.has(path)) {
        rec.mode = this.modes.get(path);
      }
      let found;
      try {
        found = blocks.blockRequesters(text);
      }
      catch {
        // a file the parser cannot read keeps the requesters it had
        found = rec.blocks ?? [];
      }
      if (found.length) {
        rec.blocks = found;
      }
      else {
        delete rec.blocks;
      }
      if (rec.shares && Object.keys(rec.shares).length === 0) {
        delete rec.shares;
      }
      entries.set(path, rec);
    }
  }

  /** The paths this call will write (not delete), before any is written. */
  pending() {
    return this.order.filter(p => {
      const text = this.files.get(p);
      return typeof text === "string"
        && (this.disk(p) !== text || this.modes.has(p));
    });
  }

  /**
   * Write every touched file — no record yet. Returns what it wrote and
   * deleted, and `restore()`, which puts each touched path back byte for byte.
   */
  writeFiles() {
    const written = [];
    const deleted = [];
    // every path is held to safe() before the first byte is written
    const targets = new Map(
      [...this.order, LOCK_PATH].map(p => [p, this.safe(p)]),
    );
    this.targets = targets;
    const before = new Map();
    for (const path of this.order) {
      const abs = targets.get(path);
      before.set(
        path,
        existsSync(abs) && statSync(abs).isFile()
          ? { bytes: readFileSync(abs), mode: statSync(abs).mode & 0o777 }
          : null,
      );
    }
    for (const path of this.order) {
      const text = this.files.get(path);
      const abs = targets.get(path);
      if (text === undefined) {
        continue;
      }
      if (text === null) {
        if (existsSync(abs)) {
          rmSync(abs);
          deleted.push(path);
        }
        continue;
      }
      if (this.disk(path) !== text || this.modes.has(path)) {
        mkdirSync(dirname(abs), { recursive: true });
        writeFileSync(abs, text);
        if (this.modes.has(path)) {
          chmodSync(abs, parseInt(this.modes.get(path), 8));
        }
        written.push(path);
      }
    }
    const restore = () => {
      for (const [path, was] of before) {
        const abs = targets.get(path);
        if (was === null) {
          rmSync(abs, { force: true });
          continue;
        }
        mkdirSync(dirname(abs), { recursive: true });
        writeFileSync(abs, was.bytes);
        chmodSync(abs, was.mode);
      }
    };
    return { written, deleted, restore };
  }

  /** Take a written file's text back from the disk — the formatter's output, which the hash records. */
  adopt(path) {
    this.files.set(path, this.disk(path));
  }

  /** Record every touched path's hash and requesters, and write the lock. */
  writeLock(version) {
    this.settleRecords(version);
    const lock = this.lock.write();
    if (
      lock !== this.lockText
      && (this.lockText !== null || this.lock.entries.size)
    ) {
      const abs = this.targets?.get(LOCK_PATH) ?? this.safe(LOCK_PATH);
      mkdirSync(dirname(abs), { recursive: true });
      writeFileSync(abs, lock);
    }
  }
}

// --- ops ---------------------------------------------------------------------------

const frameText = frame => (frame?.length ? blocks.joinLines(frame) : "");

/**
 * Apply one op to the workspace. In "plan" mode an op that would overwrite a
 * drifted block, or an unrecorded file, raises a row instead (pushed to
 * `rows`); in "effect" mode — an answered row's — it is applied as given.
 */
function applyOp(ws, op, tool, mode, rows, notes) {
  if (op.path) {
    // Another source's path is never written — unless the op names exactly
    // that source in `supersedes`, taking the path over (a fold's delete).
    const source = ws.sourceOf(op.path);
    if (
      source !== null && !isToolConfig({ source }) && op.supersedes !== source
    ) {
      notes.push(`${op.path} is ${source}'s — left alone`);
      return;
    }
  }
  if (op.unhashed) {
    ws.unhashed.add(op.path);
  }
  const current = op.path ? ws.read(op.path) : null;
  switch (op.op) {
    case "block": {
      if (mode === "plan" && op.drift && current !== null) {
        const mine = blocks.regionBody(current, op.requester, op.region);
        const theirs = op.body;
        if (mine && JSON.stringify(mine) !== JSON.stringify(theirs)) {
          rows.push({
            ...driftRow({
              path: op.path,
              requester: op.requester,
              theirs,
              mine,
            }),
            effects: {
              "take-theirs": [{ ...op, drift: false }],
              "keep-mine": [],
              merge: "needs-edit",
            },
            _tool: tool,
          });
          return;
        }
      }
      const next = blocks.setBlock(current ?? frameText(op.frame), op);
      if (current === null && !blocks.hasContent(next)) {
        return;
      }
      if (next !== current) {
        if (current !== null && !blocks.hasContent(next)) {
          ws.remove(op.path, tool);
        }
        else {
          ws.write(op.path, next, tool);
        }
      }
      else {
        claim(ws, op.path, tool);
      }
      return;
    }
    case "entry": {
      const res = blocks.addEntry(current ?? frameText(op.frame), {
        ...op,
        base: tool,
      });
      if (res.outcome === "added") {
        ws.write(op.path, res.text, tool);
      }
      else if (res.outcome === "shared") {
        let rec = ws.record(op.path);
        if (!rec) {
          rec = { path: op.path, source: `tool-config/${tool}@pending` };
          ws.lock.entries.set(op.path, rec);
        }
        const key = op.key ?? blocks.entryKey(op.line);
        const shares = (rec.shares ??= {});
        const holders = (shares[key] ??= [res.holder]);
        if (!holders.includes(op.requester)) {
          holders.push(op.requester);
          ws.touch(op.path, tool);
        }
      }
      else if (res.outcome === "satisfied") {
        notes.push(
          `${op.path}: ${op.line.trim()} is already held by ${
            res.holder ?? "a user line"
          } — satisfied`,
        );
      }
      return;
    }
    case "whole": {
      if (
        op.ifUnchanged !== undefined
        && (current === null ? null : sha256(current)) !== op.ifUnchanged
      ) {
        throw new RefusalError(
          `${op.path} changed since ${tool} read it, earlier in this call — its whole-file write would discard that change; run the call that conflicts on its own`,
        );
      }
      if (current === op.content) {
        if (op.mode && ws.record(op.path)?.mode !== op.mode) {
          ws.write(op.path, op.content, tool, op.mode);
        }
        claim(ws, op.path, tool);
        return;
      }
      if (mode === "plan" && current !== null && !op.force) {
        const recorded = ws.record(op.path) !== null;
        if (!recorded) {
          rows.push({
            kind: "conflict",
            path: op.path,
            reason: "a file stackgen never recorded is already here",
            answers: ANSWERS.conflict,
            effects: {
              "keep-existing": [],
              overwrite: [{ ...op, force: true }],
            },
            _tool: tool,
          });
          return;
        }
        if (op.drift) {
          rows.push({
            ...driftRow({
              path: op.path,
              requester: tool,
              theirs: blocks.splitLines(op.content).lines,
              mine: blocks.splitLines(current).lines,
            }),
            effects: {
              "take-theirs": [{ ...op, drift: false, force: true }],
              "keep-mine": [],
              merge: "needs-edit",
            },
            _tool: tool,
          });
          return;
        }
      }
      ws.write(op.path, op.content, tool, op.mode);
      return;
    }
    case "user-line": {
      ws.write(
        op.path,
        blocks.setUserLine(current ?? frameText(op.frame), op),
        tool,
      );
      return;
    }
    case "drop-lines": {
      if (current === null) {
        return;
      }
      const next = blocks.dropLines(current, op);
      if (next === current) {
        return;
      }
      if (blocks.hasContent(next)) {
        ws.write(op.path, next, tool);
      }
      else {
        ws.remove(op.path, tool);
      }
      return;
    }
    case "delete": {
      if (current !== null) {
        ws.remove(op.path, tool);
      }
      return;
    }
    case "record": {
      let rec = ws.record(op.path);
      if (!rec) {
        rec = { path: op.path, source: `tool-config/${tool}@pending` };
        ws.lock.entries.set(op.path, rec);
      }
      for (const field of RECORD_FIELDS) {
        const map = op.fields?.[field];
        if (map === undefined) {
          continue;
        }
        if (map && Object.keys(map).length) {
          rec[field] = structuredClone(map);
        }
        else {
          delete rec[field];
        }
      }
      ws.touch(op.path, tool);
      return;
    }
    case "remove": {
      const owners = op.tools ?? [tool];
      for (const rec of [...ws.lock.entries.values()]) {
        if (!owners.includes(sourceTool(rec))) {
          continue;
        }
        const sharer = Object.values(rec.shares ?? {}).some(h =>
          h.includes(op.requester)
        );
        if (!rec.blocks?.includes(op.requester) && !sharer) {
          continue;
        }
        const text = ws.read(rec.path);
        if (text === null) {
          continue;
        }
        const res = blocks.removeRequester(
          text,
          op.requester,
          rec.shares ?? {},
        );
        rec.shares = res.shares;
        ws.touch(rec.path, tool);
        if (!blocks.hasContent(res.text)) {
          ws.remove(rec.path, tool);
        }
        else if (res.text !== text) {
          ws.write(rec.path, res.text, tool);
        }
      }
      return;
    }
    default:
      throw new Error(`unknown op ${op.op}`);
  }
}

/**
 * A file already exactly as the op would write it, yet carrying no record —
 * left by a call that wrote and then stopped (a failed setup:all) — is
 * recorded by this call, so a later requester call finds its record.
 */
function claim(ws, path, tool) {
  if (ws.read(path) !== null && ws.sourceOf(path) === null) {
    ws.touch(path, tool);
  }
}

/** One count-aware line difference: what `after` adds and drops against `before`. */
function lineDiff(before, after) {
  const count = new Map();
  for (const l of before) {
    count.set(l, (count.get(l) ?? 0) + 1);
  }
  const added = [];
  for (const l of after) {
    if (count.get(l)) {
      count.set(l, count.get(l) - 1);
    }
    else {
      added.push(l);
    }
  }
  const removed = [...count].flatMap(([l, n]) => Array(n).fill(l));
  return { added, removed };
}

/** The create, write, delete and share rows: each touched path against the disk. */
function fileRows(ws) {
  const rows = [];
  for (const path of ws.order) {
    const before = ws.disk(path);
    const after = ws.read(path);
    const field = (r, f) => JSON.stringify(r?.[f] ?? {});
    const moved = RECORD_FIELDS.filter(f =>
      field(ws.base.get(path), f) !== field(ws.record(path), f)
    );
    const sharesChanged = moved.includes("shares");
    const modeChanged = ws.modes.has(path)
      && ws.base.get(path)?.mode !== ws.modes.get(path);
    if (before === after && !moved.length && !modeChanged) {
      continue;
    }
    const short = t => (t === null ? null : sha256(t).slice(0, 12));
    const row = { path, before: short(before), after: short(after) };
    if (before === null && after !== null) {
      row.kind = "create";
    }
    else if (after === null) {
      row.kind = "delete";
    }
    else {
      row.kind = before !== after || modeChanged
        ? "write"
        : moved.length === 1 && sharesChanged
        ? "share"
        : "record";
    }
    if (before !== null && after !== null && before !== after) {
      Object.assign(
        row,
        lineDiff(
          blocks.splitLines(before).lines,
          blocks.splitLines(after).lines,
        ),
      );
    }
    if (after !== null) {
      try {
        const was = before === null ? {} : blocks.blockBodies(before);
        const now = blocks.blockBodies(after);
        const changed = [...new Set([...Object.keys(was), ...Object.keys(now)])]
          .filter(
            r => JSON.stringify(was[r]) !== JSON.stringify(now[r]),
          );
        if (changed.length) {
          row.blocks = changed;
        }
      }
      catch {
        // an unreadable file shows its lines only
      }
    }
    for (const f of moved) {
      row[f] = ws.record(path)?.[f] ?? {};
    }
    rows.push(row);
  }
  return rows;
}

// --- tools ---------------------------------------------------------------------------

async function loadTools() {
  const override = process.env.TOOL_CONFIG_TOOLS_MODULE;
  let registry = {};
  try {
    const url = override
      ? pathToFileURL(resolve(override)).href
      : new URL("./lib/tools/index.mjs", import.meta.url).href;
    registry = (await import(url)).tools ?? {};
  }
  catch (e) {
    if (e.code !== "ERR_MODULE_NOT_FOUND" || override) {
      throw e;
    }
  }
  const tools = {};
  for (const [name, entry] of Object.entries(registry)) {
    const mod = typeof entry === "function" ? await entry() : entry;
    tools[name] = mod.default ?? mod;
  }
  return tools;
}

function walkFiles(dir) {
  if (!existsSync(dir)) {
    return [];
  }
  const out = [];
  const walk = abs => {
    for (const d of readdirSync(abs, { withFileTypes: true })) {
      const p = join(abs, d.name);
      if (d.isDirectory()) {
        walk(p);
      }
      else {
        out.push(relative(dir, p));
      }
    }
  };
  walk(dir);
  return out.sort();
}

function contextFor(tool, ws, env) {
  const assetsDir = join(
    env.pluginRoot,
    "skills",
    "tool-config",
    "assets",
    tool,
  );
  return {
    tool,
    repoRoot: env.repoRoot,
    pluginRoot: env.pluginRoot,
    version: env.version,
    read: p => ws.read(p),
    exists: p => ws.read(p) !== null,
    list: dir => ws.list(dir),
    record: p => ws.record(p),
    source: p => ws.sourceOf(p),
    records: () => [...ws.lock.entries.values()],
    assetsDir,
    asset: rel => readFileSync(join(assetsDir, rel), "utf8"),
    listAssets: () => walkFiles(assetsDir),
    exec: (cmd, args, opts = {}) =>
      spawnSync(cmd, args, { cwd: env.repoRoot, encoding: "utf8", ...opts }),
    runTool: (name, args) => env.runner.tool(name, args),
    pack: slug => readPack(env.pluginRoot, slug),
    machineEnv: slug => parseMachineEnv(readPack(env.pluginRoot, slug) ?? ""),
    env: process.env,
    blocks,
    tomlString,
    needsEdit,
    ANSWERS,
    RefusalError,
  };
}

/** The calls a command stands for, each held to its tool's verbs; plus the tools left to prose. */
function resolveCalls(call, tools) {
  const prose = [];
  const calls = [];
  if (call.command === "all") {
    const names = [
      ...TOOL_ORDER,
      ...Object.keys(tools).filter(t => !TOOL_ORDER.includes(t) && t !== "all"),
    ];
    for (const tool of names) {
      if (tools[tool]?.all) {
        calls.push({ tool, verb: "all", keys: call.flags });
      }
      else {
        prose.push({ tool, handled: "prose" });
      }
    }
  }
  else if (call.command === "apply-entries") {
    const text = readFileSync(resolve(call.flags.file), "utf8");
    const faults = [];
    for (const entry of parseToolConfigList(text)) {
      if (typeof entry === "string") {
        prose.push({ entry, handled: "prose" });
        continue;
      }
      const f = validateEntry(entry);
      if (f.length) {
        faults.push(`${JSON.stringify(entry)}: ${f.join("; ")}`);
        continue;
      }
      const { tool, verb, ...flags } = entry;
      if (!tools[tool]) {
        prose.push({ entry, handled: "prose" });
      }
      else {
        calls.push({
          tool,
          verb,
          flags: Object.fromEntries(
            Object.entries(flags).map(([k, v]) => [k, entryFlag(v)]),
          ),
          for: call.flags.pack,
        });
      }
    }
    if (faults.length) {
      throw new RefusalError(`${call.flags.file}: ${faults.join(" | ")}`);
    }
  }
  else {
    const mod = tools[call.tool];
    if (!mod) {
      const known = Object.keys(tools).join(", ") || "none";
      const prosy = TOOL_ORDER.includes(call.tool)
        ? ` — follow references/${call.tool}.md`
        : "";
      throw new RefusalError(
        `${call.tool} is not a scripted tool (scripted: ${known})${prosy}`,
      );
    }
    if (call.verb === "all") {
      calls.push({ tool: call.tool, verb: "all", keys: call.flags });
    }
    else {
      calls.push({
        tool: call.tool,
        verb: call.verb,
        flags: call.flags,
        for: call.for,
      });
    }
  }
  for (const c of calls) {
    const mod = tools[c.tool];
    if (c.verb === "all") {
      if (!mod.all) {
        throw new RefusalError(`${c.tool} lands no base`);
      }
      continue;
    }
    if (c.for && (TOOL_ORDER.includes(c.for) || c.for in tools)) {
      throw new RefusalError(
        `--for ${c.for} is reserved for the base the skill lands itself`,
      );
    }
    const verbs = { ...mod.verbs };
    if (!verbs.remove) {
      verbs.remove = { flags: {}, requester: "required" };
    }
    const spec = verbs[c.verb];
    if (!spec) {
      throw new RefusalError(
        `${c.tool} has no verb ${c.verb} — valid: ${
          Object
            .keys(verbs)
            .join(", ")
        }, all`,
      );
    }
    validateCall(c, spec, c.tool);
  }
  return { calls, prose };
}

function needsMise(calls, tools) {
  return calls.some(
    c => (c.verb === "all"
      ? tools[c.tool].allNeedsMise
      : tools[c.tool].verbs?.[c.verb]?.needsMise),
  );
}

function signatureOf(call, env) {
  const file = call.command === "apply-entries"
    ? sha256(readFileSync(resolve(call.flags.file), "utf8"))
    : null;
  const { command, tool, verb, flags } = call;
  return sha256(
    JSON.stringify({
      root: env.repoRoot,
      command,
      tool,
      verb,
      flags,
      for: call.for,
      file,
    }),
  );
}

// --- landing -----------------------------------------------------------------------------

/**
 * Write the call's files, then — on `all` — `MISE_ENV=dev mise run setup:all`,
 * then the formatter over every file written, then `pre-commit
 * validate-config` when the hook config was written, and only then the
 * hashes. A tool a step needs and the repo has not installed refuses before
 * the first byte (on `all`, after setup:all has had its chance). A setup:all
 * failure leaves the files written and records nothing; a formatter or
 * validate failure puts every file back byte for byte.
 */
function land(ws, env, all) {
  const runner = env.runner;
  const pending = ws.pending();
  const formats = pending.length > 0 && ws.read(DPRINT_CONFIG) !== null;
  const validates = pending.includes(HOOK_CONFIG);
  if (!all) {
    if (formats) {
      runner.ensure("dprint");
    }
    if (validates) {
      runner.ensure("pre-commit");
    }
  }
  const { written, deleted, restore } = ws.writeFiles();
  if (all) {
    const kept = (why, output) =>
      new RefusalError(
        `${why} — the files this call wrote stay, and nothing is recorded; re-run all once it passes${
          output ? `:\n${output}` : ""
        }`,
        undefined,
        { written, deleted },
      );
    try {
      runner.trust();
    }
    catch (e) {
      throw e instanceof RefusalError ? kept(e.message) : e;
    }
    const setup = runner.setupAll();
    if (!setup.ok) {
      throw kept("MISE_ENV=dev mise run setup:all failed", setup.output);
    }
  }
  try {
    const files = written.filter(p => ws.read(p) !== null);
    if (formats && files.length) {
      runner.tool("dprint", [
        "fmt",
        "--config",
        DPRINT_CONFIG,
        "--allow-no-files",
        ...files,
      ]);
      for (const p of files) {
        ws.adopt(p);
      }
    }
    if (validates) {
      runner.tool("pre-commit", ["validate-config", HOOK_CONFIG]);
    }
  }
  catch (e) {
    restore();
    if (e instanceof RefusalError) {
      throw new RefusalError(
        `${e.message}\nevery file this call wrote is back as it was; nothing is recorded`,
      );
    }
    throw e;
  }
  ws.writeLock(env.version);
  return { written, deleted };
}

// --- main ------------------------------------------------------------------------------

function repoRootOf(given) {
  if (given) {
    return resolve(given);
  }
  const git = spawnSync("git", ["rev-parse", "--show-toplevel"], {
    encoding: "utf8",
  });
  return git.status === 0 ? git.stdout.trim() : process.cwd();
}

async function run(argv) {
  const call = parseArgs(argv);
  const pluginRoot = resolve(
    call.globals["plugin-root"] || join(SCRIPT_DIR, "..", "..", ".."),
  );
  const env = {
    repoRoot: repoRootOf(call.globals["repo-root"]),
    pluginRoot,
    version: JSON
      .parse(
        readFileSync(
          join(pluginRoot, ".claude-plugin", "plugin.json"),
          "utf8",
        ),
      )
      .version,
  };
  env.runner = new Runner(env.repoRoot);
  const tools = await loadTools();
  const ws = new Workspace(env.repoRoot);
  // one context per tool per call, so a module's per-context memo holds
  const contexts = new Map();
  const ctxOf = tool => {
    if (!contexts.has(tool)) {
      contexts.set(tool, contextFor(tool, ws, env));
    }
    return contexts.get(tool);
  };

  if (call.command === "check") {
    if (call.tool && !tools[call.tool] && !TOOL_ORDER.includes(call.tool)) {
      throw new RefusalError(
        `unknown tool ${call.tool} — valid: ${TOOL_ORDER.join(", ")}`,
      );
    }
    const res = await check({
      records: [...ws.lock.entries.values()],
      read: p => ws.read(p),
      tools,
      contextFor: ctxOf,
      toolFilter: call.tool,
    });
    return {
      rows: numberRows(res.rows).map(publicRow),
      prose: res.prose.map(tool => ({ tool, handled: "prose" })),
    };
  }

  const { calls, prose } = resolveCalls(call, tools);
  if (needsMise(calls, tools) && !onPath("mise")) {
    throw new RefusalError(MISSING_MISE);
  }
  // trust is the person's to grant beforehand; an untrusted config stops here
  env.runner.trust();

  const raised = [];
  const notes = [];
  for (const c of calls) {
    const mod = tools[c.tool];
    const ctx = ctxOf(c.tool);
    let result;
    if (c.verb === "all") {
      result = await mod.all(ctx, c.keys);
    }
    else if (c.verb === "remove" && !mod.verbs?.remove) {
      result = { ops: [{ op: "remove", requester: c.for }] };
    }
    else {
      result = await mod.plan(ctx, {
        verb: c.verb,
        flags: c.flags,
        for: c.for,
      });
    }
    for (const op of result.ops ?? []) {
      applyOp(ws, op, c.tool, "plan", raised, notes);
    }
    for (const row of result.rows ?? []) {
      raised.push({ ...row, _tool: c.tool });
    }
    notes.push(...(result.notes ?? []));
  }
  const rows = numberRows([...fileRows(ws), ...raised]);
  const store = previewStore(env.repoRoot);
  const signature = signatureOf(call, env);
  const extra = {
    ...(prose.length && { prose }),
    ...(notes.length && { notes }),
  };

  if (call.preview) {
    store.put(signature, rows);
    return { preview: true, rows: rows.map(publicRow), ...extra };
  }
  if (call.answers === null && rows.length) {
    store.put(signature, rows);
    throw new RefusalError(
      "this call shows rows — answer each with --answers <id>:<answer>,…",
      rows,
    );
  }
  if (rows.length || call.answers?.size) {
    checkAnswers(rows, call.answers ?? new Map(), store.get(signature));
  }

  const followUps = [];
  for (const row of rows) {
    const answer = call.answers?.get(row.id);
    const effect = row.effects?.[answer];
    if (effect === "needs-edit") {
      followUps.push(
        needsEdit({
          file: row.path,
          reason:
            `merge ${row.requester}'s block: combine the two versions by hand`,
          target: row.theirs,
        }),
      );
    }
    else {
      for (const op of effect ?? []) {
        applyOp(ws, op, row._tool, "effect", [], notes);
      }
    }
  }
  const { written, deleted } = land(ws, env, call.command === "all");
  store.drop(signature);
  return {
    written,
    deleted,
    rows: numberRows(followUps).map(publicRow),
    ...extra,
  };
}

try {
  const out = await run(process.argv.slice(2));
  process.stdout.write(JSON.stringify(out, null, 2) + "\n");
}
catch (e) {
  // exitCode, never exit(): exit() can cut a large JSON body short on a pipe
  if (e instanceof RefusalError || e instanceof UnsafePathError) {
    const body = {
      error: e.message,
      ...(e.rows && { rows: e.rows.map(publicRow) }),
      ...e.extra,
    };
    process.stdout.write(JSON.stringify(body, null, 2) + "\n");
    process.exitCode = 2;
  }
  else {
    process.stdout.write(
      JSON.stringify({ error: String(e?.message ?? e) }, null, 2) + "\n",
    );
    process.stderr.write(`${e?.stack ?? e}\n`);
    process.exitCode = 1;
  }
}
