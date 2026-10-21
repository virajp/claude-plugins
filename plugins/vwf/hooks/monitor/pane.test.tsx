import {
  expect,
  test,
} from "claude-code/testing";

const FOLDER = "2026-10-18-a-plan";
const INDEX = `# Plan — A plan (2026-10-18)

## Status

**RUNNING**

## Units

| Id | Wave | Unit file              | Kind | Status  | Commit |
| -- | ---- | ---------------------- | ---- | ------- | ------ |
| U1 | 1    | [01-a.md](01-a.md)     | edit | green   | abc    |
| U2 | 2    | [02-b.md](02-b.md)     | code | pending |        |
| U3 | 2    | [03-c.md](03-c.md)     | edit | skipped |        |

## Run log

| Wave | Unit | Model | Round | Outcome | Detail | Commit |
| ---- | ---- | ----- | ----- | ------- | ------ | ------ |

## Gaps surfaced during execution

- U2 has no owner

## Launch
`;

test(
  "a typed /vwf:execute opens the pane with the plan, its units and its gaps",
  async ($, on) => {
    const opened: string[] = [];
    on("clock.now", () => ({ value: 1000 }));
    on("session.cwd", () => ({ value: "/repo" }));
    on(
      "process.run",
      () => ({
        value: {
          exitCode: 0,
          stdout: "worktree /repo\n",
          stderr: "",
          isStdoutTruncated: false,
          isStderrTruncated: false,
        },
      }),
    );
    on(
      "fs.stat",
      () => ({ value: { kind: "file", size: 1, mtimeMs: 1, isLink: false } }),
    );
    on("fs.read", () => ({ value: INDEX }));
    on("agent.list", () => ({ value: [] }));
    on("ui.open", (_, e) => {
      opened.push(e.id);
      return { value: { isPlaced: true } };
    });
    on("prompt.submit", (_, e) => e);
    const closed: string[] = [];
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
    expect(await ui.find({ type: "Text", text: /A plan/ })).toBeDefined();
    expect(await ui.find({ key: "unit-U2" })).toBeDefined();
    expect(await ui.find({ type: "Text", text: /U2 has no owner/ }))
      .toBeDefined();
    expect(await ui.find({ type: "Text", text: /2\/3/ })).toBeDefined();
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
