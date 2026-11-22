/**
 * vwf's plan.mjs queue verbs — pick, resolve and claim — run for real over
 * temp repos with a bare `origin`: the base's main checkout, and a second
 * clone standing in for another session. Every fixture name is invented.
 */
import { spawnSync } from "node:child_process";
import {
  appendFileSync,
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

/** The main checkout: the parent of the git common dir, or its core.worktree (a submodule). */
const MAIN = `common=$(git rev-parse --path-format=absolute --git-common-dir)
tree=$(git config --file "$common/config" core.worktree)
if [ -n "$tree" ]; then main=$(cd "$common" && cd "$tree" && pwd -P); else main=$(dirname "$common"); fi`;

/** Each stub logs its arguments to stub-tasks.log in the git common dir. */
const LOG = `echo "$0 $*" >> "$(git rev-parse --path-format=absolute --git-common-dir)/stub-tasks.log"`;

/** git:merge:<b>: the hook pass (the .stub-hook-fail marker), then a merge and a push, or a pull request. */
const MERGE = `#!/bin/sh
${LOG}
into=$(basename "$0")
branch=$1
if [ -f .stub-hook-fail ]; then echo "- A hook failed without changing anything, so it needs a fix by hand." >&2; exit 1; fi
${MAIN}
origin=
if git remote get-url origin >/dev/null 2>&1; then origin=1; fi
if [ "$STUB_LANDING" = pr ]; then
  git push -q -u origin "$branch" || exit 1
  if command -v gh >/dev/null 2>&1; then gh pr create --base "$into" --head "$branch" --fill || exit 1; fi
  exit 0
fi
restore=$(git -C "$main" symbolic-ref --short -q HEAD)
cd "$main" || exit 1
git checkout -q "$into" || exit 1
if [ -n "$origin" ] && ! git pull -q --no-rebase origin "$into"; then
  if [ -n "$restore" ]; then git checkout -q "$restore"; fi
  exit 1
fi
if ! git merge -q --no-ff --no-edit "$branch"; then echo "FAILED to merge $branch into $into; the tree is left mid-merge" >&2; exit 1; fi
if [ -n "$origin" ] && ! git push -q origin "$into"; then echo "FAILED to push $into branch to origin!" >&2; exit 1; fi
if [ -n "$restore" ] && [ "$restore" != "$into" ]; then git checkout -q "$restore" || exit 1; fi
exit 0
`;

/** git:worktree:create: a new branch from --from; fails after the add on a .stub-create-fail marker. */
const CREATE = `#!/bin/sh
${LOG}
${MAIN}
name=$1; shift; from=
while [ "$#" -gt 0 ]; do case "$1" in --from) from=$2; shift 2 ;; *) shift ;; esac; done
dir=.worktrees
if [ ! -e "$main/.worktrees" ] && [ -d "$main/worktrees" ]; then dir=worktrees; fi
git worktree add --quiet -b "$name" "$main/$dir/$name" "$from" || exit 1
if [ -f "$main/.stub-create-fail" ]; then echo "mise trust failed." >&2; exit 1; fi
exit 0
`;

/** git:worktree:delete: remove the worktree, then the branch only when a core branch has it. */
const DELETE = `#!/bin/sh
${LOG}
branch=$1
wt=$(git worktree list --porcelain | awk -v b="branch refs/heads/$branch" '/^worktree /{p=substr($0,10)} $0==b{print p; exit}')
if [ -z "$wt" ]; then echo "no worktree has the branch '$branch'." >&2; exit 1; fi
git worktree remove "$wt" || { echo "git worktree remove failed." >&2; exit 1; }
for core in develop main trunk; do
  ref=
  if git show-ref --verify --quiet "refs/heads/$core"; then ref="refs/heads/$core"
  elif git show-ref --verify --quiet "refs/remotes/origin/$core"; then ref="refs/remotes/origin/$core"; fi
  if [ -n "$ref" ] && git merge-base --is-ancestor "refs/heads/$branch" "$ref"; then git branch -D -q "$branch"; exit 0; fi
done
echo "no core branch has each commit of '$branch', so the branch stays." >&2
echo "- delete it anyway: git branch -D $branch" >&2
exit 1
`;

/**
 * A `mise` that runs `run git:<x> -- <args>` as the stub file
 * .config/mise/tasks/git/<x> of the main checkout; every other call runs what
 * follows `--`, then the race script once, if any.
 */
const MISE = `#!/bin/sh
if [ "$1" = run ]; then
  name=$2; shift 2
  if [ "$1" = -- ]; then shift; fi
  ${MAIN}
  stub="$main/.config/mise/tasks/$(echo "$name" | tr ':' '/')"
  if [ ! -f "$stub" ]; then echo "mise ERROR no task $name found" >&2; exit 1; fi
  exec sh "$stub" "$@"
fi
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

/** Runs plan.mjs; a queue verb with no --branch gets --branch develop. */
function plan(cwd: string, args: string[], extra: NodeJS.ProcessEnv = {}) {
  const queue = ["pick", "resolve", "claim"].includes(args[0] ?? "") && !args.includes("--branch");
  return planRaw(cwd, queue ? [...args, "--branch", "develop"] : args, extra);
}

function planRaw(cwd: string, args: string[], extra: NodeJS.ProcessEnv = {}) {
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
  stubTasks(base);
}

/** The stub git:* tasks in `dir`'s .config/mise/tasks/git/, kept out of git status. */
function stubTasks(dir: string) {
  const tasks = join(dir, ".config", "mise", "tasks", "git");
  const files: [string, string][] = [
    ["merge/develop", MERGE],
    ["merge/main", MERGE],
    ["merge/trunk", MERGE],
    ["worktree/create", CREATE],
    ["worktree/delete", DELETE],
  ];
  for (const [path, text] of files) {
    write(join(tasks, path), text);
  }
  appendFileSync(join(dir, ".git", "info", "exclude"), "/.config/mise/tasks/git/\n");
}

/** A `gh` stub that opens a pull request and reports its URL. */
function ghStub() {
  const gh = join(root, "bin", "gh");
  writeFileSync(
    gh,
    `#!/bin/sh\ncase "$1 $2" in "pr view") printf '{"url":"%s"}\\n' https://example.com/pr/7 ;; *) echo https://example.com/pr/7 ;; esac\n`,
  );
  chmodSync(gh, 0o755);
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
  delete env.STUB_LANDING;
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
    expect(git(origin, "log", "-1", "--format=%P", "develop").split(" ")).toHaveLength(2);
    expect(git(origin, "log", "-1", "--format=%s", "develop^2")).toBe(MESSAGE);
    expect(git(origin, "show", "--name-only", "--format=", "develop^2").split("\n").sort())
      .toEqual([`${FOLDER}/index.json`, "docs/plans/index.json"]);
    expect(git(base, "branch", "--list", "vwf-claim-*")).toBe("");
    expect(git(base, "worktree", "list").split("\n")).toHaveLength(1);
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

  it("leaves the main checkout's own changes uncommitted and out of the claim", () => {
    seed([row(ID)], (s) => write(join(s, "notes.md"), "tracked\n"));
    writeFileSync(join(base, "notes.md"), "edited\n");
    writeFileSync(join(base, "scratch.txt"), "untracked\n");
    const r = plan(base, ["claim", FOLDER]);
    expect(r.status).toBe(0);
    expect(r.json.warning).toBeUndefined();
    expect(readFileSync(join(base, "notes.md"), "utf8")).toBe("edited\n");
    expect(readFileSync(join(base, "scratch.txt"), "utf8")).toBe("untracked\n");
    expect(git(origin, "show", "--name-only", "--format=", "develop^2")).not.toMatch(/notes|scratch/);
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
    expect(git(origin, "log", "-1", "--format=%s", "develop^2")).toBe(MESSAGE);
    expect(git(origin, "log", "-1", "--format=%s", "develop^1")).toBe("other");
    expect(claimed().row.status).toBe("RUNNING");
  });

  it("loses a same-row conflict at the rebase: exit 1, nothing pushed, the main checkout untouched", () => {
    seed([row(ID)]);
    const race = join(root, "race.sh");
    writeFileSync(
      race,
      [
        `cd "${other}"`,
        `PLAN_NOW=2026-11-13T01:00:00.000Z node "${SCRIPT}" set docs/plans/index.json plans.${ID}.status RUNNING`,
        "git add -A && git commit -q -m 'docs: plan queue — other session' && git push -q origin develop",
        "",
      ]
        .join("\n"),
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
    expect(git(base, "rev-parse", "HEAD")).toBe(before);
    expect(git(base, "branch", "--list", "vwf-claim-*")).toBe("");
  });

  it("waits on a pull request when develop lands through one, claiming nothing yet", () => {
    seed([row(ID)]);
    ghStub();
    const r = plan(base, ["claim", FOLDER], { STUB_LANDING: "pr" });
    expect(r.status).toBe(1);
    expect(r.json).toMatchObject({
      claimed: false,
      kind: "pr",
      url: "https://example.com/pr/7",
      branch: "vwf-claim-example-change",
      repo: base,
    });
    expect(git(origin, "log", "-1", "--format=%s", "develop")).toBe("seed");
    expect(git(origin, "log", "-1", "--format=%s", "vwf-claim-example-change")).toBe(MESSAGE);
    expect(git(base, "status", "--porcelain")).toBe("");
  });

  it("fails when the merge task's hook pass fails, claiming nothing", () => {
    seed([row(ID)], (s) => write(join(s, ".stub-hook-fail"), ""));
    const r = plan(base, ["claim", FOLDER]);
    expect(r.status).toBe(1);
    expect(r.json).toMatchObject({ claimed: false, kind: "failed" });
    expect(r.json.reason).toMatch(/A hook failed/);
    expect(r.json.unpushed).toBeUndefined();
    expect(claimed().row.status).toBe("APPROVED");
    expect(git(base, "branch", "--list", "vwf-claim-*")).toBe("");
  });

  it("fails on a conflict of the merge task, leaving the main checkout mid-merge", () => {
    seed([row(ID)]);
    const file = join(base, "docs", "plans", "index.json");
    writeFileSync(file, readFileSync(file, "utf8").replace("\"status\": \"APPROVED\"", "\"status\": \"DRAFT\""));
    git(base, "commit", "-q", "-am", "mine, unpushed");
    const r = plan(base, ["claim", FOLDER]);
    expect(r.status).toBe(1);
    expect(r.json).toMatchObject({ claimed: false, kind: "failed" });
    expect(r.json.reason).toMatch(/mid-merge.*docs\/plans\/index\.json/);
    expect(git(base, "rev-parse", "-q", "--verify", "MERGE_HEAD")).not.toBe("");
    expect(claimed().row.status).toBe("APPROVED");
  });

  it("stops on an unpushed merge commit with its push command", () => {
    seed([row(ID)]);
    const hook = join(origin, "hooks", "pre-receive");
    writeFileSync(hook, "#!/bin/sh\nexit 1\n");
    chmodSync(hook, 0o755);
    const r = plan(base, ["claim", FOLDER]);
    expect(r.status).toBe(1);
    expect(r.json).toMatchObject({ claimed: false, kind: "failed", unpushed: true });
    expect(r.json.reason).toMatch(/git push origin develop/);
    expect(git(base, "log", "-1", "--format=%s", "develop^2")).toBe(MESSAGE);
    expect(claimed().row.status).toBe("APPROVED");
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
    expect(r.json.reason).toMatch(/the commit failed/);
    expect(git(base, "status", "--porcelain")).toBe("");
    expect(git(base, "branch", "--list", "vwf-claim-*")).toBe("");
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

  it("reads origin/main with --branch main", () => {
    const r = plan(base, ["pick", "--branch", "main"]);
    expect(r.status).toBe(1);
    expect(r.json).toEqual({ nothing: [] });
  });
});

describe("the branch flags", () => {
  const ID = "2026-11-10-example-change";
  const FOLDER = `docs/plans/${ID}`;
  const MESSAGE = `docs: plan queue — ${ID} running`;

  /** A repo at `dir` with one commit on `branch`: the plan index and `rows`' folders. */
  function local(dir: string, branch: string, rows: Json[], config = "after_landing: []\n") {
    git(root, "init", "-q", "-b", branch, dir);
    write(join(dir, ".config", "vwf.yaml"), config);
    write(join(dir, "docs", "plans", "index.json"), `${JSON.stringify({ format: 1, plans: rows }, null, 2)}\n`);
    for (const r of rows) {
      if (!r.target_repo) {
        changeFolder(dir, r.folder);
      }
    }
    git(dir, "add", "-A");
    git(dir, "commit", "-q", "-m", "seed");
    stubTasks(dir);
  }

  it.each([
    ["pick", ["pick"]],
    ["resolve", ["resolve", FOLDER]],
    ["claim", ["claim", FOLDER]],
  ])("refuses %s with no --branch as a usage error", (_, args) => {
    seed([row(ID)]);
    const r = planRaw(base, args);
    expect(r.status).toBe(2);
    expect(r.stderr).toMatch(/needs --branch <name>/);
  });

  it("refuses --branch with no name", () => {
    seed([row(ID)]);
    expect(planRaw(base, ["pick", "--branch"]).status).toBe(2);
  });

  it("claims on origin/main in a main-only repo", () => {
    const s = join(root, "seed");
    git(root, "clone", "-q", origin, s);
    git(s, "symbolic-ref", "HEAD", "refs/heads/main");
    write(join(s, ".config", "vwf.yaml"), "after_landing: []\n");
    write(join(s, "docs", "plans", "index.json"), `${JSON.stringify({ format: 1, plans: [row(ID)] }, null, 2)}\n`);
    changeFolder(s, FOLDER);
    git(s, "add", "-A");
    git(s, "commit", "-q", "-m", "seed");
    git(s, "push", "-q", "origin", "main");
    git(root, "clone", "-q", "-b", "main", origin, base);
    stubTasks(base);
    expect(plan(base, ["pick", "--branch", "main"]).json).toEqual({
      pick: { folder: FOLDER, kind: "change", priority: 10 },
    });
    const r = plan(base, ["claim", FOLDER, "--branch", "main"]);
    expect(r.status).toBe(0);
    expect(git(origin, "log", "-1", "--format=%s", "main^2")).toBe(MESSAGE);
  });

  it("reads and claims on the local branch in a repo with no origin", () => {
    local(base, "main", [row(ID)]);
    expect(plan(base, ["pick", "--branch", "main"]).json).toEqual({
      pick: { folder: FOLDER, kind: "change", priority: 10 },
    });
    const r = plan(base, ["claim", FOLDER, "--branch", "main"]);
    expect(r.stderr).toBe("");
    expect(r.status).toBe(0);
    expect(r.json).toEqual({ claimed: true, commit: git(base, "rev-parse", "main") });
    expect(git(base, "log", "-1", "--format=%s", "main^2")).toBe(MESSAGE);
    const index = JSON.parse(git(base, "show", "main:docs/plans/index.json"));
    expect(index.plans[0]).toMatchObject({ status: "RUNNING", started: NOW });
    expect(git(base, "remote")).toBe("");
  });

  it("refuses a local branch that does not exist in a repo with no origin", () => {
    local(base, "main", [row(ID)]);
    const r = plan(base, ["pick"]);
    expect(r.status).toBe(2);
    expect(r.stderr).toMatch(/develop does not exist .*; the work branch is develop/);
  });

  it("needs --member-branch to claim a member folder, then commits on its branch", () => {
    const member = join(root, "example-api");
    const memberRow = row(ID, { target_repo: "example-api" });
    local(member, "trunk", []);
    changeFolder(member, FOLDER);
    git(member, "add", "-A");
    git(member, "commit", "-q", "-m", "the folder");
    local(base, "develop", [memberRow], "members:\n  - name: example-api\n    path: ../example-api\n");
    const without = plan(base, ["claim", FOLDER]);
    expect(without.status).toBe(1);
    expect(without.json).toMatchObject({ claimed: false, kind: "failed" });
    expect(without.json.reason).toMatch(/is a member repo; pass --member-branch <name>/);
    const r = plan(base, ["claim", FOLDER, "--member-branch", "trunk"]);
    expect(r.status).toBe(0);
    expect(git(base, "log", "-1", "--format=%s", "develop^2")).toBe(MESSAGE);
    expect(git(member, "log", "-1", "--format=%s", "trunk^2")).toBe(MESSAGE);
  });
});
