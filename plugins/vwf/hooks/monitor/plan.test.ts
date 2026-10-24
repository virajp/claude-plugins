import {
  expect,
  test,
} from "claude-code/testing";

import {
  folderIn,
  gapsOf,
  hostOf,
  isFinished,
  isFollowed,
  joinPath,
  memberPaths,
  parseIndex,
  resolveBase,
  reviewName,
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
