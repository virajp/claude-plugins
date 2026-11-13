/**
 * vwf's /vwf:execute action log, run for real: `log.mjs`, the orchestrator's
 * writer, and the `action-log.sh` hook with its node half, over a temp log
 * root ($VWF_LOG_ROOT) so nothing lands in ~/Library/Caches/vwf.
 */
import { spawnSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  utimesSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import {
  basename,
  join,
} from "node:path";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
} from "vitest";
// @ts-expect-error — a plain ESM script with no type declarations
import { check } from "../../plugins/vwf/skills/execute/scripts/log.mjs";

const VWF = join(import.meta.dirname, "..", "..", "plugins", "vwf");
const LOG = join(VWF, "skills", "execute", "scripts", "log.mjs");
const HOOK = join(VWF, "hooks", "action-log.sh");
const SID = "11111111-2222-3333-4444-555555555555";
const DAY = 24 * 60 * 60 * 1000;

let root: string;
let repo: string;
let folder: string;

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), "vwf-log-"));
  // The folder sits in its own git repo, whose name names the log's dir.
  repo = join(root, "work", "repo");
  folder = join(repo, "docs", "plans", "2026-10-24-x");
  mkdirSync(folder, { recursive: true });
  spawnSync("git", ["init", "-q", repo]);
  writeFileSync(
    join(folder, "index.json"),
    JSON.stringify({
      units: [
        { id: "U1", kind: "edit", wave: 1 },
        { id: "U2", kind: "code", wave: 2 },
      ],
    }),
  );
});

afterEach(() => {
  rmSync(root, { recursive: true, force: true });
});

function env(session = SID) {
  return {
    ...process.env,
    VWF_LOG_ROOT: root,
    CLAUDE_CODE_SESSION_ID: session,
  };
}

function log(args: string[], session = SID, input?: string) {
  return spawnSync("node", [LOG, ...args], {
    env: env(session),
    encoding: "utf8",
    input,
  });
}

function hook(payload: object) {
  return spawnSync("/bin/sh", [HOOK], {
    env: env(),
    input: JSON.stringify(payload),
    encoding: "utf8",
  });
}

function lines(file: string) {
  return readFileSync(file, "utf8").trim().split("\n").map((l) => JSON.parse(l));
}

function startRun(mode = "fresh", session = SID) {
  const r = log(["start", "--folder", `${folder}/`, "--mode", mode], session);
  expect(r.status).toBe(0);
  return r.stdout.trim();
}

const markerOf = (session = SID) => join(root, "active", session);

describe("log.mjs start", () => {
  it("writes the plan's file, the snapshot and the two-line marker", () => {
    const file = startRun();
    expect(file).toBe(join(root, "repo", "2026-10-24-x.jsonl"));
    const [m, id] = readFileSync(markerOf(), "utf8").trim().split("\n");
    expect(m).toBe(file);
    expect(id).toMatch(/^\d{8}-\d{6}-11111111$/);
    const [first, second] = lines(file);
    expect(first).toMatchObject({
      event: "run.start",
      run: id,
      folder,
      repo: "repo",
      mode: "fresh",
      session: SID,
      agent: null,
    });
    expect(second).toMatchObject({ event: "plan.snapshot", run: id, folder });
    expect(second.units.map((u: { kind: string }) => u.kind)).toEqual([
      "edit",
      "code",
    ]);
  });

  it("a second start appends to the same file under a new run id", async () => {
    const file = startRun();
    const before = lines(file);
    await new Promise((r) => setTimeout(r, 1100));
    expect(startRun("resume")).toBe(file);
    const after = lines(file);
    expect(after.slice(0, before.length)).toEqual(before);
    const starts = after.filter((e) => e.event === "run.start");
    expect(starts).toHaveLength(2);
    expect(starts[1].mode).toBe("resume");
    expect(starts[1].run).not.toBe(starts[0].run);
  });

  it("refuses a mode other than fresh or resume and writes nothing", () => {
    const r = log(["start", "--folder", folder, "--mode", "bad"]);
    expect(r.status).toBe(2);
    expect(existsSync(join(root, "repo"))).toBe(false);
    expect(existsSync(markerOf())).toBe(false);
  });

  it("refuses a folder with no index.json and writes nothing", () => {
    rmSync(join(folder, "index.json"));
    const r = log(["start", "--folder", folder]);
    expect(r.status).toBe(2);
    expect(existsSync(markerOf())).toBe(false);
  });

  it("sweeps nosession and stale markers, keeps fresh ones and every log", () => {
    const active = join(root, "active");
    mkdirSync(active, { recursive: true });
    const oldLog = join(root, "old.jsonl");
    const newLog = join(root, "new.jsonl");
    writeFileSync(oldLog, "{}\n");
    writeFileSync(newLog, "{}\n");
    const past = (Date.now() - 2 * DAY) / 1000;
    utimesSync(oldLog, past, past);
    writeFileSync(join(active, "nosession"), `${newLog}\nr\n`);
    writeFileSync(join(active, "stale"), `${oldLog}\nr\n`);
    writeFileSync(join(active, "gone"), `${join(root, "none.jsonl")}\nr\n`);
    writeFileSync(join(active, "fresh"), `${newLog}\nr\n`);
    startRun();
    expect(existsSync(join(active, "nosession"))).toBe(false);
    expect(existsSync(join(active, "stale"))).toBe(false);
    expect(existsSync(join(active, "gone"))).toBe(false);
    expect(existsSync(join(active, "fresh"))).toBe(true);
    expect(existsSync(markerOf())).toBe(true);
    expect(readFileSync(oldLog, "utf8")).toBe("{}\n");
    expect(readFileSync(newLog, "utf8")).toBe("{}\n");
  });
});

describe("log.mjs event and run", () => {
  it("event appends typed fields to the active run", () => {
    const file = startRun();
    expect(
      log(["event", "phase.start", "--phase", "wave", "--wave", "2", "--late"])
        .status,
    )
      .toBe(0);
    expect(lines(file).at(-1)).toMatchObject({
      event: "phase.start",
      phase: "wave",
      wave: 2,
      late: true,
    });
  });

  it("event with no active run prints the fixed line and exits 0", () => {
    const r = log(["event", "phase.start", "--phase", "wave"]);
    expect(r.status).toBe(0);
    expect(r.stderr).toBe(`log.mjs: no active run in session ${SID}\n`);
  });

  it("run measures the command, logs it, and keeps its exit code", () => {
    const file = startRun();
    const ok = log([
      "run",
      "--tier",
      "wave",
      "--unit",
      "U2",
      "--",
      "sh",
      "-c",
      "exit 0",
    ]);
    const bad = log(["run", "--tier", "plan", "--", "sh", "-c", "exit 3"]);
    expect(ok.status).toBe(0);
    expect(bad.status).toBe(3);
    const gates = lines(file).filter((e) => e.event === "gate");
    expect(gates).toHaveLength(2);
    expect(gates[0]).toMatchObject({
      tier: "wave",
      unit: "U2",
      exit: 0,
      line: "sh -c exit 0",
    });
    expect(gates[1]).toMatchObject({ tier: "plan", exit: 3 });
    expect(typeof gates[0].dur_ms).toBe("number");
  });

  it("a marker removed before the read is no run; run keeps its code", () => {
    startRun();
    const r = log(["run", "--", "sh", "-c", `rm '${markerOf()}'; exit 4`]);
    expect(r.status).toBe(4);
    expect(r.stderr).toBe(`log.mjs: no active run in session ${SID}\n`);
  });

  it("end writes run.end and removes the marker", () => {
    const file = startRun();
    expect(log(["end", "--outcome", "complete"]).status).toBe(0);
    expect(existsSync(markerOf())).toBe(false);
    expect(lines(file).at(-1)).toMatchObject({
      event: "run.end",
      outcome: "complete",
    });
  });
});

describe("log.mjs event row and gap", () => {
  const row = (o: object) => log(["event", "row"], SID, JSON.stringify(o));
  const gap = (o: object) => log(["event", "gap"], SID, JSON.stringify(o));

  it("writes a valid row and a valid stage row", () => {
    const file = startRun();
    expect(
      row({ unit: "U2", wave: 1, status: "green", commit: "1a2b3c4" }).status,
    )
      .toBe(0);
    expect(row({ stage: "ux", status: "skipped", detail: "no UI" }).status)
      .toBe(0);
    expect(
      row({
        unit: "U1",
        wave: 1,
        status: "running",
        range: { from: "a", to: "b" },
      })
        .status,
    )
      .toBe(0);
    const rows = lines(file).filter((e) => e.event === "row");
    expect(rows[0]).toMatchObject({ unit: "U2", status: "green" });
    expect(rows[1]).toMatchObject({ stage: "ux", status: "skipped" });
    expect(rows).toHaveLength(3);
  });

  it.each([
    ["an unknown key", { unit: "U1", wave: 1, status: "green", x: 1 }],
    ["a wrong enum", { unit: "U1", wave: 1, status: "done" }],
    ["both unit and stage", {
      unit: "U1",
      stage: "ux",
      wave: 1,
      status: "green",
    }],
    ["no status", { unit: "U1", wave: 1, commit: "abc" }],
    ["a unit row with no wave", { unit: "U1", status: "green" }],
    ["a bad unit id", { unit: "X1", wave: 1, status: "green" }],
    ["negative rounds", { unit: "U1", wave: 1, status: "green", rounds: -1 }],
  ])("refuses a row with %s and leaves the file unchanged", (_, o) => {
    const file = startRun();
    const before = readFileSync(file, "utf8");
    const r = row(o);
    expect(r.status).not.toBe(0);
    expect(readFileSync(file, "utf8")).toBe(before);
  });

  it("writes a G gap as given and numbers id-less gaps L1, L2", () => {
    const file = startRun();
    const base = { unit: "U1", stage: "", text: "no ruling", state: "open" };
    expect(gap({ id: "G1", ...base, class: "GAP", source: "unit" }).status)
      .toBe(0);
    expect(gap({ ...base, class: "contested", source: "review-row" }).status)
      .toBe(0);
    expect(gap(base).status).toBe(0);
    const gaps = lines(file).filter((e) => e.event === "gap");
    expect(gaps.map((g) => g.id)).toEqual(["G1", "L1", "L2"]);
    expect(gaps[0]).toMatchObject({ class: "GAP", source: "unit" });
    expect(gaps[1]).toMatchObject({ class: "contested", state: "open" });
  });

  it.each([
    ["a bad class", { class: "BUG" }],
    ["a bad source", { source: "nowhere" }],
    ["an unknown key", { extra: true }],
    ["empty text", { text: "" }],
    ["a bad id", { id: "X3" }],
    ["no stage", { stage: undefined }],
  ])("refuses a gap with %s", (_, extra) => {
    const file = startRun();
    const before = readFileSync(file, "utf8");
    const o = { unit: "U1", stage: "", text: "t", state: "open", ...extra };
    expect(gap(o).status).not.toBe(0);
    expect(readFileSync(file, "utf8")).toBe(before);
  });

  it("refuses the old --key forms of gap and unit with exit 2", () => {
    const file = startRun();
    const before = readFileSync(file, "utf8");
    expect(log(["event", "gap", "--class", "GAP", "--text", "x"]).status)
      .toBe(2);
    expect(log(["event", "unit", "--status", "green"]).status).toBe(2);
    expect(readFileSync(file, "utf8")).toBe(before);
  });
});

describe("log.mjs event question and answer", () => {
  const ask = (o: object) => log(["event", "question"], SID, JSON.stringify(o));
  const answer = (o: object) => log(["event", "answer"], SID, JSON.stringify(o));
  const q = {
    id: "Q1",
    unit: "U2",
    text: "Which owner?",
    options: "U2 — keeps it local | U3 — moves it",
    why: "index.md Goal — silent on the owner",
  };

  it("writes a valid question and a valid answer", () => {
    const file = startRun();
    expect(ask(q).status).toBe(0);
    expect(answer({ id: "Q1", decision: "D45" }).status).toBe(0);
    const ev = lines(file).slice(2);
    expect(ev[0]).toMatchObject({ event: "question", ...q });
    expect(ev[1]).toMatchObject({ event: "answer", id: "Q1", decision: "D45" });
  });

  it.each(["W2", "setup", "renders", "acceptance", "ux", "reconcile"])(
    "accepts a question owned by %s",
    (unit) => {
      startRun();
      expect(ask({ ...q, unit }).status).toBe(0);
    },
  );

  it.each([
    ["no id", { id: undefined }],
    ["a bad id", { id: "U1-Q1" }],
    ["a bad unit", { unit: "wave" }],
    ["no options", { options: undefined }],
    ["no why", { why: undefined }],
    ["empty text", { text: "" }],
    ["an unknown key", { extra: 1 }],
  ])("refuses a question with %s", (_, extra) => {
    const file = startRun();
    const before = readFileSync(file, "utf8");
    expect(ask({ ...q, ...extra }).status).not.toBe(0);
    expect(readFileSync(file, "utf8")).toBe(before);
  });

  it.each([
    ["no decision", { id: "Q1" }],
    ["a bad decision", { id: "Q1", decision: "G1" }],
    ["a bad id", { id: "1", decision: "D1" }],
  ])("refuses an answer with %s", (_, o) => {
    const file = startRun();
    const before = readFileSync(file, "utf8");
    expect(answer(o).status).not.toBe(0);
    expect(readFileSync(file, "utf8")).toBe(before);
  });

  it("refuses the --key form of question and answer with exit 2", () => {
    startRun();
    expect(log(["event", "question", "--id", "Q1"]).status).toBe(2);
    expect(log(["event", "answer", "--id", "Q1"]).status).toBe(2);
  });

  it("accepts a gap of class question", () => {
    const file = startRun();
    const r = log(
      ["event", "gap"],
      SID,
      JSON.stringify({
        unit: "U2",
        stage: "",
        text: "QUESTION Q1: Which owner?",
        state: "open",
        class: "question",
      }),
    );
    expect(r.status).toBe(0);
    expect(lines(file).at(-1)).toMatchObject({ class: "question" });
  });

  it("next-question prints Q1, then one past the highest, counting a re-ask once", () => {
    const file = startRun();
    const next = () => log(["next-question"]);
    expect(next().stdout).toBe("Q1\n");
    ask(q);
    ask({ ...q, id: "Q2" });
    const n = lines(file).length;
    expect(next().stdout).toBe("Q3\n");
    expect(lines(file)).toHaveLength(n);
    ask({ ...q, id: "Q2" });
    expect(next().stdout).toBe("Q3\n");
  });

  it("next-question with no active run exits 1", () => {
    const r = log(["next-question"]);
    expect(r.status).toBe(1);
    expect(r.stderr).toBe(`log.mjs: no active run in session ${SID}\n`);
  });
});

describe("log.mjs prune", () => {
  function logFile(name: string, ageDays: number) {
    const f = join(root, "repo", `${name}.jsonl`);
    mkdirSync(join(root, "repo"), { recursive: true });
    writeFileSync(f, "{}\n");
    const t = (Date.now() - ageDays * DAY) / 1000;
    utimesSync(f, t, t);
    return f;
  }

  it("deletes an old archived log only", () => {
    const archived = join(repo, "docs", "plans", "archived");
    for (const d of ["old", "suffixed-2", "fresh", "kept"]) {
      mkdirSync(join(archived, d), { recursive: true });
    }
    const old = logFile("old", 40);
    const suffixed = logFile("suffixed", 40);
    const fresh = logFile("fresh", 5);
    const live = logFile("live", 40);
    const kept = logFile("kept", 40);
    const r = log([
      "prune",
      "--repo",
      repo,
      "--days",
      "30",
      "--keep",
      "kept",
    ]);
    expect(r.status).toBe(0);
    expect(existsSync(old)).toBe(false);
    expect(existsSync(suffixed)).toBe(false);
    expect(existsSync(fresh)).toBe(true);
    expect(existsSync(live)).toBe(true);
    expect(existsSync(kept)).toBe(true);
    expect(r.stdout.trim().split("\n").map((p) => basename(p)).sort()).toEqual([
      "old.jsonl",
      "suffixed.jsonl",
    ]);
  });

  it("needs --repo and --days", () => {
    expect(log(["prune", "--days", "30"]).status).toBe(2);
    expect(log(["prune", "--repo", repo]).status).toBe(2);
  });
});

describe("action-log hook", () => {
  it("does nothing and says nothing when no run is active", () => {
    const r = hook({
      session_id: SID,
      hook_event_name: "PreToolUse",
      tool_name: "Bash",
      tool_input: {},
    });
    expect(r.status).toBe(0);
    expect(r.stdout).toBe("");
  });

  it("ignores a session that holds no marker", () => {
    const file = startRun();
    const n = lines(file).length;
    hook({
      session_id: "other",
      hook_event_name: "PreToolUse",
      tool_name: "Bash",
      tool_input: {},
    });
    expect(lines(file)).toHaveLength(n);
  });

  it("logs tool calls, the agent link and the gap lines", () => {
    const file = startRun();
    const id = lines(file)[0].run;
    const runs = [
      {
        hook_event_name: "PreToolUse",
        tool_name: "Agent",
        tool_use_id: "t1",
        tool_input: {
          subagent_type: "general-purpose",
          description: "U3 docs unit",
        },
      },
      {
        hook_event_name: "SubagentStart",
        agent_id: "a9",
        agent_type: "general-purpose",
      },
      {
        hook_event_name: "PreToolUse",
        agent_id: "a9",
        tool_name: "Bash",
        tool_use_id: "t2",
        tool_input: { command: "echo hi", description: "Say hi" },
      },
      {
        hook_event_name: "PostToolUse",
        agent_id: "a9",
        tool_name: "Bash",
        tool_use_id: "t2",
        duration_ms: 42,
      },
      {
        hook_event_name: "SubagentStop",
        agent_id: "a9",
        agent_type: "general-purpose",
        last_assistant_message: "CHANGED: x\nGAP: the plan named no owner — took U3\nUNRESOLVED: none",
      },
      {
        hook_event_name: "PostToolUse",
        tool_name: "Agent",
        tool_use_id: "t1",
        duration_ms: 900,
        tool_response: { agentId: "a9" },
      },
    ];
    for (const p of runs) {
      expect(hook({ session_id: SID, ...p }).status).toBe(0);
    }
    const ev = lines(file).slice(2);
    expect(ev.map((e) => e.event)).toEqual([
      "tool.start",
      "agent.start",
      "tool.start",
      "tool.end",
      "agent.end",
      "tool.end",
    ]);
    expect(ev.every((e) => e.run === id)).toBe(true);
    expect(ev[0]).toMatchObject({
      agent: null,
      tool: "Agent",
      summary: "general-purpose :: U3 docs unit",
    });
    expect(ev[2]).toMatchObject({ agent: "a9", summary: "Say hi" });
    expect(ev[3]).toMatchObject({ dur_ms: 42 });
    expect(ev[4].gaps).toEqual(["GAP: the plan named no owner — took U3"]);
    expect(ev[5]).toMatchObject({ child: "a9" });

    const s = log(["summary", file]);
    expect(s.status).toBe(0);
    expect(s.stdout).toMatch(/AGENTS/);
    expect(s.stdout).toMatch(/general-purpose :: U3 docs unit/);
    expect(s.stdout).toMatch(/peak 1 at once/);
    expect(s.stdout).toMatch(/GAPS[\s\S]*the plan named no owner/);
  });

  it("copies QUESTION Q<n>: lines like GAP: lines, and not QUESTION: none", () => {
    const file = startRun();
    const stop = (msg: string) =>
      hook({
        session_id: SID,
        hook_event_name: "SubagentStop",
        agent_id: "a1",
        agent_type: "general-purpose",
        last_assistant_message: msg,
      });
    stop(
      "CHANGED: x\nQUESTION Q1: Which owner?\nOPTIONS Q1: a | b\nWHY Q1: w\n"
        + "QUESTION Q2: Which name?\nGAP: took U3",
    );
    stop("CHANGED: y\nQUESTION: none");
    stop("OUTCOME: QUESTION\nQUESTION Q4 U3: Which owner?\nQUESTION Q5 setup: Which pin?");
    const ends = lines(file).filter((e) => e.event === "agent.end");
    expect(ends[0].gaps).toEqual([
      "QUESTION Q1: Which owner?",
      "QUESTION Q2: Which name?",
      "GAP: took U3",
    ]);
    expect(ends[1].gaps).toEqual([]);
    expect(ends[2].gaps).toEqual([
      "QUESTION Q4 U3: Which owner?",
      "QUESTION Q5 setup: Which pin?",
    ]);
  });

  it("SessionEnd appends session.end to the strict schema and drops the marker", () => {
    const file = startRun();
    const id = lines(file)[0].run;
    expect(
      hook({ session_id: SID, hook_event_name: "SessionEnd", reason: "clear" })
        .status,
    )
      .toBe(0);
    expect(existsSync(markerOf())).toBe(false);
    const last = lines(file).at(-1);
    const { ts, run, session, agent, event, ...payload } = last;
    expect({ run, session, agent, event }).toEqual({
      run: id,
      session: SID,
      agent: null,
      event: "session.end",
    });
    expect(typeof ts).toBe("string");
    expect(payload).toEqual({ reason: "clear" });
    expect(check("session.end", payload)).toEqual([]);
  });

  it("SessionEnd with no reason writes other", () => {
    const file = startRun();
    hook({ session_id: SID, hook_event_name: "SessionEnd" });
    expect(lines(file).at(-1)).toMatchObject({
      event: "session.end",
      reason: "other",
    });
  });
});

describe("action-log hook Bash summary", () => {
  function summaryOf(command: string) {
    const file = startRun();
    hook({
      session_id: SID,
      hook_event_name: "PreToolUse",
      tool_name: "Bash",
      tool_use_id: "t1",
      tool_input: { command },
    });
    rmSync(markerOf());
    return lines(file).at(-1).summary;
  }

  it.each([
    ["GITHUB_TOKEN=ghp_abc123 gh pr list", "gh"],
    ["A=1 B='x' MY_API_KEY=k run --flag", "(command)"],
    ["AUTH=\"Bearer sk-live-x\" curl x", "(command)"],
    ["PGPASSWORD='my secret' psql", "(command)"],
    ["PW=\"a b c\" run", "(command)"],
    ["\"/usr/bin/env\" ls", "(command)"],
    ["A=1 run", "run"],
    ["TOKEN=$(echo ghp_x | base64) curl x", "(command)"],
    ["AUTH=`echo pw` curl x", "(command)"],
    ["N=$((1+2)) run", "(command)"],
    ["A=s3cr3t\u00a0tail cmd", "(command)"],
    ["A=1 B=x.y:z run", "run"],
    ["", "(command)"],
    ["export db_password='s3 cr3t'", "export"],
    ["curl -u admin:hunter2 https://x", "curl"],
    ["curl -H 'X-Api-Key: sk_live_1' https://x", "curl"],
    ["curl -H 'Authorization: Bearer abc.def' x", "curl"],
    ["gh auth login --with-token <<< ghp_abc", "gh"],
    ["echo ghp_abc | gh auth login --with-token", "echo"],
    ["mysql -phunter2 db", "mysql"],
    ["git clone https://user:pa55@github.com/o/r", "git"],
    ["  mise x -- mise run code:lint && git status", "mise"],
  ])("logs only the program of %s", (command, want) => {
    expect(summaryOf(command)).toBe(want);
  });

  it("logs no secret value of a command", () => {
    for (const secret of ["ghp_abc", "hunter2", "sk_live_1", "pa55"]) {
      expect(summaryOf(`curl -u u:${secret} ${secret}`)).not.toContain(secret);
    }
    for (
      const command of [
        "AUTH=\"Bearer sk-live-x\" curl x",
        "PGPASSWORD='my secret' psql",
        "PW=\"a b c\" run",
        "T=a\\ secret run",
        "TOKEN=$(echo ghp_x | base64) curl x",
        "AUTH=`echo pw` curl x",
      ]
    ) {
      const got = summaryOf(command);
      for (
        const part of ["sk-live-x", "secret", "b", "Bearer", "ghp_x", "pw"]
      ) {
        expect(got).not.toContain(part);
      }
    }
  });

  it("keeps a description as given", () => {
    const file = startRun();
    hook({
      session_id: SID,
      hook_event_name: "PreToolUse",
      tool_name: "Bash",
      tool_input: { command: "TOKEN=x run", description: "Run it" },
    });
    expect(lines(file).at(-1).summary).toBe("Run it");
  });
});

describe("log.mjs summary", () => {
  it("prints each execution mode and its reason", () => {
    const file = startRun();
    log(["event", "execution", "--mode", "teams"]);
    log(["event", "execution", "--mode", "solo", "--reason", "flag off"]);
    const s = log(["summary", file]);
    expect(s.stdout).toMatch(/EXECUTION teams\n/);
    expect(s.stdout).toMatch(/EXECUTION solo — flag off/);
  });

  it("pairs phases, rows, gaps and totals gates by tier", () => {
    const file = startRun();
    log(["event", "phase.start", "--phase", "wave", "--wave", "1"]);
    log(["run", "--tier", "unit", "--unit", "U1", "--", "sh", "-c", "exit 0"]);
    log(
      ["event", "row"],
      SID,
      JSON.stringify({
        unit: "U1",
        wave: 1,
        status: "green",
        commit: "abc1234",
      }),
    );
    log(
      ["event", "gap"],
      SID,
      JSON.stringify({
        unit: "U1",
        stage: "",
        text: "no ruling",
        state: "open",
        class: "GAP",
        source: "unit",
      }),
    );
    log(["event", "phase.end", "--phase", "wave", "--wave", "1"]);
    log(["end", "--outcome", "blocked"]);
    const s = log(["summary", file]);
    expect(s.stdout).toMatch(/outcome blocked/);
    expect(s.stdout).toMatch(/PHASES[\s\S]*wave\s+1/);
    expect(s.stdout).toMatch(/UNITS[\s\S]*U1\s+edit\s+1\s+green\s+abc1234/);
    expect(s.stdout).toMatch(/GATES[\s\S]*unit\s+U1\s+0/);
    expect(s.stdout).toMatch(/unit \d+s/);
    expect(s.stdout).toMatch(
      /GAPS[\s\S]*L1\s+GAP\s+unit\s+U1\s+open\s+no ruling/,
    );
  });

  it("times a phase from its markers' started and ended when they carry them", () => {
    const file = startRun();
    const now = Date.now();
    const started = new Date(now - 47_000).toISOString();
    const ended = new Date(now - 5_000).toISOString();
    log(["event", "phase.start", "--phase", "checks", "--started", started]);
    log(["event", "phase.end", "--phase", "checks", "--ended", ended]);
    const s = log(["summary", file]);
    expect(s.stdout).toMatch(/PHASES[\s\S]*checks\s+42s/);
  });

  it("times a phase from ts when its markers carry no started or ended", () => {
    const file = startRun();
    log(["event", "phase.start", "--phase", "checks"]);
    log(["event", "phase.end", "--phase", "checks"]);
    const s = log(["summary", file]);
    expect(s.stdout).toMatch(/PHASES[\s\S]*checks\s+0s/);
  });

  const ask = (id: string, text = "Which owner?") =>
    log(
      ["event", "question"],
      SID,
      JSON.stringify({ id, unit: "U1", text, options: "a | b", why: "w" }),
    );
  const answer = (id: string, decision: string) => log(["event", "answer"], SID, JSON.stringify({ id, decision }));

  it("lists one answered and one open question, once for the plan", () => {
    const file = startRun();
    ask("Q1");
    ask("Q2", "Which\nname?");
    answer("Q1", "D45");
    const s = log(["summary", file]);
    expect(s.stdout).toMatch(/QUESTIONS[\s\S]*Q1\s+U1\s+answered: D45\s+Which owner\?/);
    expect(s.stdout).toMatch(/Q2\s+U1\s+open\s+Which name\?/);
    expect(s.stdout.match(/QUESTIONS/g)).toHaveLength(1);
  });

  it("shows a question asked twice, across two runs, then answered, as one line", async () => {
    const file = startRun();
    ask("Q1");
    log(["end", "--outcome", "paused"]);
    await new Promise((r) => setTimeout(r, 1100));
    startRun("resume");
    ask("Q1");
    answer("Q1", "D46");
    answer("Q9", "D47");
    const s = log(["summary", file]);
    expect(s.stdout).toMatch(/RUN 2 of 2/);
    expect(s.stdout.match(/^Q1\s/gm)).toHaveLength(1);
    expect(s.stdout).toMatch(/Q1\s+U1\s+answered: D46/);
    expect(s.stdout).toMatch(/warning: answer Q9 has no earlier question/);
  });

  it("omits the questions section when there is none", () => {
    const file = startRun();
    expect(log(["summary", file]).stdout).not.toMatch(/QUESTIONS/);
  });

  it("reports each run and totals without the pause", () => {
    const file = join(root, "two.jsonl");
    const at = (h: number, m: number) => new Date(Date.UTC(2026, 9, 24, h, m)).toISOString();
    const ev = [
      {
        ts: at(12, 0),
        run: "r1",
        event: "run.start",
        mode: "fresh",
        folder: "f",
      },
      {
        ts: at(12, 10),
        run: "r1",
        event: "gate",
        tier: "unit",
        exit: 0,
        dur_ms: 60000,
        line: "x",
      },
      { ts: at(12, 30), run: "r1", event: "run.end", outcome: "paused" },
      {
        ts: at(14, 45),
        run: "r2",
        event: "run.start",
        mode: "resume",
        folder: "f",
      },
      { ts: at(15, 0), run: "r2", event: "run.end", outcome: "complete" },
    ];
    writeFileSync(file, ev.map((e) => JSON.stringify(e)).join("\n") + "\n");
    const s = log(["summary", file]);
    expect(s.status).toBe(0);
    expect(s.stdout).toMatch(
      /RUN 1 of 2[\s\S]*run r1[\s\S]*span 30m00s, outcome paused/,
    );
    expect(s.stdout).toMatch(
      /RUN 2 of 2[\s\S]*run r2[\s\S]*span 15m00s, outcome complete/,
    );
    expect(s.stdout).toMatch(
      /TOTAL 2 runs: active 45m00s \(paused 2h15m, not counted\); 1 gates/,
    );
  });
});
