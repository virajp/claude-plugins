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

/** A `mise` that runs what follows `--`. */
const MISE = `#!/bin/sh
while [ "$#" -gt 0 ] && [ "$1" != "--" ]; do shift; done
shift
exec "$@"
`;

/** A probe binary: records that it ran, fails when KITE_FAIL is set. */
const KITEPROBE = `#!/bin/sh
touch "$PROBE_MARK"
if [ -n "$KITE_FAIL" ]; then exit 3; fi
exit 0
`;

let root: string;
let bin: string;
let env: NodeJS.ProcessEnv;

function stub(name: string, body: string) {
  writeFileSync(join(bin, name), body);
  chmodSync(join(bin, name), 0o755);
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
  env = {
    HOME: root,
    PATH: `${bin}:/usr/bin:/bin`,
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
    base = repo("single", "lumen", "kite-service.md");
    // the iac project is its own repo unless a case says otherwise
    mkdirSync(join(base, "infra", "orbit"), { recursive: true });
    git(join(base, "infra", "orbit"), "init", "-q");
  });

  it("a clean repo exits 0 with no finding, and the probe ran", () => {
    const r = checks(base);
    expect(r.status).toBe(0);
    expect(r.json.base).toBe(base);
    expect(r.json.projects).toEqual(["orbit-api", "orbit-infra"]);
    expect(r.json.findings).toEqual([]);
    expect(existsSync(join(root, "probe-ran"))).toBe(true);
  });

  it("--repo runs from another directory", () => {
    const r = checks(root, ["--repo", join(base, "infra")]);
    expect(r.status).toBe(0);
    expect(r.json.base).toBe(base);
  });

  it("not onboarded is an info row, exit 0", () => {
    const bare = join(root, "bare");
    mkdirSync(bare);
    git(bare, "init", "-q");
    const r = checks(bare);
    expect(r.status).toBe(0);
    expect(r.json.base).toBeNull();
    expect(rules(r.json)).toEqual(["not-onboarded:info"]);
    expect(r.json.findings[0].project).toBeNull();
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
    const r = checks(base, [], { PATH: "/usr/bin:/bin" });
    expect(rules(r.json)).toEqual(["early:info", "mise:blocking"]);
    expect(r.status).toBe(1);
  });

  describe("mise", () => {
    it("is blocking when an axis is pinned", () => {
      const r = checks(base, [], { PATH: "/usr/bin:/bin" });
      expect(r.status).toBe(1);
      const [row] = find(r.json, "mise");
      expect(row).toMatchObject({
        severity: "blocking",
        project: null,
        remedy: "curl https://mise.run | sh",
      });
    });

    it("is degraded when nothing is pinned and no capability is claimed", () => {
      edit(config(), "template: project/kite-service", "template: unresolved");
      edit(config(), "languages: [ kite ]", "languages: []");
      edit(config(), "template: repo/lumen-workspace", "template: unresolved");
      edit(config(), "cicd: lumen-ci", "cicd: unresolved");
      edit(config(), "dev: true", "dev: false");
      const r = checks(base, [], { PATH: "/usr/bin:/bin" });
      expect(r.status).toBe(0);
      expect(rules(r.json)).toEqual(["mise:degraded"]);
    });

    it("a claimed capability alone makes it blocking", () => {
      edit(config(), "template: project/kite-service", "template: unresolved");
      edit(config(), "languages: [ kite ]", "languages: []");
      edit(config(), "template: repo/lumen-workspace", "template: unresolved");
      edit(config(), "cicd: lumen-ci", "cicd: unresolved");
      edit(config(), "dev: true", "dev: { present: true }");
      const r = checks(base, [], { PATH: "/usr/bin:/bin" });
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

  describe("iac own repo", () => {
    beforeEach(() => {
      rmSync(join(base, "infra"), { recursive: true });
      mkdirSync(join(base, "infra", "orbit"), { recursive: true });
    });

    it("is blocking inside another repo", () => {
      const r = checks(base);
      expect(r.status).toBe(1);
      expect(find(r.json, "iac-own-repo")[0]).toMatchObject({
        severity: "blocking",
        project: "orbit-infra",
      });
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

  it("a pin with no lockfile entry is not materialized, and skips the token walk", () => {
    rmSync(join(base, ".claude", "stackgen", "lock.yaml"));
    edit(config(), "languages: [ kite ]", "languages: [ kite, zorn ]");
    const r = checks(base);
    expect(r.status).toBe(1);
    expect(rules(r.json)).toEqual(["not-materialized:blocking"]);
    expect(r.json.findings[0].remedy).toBe("/vwf:setup");
  });

  it.each([["stacks: []"], [""]])("with %j for stacks: no pin is walked (D38)", (line) => {
    rmSync(join(base, ".claude", "stackgen", "lock.yaml"));
    edit(config(), "stacks: [ stackgen ]", line);
    edit(config(), "languages: [ kite ]", "languages: [ kite, zorn ]");
    const r = checks(base);
    expect(r.status).toBe(0);
    expect(r.json.findings).toEqual([]);
  });

  it("a lockfile entry by template path alone counts as materialized", () => {
    const lock = join(base, ".claude", "stackgen", "lock.yaml");
    writeFileSync(lock, readFileSync(lock, "utf8").replaceAll("slug: kite-service", "slug: other"));
    expect(checks(base).json.findings).toEqual([]);
  });

  describe("languages", () => {
    it("a token with no facts is unknown and degraded even while pinned (D39), exit 0", () => {
      edit(config(), "languages: [ kite ]", "languages: [ kite, zorn ]");
      const r = checks(base);
      expect(r.status).toBe(0);
      expect(rules(r.json)).toEqual(["unknown-language:degraded"]);
      expect(find(r.json, "unknown-language")[0]).toMatchObject({
        severity: "degraded",
        project: "orbit-api",
        subject: "zorn",
      });
    });

    it("is degraded while the template reads unresolved", () => {
      edit(config(), "languages: []", "languages: [ zorn ]");
      const r = checks(base);
      expect(r.status).toBe(0);
      expect(find(r.json, "unknown-language")[0]).toMatchObject({
        severity: "degraded",
        project: "orbit-infra",
      });
    });

    it("an optional token is known, its rows unverified: info", () => {
      edit(config(), "languages: [ kite ]", "languages: [ kite, quill ]");
      const r = checks(base);
      expect(r.status).toBe(0);
      expect(rules(r.json)).toEqual(["unknown-language:info"]);
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
        "  - name: orbit-web\n    role: backend\n    platforms: [ worker ]\n    path: apps/orbit-web\n  - name: orbit-infra",
      );
      edit(
        config(),
        "  orbit-infra:",
        "  orbit-web:\n    stack:\n      template: project/kite-service\n      languages: [ kite ]\n  orbit-infra:",
      );
      rmSync(join(bin, "kitec"));
      const r = checks(base);
      const rows = find(r.json, "binary");
      expect(rows).toHaveLength(1);
      expect(rows[0].message).toContain("orbit-api, orbit-web");
    });
  });

  describe("--projects", () => {
    beforeEach(() => {
      edit(config(), "languages: [ kite ]", "languages: [ kite, zorn ]");
    });

    it("scopes the project checks", () => {
      const r = checks(base, ["--projects", "orbit-infra"]);
      expect(r.status).toBe(0);
      expect(r.json.projects).toEqual(["orbit-infra"]);
      expect(r.json.findings).toEqual([]);
    });

    it("an empty list runs the repo-level checks only", () => {
      const r = checks(base, ["--projects", ""], { PATH: "/usr/bin:/bin" });
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
    edit(config(), "    url: git@forge.example.test:harbor/dock-absent.git\n", "");
    const r = checks(base);
    expect(r.status).toBe(1);
    expect(find(r.json, "member-url")[0]).toMatchObject({
      severity: "blocking",
      project: null,
      subject: "dock-absent",
    });
  });

  it("a multi-repo topology with no members is blocking", () => {
    const text = readFileSync(config(), "utf8");
    writeFileSync(config(), text.replace(/members:\n(?: {2}.*\n)+/, ""));
    const r = checks(base);
    expect(r.status).toBe(1);
    expect(rules(r.json)).toContain("membership:blocking");
  });

  it("a present member with no membership file is blocking", () => {
    rmSync(join(member, ".config", "vwf-membership.yaml"));
    const r = checks(base);
    expect(r.status).toBe(1);
    expect(find(r.json, "membership")[0].subject).toBe("dock-app");
  });

  it("a member naming another product is blocking", () => {
    edit(join(member, ".config", "vwf-membership.yaml"), "product: harbor", "product: quay");
    const r = checks(base);
    expect(r.status).toBe(1);
    expect(find(r.json, "membership")).toHaveLength(1);
  });

  it("a repo carrying a membership file the base does not list is blocking", () => {
    const stray = join(root, "dock-stray");
    mkdirSync(join(stray, ".config"), { recursive: true });
    writeFileSync(
      join(stray, ".config", "vwf-membership.yaml"),
      "vwf_membership: 1\nproduct: harbor\nhost: ../harbor\n",
    );
    git(stray, "init", "-q");
    const r = checks(stray);
    expect(r.status).toBe(1);
    expect(find(r.json, "membership")[0].subject).toBe(stray);
    // the half that checks the starting repo only: not from the base
    expect(checks(base).status).toBe(0);
  });
});
