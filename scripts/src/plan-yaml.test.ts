/**
 * vwf's YAML subset reader, plan-management/scripts/lib/yaml.mjs: every
 * construct the subset reads, every refusal it throws, and the fake config
 * files under fixtures/plan-queue/yaml/, shaped on the schemas.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  describe,
  expect,
  it,
} from "vitest";
// @ts-expect-error — a plain ESM script with no type declarations
import { parseFrontmatter, parseYaml, YamlError } from "../../plugins/vwf/skills/plan-management/scripts/lib/yaml.mjs";

const FIXTURES = join(import.meta.dirname, "fixtures", "plan-queue", "yaml");

function fixture(name: string): string {
  return readFileSync(join(FIXTURES, name), "utf8");
}

describe("the constructs of the subset", () => {
  const cases: [string, string, unknown][] = [
    ["an empty text", "", null],
    ["a comment-only text", "# nothing\n", null],
    ["a block map", "a: 1\nb: two\n", { a: 1, b: "two" }],
    ["a nested block map", "a:\n  b:\n    c: x\n", { a: { b: { c: "x" } } }],
    ["a block list", "- a\n- b\n", ["a", "b"]],
    ["a list under a key, indented", "k:\n  - a\n  - b\n", { k: ["a", "b"] }],
    ["a list under a key, not indented", "k:\n- a\n- b\nz: 1\n", { k: ["a", "b"], z: 1 }],
    ["a list of maps", "- a: 1\n  b: 2\n- a: 3\n", [{ a: 1, b: 2 }, { a: 3 }]],
    ["a list of lists", "- - a\n  - b\n- c\n", [["a", "b"], "c"]],
    ["an empty list item", "-\n- a\n", [null, "a"]],
    ["a key with no value", "a:\nb: 1\n", { a: null, b: 1 }],
    ["a flow list", "a: [x, y]\n", { a: ["x", "y"] }],
    ["an empty flow list and map", "a: []\nb: {}\n", { a: [], b: {} }],
    ["a flow map", "a: { k: v, n: 2 }\n", { a: { k: "v", n: 2 } }],
    ["nested flow", "a: [ { k: [1, 2] }, [x] ]\n", { a: [{ k: [1, 2] }, ["x"]] }],
    [
      "a flow list across lines with a trailing comma",
      "a: [\n  x, # one\n  y,\n]\nb: 1\n",
      { a: ["x", "y"], b: 1 },
    ],
    ["a comment after a value", "a: 1 # one\n", { a: 1 }],
    ["a # inside a word", "a: x#y\n", { a: "x#y" }],
    ["a comment line inside a map", "a: 1\n# between\nb: 2\n", { a: 1, b: 2 }],
    ["a double-quoted scalar", "a: \"x # y: z\"\n", { a: "x # y: z" }],
    ["double-quoted escapes", "a: \"t\\tn\\n\\u00e9\\\"\"\n", { a: "t\tn\né\"" }],
    ["a single-quoted scalar", "a: 'it''s # here'\n", { a: "it's # here" }],
    ["a quoted key", "\"test:load\": false\n", { "test:load": false }],
    ["a quoted flow item", "a: [\"x, y\", 'z']\n", { a: ["x, y", "z"] }],
    ["an apostrophe in a plain scalar", "a: it's\n", { a: "it's" }],
    ["a colon inside a plain scalar", "url: git@example.com:x/y.git\n", { url: "git@example.com:x/y.git" }],
    ["a key holding a colon", "p:site:check: run\n", { "p:site:check": "run" }],
    ["a multi-line plain scalar", "a: one\n  two\n  three\nb: 1\n", { a: "one two three", b: 1 }],
    ["a blank line in a plain scalar", "a: one\n\n  two\n", { a: "one\ntwo" }],
    ["a multi-line plain list item", "- one\n  two\n- three\n", ["one two", "three"]],
    ["a literal block", "a: |\n  l1\n    l2\nb: 1\n", { a: "l1\n  l2\n", b: 1 }],
    ["a literal block, strip", "a: |-\n  l1\n  l2\n", { a: "l1\nl2" }],
    ["a literal block, keep", "a: |+\n  l1\n\nb: 1\n", { a: "l1\n\n", b: 1 }],
    ["a folded block, strip", "a: >-\n  f1\n  f2\n\n  f3\n", { a: "f1 f2\nf3" }],
    ["a folded block, clip", "a: >\n  f1\n  f2\n", { a: "f1 f2\n" }],
    ["a block holding a # line", "a: |\n  # not a comment\n", { a: "# not a comment\n" }],
    ["a block scalar list item", "- |\n  x\n- y\n", ["x\n", "y"]],
    ["a leading --- fence", "---\na: 1\n", { a: 1 }],
    [
      "plain scalar types",
      "t: true\nf: False\nn: null\nz: ~\ni: -12\nx: 0.5\ne: 1e3\nv: 1.2.3\ns: yes\n",
      { t: true, f: false, n: null, z: null, i: -12, x: 0.5, e: 1000, v: "1.2.3", s: "yes" },
    ],
    ["a top-level scalar", "just text\n", "just text"],
  ];
  it.each(cases)("%s", (_name, text, want) => {
    expect(parseYaml(text)).toEqual(want);
  });
});

describe("the refusals of the subset", () => {
  const cases: [string, string, number, RegExp][] = [
    ["an anchor", "a: &x 1\n", 1, /an anchor/],
    ["an alias", "a: 1\nb: *x\n", 2, /an alias/],
    ["a tag", "a: !!str 1\n", 1, /a tag/],
    ["an anchor on a list item", "- &x a\n", 1, /an anchor/],
    ["an alias in a flow list", "a: [*x]\n", 1, /an alias/],
    ["a merge key alias", "a:\n  <<: *base\n", 2, /an alias/],
    ["a second document", "a: 1\n---\nb: 2\n", 2, /second document/],
    ["a tab used for indentation", "a:\n\tb: 1\n", 2, /tab/],
    ["a duplicate key", "a: 1\na: 2\n", 2, /duplicate key a/],
    ["a list item where a key was expected", "a: 1\n- b\n", 2, /list item/],
    ["unexpected indentation", "a: 1\n    b: 2\n", 2, /indentation/],
    ["a flow list left open", "a: [x, y\n", 1, /left open/],
    ["a quoted scalar left open", "a: \"x\n", 1, /left open/],
    ["a complex key", "? a\n: b\n", 1, /complex key/],
    ["a block scalar indentation indicator", "a: |2\n  x\n", 1, /block scalar header/],
    ["a directive", "%YAML 1.2\na: 1\n", 1, /directive/],
  ];
  it.each(cases)("%s", (_name, text, line, message) => {
    let error: unknown;
    try {
      parseYaml(text);
    } catch (e) {
      error = e;
    }
    expect(error).toBeInstanceOf(YamlError);
    expect((error as { name: string }).name).toBe("YamlError");
    expect((error as { line: number }).line).toBe(line);
    expect((error as Error).message).toMatch(message);
  });
});

describe("frontmatter", () => {
  it("parses the map between the first two --- lines", () => {
    expect(parseFrontmatter("---\nimplementation: complete\n---\n# Body\n"))
      .toEqual({ implementation: "complete" });
  });

  it("is null when the file has none", () => {
    expect(parseFrontmatter("# Body\n\n---\na: 1\n")).toBeNull();
  });

  it("is an empty map between two adjacent fences", () => {
    expect(parseFrontmatter("---\n---\nbody\n")).toEqual({});
  });

  it("refuses an unclosed fence", () => {
    expect(() => parseFrontmatter("---\na: 1\n")).toThrow(YamlError);
  });

  it("numbers a refusal by the file's own line", () => {
    let error: unknown;
    try {
      parseFrontmatter("---\na: 1\nb: &x 2\n---\n");
    } catch (e) {
      error = e;
    }
    expect((error as { line: number }).line).toBe(3);
  });
});

describe("the fake config files", () => {
  it("reads .config/vwf.yaml of a multi-repo product", () => {
    const doc = parseYaml(fixture("vwf.yaml"));
    expect(doc.topology).toBe("multi-repo");
    expect(doc.topology_reason).toBe(
      "the api and the app ship on their own release trains, so each keeps its own repo and its own history",
    );
    expect(doc.members).toEqual([
      {
        name: "example-api",
        path: "../example-api",
        url: "git@example.com:example/api.git",
        projects: ["api", "worker"],
      },
      {
        name: "example-app",
        path: "../example-app",
        url: "https://example.com/example/app.git",
        projects: ["app"],
      },
    ]);
    expect(doc.repo.stack.template).toBe("repo/example-repo");
    expect(doc.projects.api.stack.template).toBe("project/example-service");
    expect(doc.projects.api.stack.backing_template).toEqual(["example-postgres", "example-auth"]);
    expect(doc.projects.api.stack.deploy_template).toEqual([]);
    expect(doc.projects.api.stack.note).toBe(
      "picked for the example team's existing experience with it",
    );
    expect(doc.projects.api.coverage_target).toBe(90);
    expect(doc.projects.app.stack.template).toBe("unresolved");
    expect(doc.projects.app.stack.backing_template).toBe("unresolved");
    expect(doc.harness).toEqual({
      dev: true,
      local_stack: { present: true },
      health: false,
      "test:load": false,
    });
    expect(doc.enforcement.rules["topology/iac-own-repo/infra"]).toEqual({
      waived: true,
      reason: "kept beside the api: one deploy",
    });
    expect(doc.after_landing).toEqual([]);
  });

  it("reads docs/blueprint/registry.yaml", () => {
    const doc = parseYaml(fixture("registry.yaml"));
    expect(doc.vwf_registry).toBe(2);
    expect(doc.projects.map((p: { name: string }) => p.name)).toEqual(["api", "app", "infra"]);
    expect(doc.projects[0].threat_notes).toEqual([
      "an external caller sends a forged token",
      "a webhook replays an old event",
    ]);
    expect(doc.projects[1].platforms).toEqual(["mobile", "tablet"]);
    expect(doc.projects[2].path).toBe(".");
  });

  it("reads .claude/stackgen/lock.yaml", () => {
    const doc = parseYaml(fixture("lock.yaml"));
    expect(doc.entries).toHaveLength(2);
    expect(doc.entries[0].hash).toMatch(/^[0-9a-f]{64}$/);
    expect(doc.entries[1].hash).toMatch(/^sha256:[0-9a-f]{64}$/);
    expect(doc.entries[1].mode).toBe("755");
    expect(doc.bootstrap.plugins["example-plugin@example-market"]).toEqual({
      scope: "user",
      source: "example/market",
      components: ["app-framework/example-framework"],
    });
    expect(doc.required_mcp_servers[0].install).toBe("https://example.com/mcp");
    expect(doc.local_plugin.lsp_servers).toEqual([
      { name: "example-ls", packs: ["language/typescript"] },
    ]);
  });

  it("reads a template's frontmatter", () => {
    const doc = parseFrontmatter(fixture("template.md"));
    expect(doc.name).toBe("example-service");
    expect(doc.platforms).toEqual(["service", "worker"]);
    expect(doc.components).toEqual([
      "app-framework/example-framework@1.2.0",
      "language/typescript@generated",
    ]);
    expect(doc.description).toBe(
      "An invented service template, shaped on the payload frontmatter for the subset reader's tests.",
    );
    expect(doc.conventions).toBe("Keep handlers thin.\nValidate at the boundary.\n");
  });
});
