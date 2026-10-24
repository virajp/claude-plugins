#!/usr/bin/env node
// The action log of one /vwf:execute run.
//
// One JSONL file per run attempt, outside the repo, so no worktree removal or
// branch cleanup touches it and nothing is committed:
//
//   <root>/<repo>/<plan folder basename>/<YYYYMMDD-HHMMSS>-<session8>.jsonl
//
// <root> is $VWF_LOG_ROOT, default /tmp/vwf. macOS's tmp_cleaner removes a
// file under /tmp that nothing read or changed for three days.
//
// Two writers append to the file. This script writes what only the
// orchestrator knows — the phase, the unit, the gate tier, the gap. The hook
// hooks/action-log.mjs writes every tool call and subagent, with the machine's
// clock. The hook finds the file through the session's marker,
// <root>/active/<session id>, which `start` writes and `end` removes. The
// session id is $CLAUDE_CODE_SESSION_ID, the same id a hook reads from stdin.
//
//   node log.mjs start --folder <plan folder> [--mode fresh|resume] [--key value]…
//   node log.mjs event <name> [--key value]…
//   node log.mjs run [--event gate] [--key value]… -- <command> [args]…
//   node log.mjs end [--outcome <outcome>]
//   node log.mjs summary <file>
//
// `run` runs the command with its stdio inherited, then appends one event —
// `gate` unless --event names another — with the command line, its exit code
// and its duration, and exits with the command's own code. A `commit` event
// also records the new HEAD when the command exits 0.
//
// Every line carries ts (ISO time, milliseconds), run, session, agent (null
// for the orchestrator) and event. A --key value pair becomes a field: an
// integer value is a number, true and false are booleans, any other a string.
//
// A log call never stops a run: with no active run, start excepted, a call
// prints one warning on stderr and exits 0 — `run` still runs its command.

import { spawnSync } from "node:child_process";
import {
  appendFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import {
  basename,
  dirname,
  join,
  resolve,
} from "node:path";

const ROOT = process.env.VWF_LOG_ROOT || "/tmp/vwf";
const SESSION = process.env.CLAUDE_CODE_SESSION_ID || "nosession";
const marker = join(ROOT, "active", SESSION);

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

function stamp(d) {
  const p = n => String(n).padStart(2, "0");
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-`
    + `${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;
}

function active() {
  if (!existsSync(marker)) {
    return undefined;
  }
  const file = readFileSync(marker, "utf8").trim();
  return file || undefined;
}

function append(file, event, extra) {
  const line = {
    ts: new Date().toISOString(),
    run: basename(file, ".jsonl"),
    session: SESSION,
    agent: null,
    event,
    ...extra,
  };
  appendFileSync(file, JSON.stringify(line) + "\n");
}

function warn(msg) {
  process.stderr.write(`log.mjs: ${msg}\n`);
}

function start(args) {
  const f = fields(args);
  if (typeof f.folder !== "string") {
    warn("start needs --folder <plan folder>");
    process.exit(2);
  }
  const folder = f.folder.replace(/\/+$/, "").replace(/\/index\.md$/, "");
  const common = git([
    "rev-parse",
    "--path-format=absolute",
    "--git-common-dir",
  ]);
  const repo = common ? basename(dirname(common)) : basename(resolve("."));
  const dir = join(ROOT, repo, basename(folder));
  mkdirSync(dir, { recursive: true });
  mkdirSync(dirname(marker), { recursive: true });
  const file = join(dir, `${stamp(new Date())}-${SESSION.slice(0, 8)}.jsonl`);
  writeFileSync(file, "");
  writeFileSync(marker, file + "\n");
  append(file, "run.start", {
    ...f,
    folder,
    repo,
    mode: f.mode ?? "fresh",
    head: git(["rev-parse", "HEAD"]),
    branch: git(["branch", "--show-current"]),
  });
  process.stdout.write(file + "\n");
}

function event(args) {
  const [name, ...rest] = args;
  const file = active();
  if (!name) {
    warn("event needs a name");
    return;
  }
  if (!file) {
    warn(`no active run in session ${SESSION}; event ${name} not logged`);
    return;
  }
  append(file, name, fields(rest));
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
  const file = active();
  if (file) {
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
    append(file, name, extra);
  }
  else {
    warn(`no active run in session ${SESSION}; ${name} not logged`);
  }
  process.exit(code);
}

function end(args) {
  const file = active();
  if (!file) {
    warn(`no active run in session ${SESSION}`);
    return;
  }
  append(file, "run.end", fields(args));
  rmSync(marker, { force: true });
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

function summary(args) {
  const file = args[0];
  if (!file) {
    warn("summary needs <file>");
    process.exit(2);
  }
  const ev = readFileSync(file, "utf8")
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
  if (!ev.length) {
    process.stdout.write("empty log\n");
    return;
  }
  const t0 = ms(ev[0].ts);
  const tEnd = ms(ev[ev.length - 1].ts);
  const at = t => fmt(ms(t) - t0);
  const out = [];
  const head = ev.find(e => e.event === "run.start") ?? {};
  const tail = [...ev].reverse().find(e => e.event === "run.end");
  out.push(
    `run ${head.run ?? basename(file)} — ${head.folder ?? "?"} (${
      head.mode ?? "?"
    })`,
  );
  out.push(
    `span ${fmt(tEnd - t0)}, outcome ${tail?.outcome ?? "none recorded"}`,
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

  // Gates and commits, from the run wrapper.
  const gates = ev.filter(e => e.event === "gate");
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

  // Gaps: what the orchestrator recorded, and what agents returned.
  const gaps = ev.filter(e => e.event === "gap").map(
    g => [at(g.ts), g.class ?? "", g.source ?? "", g.unit ?? "", g.text ?? ""],
  );
  for (const [id, a] of agents) {
    for (const g of a.gaps ?? []) {
      gaps.push([
        fmt(a.end - t0),
        "reported",
        "agent",
        child.get(id)?.summary ?? id,
        g,
      ]);
    }
  }
  if (gaps.length) {
    out.push(
      "",
      "GAPS",
      table(["at", "class", "source", "unit", "text"], gaps),
    );
  }

  const stops = ev.filter(e => e.event === "stop");
  for (const s of stops) {
    out.push("", `STOP at ${at(s.ts)}: ${s.reason ?? ""} — ${s.resume ?? ""}`);
  }
  process.stdout.write(out.join("\n") + "\n");
}

const [cmd, ...rest] = process.argv.slice(2);
const verbs = { start, event, run, end, summary };
if (!verbs[cmd]) {
  warn("usage: log.mjs start|event|run|end|summary …");
  process.exit(2);
}
verbs[cmd](rest);
