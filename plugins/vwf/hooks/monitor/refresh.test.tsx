import {
  expect,
  mock,
  test,
} from "claude-code/testing";

const FOLDER = "2026-10-25-a-plan";
const MAIN = "/repo";
const TREE = `/repo/.worktrees/${FOLDER}`;
const HOME = "/home/me";
const LOG = `${HOME}/Library/Caches/vwf/repo/${FOLDER}.jsonl`;

const index = JSON.stringify({
  format: 1,
  plans: [{
    id: FOLDER,
    folder: `docs/plans/${FOLDER}`,
    kind: "change",
    title: "A plan",
    target_repo: null,
    priority: 1,
    status: "RUNNING",
    gaps: null,
    requires: [],
    backlog: [],
    backlog_pieces: [],
  }],
});

const folder = (title: string, state: string, u1: string) =>
  JSON.stringify({
    format: 1,
    title,
    status: { state, detail: "" },
    units: [{
      id: "U1",
      title: "The unit",
      wave: 1,
      file: "01-a.md",
      kind: "edit",
      status: u1,
      commit: "",
      rounds: 0,
    }],
    gaps: [],
    run: {
      worktree: `.worktrees/${FOLDER}`,
      log: `~/Library/Caches/vwf/repo/${FOLDER}.jsonl`,
    },
  });

const LINE = JSON.stringify({
  ts: "2026-10-25T09:59:00.000Z",
  run: "20261025-095900-aaaaaaaa",
  session: "aaaaaaaa-1111",
  agent: null,
  event: "run.start",
  mode: "fresh",
}) + "\n";

test(
  "D24, D32: the state comes from the worktree copy, then its archived copy during the landing, then the main copy",
  async ($, on) => {
    const clock = mock.clock(on, { now: Date.parse("2026-10-25T10:00:00Z") });
    const live = `${TREE}/docs/plans/${FOLDER}/index.json`;
    const archived = `${TREE}/docs/plans/archived/${FOLDER}/index.json`;
    const main = `${MAIN}/docs/plans/${FOLDER}/index.json`;
    const files: Record<string, string> = {
      [`${MAIN}/docs/plans/index.json`]: index,
      [main]: folder("Main copy", "RUNNING", "pending"),
      [live]: folder("Tree copy", "RUNNING", "running"),
      [LOG]: LINE,
    };
    mock.env(on, { HOME });
    on("session.cwd", () => ({ value: MAIN }));
    on("session.id", () => ({ value: "aaaaaaaa-1111" }));
    on("process.run", (_, e) => ({
      value: {
        exitCode: e.argv.includes("--show-toplevel") ? 0 : 128,
        stdout: `${e.init?.cwd ?? ""}\n`,
        stderr: "",
        isStdoutTruncated: false,
        isStderrTruncated: false,
      },
    }));
    on("fs.stat", (_, e) => {
      const text = files[e.path];
      if (text === undefined) {
        throw new Error("ENOENT");
      }
      return {
        value: { kind: "file", size: text.length, mtimeMs: 1, isLink: false },
      };
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
    expect(await ui.find({ type: "Text", text: /Tree copy/ })).toBeDefined();
    expect(await ui.find({ key: "unit-U1", text: /running/ })).toBeDefined();

    // A unit finishes in the worktree: the timer alone shows it.
    files[live] = folder("Tree copy", "RUNNING", "green");
    await clock.advance(3500);
    expect(await ui.find({ type: "Text", text: /1\/1/ })).toBeDefined();

    // The landing archives the folder inside the worktree.
    delete files[live];
    files[archived] = folder("Archived copy", "COMPLETE", "green");
    await clock.advance(3500);
    expect(await ui.find({ type: "Text", text: /Archived copy/ }))
      .toBeDefined();
    expect(await ui.find({ type: "Text", text: /COMPLETE/ })).toBeDefined();

    // The merge: the worktree is gone; the main copy holds the state.
    delete files[archived];
    files[main] = folder("Merged copy", "COMPLETE", "green");
    await clock.advance(3500);
    expect(await ui.find({ type: "Text", text: /Merged copy/ })).toBeDefined();
    await ui.unmount();
  },
);
