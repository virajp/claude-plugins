import type { TestBody } from "claude-code/testing";
import {
  expect,
  mock,
  test,
} from "claude-code/testing";

const FOLDER = "2026-10-25-a-plan";
const MAIN = "/repo";
const HOME = "/home/me";
const LOG = `${HOME}/Library/Caches/vwf/repo/${FOLDER}.jsonl`;
const unit = (id: string, title: string, wave: number, status: string) => ({
  id,
  title,
  wave,
  file: `0${wave}-x.md`,
  kind: "edit",
  status,
  commit: "",
  rounds: 0,
  started: status === "pending" ? "" : "2026-10-25T09:40:00.000Z",
  ended: status === "pending" ? "" : "2026-10-25T09:50:00.000Z",
});
const FILES: Record<string, string> = {
  [`${MAIN}/docs/plans/index.json`]: JSON.stringify({
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
      started: "2026-10-25T09:30:00.000Z",
      ended: "",
    }],
  }),
  [`${MAIN}/docs/plans/${FOLDER}/index.json`]: JSON.stringify({
    format: 1,
    title: "A plan",
    status: { state: "RUNNING", detail: "" },
    units: [
      unit("U1", "The core", 1, "green"),
      unit("U2", "The pane", 2, "pending"),
      unit("U3", "The docs", 2, "skipped"),
    ],
    waves: [
      {
        id: "W1",
        status: "green",
        started: "2026-10-25T09:40:00.000Z",
        ended: "2026-10-25T09:50:00.000Z",
      },
      { id: "W2", status: "pending", started: "", ended: "" },
    ],
    stages: {
      renders: { state: "skipped", detail: "", started: "", ended: "" },
    },
    gaps: [
      {
        id: "G1",
        unit: "U2",
        stage: "",
        text: "U2 has no owner",
        state: "open",
      },
      { id: "G2", unit: "U1", stage: "", text: "settled", state: "closed" },
    ],
    run: {
      worktree: `.worktrees/${FOLDER}`,
      log: `~/Library/Caches/vwf/repo/${FOLDER}.jsonl`,
    },
  }),
  [LOG]: JSON.stringify({
    ts: "2026-10-25T09:59:00.000Z",
    run: "20261025-095900-aaaaaaaa",
    session: "aaaaaaaa-1111",
    agent: null,
    event: "run.start",
    mode: "fresh",
  }) + "\n",
};

type Engine = Parameters<TestBody>[0];
type On = Parameters<TestBody>[1];

// Seeds the plan files, types /vwf:execute and mounts the pane on one surface.
async function openPane(
  $: Engine,
  on: On,
  surface: "terminal" | "desktop",
  opened: string[],
  closed: string[],
) {
  mock.clock(on, { now: Date.parse("2026-10-25T10:00:00Z") });
  mock.env(on, { HOME });
  on("session.cwd", () => ({ value: MAIN }));
  on("session.id", () => ({ value: "aaaaaaaa-1111" }));
  on("process.run", () => ({
    value: {
      exitCode: 128,
      stdout: "",
      stderr: "",
      isStdoutTruncated: false,
      isStderrTruncated: false,
    },
  }));
  on("fs.stat", (_, e) => {
    const text = FILES[e.path];
    if (text === undefined) {
      throw new Error("ENOENT");
    }
    return {
      value: {
        kind: "file",
        size: text.length,
        mtimeMs: 1,
        isLink: false,
      },
    };
  });
  on("fs.read", (_, e) => {
    const text = FILES[e.path];
    if (text === undefined) {
      throw new Error("ENOENT");
    }
    return { value: text };
  });
  on("agent.list", () => ({ value: [] }));
  on("ui.open", (_, e) => {
    opened.push(e.id);
    return { value: { isPlaced: true } };
  });
  on("prompt.submit", (_, e) => e);
  on("ui.close", (_, e) => {
    closed.push(e.id);
    return { value: undefined as never };
  });

  await $.prompt.submit({
    text: `/vwf:execute docs/plans/${FOLDER}`,
    command: { name: "vwf:execute", args: `docs/plans/${FOLDER}` },
    wait: false,
    origin: { kind: "composer" },
  });
  expect(opened).toEqual(["vwf-monitor"]);

  return $.ui.mount({
    plugin: "vwf",
    surface,
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
}

test(
  "a typed /vwf:execute opens the pane with the plan, its unit titles and its gaps",
  async ($, on) => {
    const opened: string[] = [];
    const closed: string[] = [];
    const ui = await openPane($, on, "terminal", opened, closed);
    expect(await ui.find({ type: "Text", text: /A plan/ })).toBeDefined();
    expect(await ui.find({ key: "unit-U2", text: /The pane/ })).toBeDefined();
    expect(await ui.find({ key: "unit-U2", text: /1$/ })).toBeDefined();
    expect(await ui.find({ type: "Text", text: /G1 · U2 · U2 has no owner/ }))
      .toBeDefined();
    expect(await ui.find({ type: "Text", text: /settled/ })).toBe(undefined);
    expect(await ui.find({ type: "Text", text: /2\/3/ })).toBeDefined();
    expect(
      await ui.find({ type: "Text", text: /W1\s+wave\s+green\s+\d\d:\d\d/ }),
    )
      .toBeDefined();
    expect(await ui.find({ type: "Text", text: /W2\s+wave\s+pending/ }))
      .toBeDefined();
    expect(await ui.find({ type: "Text", text: /Started \d\d:\d\d/ }))
      .toBeDefined();
    expect(await ui.find({ type: "Text", text: new RegExp(LOG) }))
      .toBeDefined();
    // One segment for each unit: U1 finished without gaps is green, U2 is pending.
    const drawn = JSON.stringify(await ui.drawn());
    expect(drawn).toContain("{\"color\":\"green\"},\"children\":[\"█");
    expect(drawn).toContain("░");
    expect(drawn).toContain("{\"color\":\"gray\"},\"children\":[\"█");
    // In the main view, the Main transcript button is not drawn.
    expect(await ui.find({ key: "back" })).toBe(undefined);
    // Close (hotkey c) closes the pane.
    expect((await ui.find({ key: "close" }))?.props).toMatchObject({
      hotkey: "c",
    });
    await ui.press({ key: "close" });
    expect(closed).toEqual(["vwf-monitor"]);
    await ui.unmount();
  },
);

test(
  "on the desktop the pane draws the timeline, with no padding or key hints",
  async ($, on) => {
    const opened: string[] = [];
    const closed: string[] = [];
    const ui = await openPane($, on, "desktop", opened, closed);
    expect(await ui.find({ type: "Text", text: /^A plan$/ })).toBeDefined();
    expect(await ui.find({ type: "Text", text: /^The pane$/ })).toBeDefined();
    expect((await ui.find({ key: "unit-U2" }))?.props).toMatchObject({
      label: "U2",
    });
    expect(await ui.find({ type: "Text", text: /^U2 has no owner$/ }))
      .toBeDefined();
    expect(await ui.find({ key: "gap-toggle-G1" })).toBeDefined();
    expect(await ui.find({ type: "Text", text: /^2 of 3 units$/ })).toBeDefined();
    expect(await ui.find({ type: "Text", text: /^Wave 1$/ })).toBeDefined();
    expect(await ui.find({ type: "Text", text: /Started \d\d:\d\d/ }))
      .toBeDefined();
    expect(await ui.find({ key: "plans" })).toBeDefined();
    const drawn = JSON.stringify(await ui.drawn());
    // One segment for each unit: U1 green, U2 pending, U3 skipped gray.
    expect(drawn).toContain("#3fa66a");
    expect(drawn).toContain("2 of 3 units finished");
    expect(drawn).toContain("#8a8f98");
    expect(drawn).not.toContain("█");
    expect(drawn).not.toContain("ctrl+x tab");
    // Close is the native dismiss control, and still closes the pane.
    expect((await ui.find({ key: "close" }))?.props).toMatchObject({
      role: "dismiss",
    });
    await ui.press({ key: "close" });
    expect(closed).toEqual(["vwf-monitor"]);
    await ui.unmount();
  },
);

test(
  "on the desktop a unit id opens its details, and a gap id unfolds its text",
  async ($, on) => {
    const opened: string[] = [];
    const closed: string[] = [];
    const ui = await openPane($, on, "desktop", opened, closed);
    expect(await ui.find({ key: "transcript-U2" })).toBe(undefined);
    await ui.press({ key: "unit-U2" });
    expect(await ui.find({ key: "transcript-U2" })).toBeDefined();
    expect(await ui.find({ type: "Text", text: /^pending, 1 gap$/ })).toBeDefined();
    await ui.press({ key: "unit-U2" });
    expect(await ui.find({ key: "transcript-U2" })).toBe(undefined);
    expect((await ui.find({ key: "gap-toggle-G1" }))?.props).toMatchObject({
      label: "▸ G1",
    });
    await ui.press({ key: "gap-toggle-G1" });
    expect((await ui.find({ key: "gap-toggle-G1" }))?.props).toMatchObject({
      label: "▾ G1",
    });
    expect(await ui.find({ type: "Text", text: /^U2 has no owner$/ })).toBeDefined();
    await ui.unmount();
  },
);

const BAND = {
  plugin: "vwf",
  component: "AbovePrompt",
  props: {
    hasSurvey: false,
    isWorking: false,
    maxRows: 10,
    bodyColumns: 100,
    scroll: { offset: 0, bodyRows: 10 },
  },
};

test(
  "the chip above the prompt shows the units and opens the pane; a question takes the band",
  async ($, on) => {
    const opened: string[] = [];
    const closed: string[] = [];
    const ui = await openPane($, on, "desktop", opened, closed);
    const band = await $.ui.mount({ ...BAND, surface: "desktop" } as Parameters<typeof $.ui.mount>[0]);
    // The colored glyphs: U1 green, U2 pending, U3 skipped gray.
    // One glyph shape, since the app draws the empty glyph at another size.
    const glyphs = await band.findAll({ type: "Text", text: /^▰$/ });
    expect(glyphs.map((one) => one.props?.color)).toEqual(["#3fa66a", undefined, "#8a8f98"]);
    expect(glyphs[1]?.props?.dimColor).toBe(true);
    expect(await band.find({ type: "Text", text: /^▱$/ })).toBe(undefined);
    // The plan's name, its date dropped, and the counts.
    expect(await band.find({ type: "Text", text: /^a-plan$/ })).toBeDefined();
    expect(await band.find({ type: "Text", text: /^2\/3 $/ })).toBeDefined();
    expect((await band.find({ key: "vwf-chip" }))?.props).toMatchObject({
      label: "Monitor",
    });
    await band.press({ key: "vwf-chip" });
    expect(opened).toEqual(["vwf-monitor", "vwf-monitor"]);
    await band.unmount();
    await ui.unmount();
  },
);

test("in the terminal the chip is one Button", async ($, on) => {
  const opened: string[] = [];
  const closed: string[] = [];
  const ui = await openPane($, on, "terminal", opened, closed);
  const band = await $.ui.mount({ ...BAND, surface: "terminal" } as Parameters<typeof $.ui.mount>[0]);
  await band.press({ key: "vwf-chip" });
  expect(opened).toEqual(["vwf-monitor", "vwf-monitor"]);
  await band.unmount();
  await ui.unmount();
});
