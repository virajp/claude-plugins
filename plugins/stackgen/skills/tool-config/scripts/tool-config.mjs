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
// `remove` is the engine's unless the module defines it. An op is one of:
//
//   {op: "block", path, requester, body, region?, comment?, sort?, list?, frame?, drift?}
//   {op: "entry", path, requester, line, key?, region?, comment?, sort?, list?, frame?}
//   {op: "whole", path, content, mode?, drift?, force?}
//   {op: "user-line", path, line, match, region?, frame?}
//   {op: "drop-lines", path, match, requester?}
//   {op: "delete", path}
//   {op: "remove", requester}
//
// A row a module raises carries `effects: {<answer>: ops | "needs-edit"}`.

import { spawnSync } from "node:child_process";
import {
  chmodSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import {
  delimiter,
  dirname,
  join,
  relative,
  resolve,
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
  isToolConfig,
  LOCK_PATH,
  readLock,
  sha256,
  sourceTool,
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
  parseMachineEnv,
  parseToolConfigList,
  readPack,
  validateEntry,
} from "./lib/schema.mjs";

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));

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

const MISSING_MISE =
  "mise is not on PATH — install mise (https://mise.jdx.dev), then re-run.";

// --- the workspace: the repo as the call would leave it --------------------------

class Workspace {
  constructor(root) {
    this.root = root;
    this.files = new Map(); // path → text | null (deleted)
    this.modes = new Map();
    this.owner = new Map(); // path → the tool whose call first wrote it
    this.order = []; // touched paths, first touch first
    const text = this.disk(LOCK_PATH);
    this.lockText = text;
    this.lock = readLock(text);
    this.base = new Map(
      [...this.lock.entries].map(([p, e]) => [p, structuredClone(e)]),
    );
  }

  disk(path) {
    const abs = join(this.root, path);
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

  /** Repo-relative files under `dir`, as the call would leave them. */
  list(dir) {
    const out = new Set();
    const walk = rel => {
      const abs = join(this.root, rel);
      if (!existsSync(abs)) {
        return;
      }
      for (const d of readdirSync(abs, { withFileTypes: true })) {
        if (d.name === ".git") {
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
        continue;
      }
      const prev = entries.get(path);
      const tool = (prev && sourceTool(prev)) ?? this.owner.get(path);
      const rec = prev ?? { path };
      rec.source = `tool-config/${tool}@${version}`;
      rec.hash = sha256(text);
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

  commit(version) {
    this.settleRecords(version);
    const written = [];
    const deleted = [];
    for (const path of this.order) {
      const text = this.files.get(path);
      const abs = join(this.root, path);
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
    const lock = this.lock.write();
    if (
      lock !== this.lockText
      && (this.lockText !== null || this.lock.entries.size)
    ) {
      mkdirSync(dirname(join(this.root, LOCK_PATH)), { recursive: true });
      writeFileSync(join(this.root, LOCK_PATH), lock);
    }
    return { written, deleted };
  }
}

// --- ops ---------------------------------------------------------------------------

const frameText = frame => (frame?.length ? blocks.joinLines(frame) : "");

function regionBodies(text, op) {
  const { lines } = blocks.splitLines(text);
  const reg = blocks.findRegion(lines, op.region ?? { kind: "whole" });
  if (!reg) {
    return null;
  }
  const b = blocks.parseBlocks(lines).find(x =>
    x.requester === op.requester && x.open >= reg.start && x.close < reg.end
  );
  return b ? lines.slice(b.open + 1, b.close) : null;
}

/**
 * Apply one op to the workspace. In "plan" mode an op that would overwrite a
 * drifted block, or an unrecorded file, raises a row instead (pushed to
 * `rows`); in "effect" mode — an answered row's — it is applied as given.
 */
function applyOp(ws, op, tool, mode, rows, notes) {
  if (op.path) {
    const rec = ws.record(op.path);
    if (rec && !isToolConfig(rec)) {
      notes.push(`${op.path} is ${rec.source}'s — left alone`);
      return;
    }
  }
  const current = op.path ? ws.read(op.path) : null;
  switch (op.op) {
    case "block": {
      if (mode === "plan" && op.drift && current !== null) {
        const mine = regionBodies(current, op);
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
      if (current === op.content) {
        if (op.mode && ws.record(op.path)?.mode !== op.mode) {
          ws.write(op.path, op.content, tool, op.mode);
        }
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
    case "remove": {
      for (const rec of [...ws.lock.entries.values()]) {
        if (sourceTool(rec) !== tool) {
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
    const shares = r => JSON.stringify(r?.shares ?? {});
    const sharesChanged = shares(ws.base.get(path)) !== shares(ws.record(path));
    const modeChanged = ws.modes.has(path)
      && ws.base.get(path)?.mode !== ws.modes.get(path);
    if (before === after && !sharesChanged && !modeChanged) {
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
      row.kind = before === after && sharesChanged ? "share" : "write";
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
    if (sharesChanged) {
      row.shares = ws.record(path)?.shares ?? {};
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

function onPath(bin, path = process.env.PATH ?? "") {
  return path.split(delimiter).some(dir => {
    try {
      return dir && statSync(join(dir, bin)).isFile();
    }
    catch {
      return false;
    }
  });
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
    records: () => [...ws.lock.entries.values()],
    assetsDir,
    asset: rel => readFileSync(join(assetsDir, rel), "utf8"),
    listAssets: () => walkFiles(assetsDir),
    exec: (cmd, args, opts = {}) =>
      spawnSync(cmd, args, { cwd: env.repoRoot, encoding: "utf8", ...opts }),
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
      ...Object.keys(tools).filter(t => !TOOL_ORDER.includes(t)),
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
            Object.entries(flags).map(([k, v]) => [k, String(v)]),
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
  const tools = await loadTools();
  const ws = new Workspace(env.repoRoot);

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
      contextFor: tool => contextFor(tool, ws, env),
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

  const raised = [];
  const notes = [];
  for (const c of calls) {
    const mod = tools[c.tool];
    const ctx = contextFor(c.tool, ws, env);
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
  const { written, deleted } = ws.commit(env.version);
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
  if (e instanceof RefusalError) {
    const body = {
      error: e.message,
      ...(e.rows && { rows: e.rows.map(publicRow) }),
    };
    process.stdout.write(JSON.stringify(body, null, 2) + "\n");
    process.exit(2);
  }
  process.stdout.write(
    JSON.stringify({ error: String(e?.message ?? e) }, null, 2) + "\n",
  );
  process.stderr.write(`${e?.stack ?? e}\n`);
  process.exit(1);
}
