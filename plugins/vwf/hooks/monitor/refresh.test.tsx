import {
  expect,
  mock,
  test,
} from "claude-code/testing";

const FOLDER = "2026-10-21-a-plan";
const MAIN = "/repo";
const TREE = "/repo/.worktrees/2026-10-21-a-plan";

const index = (status: string, u1: string) =>
  `# Plan — A plan (2026-10-21)

## Status

**${status}**

## Units

| Id | Wave | Unit file          | Kind | Status | Commit |
| -- | ---- | ------------------ | ---- | ------ | ------ |
| U1 | 1    | [01-a.md](01-a.md) | edit | ${u1}  |        |

## Launch
`;

test(
  "the timer refreshes the pane, and the plan is found again after the worktree is gone",
  async ($, on) => {
    const clock = mock.clock(on, { now: 1_000_000 });
    // The files: the worktree copy during the run, the main copy after landing.
    let files: Record<string, string> = {
      [`${TREE}/docs/plans/${FOLDER}/index.md`]: index("RUNNING", "pending"),
    };
    let cwd = TREE;
    let worktrees = `worktree ${MAIN}\nworktree ${TREE}\n`;

    on("session.cwd", () => ({ value: cwd }));
    on("process.run", (_, e) => {
      const exists = e.init?.cwd === MAIN
        || (e.init?.cwd === TREE && worktrees.includes(TREE));
      return {
        value: {
          exitCode: exists ? 0 : 128,
          stdout: exists ? worktrees : "",
          stderr: "",
          isStdoutTruncated: false,
          isStderrTruncated: false,
        },
      };
    });
    on("fs.stat", (_, e) => {
      if (!(e.path in files)) {
        throw new Error("ENOENT");
      }
      return { value: { kind: "file", size: 1, mtimeMs: 1, isLink: false } };
    });
    on("fs.read", (_, e) => {
      const text = files[e.path];
      if (text === undefined) {
        throw new Error("ENOENT");
      }
      return { value: text };
    });
    on("agent.list", () => ({ value: [] }));
    on("ui.open", () => ({ value: { isPlaced: true } }));
    on("command.register", () => ({ value: undefined as never }));
    on("session.start", () => ({ cwd: MAIN }));
    on("prompt.submit", (_, e) => e);

    await $.session.start({
      cwd: MAIN,
      surface: "terminal",
      isInteractive: true,
    });
    await $.prompt.submit({
      text: `/vwf:execute docs/plans/${FOLDER}`,
      command: { name: "vwf:execute", args: `docs/plans/${FOLDER}` },
      wait: false,
      origin: { kind: "composer" },
    });

    const ui = await $.ui.mount({
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
    });
    expect(await ui.find({ type: "Text", text: /RUNNING/ })).toBeDefined();

    // A unit finishes in the worktree: the timer alone shows it.
    files = {
      [`${TREE}/docs/plans/${FOLDER}/index.md`]: index("RUNNING", "green"),
    };
    await clock.advance(3500);
    expect(await ui.find({ type: "Text", text: /1\/1/ })).toBeDefined();

    // Landing: the worktree is deleted, the session is back in the main checkout.
    files = {
      [`${MAIN}/docs/plans/${FOLDER}/index.md`]: index("COMPLETE", "green"),
    };
    worktrees = `worktree ${MAIN}\n`;
    cwd = MAIN;
    await clock.advance(3500);
    expect(await ui.find({ type: "Text", text: /COMPLETE/ })).toBeDefined();
    await ui.unmount();
  },
);
