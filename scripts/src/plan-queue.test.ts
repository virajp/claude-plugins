/**
 * vwf's plan.mjs queue verbs — pick, resolve and claim — run for real over
 * temp repos with a bare `origin`: the base's main checkout, and a second
 * clone standing in for another session. Every fixture name is invented.
 */
import { spawnSync } from "node:child_process";
import {
  chmodSync,
  cpSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import {
  dirname,
  join,
} from "node:path";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
} from "vitest";

const SCRIPT = join(
  import.meta.dirname,
  "..",
  "..",
  "plugins",
  "vwf",
  "skills",
  "plan-management",
  "scripts",
  "plan.mjs",
);
const FOLDERS = join(import.meta.dirname, "fixtures", "plan-script");

/** The time PLAN_NOW pins for every run of the script. */
const NOW = "2026-11-13T02:00:00.000Z";

/** A parsed plan file. */
type Json = any;

let root: string;
let origin: string;
let base: string;
let other: string;
let env: NodeJS.ProcessEnv;

/** A `mise` that runs what follows `--`, then the race script once, if any. */
const MISE = `#!/bin/sh
if [ -n "$MISE_FAIL" ]; then echo "mise stub: failing on purpose" >&2; exit 1; fi
while [ "$#" -gt 0 ] && [ "$1" != "--" ]; do shift; done
shift
"$@"
status=$?
if [ -n "$RACE" ] && [ -f "$RACE" ]; then sh "$RACE" >/dev/null 2>&1; rm -f "$RACE"; fi
exit $status
`;

function git(cwd: string, ...args: string[]) {
  const r = spawnSync("git", args, { cwd, env, encoding: "utf8" });
  if (r.status !== 0) {
    throw new Error(`git ${args.join(" ")} in ${cwd}: ${r.stderr}`);
  }
  return r.stdout.trim();
}

function plan(cwd: string, args: string[], extra: NodeJS.ProcessEnv = {}) {
  const r = spawnSync("node", [SCRIPT, ...args], {
    cwd,
    env: { ...env, ...extra },
    encoding: "utf8",
  });
  let json: Json;
  try {
    json = JSON.parse(r.stdout);
  } catch {
    json = null;
  }
  return { status: r.status, json, stderr: r.stderr };
}

function write(file: string, text: string) {
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, text);
}

function row(id: string, over: Json = {}): Json {
  return {
    id,
    folder: `docs/plans/${id}`,
    kind: "change",
    title: `Plan ${id}`,
    target_repo: null,
    priority: 10,
    status: "APPROVED",
    started: "",
    ended: "",
    gaps: null,
    requires: [],
    backlog: [],
    backlog_pieces: [],
    ...over,
  };
}

/** A change folder copied from the plan-script fixture, in `repo`. */
function changeFolder(repo: string, path: string) {
  cpSync(join(FOLDERS, "change"), join(repo, path), { recursive: true });
}

/** A cycle folder whose covers list is `covers`, in `repo`. */
function cycleFolder(repo: string, path: string, covers: string[]) {
  cpSync(join(FOLDERS, "cycle"), join(repo, path), { recursive: true });
  const file = join(repo, path, "index.json");
  const doc = JSON.parse(readFileSync(file, "utf8"));
  doc.covers = covers;
  writeFileSync(file, `${JSON.stringify(doc, null, 2)}\n`);
}

/**
 * Commit the seed on develop and push it, then clone the base and the other
 * session. `build` writes into the seed checkout; a row whose folder it does
 * not write gets a change folder.
 */
function seed(rows: Json[], build: (seed: string) => void = () => {}, config = "after_landing: []\n") {
  const s = join(root, "seed");
  git(root, "clone", "-q", origin, s);
  git(s, "symbolic-ref", "HEAD", "refs/heads/develop");
  write(join(s, ".config", "vwf.yaml"), config);
  write(join(s, "docs", "plans", "index.json"), `${JSON.stringify({ format: 1, plans: rows }, null, 2)}\n`);
  build(s);
  for (const r of rows) {
    if (!r.target_repo && !readExists(join(s, r.folder, "index.json"))) {
      changeFolder(s, r.folder);
    }
  }
  git(s, "add", "-A");
  git(s, "commit", "-q", "-m", "seed");
  git(s, "push", "-q", "origin", "develop");
  git(root, "clone", "-q", "-b", "develop", origin, base);
  git(root, "clone", "-q", "-b", "develop", origin, other);
}

function readExists(file: string) {
  try {
    readFileSync(file);
    return true;
  } catch {
    return false;
  }
}

/** A file's text at origin/develop, fetched fresh. */
function atOrigin(path: string): string {
  return git(origin, "show", `develop:${path}`);
}

beforeEach(() => {
  root = realpathSync(mkdtempSync(join(tmpdir(), "vwf-queue-")));
  origin = join(root, "origin.git");
  base = join(root, "base");
  other = join(root, "other");
  const bin = join(root, "bin");
  mkdirSync(bin);
  writeFileSync(join(bin, "mise"), MISE);
  chmodSync(join(bin, "mise"), 0o755);
  const gitconfig = join(root, "gitconfig");
  writeFileSync(gitconfig, "[init]\n\tdefaultBranch = develop\n[advice]\n\tdetachedHead = false\n");
  env = {
    ...process.env,
    PATH: `${bin}:${process.env.PATH}`,
    GIT_CONFIG_GLOBAL: gitconfig,
    GIT_CONFIG_NOSYSTEM: "1",
    GIT_AUTHOR_NAME: "Example Author",
    GIT_AUTHOR_EMAIL: "author@example.com",
    GIT_COMMITTER_NAME: "Example Author",
    GIT_COMMITTER_EMAIL: "author@example.com",
    PLAN_NOW: NOW,
  };
  delete env.RACE;
  delete env.MISE_FAIL;
  git(root, "init", "-q", "--bare", "-b", "develop", origin);
});

afterEach(() => {
  rmSync(root, { recursive: true, force: true });
});

describe("pick", () => {
  it("orders by priority, then date prefix, then name", () => {
    seed([
      row("2026-11-01-early", { priority: 20 }),
      row("2026-11-03-late"),
      row("2026-11-02-beta"),
      row("2026-11-02-alpha"),
    ]);
    const r = plan(base, ["pick"]);
    expect(r.status).toBe(0);
    expect(r.json).toEqual({
      pick: { folder: "docs/plans/2026-11-02-alpha", kind: "change", priority: 10 },
    });
  });

  it("never picks a RUNNING row", () => {
    seed([
      row("2026-11-01-running", { status: "RUNNING", started: NOW }),
      row("2026-11-05-waiting", { priority: 20 }),
    ]);
    const r = plan(base, ["pick"]);
    expect(r.status).toBe(0);
    expect(r.json.pick.folder).toBe("docs/plans/2026-11-05-waiting");
  });

  it("lists what each APPROVED row waits on when nothing is runnable", () => {
    seed([
      row("2026-11-01-running", { status: "RUNNING", started: NOW }),
      row("2026-11-02-next", { priority: 20, requires: ["docs/plans/2026-11-01-running"] }),
      row("2026-11-03-lost", { requires: ["docs/plans/2026-01-01-nowhere"] }),
    ]);
    const r = plan(base, ["pick"]);
    expect(r.status).toBe(1);
    expect(r.json.nothing).toEqual([
      { folder: "docs/plans/2026-11-02-next", waits: ["2026-11-01-running: row is RUNNING"] },
      { folder: "docs/plans/2026-11-03-lost", waits: [expect.stringMatching(/unresolvable/)] },
    ]);
  });

  it("reads the tip, not the working copy", () => {
    seed([row("2026-11-01-only", { status: "RUNNING", started: NOW })]);
    const local = join(base, "docs", "plans", "index.json");
    const doc = JSON.parse(readFileSync(local, "utf8"));
    doc.plans[0].status = "APPROVED";
    writeFileSync(local, JSON.stringify(doc));
    const r = plan(base, ["pick"]);
    expect(r.status).toBe(1);
    expect(r.json).toEqual({ nothing: [] });
  });

  it("finds nothing when the tip has no plan index", () => {
    seed([], (s) => rmSync(join(s, "docs", "plans", "index.json")));
    const r = plan(base, ["pick"]);
    expect(r.status).toBe(1);
    expect(r.json).toEqual({ nothing: [] });
  });
});

describe("resolve", () => {
  const ID = "2026-11-10-target";

  it("satisfies a change requirement on a COMPLETE row", () => {
    seed([
      row("2026-11-01-done", { status: "COMPLETE", started: NOW, ended: NOW }),
      row(ID, { requires: ["docs/plans/2026-11-01-done"] }),
    ]);
    const r = plan(base, ["resolve", `docs/plans/${ID}`]);
    expect(r.status).toBe(0);
    expect(r.json).toEqual({
      runnable: true,
      entries: [{
        entry: "2026-11-01-done",
        kind: "change",
        satisfied: true,
        reason: "2026-11-01-done: row is COMPLETE",
      }],
    });
  });

  it("satisfies an archived folder with no row, read from the tip", () => {
    seed([row(ID, { requires: ["docs/plans/2026-11-01-swept", "docs/plans/2026-11-02-old"] })], (s) => {
      changeFolder(s, "docs/plans/archived/2026-11-01-swept");
      write(join(s, "docs", "plans", "archived", "2026-11-02-old", "plan.md"), "# old format\n");
    });
    const r = plan(base, ["resolve", ID]);
    expect(r.status).toBe(0);
    expect(r.json.entries.map((e: Json) => [e.entry, e.kind, e.satisfied])).toEqual([
      ["2026-11-01-swept", "change", true],
      ["2026-11-02-old", null, true],
    ]);
  });

  it("does not see an archived folder that is only on disk", () => {
    seed([row(ID, { requires: ["docs/plans/2026-11-01-local"] })]);
    changeFolder(base, "docs/plans/archived/2026-11-01-local");
    const r = plan(base, ["resolve", ID]);
    expect(r.status).toBe(1);
    expect(r.json.entries[0].reason).toMatch(/unresolvable/);
  });

  it("does not satisfy a change requirement on an APPROVED row", () => {
    seed([row("2026-11-01-first"), row(ID, { requires: ["docs/plans/2026-11-01-first"] })]);
    const r = plan(base, ["resolve", ID]);
    expect(r.status).toBe(1);
    expect(r.json).toEqual({
      runnable: false,
      entries: [{
        entry: "2026-11-01-first",
        kind: "change",
        satisfied: false,
        reason: "2026-11-01-first: row is APPROVED",
      }],
    });
  });

  it("resolves a cycle requirement by its covers docs' frontmatter", () => {
    const flow = "docs/blueprint/flows/example/001-sign-in/index.md";
    const entity = "docs/blueprint/entities/account/index.md";
    seed(
      [
        row("2026-11-01-0900-sign-in", { kind: "cycle", status: "COMPLETE", started: NOW, ended: NOW }),
        row("2026-11-02-0900-account", { kind: "cycle", status: "COMPLETE", started: NOW, ended: NOW }),
        row(ID, { requires: ["docs/plans/2026-11-01-0900-sign-in", "docs/plans/2026-11-02-0900-account"] }),
      ],
      (s) => {
        cycleFolder(s, "docs/plans/2026-11-01-0900-sign-in", [flow]);
        cycleFolder(s, "docs/plans/2026-11-02-0900-account", [entity]);
        write(join(s, flow), "---\nkind: flow\nimplementation: complete\n---\n# Sign in\n");
        write(join(s, entity), "---\nkind: entity\nimplementation: partial # pipeline\n---\n# Account\n");
      },
    );
    const r = plan(base, ["resolve", ID]);
    expect(r.status).toBe(1);
    expect(r.json.entries).toEqual([
      {
        entry: "2026-11-01-0900-sign-in",
        kind: "cycle",
        satisfied: true,
        reason: "2026-11-01-0900-sign-in: every covers doc reads implementation: complete",
      },
      {
        entry: "2026-11-02-0900-account",
        kind: "cycle",
        satisfied: false,
        reason: `2026-11-02-0900-account: covers doc ${entity} reads implementation: partial`,
      },
    ]);
  });

  it("refuses an entry with no row and no folder", () => {
    seed([row(ID, { requires: ["docs/plans/2026-01-01-nowhere"] })]);
    const r = plan(base, ["resolve", ID]);
    expect(r.status).toBe(1);
    expect(r.json.entries[0]).toMatchObject({ entry: "2026-01-01-nowhere", kind: null, satisfied: false });
    expect(r.json.entries[0].reason).toMatch(/unresolvable/);
  });

  it("leaves a cycle requirement in an uncloned member unsatisfied", () => {
    seed(
      [
        row("2026-11-01-0900-remote", {
          kind: "cycle",
          target_repo: "example-api",
          status: "COMPLETE",
          started: NOW,
          ended: NOW,
        }),
        row(ID, { requires: ["docs/plans/2026-11-01-0900-remote"] }),
      ],
      () => {},
      "members:\n  - name: example-api\n    path: ../example-api\n    url: git@example.com:example/api.git\n    projects: [ api ]\n",
    );
    const r = plan(base, ["resolve", ID]);
    expect(r.status).toBe(1);
    expect(r.json.entries[0].reason).toBe(
      "2026-11-01-0900-remote: member example-api is not cloned; clone it to resolve this requirement",
    );
  });

  it("exits 2 on a folder with no row", () => {
    seed([row(ID)]);
    const r = plan(base, ["resolve", "docs/plans/2026-01-01-absent"]);
    expect(r.status).toBe(2);
    expect(r.stderr).toMatch(/no row for 2026-01-01-absent/);
  });
});

describe("claim", () => {
  const ID = "2026-11-10-example-change";
  const FOLDER = `docs/plans/${ID}`;
  const MESSAGE = `docs: plan queue — ${ID} running`;
  const RUN = { worktree: ".worktrees/example-change", log: `~/Library/Caches/vwf/base/${ID}.jsonl` };

  function claimed() {
    const index = JSON.parse(atOrigin("docs/plans/index.json"));
    const folder = JSON.parse(atOrigin(`${FOLDER}/index.json`));
    return { row: index.plans.find((p: Json) => p.id === ID), run: folder.run };
  }

  it("claims on a clean tree: the row RUNNING and run, one pushed commit", () => {
    seed([row(ID)]);
    const r = plan(base, ["claim", FOLDER]);
    expect(r.stderr).toBe("");
    expect(r.status).toBe(0);
    expect(r.json).toEqual({ claimed: true, commit: git(base, "rev-parse", "HEAD") });
    expect(git(origin, "log", "-1", "--format=%s", "develop")).toBe(MESSAGE);
    expect(git(origin, "show", "--name-only", "--format=", "develop").split("\n").sort())
      .toEqual([`${FOLDER}/index.json`, "docs/plans/index.json"]);
    const { row: claimedRow, run } = claimed();
    expect(claimedRow).toMatchObject({ status: "RUNNING", started: NOW, ended: "" });
    expect(run).toEqual(RUN);
    expect(git(base, "status", "--porcelain")).toBe("");
  });

  it("writes the --worktree path in place of the default", () => {
    seed([row(ID)]);
    const r = plan(base, ["claim", FOLDER, "--worktree", ".worktrees/all-2026-11-13-0200"]);
    expect(r.status).toBe(0);
    expect(claimed().run.worktree).toBe(".worktrees/all-2026-11-13-0200");
  });

  it("names the worktree dir worktrees when only that one exists", () => {
    seed([row(ID)]);
    mkdirSync(join(base, "worktrees"));
    expect(plan(base, ["claim", FOLDER]).status).toBe(0);
    expect(claimed().run.worktree).toBe("worktrees/example-change");
  });

  it("stashes a dirty tree and pops it back", () => {
    seed([row(ID)], (s) => write(join(s, "notes.md"), "tracked\n"));
    writeFileSync(join(base, "notes.md"), "edited\n");
    writeFileSync(join(base, "scratch.txt"), "untracked\n");
    const r = plan(base, ["claim", FOLDER]);
    expect(r.status).toBe(0);
    expect(r.json.warning).toBeUndefined();
    expect(readFileSync(join(base, "notes.md"), "utf8")).toBe("edited\n");
    expect(readFileSync(join(base, "scratch.txt"), "utf8")).toBe("untracked\n");
    expect(git(base, "stash", "list")).toBe("");
    expect(git(origin, "show", "--name-only", "--format=", "develop")).not.toMatch(/notes|scratch/);
  });

  it("restores its own stash when another is pushed on top of it", () => {
    seed([row(ID)], (s) => write(join(s, "notes.md"), "tracked\n"));
    writeFileSync(join(base, "notes.md"), "edited\n");
    const race = join(root, "race.sh");
    writeFileSync(
      race,
      `cd "${base}" && echo foreign > foreign.txt && git stash push -q -u -m "another session"\n`,
    );
    const r = plan(base, ["claim", FOLDER], { RACE: race });
    expect(r.status).toBe(0);
    expect(r.json.warning).toBeUndefined();
    expect(readFileSync(join(base, "notes.md"), "utf8")).toBe("edited\n");
    expect(readExists(join(base, "foreign.txt"))).toBe(false);
    expect(git(base, "stash", "list", "--format=%gs").split("\n")).toEqual(["On develop: another session"]);
  });

  it("claims from another branch and checks it out back", () => {
    seed([row(ID)]);
    git(base, "checkout", "-q", "-b", "feature");
    const r = plan(base, ["claim", FOLDER]);
    expect(r.status).toBe(0);
    expect(git(base, "symbolic-ref", "--short", "HEAD")).toBe("feature");
    expect(claimed().row.status).toBe("RUNNING");
  });

  it("rebases cleanly over another session's push and pushes again", () => {
    seed([row(ID)]);
    const race = join(root, "race.sh");
    writeFileSync(
      race,
      `cd "${other}" && echo x > other.txt && git add other.txt && git commit -q -m other && git push -q origin develop\n`,
    );
    const r = plan(base, ["claim", FOLDER], { RACE: race });
    expect(r.status).toBe(0);
    expect(git(origin, "log", "-2", "--format=%s", "develop").split("\n")).toEqual([MESSAGE, "other"]);
    expect(claimed().row.status).toBe("RUNNING");
  });

  it("loses a same-row conflict: restored, exit 1, nothing pushed", () => {
    seed([row(ID)]);
    const race = join(root, "race.sh");
    writeFileSync(
      race,
      [
        `cd "${other}"`,
        `PLAN_NOW=2026-11-13T01:00:00.000Z node "${SCRIPT}" set docs/plans/index.json plans.${ID}.status RUNNING`,
        "git add -A && git commit -q -m 'docs: plan queue — other session' && git push -q origin develop",
        "",
      ].join("\n"),
    );
    const before = git(base, "rev-parse", "HEAD");
    const r = plan(base, ["claim", FOLDER], { RACE: race });
    expect(r.status).toBe(1);
    expect(r.json).toMatchObject({ claimed: false, kind: "lost" });
    expect(git(origin, "log", "-1", "--format=%s", "develop")).toBe("docs: plan queue — other session");
    expect(claimed().row.started).toBe("2026-11-13T01:00:00.000Z");
    expect(git(origin, "log", "--format=%s", "develop")).not.toMatch(MESSAGE);
    expect(git(base, "status", "--porcelain")).toBe("");
    expect(git(base, "symbolic-ref", "--short", "HEAD")).toBe("develop");
    expect(git(base, "rev-parse", "HEAD")).not.toBe(before);
  });

  it("refuses a row already RUNNING at the tip as lost", () => {
    seed([row(ID, { status: "RUNNING", started: NOW })]);
    const r = plan(base, ["claim", FOLDER]);
    expect(r.status).toBe(1);
    expect(r.json).toMatchObject({ claimed: false, kind: "lost" });
  });

  it("undoes a failed commit and refuses", () => {
    seed([row(ID)]);
    const r = plan(base, ["claim", FOLDER], { MISE_FAIL: "1" });
    expect(r.status).toBe(1);
    expect(r.json).toMatchObject({ claimed: false, kind: "failed" });
    expect(r.json.reason).toMatch(/the claim commit failed/);
    expect(git(base, "status", "--porcelain")).toBe("");
    expect(git(origin, "log", "-1", "--format=%s", "develop")).toBe("seed");
  });
});

describe("origin/develop absent", () => {
  beforeEach(() => {
    const s = join(root, "seed");
    git(root, "clone", "-q", origin, s);
    git(s, "symbolic-ref", "HEAD", "refs/heads/main");
    write(join(s, ".config", "vwf.yaml"), "after_landing: []\n");
    write(join(s, "docs", "plans", "index.json"), `${JSON.stringify({ format: 1, plans: [] })}\n`);
    git(s, "add", "-A");
    git(s, "commit", "-q", "-m", "seed");
    git(s, "push", "-q", "origin", "main");
    git(root, "clone", "-q", "-b", "main", origin, base);
  });

  it("refuses pick and resolve with exit 2", () => {
    for (const args of [["pick"], ["resolve", "docs/plans/2026-11-10-x"]]) {
      const r = plan(base, args);
      expect(r.status).toBe(2);
      expect(r.stderr).toMatch(/origin\/develop does not exist/);
    }
  });

  it("refuses the claim as failed", () => {
    const r = plan(base, ["claim", "docs/plans/2026-11-10-x"]);
    expect(r.status).toBe(1);
    expect(r.json).toMatchObject({ claimed: false, kind: "failed" });
    expect(r.json.reason).toMatch(/origin\/develop does not exist/);
  });
});
