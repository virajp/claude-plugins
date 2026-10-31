#!/usr/bin/env node
// The action log of one plan, across every /vwf:execute run of it.
//
// One append-only JSONL file per plan, outside the repo, so no worktree
// removal or branch cleanup touches it and nothing is committed:
//
//   <root>/<repo>/<plan folder basename>.jsonl
//
// <root> is $VWF_LOG_ROOT, default ~/Library/Caches/vwf, which macOS does not
// clear. <repo> is the name of the repo that holds the folder, from its git
// common dir, so the main checkout and a worktree name the same file. No step
// edits or removes a line: each start, fresh or resume, appends a new
// run.start, and every line carries the id of the run that wrote it,
// <YYYYMMDD-HHMMSS>-<session8> (local time), in its run field.
//
// Two writers append to the file. This script writes what only the
// orchestrator knows — the phase, the gate tier, the row, the gap. The hook
// hooks/action-log.mjs writes every tool call and subagent, with the machine's
// clock, and session.end. The hook finds the file through the session's
// marker, <root>/active/<session id>, two lines — the log path, then the run
// id — which start writes and end (or the SessionEnd hook) removes. The
// session id is $CLAUDE_CODE_SESSION_ID, the same id a hook reads from stdin.
//
//   node log.mjs start --folder <plan folder> [--mode fresh|resume] [--key value]…
//   node log.mjs event <name> [--key value]…
//   node log.mjs event row|gap <<'EOF'  (one JSON object on stdin)
//   node log.mjs run [--event gate] [--key value]… -- <command> [args]…
//   node log.mjs end [--outcome <outcome>]
//   node log.mjs summary <file>
//   node log.mjs prune --repo <root> --days <n> [--keep <folder basename>]
//
// start reads <folder>/index.json and appends plan.snapshot {folder, units}
// right after run.start. It first sweeps <root>/active/: the nosession marker
// always, and each other session's marker whose log is missing or unchanged
// for 24 hours. It never touches a log.
//
// `run` runs the command with its stdio inherited, then appends one event —
// `gate` unless --event names another — with the command line, its exit code
// and its duration, and exits with the command's own code. A `commit` event
// also records the new HEAD when the command exits 0.
//
// Every line carries ts (ISO time, milliseconds), run, session, agent (null
// for the orchestrator) and event. For the free events a --key value pair
// becomes a field: an integer value is a number, true and false are booleans,
// any other a string. row, gap, plan.snapshot and session.end are strict
// (SCHEMAS below): a bad object exits non-zero and writes nothing.
//
// prune deletes <root>/<repo>/<basename>.jsonl only when
// <repo root>/docs/plans/archived/<basename> or …/<basename>-<n> is a
// directory, the basename is not --keep, and the file is older than --days.
//
// A log call never stops a run: with no active run, start excepted, a call
// prints `log.mjs: no active run in session <id>` on stderr and exits 0 —
// `run` still runs its command and keeps its exit code.

import { spawnSync } from "node:child_process";
import {
  appendFileSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  realpathSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { homedir } from "node:os";
import {
  basename,
  dirname,
  join,
  resolve,
} from "node:path";
import {
  STAGE_STATE,
  UNIT_STATUS,
} from "../../plan-management/scripts/lib/schema.mjs";

const ROOT = process.env.VWF_LOG_ROOT
  || join(homedir(), "Library", "Caches", "vwf");
const SESSION = process.env.CLAUDE_CODE_SESSION_ID || "nosession";
const marker = join(ROOT, "active", SESSION);
const DAY = 24 * 60 * 60 * 1000;

// The keys of a folder's `stages` object in schema.mjs, which exports no list.
const STAGES = ["renders", "acceptance", "ux", "reconcile"];
const GAP_CLASS = ["GAP", "UNRESOLVED", "contested", "oscillation"];
const GAP_SOURCE = [
  "unit",
  "wave-review",
  "review-row",
  "gate",
  "acceptance",
  "ux",
];

function value(raw) {
  if (/^-?\d+$/.test(raw)) {
    return Number(raw);
  }
  if (raw === "true") {
    return true;
  }
  if (raw === "false") {
    return false;
  }
  return raw;
}

// --key value pairs into an object; a --key with no value reads true.
function fields(args) {
  const out = {};
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (!a.startsWith("--")) {
      continue;
    }
    const key = a.slice(2).replace(/-/g, "_");
    const next = args[i + 1];
    if (next === undefined || next.startsWith("--")) {
      out[key] = true;
    }
    else {
      out[key] = value(next);
      i++;
    }
  }
  return out;
}

function git(args, cwd) {
  const r = spawnSync("git", args, { cwd, encoding: "utf8" });
  return r.status === 0 ? r.stdout.trim() : undefined;
}

// The repo's name from the git common dir of the repo that contains `dir`;
// outside git, the name of `fallback`.
function repoName(dir, fallback = dir) {
  const common = git(
    ["rev-parse", "--path-format=absolute", "--git-common-dir"],
    dir,
  );
  return common ? basename(dirname(common)) : basename(resolve(fallback));
}

function stamp(d) {
  const p = n => String(n).padStart(2, "0");
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-`
    + `${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;
}

// The session's run, read in one call: a marker gone before the read is no run.
function active() {
  let text;
  try {
    text = readFileSync(marker, "utf8");
  }
  catch {
    return undefined;
  }
  const [file = "", run = ""] = text.split("\n").map(l => l.trim());
  if (!file) {
    return undefined;
  }
  return { file, run: run || basename(file, ".jsonl") };
}

function append(ctx, event, extra) {
  const line = {
    ts: new Date().toISOString(),
    run: ctx.run,
    session: SESSION,
    agent: null,
    event,
    ...extra,
  };
  appendFileSync(ctx.file, JSON.stringify(line) + "\n");
}

function warn(msg) {
  process.stderr.write(`log.mjs: ${msg}\n`);
}

const noRun = () => warn(`no active run in session ${SESSION}`);

// --- schemas -----------------------------------------------------------------

const isStr = v => typeof v === "string";
const isInt = v => Number.isInteger(v);
const isObj = v => v !== null && typeof v === "object" && !Array.isArray(v);

function unknown(o, allowed) {
  return Object
    .keys(o)
    .filter(k => !allowed.includes(k))
    .map(k => `unknown key ${k}`);
}

const SCHEMAS = {
  "plan.snapshot"(o) {
    const f = unknown(o, ["folder", "units"]);
    if (!isStr(o.folder)) {
      f.push("folder must be a string");
    }
    if (!Array.isArray(o.units)) {
      f.push("units must be a list");
    }
    return f;
  },
  "session.end"(o) {
    const f = unknown(o, ["reason"]);
    if (!isStr(o.reason)) {
      f.push("reason must be a string");
    }
    return f;
  },
  row(o) {
    const f = unknown(o, [
      "unit",
      "stage",
      "wave",
      "status",
      "rounds",
      "commit",
      "range",
      "detail",
    ]);
    const isUnit = "unit" in o;
    if (isUnit === ("stage" in o)) {
      f.push("exactly one of unit or stage");
    }
    else if (isUnit) {
      if (!isStr(o.unit) || !/^U\d+$/.test(o.unit)) {
        f.push("unit must be U<n>");
      }
      if (!isInt(o.wave) || o.wave < 1) {
        f.push("wave must be an integer >= 1 on a unit row");
      }
      if (!UNIT_STATUS.includes(o.status)) {
        f.push(`status must be one of ${UNIT_STATUS.join(", ")}`);
      }
    }
    else {
      if (!STAGES.includes(o.stage)) {
        f.push(`stage must be one of ${STAGES.join(", ")}`);
      }
      if ("wave" in o) {
        f.push("wave goes with unit only");
      }
      if (!STAGE_STATE.includes(o.status)) {
        f.push(`status must be one of ${STAGE_STATE.join(", ")}`);
      }
    }
    if ("rounds" in o && (!isInt(o.rounds) || o.rounds < 0)) {
      f.push("rounds must be an integer >= 0");
    }
    if ("commit" in o && !isStr(o.commit)) {
      f.push("commit must be a string");
    }
    if ("detail" in o && !isStr(o.detail)) {
      f.push("detail must be a string");
    }
    if ("range" in o) {
      const r = o.range;
      if (
        !isObj(r)
        || !isStr(r.from)
        || !isStr(r.to)
        || Object.keys(r).length !== 2
      ) {
        f.push("range must be {from, to}, both strings");
      }
    }
    return f;
  },
  gap(o) {
    const f = unknown(o, [
      "id",
      "unit",
      "stage",
      "text",
      "state",
      "class",
      "source",
    ]);
    if ("id" in o && (!isStr(o.id) || !/^[GL]\d+$/.test(o.id))) {
      f.push("id must be G<n> or L<n>");
    }
    if (!isStr(o.unit)) {
      f.push("unit must be a string");
    }
    if (!isStr(o.stage)) {
      f.push("stage must be a string");
    }
    if (!isStr(o.text) || !o.text) {
      f.push("text must be a non-empty string");
    }
    if (!["open", "closed"].includes(o.state)) {
      f.push("state must be open or closed");
    }
    else if (!("id" in o) && o.state !== "open") {
      f.push("a gap with no id is open");
    }
    if ("class" in o && !GAP_CLASS.includes(o.class)) {
      f.push(`class must be one of ${GAP_CLASS.join(", ")}`);
    }
    if ("source" in o && !GAP_SOURCE.includes(o.source)) {
      f.push(`source must be one of ${GAP_SOURCE.join(", ")}`);
    }
    return f;
  },
};

/** The findings for one strict event's payload; an empty list is valid. */
export function check(type, o) {
  if (!isObj(o)) {
    return ["the payload must be one JSON object"];
  }
  return SCHEMAS[type](o);
}

function strict(type, o) {
  const f = check(type, o);
  if (f.length) {
    warn(`${type} refused: ${f.join("; ")}`);
    process.exit(1);
  }
}

// --- verbs -------------------------------------------------------------------

// Remove the nosession marker and every other session's marker whose log is
// missing or unchanged for a day. Never a log.
function sweep() {
  const dir = join(ROOT, "active");
  let names;
  try {
    names = readdirSync(dir);
  }
  catch {
    return;
  }
  for (const name of names) {
    if (name === SESSION && name !== "nosession") {
      continue;
    }
    const m = join(dir, name);
    let stale = name === "nosession";
    if (!stale) {
      try {
        const log = readFileSync(m, "utf8").split("\n")[0].trim();
        stale = !log || Date.now() - statSync(log).mtimeMs > DAY;
      }
      catch {
        stale = true;
      }
    }
    if (stale) {
      rmSync(m, { force: true });
    }
  }
}

function start(args) {
  const f = fields(args);
  if (typeof f.folder !== "string") {
    warn("start needs --folder <plan folder>");
    process.exit(2);
  }
  const mode = f.mode ?? "fresh";
  if (mode !== "fresh" && mode !== "resume") {
    warn(`start --mode is fresh or resume, not ${mode}`);
    process.exit(2);
  }
  const folder = f
    .folder
    .replace(/\/+$/, "")
    .replace(/\/index\.(md|json)$/, "");
  let units;
  try {
    units = JSON.parse(readFileSync(join(folder, "index.json"), "utf8")).units;
  }
  catch (e) {
    warn(`start cannot read ${join(folder, "index.json")}: ${e.message}`);
    process.exit(2);
  }
  const snapshot = { folder, units };
  if (check("plan.snapshot", snapshot).length) {
    warn(`${join(folder, "index.json")} has no units list`);
    process.exit(2);
  }
  const repo = repoName(folder, ".");
  const dir = join(ROOT, repo);
  const ctx = {
    file: join(dir, `${basename(folder)}.jsonl`),
    run: `${stamp(new Date())}-${SESSION.slice(0, 8)}`,
  };
  sweep();
  mkdirSync(dir, { recursive: true });
  mkdirSync(dirname(marker), { recursive: true });
  writeFileSync(marker, `${ctx.file}\n${ctx.run}\n`);
  append(ctx, "run.start", {
    ...f,
    folder,
    repo,
    mode,
    head: git(["rev-parse", "HEAD"]),
    branch: git(["branch", "--show-current"]),
  });
  append(ctx, "plan.snapshot", snapshot);
  process.stdout.write(ctx.file + "\n");
}

// One past the highest L id in the log; L1 when none.
function nextL(file) {
  let max = 0;
  for (const e of read(file)) {
    const m = e.event === "gap" && /^L(\d+)$/.exec(e.id ?? "");
    if (m) {
      max = Math.max(max, Number(m[1]));
    }
  }
  return `L${max + 1}`;
}

// Events only start, end and the SessionEnd hook write.
const RESERVED = ["run.start", "run.end", "plan.snapshot", "session.end"];

function event(args) {
  const [name, ...rest] = args;
  if (!name) {
    warn("event needs a name");
    return;
  }
  if (name === "unit") {
    warn("event unit is gone: write event row, its JSON on stdin");
    process.exit(2);
  }
  if (RESERVED.includes(name)) {
    warn(`event ${name} is written by start, end or the hook only`);
    process.exit(2);
  }
  const stdin = name === "row" || name === "gap";
  if (stdin && rest.length) {
    warn(`event ${name} takes its JSON on stdin, not --key pairs`);
    process.exit(2);
  }
  const ctx = active();
  if (!ctx) {
    noRun();
    return;
  }
  if (!stdin) {
    append(ctx, name, fields(rest));
    return;
  }
  let o;
  try {
    o = JSON.parse(readFileSync(0, "utf8"));
  }
  catch (e) {
    warn(`${name} refused: stdin is not JSON: ${e.message}`);
    process.exit(1);
  }
  strict(name, o);
  if (name === "gap" && !("id" in o)) {
    o = { id: nextL(ctx.file), ...o };
  }
  append(ctx, name, o);
}

function run(args) {
  const cut = args.indexOf("--");
  if (cut < 0 || cut === args.length - 1) {
    warn("run needs -- <command>");
    process.exit(2);
  }
  const own = fields(args.slice(0, cut));
  const command = args.slice(cut + 1);
  const name = typeof own.event === "string" ? own.event : "gate";
  delete own.event;
  const t0 = Date.now();
  const r = spawnSync(command[0], command.slice(1), { stdio: "inherit" });
  const code = r.status ?? (r.signal ? 128 : 1);
  const ctx = active();
  if (ctx) {
    const extra = {
      ...own,
      line: command.join(" "),
      exit: code,
      dur_ms: Date.now() - t0,
    };
    if (r.error) {
      extra.error = r.error.message;
    }
    if (name === "commit" && code === 0) {
      extra.hash = git(["rev-parse", "--short", "HEAD"]);
    }
    append(ctx, name, extra);
  }
  else {
    noRun();
  }
  process.exit(code);
}

function end(args) {
  const ctx = active();
  if (!ctx) {
    noRun();
    return;
  }
  append(ctx, "run.end", fields(args));
  rmSync(marker, { force: true });
}

function prune(args) {
  const f = fields(args);
  if (typeof f.repo !== "string" || typeof f.days !== "number") {
    warn("prune needs --repo <root> --days <n>");
    process.exit(2);
  }
  const keep = f.keep === undefined ? undefined : String(f.keep);
  const dir = join(ROOT, repoName(f.repo));
  const archived = join(f.repo, "docs", "plans", "archived");
  let logs;
  let folders;
  try {
    logs = readdirSync(dir).filter(n => n.endsWith(".jsonl"));
  }
  catch {
    return;
  }
  try {
    folders = readdirSync(archived, { withFileTypes: true })
      .filter(d => d.isDirectory())
      .map(d => d.name);
  }
  catch {
    return;
  }
  const cutoff = Date.now() - f.days * DAY;
  for (const name of logs) {
    const base = name.slice(0, -".jsonl".length);
    if (base === keep) {
      continue;
    }
    const isArchived = folders.some(n =>
      n === base
      || (n.startsWith(`${base}-`) && /^\d+$/.test(n.slice(base.length + 1)))
    );
    const file = join(dir, name);
    if (isArchived && statSync(file).mtimeMs < cutoff) {
      rmSync(file);
      process.stdout.write(file + "\n");
    }
  }
}

// --- summary -----------------------------------------------------------------

const ms = t => new Date(t).getTime();

function fmt(d) {
  if (d === undefined) {
    return "open";
  }
  const s = Math.round(d / 1000);
  if (s < 60) {
    return `${s}s`;
  }
  const m = Math.floor(s / 60);
  return m < 60
    ? `${m}m${String(s % 60).padStart(2, "0")}s`
    : `${Math.floor(m / 60)}h${String(m % 60).padStart(2, "0")}m`;
}

function table(head, rows) {
  const w = head.map((h, i) =>
    Math.max(h.length, ...rows.map(r => String(r[i]).length))
  );
  const line = r =>
    r.map((c, i) => String(c).padEnd(w[i])).join("  ").trimEnd();
  return [line(head), line(w.map(n => "-".repeat(n))), ...rows.map(line)].join(
    "\n",
  );
}

// The length of the union of [start, end] intervals.
function covered(iv) {
  const s = [...iv].sort((a, b) => a[0] - b[0]);
  let total = 0;
  let cur;
  for (const [a, b] of s) {
    if (!cur || a > cur[1]) {
      if (cur) {
        total += cur[1] - cur[0];
      }
      cur = [a, b];
    }
    else if (b > cur[1]) {
      cur[1] = b;
    }
  }
  if (cur) {
    total += cur[1] - cur[0];
  }
  return total;
}

// The highest number of intervals open at one time.
function peak(iv) {
  const pts = iv.flatMap(([a, b]) => [[a, 1], [b, -1]]).sort((x, y) =>
    x[0] - y[0] || x[1] - y[1]
  );
  let n = 0;
  let max = 0;
  for (const [, d] of pts) {
    n += d;
    max = Math.max(max, n);
  }
  return max;
}

function read(file) {
  let text;
  try {
    text = readFileSync(file, "utf8");
  }
  catch {
    return [];
  }
  return text
    .split("\n")
    .filter(Boolean)
    .map(l => {
      try {
        return JSON.parse(l);
      }
      catch {
        return undefined;
      }
    })
    .filter(Boolean);
}

// The sections of one run; `kinds` maps a unit id to its kind. Returns the
// lines and the run's totals.
function report(ev, kinds) {
  const t0 = ms(ev[0].ts);
  const tEnd = ms(ev[ev.length - 1].ts);
  const at = t => fmt(ms(t) - t0);
  const out = [];
  const totals = { span: tEnd - t0, gates: 0, gateMs: 0, commits: 0 };
  const head = ev.find(e => e.event === "run.start") ?? {};
  const tail = [...ev].reverse().find(e => e.event === "run.end");
  const gone = [...ev].reverse().find(e => e.event === "session.end");
  out.push(
    `run ${head.run ?? ev[0].run ?? "?"} — ${head.folder ?? "?"} (${
      head.mode ?? "?"
    }), started ${head.ts ?? ev[0].ts}`,
  );
  out.push(
    `span ${fmt(totals.span)}, outcome ${
      tail?.outcome
        ?? (gone ? `session ended (${gone.reason})` : "none recorded")
    }`,
  );

  // Phases: each phase.start closed by the next phase.end with the same keys.
  const key = e => [e.phase, e.wave, e.unit, e.loop, e.round].join("|");
  const open = new Map();
  const phases = [];
  for (const e of ev) {
    if (e.event === "phase.start") {
      open.set(key(e), e);
    }
    if (e.event === "phase.end") {
      const s = open.get(key(e));
      open.delete(key(e));
      phases.push([
        s ? at(s.ts) : "?",
        e.phase,
        e.wave ?? "",
        e.unit ?? "",
        s ? fmt(ms(e.ts) - ms(s.ts)) : "?",
      ]);
    }
  }
  for (const s of open.values()) {
    phases.push([at(s.ts), s.phase, s.wave ?? "", s.unit ?? "", "open"]);
  }
  phases.sort((a, b) => String(a[0]).localeCompare(String(b[0])));
  if (phases.length) {
    out.push(
      "",
      "PHASES",
      table(["at", "phase", "wave", "unit", "took"], phases),
    );
  }

  // Agents: label each from the Agent call that spawned it.
  const spawn = new Map(); // tool_use_id → Agent tool.start
  const child = new Map(); // agent id → Agent tool.start
  for (const e of ev) {
    if (e.event === "tool.start" && e.tool === "Agent") {
      spawn.set(e.tool_use_id, e);
    }
    if (e.event === "tool.end" && e.tool === "Agent" && e.child) {
      child.set(e.child, spawn.get(e.tool_use_id));
    }
  }
  const agents = new Map();
  for (const e of ev) {
    if (e.event === "agent.start") {
      agents.set(e.agent, { start: ms(e.ts), type: e.agent_type });
    }
    if (e.event === "agent.end") {
      const a = agents.get(e.agent) ?? { start: t0, type: e.agent_type };
      a.end = ms(e.ts);
      a.gaps = e.gaps ?? [];
      agents.set(e.agent, a);
    }
  }
  const iv = [];
  const rows = [];
  for (const [id, a] of agents) {
    const end = a.end ?? tEnd;
    iv.push([a.start, end]);
    const by = child.get(id);
    rows.push([
      a.start,
      fmt(a.start - t0),
      fmt(a.end === undefined ? undefined : end - a.start),
      a.type ?? "",
      by?.summary ?? id,
      by?.agent ?? "orchestrator",
    ]);
  }
  rows.sort((x, y) => x[0] - y[0]);
  for (const r of rows) {
    r.shift();
  }
  if (rows.length) {
    out.push(
      "",
      "AGENTS",
      table(["at", "took", "type", "what", "spawned by"], rows),
    );
    const sum = iv.reduce((n, [a, b]) => n + b - a, 0);
    const union = covered(iv);
    out.push(
      "",
      `agents ran ${fmt(sum)} in total over ${fmt(union)} of wall time; `
        + `peak ${peak(iv)} at once; parallel factor ${
          (sum / Math.max(union, 1)).toFixed(2)
        }`,
    );
  }

  // Units and stages: the last row of each.
  const last = new Map();
  for (const e of ev) {
    if (e.event === "row") {
      const k = e.unit ?? `stage ${e.stage}`;
      last.set(k, { ...last.get(k), ...e });
    }
  }
  if (last.size) {
    out.push(
      "",
      "UNITS",
      table(
        ["unit", "kind", "wave", "status", "commit", "rounds"],
        [...last.entries()].map(([k, r]) => [
          k,
          kinds.get(r.unit) ?? "",
          r.wave ?? "",
          r.status,
          r.commit ?? "",
          r.rounds ?? "",
        ]),
      ),
    );
  }

  // Gates and commits, from the run wrapper.
  const gates = ev.filter(e => e.event === "gate");
  totals.gates = gates.length;
  totals.gateMs = gates.reduce((n, g) => n + (g.dur_ms ?? 0), 0);
  if (gates.length) {
    out.push(
      "",
      "GATES",
      table(
        ["at", "tier", "unit", "exit", "took", "line"],
        gates.map(g => [
          at(g.ts),
          g.tier ?? "",
          g.unit ?? "",
          g.exit,
          fmt(g.dur_ms),
          g.line,
        ]),
      ),
    );
    const by = {};
    for (const g of gates) {
      by[g.tier ?? "?"] = (by[g.tier ?? "?"] ?? 0) + g.dur_ms;
    }
    out.push(Object.entries(by).map(([t, d]) => `${t} ${fmt(d)}`).join(", "));
  }
  const commits = ev.filter(e => e.event === "commit");
  totals.commits = commits.length;
  if (commits.length) {
    out.push(
      "",
      `COMMITS ${commits.length}, ${
        fmt(commits.reduce((n, c) => n + c.dur_ms, 0))
      } in total`,
    );
  }

  // Tool time, the orchestrator apart from the agents.
  const tools = {};
  for (const e of ev) {
    if (e.event !== "tool.end" || typeof e.dur_ms !== "number") {
      continue;
    }
    const k = `${e.agent ? "agent" : "orchestrator"} ${e.tool}`;
    tools[k] ??= [0, 0];
    tools[k][0]++;
    tools[k][1] += e.dur_ms;
  }
  const tr = Object
    .entries(tools)
    .sort((a, b) => b[1][1] - a[1][1])
    .slice(0, 12)
    .map(([k, [n, d]]) => [k, n, fmt(d)]);
  if (tr.length) {
    out.push("", "TOOLS", table(["who tool", "calls", "took"], tr));
  }

  // Gaps: the gap events, the last state of each id, and what agents returned.
  const byId = new Map();
  for (const g of ev.filter(e => e.event === "gap")) {
    byId.set(g.id ?? g.ts, { ...byId.get(g.id ?? g.ts), ...g });
  }
  const gaps = [...byId.values()].map(g => [
    at(g.ts),
    g.id ?? "",
    g.class ?? "",
    g.source ?? "",
    g.unit ?? "",
    g.state ?? "",
    g.text ?? "",
  ]);
  for (const [id, a] of agents) {
    for (const g of a.gaps ?? []) {
      gaps.push([
        fmt((a.end ?? tEnd) - t0),
        "",
        "reported",
        "agent",
        child.get(id)?.summary ?? id,
        "",
        g,
      ]);
    }
  }
  if (gaps.length) {
    out.push(
      "",
      "GAPS",
      table(["at", "id", "class", "source", "unit", "state", "text"], gaps),
    );
  }

  const stops = ev.filter(e => e.event === "stop");
  for (const s of stops) {
    out.push("", `STOP at ${at(s.ts)}: ${s.reason ?? ""} — ${s.resume ?? ""}`);
  }
  return { out, totals };
}

function summary(args) {
  const file = args[0];
  if (!file) {
    warn("summary needs <file>");
    process.exit(2);
  }
  const ev = read(file);
  if (!ev.length) {
    process.stdout.write("empty log\n");
    return;
  }
  // A run is one run.start to the next; a line before the first joins it.
  const runs = [];
  for (const e of ev) {
    if (e.event === "run.start" || !runs.length) {
      runs.push([]);
    }
    runs.at(-1).push(e);
  }
  const kinds = new Map();
  const out = [];
  const sum = { span: 0, gates: 0, gateMs: 0, commits: 0 };
  runs.forEach((r, i) => {
    for (const s of r.filter(e => e.event === "plan.snapshot")) {
      for (const u of s.units ?? []) {
        kinds.set(u.id, u.kind);
      }
    }
    const { out: lines, totals } = report(r, kinds);
    out.push(
      ...(i ? ["", ""] : []),
      `RUN ${i + 1} of ${runs.length}`,
      ...lines,
    );
    for (const k of Object.keys(sum)) {
      sum[k] += totals[k];
    }
  });
  const wall = ms(ev[ev.length - 1].ts) - ms(ev[0].ts);
  out.push(
    "",
    "",
    `TOTAL ${runs.length} run${runs.length === 1 ? "" : "s"}: `
      + `active ${fmt(sum.span)} (paused ${
        fmt(wall - sum.span)
      }, not counted); `
      + `${sum.gates} gates, ${fmt(sum.gateMs)}; ${sum.commits} commits`,
  );
  process.stdout.write(out.join("\n") + "\n");
}

function main() {
  const [cmd, ...rest] = process.argv.slice(2);
  const verbs = { start, event, run, end, summary, prune };
  if (!verbs[cmd]) {
    warn("usage: log.mjs start|event|run|end|summary|prune …");
    process.exit(2);
  }
  verbs[cmd](rest);
}

// Run as a script, not when a test imports check().
let entry;
try {
  entry = realpathSync(process.argv[1] ?? "");
}
catch {
  entry = undefined;
}
if (entry === realpathSync(import.meta.filename)) {
  main();
}
