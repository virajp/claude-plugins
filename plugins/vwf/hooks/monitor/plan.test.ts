import {
  expect,
  test,
} from "claude-code/testing";

import {
  expandHome,
  folderIn,
  FRESH_MS,
  hostOf,
  isOldFormat,
  joinPath,
  memberPaths,
  phaseOf,
  readFolder,
  replay,
  resolveBase,
  reviewName,
  runningRows,
  time,
  unitForAgent,
} from "./plan";

test("finds folders and wave-review names", async () => {
  expect(folderIn("/vwf:execute docs/plans/2026-10-18-retire-tool-config"))
    .toBe("2026-10-18-retire-tool-config");
  expect(folderIn("next")).toBe(undefined);
  expect(reviewName("R2")).toBe("R2");
  expect(reviewName("R-late")).toBe("R-late");
  expect(reviewName("run-1")).toBe(undefined);
});

test("maps a reviewer by its row, and a coder by its unit file", async () => {
  const units = [
    { id: "U1", file: "01-checker-accepts.md" },
    { id: "U2", file: "02-packs.md" },
    { id: "U3", file: "03-review.md" },
  ];
  expect(
    unitForAgent(
      "vwf:execute-code-reviewer",
      undefined,
      units,
      "loop U3-late1, round 1: 01-checker-accepts.md",
    ),
  )
    .toBe("U3");
  const prompt =
    "Decisions: | 1 | Matching | … | U1 |\nDepends on U1.\nUnit file: docs/plans/x/03-review.md";
  expect(unitForAgent("vwf:execute-coder", undefined, units, prompt))
    .toBe("U3");
  expect(
    unitForAgent("vwf:execute-security-reviewer", undefined, units, prompt),
  )
    .toBe("U1");
  expect(unitForAgent("vwf:execute-runner", undefined, units, prompt))
    .toBe(undefined);
  expect(unitForAgent("general-purpose", "U2", units)).toBe("U2");
  expect(unitForAgent("general-purpose", "U9", units)).toBe(undefined);
});

test("reads members and the host, and resolves the base repo", async () => {
  expect(
    memberPaths(`topology: multi-repo
members:
  - name: api
    path: ../api # the API
  - name: app
    path: "../app"
other:
  path: nope
`),
  )
    .toEqual(["../api", "../app"]);
  // A sequence with no indent is valid YAML.
  expect(memberPaths("members:\n- name: api\n  path: ../api\n- path: ../app\n"))
    .toEqual(["../api", "../app"]);
  expect(hostOf("vwf_membership: 1\nhost: ../product\n")).toBe("../product");
  expect(joinPath("/w/api", "../product")).toBe("/w/product");
  // A worktree of a member: its main checkout, then the host.
  const files: Record<string, string> = {
    "/w/api/.config/vwf-membership.yaml": "host: ../product\n",
    "/w/product/.config/vwf.yaml": "members: []\n",
  };
  const base = await resolveBase("/w/api/.worktrees/x", {
    read: async path => files[path],
    git: async (cwd, args) =>
      args.includes("--show-toplevel")
        ? `${cwd}\n`
        : cwd.startsWith("/w/api")
        ? "/w/api/.git\n"
        : undefined,
  });
  expect(base).toBe("/w/product");
});

// The JSON plan format and the action log.

const T0 = "2026-10-25T09:30:00.000Z";
const T1 = "2026-10-25T09:40:00.000Z";
const T2 = "2026-10-25T09:50:00.000Z";

const PLANS = (statuses: string[]) =>
  JSON.stringify({
    format: 1,
    plans: statuses.map((status, i) => ({
      id: `P${i + 1}`,
      folder: `docs/plans/2026-10-2${i}-plan-${i}`,
      kind: "change",
      title: `Plan ${i}`,
      target_repo: null,
      priority: i,
      status,
      gaps: null,
      requires: [],
      backlog: [],
      backlog_pieces: [],
      started: status === "RUNNING" ? T0 : "",
      ended: "",
    })),
  });

test("reads the RUNNING rows of docs/plans/index.json", async () => {
  expect(runningRows(PLANS(["APPROVED", "COMPLETE"])).rows).toEqual([]);
  const one = runningRows(PLANS(["RUNNING", "APPROVED"]));
  expect(one.rows.map(row => row.folder)).toEqual([
    "docs/plans/2026-10-20-plan-0",
  ]);
  expect(one.rows[0]!.target_repo).toBe(null);
  expect(one.rows[0]!.status).toBe("RUNNING");
  expect(one.rows[0]!.started).toBe(T0);
  expect(one.rows[0]!.ended).toBe("");
  expect(one.problem).toBe(undefined);
  expect(runningRows(PLANS(["RUNNING", "RUNNING"])).rows.length).toBe(2);
  // A row from before the times: both read "".
  const old = runningRows(
    JSON.stringify({
      plans: [{ folder: "docs/plans/x", status: "RUNNING", started: 5 }],
    }),
  );
  expect(old.rows[0]!.started).toBe("");
  expect(old.rows[0]!.ended).toBe("");
  const bad = runningRows("{ not json");
  expect(bad.rows).toEqual([]);
  expect(typeof bad.problem).toBe("string");
});

test("strips control characters from a malformed JSON's problem", async () => {
  const bad = "{\"title\": \u001b]0;pwned\u0007\u001b[31m}";
  // eslint-disable-next-line no-control-regex
  const control = /[\u0000-\u0008\u000b-\u001f\u007f-\u009f]/;
  const plan = runningRows(bad).problem ?? "";
  const folder = readFolder(bad).problem ?? "";
  expect(plan).not.toBe("");
  expect(folder).not.toBe("");
  expect(control.test(plan)).toBe(false);
  expect(control.test(folder)).toBe(false);
});

test("tells the old markdown format apart", async () => {
  expect(isOldFormat({ indexMd: true })).toBe(true);
  expect(isOldFormat({ indexMd: false, folderMd: true, folderJson: false }))
    .toBe(true);
  expect(isOldFormat({ indexMd: false, folderMd: true, folderJson: true }))
    .toBe(false);
  expect(isOldFormat({ indexMd: false })).toBe(false);
});

test("expands a leading ~/ only", async () => {
  expect(expandHome("~/Library/Caches/vwf/r/p.jsonl", "/Users/me")).toBe(
    "/Users/me/Library/Caches/vwf/r/p.jsonl",
  );
  expect(expandHome("/tmp/~/x", "/Users/me")).toBe("/tmp/~/x");
});

const FOLDER_JSON = JSON.stringify({
  format: 1,
  title: "The \u001b[31mpane",
  status: { state: "RUNNING", detail: "wave \u001b[2" },
  units: [
    {
      id: "U1",
      title: "The core",
      wave: 1,
      file: "01-core.md",
      kind: "edit",
      status: "green",
      commit: "abc1234",
      rounds: 1,
      started: T0,
      ended: T1,
    },
    {
      id: "U2",
      title: "The pane",
      wave: 2,
      file: "02-pane.md",
      kind: "edit",
      status: "running",
      commit: "",
      rounds: 0,
      // Re-run: the first start stays, the end is cleared (T4).
      started: T0,
      ended: "",
    },
    {
      id: "U3",
      title: "Review",
      wave: 3,
      file: "03-review.md",
      kind: "review",
      status: "pending",
      commit: "",
      rounds: 0,
      range: { from: "", to: "" },
      started: "",
      ended: "",
    },
  ],
  waves: [
    { id: "W1", status: "green", started: T0, ended: T1 },
    { id: "W2", status: "running", started: T1, ended: "" },
    { id: "W3", status: "pending", started: "", ended: "" },
  ],
  stages: {
    renders: { state: "skipped", detail: "no covers", started: "", ended: T2 },
    acceptance: { state: "running", detail: "", started: T2, ended: "" },
  },
  gaps: [
    { id: "G1", unit: "U2", stage: "", text: "open one", state: "open" },
    { id: "G2", unit: "U1", stage: "", text: "closed one", state: "closed" },
  ],
  run: { worktree: ".worktrees/pane", log: "~/Library/Caches/vwf/r/p.jsonl" },
});

const folder = () => readFolder(FOLDER_JSON).folder!;

test("reads a folder's index.json, its units, waves and stages with their times", async () => {
  const read = readFolder(FOLDER_JSON);
  expect(read.problem).toBe(undefined);
  const f = read.folder!;
  expect(f.title).toBe("The [31mpane");
  expect(f.state).toBe("RUNNING");
  expect(f.detail).toBe("wave [2");
  expect(f.units.map(u => `${u.id}:${u.title}:${u.status}`))
    .toEqual(["U1:The core:green", "U2:The pane:running", "U3:Review:pending"]);
  expect(f.units.map(u => [u.started, u.ended])).toEqual([
    [T0, T1],
    [T0, ""],
    ["", ""],
  ]);
  expect(f.units[2]!.range).toEqual({ from: "", to: "" });
  expect(f.waves).toEqual([
    { id: "W1", status: "green", started: T0, ended: T1 },
    { id: "W2", status: "running", started: T1, ended: "" },
    { id: "W3", status: "pending", started: "", ended: "" },
  ]);
  expect(f.stages).toEqual([
    { name: "renders", state: "skipped", started: "", ended: T2 },
    { name: "acceptance", state: "running", started: T2, ended: "" },
  ]);
  expect(f.run.log).toBe("~/Library/Caches/vwf/r/p.jsonl");
  expect(readFolder(JSON.stringify({ title: "x", run: {} })).folder!.run)
    .toEqual({});
  expect(typeof readFolder("nope").problem).toBe("string");
});

test("a folder lacking the time keys and the waves list still reads", async () => {
  const old = readFolder(JSON.stringify({
    title: "Old",
    status: { state: "RUNNING" },
    units: [{ id: "U1", title: "x", wave: 1, status: "green", started: 7 }],
    stages: { ux: { state: "skipped" } },
    gaps: [],
    run: {},
  }))
    .folder!;
  expect(old.detail).toBe("");
  expect(old.units[0]!.started).toBe("");
  expect(old.units[0]!.ended).toBe("");
  expect(old.waves).toEqual([]);
  expect(old.stages).toEqual([
    { name: "ux", state: "skipped", started: "", ended: "" },
  ]);
});

test("reads a time string; \"\" and junk read as none", async () => {
  expect(time(T0)).toBe(Date.parse(T0));
  expect(time("")).toBe(undefined);
  expect(time("soon")).toBe(undefined);
  expect(time(5)).toBe(undefined);
});

test("T8: live, paused or stopped, ended", async () => {
  const now = Date.parse("2026-10-25T10:00:00Z");
  const base = { state: "RUNNING", rowStatus: "RUNNING", now };
  // A live agent keeps it live, however old the log.
  expect(phaseOf({ ...base, hasLiveAgent: true, lastAt: now - FRESH_MS * 3 }))
    .toBe("live");
  // A last line under FRESH_MS old keeps it live.
  expect(phaseOf({ ...base, hasLiveAgent: false, lastAt: now - FRESH_MS + 1 }))
    .toBe("live");
  expect(phaseOf({ ...base, hasLiveAgent: false, lastAt: now - FRESH_MS }))
    .toBe("paused");
  // No log line yet: the row's start stands in.
  expect(phaseOf({ ...base, hasLiveAgent: false, rowStarted: now - 1000 }))
    .toBe("live");
  expect(phaseOf({ ...base, hasLiveAgent: false })).toBe("paused");
  // BLOCKED or COMPLETE (folder), COMPLETE (row): ended, live agent or not.
  expect(phaseOf({ ...base, state: "BLOCKED", hasLiveAgent: true }))
    .toBe("ended");
  expect(phaseOf({ ...base, state: "COMPLETE", hasLiveAgent: false }))
    .toBe("ended");
  expect(phaseOf({ ...base, rowStatus: "COMPLETE", hasLiveAgent: true }))
    .toBe("ended");
});

const SESSION = "aaaaaaaa-1111";
let clock = Date.parse("2026-10-25T10:00:00Z");
const line = (event: string, extra: Record<string, unknown> = {}) =>
  JSON.stringify({
    ts: new Date(clock += 1000).toISOString(),
    run: "20261025-100000-aaaaaaaa",
    session: SESSION,
    agent: null,
    event,
    ...extra,
  });
const at = (n: number) => Date.parse("2026-10-25T10:00:00Z") + n * 1000;
const reset = () => {
  clock = Date.parse("2026-10-25T10:00:00Z");
};

test("replays the agents, the session and the last line's ts; the times are the folder's", async () => {
  reset();
  const lines = [
    line("run.start", { mode: "fresh" }), // 1
    line("plan.snapshot", { units: [] }), // 2
    line("tool.start", {
      tool: "Agent",
      tool_use_id: "t1",
      summary: "general-purpose :: U1 :: The core [bg]",
    }), // 3
    line("tool.end", { tool: "Agent", tool_use_id: "t1", child: "a1" }), // 4
    line("agent.start", { agent: "a1", agent_type: "general-purpose" }), // 5
    line("row", { unit: "U1", wave: 1, status: "running" }), // 6
    line("agent.end", { agent: "a1", agent_type: "general-purpose" }), // 7
    line("row", { unit: "U1", wave: 1, status: "green", commit: "abc" }), // 8
    line("run.end", { outcome: "complete" }), // 9
  ];
  const state = replay(lines, folder());
  expect(state.noData).toBe(false);
  expect(state.session).toBe(SESSION);
  expect(state.lastAt).toBe(at(9));
  expect(state.live).toEqual([]);
  const u1 = state.units[0]!;
  expect([u1.started, u1.ended]).toEqual([T0, T1]);
  expect(u1.agent!.id).toBe("a1");
  expect(u1.agent!.name).toBe("U1");
  expect(u1.agent!.live).toBe(false);
  expect(state.units[1]!.started).toBe(T0);
  expect(state.units[1]!.ended).toBe("");
  expect(state.waves.map(wave => wave.status)).toEqual([
    "green",
    "running",
    "pending",
  ]);
  expect(state.stages.map(stage => stage.name)).toEqual([
    "renders",
    "acceptance",
  ]);
  expect(state.detail).toBe("wave [2");
  expect(state.title).toBe("The [31mpane");
});

test("the session is the last run.start's, else the last line's", async () => {
  reset();
  const resumed = [
    line("run.start", { mode: "fresh" }),
    line("stop", { reason: "blocked" }),
    line("run.start", { mode: "resume", session: "bbbbbbbb-2222" }),
    line("tool.start", { tool: "Bash", tool_use_id: "b1", summary: "ls" }),
  ];
  expect(replay(resumed, folder()).session).toBe("bbbbbbbb-2222");
  const tail = [
    line("tool.start", {
      tool: "Bash",
      tool_use_id: "b1",
      summary: "ls",
      session: "cccccccc-3333",
    }),
  ];
  const state = replay(tail, folder(), { partial: true });
  expect(state.partial).toBe(true);
  expect(state.session).toBe("cccccccc-3333");
});

test("takes status and gaps from the folder, never from row or gap events", async () => {
  reset();
  const lines = [
    line("run.start", { mode: "fresh" }),
    line("gap", {
      id: "L1",
      unit: "U3",
      stage: "",
      text: "log gap",
      state: "open",
    }),
    line("gap", {
      id: "G1",
      unit: "U2",
      stage: "",
      text: "open one",
      state: "closed",
    }),
    line("row", { unit: "U3", wave: 3, status: "green" }),
  ];
  const state = replay(lines, folder());
  expect(state.units.map(u => u.status)).toEqual([
    "green",
    "running",
    "pending",
  ]);
  expect(state.units[2]!.started).toBe("");
  expect(state.gaps.map(gap => gap.id)).toEqual(["G1"]);
});

test("ties a foreground agent before tool.end, and a reviewer by its row", async () => {
  reset();
  const lines = [
    line("run.start", { mode: "fresh" }),
    line("tool.start", {
      tool: "Agent",
      tool_use_id: "t2",
      summary: "vwf:execute-coder :: U2 :: The pane",
    }),
    line("agent.start", { agent: "a2", agent_type: "vwf:execute-coder" }),
    line("tool.start", {
      tool: "Agent",
      tool_use_id: "t3",
      summary: "vwf:execute-security-reviewer :: review U3 over 01-core.md",
    }),
    line("tool.start", {
      tool: "Agent",
      tool_use_id: "t4",
      summary: "general-purpose :: R1 :: wave review",
    }),
    line("tool.start", {
      tool: "Agent",
      tool_use_id: "t5",
      summary: "Explore :: find U1 things",
    }),
    line("tool.end", { tool: "Agent", tool_use_id: "t3", child: "a3" }),
    line("tool.end", { tool: "Agent", tool_use_id: "t4", child: "a4" }),
    line("tool.end", { tool: "Agent", tool_use_id: "t5", child: "a5" }),
    line("agent.start", {
      agent: "a3",
      agent_type: "vwf:execute-security-reviewer",
    }),
    line("agent.start", { agent: "a4", agent_type: "general-purpose" }),
  ];
  const state = replay(lines, folder());
  expect(state.units[1]!.agent!.id).toBe("a2");
  expect(state.units[1]!.agent!.live).toBe(true);
  expect(state.units[1]!.agent!.startedAt).toBe(at(3));
  expect(state.units[2]!.agent!.id).toBe("a3");
  expect(state.units[2]!.agent!.name).toBe(undefined);
  expect(state.reviews["R1"]!.id).toBe("a4");
  expect(state.units[0]!.agent).toBe(undefined);
  expect(state.live.sort()).toEqual(["a2", "a3", "a4"]);
  expect(unitForAgent("general-purpose", "U2-late1-2", folder().units)).toBe(
    "U2",
  );
  expect(unitForAgent("Explore", undefined, folder().units, "02-pane.md"))
    .toBe(undefined);
});

test("a unit with several agents shows the latest", async () => {
  reset();
  const lines = [
    line("run.start", { mode: "fresh" }),
    line("tool.start", {
      tool: "Agent",
      tool_use_id: "t1",
      summary: "general-purpose :: U2 :: one",
    }),
    line("tool.end", { tool: "Agent", tool_use_id: "t1", child: "old" }),
    line("agent.start", { agent: "old" }),
    line("agent.end", { agent: "old" }),
    line("tool.start", {
      tool: "Agent",
      tool_use_id: "t2",
      summary: "general-purpose :: U2-late1 :: two",
    }),
    line("tool.end", { tool: "Agent", tool_use_id: "t2", child: "new" }),
    line("agent.start", { agent: "new" }),
  ];
  const u2 = replay(lines, folder()).units[1]!;
  expect(u2.agent!.id).toBe("new");
  expect(u2.agent!.live).toBe(true);
});

test("skips a bad line, and says no run data with no lines", async () => {
  reset();
  const state = replay([
    line("run.start", { mode: "fresh" }),
    "{ broken",
    "",
    "[1]",
  ], folder());
  expect(state.skipped).toBe(2);
  expect(state.noData).toBe(false);
  expect(state.lastAt).toBe(at(1));
  const empty = replay([], folder());
  expect(empty.noData).toBe(true);
  expect(empty.lastAt).toBe(undefined);
  expect(empty.session).toBe(undefined);
  // D23: no log yet, the plan still shows from index.json, times included.
  expect(empty.units.map(u => `${u.title}:${u.started}`)).toEqual([
    `The core:${T0}`,
    `The pane:${T0}`,
    "Review:",
  ]);
  expect(empty.waves.length).toBe(3);
});

test("an agent whose agent.start is not in the tail has no start, and is not live", async () => {
  reset();
  const tail = [
    line("tool.start", {
      tool: "Agent",
      tool_use_id: "t1",
      summary: "general-purpose :: U3 :: review [bg]",
    }),
    line("tool.end", { tool: "Agent", tool_use_id: "t1", child: "a3" }),
  ];
  const u3 = replay(tail, folder(), { partial: true }).units[2]!;
  expect(u3.agent!.id).toBe("a3");
  expect(u3.agent!.startedAt).toBe(undefined);
  expect(u3.agent!.live).toBe(false);
});
