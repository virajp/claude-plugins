/**
 * The tool-config script's `pack` and `pack-remove`, run for real against a
 * temp repo with a fake `mise` on PATH: the swiftui pack's templates rendered
 * from `--set` values kept in `.config/stackgen.yaml`, the `…:all` tasks and
 * the mise skill's task table re-rendered as a pack's subtasks arrive and
 * leave, and the pack's files and values removed again.
 */
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
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
import {
  type Harness,
  harness,
  NODE_ALL,
  stacksDir,
} from "./fixtures/tool-config/harness.ts";

const SWIFTUI = join(stacksDir, "app-framework", "swiftui");
const SWIFT_FORMAT = join(stacksDir, "toolchain-gate", "swift-format");
const TASKS = ".config/mise/tasks";

const SWIFTUI_SETS = [
  "--set",
  "xcode_version=16.2",
  "--set",
  "simulator_platform=iOS Simulator",
  "--set",
  "simulator_device=iPhone 16",
  "--set",
  "simulator_os=18.2",
];

let h: Harness;
beforeEach(() => {
  h = harness("pack");
  h.apply(NODE_ALL);
});
afterEach(() => {
  h.cleanup();
});

/** Copy a pack's payload task files into the repo, as the materializer does. */
function materialize(packDir: string, ...tasks: string[]) {
  for (const task of tasks) {
    const to = join(h.repo, TASKS, task);
    mkdirSync(join(to, ".."), { recursive: true });
    copyFileSync(join(packDir, "config", TASKS, task), to);
  }
}

describe("pack", () => {
  it("renders the pack's templates from its --set values, kept in stackgen.yaml", () => {
    const { status, out } = h.apply([
      "pack",
      "--slug",
      "swiftui",
      "--dir",
      SWIFTUI,
      ...SWIFTUI_SETS,
    ]);
    expect(out.error).toBeUndefined();
    expect(status).toBe(0);
    const conf = h.read(".config/mise/conf.d/swiftui/mise.toml");
    expect(conf).toContain("XCODE_VERSION      = \"16.2\"");
    expect(conf).toContain("SIMULATOR_DEVICE   = \"iPhone 16\"");
    expect(conf).not.toContain("@@");
    const yaml = h.read(".config/stackgen.yaml");
    expect(yaml).toContain("packs:\n  swiftui:\n");
    expect(yaml).toContain("    xcode_version: \"16.2\"");
    expect(yaml).toContain("repo_name: \"widget\"");
    // a second call needs no --set: the values are the file's
    expect(
      h
        .run(["preview", "pack", "--slug", "swiftui", "--dir", SWIFTUI])
        .out
        .rows,
    )
      .toEqual([]);
  });

  it("refuses a render missing a pack value, naming it and the remedy", () => {
    const { status, out } = h.run([
      "preview",
      "pack",
      "--slug",
      "swiftui",
      "--dir",
      SWIFTUI,
      "--set",
      "xcode_version=16.2",
    ]);
    expect(status).toBe(2);
    expect(out.error).toMatch(/unknown name SIMULATOR_\w+/);
    expect(out.error).toContain("--set");
  });

  it("re-renders the …:all tasks and the task table with the pack's subtasks, and none of another pack's", () => {
    materialize(
      SWIFT_FORMAT,
      "code/format/swift-format",
      "code/lint/swift-format",
    );
    const { out } = h.run([
      "preview",
      "pack",
      "--slug",
      "swift-format",
      "--dir",
      SWIFT_FORMAT,
    ]);
    expect(out.rows?.map(r => r.path)).toEqual([
      `${TASKS}/code/format/all`,
      `${TASKS}/code/lint/all`,
      ".claude/skills/mise/SKILL.md",
    ]);
    h.apply(["pack", "--slug", "swift-format", "--dir", SWIFT_FORMAT]);
    const lint = h.read(`${TASKS}/code/lint/all`);
    expect(lint).toContain("mise run code:lint:swift-format ");
    expect(lint).not.toContain("swiftlint");
    expect(h.read(`${TASKS}/code/format/all`)).toContain(
      "mise run code:format:swift-format ",
    );
    expect(h.read(".claude/skills/mise/SKILL.md")).toContain(
      "| `code:lint:swift-format` |",
    );
    // the order is the sorted leaf names
    expect(lint.indexOf("code:lint:house")).toBeLessThan(
      lint.indexOf("code:lint:swift-format"),
    );
  });

  it("refuses a pack whose templates/ would write the values file", () => {
    const dir = mkdtempSync(join(tmpdir(), "tool-config-bad-pack-"));
    mkdirSync(join(dir, "templates", ".config"), { recursive: true });
    writeFileSync(join(dir, "templates", ".config", "stackgen.yaml"), "x\n");
    const { status, out } = h.run([
      "preview",
      "pack",
      "--slug",
      "bad",
      "--dir",
      dir,
    ]);
    expect(status).toBe(2);
    expect(out.error).toContain("the script's alone");
  });

  it("refuses a pack value that clashes with a global name", () => {
    const { status, out } = h.run([
      "preview",
      "pack",
      "--slug",
      "swiftui",
      "--dir",
      SWIFTUI,
      "--set",
      "repo_name=x",
    ]);
    expect(status).toBe(2);
    expect(out.error).toContain("already a global name");
  });
});

describe("pack-remove", () => {
  it("deletes the pack's conf.d folder and subtasks, drops its values and re-renders the …:all tasks", () => {
    h.apply(["pack", "--slug", "swiftui", "--dir", SWIFTUI, ...SWIFTUI_SETS]);
    materialize(
      SWIFT_FORMAT,
      "code/format/swift-format",
      "code/lint/swift-format",
    );
    h.apply(["pack", "--slug", "swift-format", "--dir", SWIFT_FORMAT]);

    const { out } = h.run(["preview", "pack-remove", "--slug", "swift-format"]);
    expect(out.rows?.filter(r => r.kind === "delete").map(r => r.path))
      .toEqual([
        `${TASKS}/code/format/swift-format`,
        `${TASKS}/code/lint/swift-format`,
      ]);
    h.apply(["pack-remove", "--slug", "swift-format"]);
    expect(existsSync(join(h.repo, TASKS, "code/lint/swift-format"))).toBe(
      false,
    );
    expect(h.read(`${TASKS}/code/lint/all`)).not.toContain("swift-format");
    expect(h.read(".claude/skills/mise/SKILL.md")).not.toContain(
      "swift-format",
    );

    h.apply(["pack-remove", "--slug", "swiftui"]);
    expect(existsSync(join(h.repo, ".config/mise/conf.d/swiftui"))).toBe(false);
    expect(h.read(".config/stackgen.yaml")).not.toContain("packs:");
    expect(h.read(".config/stackgen.yaml")).toContain("repo_name: \"widget\"");
  });

  it("is a no-op for a pack the repo does not carry", () => {
    expect(h.run(["preview", "pack-remove", "--slug", "nothing"]).out.rows)
      .toEqual([]);
  });
});

describe("review round 1", () => {
  it.each(["all", "ai", "_base"])("refuses the reserved slug %s", slug => {
    for (
      const args of [
        ["pack", "--slug", slug, "--dir", SWIFTUI],
        ["pack-remove", "--slug", slug],
      ]
    ) {
      const { status, out } = h.run(["preview", ...args]);
      expect(status).toBe(2);
      expect(out.error).toContain("reserved");
    }
  });

  it("never deletes a path tool-config ships, whatever the slug", () => {
    h.write(".config/mise/conf.d/workflows/mise.toml", "[env]\nX = \"1\"\n");
    const { out } = h.run(["preview", "pack-remove", "--slug", "workflows"]);
    expect(out.rows?.map(r => r.path)).toEqual([
      ".config/mise/conf.d/workflows/mise.toml",
    ]);
    h.apply(["pack-remove", "--slug", "workflows"]);
    expect(existsSync(join(h.repo, TASKS, "code/lint/workflows"))).toBe(true);
  });

  it("refuses a pack template that renders into .git/", () => {
    const dir = mkdtempSync(join(tmpdir(), "tool-config-git-pack-"));
    mkdirSync(join(dir, "templates", ".git", "hooks"), { recursive: true });
    writeFileSync(join(dir, "templates", ".git", "hooks", "pre-commit"), "x\n");
    const { status, out } = h.run([
      "preview",
      "pack",
      "--slug",
      "sneaky",
      "--dir",
      dir,
    ]);
    expect(status).toBe(2);
    expect(out.error).toContain("nothing renders into .git/");
    expect(existsSync(join(h.repo, ".git", "hooks", "pre-commit"))).toBe(false);
  });

  it("refuses an answer set that deletes a subtask and keeps an …:all still running it", () => {
    materialize(
      SWIFT_FORMAT,
      "code/format/swift-format",
      "code/lint/swift-format",
    );
    h.apply(["pack", "--slug", "swift-format", "--dir", SWIFT_FORMAT]);
    const { status, out } = h.apply(
      ["pack-remove", "--slug", "swift-format"],
      r => (r.kind === "delete" ? "ok" : r.answers.at(-1) ?? "ok"),
    );
    expect(status).toBe(2);
    expect(out.error).toContain("still runs code:");
    expect(existsSync(join(h.repo, TASKS, "code/lint/swift-format"))).toBe(
      true,
    );
  });
});

describe("review round 2", () => {
  it("refuses a template that renders into .git/ under any case", () => {
    const dir = mkdtempSync(join(tmpdir(), "tool-config-git-case-"));
    mkdirSync(join(dir, "templates", ".GIT", "hooks"), { recursive: true });
    writeFileSync(join(dir, "templates", ".GIT", "hooks", "pre-commit"), "x\n");
    const { status, out } = h.run([
      "preview",
      "pack",
      "--slug",
      "sneaky",
      "--dir",
      dir,
    ]);
    expect(status).toBe(2);
    expect(out.error).toContain("nothing renders into .git/");
  });
});
