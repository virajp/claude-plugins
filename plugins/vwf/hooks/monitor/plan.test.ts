import {
  expect,
  test,
} from "claude-code/testing";

import {
  folderIn,
  gapsOf,
  isFinished,
  parseIndex,
  runningFolders,
  unitFor,
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
