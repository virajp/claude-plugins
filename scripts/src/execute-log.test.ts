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
  return readFileSync(file, "utf8").trim().split("\n").map(l => JSON.parse(l));
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
    expect(second.units.map((u: { kind: string; }) => u.kind)).toEqual([
      "edit",
      "code",
    ]);
  });

  it("a second start appends to the same file under a new run id", async () => {
    const file = startRun();
    const before = lines(file);
    await new Promise(r => setTimeout(r, 1100));
    expect(startRun("resume")).toBe(file);
    const after = lines(file);
    expect(after.slice(0, before.length)).toEqual(before);
    const starts = after.filter(e => e.event === "run.start");
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
    const gates = lines(file).filter(e => e.event === "gate");
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
    const rows = lines(file).filter(e => e.event === "row");
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
    const gaps = lines(file).filter(e => e.event === "gap");
    expect(gaps.map(g => g.id)).toEqual(["G1", "L1", "L2"]);
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
    expect(r.stdout.trim().split("\n").map(p => basename(p)).sort()).toEqual([
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
        last_assistant_message:
          "CHANGED: x\nGAP: the plan named no owner — took U3\nUNRESOLVED: none",
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
    expect(ev.map(e => e.event)).toEqual([
      "tool.start",
      "agent.start",
      "tool.start",
      "tool.end",
      "agent.end",
      "tool.end",
    ]);
    expect(ev.every(e => e.run === id)).toBe(true);
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

describe("action-log hook redaction", () => {
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
    ["GITHUB_TOKEN=ghp_abc123 gh pr list", "GITHUB_TOKEN=*** gh pr list"],
    ["export db_password='s3 cr3t'", "export db_password=***"],
    [
      "MY_API_KEY=\"k\" API_SECRET=x AUTH=y PASS=z run",
      "MY_API_KEY=*** API_SECRET=*** AUTH=*** PASS=*** run",
    ],
    ["cli --token abc123 go", "cli --token *** go"],
    ["cli --password=hunter2", "cli --password=***"],
    ["cli --secret 's x' --api-key=k1", "cli --secret *** --api-key=***"],
    [
      "curl -H 'Authorization: Bearer abc.def' x",
      "curl -H 'Authorization: Bearer ***' x",
    ],
    [
      "curl -H \"Authorization: Basic dXNlcjpw\"",
      "curl -H \"Authorization: Basic ***\"",
    ],
    ["http get x 'bearer zzz'", "http get x 'bearer ***'"],
    [
      "git clone https://user:pa55@github.com/o/r",
      "git clone https://***@github.com/o/r",
    ],
  ])("redacts %s", (command, want) => {
    const got = summaryOf(command);
    expect(got).toBe(want);
  });

  it("leaves a plain command unchanged", () => {
    const command = "mise x -- mise run code:lint && git status --short";
    expect(summaryOf(command)).toBe(command);
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

  it("reports each run and totals without the pause", () => {
    const file = join(root, "two.jsonl");
    const at = (h: number, m: number) =>
      new Date(Date.UTC(2026, 9, 24, h, m)).toISOString();
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
    writeFileSync(file, ev.map(e => JSON.stringify(e)).join("\n") + "\n");
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
