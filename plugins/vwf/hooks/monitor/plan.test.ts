import {
  expect,
  test,
} from "claude-code/testing";

import {
  expandHome,
  folderIn,
  gapsOf,
  hostOf,
  isFinished,
  isFollowed,
  isOldFormat,
  joinPath,
  memberPaths,
  parseIndex,
  readFolder,
  replay,
  resolveBase,
  reviewName,
  runningFolders,
  runningRows,
  unitFor,
  unitForAgent,
  unitState,
} from "./plan";

const INDEX = `---
type: vwf-change-plan
---

# Plan — Packs hand off to bootstrap (2026-10-18)

## Status

**RUNNING**

## Units

| Id | Wave | Unit file                                      | Kind   | Owns | Depends on | Status  | Commit   |
| -- | ---- | ---------------------------------------------- | ------ | ---- | ---------- | ------- | -------- |
| U1 | 1    | [01-checker-accepts.md](01-checker-accepts.md) | edit   | a    | —          | green   | abc1234  |
| U2 | 2    | [02-packs.md](02-packs.md)                     | edit   | b    | U1         | pending |          |
| U3 | 3    | [03-review.md](03-review.md)                   | review | —    | U2         | pending |          |

## Run log

| Wave | Unit               | Model | Round | Outcome     | Detail                                | Commit  |
| ---- | ------------------ | ----- | ----- | ----------- | ------------------------------------- | ------- |
| 0    | preflight          | opus  | 1     | pass        | node preflight                        | —       |
| 1    | U1 Checker accepts | opus  | 1     | pass        | node edit                             | abc1234 |
| 2    | U2 Packs           | opus  | 1     | findings(2) | node edit; GAP: pack X has no owner   | —       |

## Gaps surfaced during execution

- **Owns widened — U2.** a file that no unit
  owned, widened by the orchestrator.

## Launch
`;

test("parses the plan title, status, units, run log and gaps", async () => {
  const plan = parseIndex(INDEX);
  expect(plan.title).toBe("Packs hand off to bootstrap (2026-10-18)");
  expect(plan.status).toBe("RUNNING");
  expect(plan.units.map(u => `${u.id}:${u.file}:${u.status}`)).toEqual([
    "U1:01-checker-accepts.md:green",
    "U2:02-packs.md:pending",
    "U3:03-review.md:pending",
  ]);
  expect(plan.log.length).toBe(3);
  expect(plan.gaps).toEqual([
    "**Owns widened — U2.** a file that no unit owned, widened by the orchestrator.",
  ]);
});

test("keeps the open and untagged gaps and leaves out the closed ones", async () => {
  const plan = parseIndex(
    INDEX.replace(
      "- **Owns widened — U2.** a file that no unit\n  owned, widened by the orchestrator.\n",
      "- open · U2 · the plan does not say which wins · took the ruling\n"
        + "- closed · U2 · Owns widened to a nobody-owned file\n"
        + "- Closed · U1 · resolved in round 2\n"
        + "- U1 · an old entry with no state tag\n",
    ),
  );
  expect(plan.gaps).toEqual([
    "open · U2 · the plan does not say which wins · took the ruling",
    "U1 · an old entry with no state tag",
  ]);
  expect(gapsOf("U2", plan).length).toBe(2);
});

test("strips terminal escape sequences from the parsed text", async () => {
  const plan = parseIndex(
    INDEX.replace("node edit;", "node \u001b]0;pwned\u0007\u001b[31medit;"),
  );
  expect(plan.log[2]!.detail).toBe(
    "node ]0;pwned[31medit; GAP: pack X has no owner",
  );
});

test("derives each unit state and its gaps", async () => {
  const plan = parseIndex(INDEX);
  const [u1, u2, u3] = plan.units;
  const running = [{
    id: "a1",
    type: "vwf:execute-coder",
    description: "U3",
    unit: "U3",
    startedAt: 0,
    status: "running",
  }];
  expect(unitState(u1!, plan.log, [])).toBe("green");
  expect(unitState(u2!, plan.log, [])).toBe("findings(2)");
  expect(unitState(u3!, plan.log, running)).toBe("running");
  expect(isFinished("green")).toBe(true);
  expect(isFinished("findings(2)")).toBe(false);
  expect(gapsOf("U2", plan).length).toBe(2);
  expect(gapsOf("U1", plan).length).toBe(0);
});

test("maps a dispatch to its unit and finds folders", async () => {
  const plan = parseIndex(INDEX);
  expect(unitFor("Run unit file docs/plans/x/02-packs.md", plan.units)).toBe(
    "U2",
  );
  expect(unitFor("U3 review", plan.units)).toBe("U3");
  expect(unitFor("U9 nothing", plan.units)).toBe(undefined);
  expect(folderIn("/vwf:execute docs/plans/2026-10-18-retire-tool-config"))
    .toBe("2026-10-18-retire-tool-config");
  expect(folderIn("next")).toBe(undefined);
  const index = `## Plans

| Folder                       | Kind   | Status   |
| ---------------------------- | ------ | -------- |
| docs/plans/2026-10-18-a-plan | change | RUNNING  |
| docs/plans/2026-10-19-b-plan | change | APPROVED |
`;
  expect(runningFolders(index)).toEqual(["2026-10-18-a-plan"]);
});

test("follows unit and wave-review names, and maps a reviewer to its row", async () => {
  const plan = parseIndex(INDEX);
  expect(isFollowed({ name: "U2", type: "general-purpose" }, plan.units))
    .toBe(true);
  expect(isFollowed({ name: "U9", type: "general-purpose" }, plan.units))
    .toBe(false);
  expect(isFollowed({ name: "R1-late", type: "general-purpose" }, plan.units))
    .toBe(true);
  expect(isFollowed({ type: "Explore" }, plan.units)).toBe(false);
  expect(isFollowed({ type: "vwf:execute-coder" }, plan.units)).toBe(true);
  expect(isFollowed({ type: "vwf:execute-runner" }, plan.units)).toBe(false);
  expect(reviewName("R2")).toBe("R2");
  expect(reviewName("R-late")).toBe("R-late");
  expect(reviewName("run-1")).toBe(undefined);
  // The row id comes before the files of the units the row covers.
  expect(
    unitFor(
      "loop U3-late1, round 1: 01-checker-accepts.md",
      plan.units,
      undefined,
      "vwf:execute-code-reviewer",
    ),
  )
    .toBe("U3");
  expect(unitFor("01-checker-accepts.md", plan.units, "U2")).toBe("U2");
});

test("maps a coder by its unit file, not the first unit id in its prompt", async () => {
  const plan = parseIndex(INDEX);
  const prompt =
    "Decisions: | 1 | Matching | … | U1 |\nDepends on U1.\nUnit file: docs/plans/x/03-review.md";
  expect(unitFor(prompt, plan.units, undefined, "vwf:execute-coder"))
    .toBe("U3");
  expect(
    unitFor(prompt, plan.units, undefined, "vwf:execute-security-reviewer"),
  )
    .toBe("U1");
});

test("splits a table row on unescaped pipes only", async () => {
  const plan = parseIndex(
    INDEX.replace("node edit;", "node a \\| b;"),
  );
  expect(plan.log[2]!.detail).toBe("node a | b; GAP: pack X has no owner");
  expect(plan.log[2]!.commit).toBe("—");
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
    })),
  });

test("reads the RUNNING rows of docs/plans/index.json", async () => {
  expect(runningRows(PLANS(["APPROVED", "COMPLETE"])).rows).toEqual([]);
  const one = runningRows(PLANS(["RUNNING", "APPROVED"]));
  expect(one.rows.map(row => row.folder)).toEqual([
    "docs/plans/2026-10-20-plan-0",
  ]);
  expect(one.rows[0]!.target_repo).toBe(null);
  expect(one.problem).toBe(undefined);
  expect(runningRows(PLANS(["RUNNING", "RUNNING"])).rows.length).toBe(2);
  const bad = runningRows("{ not json");
  expect(bad.rows).toEqual([]);
  expect(typeof bad.problem).toBe("string");
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
  status: { state: "RUNNING", detail: "" },
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
    },
  ],
  gaps: [
    { id: "G1", unit: "U2", stage: "", text: "open one", state: "open" },
    { id: "G2", unit: "U1", stage: "", text: "closed one", state: "closed" },
  ],
  run: { worktree: ".worktrees/pane", log: "~/Library/Caches/vwf/r/p.jsonl" },
});

const folder = () => readFolder(FOLDER_JSON).folder!;

test("reads a folder's index.json", async () => {
  const read = readFolder(FOLDER_JSON);
  expect(read.problem).toBe(undefined);
  expect(read.folder!.title).toBe("The [31mpane");
  expect(read.folder!.state).toBe("RUNNING");
  expect(read.folder!.units.map(u => `${u.id}:${u.title}:${u.status}`))
    .toEqual(["U1:The core:green", "U2:The pane:running", "U3:Review:pending"]);
  expect(read.folder!.units[2]!.range).toEqual({ from: "", to: "" });
  expect(read.folder!.run.log).toBe("~/Library/Caches/vwf/r/p.jsonl");
  expect(readFolder(JSON.stringify({ title: "x", run: {} })).folder!.run)
    .toEqual({});
  expect(typeof readFolder("nope").problem).toBe("string");
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

test("replays one run: times, agents, the end", async () => {
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
  ];
  const live = replay(lines, folder());
  expect(live.ended).toBe(false);
  expect(live.noData).toBe(false);
  expect(live.runs.map(run => run.mode)).toEqual(["fresh"]);
  expect(live.session).toBe(SESSION);
  const u1 = live.units[0]!;
  expect(u1.startedAt).toBe(at(6));
  expect(u1.endedAt).toBe(at(8));
  expect(u1.agent!.id).toBe("a1");
  expect(u1.agent!.name).toBe("U1");
  expect(u1.agent!.live).toBe(false);
  expect(live.units[1]!.startedAt).toBe(undefined);
  expect(live.title).toBe("The [31mpane");
  const done = replay(
    [...lines, line("run.end", { outcome: "complete" })],
    folder(),
  );
  expect(done.ended).toBe(true);
});

test("a resume makes the run live again; stop and session.end end it", async () => {
  reset();
  const first = [
    line("run.start", { mode: "fresh" }),
    line("row", { unit: "U2", wave: 2, status: "running" }),
    line("row", { unit: "U2", wave: 2, status: "failed" }),
    line("stop", { reason: "blocked" }),
  ];
  expect(replay(first, folder()).ended).toBe(true);
  expect(replay(first, folder()).units[1]!.endedAt).toBe(at(3));
  const resumed = [
    ...first,
    line("run.start", { mode: "resume", session: "bbbbbbbb-2222" }),
    line("row", { unit: "U2", wave: 2, status: "running" }),
  ];
  const state = replay(resumed, folder());
  expect(state.ended).toBe(false);
  expect(state.runs.length).toBe(2);
  expect(state.session).toBe("bbbbbbbb-2222");
  // D18: the first start stays, the end empties until it ends again.
  expect(state.units[1]!.startedAt).toBe(at(2));
  expect(state.units[1]!.endedAt).toBe(undefined);
  // A session.end of another session does not end the run; its own does.
  expect(
    replay([...resumed, line("session.end", { reason: "other" })], folder())
      .ended,
  )
    .toBe(false);
  expect(
    replay(
      [
        ...resumed,
        line("session.end", { session: "bbbbbbbb-2222", reason: "clear" }),
      ],
      folder(),
    )
      .ended,
  )
    .toBe(true);
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
  // No running row: the start is the agent's agent.start.
  expect(state.units[1]!.startedAt).toBe(at(3));
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
  expect(u2.startedAt).toBe(at(4));
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
  const empty = replay([], folder());
  expect(empty.noData).toBe(true);
  expect(empty.ended).toBe(false);
  expect(empty.units.map(u => u.startedAt)).toEqual([
    undefined,
    undefined,
    undefined,
  ]);
  expect(empty.units.map(u => u.title)).toEqual([
    "The core",
    "The pane",
    "Review",
  ]);
});

test("a unit with neither a running row nor an agent.start shows no start time", async () => {
  reset();
  // The Agent call and its child are in the tail; its agent.start is not.
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
  expect(u3.startedAt).toBe(undefined);
});

test("a tail with no run.start: live unless it ends, session from its last line", async () => {
  reset();
  const tail = [
    line("row", { unit: "U2", wave: 2, status: "running" }),
    line("tool.start", {
      tool: "Bash",
      tool_use_id: "b1",
      summary: "ls",
      session: "cccccccc-3333",
    }),
  ];
  const state = replay(tail, folder(), { partial: true });
  expect(state.partial).toBe(true);
  expect(state.ended).toBe(false);
  expect(state.runs).toEqual([]);
  expect(state.session).toBe("cccccccc-3333");
  expect(state.units[1]!.startedAt).toBe(at(1));
  expect(state.units[0]!.startedAt).toBe(undefined);
  expect(
    replay(
      [...tail, line("session.end", { session: "cccccccc-3333" })],
      folder(),
    )
      .ended,
  )
    .toBe(true);
  expect(
    replay([...tail, line("run.end", { outcome: "paused" })], folder()).ended,
  )
    .toBe(true);
});
