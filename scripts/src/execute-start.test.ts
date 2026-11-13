/**
 * vwf's execute start.mjs, run for real over temp repos with a bare `origin`:
 * the base's main checkout and a second clone standing in for another
 * session, a scratch log root ($VWF_LOG_ROOT) and session id, and a stub
 * `mise` on a temp PATH. Every fixture name is invented.
 */
import { spawnSync } from "node:child_process";
import {
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
import { dirname, join } from "node:path";
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

function start(args: string[], extra: NodeJS.ProcessEnv = {}, cwd = base) {
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
      ].join("\n"),
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

  it("refuses an absent target repo with the command that fetches it", () => {
    seed({
      rows: [row(A, { target_repo: "dock-app", kind: "cycle" })],
      config: "members:\n  - name: dock-app\n    path: ../dock-app\n    url: git@example.com:harbor/dock-app.git\n",
    });
    const r = start([`docs/plans/${A}`]);
    expect(r.status).toBe(1);
    expect(r.json.message).toMatch(/git clone git@example.com:harbor\/dock-app.git \.\.\/dock-app/);
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
    expect(start(["next", "--continue-unknown-language", "--continue-unknown-language"]).status).toBe(2);
  });
});

describe("a fresh run", () => {
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

  function unknownSeed() {
    seed({
      rows: [row(A)],
      config: "projects:\n  tool:\n    stack:\n      languages: [zig]\n",
      build: (s) =>
        write(
          join(s, "docs", "blueprint", "registry.yaml"),
          "vwf_registry: 2\nprojects:\n  - name: tool\n    path: scripts\n  - name: site\n    path: web\n",
        ),
    });
  }
  const zig = expect.objectContaining({
    rule: "unknown-language",
    severity: "degraded",
    project: "tool",
    subject: "zig",
  });

  it("stops before the log start on an unknown language alone: no claim, no log run", () => {
    unknownSeed();
    const head = git(origin, "rev-parse", "develop");
    const r = start([`docs/plans/${A}`]);
    expect(r.status).toBe(1);
    expect(r.json).toMatchObject({ result: "blocked", mode: "fresh", claim: null, projects: ["tool"] });
    expect(r.json.findings).toEqual([zig]);
    expect(r.json.message).toMatch(/--continue-unknown-language/);
    expect(git(origin, "rev-parse", "develop")).toBe(head);
    expect(rowAtOrigin(A).status).toBe("APPROVED");
    expect(events(A)).toEqual([]);
    expect(existsSync(join(logs, "active", SESSION))).toBe(false);
  });

  it("claims on an unknown language with --continue-unknown-language, scoped by the owns paths", () => {
    unknownSeed();
    const r = start([`docs/plans/${A}`, "--continue-unknown-language"]);
    expect(r.status).toBe(0);
    expect(r.json).toMatchObject({ result: "ready", mode: "fresh", projects: ["tool"], claim: { claimed: true } });
    expect(r.json.findings).toEqual([zig]);
    expect(rowAtOrigin(A).status).toBe("RUNNING");
    expect(trail(A)).toEqual([
      "run.start",
      "plan.snapshot",
      "phase.start:checks",
      "phase.end:checks",
      "phase.start:claim",
      "phase.end:claim",
    ]);
  });

  it("still blocks on a blocking row with --continue-unknown-language", () => {
    seed({ rows: [row(A)], config: "repo:\n  stack:\n    template: repo/custom\n" });
    const r = start([`docs/plans/${A}`, "--continue-unknown-language", "--worktree", ".worktrees/x"]);
    expect(r.status).toBe(1);
    expect(r.json).toMatchObject({ result: "blocked", claim: null });
    expect(events(A).at(-1).outcome).toBe("blocked");
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
      ].join("\n"),
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
      ].map((e) => JSON.stringify(e)).join("\n") + "\n",
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
    expect(events(A).at(-4)).toMatchObject({ mode: "resume", folder: join(base, ".worktrees", "alpha", "docs", "plans", A) });
  });

  it("refuses when another session's marker names the plan log", () => {
    const log = resumeSeed();
    write(join(logs, "active", "other-session"), `${log}\n20261113-010000-othersess\n`);
    const r = start([`docs/plans/${A}`]);
    expect(r.status).toBe(1);
    expect(r.json.message).toMatch(/another session is running/);
  });
});
