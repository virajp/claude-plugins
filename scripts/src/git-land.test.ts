/**
 * vwf's git-workflow land.mjs — open, close, abandon and finish — run for real
 * over temp repos: a bare `origin` and its clone, or a repo with no remote.
 * bootstrap's git:merge:<b>, git:worktree:create and git:worktree:delete tasks
 * are stub scripts in each temp repo, which a stub `mise` runs; a marker file
 * stands in for the merge task's hook pass failing. Every fixture name is
 * invented.
 */
import { spawnSync } from "node:child_process";
import {
  appendFileSync,
  chmodSync,
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

const SCRIPT = join(
  import.meta.dirname,
  "..",
  "..",
  "plugins",
  "vwf",
  "skills",
  "git-workflow",
  "scripts",
  "land.mjs",
);

/** A parsed result. */
type Json = any;

let root: string;
let origin: string;
let repo: string;
let env: NodeJS.ProcessEnv;

/** The main checkout: the parent of the git common dir, or its core.worktree (a submodule). */
const MAIN = `common=$(git rev-parse --path-format=absolute --git-common-dir)
tree=$(git config --file "$common/config" core.worktree)
if [ -n "$tree" ]; then main=$(cd "$common" && cd "$tree" && pwd -P); else main=$(dirname "$common"); fi`;

/** Each stub logs its arguments to stub-tasks.log in the git common dir. */
const LOG = `echo "$0 $*" >> "$(git rev-parse --path-format=absolute --git-common-dir)/stub-tasks.log"`;

/**
 * A `mise` that runs `run git:<x> -- <args>` as the stub file
 * .config/mise/tasks/git/<x> of the main checkout, and what follows `--` for
 * every other call.
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
while [ "$#" -gt 0 ] && [ "$1" != "--" ]; do shift; done
shift
exec "$@"
`;

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

/** A `gh` that logs its arguments, opens a pull request, and reports its URL or $GH_STATE. */
const GH = (log: string) =>
  `#!/bin/sh
echo "$*" >> "${log}"
case "$1 $2" in
  "pr create") echo "https://example.com/pr/7" ;;
  "pr view")
    case "$*" in
      *state*) [ -n "$GH_STATE" ] || exit 1; printf '{"state":"%s"}\\n' "$GH_STATE" ;;
      *) printf '{"url":"%s"}\\n' "https://example.com/pr/7" ;;
    esac ;;
esac
`;

/** A forge CLI that is not installed. */
const ABSENT = "#!/bin/sh\necho 'command not found' >&2\nexit 127\n";

function git(cwd: string, ...args: string[]) {
  const r = spawnSync("git", args, { cwd, env, encoding: "utf8" });
  if (r.status !== 0) {
    throw new Error(`git ${args.join(" ")} in ${cwd}: ${r.stderr}`);
  }
  return r.stdout.trim();
}

/** Whether a git call succeeds. */
function gitOk(cwd: string, ...args: string[]) {
  return spawnSync("git", args, { cwd, env, encoding: "utf8" }).status === 0;
}

function land(args: string[], extra: NodeJS.ProcessEnv = {}) {
  const r = spawnSync("node", [SCRIPT, ...args], { cwd: root, env: { ...env, ...extra }, encoding: "utf8" });
  let json: Json;
  try {
    json = JSON.parse(r.stdout);
  } catch {
    json = null;
  }
  return { status: r.status, json, stderr: r.stderr };
}

/** The stub git:* tasks in `dir`'s .config/mise/tasks/git/, kept out of git status. */
function stubTasks(dir: string) {
  const tasks = join(dir, ".config", "mise", "tasks", "git");
  const files: [string, string][] = [
    ["merge/develop", MERGE],
    ["merge/main", MERGE],
    ["worktree/create", CREATE],
    ["worktree/delete", DELETE],
  ];
  for (const [path, text] of files) {
    mkdirSync(dirname(join(tasks, path)), { recursive: true });
    writeFileSync(join(tasks, path), text);
  }
  const exclude = git(dir, "rev-parse", "--path-format=absolute", "--git-path", "info/exclude");
  mkdirSync(dirname(exclude), { recursive: true });
  appendFileSync(exclude, "/.config/mise/tasks/git/\n/.stub-create-fail\n");
}

/** The stub tasks' log of `dir`. */
function taskLog(dir: string) {
  const file = join(git(dir, "rev-parse", "--path-format=absolute", "--git-common-dir"), "stub-tasks.log");
  return existsSync(file) ? readFileSync(file, "utf8") : "";
}

/** A repo at `repo` with one commit on develop; pushed to origin when `remote`. */
function seed(remote: boolean) {
  if (remote) {
    git(root, "init", "-q", "--bare", "-b", "develop", origin);
    git(root, "clone", "-q", origin, repo);
  } else {
    git(root, "init", "-q", "-b", "develop", repo);
  }
  writeFileSync(join(repo, "notes.md"), "one\n");
  writeFileSync(join(repo, ".gitignore"), ".worktrees/\n");
  git(repo, "add", "-A");
  git(repo, "commit", "-q", "-m", "seed");
  if (remote) {
    git(repo, "push", "-q", "-u", "origin", "develop");
  }
  stubTasks(repo);
}

/** open, then write `text` into notes.md in the new worktree. */
function opened(name = "change-one", text = "two\n") {
  const r = land(["open", repo, "--into", "develop", "--name", name]);
  expect(r.status).toBe(0);
  writeFileSync(join(r.json.worktree, "notes.md"), text);
  return r.json.worktree as string;
}

/** A commit on origin/develop that changes notes.md to `text`, from another clone. */
function pushOther(text: string, message = "other") {
  const o = join(root, "o");
  git(root, "clone", "-q", "-b", "develop", origin, o);
  writeFileSync(join(o, "notes.md"), text);
  git(o, "commit", "-q", "-am", message);
  git(o, "push", "-q", "origin", "develop");
}

beforeEach(() => {
  root = realpathSync(mkdtempSync(join(tmpdir(), "vwf-land-")));
  origin = join(root, "origin.git");
  repo = join(root, "repo");
  const bin = join(root, "bin");
  mkdirSync(bin);
  writeFileSync(join(bin, "mise"), MISE);
  chmodSync(join(bin, "mise"), 0o755);
  writeFileSync(join(bin, "gh"), GH(join(root, "gh.log")));
  chmodSync(join(bin, "gh"), 0o755);
  writeFileSync(join(bin, "glab"), ABSENT);
  chmodSync(join(bin, "glab"), 0o755);
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
  };
  delete env.STUB_LANDING;
  delete env.GH_STATE;
});

afterEach(() => {
  rmSync(root, { recursive: true, force: true });
});

describe("open", () => {
  it("cuts a worktree and a local branch from origin/develop through git:worktree:create", () => {
    seed(true);
    const r = land(["open", repo, "--into", "develop", "--name", "change-one"]);
    expect(r.status).toBe(0);
    expect(r.json).toEqual({
      worktree: join(repo, ".worktrees", "change-one"),
      branch: "change-one",
      into: "develop",
      base: "origin/develop",
    });
    expect(git(r.json.worktree, "symbolic-ref", "--short", "HEAD")).toBe("change-one");
    expect(git(repo, "ls-remote", "--heads", "origin", "change-one")).toBe("");
    expect(taskLog(repo)).toMatch(/worktree\/create change-one --from origin\/develop --no-setup/);
    expect(gitOk(repo, "rev-parse", "--abbrev-ref", "change-one@{upstream}")).toBe(false);
    expect(git(repo, "config", "branch.change-one.vwfLandBase")).toBe(git(repo, "rev-parse", "origin/develop"));
  });

  it("cuts from the local branch with no fetch in a repo with no remote", () => {
    seed(false);
    const r = land(["open", repo, "--into", "develop", "--name", "change-one"]);
    expect(r.status).toBe(0);
    expect(r.json.base).toBe("develop");
    expect(taskLog(repo)).toMatch(/--from develop --no-setup/);
  });

  it("refuses a branch that already exists", () => {
    seed(true);
    git(repo, "branch", "change-one");
    const r = land(["open", repo, "--into", "develop", "--name", "change-one"]);
    expect(r.status).toBe(2);
    expect(r.stderr).toMatch(/already exists/);
  });

  it("refuses a name that exists on origin, before git:worktree:create", () => {
    seed(true);
    git(repo, "push", "-q", "origin", "develop:change-one");
    const r = land(["open", repo, "--into", "develop", "--name", "change-one"]);
    expect(r.status).toBe(2);
    expect(r.stderr).toMatch(/origin\/change-one already exists/);
    expect(taskLog(repo)).toBe("");
  });

  it("refuses a branch to land on that does not exist", () => {
    seed(true);
    const r = land(["open", repo, "--into", "main", "--name", "change-one"]);
    expect(r.status).toBe(2);
    expect(r.stderr).toMatch(/origin\/main does not exist/);
  });

  it("removes what a failed git:worktree:create left, then fails", () => {
    seed(true);
    writeFileSync(join(repo, ".stub-create-fail"), "");
    const r = land(["open", repo, "--into", "develop", "--name", "change-one"]);
    expect(r.status).toBe(2);
    expect(r.stderr).toMatch(/git:worktree:create failed/);
    expect(git(repo, "branch", "--list", "change-one")).toBe("");
    expect(existsSync(join(repo, ".worktrees", "change-one"))).toBe(false);
    expect(gitOk(repo, "config", "branch.change-one.vwfLandBase")).toBe(false);
  });

  it("fails with the bootstrap migrate hint when the task is missing", () => {
    seed(true);
    rmSync(join(repo, ".config", "mise", "tasks", "git", "worktree", "create"));
    const r = land(["open", repo, "--into", "develop", "--name", "change-one"]);
    expect(r.status).toBe(2);
    expect(r.stderr).toContain(
      "the repo has no bootstrap git task for this step: run `bootstrap migrate`",
    );
    expect(git(repo, "branch", "--list", "change-one")).toBe("");
  });
});

describe("close", () => {
  it("commits, lands through git:merge:develop, and removes the worktree and branch", () => {
    seed(true);
    const wt = opened();
    const r = land(["close", wt, "--into", "develop", "--message", "docs: change one"]);
    expect(r.status).toBe(0);
    expect(r.json).toEqual({ landed: true, commit: git(repo, "rev-parse", "develop") });
    expect(git(origin, "log", "-1", "--format=%P", "develop").split(" ")).toHaveLength(2);
    expect(git(origin, "log", "-1", "--format=%s", "develop^2")).toBe("docs: change one");
    expect(git(origin, "log", "-1", "--format=%(trailers:key=Vwf-Land,valueonly)", "develop^2")).toBe("close");
    expect(git(origin, "show", "develop:notes.md")).toBe("two");
    expect(taskLog(repo)).toMatch(/merge\/develop change-one/);
    expect(existsSync(wt)).toBe(false);
    expect(git(repo, "branch", "--list", "change-one")).toBe("");
  });

  it("merges locally and pushes nothing in a repo with no remote", () => {
    seed(false);
    const wt = opened();
    const r = land(["close", wt, "--into", "develop", "--message", "docs: change one"]);
    expect(r.status).toBe(0);
    expect(r.json.landed).toBe(true);
    expect(git(repo, "show", "develop:notes.md")).toBe("two");
    expect(existsSync(wt)).toBe(false);
  });

  it("leaves the main checkout's own changes uncommitted and its branch as it was", () => {
    seed(true);
    git(repo, "checkout", "-q", "-b", "feature");
    writeFileSync(join(repo, "scratch.txt"), "mine\n");
    const wt = opened();
    const r = land(["close", wt, "--into", "develop", "--message", "docs: change one"]);
    expect(r.status).toBe(0);
    expect(r.json.warning).toBeUndefined();
    expect(git(repo, "symbolic-ref", "--short", "HEAD")).toBe("feature");
    expect(readFileSync(join(repo, "scratch.txt"), "utf8")).toBe("mine\n");
    expect(git(origin, "show", "--name-only", "--format=", "develop^2")).not.toMatch(/scratch/);
  });

  it("is a pull request when the landing is pr: the worktree removed, the branch kept", () => {
    seed(true);
    const wt = opened();
    const r = land(["close", wt, "--into", "develop", "--message", "docs: change one"], { STUB_LANDING: "pr" });
    expect(r.status).toBe(1);
    expect(r.json).toEqual({ landed: false, kind: "pr", url: "https://example.com/pr/7", branch: "change-one" });
    expect(readFileSync(join(root, "gh.log"), "utf8")).toMatch(/^pr create --base develop --head change-one --fill$/m);
    expect(git(origin, "log", "-1", "--format=%s", "develop")).toBe("seed");
    expect(git(repo, "ls-remote", "--heads", "origin", "change-one")).not.toBe("");
    expect(existsSync(wt)).toBe(false);
    expect(git(repo, "branch", "--list", "change-one")).not.toBe("");
    expect(git(repo, "status", "--porcelain")).toBe("");
  });

  it("fails when the task's hook pass fails, keeping the worktree", () => {
    seed(true);
    const wt = opened();
    writeFileSync(join(wt, ".stub-hook-fail"), "");
    const r = land(["close", wt, "--into", "develop", "--message", "docs: change one"]);
    expect(r.status).toBe(1);
    expect(r.json).toMatchObject({ landed: false, kind: "failed" });
    expect(r.json.reason).toMatch(/A hook failed/);
    expect(r.json.unpushed).toBeUndefined();
    expect(existsSync(wt)).toBe(true);
    expect(git(origin, "log", "-1", "--format=%s", "develop")).toBe("seed");
  });

  it("reports a rebase conflict in its own worktree, the main checkout untouched", () => {
    seed(true);
    const wt = opened();
    pushOther("three\n");
    const before = git(repo, "rev-parse", "HEAD");
    const r = land(["close", wt, "--into", "develop", "--message", "docs: change one"]);
    expect(r.status).toBe(1);
    expect(r.json).toMatchObject({ landed: false, kind: "conflict", files: ["notes.md"] });
    expect(existsSync(wt)).toBe(true);
    expect(git(wt, "symbolic-ref", "--short", "HEAD")).toBe("change-one");
    expect(git(repo, "status", "--porcelain")).toBe("");
    expect(git(repo, "rev-parse", "HEAD")).toBe(before);
    expect(gitOk(repo, "rev-parse", "-q", "--verify", "MERGE_HEAD")).toBe(false);
    expect(taskLog(repo)).not.toMatch(/merge\/develop/);
    expect(git(origin, "log", "-1", "--format=%s", "develop")).toBe("other");
  });

  it("rebases over another session's push and lands", () => {
    seed(true);
    const wt = opened("change-one", "one\nmore\n");
    const o = join(root, "o");
    git(root, "clone", "-q", "-b", "develop", origin, o);
    writeFileSync(join(o, "other.md"), "x\n");
    git(o, "add", "-A");
    git(o, "commit", "-q", "-m", "other");
    git(o, "push", "-q", "origin", "develop");
    const r = land(["close", wt, "--into", "develop", "--message", "docs: change one"]);
    expect(r.status).toBe(0);
    expect(git(origin, "log", "-1", "--format=%s", "develop^2")).toBe("docs: change one");
    expect(git(origin, "show", "develop:other.md")).toBe("x");
  });

  it("fails on a conflict of the task, leaving the main checkout mid-merge", () => {
    seed(true);
    writeFileSync(join(repo, "notes.md"), "mine\n");
    git(repo, "commit", "-q", "-am", "mine, unpushed");
    const wt = opened();
    const r = land(["close", wt, "--into", "develop", "--message", "docs: change one"]);
    expect(r.status).toBe(1);
    expect(r.json).toMatchObject({ landed: false, kind: "failed" });
    expect(r.json.reason).toMatch(/mid-merge.*notes\.md.*git merge --abort/);
    expect(gitOk(repo, "rev-parse", "-q", "--verify", "MERGE_HEAD")).toBe(true);
    expect(existsSync(wt)).toBe(true);
    expect(git(origin, "log", "-1", "--format=%s", "develop")).toBe("seed");
  });

  it("refuses before the task when the main checkout is already mid-merge", () => {
    seed(true);
    git(repo, "checkout", "-q", "-b", "side");
    writeFileSync(join(repo, "notes.md"), "side\n");
    git(repo, "commit", "-q", "-am", "side");
    git(repo, "checkout", "-q", "develop");
    writeFileSync(join(repo, "notes.md"), "mine\n");
    git(repo, "commit", "-q", "-am", "mine");
    expect(gitOk(repo, "merge", "side")).toBe(false);
    const wt = opened();
    const r = land(["close", wt, "--into", "develop", "--message", "docs: change one"]);
    expect(r.status).toBe(1);
    expect(r.json).toMatchObject({ landed: false, kind: "failed" });
    expect(r.json.reason).toMatch(/was mid-merge before the landing/);
    expect(taskLog(repo)).not.toMatch(/merge\/develop/);
    expect(git(wt, "status", "--porcelain")).not.toBe("");
  });

  it("keeps an unpushed merge commit when the push fails, and says so", () => {
    seed(true);
    const hook = join(origin, "hooks", "pre-receive");
    writeFileSync(hook, "#!/bin/sh\necho 'rejected' >&2\nexit 1\n");
    chmodSync(hook, 0o755);
    const wt = opened();
    const r = land(["close", wt, "--into", "develop", "--message", "docs: change one"]);
    expect(r.status).toBe(1);
    expect(r.json).toMatchObject({ landed: false, kind: "failed", unpushed: true });
    expect(r.json.reason).toMatch(/git push origin develop/);
    expect(r.json.reason).toMatch(/is now on develop/);
    expect(git(repo, "log", "-1", "--format=%s", "develop^2")).toBe("docs: change one");
    expect(git(origin, "log", "-1", "--format=%s", "develop")).toBe("seed");
    expect(existsSync(wt)).toBe(true);
  });

  it("fails with the bootstrap migrate hint when git:merge is missing", () => {
    seed(true);
    const wt = opened();
    rmSync(join(repo, ".config", "mise", "tasks", "git", "merge", "develop"));
    const r = land(["close", wt, "--into", "develop", "--message", "docs: change one"]);
    expect(r.status).toBe(1);
    expect(r.json).toMatchObject({ landed: false, kind: "failed" });
    expect(r.json.reason).toContain(
      "the repo has no bootstrap git task for this step: run `bootstrap migrate`",
    );
    expect(existsSync(wt)).toBe(true);
  });

  it("fails with nothing to commit", () => {
    seed(true);
    const r0 = land(["open", repo, "--into", "develop", "--name", "change-one"]);
    const r = land(["close", r0.json.worktree, "--into", "develop", "--message", "docs: change one"]);
    expect(r.status).toBe(1);
    expect(r.json.reason).toMatch(/nothing to commit/);
  });
});

describe("abandon", () => {
  it("removes a dirty scratch branch whose commits all carry Vwf-Land: close", () => {
    seed(true);
    const wt = opened();
    writeFileSync(join(wt, ".stub-hook-fail"), "");
    expect(land(["close", wt, "--into", "develop", "--message", "docs: change one"]).json.kind).toBe("failed");
    writeFileSync(join(wt, "notes.md"), "dirty\n");
    const r = land(["abandon", wt]);
    expect(r.status).toBe(0);
    expect(r.json).toEqual({ abandoned: true, branch: "change-one" });
    expect(existsSync(wt)).toBe(false);
    expect(git(repo, "branch", "--list", "change-one")).toBe("");
  });

  it("keeps an unmerged branch with another commit, and gives the delete command", () => {
    seed(true);
    const wt = opened();
    git(wt, "commit", "-q", "-am", "mine");
    const r = land(["abandon", wt]);
    expect(r.status).toBe(0);
    expect(r.json).toMatchObject({ abandoned: true, branch: "change-one" });
    expect(r.json.warning).toMatch(/git branch -D change-one/);
    expect(taskLog(repo)).toMatch(/worktree\/delete change-one/);
    expect(existsSync(wt)).toBe(false);
    expect(git(repo, "branch", "--list", "change-one")).not.toBe("");
  });
});

describe("finish", () => {
  /** close under a pr landing, then the forge merges the request. */
  function merged() {
    seed(true);
    const wt = opened();
    land(["close", wt, "--into", "develop", "--message", "docs: change one"], { STUB_LANDING: "pr" });
    const forge = join(root, "forge");
    git(root, "clone", "-q", "-b", "develop", origin, forge);
    git(forge, "merge", "-q", "--no-ff", "-m", "Merge pull request 7", "origin/change-one");
    git(forge, "push", "-q", "origin", "develop");
  }

  it("deletes the scratch branch, local and remote, and fast-forwards develop once gh reports it merged", () => {
    merged();
    const r = land(["finish", repo, "--branch", "change-one", "--into", "develop"], { GH_STATE: "MERGED" });
    expect(r.status).toBe(0);
    expect(r.json).toEqual({ finished: true });
    expect(git(repo, "branch", "--list", "change-one")).toBe("");
    expect(git(repo, "ls-remote", "--heads", "origin", "change-one")).toBe("");
    expect(readFileSync(join(repo, "notes.md"), "utf8")).toBe("two\n");
  });

  it("keeps the branch while the request is not merged", () => {
    merged();
    const r = land(["finish", repo, "--branch", "change-one", "--into", "develop"], { GH_STATE: "OPEN" });
    expect(r.status).toBe(1);
    expect(r.json).toMatchObject({ finished: false, command: "git branch -D change-one" });
    expect(r.json.reason).toMatch(/OPEN, not merged/);
    expect(git(repo, "branch", "--list", "change-one")).not.toBe("");
    expect(git(repo, "ls-remote", "--heads", "origin", "change-one")).not.toBe("");
  });

  it("keeps the branch with neither gh nor glab", () => {
    merged();
    writeFileSync(join(root, "bin", "gh"), ABSENT);
    const r = land(["finish", repo, "--branch", "change-one", "--into", "develop"]);
    expect(r.status).toBe(1);
    expect(r.json).toMatchObject({ finished: false, command: "git branch -D change-one" });
    expect(r.json.reason).toMatch(/neither gh nor glab/);
    expect(git(repo, "branch", "--list", "change-one")).not.toBe("");
  });
});

describe("a submodule", () => {
  /** A superproject at root/super whose submodule `sub` is a clone of origin; returns sub. */
  function nested() {
    seed(true);
    const sup = join(root, "super");
    git(root, "init", "-q", "-b", "develop", sup);
    git(sup, "-c", "protocol.file.allow=always", "submodule", "add", "-q", "-b", "develop", origin, "sub");
    git(sup, "commit", "-q", "-m", "add sub");
    const sub = join(sup, "sub");
    stubTasks(sub);
    return { sup, sub };
  }

  it("open cuts the worktree in the submodule, not the superproject", () => {
    const { sup, sub } = nested();
    const r = land(["open", sub, "--into", "develop", "--name", "change-one"]);
    expect(r.status).toBe(0);
    expect(r.json.worktree).toBe(join(sub, ".worktrees", "change-one"));
    expect(git(r.json.worktree, "rev-parse", "--path-format=absolute", "--git-common-dir")).toBe(
      join(sup, ".git", "modules", "sub"),
    );
    expect(git(sup, "branch", "--list", "change-one")).toBe("");
  });

  it("close lands the change on the submodule's origin", () => {
    const { sup, sub } = nested();
    const r0 = land(["open", sub, "--into", "develop", "--name", "change-one"]);
    writeFileSync(join(r0.json.worktree, "notes.md"), "two\n");
    const r = land(["close", r0.json.worktree, "--into", "develop", "--message", "docs: change one"]);
    expect(r.status).toBe(0);
    expect(r.json.landed).toBe(true);
    expect(git(origin, "show", "develop:notes.md")).toBe("two");
    expect(readFileSync(join(sub, "notes.md"), "utf8")).toBe("two\n");
    expect(existsSync(r0.json.worktree)).toBe(false);
    expect(git(sup, "log", "-1", "--format=%s")).toBe("add sub");
  });

  it("abandon removes the submodule's worktree and branch", () => {
    const { sub } = nested();
    const r0 = land(["open", sub, "--into", "develop", "--name", "change-one"]);
    const r = land(["abandon", r0.json.worktree]);
    expect(r.status).toBe(0);
    expect(existsSync(r0.json.worktree)).toBe(false);
    expect(git(sub, "branch", "--list", "change-one")).toBe("");
  });
});

describe("usage", () => {
  it.each([
    ["no verb", []],
    ["an unknown verb", ["merge", "x"]],
    ["open with no --name", ["open", "x", "--into", "develop"]],
    ["close with no --message", ["close", "x", "--into", "develop"]],
    ["a flag with no value", ["abandon", "x", "--into"]],
  ])("exits 2 on %s", (_, args) => {
    const r = land(args);
    expect(r.status).toBe(2);
    expect(r.json).toBeNull();
  });
});
