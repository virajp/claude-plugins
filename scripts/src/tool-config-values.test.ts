/**
 * The tool-config script's `.config/stackgen.yaml` reader and values loader:
 * the constrained YAML grammar and every construct it refuses, the file's
 * shape, the key → name mapping, a pack's own values, and REPO_URL and
 * PROJECT_NAME derived from `origin` in a temp git repo.
 */
import { execFileSync } from "node:child_process";
import {
  mkdirSync,
  mkdtempSync,
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
// @ts-expect-error TS7016 — no declaration file for a shipped .mjs module
import * as values from "../../plugins/stackgen/skills/tool-config/scripts/lib/values.mjs";
// @ts-expect-error TS7016 — no declaration file for a shipped .mjs module
import * as yaml from "../../plugins/stackgen/skills/tool-config/scripts/lib/yaml.mjs";

const parse = (text: string) => yaml.parseYaml(text, { source: "t.yaml" });

/** The YamlError `text` throws, for asserting its message and line. */
function refusal(
  text: string,
): { message: string; line: number; source: string; } {
  try {
    parse(text);
  }
  catch (e) {
    expect(e).toBeInstanceOf(yaml.YamlError);
    return e as { message: string; line: number; source: string; };
  }
  throw new Error("expected a YamlError");
}

describe("parseYaml", () => {
  it("reads every construct the grammar allows", () => {
    const text = [
      "# a comment",
      "",
      "format: 1",
      "repo_name: plain value # trailing comment",
      "single: 'it''s # not a comment'",
      "double: \"say \\\"hi\\\" \\\\ there\"",
      "yes: true",
      "no: false",
      "neg: -3",
      "flow: [a, 'b c', \"d\", 2, true]",
      "empty: []",
      "nested:",
      "  develop: direct",
      "  deeper:",
      "    key: v",
      "list:",
      "  - one",
      "  - 'two'",
      "  # a comment inside",
      "  - 3",
      "after: x",
    ]
      .join("\n");
    expect(parse(text)).toEqual({
      format: 1,
      repo_name: "plain value",
      single: "it's # not a comment",
      double: "say \"hi\" \\ there",
      yes: true,
      no: false,
      neg: -3,
      flow: ["a", "b c", "d", 2, true],
      empty: [],
      nested: { develop: "direct", deeper: { key: "v" } },
      list: ["one", "two", 3],
      after: "x",
    });
  });

  it("reads an empty document as an empty mapping, and CRLF line ends", () => {
    expect(parse("# only a comment\n\n")).toEqual({});
    expect(parse("a: 1\r\nb: x\r\n")).toEqual({ a: 1, b: "x" });
  });

  it("counts a quote only where a scalar starts", () => {
    expect(parse("repo_name: o'neil # c\nb: a\"b # c\nc: [o'neil, x] # c"))
      .toEqual({
        repo_name: "o'neil",
        b: "a\"b",
        c: ["o'neil", "x"],
      });
  });

  it("keeps an ambiguous word a string only when quoted", () => {
    expect(parse("a: 'yes'\nb: \"False\"\nc: '~'")).toEqual({
      a: "yes",
      b: "False",
      c: "~",
    });
  });

  it("opens a quote only at the value's or a flow element's first character", () => {
    expect(parse("a: b - \"c # d\"\nl:\n  - x 'y # z'\nf: [ 'a, b' , \"c]\"]"))
      .toEqual({ a: "b - \"c", l: ["x 'y"], f: ["a, b", "c]"] });
  });

  it("reads 0, a negative integer, and a quoted leading zero", () => {
    expect(parse("a: 0\nb: -12\nc: '0012'")).toEqual({
      a: 0,
      b: -12,
      c: "0012",
    });
  });

  it("keeps a float or a quoted number a string", () => {
    expect(parse("a: 1.5\nb: '1'")).toEqual({ a: "1.5", b: "1" });
  });

  it.each([
    ["an anchor", "a: 1\nb: &x 2", 2, /anchor/],
    ["an alias", "a: 1\nb: *x", 2, /alias/],
    ["a tag", "a: !!str 1", 1, /tag/],
    ["a | block scalar", "a: 1\nb: |\n  text", 2, /block scalar/],
    ["a > folded scalar", "a: >\n  text", 1, /folded scalar/],
    ["a flow mapping", "a: 1\n\nb: {c: 1}", 3, /flow mapping/],
    ["a nested flow collection", "a: [b, [c]]", 1, /nested flow/],
    ["a list of mappings", "a:\n  - name: x", 2, /list of mappings/],
    ["a nested block in a list", "a:\n  -\n    - x", 2, /nested block/],
    ["a flow list in a block list", "a:\n  - [x]", 2, /list inside a list/],
    ["a tab indent", "a:\n\tb: 1", 2, /tab/],
    ["a duplicate key", "a: 1\nb: 2\na: 3", 3, /duplicate key a/],
    ["a duplicate nested key", "m:\n  k: 1\n  k: 2", 3, /duplicate key k/],
    ["a multi-line plain scalar", "a: one\n  two", 2, /multi-line/],
    ["an unterminated double quote", "a: \"one", 1, /multi-line/],
    ["an unterminated flow list", "a: [one,\n  two]", 1, /multi-line/],
    ["a \\n escape", "a: \"x\\ny\"", 1, /escape \\n/],
    ["a key with no value", "a:\nb: 1", 1, /a has no value/],
    ["a 4-space indent", "a:\n    b: 1", 2, /indent by 2/],
    ["a stray dedent", "a:\n  b: 1\n c: 2", 3, /unexpected indentation/],
    ["an unquoted colon in a value", "a: b: c", 1, /quote the value/],
    ["a document marker", "---\na: 1", 1, /document marker/],
    ["a line that is no key", "a: 1\njust text", 2, /not a key: value/],
    [
      "a __proto__ key",
      "a: 1\n__proto__: x",
      2,
      /the key __proto__ is refused/,
    ],
    [
      "a nested __proto__ key",
      "m:\n  __proto__:\n    polluted: true",
      2,
      /__proto__ is refused/,
    ],
    ["a constructor key", "constructor: x", 1, /constructor is refused/],
    ["a prototype key", "prototype: x", 1, /prototype is refused/],
    ["a nested block list", "a:\n  - - x", 2, /nested list/],
    [
      "a list at its key's indent",
      "members:\n- a",
      2,
      /indent the list under members by 2 spaces/,
    ],
    ...["False", "FALSE", "True", "yes", "no", "on", "off", "null", "Null", "~"]
      .map(
        w =>
          [`a plain ${w}`, `a: 1\nb: ${w}`, 2, /ambiguous/] as [
            string,
            string,
            number,
            RegExp,
          ],
      ),
    ["an ambiguous word in a flow list", "a: [x, off]", 1, /off is ambiguous/],
    [
      "a leading-zero integer",
      "a: 1\nb: 0012",
      2,
      /0012 is not an exact integer/,
    ],
    ["a negative zero", "a: -0", 1, /-0 is not an exact integer/],
    ["an unsafe integer", "a: 12345678901234567890", 1, /not an exact integer/],
    [
      "a block list on the key's line",
      "a: 1\nb: - x",
      2,
      /block list starts on the next line/,
    ],
    ["a bare dash value", "a: -", 1, /block list starts on the next line/],
    ["a stray ] in a flow list", "a: [x]y, z]", 1, /unquoted \]/],
    ["a stray [ in a flow list", "a: [x, y[z]", 1, /nested flow/],
  ])("refuses %s, naming the line", (_what, text, line, message) => {
    const e = refusal(text);
    expect(e.line).toBe(line);
    expect(e.source).toBe("t.yaml");
    expect(e.message).toMatch(message);
    expect(e.message.startsWith(`t.yaml:${line}: `)).toBe(true);
  });
});

/** A temp directory under os.tmpdir(), its own git repo when `git` is set. */
let root: string;
beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), "tool-config-values-"));
});
afterEach(() => {
  rmSync(root, { recursive: true, force: true });
});

function writeStackgen(text: string) {
  mkdirSync(join(root, ".config"), { recursive: true });
  writeFileSync(join(root, ".config", "stackgen.yaml"), text);
}

function gitRepo(origin?: string) {
  execFileSync("git", ["init", "-q", root], { stdio: "ignore" });
  if (origin !== undefined) {
    execFileSync("git", ["-C", root, "remote", "add", "origin", origin], {
      stdio: "ignore",
    });
  }
}

const FULL = [
  "format: 1",
  "repo_name: claude-plugins",
  "merge_model:",
  "  develop: direct",
  "  main: pr",
  "members: [api, web]",
  "scopes:",
  "  - ops",
  "  - docs",
  "node: true",
  "external: false",
  "forge: github",
  "secrets: fnox",
  "packs:",
  "  swiftui:",
  "    xcode_version: '26.0'",
  "    simulators: [iPhone 17]",
  "  clashing:",
  "    repo_name: other",
]
  .join("\n");

describe("readStackgen", () => {
  it("is null when the file is absent", () => {
    expect(values.readStackgen(root)).toBeNull();
  });

  it("reads a valid file", () => {
    writeStackgen(FULL);
    const doc = values.readStackgen(root);
    expect(doc.merge_model).toEqual({ develop: "direct", main: "pr" });
    expect(doc.packs.swiftui.xcode_version).toBe("26.0");
  });

  it.each([
    [
      "an unknown top-level key",
      "format: 1\nupdate_bot: renovate",
      /update_bot is not a known key/,
    ],
    ["a missing format", "repo_name: x", /format must be 1, got null/],
    ["a format other than 1", "format: 2", /format must be 1, got 2/],
    ["a string format", "format: '1'", /format must be 1, got "1"/],
    [
      "a non-string repo_name",
      "format: 1\nrepo_name: 12",
      /repo_name must be a string/,
    ],
    [
      "a non-list members",
      "format: 1\nmembers: api",
      /members must be a list of strings/,
    ],
    [
      "a non-string scope",
      "format: 1\nscopes: [ops, 3]",
      /scopes must be a list of strings/,
    ],
    [
      "a non-boolean node",
      "format: 1\nnode: 'yes'",
      /node must be true or false/,
    ],
    [
      "a non-boolean external",
      "format: 1\nexternal: 1",
      /external must be true or false/,
    ],
    [
      "a non-string forge",
      "format: 1\nforge: [github]",
      /forge must be a string/,
    ],
    [
      "a scalar merge_model",
      "format: 1\nmerge_model: pr",
      /merge_model must be a mapping/,
    ],
    [
      "an unknown merge_model branch",
      "format: 1\nmerge_model:\n  release: pr",
      /merge_model.release is not a known key/,
    ],
    [
      "a bad merge model",
      "format: 1\nmerge_model:\n  develop: squash",
      /merge_model.develop must be "direct" or "pr", got "squash"/,
    ],
    [
      "a scalar pack",
      "format: 1\npacks:\n  swiftui: x",
      /packs.swiftui must be a mapping/,
    ],
    [
      "a pack key that names nothing",
      "format: 1\npacks:\n  swiftui:\n    xcode-version: x",
      /packs.swiftui.xcode-version does not name a value/,
    ],
    [
      "a pack value that is a mapping",
      "format: 1\npacks:\n  swiftui:\n    a:\n      b: c",
      /packs.swiftui.a must be a scalar/,
    ],
  ])("refuses %s, naming the key", (_what, text, message) => {
    writeStackgen(text);
    expect(() => values.readStackgen(root)).toThrow(values.ValuesError);
    expect(() => values.readStackgen(root)).toThrow(message);
  });

  it("names the file and line on a grammar refusal", () => {
    writeStackgen("format: 1\nrepo_name: &a x");
    expect(() => values.readStackgen(root)).toThrow(
      /^\.config\/stackgen\.yaml:2: an anchor/,
    );
  });
});

describe("toNames", () => {
  it("upper-cases keys and joins nested keys with _", () => {
    expect(values.toNames({
      repo_name: "x",
      merge_model: { develop: "direct", main: "pr" },
      a: { b: { c: 1 } },
      members: ["api"],
    }))
      .toEqual({
        REPO_NAME: "x",
        MERGE_MODEL_DEVELOP: "direct",
        MERGE_MODEL_MAIN: "pr",
        A_B_C: 1,
        MEMBERS: ["api"],
      });
  });
});

describe("deriveOrigin", () => {
  it.each([
    ["scp", "git@github.com:virajp/claude-plugins.git"],
    ["scp without .git", "git@github.com:virajp/claude-plugins"],
    ["ssh", "ssh://git@github.com/virajp/claude-plugins.git"],
    ["ssh with a port", "ssh://git@GitHub.com:2222/virajp/claude-plugins.git"],
    ["https", "https://github.com/virajp/claude-plugins.git"],
    [
      "https with userinfo and a trailing slash",
      "https://user:token@github.com/virajp/claude-plugins/",
    ],
  ])("derives REPO_URL and PROJECT_NAME from a %s remote", (_form, url) => {
    gitRepo(url);
    expect(values.deriveOrigin(root)).toEqual({
      REPO_URL: "https://github.com/virajp/claude-plugins",
      PROJECT_NAME: "virajp/claude-plugins",
    });
  });

  it("keeps a nested group path", () => {
    gitRepo("git@gitlab.com:group/sub/repo.git");
    expect(values.deriveOrigin(root)).toEqual({
      REPO_URL: "https://gitlab.com/group/sub/repo",
      PROJECT_NAME: "group/sub/repo",
    });
  });

  it("keeps an https port in REPO_URL", () => {
    gitRepo("https://git.example.com:8443/team/app.git");
    expect(values.deriveOrigin(root)).toEqual({
      REPO_URL: "https://git.example.com:8443/team/app",
      PROJECT_NAME: "team/app",
    });
  });

  it("drops an ssh port from REPO_URL", () => {
    gitRepo("ssh://git@git.example.com:2222/team/app.git");
    expect(values.deriveOrigin(root)).toEqual({
      REPO_URL: "https://git.example.com/team/app",
      PROJECT_NAME: "team/app",
    });
  });

  it.each([
    ["a local path", "/srv/git/repo.git"],
    ["a file url", "file:///srv/git/repo.git"],
    ["an owner-less path", "https://github.com/repo"],
    ["a quote in the path", "https://github.com/own\"er/repo"],
    [
      "a command substitution in the path",
      "git@github.com:owner/$(touch x).git",
    ],
    ["a backtick in the path", "https://github.com/owner/re`id`po"],
    ["a semicolon in the host", "ssh://git@evil;rm/owner/repo"],
    ["a pipe in the path", "git@github.com:owner/a|b"],
    ["a dot-dot segment", "https://github.com/owner/../repo"],
  ])("is empty for %s", (_what, url) => {
    gitRepo(url);
    expect(values.deriveOrigin(root)).toEqual({});
  });

  it("is empty with no origin, and outside a git repo", () => {
    // Holds even if os.tmpdir() sits inside a checkout: root is not its top level.
    expect(values.deriveOrigin(root)).toEqual({});
    gitRepo();
    expect(values.deriveOrigin(root)).toEqual({});
  });

  it("is empty for a directory with no .git of its own inside a repo with an origin", () => {
    gitRepo("git@github.com:virajp/claude-plugins.git");
    const member = join(root, "member");
    mkdirSync(member);
    expect(values.deriveOrigin(root)).toEqual({
      REPO_URL: "https://github.com/virajp/claude-plugins",
      PROJECT_NAME: "virajp/claude-plugins",
    });
    expect(values.deriveOrigin(member)).toEqual({});
    expect(values.loadValues(member)).toEqual({});
  });
});

describe("loadValues", () => {
  it("maps every stored key but packs, plus the origin names", () => {
    gitRepo("git@github.com:virajp/claude-plugins.git");
    writeStackgen(FULL);
    expect(values.loadValues(root)).toEqual({
      FORMAT: 1,
      REPO_NAME: "claude-plugins",
      MERGE_MODEL_DEVELOP: "direct",
      MERGE_MODEL_MAIN: "pr",
      MEMBERS: ["api", "web"],
      SCOPES: ["ops", "docs"],
      NODE: true,
      EXTERNAL: false,
      FORGE: "github",
      SECRETS: "fnox",
      REPO_URL: "https://github.com/virajp/claude-plugins",
      PROJECT_NAME: "virajp/claude-plugins",
    });
  });

  it("adds a pack's own keys unprefixed when pack names it", () => {
    writeStackgen(FULL);
    const v = values.loadValues(root, { pack: "swiftui" });
    expect(v.XCODE_VERSION).toBe("26.0");
    expect(v.SIMULATORS).toEqual(["iPhone 17"]);
    expect(v.REPO_NAME).toBe("claude-plugins");
    expect(v.REPO_URL).toBeUndefined();
  });

  it("adds nothing for a pack with no values", () => {
    writeStackgen("format: 1");
    expect(values.loadValues(root, { pack: "swiftui" })).toEqual({ FORMAT: 1 });
  });

  it("refuses a pack key that clashes with a global name", () => {
    writeStackgen(FULL);
    expect(() => values.loadValues(root, { pack: "clashing" }))
      .toThrow(
        /packs\.clashing\.repo_name names REPO_NAME, which is already a global name/,
      );
  });

  it("refuses a pack key that clashes with a global name absent from this repo", () => {
    writeStackgen(
      "format: 1\npacks:\n  swiftui:\n    repo_url: x\n    merge_model_main: pr\n    forge: z",
    );
    expect(() => values.loadValues(root, { pack: "swiftui" }))
      .toThrow(
        /packs\.swiftui\.repo_url names REPO_URL, which is already a global name/,
      );
  });

  it.each(["merge_model_main", "forge", "project_name"])(
    "refuses an absent global %s as a pack key",
    key => {
      writeStackgen(`format: 1\npacks:\n  swiftui:\n    ${key}: x`);
      expect(() => values.loadValues(root, { pack: "swiftui" })).toThrow(
        /already a global name/,
      );
    },
  );

  it("refuses two pack keys that differ only in case", () => {
    writeStackgen("format: 1\npacks:\n  swiftui:\n    foo: a\n    FOO: b");
    expect(() => values.loadValues(root, { pack: "swiftui" }))
      .toThrow(/packs\.swiftui\.foo and packs\.swiftui\.FOO both name FOO/);
  });

  it("reads a slug that names an Object.prototype member as absent", () => {
    writeStackgen("format: 1");
    expect(values.loadValues(root, { pack: "toString" })).toEqual({
      FORMAT: 1,
    });
  });

  it("is the origin names alone when the file is absent", () => {
    gitRepo("https://github.com/virajp/claude-plugins");
    expect(values.loadValues(root)).toEqual({
      REPO_URL: "https://github.com/virajp/claude-plugins",
      PROJECT_NAME: "virajp/claude-plugins",
    });
  });

  it.each([
    ["a line separator", "repo_name: \"a\u2028b\""],
    ["an unquoted line separator", "repo_name: a\u2028b"],
    ["a paragraph separator", "scopes: [\"a\u2029b\"]"],
    ["a control character", "repo_name: \"a\u0007b\""],
    ["a tab", "forge: \"a\tb\""],
  ])("refuses a value holding %s", (_what, line) => {
    writeStackgen(`format: 1\n${line}`);
    expect(() => values.loadValues(root)).toThrow(values.ValuesError);
    expect(() => values.loadValues(root)).toThrow(
      /line break, a control character or a line\/paragraph separator/,
    );
  });

  it("refuses a pack value holding U+2028", () => {
    writeStackgen("format: 1\npacks:\n  swiftui:\n    note: \"a\u2028b\"");
    expect(() => values.loadValues(root, { pack: "swiftui" })).toThrow(
      /NOTE holds a line break/,
    );
  });
});
