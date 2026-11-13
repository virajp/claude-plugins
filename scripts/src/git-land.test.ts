/**
 * vwf's git-workflow land.mjs — open, close, abandon and finish — run for real
 * over temp repos: a bare `origin` and its clone, or a repo with no remote.
 * A pre-merge-commit hook stands in for pre-commit refusing a merge into a
 * protected branch. Every fixture name is invented.
 */
import { spawnSync } from "node:child_process";
import {
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
import { join } from "node:path";
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

/** A `mise` that runs what follows `--`. */
const MISE = `#!/bin/sh
while [ "$#" -gt 0 ] && [ "$1" != "--" ]; do shift; done
shift
exec "$@"
`;

/** A `gh` that records its arguments and prints a pull request URL. */
const GH = (log: string) => `#!/bin/sh
echo "$*" > "${log}"
echo "Creating pull request"
echo "https://example.com/pr/7"
`;

function git(cwd: string, ...args: string[]) {
  const r = spawnSync("git", args, { cwd, env, encoding: "utf8" });
  if (r.status !== 0) {
    throw new Error(`git ${args.join(" ")} in ${cwd}: ${r.stderr}`);
  }
  return r.stdout.trim();
}

function land(args: string[]) {
  const r = spawnSync("node", [SCRIPT, ...args], { cwd: root, env, encoding: "utf8" });
  let json: Json;
  try {
    json = JSON.parse(r.stdout);
  } catch {
    json = null;
  }
  return { status: r.status, json, stderr: r.stderr };
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
}

/** A pre-merge-commit hook in `repo` that refuses every merge. */
function refuseMerges() {
  const hook = join(repo, ".git", "hooks", "pre-merge-commit");
  writeFileSync(hook, "#!/bin/sh\necho 'Refuse a direct commit to a protected branch' >&2\nexit 1\n");
  chmodSync(hook, 0o755);
}

/** open, then write `text` into notes.md in the new worktree. */
function opened(name = "change-one", text = "two\n") {
  const r = land(["open", repo, "--into", "develop", "--name", name]);
  expect(r.status).toBe(0);
  writeFileSync(join(r.json.worktree, "notes.md"), text);
  return r.json.worktree as string;
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
});

afterEach(() => {
  rmSync(root, { recursive: true, force: true });
});

describe("open", () => {
  it("cuts a worktree and a local branch from origin/develop", () => {
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
  });

  it("refuses a branch that already exists", () => {
    seed(true);
    git(repo, "branch", "change-one");
    const r = land(["open", repo, "--into", "develop", "--name", "change-one"]);
    expect(r.status).toBe(2);
    expect(r.stderr).toMatch(/already exists/);
  });

  it("refuses a branch to land on that does not exist", () => {
    seed(true);
    const r = land(["open", repo, "--into", "main", "--name", "change-one"]);
    expect(r.status).toBe(2);
    expect(r.stderr).toMatch(/origin\/main does not exist/);
  });
});

describe("close", () => {
  it("commits, merges --no-ff, pushes, and removes the worktree and branch", () => {
    seed(true);
    const wt = opened();
    const r = land(["close", wt, "--into", "develop", "--message", "docs: change one"]);
    expect(r.status).toBe(0);
    expect(r.json).toEqual({ landed: true, commit: git(repo, "rev-parse", "develop") });
    expect(git(origin, "log", "-1", "--format=%s", "develop")).toBe("docs: change one");
    expect(git(origin, "log", "-1", "--format=%P", "develop").split(" ")).toHaveLength(2);
    expect(git(origin, "show", "develop:notes.md")).toBe("two");
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

  it("keeps the main checkout's own changes and branch", () => {
    seed(true);
    git(repo, "checkout", "-q", "-b", "feature");
    writeFileSync(join(repo, "scratch.txt"), "mine\n");
    const wt = opened();
    const r = land(["close", wt, "--into", "develop", "--message", "docs: change one"]);
    expect(r.status).toBe(0);
    expect(r.json.warning).toBeUndefined();
    expect(git(repo, "symbolic-ref", "--short", "HEAD")).toBe("feature");
    expect(readFileSync(join(repo, "scratch.txt"), "utf8")).toBe("mine\n");
    expect(git(repo, "stash", "list")).toBe("");
  });

  it("opens a pull request when the hooks refuse the merge", () => {
    seed(true);
    refuseMerges();
    const wt = opened();
    const r = land(["close", wt, "--into", "develop", "--message", "docs: change one"]);
    expect(r.status).toBe(1);
    expect(r.json).toEqual({ landed: false, kind: "pr", url: "https://example.com/pr/7", branch: "change-one" });
    expect(readFileSync(join(root, "gh.log"), "utf8")).toMatch(
      /^pr create --base develop --head change-one --title docs: change one --body /,
    );
    expect(git(origin, "log", "-1", "--format=%s", "develop")).toBe("seed");
    expect(git(repo, "ls-remote", "--heads", "origin", "change-one")).not.toBe("");
    expect(existsSync(wt)).toBe(false);
    expect(git(repo, "branch", "--list", "change-one")).not.toBe("");
    expect(git(repo, "status", "--porcelain")).toBe("");
  });

  it("fails a refused merge in a repo with no remote, keeping the worktree", () => {
    seed(false);
    refuseMerges();
    const wt = opened();
    const r = land(["close", wt, "--into", "develop", "--message", "docs: change one"]);
    expect(r.status).toBe(1);
    expect(r.json).toMatchObject({ landed: false, kind: "failed" });
    expect(r.json.reason).toMatch(/no remote for a pull request/);
    expect(existsSync(wt)).toBe(true);
    expect(git(repo, "show", "develop:notes.md")).toBe("one");
  });

  it("reports a conflict and keeps the worktree", () => {
    seed(true);
    const wt = opened();
    writeFileSync(join(repo, "notes.md"), "three\n");
    git(repo, "commit", "-q", "-am", "other");
    git(repo, "push", "-q", "origin", "develop");
    const r = land(["close", wt, "--into", "develop", "--message", "docs: change one"]);
    expect(r.status).toBe(1);
    expect(r.json).toMatchObject({ landed: false, kind: "conflict", files: ["notes.md"] });
    expect(existsSync(wt)).toBe(true);
    expect(git(repo, "status", "--porcelain")).toBe("");
    expect(git(origin, "log", "-1", "--format=%s", "develop")).toBe("other");
  });

  it("fails with nothing to commit", () => {
    seed(true);
    const r0 = land(["open", repo, "--into", "develop", "--name", "change-one"]);
    const r = land(["close", r0.json.worktree, "--into", "develop", "--message", "docs: change one"]);
    expect(r.status).toBe(1);
    expect(r.json.reason).toMatch(/nothing to commit/);
  });
});

describe("abandon and finish", () => {
  it("abandon removes the worktree and deletes its branch", () => {
    seed(true);
    const wt = opened();
    const r = land(["abandon", wt]);
    expect(r.status).toBe(0);
    expect(existsSync(wt)).toBe(false);
    expect(git(repo, "branch", "--list", "change-one")).toBe("");
  });

  it("finish deletes the branch, local and remote, and fast-forwards develop", () => {
    seed(true);
    refuseMerges();
    const wt = opened();
    land(["close", wt, "--into", "develop", "--message", "docs: change one"]);
    // The forge merges the pull request.
    const forge = join(root, "forge");
    git(root, "clone", "-q", "-b", "develop", origin, forge);
    git(forge, "merge", "-q", "--no-ff", "-m", "Merge pull request 7", "origin/change-one");
    git(forge, "push", "-q", "origin", "develop");
    const r = land(["finish", repo, "--branch", "change-one", "--into", "develop"]);
    expect(r.status).toBe(0);
    expect(r.json).toEqual({ finished: true });
    expect(git(repo, "branch", "--list", "change-one")).toBe("");
    expect(git(repo, "ls-remote", "--heads", "origin", "change-one")).toBe("");
    expect(readFileSync(join(repo, "notes.md"), "utf8")).toBe("two\n");
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
