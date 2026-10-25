import type { On } from "claude-code";
import {
  expect,
  mock,
  test,
} from "claude-code/testing";

// The environment has it; the types laid for a hooks module do not.
declare const setTimeout: (fn: () => void, ms: number) => unknown;

const A = "2026-10-25-a-plan";
const B = "2026-10-25-b-plan";
const MAIN = "/repo";
const HOME = "/home/me";
const SESSION = "aaaaaaaa-1111";
const NOW = Date.parse("2026-10-25T10:00:00Z");
const PATIENCE_MS = 10 * 60 * 1000;
const iso = (ms: number) => new Date(ms).toISOString();
// The plan's claim, a unit's start and a unit's end, as the JSON holds them.
const CLAIMED = iso(NOW - 30 * 60_000);
const STARTED = iso(NOW - 20 * 60_000);
const ENDED = iso(NOW - 10 * 60_000);
const FINAL = ["green", "failed", "unresolved", "skipped"];
/** The pane's HH:MM of an ISO time, in local time like the pane. */
const hhmm = (time: string) => {
  const d = new Date(time);

  return `${String(d.getHours()).padStart(2, "0")}:${
    String(d.getMinutes()).padStart(2, "0")
  }`;
};

const plans = (...rows: [string, string, string?][]) =>
  JSON.stringify({
    format: 1,
    plans: rows.map(([folder, status, target], i) => ({
      id: folder,
      folder: `docs/plans/${folder}`,
      kind: target === undefined ? "change" : "cycle",
      title: folder,
      target_repo: target ?? null,
      priority: i,
      status,
      gaps: null,
      requires: [],
      backlog: [],
      backlog_pieces: [],
      started: status === "APPROVED" ? "" : CLAIMED,
      ended: status === "COMPLETE" ? ENDED : "",
    })),
  });

const logOf = (folder: string) =>
  `${HOME}/Library/Caches/vwf/repo/${folder}.jsonl`;

const plan = (
  title: string,
  statuses: string[],
  run: Record<string, string> = {
    worktree: `.worktrees/${title}`,
    log: `~/Library/Caches/vwf/repo/${title}.jsonl`,
  },
  status = { state: "RUNNING", detail: "" },
) => {
  // A unit past pending has started; a final one has ended. Wave n is unit n.
  const times = (one: string) => ({
    started: one === "pending" ? "" : STARTED,
    ended: FINAL.includes(one) ? ENDED : "",
  });

  return JSON.stringify({
    format: 1,
    title,
    status,
    units: statuses.map((one, i) => ({
      id: `U${i + 1}`,
      title: `Unit ${i + 1}`,
      wave: i + 1,
      file: `0${i + 1}-u.md`,
      kind: "edit",
      status: one,
      commit: "",
      rounds: 0,
      ...times(one),
    })),
    waves: statuses.map((one, i) => ({
      id: `W${i + 1}`,
      status: one,
      ...times(one),
    })),
    stages: {
      reconcile: { state: "pending", detail: "", started: "", ended: "" },
    },
    gaps: [],
    run,
  });
};

let ts = NOW - 60_000;
const line = (event: string, extra: Record<string, unknown> = {}) =>
  JSON.stringify({
    ts: new Date(ts += 1000).toISOString(),
    run: "20261025-095900-aaaaaaaa",
    session: SESSION,
    agent: null,
    event,
    ...extra,
  }) + "\n";
const agent = (id: string, type: string, name: string, description = "x") =>
  line("tool.start", {
    tool: "Agent",
    tool_use_id: `t-${id}`,
    summary: `${type} :: ${name} :: ${description}`,
  })
  + line("tool.end", { tool: "Agent", tool_use_id: `t-${id}`, child: id })
  + line("agent.start", { agent: id, agent_type: type });

type World = {
  files: Record<string, string>;
  /** A size fs.stat gives in place of the text's length. */
  sizes: Record<string, number>;
  cwd: string;
  listed: {
    id: string;
    name?: string;
    type: string;
    description: string;
    status: "running" | "completed";
  }[];
  reads: string[];
  tails: string[];
  viewed: (string | undefined)[];
  opened: string[];
  closed: string[];
};

/** A repo on disk, git, the log, the agent list and the pane, all from memory. */
function world(on: On, init: Partial<World> = {}): World {
  const w: World = {
    files: {},
    sizes: {},
    cwd: MAIN,
    listed: [],
    reads: [],
    tails: [],
    viewed: [],
    opened: [],
    closed: [],
    ...init,
  };
  const ok = (stdout: string, exitCode = 0) => ({
    value: {
      exitCode,
      stdout,
      stderr: "",
      isStdoutTruncated: false,
      isStderrTruncated: false,
    },
  });
  mock.env(on, { HOME });
  on("session.cwd", () => ({ value: w.cwd }));
  on("session.id", () => ({ value: SESSION }));
  on("process.run", (_, e) => {
    if (e.argv[0] === "tail") {
      const path = e.argv[3] ?? "";
      w.tails.push(path);
      return ok((w.files[path] ?? "").slice(-4000000));
    }
    if (e.argv.includes("--show-toplevel")) {
      return ok(`${e.init?.cwd ?? ""}\n`);
    }
    if (e.argv.includes("--git-common-dir")) {
      return ok(`${MAIN}/.git\n`);
    }
    return ok("", 128);
  });
  on("fs.stat", (_, e) => {
    const text = w.files[e.path];
    if (text === undefined) {
      throw new Error("ENOENT");
    }
    return {
      value: {
        kind: "file",
        size: w.sizes[e.path] ?? text.length,
        mtimeMs: text.length,
        isLink: false,
      },
    };
  });
  on("fs.read", (_, e) => {
    const text = w.files[e.path];
    if (text === undefined) {
      throw new Error("ENOENT");
    }
    w.reads.push(e.path);
    return { value: text };
  });
  on("agent.list", () => ({ value: [...w.listed] }));
  on("ui.open", (_, e) => {
    w.opened.push(e.id);
    return { value: { isPlaced: true } };
  });
  on("ui.close", (_, e) => {
    w.closed.push(e.id);
    return { value: undefined as never };
  });
  on("ui.view", (_, e) => {
    w.viewed.push(e.agentId);
    return { value: {} };
  });
  on("command.register", () => ({ value: undefined as never }));
  on("session.start", () => ({ cwd: MAIN }));
  on("prompt.submit", (_, e) => e);
  on("turn.complete", () => ({ text: "" }));

  return w;
}

/** Plan A RUNNING, its main copy, its log. */
const running = (log: string, statuses = ["pending", "pending"]) => ({
  [`${MAIN}/docs/plans/index.json`]: plans([A, "RUNNING"]),
  [`${MAIN}/docs/plans/${A}/index.json`]: plan(A, statuses),
  [logOf(A)]: log,
});

const PANE = {
  plugin: "vwf",
  surface: "terminal",
  component: "Pane",
  requestId: "vwf-monitor",
  props: {
    title: "vwf:execute",
    isFocused: false,
    bodyColumns: 100,
    placement: "dock",
    scroll: { offset: 0, bodyRows: 40 },
    view: {},
  },
} as const;

const execute = (args: string) => ({
  text: `/vwf:execute ${args}`,
  command: { name: "vwf:execute", args },
  wait: false,
  origin: { kind: "composer" as const },
});

const mainTurnEnds = {
  answer: "",
  durationMs: 1,
  isAborted: false,
  turnId: "t1",
  reason: "answer" as const,
};

test(
  "D5, D14: a unit's agent comes from the log, its button opens the child, a wave review has its line",
  async ($, on) => {
    mock.clock(on, { now: NOW });
    const w = world(on, {
      files: running(
        line("run.start", { mode: "fresh" })
          + agent("a1", "general-purpose", "U1")
          + agent("a4", "general-purpose", "R1"),
      ),
      listed: [
        {
          id: "a1",
          type: "general-purpose",
          description: "x",
          status: "running",
        },
        {
          id: "a4",
          type: "general-purpose",
          description: "x",
          status: "running",
        },
      ],
    });
    await $.prompt.submit(execute(`docs/plans/${A}`));
    const ui = await $.ui.mount(PANE);
    expect(await ui.find({ key: "unit-U1", text: /Unit 1.*running/ }))
      .toBeDefined();
    expect(await ui.find({ key: "unit-U2", text: /running/ })).toBe(undefined);
    expect(await ui.find({ key: "review-R1", text: /running/ })).toBeDefined();
    await ui.press({ key: "unit-U1" });
    await ui.press({ key: "review-R1" });
    expect(w.viewed).toEqual(["a1", "a4"]);
    await ui.unmount();
  },
);

test(
  "D5: a live agent that $.agent.list() shows as done, or does not list, counts as ended",
  async ($, on) => {
    const clock = mock.clock(on, { now: NOW });
    const w = world(on, {
      files: running(
        line("run.start", { mode: "fresh" })
          + agent("a1", "general-purpose", "U1")
          + agent("a2", "general-purpose", "U2"),
      ),
      listed: [
        {
          id: "a1",
          type: "general-purpose",
          description: "x",
          status: "completed",
        },
        {
          id: "a2",
          type: "general-purpose",
          description: "x",
          status: "running",
        },
      ],
    });
    await $.prompt.submit(execute(`docs/plans/${A}`));
    const ui = await $.ui.mount(PANE);
    expect(await ui.find({ key: "unit-U1", text: /running/ })).toBe(undefined);
    expect(await ui.find({ key: "unit-U2", text: /running/ })).toBeDefined();
    w.listed = [];
    await clock.advance(3500);
    expect(await ui.find({ key: "unit-U2", text: /running/ })).toBe(undefined);
    await ui.unmount();
  },
);

test(
  "T7: the plan's start and elapsed time, each unit's and each wave's times come from the JSON",
  async ($, on) => {
    mock.clock(on, { now: NOW });
    world(on, {
      files: running(line("run.start", { mode: "fresh" }), [
        "green",
        "running",
        "pending",
      ]),
    });
    await $.prompt.submit(execute(`docs/plans/${A}`));
    const ui = await $.ui.mount(PANE);
    expect(
      await ui.find({
        type: "Text",
        text: new RegExp(`Started ${hhmm(CLAIMED)} · Ended — · Elapsed 30m`),
      }),
    )
      .toBeDefined();
    expect(
      await ui.find({
        key: "unit-U1",
        text: new RegExp(`green\\s+${hhmm(STARTED)}\\s+${hhmm(ENDED)}\\s+10m`),
      }),
    )
      .toBeDefined();
    // A re-run unit: its first start kept, no end, the time counts on.
    expect(
      await ui.find({
        key: "unit-U2",
        text: new RegExp(`running\\s+${hhmm(STARTED)}\\s+—\\s+20m`),
      }),
    )
      .toBeDefined();
    expect(
      await ui.find({
        type: "Text",
        text: new RegExp(
          `W1\\s+wave\\s+green\\s+${hhmm(STARTED)}\\s+${hhmm(ENDED)}\\s+10m`,
        ),
      }),
    )
      .toBeDefined();
    expect(
      await ui.find({ type: "Text", text: /W3\s+wave\s+pending\s+—\s+—\s+—/ }),
    )
      .toBeDefined();
    expect(await ui.find({ type: "Text", text: /reconcile\s+stage\s+pending/ }))
      .toBeDefined();
    await ui.unmount();
  },
);

test(
  "T7: a folder and a row lacking the time keys and the waves list still render",
  async ($, on) => {
    mock.clock(on, { now: NOW });
    world(on, {
      files: {
        [`${MAIN}/docs/plans/index.json`]: JSON.stringify({
          plans: [{ folder: `docs/plans/${A}`, status: "RUNNING" }],
        }),
        [`${MAIN}/docs/plans/${A}/index.json`]: JSON.stringify({
          title: "Old folder",
          status: { state: "RUNNING" },
          units: [{ id: "U1", title: "Old unit", wave: 1, status: "green" }],
          gaps: [],
          run: {},
        }),
      },
    });
    await $.prompt.submit(execute(`docs/plans/${A}`));
    const ui = await $.ui.mount(PANE);
    expect(await ui.find({ type: "Text", text: /Old folder/ })).toBeDefined();
    expect(await ui.find({ type: "Text", text: /Started — · Ended —/ }))
      .toBeDefined();
    expect(await ui.find({ key: "unit-U1", text: /green\s+—\s+—\s+—/ }))
      .toBeDefined();
    expect(await ui.find({ type: "Text", text: /no run data yet/ }))
      .toBeDefined();
    await ui.unmount();
  },
);

test(
  "T8: RUNNING is live while the last log line is under 10 minutes old, then paused or stopped with the detail; a new line makes it live again",
  async ($, on) => {
    const clock = mock.clock(on, { now: NOW });
    ts = NOW - 60_000;
    const w = world(on, {
      files: running(line("run.start", { mode: "fresh" })),
    });
    w.files[`${MAIN}/docs/plans/${A}/index.json`] = plan(A, ["pending"], {
      worktree: `.worktrees/${A}`,
      log: `~/Library/Caches/vwf/repo/${A}.jsonl`,
    }, { state: "RUNNING", detail: "wave 1 of 1" });
    await $.prompt.submit(execute(`docs/plans/${A}`));
    const ui = await $.ui.mount(PANE);
    expect(await ui.find({ type: "Text", text: /RUNNING · live/ }))
      .toBeDefined();
    await clock.advance(PATIENCE_MS);
    expect(
      await ui.find({
        type: "Text",
        text: /RUNNING · paused or stopped — wave 1 of 1/,
      }),
    )
      .toBeDefined();
    // Paused is not ended: the timer still reads, and a new line shows.
    ts = NOW + PATIENCE_MS;
    w.files[logOf(A)] += line("phase.start", { phase: "wave 1" });
    await clock.advance(3500);
    expect(await ui.find({ type: "Text", text: /RUNNING · live/ }))
      .toBeDefined();
    await ui.unmount();
  },
);

test("T8: a live agent keeps a silent run live", async ($, on) => {
  const clock = mock.clock(on, { now: NOW });
  ts = NOW - 60_000;
  world(on, {
    files: running(
      line("run.start", { mode: "fresh" })
        + agent("a1", "general-purpose", "U1"),
    ),
    listed: [
      {
        id: "a1",
        type: "general-purpose",
        description: "x",
        status: "running",
      },
    ],
  });
  await $.prompt.submit(execute(`docs/plans/${A}`));
  const ui = await $.ui.mount(PANE);
  await clock.advance(PATIENCE_MS + 60_000);
  expect(await ui.find({ type: "Text", text: /RUNNING · live/ }))
    .toBeDefined();
  await ui.unmount();
});

test(
  "T8: BLOCKED in the folder ends the run; RUNNING again makes it live",
  async ($, on) => {
    const clock = mock.clock(on, { now: NOW });
    const w = world(on, {
      files: running(line("run.start", { mode: "fresh" })),
    });
    const state = `${MAIN}/docs/plans/${A}/index.json`;
    await $.prompt.submit(execute(`docs/plans/${A}`));
    const ui = await $.ui.mount(PANE);
    expect(await ui.find({ key: "quiet" })).toBeDefined();
    expect(await ui.find({ type: "Text", text: /RUNNING · live/ }))
      .toBeDefined();
    w.files[state] = plan(A, ["failed", "pending"], undefined, {
      state: "BLOCKED",
      detail: "U1 failed",
    });
    await clock.advance(3500);
    expect(await ui.find({ key: "quiet" })).toBe(undefined);
    expect(await ui.find({ type: "Text", text: /BLOCKED · ended/ }))
      .toBeDefined();
    // The resume: the next main turn's poke reads it.
    w.files[state] = plan(A, ["running", "pending"]);
    w.files[logOf(A)] += line("run.start", { mode: "resume" });
    await clock.advance(3500);
    await $.turn.complete(mainTurnEnds);
    expect(await ui.find({ key: "quiet" })).toBeDefined();
    expect(await ui.find({ type: "Text", text: /RUNNING · live/ }))
      .toBeDefined();
    await ui.unmount();
  },
);

test(
  "D7: of two RUNNING rows, the one whose last run.start is this session's; else the choice",
  async ($, on) => {
    const clock = mock.clock(on, { now: NOW });
    const w = world(on, {
      files: {
        [`${MAIN}/docs/plans/index.json`]: plans([A, "RUNNING"], [
          B,
          "RUNNING",
        ]),
        [`${MAIN}/docs/plans/${A}/index.json`]: plan(A, ["pending"]),
        [`${MAIN}/docs/plans/${B}/index.json`]: plan(B, ["pending"]),
        [logOf(A)]: line("run.start", { mode: "fresh", session: "other" }),
        [logOf(B)]: line("run.start", { mode: "fresh" }),
      },
    });
    await $.prompt.submit(execute("next"));
    const ui = await $.ui.mount(PANE);
    expect(await ui.find({ type: "Text", text: new RegExp(B) }))
      .toBeDefined();
    // Plan B resumed in another session: neither is this session's.
    w.files[logOf(B)] += line("run.start", { mode: "resume", session: "x" });
    await clock.advance(3500);
    expect(await ui.find({ type: "Text", text: /\/vwf-monitor <folder>/ }))
      .toBeDefined();
    expect(
      await ui.find({ type: "Text", text: new RegExp(`- docs/plans/${A}`) }),
    )
      .toBeDefined();
    await ui.unmount();
  },
);

test(
  "D8: an unchanged log and state file are read once over two refreshes",
  async ($, on) => {
    const clock = mock.clock(on, { now: NOW });
    const w = world(on, {
      files: running(line("run.start", { mode: "fresh" })),
    });
    await $.prompt.submit(execute(`docs/plans/${A}`));
    await clock.advance(3500);
    await clock.advance(3500);
    const count = (path: string) => w.reads.filter(one => one === path).length;
    expect(count(logOf(A))).toBe(1);
    expect(count(`${MAIN}/docs/plans/${A}/index.json`)).toBe(1);
    w.files[logOf(A)] += line("phase.start", { phase: "wave 1" });
    await clock.advance(3500);
    expect(count(logOf(A))).toBe(2);
  },
);

test(
  "D9, D16: a log over 4 MiB is replayed from its tail, and the footer says so",
  async ($, on) => {
    mock.clock(on, { now: NOW });
    const w = world(on, {
      files: running(
        "{\"cut\":\"line\n"
          + line("row", { unit: "U2", wave: 2, status: "running" }),
        ["green", "running"],
      ),
      sizes: { [logOf(A)]: 5_000_000 },
    });
    await $.prompt.submit(execute(`docs/plans/${A}`));
    const ui = await $.ui.mount(PANE);
    expect(w.tails).toEqual([logOf(A)]);
    expect(w.reads).not.toContain(logOf(A));
    expect(await ui.find({ type: "Text", text: /partial replay/ }))
      .toBeDefined();
    expect(await ui.find({ key: "unit-U2", text: /running\s+\d\d:\d\d/ }))
      .toBeDefined();
    await ui.unmount();
  },
);

test(
  "D20, D32: /vwf:execute waits for the claim; COMPLETE waits for the next plan, which shows at once; 10 minutes with none closes",
  async ($, on) => {
    const clock = mock.clock(on, { now: NOW });
    const w = world(on, {
      files: {
        [`${MAIN}/docs/plans/index.json`]: plans([A, "APPROVED"]),
        [`${MAIN}/docs/plans/${A}/index.json`]: plan(A, ["pending"], {}),
        [`${MAIN}/docs/plans/${B}/index.json`]: plan(B, ["pending"]),
        [logOf(B)]: line("run.start", { mode: "fresh" }),
      },
    });
    await $.prompt.submit(execute(`docs/plans/${A}`));
    const ui = await $.ui.mount(PANE);
    expect(await ui.find({ type: "Text", text: /waiting for the claim/ }))
      .toBeDefined();
    // The claim: RUNNING, and no run key yet.
    w.files[`${MAIN}/docs/plans/index.json`] = plans([A, "RUNNING"]);
    await clock.advance(3500);
    expect(await ui.find({ type: "Text", text: new RegExp(A) })).toBeDefined();
    expect(await ui.find({ type: "Text", text: /no run data yet/ }))
      .toBeDefined();
    // Plan A lands; the next plan of an `all` run is claimed.
    w.files[`${MAIN}/docs/plans/index.json`] = plans([A, "COMPLETE"]);
    await clock.advance(3500);
    expect(await ui.find({ type: "Text", text: /waiting for the next plan/ }))
      .toBeDefined();
    w.files[`${MAIN}/docs/plans/index.json`] = plans([A, "COMPLETE"], [
      B,
      "RUNNING",
    ]);
    await clock.advance(3500);
    expect(await ui.find({ type: "Text", text: new RegExp(B) })).toBeDefined();
    // Plan B lands, and nothing follows.
    w.files[`${MAIN}/docs/plans/index.json`] = plans([A, "COMPLETE"], [
      B,
      "COMPLETE",
    ]);
    await clock.advance(3500);
    expect(await ui.find({ type: "Text", text: /waiting for the next plan/ }))
      .toBeDefined();
    await clock.advance(PATIENCE_MS - 5000);
    expect(w.closed).toEqual([]);
    await clock.advance(6000);
    expect(await ui.find({ type: "Text", text: /No plan reads RUNNING/ }))
      .toBeDefined();
    await clock.advance(10_500);
    expect(w.closed).toEqual(["vwf-monitor"]);
    await ui.unmount();
  },
);

test(
  "D3: the old format shows its message and closes after 10 s; so does /vwf-monitor with no RUNNING row",
  async ($, on) => {
    const clock = mock.clock(on, { now: NOW });
    const w = world(on, {
      files: { [`${MAIN}/docs/plans/index.md`]: "## Plans\n" },
    });
    await $.prompt.submit(execute("next"));
    const ui = await $.ui.mount(PANE);
    expect(await ui.find({ type: "Text", text: /old plan format/ }))
      .toBeDefined();
    await clock.advance(9000);
    expect(w.closed).toEqual([]);
    await clock.advance(1500);
    expect(w.closed).toEqual(["vwf-monitor"]);
    await ui.unmount();

    w.files = { [`${MAIN}/docs/plans/index.json`]: plans([A, "APPROVED"]) };
    // The engine stamps the presentation; the kit does not.
    await $.command.run(
      {
        command: "vwf-monitor",
        args: "",
        presentation: { isFullscreen: false, columns: 100 },
      } as Parameters<typeof $.command.run>[0],
    );
    const again = await $.ui.mount(PANE);
    expect(await again.find({ type: "Text", text: /No plan reads RUNNING/ }))
      .toBeDefined();
    await clock.advance(10_500);
    expect(w.closed).toEqual(["vwf-monitor", "vwf-monitor"]);
    await again.unmount();
  },
);

test(
  "D7: a cycle plan in a member repo is found from the base",
  async ($, on) => {
    mock.clock(on, { now: NOW });
    world(on, {
      files: {
        [`${MAIN}/.config/vwf.yaml`]:
          "topology: multi-repo\nmembers:\n  - name: api\n    path: ../api\n",
        [`${MAIN}/docs/plans/index.json`]: plans([A, "RUNNING", "api"]),
        [`/api/docs/plans/${A}/index.json`]: plan("Member plan", ["pending"]),
      },
    });
    await $.prompt.submit(execute(`docs/plans/${A}`));
    const ui = await $.ui.mount(PANE);
    expect(await ui.find({ type: "Text", text: /Member plan/ })).toBeDefined();
    await ui.unmount();
  },
);

test("D8: the timer runs only while a run is live", async ($, on) => {
  // Each period of a timer is one clock.every dispatch, held until released.
  let now = NOW;
  let periods: (() => void)[] = [];
  on("clock.now", () => ({ value: now }));
  on("clock.every", () =>
    new Promise(resolve => {
      periods.push(() => resolve({ value: undefined }));
    }));
  const tick = async () => {
    now += 3500;
    const due = periods;
    periods = [];
    due.forEach(release => release());
    await new Promise<void>(resolve => setTimeout(resolve, 20));
  };
  const w = world(on, {
    files: running(line("run.start", { mode: "fresh" })),
  });
  await $.session.start({
    cwd: MAIN,
    surface: "terminal",
    isInteractive: true,
  });
  // No run: no timer.
  expect(periods.length).toBe(0);
  await $.prompt.submit(execute(`docs/plans/${A}`));
  expect(periods.length).toBe(1);
  await tick();
  expect(periods.length).toBe(1);
  // The run ends: the timer stops asking for periods.
  w.files[`${MAIN}/docs/plans/${A}/index.json`] = plan(
    A,
    ["green", "green"],
    undefined,
    { state: "COMPLETE", detail: "" },
  );
  await tick();
  await tick();
  expect(periods.length).toBe(0);
});
