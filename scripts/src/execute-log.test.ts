/**
 * vwf's /vwf:execute action log, run for real: `log.mjs`, the orchestrator's
 * writer, and the `action-log.sh` hook with its node half, over a temp log
 * root ($VWF_LOG_ROOT) so nothing lands in /tmp/vwf.
 */
import { spawnSync } from "node:child_process";
import {
  existsSync,
  mkdtempSync,
  readFileSync,
  rmSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
} from "vitest";

const VWF = join(import.meta.dirname, "..", "..", "plugins", "vwf");
const LOG = join(VWF, "skills", "execute", "scripts", "log.mjs");
const HOOK = join(VWF, "hooks", "action-log.sh");
const SID = "11111111-2222-3333-4444-555555555555";

let root: string;

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), "vwf-log-"));
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

function log(args: string[], session = SID) {
  return spawnSync("node", [LOG, ...args], {
    env: env(session),
    encoding: "utf8",
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

function startRun() {
  const r = log([
    "start",
    "--folder",
    "docs/plans/2026-10-24-x/",
    "--mode",
    "fresh",
  ]);
  expect(r.status).toBe(0);
  return r.stdout.trim();
}

describe("log.mjs", () => {
  it("start writes the run file and the session marker", () => {
    const file = startRun();
    expect(file.startsWith(join(root))).toBe(true);
    expect(file).toMatch(/\/2026-10-24-x\/\d{8}-\d{6}-11111111\.jsonl$/);
    expect(readFileSync(join(root, "active", SID), "utf8").trim()).toBe(file);
    const [first] = lines(file);
    expect(first).toMatchObject({
      event: "run.start",
      folder: "docs/plans/2026-10-24-x",
      mode: "fresh",
      session: SID,
      agent: null,
    });
  });

  it("event appends typed fields to the active run", () => {
    const file = startRun();
    expect(
      log([
        "event",
        "phase.start",
        "--phase",
        "wave",
        "--wave",
        "2",
        "--late",
        "false",
      ])
        .status,
    )
      .toBe(0);
    const last = lines(file).at(-1);
    expect(last).toMatchObject({
      event: "phase.start",
      phase: "wave",
      wave: 2,
      late: false,
    });
  });

  it("event with no active run warns and exits 0", () => {
    const r = log(["event", "phase.start", "--phase", "wave"]);
    expect(r.status).toBe(0);
    expect(r.stderr).toMatch(/no active run/);
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

  it("run with no active run still runs the command", () => {
    const r = log(["run", "--", "sh", "-c", "exit 4"]);
    expect(r.status).toBe(4);
  });

  it("end writes run.end and removes the marker", () => {
    const file = startRun();
    expect(log(["end", "--outcome", "complete"]).status).toBe(0);
    expect(existsSync(join(root, "active", SID))).toBe(false);
    expect(lines(file).at(-1)).toMatchObject({
      event: "run.end",
      outcome: "complete",
    });
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
    hook({
      session_id: "other",
      hook_event_name: "PreToolUse",
      tool_name: "Bash",
      tool_input: {},
    });
    expect(lines(file)).toHaveLength(1);
  });

  it("logs tool calls, the agent link and the gap lines", () => {
    const file = startRun();
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
    const ev = lines(file).slice(1);
    expect(ev.map(e => e.event)).toEqual([
      "tool.start",
      "agent.start",
      "tool.start",
      "tool.end",
      "agent.end",
      "tool.end",
    ]);
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
});

describe("log.mjs summary", () => {
  it("pairs phases and totals gates by tier", () => {
    const file = startRun();
    log(["event", "phase.start", "--phase", "wave", "--wave", "1"]);
    log(["run", "--tier", "unit", "--unit", "U1", "--", "sh", "-c", "exit 0"]);
    log([
      "event",
      "gap",
      "--class",
      "GAP",
      "--source",
      "unit",
      "--unit",
      "U1",
      "--text",
      "no ruling",
    ]);
    log(["event", "phase.end", "--phase", "wave", "--wave", "1"]);
    log(["end", "--outcome", "blocked"]);
    const s = log(["summary", file]);
    expect(s.stdout).toMatch(/outcome blocked/);
    expect(s.stdout).toMatch(/PHASES[\s\S]*wave\s+1/);
    expect(s.stdout).toMatch(/GATES[\s\S]*unit\s+U1\s+0/);
    expect(s.stdout).toMatch(/unit \d+s/);
    expect(s.stdout).toMatch(/GAPS[\s\S]*no ruling/);
  });
});
