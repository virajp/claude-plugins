/**
 * vwf's execute start.mjs, run for real over temp repos with a bare `origin`:
 * the base's main checkout and a second clone standing in for another
 * session, a scratch log root ($VWF_LOG_ROOT) and session id, and a stub
 * `mise` on a temp PATH. Every fixture name is invented.
 */
import { spawnSync } from "node:child_process";
import {
  appendFileSync,
  chmodSync,
  cpSync,
  existsSync,
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

const SKILLS = join(import.meta.dirname, "..", "..", "plugins", "vwf", "skills");
const START = join(SKILLS, "execute", "scripts", "start.mjs");
const PLAN = join(SKILLS, "plan-management", "scripts", "plan.mjs");
const CHANGE = join(import.meta.dirname, "fixtures", "execute-start", "change");

const NOW = "2026-11-13T02:00:00.000Z";
const SESSION = "c0ffee00-1111-2222-3333-444455556666";
const A = "2026-11-01-alpha";
const B = "2026-11-02-beta";

/** A parsed JSON file. */
type Json = any;

let root: string;
let origin: string;
let base: string;
let other: string;
let logs: string;
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
for core in develop main; do
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

/**
 * A `bootstrap` that answers `config get <key> --json` from the
 * .bootstrap-stub.json of its cwd (a key it lacks reads null), and
 * `describe --json` from that file's describe key, in the shape the real
 * bootstrap prints (D29): data.tools[] {name, category, values.projects},
 * data.ports[] {name, present}. With no such file it exits 2 as a repo with
 * no .config/bootstrap/ does; a describe key of "fail" fails the describe.
 */
const BOOTSTRAP = `#!${process.execPath}
const { existsSync, readFileSync } = require("node:fs");
const args = process.argv.slice(2);
const command = args[0] === "describe" ? "describe" : "config get";
const out = (ok, code, data, errors) => {
  process.stdout.write(JSON.stringify({ contract: 1, command, ok, code, data, errors, warnings: [] }) + "\\n");
  process.exit(code);
};
const describe = args.length === 2 && args[0] === "describe" && args[1] === "--json";
const get = args.length === 4 && args[0] === "config" && args[1] === "get" && args[3] === "--json";
if (!describe && !get) {
  out(false, 2, null, [{ code: "usage", message: "the stub answers config get and describe only" }]);
}
if (!existsSync(".bootstrap-stub.json")) {
  out(false, 2, null, [{ code: "config", message: "no .config/bootstrap/ here: run bootstrap migrate" }]);
}
const facts = JSON.parse(readFileSync(".bootstrap-stub.json", "utf8"));
if (describe) {
  if (facts.describe === "fail") {
    out(false, 1, null, [{ code: "describe", message: "the values file does not parse" }]);
  }
  out(true, 0, facts.describe ?? { repo: {}, tools: [], members: [], ports: [], lsp: {} }, []);
}
const key = args[2];
out(true, 0, { key, value: key in facts ? facts[key] : null, source: "file" }, []);
`;

function git(cwd: string, ...args: string[]) {
  const r = spawnSync("git", args, { cwd, env, encoding: "utf8" });
  if (r.status !== 0) {
    throw new Error(`git ${args.join(" ")} in ${cwd}: ${r.stderr}`);
  }
  return r.stdout.trim();
}

/** Runs start.mjs; a call with arguments and no --branch gets --branch develop. */
function start(args: string[], extra: NodeJS.ProcessEnv = {}, cwd = base) {
  const add = args.length > 0 && !args.includes("--branch");
  return startRaw(add ? [...args, "--branch", "develop"] : args, extra, cwd);
}

function startRaw(args: string[], extra: NodeJS.ProcessEnv = {}, cwd = base) {
  const r = spawnSync("node", [START, ...args], {
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

function writeJson(file: string, doc: Json) {
  write(file, `${JSON.stringify(doc, null, 2)}\n`);
}

function readJson(file: string): Json {
  return JSON.parse(readFileSync(file, "utf8"));
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

/** The change fixture at `repo`/`path`, its index.json passed through `edit`. */
function folder(repo: string, path: string, edit: (doc: Json) => void = () => {}) {
  cpSync(CHANGE, join(repo, path), { recursive: true });
  const file = join(repo, path, "index.json");
  const doc = readJson(file);
  edit(doc);
  writeJson(file, doc);
}

interface Seed {
  rows: Json[];
  build?: (seed: string) => void;
  config?: string;
  skip?: string[];
}

/**
 * Commit the seed on develop and push it, then clone the base and the other
 * session. A row whose folder `build` does not write, and is not in `skip`,
 * gets the change fixture.
 */
function seed({ rows, build = () => {}, config = "after_landing: []\n", skip = [] }: Seed) {
  const s = join(root, "seed");
  git(root, "clone", "-q", origin, s);
  git(s, "symbolic-ref", "HEAD", "refs/heads/develop");
  write(join(s, ".config", "vwf.yaml"), config);
  writeJson(join(s, "docs", "plans", "index.json"), { format: 1, plans: rows });
  build(s);
  for (const r of rows) {
    if (!skip.includes(r.id) && !existsSync(join(s, r.folder, "index.json"))) {
      folder(s, r.folder);
    }
  }
  git(s, "add", "-A");
  git(s, "commit", "-q", "-m", "seed");
  git(s, "push", "-q", "origin", "develop");
  git(root, "clone", "-q", "-b", "develop", origin, base);
  git(root, "clone", "-q", "-b", "develop", origin, other);
  stubTasks(base);
}

/** The bootstrap stub's facts in `dir`, kept out of git status. */
function facts(dir: string, value: Json = {}) {
  writeFileSync(join(dir, ".bootstrap-stub.json"), JSON.stringify(value));
  appendFileSync(join(dir, ".git", "info", "exclude"), "/.bootstrap-stub.json\n");
}

/** The stub git:* tasks in `dir`'s .config/mise/tasks/git/, and empty bootstrap facts, kept out of git status. */
function stubTasks(dir: string) {
  const tasks = join(dir, ".config", "mise", "tasks", "git");
  const files: [string, string][] = [
    ["merge/develop", MERGE],
    ["merge/main", MERGE],
    ["worktree/create", CREATE],
    ["worktree/delete", DELETE],
  ];
  for (const [path, text] of files) {
    write(join(tasks, path), text);
  }
  appendFileSync(join(dir, ".git", "info", "exclude"), "/.config/mise/tasks/git/\n");
  facts(dir);
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

function atOrigin(path: string): Json {
  return JSON.parse(git(origin, "show", `develop:${path}`));
}

function rowAtOrigin(id: string): Json {
  return atOrigin("docs/plans/index.json").plans.find((r: Json) => r.id === id);
}

/** The events of a plan's log in the base repo's log dir. */
function events(id: string): Json[] {
  const file = join(logs, "base", `${id}.jsonl`);
  if (!existsSync(file)) {
    return [];
  }
  return readFileSync(file, "utf8").trim().split("\n").map((l) => JSON.parse(l));
}

/** The event names of a log, with phase events as name:phase. */
function trail(id: string): string[] {
  return events(id).map((e) => (e.phase ? `${e.event}:${e.phase}` : e.event));
}

beforeEach(() => {
  root = realpathSync(mkdtempSync(join(tmpdir(), "vwf-start-")));
  origin = join(root, "origin.git");
  base = join(root, "base");
  other = join(root, "other");
  logs = join(root, "logs");
  const bin = join(root, "bin");
  mkdirSync(bin);
  writeFileSync(join(bin, "mise"), MISE);
  chmodSync(join(bin, "mise"), 0o755);
  writeFileSync(join(bin, "bootstrap"), BOOTSTRAP);
  chmodSync(join(bin, "bootstrap"), 0o755);
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
    VWF_LOG_ROOT: logs,
    CLAUDE_CODE_SESSION_ID: SESSION,
  };
  delete env.RACE;
  delete env.MISE_FAIL;
  delete env.STUB_LANDING;
  git(root, "init", "-q", "--bare", "-b", "develop", origin);
});

afterEach(() => {
  rmSync(root, { recursive: true, force: true });
});

describe("the format test", () => {
  it("refuses a repo with docs/plans/index.md before anything else", () => {
    seed({ rows: [row(A)], build: (s) => write(join(s, "docs", "plans", "index.md"), "# Plans\n") });
    const r = start([`docs/plans/${A}`]);
    expect(r.status).toBe(1);
    expect(r.json).toMatchObject({ result: "refused", mode: null, claim: null });
    expect(r.json.message).toMatch(/old plan format.*migrate\.md/);
    expect(existsSync(logs)).toBe(false);
    expect(rowAtOrigin(A).status).toBe("APPROVED");
  });

  it("refuses a named folder holding index.md and no index.json", () => {
    seed({ rows: [] });
    write(join(base, "docs", "plans", "2026-10-01-old", "index.md"), "# Old\n");
    const r = start(["docs/plans/2026-10-01-old"]);
    expect(r.status).toBe(1);
    expect(r.json.message).toMatch(/old plan format/);
  });
});

describe("next", () => {
  it("returns nothing when no row is runnable", () => {
    seed({ rows: [row(A, { status: "COMPLETE" })] });
    const r = start(["next"]);
    expect(r.status).toBe(1);
    expect(r.json).toMatchObject({ result: "nothing", claim: null });
    expect(existsSync(logs)).toBe(false);
  });

  it("re-picks after a lost claim, closing the lost run's log", () => {
    seed({ rows: [row(A, { priority: 1 }), row(B, { priority: 2 })] });
    const race = join(root, "race.sh");
    writeFileSync(
      race,
      [
        `cd "${other}"`,
        `PLAN_NOW=2026-11-13T01:00:00.000Z node "${PLAN}" set docs/plans/index.json plans.${A}.status RUNNING`,
        "git add -A && git commit -q -m 'docs: plan queue — other session' && git push -q origin develop",
        "",
      ]
        .join("\n"),
    );
    const r = start(["next"], { RACE: race });
    expect(r.status).toBe(0);
    expect(r.json).toMatchObject({ result: "ready", mode: "fresh", folder: `docs/plans/${B}` });
    expect(r.json.claim).toMatchObject({ claimed: true });
    expect(trail(A).slice(-3)).toEqual(["phase.end:claim", "stop", "run.end"]);
    expect(events(A).at(-1).outcome).toBe("claim-lost");
    expect(rowAtOrigin(B).status).toBe("RUNNING");
  });

  it("refuses a picked plan that fails a refusal, with no re-pick", () => {
    seed({
      rows: [row(A, { priority: 1 }), row(B, { priority: 2 })],
      build: (s) => folder(s, `docs/plans/${A}`, (d) => d.units[2].depends_on = ["U1"]),
    });
    const r = start(["next"]);
    expect(r.status).toBe(1);
    expect(r.json).toMatchObject({ result: "refused", folder: `docs/plans/${A}` });
    expect(r.json.message).toMatch(new RegExp(`picked docs/plans/${A}: .*uncovered code unit`));
    expect(rowAtOrigin(B).status).toBe("APPROVED");
  });
});

describe("the refusals", () => {
  it("refuses a DRAFT folder", () => {
    seed({ rows: [row(A)], build: (s) => folder(s, `docs/plans/${A}`, (d) => d.status.state = "DRAFT") });
    const r = start([`docs/plans/${A}`]);
    expect(r.status).toBe(1);
    expect(r.json.message).toMatch(/not approved.*\/vwf:change-plan/);
    expect(existsSync(logs)).toBe(false);
  });

  it("refuses a COMPLETE folder", () => {
    seed({ rows: [row(A)], build: (s) => folder(s, `docs/plans/${A}`, (d) => d.status.state = "COMPLETE") });
    expect(start([`docs/plans/${A}`]).json.message).toMatch(/COMPLETE: nothing to do/);
  });

  it("refuses an APPROVED folder with no row", () => {
    seed({ rows: [], build: (s) => folder(s, `docs/plans/${A}`) });
    expect(start([`docs/plans/${A}`]).json.message).toMatch(/not in the plan index/);
  });

  it("refuses a folder that is not on develop", () => {
    seed({ rows: [row(A)], skip: [A] });
    folder(base, `docs/plans/${A}`);
    expect(start([`docs/plans/${A}`]).json.message).toMatch(/is not on develop/);
  });

  it("refuses a plan whose required change plan has not run", () => {
    seed({ rows: [row(A, { requires: [B] }), row(B)] });
    expect(start([`docs/plans/${A}`]).json.message).toMatch(`run /vwf:execute ${B} first`);
  });

  it("refuses an unresolvable requires entry", () => {
    seed({ rows: [row(A, { requires: ["2026-01-01-ghost"] })] });
    expect(start([`docs/plans/${A}`]).json.message).toMatch(/neither in the plan index nor archived/);
  });

  it("refuses an absent sibling target repo with the clone that fetches it", () => {
    seed({ rows: [row(A, { target_repo: "dock-app", kind: "cycle" })] });
    facts(base, {
      "repo.members": {
        "dock-app": { folder: "../dock-app", type: "sibling", url: "git@example.com:harbor/dock-app.git" },
      },
    });
    const r = start([`docs/plans/${A}`]);
    expect(r.status).toBe(1);
    expect(r.json.message).toMatch(/git clone git@example.com:harbor\/dock-app.git \.\.\/dock-app/);
  });

  it("refuses an absent submodule target repo with the submodule update that fetches it", () => {
    seed({ rows: [row(A, { target_repo: "dock-app", kind: "cycle" })] });
    facts(base, { "repo.members": { "dock-app": { folder: "apps/dock-app", type: "submodule" } } });
    const r = start([`docs/plans/${A}`]);
    expect(r.status).toBe(1);
    expect(r.json.message).toMatch(/git submodule update --init apps\/dock-app/);
  });

  it("refuses a target repo that repo.members does not list", () => {
    seed({ rows: [row(A, { target_repo: "dock-app", kind: "cycle" })] });
    const r = start([`docs/plans/${A}`]);
    expect(r.status).toBe(1);
    expect(r.json.message).toMatch(/dock-app of .* is not listed in bootstrap's repo\.members/);
  });

  it("refuses a base with no .config/bootstrap/ with bootstrap's errors text", () => {
    seed({ rows: [row(A)] });
    rmSync(join(base, ".bootstrap-stub.json"));
    const r = startRaw([`docs/plans/${A}`, "--branch", "develop"]);
    expect(r.status).toBe(2);
    expect(r.stderr).toMatch(/no \.config\/bootstrap\/ here: run bootstrap migrate/);
  });

  it("refuses when the working copy differs from the tip", () => {
    seed({ rows: [row(A)] });
    const file = join(base, "docs", "plans", A, "index.json");
    const doc = readJson(file);
    doc.title = "Edited locally";
    writeJson(file, doc);
    expect(start([`docs/plans/${A}`]).json.message).toMatch(/check out develop and pull/);
  });

  it("refuses a red validate", () => {
    seed({ rows: [row(A)], build: (s) => folder(s, `docs/plans/${A}`, (d) => d.release_levels[0].level = "HUGE") });
    expect(start([`docs/plans/${A}`]).json.message).toMatch(/plan\.mjs validate: release_levels/);
  });

  it("refuses an uncovered code unit and a misplaced review row", () => {
    seed({ rows: [row(A)], build: (s) => folder(s, `docs/plans/${A}`, (d) => d.units[2].depends_on = ["U1"]) });
    const m = start([`docs/plans/${A}`]).json.message;
    expect(m).toMatch(/uncovered code unit: no review row covers U2/);
    expect(m).toMatch(/review row placed wrong: R3 does not cover U2/);
  });

  it("refuses a RUNNING row whose worktree is not on this machine", () => {
    seed({
      rows: [row(A, { status: "RUNNING" })],
      build: (s) => folder(s, `docs/plans/${A}`, (d) => d.run = { worktree: ".worktrees/alpha", log: "x.jsonl" }),
    });
    expect(start([`docs/plans/${A}`]).json.message).toMatch(/another session is running/);
  });

  it("exits 2 on a usage error", () => {
    seed({ rows: [] });
    const r = start([]);
    expect(r.status).toBe(2);
    expect(r.json).toBeNull();
    expect(start(["next", "--continue-unknown-language"]).status).toBe(2);
    expect(startRaw(["next"]).status).toBe(2);
    expect(startRaw(["next", "--branch"]).status).toBe(2);
  });

  it("refuses a branch that does not exist on origin", () => {
    seed({ rows: [row(A)] });
    const r = start([`docs/plans/${A}`, "--branch", "main"]);
    expect(r.status).toBe(1);
    expect(r.json.message).toMatch(/origin\/main does not exist .*; the work branch is main/);
  });
});

describe("a fresh run", () => {
  it("runs a folder member's plan in the base repo, with no clone and no member branch", () => {
    seed({ rows: [row(A, { target_repo: "dock-yard" })] });
    facts(base, { "repo.members": { "dock-yard": { folder: "yard", type: "folder" } } });
    const r = start([`docs/plans/${A}`]);
    expect(r.json).toMatchObject({ result: "ready", mode: "fresh", claim: { claimed: true } });
    expect(rowAtOrigin(A).status).toBe("RUNNING");
  });

  it("stops when the merge task's hook pass fails, the log closed claim-failed", () => {
    seed({ rows: [row(A)], build: (s) => write(join(s, ".stub-hook-fail"), "") });
    const r = start([`docs/plans/${A}`]);
    expect(r.status).toBe(1);
    expect(r.json).toMatchObject({ result: "refused", mode: "fresh", claim: { claimed: false, kind: "failed" } });
    expect(r.json.message).toMatch(/the claim failed: .*A hook failed/);
    expect(events(A).at(-1)).toMatchObject({ event: "run.end", outcome: "claim-failed" });
    expect(rowAtOrigin(A).status).toBe("APPROVED");
  });

  it("stops on a conflict of the merge task, the main checkout left mid-merge", () => {
    seed({ rows: [row(A)] });
    const file = join(base, "docs", "plans", "index.json");
    writeFileSync(file, readFileSync(file, "utf8").replace("\"status\": \"APPROVED\"", "\"status\": \"DRAFT\""));
    git(base, "commit", "-q", "-am", "mine, unpushed");
    const r = start([`docs/plans/${A}`]);
    expect(r.status).toBe(1);
    expect(r.json).toMatchObject({ result: "refused", claim: { claimed: false, kind: "failed" } });
    expect(r.json.claim.reason).toMatch(/mid-merge/);
    expect(rowAtOrigin(A).status).toBe("APPROVED");
  });

  it("is pending when develop lands through a pull request, the log left open", () => {
    seed({ rows: [row(A)] });
    ghStub();
    const r = start([`docs/plans/${A}`], { STUB_LANDING: "pr" });
    expect(r.status).toBe(1);
    expect(r.json).toMatchObject({ result: "pending", mode: "fresh" });
    expect(r.json.claim).toMatchObject({ kind: "pr", url: "https://example.com/pr/7" });
    expect(r.json.message).toMatch(/waits on its pull request https:\/\/example.com\/pr\/7/);
    expect(trail(A)).not.toContain("end");
    expect(rowAtOrigin(A).status).toBe("APPROVED");
  });

  it("claims on the local branch in a repo with no origin", () => {
    seed({ rows: [row(A)] });
    git(base, "remote", "remove", "origin");
    const r = start([`docs/plans/${A}`]);
    expect(r.status).toBe(0);
    expect(r.json).toMatchObject({ result: "ready", mode: "fresh" });
    expect(git(base, "log", "-1", "--format=%s", "develop^2")).toBe(`docs: plan queue — ${A} running`);
    expect(git(origin, "log", "-1", "--format=%s", "develop")).toBe("seed");
  });

  it("is ready: the row RUNNING and pushed, run set, the phases in order", () => {
    seed({ rows: [row(A)] });
    const r = start([`docs/plans/${A}`, "--worktree", ".worktrees/shared"]);
    expect(r.status).toBe(0);
    expect(r.json).toMatchObject({
      result: "ready",
      mode: "fresh",
      folder: `docs/plans/${A}`,
      kind: "change",
      priority: 10,
      has_code_unit: true,
      has_covers: false,
      projects: [],
      findings: [],
      open_questions: null,
    });
    expect(r.json).not.toHaveProperty("lsp");
    expect(r.json.claim).toMatchObject({ claimed: true });
    expect(rowAtOrigin(A).status).toBe("RUNNING");
    expect(atOrigin(`docs/plans/${A}/index.json`).run.worktree).toBe(".worktrees/shared");
    expect(trail(A)).toEqual([
      "run.start",
      "plan.snapshot",
      "phase.start:checks",
      "phase.end:checks",
      "phase.start:claim",
      "phase.end:claim",
    ]);
    expect(events(A)[0]).toMatchObject({ mode: "fresh" });
    const [ps, pe] = events(A).slice(2, 4);
    expect(Date.parse(ps.started)).toBeLessThanOrEqual(Date.parse(pe.ended));
    expect(Date.parse(pe.ended)).toBeLessThanOrEqual(Date.parse(ps.ts));
  });

  it("is blocked on a blocking row: no claim, the log closed", () => {
    seed({ rows: [row(A)], config: "repo:\n  stack:\n    template: repo/custom\n" });
    const r = start([`docs/plans/${A}`]);
    expect(r.status).toBe(1);
    expect(r.json).toMatchObject({ result: "blocked", claim: null });
    expect(r.json.findings).toEqual(
      expect.arrayContaining([expect.objectContaining({ rule: "custom-pin", severity: "blocking" })]),
    );
    expect(r.json.findings.every((f: Json) => f.severity === "blocking")).toBe(true);
    expect(rowAtOrigin(A).status).toBe("APPROVED");
    expect(trail(A).slice(-2)).toEqual(["stop", "run.end"]);
    expect(events(A).at(-1).outcome).toBe("blocked");
  });

  /** Two registry projects with no path (D11): their folders are bootstrap's, in `facts`. */
  function projectSeed(folders: Json) {
    seed({
      rows: [row(A)],
      config: "projects:\n  tool:\n    stack:\n      template: unresolved\n",
      build: (s) =>
        write(
          join(s, "docs", "blueprint", "registry.yaml"),
          "vwf_registry: 3\nprojects:\n  - name: tool\n    platforms: [cli]\n  - name: site\n    platforms: [site]\n",
        ),
    });
    facts(base, folders);
  }

  it("scopes the checks by the owns paths, each project by its bootstrap folder; a degraded row never stops", () => {
    projectSeed({ "repo.projects.tool.folder": "scripts", "repo.projects.site.folder": "web" });
    const r = start([`docs/plans/${A}`]);
    expect(r.status).toBe(0);
    expect(r.json).toMatchObject({ result: "ready", mode: "fresh", projects: ["tool"], claim: { claimed: true } });
    expect(r.json.findings).toEqual([]);
    expect(rowAtOrigin(A).status).toBe("RUNNING");
  });

  it("skips a project bootstrap has no repo.projects entry for (D26)", () => {
    projectSeed({ "repo.projects.site.folder": "web" });
    const r = start([`docs/plans/${A}`]);
    expect(r.status).toBe(0);
    expect(r.json).toMatchObject({ result: "ready", projects: [] });
  });

  it("reads a folder member's project folder in the base repo", () => {
    seed({
      rows: [row(A)],
      config: "projects:\n  tool:\n    repo: dock-yard\n",
      build: (s) =>
        write(
          join(s, "docs", "blueprint", "registry.yaml"),
          "vwf_registry: 3\nprojects:\n  - name: tool\n    platforms: [cli]\n",
        ),
    });
    facts(base, {
      "repo.members": { "dock-yard": { folder: "yard", type: "folder" } },
      "repo.projects.tool.folder": "scripts",
    });
    const r = start([`docs/plans/${A}`]);
    expect(r.json).toMatchObject({ result: "ready", projects: ["tool"] });
  });

  it("a failed describe stops the checks with bootstrap's errors text, no claim", () => {
    projectSeed({ "repo.projects.tool.folder": "scripts", "describe": "fail" });
    const r = start([`docs/plans/${A}`]);
    expect(r.status).toBe(2);
    expect(r.stderr).toMatch(/bootstrap describe failed/);
    expect(rowAtOrigin(A).status).toBe("APPROVED");
  });

  it("refuses a failed claim commit and closes the log claim-failed", () => {
    seed({ rows: [row(A)] });
    const r = start([`docs/plans/${A}`], { MISE_FAIL: "1" });
    expect(r.status).toBe(1);
    expect(r.json).toMatchObject({ result: "refused", claim: { claimed: false, kind: "failed" } });
    expect(events(A).at(-1)).toMatchObject({ event: "run.end", outcome: "claim-failed" });
    expect(rowAtOrigin(A).status).toBe("APPROVED");
  });

  it("refuses a lost claim under a named folder", () => {
    seed({ rows: [row(A)] });
    const race = join(root, "race.sh");
    writeFileSync(
      race,
      [
        `cd "${other}"`,
        `PLAN_NOW=2026-11-13T01:00:00.000Z node "${PLAN}" set docs/plans/index.json plans.${A}.status RUNNING`,
        "git add -A && git commit -q -m 'docs: plan queue — other session' && git push -q origin develop",
        "",
      ]
        .join("\n"),
    );
    const r = start([`docs//plans/${A}`], { RACE: race });
    expect(r.status).toBe(1);
    expect(r.json).toMatchObject({ result: "refused", claim: { claimed: false, kind: "lost" } });
    expect(events(A).at(-1).outcome).toBe("claim-lost");
  });
});

describe("a resume", () => {
  function resumeSeed() {
    seed({
      rows: [row(A, { status: "RUNNING" })],
      build: (s) => folder(s, `docs/plans/${A}`, (d) => d.run = { worktree: ".worktrees/alpha", log: "x.jsonl" }),
    });
    folder(join(base, ".worktrees", "alpha"), `docs/plans/${A}`, (d) => {
      d.status = { state: "BLOCKED", detail: "UNRESOLVED: which store" };
      d.units[0].status = "green";
      d.gaps = [
        { id: "G1", unit: "U1", stage: "", text: "QUESTION Q1: which store?", state: "open" },
        { id: "G2", unit: "U1", stage: "", text: "a plain gap", state: "open" },
      ];
    });
    const log = join(logs, "base", `${A}.jsonl`);
    write(
      log,
      [
        { event: "question", id: "Q2", unit: "U1", text: "t", options: "o", why: "w" },
        { event: "question", id: "Q3", unit: "U2", text: "t3", options: "o3", why: "w3" },
        { event: "answer", id: "Q3", decision: "D2" },
      ]
        .map((e) => JSON.stringify(e))
        .join("\n") + "\n",
    );
    return log;
  }

  it("is ready with no claim and the open questions filled", () => {
    resumeSeed();
    const r = start([`docs/plans/${A}`]);
    expect(r.status).toBe(0);
    expect(r.json).toMatchObject({ result: "ready", mode: "resume", claim: null });
    expect(r.json.open_questions).toEqual({
      gaps: ["G1"],
      events: [{ id: "Q2", unit: "U1", text: "t", options: "o", why: "w" }],
    });
    expect(trail(A).slice(-4)).toEqual(["run.start", "plan.snapshot", "phase.start:checks", "phase.end:checks"]);
    expect(events(A).at(-4)).toMatchObject({
      mode: "resume",
      folder: join(base, ".worktrees", "alpha", "docs", "plans", A),
    });
  });

  it("refuses when another session's marker names the plan log", () => {
    const log = resumeSeed();
    write(join(logs, "active", "other-session"), `${log}\n20261113-010000-othersess\n`);
    const r = start([`docs/plans/${A}`]);
    expect(r.status).toBe(1);
    expect(r.json.message).toMatch(/another session is running/);
  });
});
