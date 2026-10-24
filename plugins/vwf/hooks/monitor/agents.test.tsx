import type { On } from "claude-code";
import {
  expect,
  mock,
  test,
} from "claude-code/testing";

// The environment has it; the types laid for a hooks module do not.
declare const setTimeout: (fn: () => void, ms: number) => unknown;

const A = "2026-10-21-a-plan";
const B = "2026-10-21-b-plan";
const MAIN = "/repo";
const WAIT_MS = 10 * 60 * 1000;

const index = (title: string, status: string, u1 = "pending") =>
  `# Plan — ${title} (2026-10-21)

## Status

**${status}**

## Units

| Id | Wave | Unit file            | Kind   | Status  | Commit |
| -- | ---- | -------------------- | ------ | ------- | ------ |
| U1 | 1    | [01-a.md](01-a.md)   | edit   | ${u1}   |        |
| U2 | 2    | [02-rev.md](02-rev.md) | review | pending |        |

## Launch
`;

const planIndex = (...running: string[]) =>
  `## Plans

| Folder | Kind | Status |
| ------ | ---- | ------ |
${running.map(f => `| docs/plans/${f} | change | RUNNING |`).join("\n")}
`;

type World = {
  files: Record<string, string>;
  worktrees: string[];
  cwd: string;
  listed: {
    id: string;
    name?: string;
    type: string;
    description: string;
    status: "running" | "completed";
    parentId?: string;
  }[];
  viewed: (string | undefined)[];
  opened: string[];
  /** Runs while agent.list is answering, after its answer was taken. */
  onList?: () => Promise<void>;
};

/** A repo on disk, git, the agent list and the pane, all from memory. */
function world(on: On, init: Partial<World> = {}): World {
  const w: World = {
    files: {},
    worktrees: [MAIN],
    cwd: MAIN,
    listed: [],
    viewed: [],
    opened: [],
    ...init,
  };
  const ok = (stdout: string) => ({
    value: {
      exitCode: 0,
      stdout,
      stderr: "",
      isStdoutTruncated: false,
      isStderrTruncated: false,
    },
  });
  on("session.cwd", () => ({ value: w.cwd }));
  on("process.run", (_, e) => {
    const cwd = e.init?.cwd ?? "";
    if (e.argv[1] === "worktree") {
      return ok(w.worktrees.map(tree => `worktree ${tree}\n`).join(""));
    }
    if (e.argv.includes("--show-toplevel")) {
      return ok(`${cwd}\n`);
    }
    if (e.argv.includes("--git-common-dir")) {
      return ok(`${MAIN}/.git\n`);
    }
    return { value: { ...ok("").value, exitCode: 128 } };
  });
  on("fs.stat", (_, e) => {
    if (!(e.path in w.files)) {
      throw new Error("ENOENT");
    }
    return { value: { kind: "file", size: 1, mtimeMs: 1, isLink: false } };
  });
  on("fs.read", (_, e) => {
    const text = w.files[e.path];
    if (text === undefined) {
      throw new Error("ENOENT");
    }
    return { value: text };
  });
  on("agent.list", async () => {
    const answer = [...w.listed];
    await w.onList?.();
    return { value: answer };
  });
  on("agent.spawn", (_, e) => {
    const id = `a-${e.name ?? e.subagentType}`;
    if (w.listed.some(one => one.id === id)) {
      return { model: "opus", agentId: id };
    }
    w.listed.push({
      id,
      name: e.name,
      type: e.subagentType,
      description: e.description,
      status: "running",
    });
    return { model: "opus", agentId: id };
  });
  on("ui.open", (_, e) => {
    w.opened.push(e.id);
    return { value: { isPlaced: true } };
  });
  on("ui.close", () => ({ value: undefined as never }));
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

const spawn = (
  name: string | undefined,
  subagentType: string,
  prompt = "",
) => ({
  tool_use_id: `t-${name ?? subagentType}`,
  prompt,
  description: "a task",
  subagentType,
  provider: { plugin: "engine", tier: "core" as const },
  parentModel: "opus",
  background: false,
  fork: false,
  ...(name === undefined ? {} : { name }),
});

const mainTurnEnds = {
  answer: "",
  durationMs: 1,
  isAborted: false,
  turnId: "t1",
  reason: "answer" as const,
};

test(
  "ruling 1: unit agents of any type are followed, a reviewer counts against its row, an earlier plan's agent is not adopted",
  async ($, on) => {
    const clock = mock.clock(on, { now: 1_000_000 });
    const w = world(on, {
      files: {
        [`${MAIN}/docs/plans/${A}/index.md`]: index("A plan", "RUNNING"),
        [`${MAIN}/docs/plans/${B}/index.md`]: index("B plan", "RUNNING"),
      },
    });
    await $.prompt.submit(execute(`docs/plans/${A}`));
    const ui = await $.ui.mount(PANE);

    // An edit unit, dispatched as general-purpose, named U1.
    await $.agent.spawn(spawn("U1", "general-purpose"));
    expect(await ui.find({ key: "unit-U1", text: /running/ })).toBeDefined();
    // A reviewer's prompt names its row, then the files of the units it covers.
    await $.agent.spawn(
      spawn(
        undefined,
        "vwf:execute-code-reviewer",
        "loop U2, round 1: 01-a.md",
      ),
    );
    expect(await ui.find({ key: "unit-U2", text: /running/ })).toBeDefined();
    await ui.unmount();

    // An `all` run: an agent of plan A's runner, still listed, stays out of plan B.
    w.listed = [];
    await $.prompt.submit(execute("all"));
    await $.agent.spawn(
      spawn("run-1", "vwf:execute-runner", `docs/plans/${A}`),
    );
    await $.agent.spawn(
      spawn("run-2", "vwf:execute-runner", `docs/plans/${B}`),
    );
    w.listed.push({
      id: "old",
      name: "U1",
      type: "vwf:execute-coder",
      description: "a task",
      status: "running",
      parentId: "a-run-1",
    });
    await clock.advance(3500);
    const again = await $.ui.mount(PANE);
    expect(await again.find({ type: "Text", text: /B plan/ })).toBeDefined();
    expect(await again.find({ key: "unit-U1", text: /running/ })).toBe(
      undefined,
    );
    await again.unmount();
  },
);

test(
  "ruling 2: a wave review has a line that opens its transcript",
  async ($, on) => {
    mock.clock(on, { now: 1_000_000 });
    const w = world(on, {
      files: {
        [`${MAIN}/docs/plans/${A}/index.md`]: index("A plan", "RUNNING"),
      },
    });
    await $.prompt.submit(execute(`docs/plans/${A}`));
    await $.agent.spawn(spawn("R1", "general-purpose", "01-a.md"));
    const ui = await $.ui.mount(PANE);
    expect(await ui.find({ key: "review-R1", text: /running/ })).toBeDefined();
    // The reviewer is not counted against the unit whose file it reads.
    expect(await ui.find({ key: "unit-U1", text: /running/ })).toBe(undefined);
    await ui.press({ key: "review-R1" });
    expect(w.viewed).toEqual(["a-R1"]);
    await ui.unmount();
  },
);

test(
  "ruling 3: an idle main turn only waits; the run ends after the wait, or when the plan lands",
  async ($, on) => {
    const clock = mock.clock(on, { now: 1_000_000 });
    const w = world(on, {
      files: {
        [`${MAIN}/docs/plans/${A}/index.md`]: index("A plan", "RUNNING"),
      },
    });
    await $.prompt.submit(execute(`docs/plans/${A}`));
    const ui = await $.ui.mount(PANE);
    await $.turn.complete(mainTurnEnds);
    expect(await ui.find({ key: "quiet" })).toBeDefined();
    expect(await ui.find({ type: "Text", text: /waiting/ })).toBeDefined();
    await clock.advance(WAIT_MS + 5000);
    expect(await ui.find({ key: "quiet" })).toBe(undefined);
    await ui.unmount();

    await $.prompt.submit(execute(`docs/plans/${A}`));
    const again = await $.ui.mount(PANE);
    expect(await again.find({ key: "quiet" })).toBeDefined();
    w.files[`${MAIN}/docs/plans/${A}/index.md`] = index("A plan", "COMPLETE");
    await clock.advance(3500);
    expect(await again.find({ key: "quiet" })).toBe(undefined);
    await again.unmount();
  },
);

test(
  "ruling 3: in an `all` run a COMPLETE plan ends the run; the next plan is a new run",
  async ($, on) => {
    const clock = mock.clock(on, { now: 1_000_000 });
    const w = world(on, {
      files: {
        [`${MAIN}/docs/plans/${A}/index.md`]: index("A plan", "RUNNING"),
        [`${MAIN}/docs/plans/${B}/index.md`]: index("B plan", "RUNNING"),
      },
    });
    await $.prompt.submit(execute("all"));
    await $.agent.spawn(
      spawn("run-1", "vwf:execute-runner", `docs/plans/${A}`),
    );
    const ui = await $.ui.mount(PANE);
    expect(await ui.find({ key: "quiet" })).toBeDefined();
    // The last plan lands: the run ends at once, not after the wait.
    w.files[`${MAIN}/docs/plans/${A}/index.md`] = index("A plan", "COMPLETE");
    await clock.advance(3500);
    expect(await ui.find({ key: "quiet" })).toBe(undefined);
    await ui.unmount();

    // A following plan: a new run the pane picks up.
    await $.agent.spawn(
      spawn("run-2", "vwf:execute-runner", `docs/plans/${B}`),
    );
    await clock.advance(3500);
    const again = await $.ui.mount(PANE);
    expect(await again.find({ key: "quiet" })).toBeDefined();
    expect(await again.find({ type: "Text", text: /B plan/ })).toBeDefined();
    await again.unmount();
  },
);

test(
  "ruling 1: after an `all` run ends on COMPLETE, the next plan's run does not adopt the earlier plan's agent",
  async ($, on) => {
    const clock = mock.clock(on, { now: 1_000_000 });
    const w = world(on, {
      files: {
        [`${MAIN}/docs/plans/${A}/index.md`]: index("A plan", "RUNNING"),
        [`${MAIN}/docs/plans/${B}/index.md`]: index("B plan", "RUNNING"),
      },
    });
    await $.prompt.submit(execute("all"));
    await $.agent.spawn(
      spawn("run-1", "vwf:execute-runner", `docs/plans/${A}`),
    );
    w.files[`${MAIN}/docs/plans/${A}/index.md`] = index("A plan", "COMPLETE");
    await clock.advance(3500);

    // Plan A's unit, still listed, as the runner for plan B starts a new run.
    w.listed.push({
      id: "old",
      name: "U1",
      type: "vwf:execute-coder",
      description: "a task",
      status: "running",
      parentId: "a-run-1",
    });
    await $.agent.spawn(
      spawn("run-2", "vwf:execute-runner", `docs/plans/${B}`),
    );
    await clock.advance(3500);
    const ui = await $.ui.mount(PANE);
    expect(await ui.find({ type: "Text", text: /B plan/ })).toBeDefined();
    expect(await ui.find({ key: "unit-U1", text: /running/ })).toBe(undefined);
    await ui.unmount();
  },
);

test("ruling 4: an agent gone from the list has ended", async ($, on) => {
  const clock = mock.clock(on, { now: 1_000_000 });
  const w = world(on, {
    files: {
      [`${MAIN}/docs/plans/${A}/index.md`]: index("A plan", "RUNNING"),
    },
  });
  await $.prompt.submit(execute(`docs/plans/${A}`));
  await $.agent.spawn(spawn(undefined, "vwf:execute-coder", "01-a.md"));
  const ui = await $.ui.mount(PANE);
  expect(await ui.find({ key: "unit-U1", text: /running/ })).toBeDefined();
  w.listed = [];
  await clock.advance(3500);
  expect(await ui.find({ key: "unit-U1", text: /running/ })).toBe(undefined);
  await ui.unmount();
});

test(
  "ruling 4: a known index.md in the run's worktree is kept while it exists; searched only when gone",
  async ($, on) => {
    const clock = mock.clock(on, { now: 1_000_000 });
    const claimed = `${MAIN}/.worktrees/claimed`;
    const tree = `${MAIN}/.worktrees/${A}`;
    const w = world(on, {
      files: {
        // The run's worktree, named in the Status of the copy it holds.
        [`${claimed}/docs/plans/${A}/index.md`]: index("Known copy", "RUNNING")
          .replace("**RUNNING**", `**RUNNING** in \`${claimed}\``),
      },
      worktrees: [MAIN, claimed],
    });
    await $.prompt.submit(execute(`docs/plans/${A}`));
    const ui = await $.ui.mount(PANE);
    expect(await ui.find({ type: "Text", text: /Known copy/ })).toBeDefined();
    // A worktree named for the folder appears: the known path still exists.
    w.worktrees = [MAIN, claimed, tree];
    w.files[`${tree}/docs/plans/${A}/index.md`] = index("Tree copy", "RUNNING");
    await clock.advance(3500);
    expect(await ui.find({ type: "Text", text: /Known copy/ })).toBeDefined();
    // The known path is gone: search.
    delete w.files[`${claimed}/docs/plans/${A}/index.md`];
    await clock.advance(3500);
    expect(await ui.find({ type: "Text", text: /Tree copy/ })).toBeDefined();
    await ui.unmount();
  },
);

test(
  "ruling 12: a pane that first finds the main-checkout index.md reads the worktree copy once that worktree appears",
  async ($, on) => {
    const clock = mock.clock(on, { now: 1_000_000 });
    const tree = `${MAIN}/.worktrees/${A}`;
    const w = world(on, {
      files: {
        [`${MAIN}/docs/plans/${A}/index.md`]: index("Main copy", "RUNNING"),
      },
    });
    await $.prompt.submit(execute(`docs/plans/${A}`));
    const ui = await $.ui.mount(PANE);
    expect(await ui.find({ type: "Text", text: /Main copy/ })).toBeDefined();
    // The run cuts its worktree; the main-checkout copy still exists.
    w.worktrees = [MAIN, tree];
    w.files[`${tree}/docs/plans/${A}/index.md`] = index("Tree copy", "RUNNING");
    await clock.advance(3500);
    expect(await ui.find({ type: "Text", text: /Tree copy/ })).toBeDefined();
    await ui.unmount();
  },
);

test(
  "ruling 12: a known index.md in another linked worktree gives way to the run's worktree copy once it appears",
  async ($, on) => {
    const clock = mock.clock(on, { now: 1_000_000 });
    const other = `${MAIN}/.worktrees/other`;
    const tree = `${MAIN}/.worktrees/${A}`;
    const w = world(on, {
      files: {
        [`${other}/docs/plans/${A}/index.md`]: index("Other copy", "RUNNING"),
      },
      worktrees: [MAIN, other],
    });
    await $.prompt.submit(execute(`docs/plans/${A}`));
    const ui = await $.ui.mount(PANE);
    expect(await ui.find({ type: "Text", text: /Other copy/ })).toBeDefined();
    // The run cuts its worktree; the other worktree's copy still exists.
    w.worktrees = [MAIN, other, tree];
    w.files[`${tree}/docs/plans/${A}/index.md`] = index("Tree copy", "RUNNING");
    await clock.advance(3500);
    expect(await ui.find({ type: "Text", text: /Tree copy/ })).toBeDefined();
    await ui.unmount();
  },
);

test(
  "ruling 5: of several RUNNING rows, the one in this session's worktrees; else a problem",
  async ($, on) => {
    mock.clock(on, { now: 1_000_000 });
    const tree = `${MAIN}/.worktrees/${B}`;
    const w = world(on, {
      files: {
        [`${MAIN}/docs/plans/index.md`]: planIndex(A, B),
        [`${tree}/docs/plans/index.md`]: planIndex(A, B),
        [`${MAIN}/docs/plans/${A}/index.md`]: index("A plan", "RUNNING"),
        [`${MAIN}/docs/plans/${B}/index.md`]: index("B plan", "RUNNING"),
        [`${tree}/docs/plans/${B}/index.md`]: index("B plan", "RUNNING"),
      },
      worktrees: [MAIN, tree],
      // This session works in plan B's worktree.
      cwd: tree,
    });
    await $.prompt.submit(execute("next"));
    const ui = await $.ui.mount(PANE);
    expect(await ui.find({ type: "Text", text: /B plan/ })).toBeDefined();
    await ui.unmount();

    // From the main checkout: another session's worktree is not this one's.
    w.cwd = MAIN;
    await $.prompt.submit(execute("next"));
    const other = await $.ui.mount(PANE);
    expect(await other.find({ type: "Text", text: /\/vwf-monitor <folder>/ }))
      .toBeDefined();
    await other.unmount();

    w.worktrees = [MAIN];
    delete w.files[`${tree}/docs/plans/${B}/index.md`];
    await $.prompt.submit(execute("next"));
    const again = await $.ui.mount(PANE);
    expect(await again.find({ type: "Text", text: /\/vwf-monitor <folder>/ }))
      .toBeDefined();
    await again.unmount();
  },
);

test(
  "ruling 5: a guessed pick is re-resolved, even after an agent was followed",
  async ($, on) => {
    const clock = mock.clock(on, { now: 1_000_000 });
    const tree = `${MAIN}/.worktrees/${B}`;
    const w = world(on, {
      files: {
        [`${MAIN}/docs/plans/index.md`]: planIndex(A),
        [`${MAIN}/docs/plans/${A}/index.md`]: index("A plan", "RUNNING"),
      },
    });
    await $.prompt.submit(execute("next"));
    await $.agent.spawn(spawn("U1", "general-purpose"));
    const ui = await $.ui.mount(PANE);
    expect(await ui.find({ type: "Text", text: /A plan/ })).toBeDefined();
    // A second RUNNING row, in the worktree this session moved into: the
    // better pick.
    w.worktrees = [MAIN, tree];
    w.cwd = tree;
    w.files[`${MAIN}/docs/plans/index.md`] = planIndex(A, B);
    w.files[`${tree}/docs/plans/${B}/index.md`] = index("B plan", "RUNNING");
    await clock.advance(3500);
    expect(await ui.find({ type: "Text", text: /B plan/ })).toBeDefined();
    await ui.unmount();
  },
);

test(
  "ruling 6: a plan in a member repo is found from the base",
  async ($, on) => {
    mock.clock(on, { now: 1_000_000 });
    world(on, {
      files: {
        [`${MAIN}/.config/vwf.yaml`]:
          "topology: multi-repo\nmembers:\n  - name: api\n    path: ../api\n",
        [`/api/docs/plans/${A}/index.md`]: index("Member plan", "RUNNING"),
      },
    });
    await $.prompt.submit(execute(`docs/plans/${A}`));
    const ui = await $.ui.mount(PANE);
    expect(await ui.find({ type: "Text", text: /Member plan/ })).toBeDefined();
    await ui.unmount();
  },
);

test("ruling 7: the timer runs only while a run is live", async ($, on) => {
  // Each period of a timer is one clock.every dispatch, held until released.
  let now = 1_000_000;
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
    files: {
      [`${MAIN}/docs/plans/${A}/index.md`]: index("A plan", "RUNNING"),
    },
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
  // The plan lands: the timer stops asking for periods.
  w.files[`${MAIN}/docs/plans/${A}/index.md`] = index("A plan", "COMPLETE");
  await tick();
  await tick();
  expect(periods.length).toBe(0);
});

test(
  "ruling 4: an `all` run reads its plan in the shared worktree, not the main checkout",
  async ($, on) => {
    const clock = mock.clock(on, { now: 1_000_000 });
    const tree = `${MAIN}/.worktrees/all-2026-10-21-1200`;
    world(on, {
      files: {
        [`${MAIN}/docs/plans/${A}/index.md`]: index("Main copy", "RUNNING"),
        [`${tree}/docs/plans/${A}/index.md`]: index("Tree copy", "RUNNING"),
      },
      worktrees: [MAIN, tree],
    });
    await $.prompt.submit(execute("all"));
    await $.agent.spawn(
      spawn("run-1", "vwf:execute-runner", `docs/plans/${A}`),
    );
    await clock.advance(3500);
    const ui = await $.ui.mount(PANE);
    expect(await ui.find({ type: "Text", text: /Tree copy/ })).toBeDefined();
    await ui.unmount();
  },
);

test(
  "ruling 4: a spawn merges by id with a refresh that ran first or read the list before it",
  async ($, on) => {
    const clock = mock.clock(on, { now: 1_000_000 });
    const w = world(on, {
      files: {
        [`${MAIN}/docs/plans/${A}/index.md`]: index("A plan", "RUNNING"),
      },
      // Listed before its spawn hook ran: the refresh adopts it first.
      listed: [{
        id: "a-U1",
        name: "U1",
        type: "general-purpose",
        description: "a task",
        status: "running",
      }],
    });
    await $.prompt.submit(execute(`docs/plans/${A}`));
    await $.agent.spawn(spawn("U1", "general-purpose"));
    const ui = await $.ui.mount(PANE);
    expect(
      await ui.find({ key: "unit-U1", text: /running\s+\d\d:\d\d/ }),
    )
      .toBeDefined();

    // A refresh holding a list read before U2 spawned does not end U2.
    w.onList = async () => {
      w.onList = undefined;
      await $.agent.spawn(spawn("U2", "general-purpose"));
    };
    await clock.advance(3500);
    expect(await ui.find({ key: "unit-U2", text: /running/ })).toBeDefined();
    await ui.unmount();
  },
);

test(
  "ruling 5: a pick in this session's own worktree is no longer a guess",
  async ($, on) => {
    const clock = mock.clock(on, { now: 1_000_000 });
    const tree = `${MAIN}/.worktrees/${A}`;
    const w = world(on, {
      files: {
        [`${MAIN}/docs/plans/index.md`]: planIndex(A),
        [`${tree}/docs/plans/index.md`]: planIndex(A),
        [`${tree}/docs/plans/${A}/index.md`]: index("A plan", "RUNNING"),
        [`${MAIN}/docs/plans/${B}/index.md`]: index("B plan", "RUNNING"),
      },
      worktrees: [MAIN, tree],
      cwd: tree,
    });
    await $.prompt.submit(execute("next"));
    await $.agent.spawn(spawn("U1", "general-purpose"));
    // Another session's plan is now the only RUNNING row.
    w.files[`${MAIN}/docs/plans/index.md`] = planIndex(B);
    w.files[`${tree}/docs/plans/index.md`] = planIndex(B);
    await clock.advance(3500);
    const ui = await $.ui.mount(PANE);
    expect(await ui.find({ type: "Text", text: /A plan/ })).toBeDefined();
    expect(await ui.find({ key: "unit-U1", text: /running/ })).toBeDefined();
    await ui.unmount();
  },
);

test(
  "ruling 5: a re-pick never carries agents to another plan",
  async ($, on) => {
    const clock = mock.clock(on, { now: 1_000_000 });
    const w = world(on, {
      files: {
        [`${MAIN}/docs/plans/index.md`]: planIndex(A),
        [`${MAIN}/docs/plans/${A}/index.md`]: index("A plan", "RUNNING"),
        [`${MAIN}/docs/plans/${B}/index.md`]: index("B plan", "RUNNING"),
      },
    });
    await $.prompt.submit(execute("next"));
    await $.agent.spawn(spawn("U1", "general-purpose"));
    w.files[`${MAIN}/docs/plans/index.md`] = planIndex(B);
    await clock.advance(3500);
    const ui = await $.ui.mount(PANE);
    expect(await ui.find({ type: "Text", text: /B plan/ })).toBeDefined();
    expect(await ui.find({ key: "unit-U1", text: /running/ })).toBe(undefined);
    await ui.unmount();
  },
);

test(
  "ruling 3: an interrupted run, with no idle main turn, ends after the wait",
  async ($, on) => {
    const clock = mock.clock(on, { now: 1_000_000 });
    const w = world(on, {
      files: {
        [`${MAIN}/docs/plans/${A}/index.md`]: index("A plan", "RUNNING"),
      },
    });
    await $.prompt.submit(execute(`docs/plans/${A}`));
    await $.agent.spawn(spawn("U1", "general-purpose"));
    const ui = await $.ui.mount(PANE);
    // Interrupted: the unit is killed, and no main turn ends idle.
    w.listed = [];
    await clock.advance(3500);
    expect(await ui.find({ key: "quiet" })).toBeDefined();
    await clock.advance(WAIT_MS + 5000);
    expect(await ui.find({ key: "quiet" })).toBe(undefined);
    await ui.unmount();
  },
);

test(
  "ruling 3: a BLOCKED plan ends the run once its live agents end",
  async ($, on) => {
    const clock = mock.clock(on, { now: 1_000_000 });
    const w = world(on, {
      files: {
        [`${MAIN}/docs/plans/${A}/index.md`]: index("A plan", "RUNNING"),
      },
    });
    await $.prompt.submit(execute(`docs/plans/${A}`));
    await $.agent.spawn(spawn("U1", "general-purpose"));
    await $.agent.spawn(spawn("U2", "general-purpose"));
    const ui = await $.ui.mount(PANE);
    // U1 fails the plan while U2 still runs.
    w.listed = w.listed.filter(one => one.id !== "a-U1");
    w.files[`${MAIN}/docs/plans/${A}/index.md`] = index("A plan", "BLOCKED");
    await clock.advance(3500);
    expect(await ui.find({ key: "quiet" })).toBeDefined();
    w.listed = [];
    await clock.advance(3500);
    expect(await ui.find({ key: "quiet" })).toBe(undefined);
    expect(await ui.find({ key: "unit-U2", text: /running/ })).toBe(undefined);
    await ui.unmount();
  },
);
