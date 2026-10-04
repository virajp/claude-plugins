/**
 * The tool-config script's `@@` template engine: substitution, `#if`/`#else`,
 * `#each` over strings and mappings, the standalone-line rule, and every fault
 * it refuses — unknown names, stray `@@`, unbalanced tags, unsafe values.
 */
import {
  describe,
  expect,
  it,
} from "vitest";
// @ts-expect-error TS7016 — no declaration file for a shipped .mjs module
import * as engine from "../../plugins/stackgen/skills/tool-config/scripts/lib/template.mjs";

const { render, TemplateError } = engine;

const source = "templates/demo.tmpl";
const run = (template: string, values: Record<string, unknown> = {}): string =>
  render(template, values, { source });

/** The TemplateError a render throws, so a case can assert its message and line. */
function fault(
  template: string,
  values: Record<string, unknown> = {},
): { message: string; line: number; } {
  try {
    run(template, values);
  }
  catch (error) {
    expect(error).toBeInstanceOf(TemplateError);
    const { message, line, source: label } = error as {
      message: string;
      line: number;
      source: string;
    };
    expect(label).toBe(source);
    return { message, line };
  }
  throw new Error("render did not throw");
}

describe("substitution", () => {
  it.each([
    [
      "a string",
      "name = \"@@REPO_NAME@@\"",
      { REPO_NAME: "demo" },
      "name = \"demo\"",
    ],
    ["a number", "format = @@FORMAT@@", { FORMAT: 1 }, "format = 1"],
    ["a boolean", "node = @@NODE@@", { NODE: false }, "node = false"],
    ["two names on a line", "@@A@@-@@B_2@@", { A: "x", B_2: "y" }, "x-y"],
    ["no tags at all", "plain\ntext\n", {}, "plain\ntext\n"],
  ])("renders %s", (_, template, values, want) => {
    expect(run(template, values)).toBe(want);
  });

  it("refuses an unknown name, naming it and its line", () => {
    const { message, line } = fault("one\ntwo @@MISSING@@\n", {});
    expect(line).toBe(2);
    expect(message).toBe(`${source}:2: unknown name MISSING`);
  });

  it.each([
    ["a typo'd closing delimiter", "x = @@REPO_NAME@\n", 1],
    ["a lower-case name", "a\nb = @@repo@@\n", 2],
    ["a lone delimiter", "a\nb\nc @@ d\n", 3],
  ])("refuses a stray @@ from %s", (_, template, wantLine) => {
    const { message, line } = fault(template, { REPO_NAME: "demo" });
    expect(message).toMatch(/stray @@/);
    expect(line).toBe(wantLine);
  });

  it.each([
    ["before a name", "x @@@A@@ y", "x @v y"],
    ["after a name", "x @@A@@@ y", "x v@ y"],
    ["between adjacent tags", "@@A@@@@@A@@", "v@v"],
    ["before a block tag", "@@@#if T@@x@@/if@@", "@x"],
    ["in a pkg@version", "\"npm:prettier@@@V@@\"", "\"npm:prettier@3.0\""],
    ["in a pnpx pin", "pnpx foo@@@VER@@", "pnpx foo@1.2.3"],
    ["in a user@host", "@@USER@@@@@HOST@@", "u@h"],
  ])("renders a literal @ %s as text", (_, template, want) => {
    expect(
      run(template, {
        A: "v",
        T: true,
        V: "3.0",
        VER: "1.2.3",
        USER: "u",
        HOST: "h",
      }),
    )
      .toBe(want);
  });

  it("refuses a quadrupled delimiter, which leaves @@ in the text", () => {
    const { message, line } = fault("a\nb\n@@@@A@@\n", { A: "v" });
    expect(message).toBe(`${source}:3: a stray @@ is left in the template`);
    expect(line).toBe(3);
  });

  it.each([
    ["two values", "@@A@@@@B@@", { A: "x@", B: "@y" }, 1],
    ["two #each items", "\n@@#each L@@@@.@@@@/each@@", { L: ["a@", "@b"] }, 2],
    ["a literal @ and a value", "a\npkg@@@A@@\n", { A: "@scope" }, 2],
    ["a value and a literal @", "@@A@@@x\n", { A: "x@" }, 1],
    ["text across an #if", "\na@@@#if T@@@b@@/if@@", { T: true }, 2],
  ])(
    "refuses %s joining into @@, naming the line",
    (_, template, values, want) => {
      const { message, line } = fault(template, values);
      expect(message).toBe(
        `${source}:${want}: an @ meets an @ here, spelling @@ in the output`,
      );
      expect(line).toBe(want);
    },
  );

  it("keeps two adjacent tags apart", () => {
    expect(run("@@A@@@@A@@", { A: "v" })).toBe("vv");
  });

  it.each([
    ["an untaken #if branch", "a\n@@#if F@@\nx = @@REPO_NAME@\n@@/if@@\n", 3],
    [
      "an untaken #else branch",
      "@@#if T@@\nok\n@@#else@@\n@@ lone\n@@/if@@\n",
      4,
    ],
    ["a zero-item #each", "@@#each L@@\n\n@@.na-me@@x\n@@/each@@\n", 3],
    ["a lower-case name in an untaken branch", "@@#if F@@ @@bad@@ @@/if@@", 1],
  ])(
    "refuses a stray @@ in %s, naming the template line",
    (_, template, want) => {
      const { message, line } = fault(template, { T: true, F: false, L: [] });
      expect(message).toBe(
        `${source}:${want}: a stray @@ is left in the template`,
      );
      expect(line).toBe(want);
    },
  );

  it("leaves an unknown name in an untaken branch unchecked", () => {
    expect(run("a@@#if F@@@@NOPE@@@@/if@@b", { F: false })).toBe("ab");
  });

  it.each([
    ["a name", "x\ny = @@A@@\n", { A: "a@@b" }, 2, "the value of A holds @@"],
    [
      "an #each item",
      "@@#each L@@@@.@@@@/each@@",
      { L: ["@@"] },
      1,
      "the value of . holds @@",
    ],
    [
      "an #each field",
      "@@#each L@@@@.name@@@@/each@@",
      { L: [{ name: "a@@" }] },
      1,
      "the value of .name holds @@",
    ],
  ])(
    "refuses a value holding @@ from %s, naming the value",
    (_, template, values, want, text) => {
      const { message, line } = fault(template, values);
      expect(message).toBe(`${source}:${want}: ${text}`);
      expect(line).toBe(want);
    },
  );

  it("allows a single @ in a value", () => {
    expect(run("@@A@@", { A: "user@example.com" })).toBe("user@example.com");
  });
});

describe("#if", () => {
  it.each([
    ["true", true, "yes"],
    ["false", false, "no"],
    ["a non-empty string", "x", "yes"],
    ["an empty string", "", "no"],
    ["a non-empty list", ["a"], "yes"],
    ["an empty list", [], "no"],
    ["zero", 0, "no"],
    ["a non-zero number", 1, "no"],
  ])("on %s", (_, value, want) => {
    expect(run("@@#if FLAG@@yes@@#else@@no@@/if@@", { FLAG: value })).toBe(
      want,
    );
  });

  it("renders nothing for a false #if with no #else", () => {
    expect(run("a@@#if FLAG@@b@@/if@@c", { FLAG: false })).toBe("ac");
  });

  it("treats a missing name as false, so an absent value can be guarded", () => {
    const template = "@@#if REPO_URL@@\nurl = \"@@REPO_URL@@\"\n@@/if@@\nend\n";
    expect(run(template, {})).toBe("end\n");
    expect(run(template, { REPO_URL: "https://github.com/o/r" })).toBe(
      "url = \"https://github.com/o/r\"\nend\n",
    );
  });
});

describe("#each", () => {
  it("loops a list of strings with @@.@@", () => {
    expect(
      run("@@#each SCOPES@@- @@.@@\n@@/each@@", { SCOPES: ["api", "web"] }),
    )
      .toBe("- api\n- web\n");
  });

  it("loops a list of mappings with @@.key@@", () => {
    const members = [{ name: "api", path: "../api" }, {
      name: "web",
      path: "../web",
    }];
    expect(
      run("@@#each MEMBERS@@@@.name@@=@@.path@@;@@/each@@", {
        MEMBERS: members,
      }),
    )
      .toBe(
        "api=../api;web=../web;",
      );
  });

  it("renders nothing over an empty list", () => {
    expect(run("a\n@@#each L@@\nx\n@@/each@@\nb\n", { L: [] })).toBe("a\nb\n");
  });

  it("nests #each inside #if", () => {
    const template =
      "@@#if L@@\n[list]\n@@#each L@@\n@@.name@@\n@@/each@@\n@@/if@@\n";
    expect(run(template, { L: [{ name: "a" }, { name: "b" }] })).toBe(
      "[list]\na\nb\n",
    );
    expect(run(template, { L: [] })).toBe("");
  });

  it("nests #if inside #each, reading .key", () => {
    const template =
      "@@#each L@@\n@@.name@@@@#if .local@@ (local)@@/if@@\n@@/each@@";
    const L = [{ name: "a", local: true }, { name: "b", local: false }, {
      name: "c",
    }];
    expect(run(template, { L })).toBe("a (local)\nb\nc\n");
  });

  it("reads a global name inside an #each", () => {
    expect(run("@@#each L@@@@P@@/@@.@@ @@/each@@", { L: ["a", "b"], P: "x" }))
      .toBe("x/a x/b ");
  });

  it("reads the innermost item in nested #each", () => {
    const template = "@@#each A@@@@#each B@@@@.@@@@/each@@;@@/each@@";
    expect(run(template, { A: [1, 2], B: ["x", "y"] })).toBe("xy;xy;");
  });

  it.each([
    [
      "@@.key@@ outside any #each",
      "a\n@@.key@@\n",
      {},
      2,
      /outside any @@#each@@/,
    ],
    ["@@.@@ outside any #each", "@@.@@", {}, 1, /outside any @@#each@@/],
    [
      "a missing field",
      "@@#each L@@\n@@.nope@@\n@@/each@@\n",
      { L: [{ name: "a" }] },
      2,
      /no field nope/,
    ],
    [
      "a field of a string item",
      "@@#each L@@@@.name@@@@/each@@",
      { L: ["a"] },
      1,
      /not a mapping/,
    ],
    [
      "#each over a scalar",
      "\n@@#each S@@x@@/each@@",
      { S: "a" },
      2,
      /not a list/,
    ],
    [
      "#each over an unknown name",
      "@@#each NOPE@@x@@/each@@",
      {},
      1,
      /unknown name NOPE/,
    ],
    [
      "@@.@@ of a mapping item",
      "@@#each L@@@@.@@@@/each@@",
      { L: [{ a: "b" }] },
      1,
      /a mapping, not a scalar/,
    ],
  ])("refuses %s", (_, template, values, wantLine, want) => {
    const { message, line } = fault(template, values);
    expect(message).toMatch(want);
    expect(line).toBe(wantLine);
  });
});

describe("the standalone-line rule", () => {
  it.each([
    [
      "an indented tag line is removed whole",
      "a\n    @@#if T@@\n  b\n    @@/if@@\nc\n",
      "a\n  b\nc\n",
    ],
    ["a tag at file start", "@@#if T@@\nb\n@@/if@@\n", "b\n"],
    ["a tag at file end with no newline", "b\n@@#if T@@\nc\n@@/if@@", "b\nc\n"],
    ["a tag line with trailing blanks", "@@#if T@@  \nb\n\t@@/if@@\t\n", "b\n"],
    ["an #else line", "@@#if F@@\nx\n@@#else@@\ny\n@@/if@@\n", "y\n"],
    ["#each lines", "@@#each L@@\n  - @@.@@\n@@/each@@\n", "  - a\n  - b\n"],
    ["a CRLF tag line", "@@#if T@@\r\nb\r\n@@/if@@\r\n", "b\r\n"],
    ["an inline tag keeps its line", "x = 1@@#if F@@, y@@/if@@\n", "x = 1\n"],
    [
      "an inline tag beside text keeps its line",
      "  @@#if T@@ on\n@@/if@@\n",
      "   on\n",
    ],
  ])("%s", (_, template, want) => {
    expect(run(template, { T: true, F: false, L: ["a", "b"] })).toBe(want);
  });

  it("keeps a line holding two block tags", () => {
    expect(run("@@#if T@@@@/if@@\nb\n", { T: true })).toBe("\nb\n");
  });
});

describe("unbalanced and mismatched tags", () => {
  it.each([
    ["an unclosed #if", "a\n@@#if T@@\nb\n", 2, /@@#if T@@ is never closed/],
    ["an unclosed #each", "@@#each L@@\nb\n", 1, /@@#each L@@ is never closed/],
    ["a /if closing nothing", "a\nb\n@@/if@@\n", 3, /@@\/if@@ closes nothing/],
    [
      "a /each closing an #if",
      "@@#if T@@\nx\n@@/each@@\n",
      3,
      /closes the @@#if T@@ opened on line 1/,
    ],
    [
      "a /if closing an #each",
      "\n@@#each L@@\n@@/if@@\n",
      3,
      /closes the @@#each L@@ opened on line 2/,
    ],
    ["an #else outside #if", "@@#else@@\n", 1, /outside any @@#if@@/],
    [
      "an #else in an #each",
      "@@#each L@@\n@@#else@@\n@@/each@@\n",
      2,
      /opened on line 1/,
    ],
    [
      "a second #else",
      "@@#if T@@\n@@#else@@\n@@#else@@\n@@/if@@\n",
      3,
      /opened on line 1/,
    ],
  ])("refuses %s, naming the line", (_, template, wantLine, want) => {
    const { message, line } = fault(template, { T: true, L: [] });
    expect(message).toMatch(want);
    expect(line).toBe(wantLine);
  });
});

describe("unsafe values", () => {
  it.each([
    ["a line feed", "a\nb"],
    ["a carriage return", "a\rb"],
    ["a NUL", "a\u0000b"],
    ["a line separator", "a\u2028b"],
    ["a paragraph separator", "a\u2029b"],
  ])("refuses a value holding %s", (_, value) => {
    const { message, line } = fault("x\ny = \"@@V@@\"\n", { V: value });
    expect(message).toMatch(
      /line break, a control character or a line\/paragraph separator/,
    );
    expect(line).toBe(2);
  });

  it("refuses an unsafe #each item", () => {
    expect(fault("@@#each L@@@@.@@@@/each@@", { L: ["a\nb"] }).message).toMatch(
      /line break/,
    );
  });

  it.each([
    ["a list", ["a"], /is a list, not a scalar/],
    ["a mapping", { a: "b" }, /is a mapping, not a scalar/],
  ])("refuses %s substituted as a scalar", (_, value, want) => {
    expect(fault("@@V@@", { V: value }).message).toMatch(want);
  });
});

describe("realistic templates", () => {
  it("renders a mise [env] block with member aliases byte-exact", () => {
    const template = [
      "[env]",
      "REPO_NAME = \"@@REPO_NAME@@\"",
      "MERGE_MODEL_DEVELOP = \"@@MERGE_MODEL_DEVELOP@@\"",
      "@@#if REPO_URL@@",
      "REPO_URL = \"@@REPO_URL@@\"",
      "@@/if@@",
      "",
      "[shell_alias]",
      "@@#each MEMBERS@@",
      "@@.name@@ = \"cd {{ config_root }}/@@.path@@\"",
      "@@/each@@",
      "",
    ]
      .join("\n");
    const values = {
      REPO_NAME: "workspace",
      MERGE_MODEL_DEVELOP: "direct",
      REPO_URL: "https://github.com/octane/workspace",
      MEMBERS: [{ name: "api", path: "../api" }, {
        name: "app",
        path: "../app",
      }],
    };
    expect(run(template, values)).toBe(
      [
        "[env]",
        "REPO_NAME = \"workspace\"",
        "MERGE_MODEL_DEVELOP = \"direct\"",
        "REPO_URL = \"https://github.com/octane/workspace\"",
        "",
        "[shell_alias]",
        "api = \"cd {{ config_root }}/../api\"",
        "app = \"cd {{ config_root }}/../app\"",
        "",
      ]
        .join("\n"),
    );
  });

  it("passes mise's Tera and bash's ${} through untouched", () => {
    const template = [
      "dir = \"{{exec(command='git rev-parse --show-toplevel')}}\"",
      "{% if env.CI %}ci = true{% endif %}",
      "path = \"{{ config_root }}/bin\"",
      "run = \"echo ${HOME} $USER @@NAME@@\"",
      "",
    ]
      .join("\n");
    expect(run(template, { NAME: "x" })).toBe(
      template.replace("@@NAME@@", "x"),
    );
  });
});
