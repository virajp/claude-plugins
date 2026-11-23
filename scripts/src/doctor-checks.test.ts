/**
 * vwf's doctor checks.mjs — the blocking checks /vwf:execute stops on — run
 * for real over invented repos copied into temp dirs, with `mise` and the
 * fixture binaries stubbed on a temp PATH. Every fixture name is invented.
 */
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
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
  "doctor",
  "scripts",
  "checks.mjs",
);
const FIXTURES = join(import.meta.dirname, "fixtures", "doctor-checks");

/** A parsed result. */
type Json = any;

/**
 * A `mise` that answers `tasks ls --json --no-global --hidden` from the
 * .mise-tasks-stub.json of its cwd (none reads as no task), in the shape the
 * real mise prints (an array of {name, ...}); a .mise-tasks-fail there fails
 * it. Every other call runs what follows `--` (D22).
 */
const MISE = `#!/bin/sh
if [ "$1" = tasks ]; then
  if [ "$*" != "tasks ls --json --no-global --hidden" ]; then echo "mise stub: unexpected $*" >&2; exit 2; fi
  if [ -f .mise-tasks-fail ]; then echo "mise ERROR the config does not parse" >&2; exit 1; fi
  if [ -f .mise-tasks-stub.json ]; then exec /bin/cat .mise-tasks-stub.json; fi
  echo "[]"; exit 0
fi
while [ "$#" -gt 0 ] && [ "$1" != "--" ]; do shift; done
shift
exec "$@"
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

/** A probe binary: records that it ran, fails when KITE_FAIL is set. */
const KITEPROBE = `#!/bin/sh
touch "$PROBE_MARK"
if [ -n "$KITE_FAIL" ]; then exit 3; fi
exit 0
`;

let root: string;
let bin: string;
/** The bootstrap stub's own PATH dir, kept when a case drops `mise`. */
let boot: string;
let env: NodeJS.ProcessEnv;

function stub(name: string, body: string, dir = bin) {
  writeFileSync(join(dir, name), body);
  chmodSync(join(dir, name), 0o755);
}

function git(cwd: string, ...args: string[]) {
  const r = spawnSync("git", args, { cwd, env, encoding: "utf8" });
  if (r.status !== 0) {
    throw new Error(`git ${args.join(" ")} in ${cwd}: ${r.stderr}`);
  }
}

/** Copy a fixture tree, fill its template hashes and make it a git repo. */
function repo(fixture: string, name: string, template?: string): string {
  const dir = join(root, name);
  cpSync(join(FIXTURES, fixture), dir, { recursive: true });
  if (template !== undefined) {
    const hash = createHash("sha256")
      .update(readFileSync(join(dir, ".claude", "stackgen", "templates", template)))
      .digest("hex");
    const lock = join(dir, ".claude", "stackgen", "lock.yaml");
    writeFileSync(lock, readFileSync(lock, "utf8").replaceAll("TEMPLATE_HASH", hash));
  }
  git(dir, "init", "-q");
  return dir;
}

function edit(file: string, from: string, to: string) {
  const text = readFileSync(file, "utf8");
  if (!text.includes(from)) {
    throw new Error(`${file} does not hold ${from}`);
  }
  writeFileSync(file, text.replace(from, to));
}

function checks(cwd: string, args: string[] = [], extra: NodeJS.ProcessEnv = {}) {
  const r = spawnSync(process.execPath, [SCRIPT, ...args], {
    cwd,
    env: { ...env, ...extra },
    encoding: "utf8",
  });
  let json: Json = null;
  try {
    json = JSON.parse(r.stdout);
  } catch {
    // a usage error prints no JSON
  }
  return { status: r.status, json, stderr: r.stderr };
}

/** Rewrite the bootstrap stub facts of a repo. */
function facts(dir: string, change: (f: Json) => void) {
  const file = join(dir, ".bootstrap-stub.json");
  const f = existsSync(file) ? JSON.parse(readFileSync(file, "utf8")) : {};
  change(f);
  writeFileSync(file, JSON.stringify(f));
}

function rules(json: Json) {
  return json.findings.map((f: Json) => `${f.rule}:${f.severity}`);
}

function find(json: Json, rule: string) {
  return json.findings.filter((f: Json) => f.rule === rule);
}

beforeEach(() => {
  root = realpathSync(mkdtempSync(join(tmpdir(), "doctor-checks-")));
  bin = join(root, "bin");
  mkdirSync(bin);
  stub("mise", MISE);
  stub("kitec", "#!/bin/sh\nexit 0\n");
  stub("kiteprobe", KITEPROBE);
  boot = join(root, "boot");
  mkdirSync(boot);
  stub("bootstrap", BOOTSTRAP, boot);
  env = {
    HOME: root,
    PATH: `${bin}:${boot}:/usr/bin:/bin`,
    PROBE_MARK: join(root, "probe-ran"),
    GIT_CONFIG_NOSYSTEM: "1",
  };
});

afterEach(() => {
  rmSync(root, { recursive: true, force: true });
});

describe("single repo", () => {
  let base: string;
  const config = () => join(base, ".config", "vwf.yaml");
  const registry = () => join(base, "docs", "blueprint", "registry.yaml");

  beforeEach(() => {
    // the iac project's folder is "." unless a case says otherwise
    base = repo("single", "lumen", "kite-service.md");
  });

  it("a clean repo exits 0 with no finding, and the probe ran", () => {
    const r = checks(base);
    expect(r.status).toBe(0);
    expect(r.json.base).toBe(base);
    expect(r.json.projects).toEqual(["orbit-api", "orbit-infra"]);
    expect(r.json.findings).toEqual([]);
    expect(existsSync(join(root, "probe-ran"))).toBe(true);
  });

  describe("a submodule falls back to its superproject (D38)", () => {
    let pier: string;

    beforeEach(() => {
      const src = join(root, "pier-src");
      mkdirSync(src);
      git(src, "init", "-q");
      writeFileSync(join(src, "readme.md"), "pier\n");
      git(src, "add", "-A");
      git(src, "-c", "user.name=Example", "-c", "user.email=example@example.com", "commit", "-q", "-m", "seed");
      git(base, "-c", "protocol.file.allow=always", "submodule", "add", "-q", src, "pier");
      pier = join(base, "pier");
    });

    it("with repo.home null", () => {
      facts(pier, () => {});
      const r = checks(pier);
      expect(r.status).toBe(0);
      expect(r.json.base).toBe(base);
    });

    it("when bootstrap exits 2", () => {
      const r = checks(pier);
      expect(r.status).toBe(0);
      expect(r.json.base).toBe(base);
    });
  });

  it("--repo runs from another directory", () => {
    const r = checks(root, ["--repo", join(base, "docs")]);
    expect(r.status).toBe(0);
    expect(r.json.base).toBe(base);
  });

  it("not onboarded is an info row, exit 0", () => {
    const bare = join(root, "bare");
    mkdirSync(bare);
    git(bare, "init", "-q");
    facts(bare, () => {});
    const r = checks(bare);
    expect(r.status).toBe(0);
    expect(r.json.base).toBeNull();
    expect(rules(r.json)).toEqual(["not-onboarded:info"]);
    expect(r.json.findings[0].project).toBeNull();
  });

  it("a repo with no .config/bootstrap/ is refused with bootstrap's errors text", () => {
    rmSync(join(base, ".bootstrap-stub.json"));
    const r = checks(base);
    expect(r.status).toBe(2);
    expect(r.stderr).toMatch(/no \.config\/bootstrap\/ here: run bootstrap migrate/);
  });

  it("an absent bootstrap is refused with the install hint", () => {
    rmSync(join(boot, "bootstrap"));
    const r = checks(base);
    expect(r.status).toBe(2);
    expect(r.stderr).toMatch(/bootstrap 4\.1\.0 or newer is required/);
  });

  it("early (no registry) is info and skips the project checks", () => {
    rmSync(registry());
    rmSync(join(base, ".claude"), { recursive: true });
    const r = checks(base);
    expect(r.status).toBe(0);
    expect(rules(r.json)).toEqual(["early:info"]);
    expect(r.json.projects).toEqual([]);
  });

  it("early still runs the repo-level checks", () => {
    rmSync(registry());
    const r = checks(base, [], { PATH: `${boot}:/usr/bin:/bin` });
    expect(rules(r.json)).toEqual(["early:info", "mise:blocking"]);
    expect(r.status).toBe(1);
  });

  describe("mise", () => {
    it("is blocking when an axis is pinned", () => {
      const r = checks(base, [], { PATH: `${boot}:/usr/bin:/bin` });
      expect(r.status).toBe(1);
      const [row] = find(r.json, "mise");
      expect(row).toMatchObject({
        severity: "blocking",
        project: null,
        remedy: "curl https://mise.run | sh",
      });
    });

    it("is degraded when nothing is pinned: the pins alone decide (D25)", () => {
      edit(config(), "template: project/kite-service", "template: unresolved");
      edit(config(), "template: repo/lumen-workspace", "template: unresolved");
      edit(config(), "cicd: lumen-ci", "cicd: unresolved");
      const r = checks(base, [], { PATH: `${boot}:/usr/bin:/bin` });
      expect(r.status).toBe(0);
      expect(rules(r.json)).toEqual(["mise:degraded"]);
    });

    it("a services pin alone makes it blocking", () => {
      edit(config(), "template: project/kite-service", "template: unresolved");
      edit(config(), "template: repo/lumen-workspace", "template: unresolved");
      edit(config(), "cicd: lumen-ci", "cicd: unresolved");
      edit(config(), "services: []", "services: [ kite-store ]");
      const r = checks(base, [], { PATH: `${boot}:/usr/bin:/bin` });
      expect(rules(r.json)).toEqual(["mise:blocking"]);
    });

    it("a repo with no mise config is the same finding", () => {
      rmSync(join(base, ".config", "mise.toml"));
      const r = checks(base);
      expect(r.status).toBe(1);
      expect(find(r.json, "mise")[0]).toMatchObject({
        severity: "blocking",
        remedy: "/vwf:setup reshape",
      });
    });
  });

  it("a custom project pin is blocking", () => {
    edit(config(), "template: project/kite-service", "template: custom");
    const r = checks(base);
    expect(r.status).toBe(1);
    expect(rules(r.json)).toEqual(["custom-pin:blocking"]);
    expect(r.json.findings[0].project).toBe("orbit-api");
  });

  it("a custom repo pin is a repo-level blocking row", () => {
    edit(config(), "template: repo/lumen-workspace", "template: custom");
    const r = checks(base);
    expect(r.status).toBe(1);
    expect(find(r.json, "custom-pin")[0]).toMatchObject({ severity: "blocking", project: null });
  });

  it("a template that misses a declared platform is blocking", () => {
    edit(registry(), "platforms: [ service ]", "platforms: [ service, cli ]");
    const r = checks(base);
    expect(r.status).toBe(1);
    const [row] = find(r.json, "platform-coverage");
    expect(row.severity).toBe("blocking");
    expect(row.message).toContain("cli");
  });

  it("a template with no platforms: covers every platform", () => {
    const template = join(base, ".claude", "stackgen", "templates", "kite-service.md");
    edit(template, "platforms: [ service, worker ]\n", "");
    edit(registry(), "platforms: [ service ]", "platforms: [ service, cli ]");
    const r = checks(base);
    expect(find(r.json, "platform-coverage")).toEqual([]);
  });

  describe("iac own repo (D21)", () => {
    beforeEach(() => {
      facts(base, (f) => (f["repo.projects.orbit-infra.folder"] = "infra/orbit"));
    });

    it("is blocking when its folder in its own repo is not .", () => {
      const r = checks(base);
      expect(r.status).toBe(1);
      expect(find(r.json, "iac-own-repo")[0]).toMatchObject({
        severity: "blocking",
        project: "orbit-infra",
        subject: "infra/orbit",
      });
    });

    it("is no finding when it is its own member repo, its folder .", () => {
      facts(base, (f) => {
        f["repo.members"] = {
          "orbit-infra": {
            folder: "infra/orbit",
            type: "submodule",
            url: "git@forge.example.test:lumen/orbit-infra.git",
          },
        };
      });
      const dir = join(base, "infra", "orbit");
      mkdirSync(dir, { recursive: true });
      git(dir, "init", "-q");
      writeFileSync(
        join(dir, ".bootstrap-stub.json"),
        JSON.stringify({
          "repo.home": { folder: "../..", type: "submodule" },
          "repo.projects.orbit-infra.folder": ".",
        }),
      );
      edit(config(), "  orbit-infra:\n", "  orbit-infra:\n    repo: orbit-infra\n");
      const r = checks(base);
      expect(r.status).toBe(0);
      expect(r.json.findings).toEqual([]);
    });

    it("is degraded under the D7 decline", () => {
      edit(
        config(),
        "rules: {}",
        "rules:\n    topology/iac-own-repo/orbit-infra: { waived: true, reason: kept in place }",
      );
      const r = checks(base);
      expect(r.status).toBe(0);
      expect(rules(r.json)).toEqual(["iac-own-repo:degraded"]);
    });
  });

  it("a pin with no lockfile entry is not materialized, and skips the language walk", () => {
    rmSync(join(base, ".claude", "stackgen", "lock.yaml"));
    rmSync(join(bin, "kitec"));
    const r = checks(base);
    expect(r.status).toBe(1);
    expect(rules(r.json)).toEqual(["not-materialized:blocking"]);
    expect(r.json.findings[0].remedy).toBe("/vwf:setup");
  });

  it.each([["stacks: []"], [""]])("with %j for stacks: no pin is walked (D38)", (line) => {
    rmSync(join(base, ".claude", "stackgen", "lock.yaml"));
    edit(config(), "stacks: [ stackgen ]", line);
    rmSync(join(bin, "kitec"));
    const r = checks(base);
    expect(r.status).toBe(0);
    expect(r.json.findings).toEqual([]);
  });

  it("a lockfile entry by template path alone counts as materialized", () => {
    const lock = join(base, ".claude", "stackgen", "lock.yaml");
    writeFileSync(lock, readFileSync(lock, "utf8").replaceAll("slug: kite-service", "slug: other"));
    expect(checks(base).json.findings).toEqual([]);
  });

  describe("languages (D9, D18)", () => {
    const tools = (f: Json) => f.describe.tools.find((t: Json) => t.name === "kite");

    it("a project no languages tool links is degraded, exit 0 (D28)", () => {
      facts(base, (f) => (tools(f).values.projects = []));
      const r = checks(base);
      expect(r.status).toBe(0);
      expect(rules(r.json)).toEqual(["language-tool:degraded"]);
      expect(find(r.json, "language-tool")[0]).toMatchObject({ project: "orbit-api", subject: "orbit-api" });
    });

    it("a package-managers tool alone does not count as a language", () => {
      facts(base, (f) => (tools(f).category = "package-managers"));
      const r = checks(base);
      expect(rules(r.json)).toEqual(["language-tool:degraded"]);
    });

    it("an iac, cicd or misc project needs no language tool (D27)", () => {
      edit(registry(), "platforms: [ iac ]", "platforms: [ iac, cicd, misc ]");
      expect(find(checks(base).json, "language-tool")).toEqual([]);
      edit(registry(), "platforms: [ iac, cicd, misc ]", "platforms: [ iac, worker ]");
      expect(find(checks(base).json, "language-tool")[0]).toMatchObject({ project: "orbit-infra" });
    });

    it("a linked tool the template has no facts for is no finding (D6)", () => {
      facts(
        base,
        (f) => f.describe.tools.push({ name: "zorn", category: "languages", values: { projects: ["orbit-api"] } }),
      );
      const r = checks(base);
      expect(r.status).toBe(0);
      expect(r.json.findings).toEqual([]);
    });

    it("a failed describe is a refusal with bootstrap's errors text", () => {
      facts(base, (f) => (f.describe = "fail"));
      const r = checks(base);
      expect(r.status).toBe(2);
      expect(r.stderr).toMatch(/bootstrap describe failed in .*: the values file does not parse/);
    });
  });

  describe("harness capabilities (D37)", () => {
    const tasks = (...names: string[]) =>
      writeFileSync(join(base, ".mise-tasks-stub.json"), JSON.stringify(names.map((name) => ({ name }))));
    const caps = (json: Json) => find(json, "harness").map((f: Json) => `${f.project}:${f.subject}:${f.severity}`);

    it("a browser platform with no dev and no screenshots task is two degraded rows, exit 0", () => {
      edit(registry(), "platforms: [ iac ]", "platforms: [ iac, webapp ]");
      tasks("lint", "test:e2e");
      const r = checks(base);
      expect(r.status).toBe(0);
      expect(caps(r.json)).toEqual(["orbit-infra:dev:degraded", "orbit-infra:screenshots:degraded"]);
      expect(find(r.json, "harness")[0].message).toBe(`dev missing: no dev task in ${base}`);
    });

    it("the fixed task names make them present; an alias does not count", () => {
      edit(registry(), "platforms: [ iac ]", "platforms: [ iac, site ]");
      tasks("dev", "screenshots");
      expect(caps(checks(base).json)).toEqual([]);
      writeFileSync(
        join(base, ".mise-tasks-stub.json"),
        JSON.stringify([{ name: "dev" }, { name: "shots", aliases: ["screenshots"] }]),
      );
      expect(caps(checks(base).json)).toEqual(["orbit-infra:screenshots:degraded"]);
    });

    it("a device platform needs dev and the test:golden port", () => {
      edit(registry(), "platforms: [ iac ]", "platforms: [ iac, mobile ]");
      tasks("dev", "test:golden");
      const r = checks(base);
      expect(caps(r.json)).toEqual(["orbit-infra:goldens:degraded"]);
      expect(find(r.json, "harness")[0].message).toContain("the test:golden port is not present");
      facts(base, (f) => (f.describe.ports[1].present = true));
      expect(caps(checks(base).json)).toEqual([]);
    });

    it("no screen platform reads no mise task", () => {
      writeFileSync(join(base, ".mise-tasks-fail"), "");
      const r = checks(base);
      expect(r.status).toBe(0);
      expect(r.json.findings).toEqual([]);
    });

    it("a failed mise call is a refusal with its error text (D25)", () => {
      edit(registry(), "platforms: [ iac ]", "platforms: [ iac, webapp ]");
      writeFileSync(join(base, ".mise-tasks-fail"), "");
      const r = checks(base);
      expect(r.status).toBe(2);
      expect(r.stderr).toMatch(
        /mise tasks ls --json --no-global --hidden failed in .*: mise ERROR the config does not parse/,
      );
    });

    it("an absent mise is the same refusal, before the mise row (D25, D38)", () => {
      edit(registry(), "platforms: [ iac ]", "platforms: [ iac, webapp ]");
      const r = checks(base, [], { PATH: `${boot}:/usr/bin:/bin` });
      expect(r.status).toBe(2);
      expect(r.stderr).toMatch(
        /mise tasks ls --json --no-global --hidden failed in .*: mise is not on PATH/,
      );
    });
  });

  describe("project folders (D11, D26)", () => {
    it("a project with no repo.projects entry is degraded, with the config set fix", () => {
      facts(base, (f) => delete f["repo.projects.orbit-api.folder"]);
      const r = checks(base);
      expect(r.status).toBe(0);
      expect(find(r.json, "project-folder")).toEqual([
        expect.objectContaining({
          severity: "degraded",
          project: "orbit-api",
          remedy: `bootstrap config set repo.projects.orbit-api '{"folder":"<path>"}' --json`,
        }),
      ]);
    });

    it("an iac project with no entry gets the folder row and no iac row", () => {
      facts(base, (f) => delete f["repo.projects.orbit-infra.folder"]);
      const r = checks(base);
      expect(rules(r.json)).toEqual(["project-folder:degraded"]);
    });
  });

  describe("binaries", () => {
    it("a bare name missing from PATH is blocking", () => {
      rmSync(join(bin, "kitec"));
      const r = checks(base);
      expect(r.status).toBe(1);
      expect(find(r.json, "binary")[0]).toMatchObject({ severity: "blocking", subject: "kitec" });
    });

    it("a failing probe is blocking", () => {
      const r = checks(base, [], { KITE_FAIL: "1" });
      expect(r.status).toBe(1);
      const [row] = find(r.json, "binary");
      expect(row.subject).toBe("kiteprobe");
      expect(row.message).toContain("exited 3");
    });

    it("the hash gate: a changed template entry is not probed", () => {
      const template = join(base, ".claude", "stackgen", "templates", "kite-service.md");
      edit(template, "An invented template", "An edited template");
      const r = checks(base);
      expect(r.status).toBe(1);
      expect(find(r.json, "binary")[0].message).toContain("probe not run");
      expect(existsSync(join(root, "probe-ran"))).toBe(false);
    });

    it("a binary is reported once, not per project", () => {
      edit(
        registry(),
        "  - name: orbit-infra",
        "  - name: orbit-web\n    role: backend\n    platforms: [ worker ]\n  - name: orbit-infra",
      );
      edit(
        config(),
        "  orbit-infra:",
        "  orbit-web:\n    stack:\n      template: project/kite-service\n  orbit-infra:",
      );
      facts(base, (f) => {
        f["repo.projects.orbit-web.folder"] = "apps/orbit-web";
        f.describe.tools.find((t: Json) => t.name === "kite").values.projects.push("orbit-web");
      });
      rmSync(join(bin, "kitec"));
      const r = checks(base);
      const rows = find(r.json, "binary");
      expect(rows).toHaveLength(1);
      expect(rows[0].message).toContain("orbit-api, orbit-web");
    });
  });

  describe("--projects", () => {
    beforeEach(() => {
      facts(base, (f) => delete f["repo.projects.orbit-api.folder"]);
    });

    it("scopes the project checks", () => {
      const r = checks(base, ["--projects", "orbit-infra"]);
      expect(r.status).toBe(0);
      expect(r.json.projects).toEqual(["orbit-infra"]);
      expect(r.json.findings).toEqual([]);
    });

    it("an empty list runs the repo-level checks only", () => {
      const r = checks(base, ["--projects", ""], { PATH: `${boot}:/usr/bin:/bin` });
      expect(r.json.projects).toEqual([]);
      expect(rules(r.json)).toEqual(["mise:blocking"]);
    });

    it("a name the registry lacks is an error, exit 2", () => {
      const r = checks(base, ["--projects", "nope"]);
      expect(r.status).toBe(2);
      expect(r.stderr).toContain("nope");
    });
  });

  it("a usage error exits 2", () => {
    expect(checks(base, ["--bogus", "x"]).status).toBe(2);
    expect(checks(base, ["--repo"]).status).toBe(2);
    expect(checks(base, ["--repo", join(base, "missing")]).status).toBe(2);
  });
});

describe("multi repo", () => {
  let base: string;
  let member: string;
  const config = () => join(base, ".config", "vwf.yaml");

  beforeEach(() => {
    base = repo(join("multi", "harbor"), "harbor");
    member = repo(join("multi", "dock-app"), "dock-app", "kite-app.md");
  });

  it("a clean product exits 0; the absent member is no finding", () => {
    const r = checks(base);
    expect(r.status).toBe(0);
    expect(r.json.findings).toEqual([]);
  });

  it("a run inside a member resolves the base", () => {
    const r = checks(member);
    expect(r.status).toBe(0);
    expect(r.json.base).toBe(base);
  });

  it("the member's template is read from the member repo", () => {
    edit(join(base, "docs", "blueprint", "registry.yaml"), "platforms: [ mobile ]", "platforms: [ mobile, watch ]");
    const r = checks(base);
    expect(find(r.json, "platform-coverage")[0]).toMatchObject({ project: "dock-app" });
  });

  it("a member with no url is blocking", () => {
    facts(base, (f) => delete f["repo.members"]["dock-absent"].url);
    const r = checks(base);
    expect(r.status).toBe(1);
    expect(find(r.json, "member-url")[0]).toMatchObject({
      severity: "blocking",
      project: null,
      subject: "dock-absent",
    });
  });

  it("a multi-repo topology with no members is blocking", () => {
    facts(base, (f) => delete f["repo.members"]);
    const r = checks(base);
    expect(r.status).toBe(1);
    expect(rules(r.json)).toContain("membership:blocking");
  });

  it("a present sibling member with no repo.home is drift, with the setup:configs fix", () => {
    facts(member, (f) => delete f["repo.home"]);
    const r = checks(base);
    expect(r.status).toBe(0);
    expect(find(r.json, "membership")).toEqual([
      expect.objectContaining({
        severity: "drift",
        subject: "dock-app",
        remedy: "from the base repo, run setup:configs --dock-app",
      }),
    ]);
  });

  it("a present submodule member with no repo.home is drift too", () => {
    facts(base, (f) => (f["repo.members"]["dock-app"].type = "submodule"));
    facts(member, (f) => delete f["repo.home"]);
    const r = checks(base);
    expect(find(r.json, "membership")[0]).toMatchObject({ severity: "drift", subject: "dock-app" });
  });

  it("a member with no .config/bootstrap/ is refused", () => {
    rmSync(join(member, ".bootstrap-stub.json"));
    const r = checks(base);
    expect(r.status).toBe(2);
    expect(r.stderr).toMatch(/run bootstrap migrate/);
  });

  it("a vwf-membership.yaml left in a member whose repo.home resolves is drift", () => {
    mkdirSync(join(member, ".config"), { recursive: true });
    writeFileSync(
      join(member, ".config", "vwf-membership.yaml"),
      "vwf_membership: 1\nproduct: harbor\nhost: ../harbor\n",
    );
    const r = checks(base);
    expect(r.status).toBe(0);
    expect(find(r.json, "membership")[0]).toMatchObject({ severity: "drift", subject: "dock-app" });
  });

  it("a member project's folder and tools are read in the member repo", () => {
    facts(member, (f) => delete f["repo.projects.dock-app.folder"]);
    facts(member, (f) => (f.describe.tools[1].values.projects = []));
    const r = checks(base);
    expect(r.status).toBe(0);
    expect(rules(r.json)).toEqual(["project-folder:degraded", "language-tool:degraded"]);
    expect(find(r.json, "project-folder")[0].message).toContain(member);
  });

  it("a member project's capabilities are read in the member repo (D24)", () => {
    rmSync(join(member, ".mise-tasks-stub.json"));
    facts(member, (f) => (f.describe.ports[1].present = false));
    writeFileSync(join(base, ".mise-tasks-stub.json"), JSON.stringify([{ name: "dev" }]));
    const r = checks(base);
    expect(r.status).toBe(0);
    expect(find(r.json, "harness")).toEqual([
      expect.objectContaining({ severity: "degraded", project: "dock-app", subject: "dev" }),
      expect.objectContaining({ severity: "degraded", project: "dock-app", subject: "goldens" }),
    ]);
    expect(find(r.json, "harness")[0].message).toContain(member);
  });

  it("a folder member needs no url and no repo.home, and its project reads the base's template", () => {
    facts(base, (f) => (f["repo.members"]["dock-yard"] = { folder: "yard", type: "folder" }));
    edit(config(), "  dock-absent:\n    repo: dock-absent\n", "  dock-absent:\n    repo: dock-yard\n");
    const r = checks(base);
    expect(find(r.json, "member-url")).toEqual([]);
    expect(find(r.json, "membership")).toEqual([]);
    // the base has no materialized kite-app, so the folder member's pin is not materialized there
    expect(find(r.json, "not-materialized")[0]).toMatchObject({ project: "dock-absent" });
    expect(find(r.json, "not-materialized")[0].message).toContain(base);
  });
});
