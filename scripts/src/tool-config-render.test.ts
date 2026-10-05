/**
 * The tool-config script's `all` and `upgrade`, run for real against a temp
 * repo with a fake `mise` on PATH: the greenfield render against a golden,
 * idempotence, the marker pair, NODE placement, whole-file rows, exact pins
 * where CI loads them, `.config/stackgen.yaml` written and re-read, and the
 * engine's refusals — arguments, rows and answers, unsafe paths, a missing
 * or untrusting mise, and the steps a write runs. It lives here because
 * `vitest.config.mts` collects only `{installer,scripts}/src/**\/*.test.ts`.
 */
import { spawnSync } from "node:child_process";
import {
  chmodSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
} from "vitest";
import {
  type Harness,
  harness,
  NODE_ALL,
  skillDir,
  stacksDir,
} from "./fixtures/tool-config/harness.ts";
// @ts-expect-error TS7016 — no declaration file for a shipped .mjs module
import * as paths from "../../plugins/stackgen/skills/tool-config/scripts/lib/paths.mjs";
// @ts-expect-error TS7016 — no declaration file for a shipped .mjs module
import * as values from "../../plugins/stackgen/skills/tool-config/scripts/lib/values.mjs";

const GOLDEN = join(
  import.meta.dirname,
  "fixtures",
  "tool-config",
  "all-node.golden.json",
);

let h: Harness;
beforeEach(() => {
  h = harness("render");
});
afterEach(() => {
  h.cleanup();
});

/** Every file under a tree, repo-relative. */
function files(dir: string, at = ""): string[] {
  return readdirSync(join(dir, at), { withFileTypes: true })
    .flatMap(d => {
      const rel = at ? `${at}/${d.name}` : d.name;
      return d.isDirectory() ? files(dir, rel) : [rel];
    })
    .sort();
}

const isExec = (abs: string) => (statSync(abs).mode & 0o111) !== 0;

describe("all on a greenfield repo", () => {
  it("lands every asset byte for byte and every template as the golden reads", () => {
    const { status, out } = h.apply(NODE_ALL);
    expect(out.error).toBeUndefined();
    expect(status).toBe(0);

    const assets = join(skillDir, "assets");
    for (const path of files(assets)) {
      expect(h.read(path), path).toBe(
        readFileSync(join(assets, path), "utf8"),
      );
      expect(isExec(join(h.repo, path)), path).toBe(
        isExec(join(assets, path)),
      );
    }

    const templates = join(skillDir, "templates");
    const rendered: Record<string, string> = {};
    for (const path of files(templates)) {
      const abs = join(h.repo, path);
      if (!existsSync(abs)) {
        rendered[path] = "<not written>";
        continue;
      }
      rendered[path] = h.read(path);
      expect(isExec(abs), path).toBe(isExec(join(templates, path)));
    }
    rendered[".config/stackgen.yaml"] = h.read(".config/stackgen.yaml");
    if (process.env["UPDATE_GOLDEN"]) {
      writeFileSync(GOLDEN, JSON.stringify(rendered, null, 2) + "\n");
    }
    expect(rendered).toEqual(JSON.parse(readFileSync(GOLDEN, "utf8")));
  });

  it("is idempotent: the same call again shows no row and writes nothing", () => {
    h.apply(NODE_ALL);
    const again = h.run(["preview", ...NODE_ALL]);
    expect(again.out.rows).toEqual([]);
    const second = h.run(NODE_ALL);
    expect(second.status).toBe(0);
    expect(second.out.written).toEqual([]);
    expect(second.out.deleted).toEqual([]);
  });

  it("runs setup:all after writing, then formats the written files, every tool as mise x --", () => {
    h.apply(NODE_ALL);
    const log = h.log();
    const setup = log.findIndex(l => l === "MISE_ENV=dev run setup:all");
    const fmt = log.findIndex(l =>
      l.startsWith(
        "MISE_ENV=dev x -- dprint fmt --config .config/dprint.json --allow-no-files",
      )
    );
    const validate = log.findIndex(l =>
      l
        === "MISE_ENV=dev x -- pre-commit validate-config .config/pre-commit-config.yaml"
    );
    expect(setup).toBeGreaterThan(-1);
    expect(fmt).toBeGreaterThan(setup);
    expect(validate).toBeGreaterThan(fmt);
  });

  it("refuses without a repo name, writing nothing", () => {
    const { status, out } = h.run(["preview", "all", "--node", "true"]);
    expect(status).toBe(2);
    expect(out.error).toContain("--repo-name");
    expect(existsSync(join(h.repo, ".config"))).toBe(false);
  });
});

describe("stackgen.yaml", () => {
  it("is written in the reader's grammar and re-read by the values loader", () => {
    h.apply([...NODE_ALL, "--merge-model-main", "direct", "--forge", "github"]);
    const v = values.loadValues(h.repo) as Record<string, unknown>;
    expect(v).toMatchObject({
      FORMAT: 1,
      REPO_NAME: "widget",
      MERGE_MODEL_MAIN: "direct",
      MEMBERS: ["apps/web", "svc/API_x"],
      SCOPES: ["web", "api"],
      NODE: true,
      FORGE: "github",
      REPO_URL: "https://github.com/acme/widget",
      PROJECT_NAME: "acme/widget",
    });
  });

  it("keeps every stored value on a call that gives none", () => {
    h.apply(NODE_ALL);
    h.apply(["all"]);
    expect(h.read(".config/stackgen.yaml")).toContain("repo_name: \"widget\"");
    expect(h.read(".config/mise/conf.d/_base/mise.toml")).toContain(
      "MEMBERS = \"apps/web svc/API_x\"",
    );
  });

  it("shows a value change as a row answered ok alone, and renders from it", () => {
    h.apply(NODE_ALL);
    const { out } = h.run(["preview", "all", "--merge-model-main", "direct"]);
    const row = out.rows?.find(r => r.path === ".config/stackgen.yaml");
    expect(row?.answers).toEqual(["ok"]);
    expect(row?.added).toContain("  main: \"direct\"");
    expect(
      out
        .rows
        ?.find(r => r.path === ".config/mise/conf.d/_base/mise.toml")
        ?.added,
    )
      .toContain("MERGE_MODEL_MAIN    = \"direct\"");
  });

  it("falls back to the repo name for PROJECT_NAME when there is no origin", () => {
    spawnSync("git", ["remote", "remove", "origin"], { cwd: h.repo });
    h.apply(NODE_ALL);
    expect(JSON.parse(h.read(".config/claude-status.json"))).toMatchObject({
      projectName: "widget",
    });
    expect(h.read(".config/git-conventional-commits.yaml")).not.toContain(
      "commitUrl",
    );
  });
});

describe("NODE placement", () => {
  it("pins node and pnpm in _base/mise.toml, latest, and adds the CI gpg setting", () => {
    h.apply(NODE_ALL);
    const base = h.read(".config/mise/conf.d/_base/mise.toml");
    expect(base).toContain("[tools.node]\nversion = \"latest\"");
    expect(base).toContain("npm.package_manager = \"pnpm\"");
    expect(h.read(".config/mise/conf.d/_base/mise.dev.toml")).not.toContain(
      "[tools.node]",
    );
    expect(h.read(".config/mise/conf.d/_base/mise.ci.toml")).toContain(
      "node.gpg_verify = false",
    );
  });

  it("pins them in _base/mise.dev.toml otherwise, and writes no empty CI file", () => {
    h.apply(["all", "--repo-name", "widget"]);
    expect(h.read(".config/mise/conf.d/_base/mise.toml")).not.toContain(
      "[tools.node]",
    );
    expect(h.read(".config/mise/conf.d/_base/mise.dev.toml")).toContain(
      "[tools.node]",
    );
    expect(existsSync(join(h.repo, ".config/mise/conf.d/_base/mise.ci.toml")))
      .toBe(false);
  });
});

describe("the marker pair", () => {
  it("rewrites only between the markers and keeps the repo's lines outside", () => {
    h.apply(NODE_ALL);
    const original = h.read(".gitignore");
    h.write(
      ".gitignore",
      original.replace("graphify-out/\n", "") + "my-own/\n",
    );
    const { out } = h.run(["preview", "all"]);
    expect(out.rows).toHaveLength(1);
    expect(out.rows?.[0]).toMatchObject({
      kind: "write",
      path: ".gitignore",
      added: ["graphify-out/"],
      removed: [],
      answers: ["ok", "keep-existing"],
    });
    h.apply(["all"]);
    expect(h.read(".gitignore")).toBe(original + "my-own/\n");
  });

  it("offers the whole file, with a note, when the repo's copy has no marker pair", () => {
    h.write(".graphifyignore", "vendor/\n");
    const { out } = h.run(["preview", ...NODE_ALL]);
    expect(out.notes?.join("\n")).toContain(".graphifyignore");
    expect(out.rows?.find(r => r.path === ".graphifyignore")).toMatchObject({
      kind: "write",
      removed: ["vendor/"],
    });
  });
});

describe("whole-owned files", () => {
  it("shows a hand edit as one row: keep-existing leaves it, ok takes the render", () => {
    h.apply(NODE_ALL);
    const path = ".config/mise/tasks/code/count";
    const original = h.read(path);
    h.write(path, original + "echo extra\n");
    const { out } = h.run(["preview", "all"]);
    expect(out.rows).toHaveLength(1);
    expect(out.rows?.[0]).toMatchObject({
      kind: "write",
      path,
      removed: ["echo extra"],
      answers: ["ok", "keep-existing"],
    });
    h.apply(["all"], () => "keep-existing");
    expect(h.read(path)).toBe(original + "echo extra\n");
    h.apply(["all"], () => "ok");
    expect(h.read(path)).toBe(original);
  });

  it("restores a dropped executable bit as a write row", () => {
    h.apply(NODE_ALL);
    const path = ".config/mise/tasks/code/count";
    chmodSync(join(h.repo, path), 0o644);
    const { out } = h.run(["preview", "all"]);
    expect(out.rows?.[0]).toMatchObject({ kind: "write", path, mode: "755" });
    h.apply(["all"]);
    expect(isExec(join(h.repo, path))).toBe(true);
  });

  it("deletes the copy of a template that now renders empty", () => {
    h.apply([...NODE_ALL, "--external", "true"]);
    const start = ".config/mise/tasks/setup/external/start";
    expect(h.read(start)).toContain("placeholder_notice");
    expect(h.read(".config/mise/tasks/setup/all")).toContain(
      "setup:external:start",
    );
    const { out } = h.run(["preview", "all", "--external", "false"]);
    expect(out.rows?.filter(r => r.kind === "delete").map(r => r.path))
      .toEqual([
        ".config/mise/tasks/setup/external/pull",
        start,
        ".config/mise/tasks/setup/external/stop",
      ]);
    h.apply(["all", "--external", "false"]);
    expect(existsSync(join(h.repo, start))).toBe(false);
  });

  it("never overwrites a slot a pack or the repo has filled", () => {
    h.apply(NODE_ALL);
    h.write(
      ".config/mise/tasks/setup/secrets",
      readFileSync(
        join(
          stacksDir,
          "capability-provider/fnox/config/.config/mise/tasks/setup/secrets",
        ),
        "utf8",
      ),
    );
    const rows = h.run(["preview", "all"]).out.rows ?? [];
    expect(rows.map(r => r.path)).not.toContain(
      ".config/mise/tasks/setup/secrets",
    );
  });

  it("takes a render the formatter would leave as the file already reads", () => {
    h.apply(NODE_ALL);
    const path = ".config/claude-status.json";
    // the fake formatter echoes its input: the file as written is the formatted form
    const log = h.log().length;
    h.write(path, h.read(path) + "\n");
    const { out } = h.run(["preview", "all"]);
    expect(out.rows?.map(r => r.path)).toEqual([path]);
    expect(
      h.log().slice(log).some(l =>
        l.includes(`dprint fmt --config .config/dprint.json --stdin ${path}`)
      ),
    )
      .toBe(true);
  });
});

describe("pins", () => {
  it("makes a CI-loaded latest pin exact, keeps an exact one it already holds, and leaves dev files on latest", () => {
    h.apply(NODE_ALL);
    const dir = join(stacksDir, "toolchain-gate", "swiftlint");
    h.apply(["pack", "--slug", "swiftlint", "--dir", dir]);
    const file = ".config/mise/conf.d/swiftlint/mise.toml";
    expect(h.read(file)).toContain("version = \"1.2.3\"");
    expect(h.read(".config/mise/conf.d/_base/mise.dev.toml")).not.toMatch(
      /version = "\d/,
    );
    // a newer release does not move a pin the render already made exact
    const later = { FAKE_MISE_LATEST: "1.3.0" };
    expect(
      h
        .run(["preview", "pack", "--slug", "swiftlint", "--dir", dir], later)
        .out
        .rows,
    )
      .toEqual([]);
  });

  it("refuses a pin mise latest cannot resolve, writing nothing", () => {
    const dir = join(stacksDir, "toolchain-gate", "swiftlint");
    const { status, out } = h.run([
      "preview",
      "pack",
      "--slug",
      "swiftlint",
      "--dir",
      dir,
    ], { FAKE_MISE_LATEST_FAIL: "1" });
    expect(status).toBe(2);
    expect(out.error).toContain("mise latest aqua:realm/SwiftLint");
  });

  it("upgrade moves each exact pin forward, one row per pin, and keep-existing holds one", () => {
    h.write(
      ".config/mise/conf.d/tools/mise.toml",
      "[tools.alpha]\nversion = \"1.0.0\"\n\n[tools]\nbeta = \"2.0.0\"\nnode = \"latest\"\n",
    );
    h.write(
      ".config/mise/conf.d/tools/mise.dev.toml",
      "[tools.gamma]\nversion = \"1.0.0\"\n",
    );
    const later = { FAKE_MISE_LATEST: "3.1.0" };
    const { out } = h.run(["preview", "upgrade"], later);
    expect(out.rows?.map(r => [r.kind, r["tool"], r["from"], r["to"]]))
      .toEqual([
        ["pin", "alpha", "1.0.0", "3.1.0"],
        ["pin", "beta", "2.0.0", "3.1.0"],
      ]);
    h.apply(
      ["upgrade"],
      r => (r["tool"] === "beta" ? "keep-existing" : "ok"),
      later,
    );
    expect(h.read(".config/mise/conf.d/tools/mise.toml")).toBe(
      "[tools.alpha]\nversion = \"3.1.0\"\n\n[tools]\nbeta = \"2.0.0\"\nnode = \"latest\"\n",
    );
  });
});

describe("argument refusals", () => {
  it.each([
    [["mise", "add-tool"], "retired"],
    [["check"], "retired"],
    [["apply-entries", "--pack", "x"], "retired"],
    [["all", "add-exclude", "--paths", "x"], "takes no verb"],
    [["all", "--for", "x"], "--for is retired"],
    [["all", "--update-bot", "renovate"], "unknown flag --update-bot"],
    [["all", "--node", "maybe"], "true or false"],
    [["all", "--merge-model-main", "squash"], "direct or pr"],
    [["all", "--repo-name", "a\"b"], "letters, digits"],
    [["all", "--members", "../x"], "not a valid entry"],
    [["all", "--scopes", "a,a"], "twice"],
    [["pack", "--dir", "x"], "needs --slug"],
    [["pack", "--slug", "Bad", "--dir", "x"], "not a pack slug"],
    [["pack", "--slug", "x"], "needs --dir"],
    [["pack", "--slug", "x", "--dir", "x", "--set", "K=v"], "lowercase key"],
    [["pack", "--slug", "x", "--dir", "x", "--set", "k=a\"b"], "quote"],
    [["pack", "--slug", "x", "--dir", "/nonexistent"], "not a folder"],
    [["upgrade", "--slug", "x"], "unknown flag --slug"],
  ])("refuses %j", (args, message) => {
    const { status, out } = h.run(args);
    expect(status).toBe(2);
    expect(out.error).toContain(message);
  });

  it("refuses --answers on a preview", () => {
    const { status, out } = h.run(["preview", "upgrade", "--answers", "r1:ok"]);
    expect(status).toBe(2);
    expect(out.error).toContain("never carries --answers");
  });
});

describe("rows and answers", () => {
  it("numbers rows in order, each with its answers", () => {
    const { out } = h.run(["preview", ...NODE_ALL]);
    expect(out.rows?.map(r => r.id).slice(0, 3)).toEqual(["r1", "r2", "r3"]);
    expect(out.rows?.[0]).toMatchObject({
      kind: "create",
      path: ".config/stackgen.yaml",
      answers: ["ok"],
    });
  });

  it("refuses a call with rows and no --answers, showing the rows", () => {
    const { status, out } = h.run(NODE_ALL);
    expect(status).toBe(2);
    expect(out.error).toContain("--answers");
    expect(out.rows?.length).toBeGreaterThan(0);
  });

  it("refuses answers with no preview on record", () => {
    const { status, out } = h.run([...NODE_ALL, "--answers", "r1:ok"]);
    expect(status).toBe(2);
    expect(out.error).toContain("no preview on record");
  });

  it("refuses a missing id, an unknown id and a wrong answer — writing nothing", () => {
    const rows = h.run(["preview", ...NODE_ALL]).out.rows ?? [];
    const all = rows.map(r => `${r.id}:ok`);
    for (
      const answers of [
        all.slice(1).join(","),
        [...all, "r999:ok"].join(","),
        ["r1:keep-existing", ...all.slice(1)].join(","),
      ]
    ) {
      const { status } = h.run([...NODE_ALL, "--answers", answers]);
      expect(status).toBe(2);
    }
    expect(existsSync(join(h.repo, ".config"))).toBe(false);
  });

  it("refuses a row whose content changed since the preview", () => {
    h.apply(NODE_ALL);
    h.write(".config/mise/tasks/code/count", "#!/bin/sh\n");
    h.run(["preview", "all"]);
    h.write(".config/mise/tasks/code/count", "#!/bin/sh\necho x\n");
    const { status, out } = h.run(["all", "--answers", "r1:ok"]);
    expect(status).toBe(2);
    expect(out.error).toContain("changed since the preview");
  });
});

describe("unsafe paths", () => {
  it("refuses a path that is absolute or climbs out of the repo", () => {
    for (const p of ["/etc/x", "../x", "a/../../x", "", "a\\b"]) {
      expect(() => paths.checkRelPath(p)).toThrow(paths.UnsafePathError);
    }
    expect(paths.checkRelPath(".config/x")).toBe(".config/x");
  });

  it("refuses to write through a symlinked folder", () => {
    const outside = join(h.root, "outside");
    mkdirSync(outside);
    symlinkSync(outside, join(h.repo, ".config"));
    const { status, out } = h.run(["preview", ...NODE_ALL]);
    expect(status).toBe(2);
    expect(out.error).toContain("symlink");
    expect(existsSync(join(outside, "stackgen.yaml"))).toBe(false);
  });
});

describe("mise", () => {
  it("stops with the install remedy when mise is not on PATH", () => {
    const { status, out } = h.run(["preview", ...NODE_ALL], {
      PATH: "/usr/bin:/bin",
    });
    expect(status).toBe(2);
    expect(out.error).toContain("mise is not on PATH");
  });

  it("refuses an untrusted mise config, naming the remedy", () => {
    h.apply(NODE_ALL);
    const { status, out } = h.run(["preview", ...NODE_ALL], {
      FAKE_MISE_UNTRUSTED: "1",
    });
    expect(status).toBe(2);
    expect(out.error).toContain("not trusted");
  });

  it("keeps the files written when setup:all fails, and says so", () => {
    const { status, out } = h.apply(NODE_ALL, undefined, {
      FAKE_MISE_SETUP_FAIL: "1",
    });
    expect(status).toBe(2);
    expect(out.error).toContain("setup:all failed");
    expect(out.written).toContain(".config/stackgen.yaml");
    expect(existsSync(join(h.repo, ".config/stackgen.yaml"))).toBe(true);
  });

  it("puts every file back byte for byte when validate-config fails", () => {
    h.apply(NODE_ALL);
    const hook = ".config/pre-commit-config.yaml";
    const before = h.read(hook);
    h.write(
      hook,
      before.replace("# >>> tool-config\n", "# >>> tool-config\n  |x\n"),
    );
    const edited = h.read(hook);
    const { status, out } = h.apply(["all"], undefined, {
      FAKE_MISE_INVALID: "1",
    });
    expect(status).toBe(2);
    expect(out.error).toContain("back as it was");
    expect(h.read(hook)).toBe(edited);
  });

  it("refuses a pack call when the formatter is not installed, before the first byte", () => {
    h.apply(NODE_ALL);
    const dir = join(stacksDir, "toolchain-gate", "swiftlint");
    const { status, out } = h.apply(
      ["pack", "--slug", "swiftlint", "--dir", dir],
      undefined,
      { FAKE_MISE_MISSING: "dprint" },
    );
    expect(status).toBe(2);
    expect(out.error).toContain("dprint is not installed");
    expect(existsSync(join(h.repo, ".config/mise/conf.d/swiftlint"))).toBe(
      false,
    );
  });
});
