/**
 * The skill-kit scripts, run for real over temp repos. The one path constant
 * below moves when the skill moves into a plugin.
 */
import { spawnSync } from "node:child_process";
import {
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
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

const REPO = join(import.meta.dirname, "..", "..");
const KIT = join(REPO, ".claude", "skills", "skill-kit");

let root: string;

function run(script: string, ...args: string[]) {
  const r = spawnSync("node", [join(KIT, "scripts", script), ...args], {
    cwd: root,
    encoding: "utf8",
  });
  return { code: r.status, out: r.stdout + r.stderr };
}

function write(path: string, text: string) {
  const file = join(root, path);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, text);
}

const SKILLS = ".claude/skills";

function skill(name: string, frontmatter: string, body = "\n# x\n") {
  write(`${SKILLS}/${name}/SKILL.md`, `---\nname: ${name}\n${frontmatter}\n---\n${body}`);
}

const GOOD = "description: Does x. Use when y. Not for z (use w).";

function ids(out: string) {
  return out.split("\n").map((l) => l.split(" ")[1]);
}

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), "skill-kit-"));
});

afterEach(() => {
  rmSync(root, { recursive: true, force: true });
});

describe("the skill itself", () => {
  it("passes its own lint with no finding", () => {
    const r = run("lint.mjs", KIT);
    expect(r.out).toContain("1 skills, 0 errors, 0 other");
    expect(r.code).toBe(0);
  });
});

describe("lint: frontmatter and description", () => {
  it("reports a missing archetype, a missing trigger and a missing Not for", () => {
    skill("a", "description: Does x.");
    const r = run("lint.mjs", `${SKILLS}/a`);
    expect(r.code).toBe(1);
    expect(r.out).toContain("SK007");
    expect(r.out).toContain("no trigger");
    expect(r.out).toContain("no \"Not for\"");
  });

  it("refuses a plain value that holds a colon and a space", () => {
    skill("a", "description: Does x: y. Use when z. Not for w.");
    expect(run("lint.mjs", `${SKILLS}/a`).out).toContain("SK011");
  });

  it("reads a folded description and a nested metadata block", () => {
    skill(
      "a",
      "description: >-\n  Does x. Use when y.\n  Not for z.\nmetadata:\n  archetype: audit\n  depends-on: [b, c]",
    );
    const r = run("lint.mjs", `${SKILLS}/a`);
    expect(r.out).not.toContain("SK001");
    expect(r.out).not.toContain("SK007");
  });

  it("makes a description over 1024 chars an error", () => {
    skill("a", `description: Use when y. Not for z. ${"x".repeat(1024)}\nmetadata:\n  archetype: audit`);
    const r = run("lint.mjs", `${SKILLS}/a`);
    expect(r.out).toMatch(/ERROR SK002/);
  });
});

describe("lint: structure", () => {
  it("reports a broken link, a nested reference and an unreachable file", () => {
    skill("a", `${GOOD}\nmetadata:\n  archetype: reference`, "\n[x](references/none.md)\n");
    write(`${SKILLS}/a/references/deep/x.md`, "x");
    write(`${SKILLS}/a/references/lost.md`, "x");
    const found = ids(run("lint.mjs", `${SKILLS}/a`).out);
    expect(found).toEqual(expect.arrayContaining(["SK004", "SK005", "SK013"]));
  });

  it("follows a reference-style link and a plain path", () => {
    const body =
      "\n[`a.md`][a]\n\nRead `${ROOT}/skills/x/references/b.md`.\n\n[a]: references/a.md\n[gone]: references/gone.md\n";
    skill("a", `${GOOD}\nmetadata:\n  archetype: audit`, body);
    write(`${SKILLS}/a/references/a.md`, "x");
    write(`${SKILLS}/a/references/b.md`, "x");
    const out = run("lint.mjs", `${SKILLS}/a`).out;
    expect(out).not.toContain("SK013");
    expect(out).toContain("link does not resolve: references/gone.md");
  });

  it("ignores a link inside code", () => {
    skill("a", `${GOOD}\nmetadata:\n  archetype: audit`, "\n`[x](none.md)`\n\n```\n[y](none.md)\n```\n");
    expect(run("lint.mjs", `${SKILLS}/a`).out).not.toContain("SK004");
  });

  it("counts an always file against the budget, and a sometimes file not", () => {
    const words = "word ".repeat(500);
    write(`${SKILLS}/a/references/big.md`, words);
    const table = (loads: string) =>
      `\n## Routing\n\n| Doing | Read | Loads |\n| --- | --- | --- |\n| x | [b](references/big.md) | ${loads} |\n`;
    skill("a", `${GOOD}\nmetadata:\n  archetype: reference`, table("always"));
    expect(run("lint.mjs", `${SKILLS}/a`).out).toContain("SK003");
    skill("a", `${GOOD}\nmetadata:\n  archetype: reference`, table("sometimes"));
    expect(run("lint.mjs", `${SKILLS}/a`).out).not.toContain("SK003");
  });

  it("prints the three word counts", () => {
    skill("a", GOOD, "\none two three\n");
    expect(run("lint.mjs", "--words", `${SKILLS}/a`).out).toContain("body 3 always 3");
  });

  it("does not take a URL path for a user path", () => {
    skill("a", `${GOOD}\nmetadata:\n  archetype: audit`);
    write(`${SKILLS}/a/scripts/x.sh`, "curl https://x.com/api/users/abc https://x.com/home/page\n");
    expect(run("lint.mjs", `${SKILLS}/a`).out).not.toContain("SK009");
  });

  it("finds a hardcoded user path and a secret", () => {
    skill("a", `${GOOD}\nmetadata:\n  archetype: audit`);
    write(`${SKILLS}/a/scripts/x.sh`, `cd /Users/someone\n# ghp_${"a".repeat(30)}\n`);
    const found = ids(run("lint.mjs", `${SKILLS}/a`).out);
    expect(found).toEqual(expect.arrayContaining(["SK009", "SK010"]));
  });
});

describe("lint: style", () => {
  it("reports a long sentence, filler, emphasis and a rule with no reason", () => {
    const long = "word ".repeat(26).trim();
    const body =
      `\n${long}.\n\nRun this in order to win.\n\n**MUST a** **MUST b** **MUST c** **NEVER d**\n\n## Never\n\n- Do x\n`;
    skill("a", GOOD, body);
    const found = ids(run("lint.mjs", `${SKILLS}/a`).out);
    expect(found).toEqual(expect.arrayContaining(["ST101", "ST102", "ST103", "ST105"]));
  });

  it("counts a sentence across wrapped lines, and stops at a list item", () => {
    const line = "word ".repeat(13).trim();
    skill("a", GOOD, `\n${line}\n${line}.\n`);
    expect(run("lint.mjs", `${SKILLS}/a`).out).toContain("sentence has 26 words");
    skill("a", GOOD, `\n- ${line}.\n- ${line}.\n`);
    expect(run("lint.mjs", `${SKILLS}/a`).out).not.toContain("ST101");
  });

  it("splits a sentence before a code span, and joins a wrapped reason", () => {
    const half = "word ".repeat(14).trim();
    skill("a", GOOD, `\n${half}. \`--json\` ${half}.\n\n## Never\n\n- Do x —\n  because y.\n`);
    const out = run("lint.mjs", `${SKILLS}/a`).out;
    expect(out).not.toContain("ST101");
    expect(out).not.toContain("ST105");
  });

  it("applies the shorter limit to a numbered step", () => {
    skill("a", GOOD, `\n1. ${"word ".repeat(21).trim()}.\n`);
    expect(run("lint.mjs", `${SKILLS}/a`).out).toContain("limit 20");
  });
});

describe("lint: archetypes", () => {
  it("requires a linked Phases row and a halt table in a workflow", () => {
    skill(
      "a",
      `${GOOD}\nmetadata:\n  archetype: workflow`,
      "\n## Phases\n\n| Phase | Gate |\n| --- | --- |\n| one | auto |\n",
    );
    const found = ids(run("lint.mjs", `${SKILLS}/a`).out);
    expect(found).toEqual(expect.arrayContaining(["WF301", "WF303", "SK015", "SK016"]));
  });

  it("requires paths on a model-only doctrine", () => {
    skill(
      "a",
      "description: Scope. Auto-applies when editing x.\nuser-invocable: false\nmetadata:\n  archetype: doctrine",
    );
    expect(run("lint.mjs", `${SKILLS}/a`).out).toContain("DC401");
  });

  it("refuses a user-only adapter and an unresolved contract", () => {
    skill(
      "a",
      `${GOOD}\ndisable-model-invocation: true\nmetadata:\n  archetype: adapter\n  implements: host/other@1`,
    );
    const found = ids(run("lint.mjs", `${SKILLS}/a`).out);
    expect(found).toEqual(expect.arrayContaining(["AD601", "AD602", "AD603"]));
  });

  it("refuses a model-only adapter", () => {
    skill("a", `${GOOD}\nuser-invocable: false\nmetadata:\n  archetype: adapter\n  implements: h/a@1`);
    expect(run("lint.mjs", `${SKILLS}/a`).out).toContain("AD601");
  });

  it("requires Preview before Write in a generator", () => {
    skill("a", `${GOOD}\nmetadata:\n  archetype: generator`, "\n## Write\n\nx\n\n## Preview\n\nx\n");
    expect(run("lint.mjs", `${SKILLS}/a`).out).toContain("GN701");
  });

  it("requires unique check IDs in an audit", () => {
    skill(
      "a",
      `${GOOD}\nmetadata:\n  archetype: audit`,
      "\n## Checks\n\n| ID | Check |\n| --- | --- |\n| C1 | x |\n| C1 | y |\n",
    );
    expect(run("lint.mjs", `${SKILLS}/a`).out).toContain("AU801");
  });

  it("finds a mutating verb in a collector", () => {
    skill("a", `${GOOD}\nmetadata:\n  archetype: analysis`);
    write(`${SKILLS}/a/scripts/collect-x.sh`, "aws thing delete-all > data/x\n");
    expect(run("lint.mjs", `${SKILLS}/a`).out).toContain("AN903");
  });

  it("checks the topic set of a subtype", () => {
    skill("a", `${GOOD}\nmetadata:\n  archetype: reference\n  subtype: cloud-provider`);
    expect(run("lint.mjs", `${SKILLS}/a`).out).toContain("references/identity-and-iam.md");
  });

  it("warns when the invocation differs from the default, unless a reason exists", () => {
    skill("a", `${GOOD}\nmetadata:\n  archetype: audit`);
    expect(run("lint.mjs", `${SKILLS}/a`).out).toContain("SK012");
    skill("a", `${GOOD}\nmetadata:\n  archetype: audit\n  invocation-reason: a gate calls it`);
    expect(run("lint.mjs", `${SKILLS}/a`).out).not.toContain("SK012");
  });
});

describe("lint --all: the collection", () => {
  it("reports a missing target, a user-only target and a cycle", () => {
    skill("a", `${GOOD}\nmetadata:\n  archetype: audit\n  depends-on: [b, none]`);
    skill("b", `${GOOD}\ndisable-model-invocation: true\nmetadata:\n  archetype: audit\n  depends-on: [a]`);
    const r = run("lint.mjs", "--all");
    expect(r.out).toContain("target does not exist: none");
    expect(r.out).toContain("CL205");
    expect(r.out).toContain("dependency cycle");
  });

  it.each([
    ["a plain string", "depends-on: b"],
    ["a block list", "depends-on:\n    - b"],
  ])("reads depends-on as %s", (_, line) => {
    skill("a", `${GOOD}\nmetadata:\n  archetype: audit\n  ${line}`);
    skill("b", `${GOOD}\ndisable-model-invocation: true\nmetadata:\n  archetype: audit`);
    expect(run("lint.mjs", "--all").out).toContain("CL205");
  });

  it("clears the invocation warning when another skill depends on the target", () => {
    skill("a", `${GOOD}\nmetadata:\n  archetype: audit\n  depends-on: [b]`);
    skill("b", `${GOOD}\nmetadata:\n  archetype: audit`);
    const lines = run("lint.mjs", "--all").out.split("\n");
    expect(lines.filter((l) => l.includes("SK012") && l.includes("skills/b/"))).toEqual([]);
  });

  it("reports a description budget overrun and adapter section drift", () => {
    skill("a", `description: Use when y. Not for z. ${"x".repeat(1000)}`);
    for (const n of ["b", "c", "d", "e", "f", "g", "h", "i"]) {
      skill(n, `description: Use when y. Not for z. ${"x".repeat(1000)}`);
    }
    write(
      "plugins/p/skills/same/SKILL.md",
      `---\nname: same\n${GOOD}\nmetadata:\n  archetype: adapter\n  implements: h/same@1\n---\n\n## One\n`,
    );
    write(
      "plugins/q/skills/same/SKILL.md",
      `---\nname: same\n${GOOD}\nmetadata:\n  archetype: adapter\n  implements: h/same@1\n---\n\n## Two\n`,
    );
    const r = run("lint.mjs", "--all");
    expect(r.out).toContain("CL201");
    expect(r.out).toContain("AD604");
  });
});

describe("new", () => {
  it.each([
    ["workflow", []],
    ["doctrine", []],
    ["reference", ["--subtype", "cloud-service"]],
    ["adapter", []],
    ["generator", []],
    ["audit", []],
    ["analysis", ["--subtype", "codebase"]],
    ["runbook", []],
  ])("scaffolds %s with no broken link and no section finding", (archetype, extra) => {
    expect(run("new.mjs", archetype, "my-skill", "out", ...extra).code).toBe(0);
    const text = readFileSync(join(root, "out/my-skill/SKILL.md"), "utf8");
    expect(text).toContain("name: my-skill");
    expect(text).not.toMatch(/SKILL_NAME|\{\s*\{/);
    const out = run("lint.mjs", "out/my-skill").out;
    for (
      const id of ["SK004", "SK007", "SK011", "SK013", "SK015", "GN701", "AU801", "AU802", "AN904", "RF501", "AN901"]
    ) {
      expect(out, `${archetype} ${id}`).not.toContain(id);
    }
  });

  it("creates the topic files of a subtype", () => {
    run("new.mjs", "reference", "svc", "out", "--subtype", "cloud-provider");
    expect(readdirSync(join(root, "out/svc/references")).sort()).toEqual([
      "cost-doctrine.md",
      "identity-and-iam.md",
      "local-development-map.md",
      "networking-and-private-plane.md",
    ]);
  });

  it("refuses an existing folder, an unknown archetype and a bad name", () => {
    run("new.mjs", "audit", "x", "out");
    expect(run("new.mjs", "audit", "x", "out").out).toContain("folder exists");
    expect(run("new.mjs", "none", "y", "out").code).toBe(2);
    expect(run("new.mjs", "audit", "Bad_Name", "out").code).toBe(2);
  });
});

describe("ledger", () => {
  function fill(status: Record<string, unknown>) {
    const file = join(root, "ledger/SKILL.json");
    const data = JSON.parse(readFileSync(file, "utf8"));
    for (const e of data.entries) { Object.assign(e, status); }
    writeFileSync(file, JSON.stringify(data));
    return data;
  }

  beforeEach(() => {
    write(
      "old/SKILL.md",
      [
        "---",
        "name: a",
        "description: x",
        "---",
        "",
        "# Title",
        "",
        "A paragraph",
        "on two lines.",
        "",
        "- Item one",
        "  continues.",
        "",
        "| H | I |",
        "| - | - |",
        "| a | b |",
        "",
        "```sh",
        "run",
        "",
        "more",
        "```",
        "",
      ]
        .join("\n"),
    );
    write("new/SKILL.md", "The rule is here.\n");
  });

  it("extracts each block once, with its kind and line", () => {
    run("ledger.mjs", "extract", "old", "ledger");
    const { source, entries } = JSON.parse(readFileSync(join(root, "ledger/SKILL.json"), "utf8"));
    expect(source).toBe("SKILL.md");
    expect(entries.map((e: { kind: string }) => e.kind)).toEqual([
      "frontmatter",
      "frontmatter",
      "heading",
      "paragraph",
      "list-item",
      "table-row",
      "table-row",
      "code",
    ]);
    expect(entries[3].text).toBe("A paragraph on two lines.");
    expect(entries[4].text).toBe("- Item one continues.");
    expect(entries[3].line).toBe(8);
  });

  it("fails while an entry is pending or missing", () => {
    run("ledger.mjs", "extract", "old", "ledger");
    expect(run("ledger.mjs", "check", "ledger", "new").code).toBe(1);
    fill({ status: "missing" });
    expect(run("ledger.mjs", "check", "ledger", "new").out).toContain("no match");
  });

  it("passes a kept entry only when the quote is in the file", () => {
    run("ledger.mjs", "extract", "old", "ledger");
    fill({ status: "kept", where: "SKILL.md", quote: "The rule  is here." });
    expect(run("ledger.mjs", "check", "ledger", "new").code).toBe(0);
    fill({ status: "kept", where: "SKILL.md", quote: "Another rule is here." });
    expect(run("ledger.mjs", "check", "ledger", "new").out).toContain("quote is not in");
    fill({ status: "kept", where: "none.md", quote: "x y z" });
    expect(run("ledger.mjs", "check", "ledger", "new").out).toContain("where does not exist");
  });

  it("refuses a short quote, and a where that leaves the new skill", () => {
    run("ledger.mjs", "extract", "old", "ledger");
    fill({ status: "kept", where: "SKILL.md", quote: "rule" });
    expect(run("ledger.mjs", "check", "ledger", "new").out).toContain("under 3 words");
    fill({ status: "kept", where: "SKILL.md", quote: " " });
    expect(run("ledger.mjs", "check", "ledger", "new").code).toBe(1);
    fill({ status: "kept", where: "../old/SKILL.md", quote: "A paragraph on two" });
    expect(run("ledger.mjs", "check", "ledger", "new").out).toContain("leaves the new skill");
  });

  it("refuses a deleted ledger file and edited entries", () => {
    write("old/references/a.md", "A rule in a reference.\n");
    run("ledger.mjs", "extract", "old", "ledger");
    fill({ status: "no-rule", reason: "x" });
    rmSync(join(root, "ledger/references__a.json"));
    expect(run("ledger.mjs", "check", "ledger", "new").out).toContain("missing from the ledger");
    const data = fill({ status: "no-rule", reason: "x" });
    data.entries.pop();
    writeFileSync(join(root, "ledger/SKILL.json"), JSON.stringify(data));
    expect(run("ledger.mjs", "check", "ledger", "new").out).toContain("differ from the extract");
  });

  it("refuses to extract over a ledger", () => {
    run("ledger.mjs", "extract", "old", "ledger");
    fill({ status: "no-rule", reason: "x" });
    expect(run("ledger.mjs", "extract", "old", "ledger").code).toBe(2);
    expect(readFileSync(join(root, "ledger/SKILL.json"), "utf8")).toContain("no-rule");
  });

  it("enters a script as one entry, and settles a file with unchanged bytes", () => {
    write("old/scripts/x.sh", "echo rule\n");
    write("new/scripts/x.sh", "echo rule\n");
    run("ledger.mjs", "extract", "old", "ledger");
    const script = JSON.parse(readFileSync(join(root, "ledger/scripts__x.sh.json"), "utf8"));
    expect(script.entries[0].kind).toBe("file");
    fill({ status: "no-rule", reason: "x" });
    const r = run("ledger.mjs", "check", "ledger", "new");
    expect(r.code).toBe(0);
    expect(r.out).toContain("unchanged=1");
  });

  it("opens a script that changed", () => {
    write("old/scripts/x.sh", "echo rule\n");
    write("new/scripts/x.sh", "echo other\n");
    run("ledger.mjs", "extract", "old", "ledger");
    fill({ status: "no-rule", reason: "x" });
    expect(run("ledger.mjs", "check", "ledger", "new").out).toContain("not settled: pending");
  });

  it("prints each no-rule reason for the user to read", () => {
    run("ledger.mjs", "extract", "old", "ledger");
    fill({ status: "no-rule", reason: "a heading" });
    expect(run("ledger.mjs", "check", "ledger", "new").out).toContain("a heading");
  });

  it("passes a drop only with the user's approval", () => {
    run("ledger.mjs", "extract", "old", "ledger");
    fill({ status: "dropped", reason: "obsolete" });
    expect(run("ledger.mjs", "check", "ledger", "new").out).toContain("approved");
    fill({ status: "dropped", reason: "obsolete", approved: true });
    expect(run("ledger.mjs", "check", "ledger", "new").code).toBe(0);
  });

  it("needs a reason for no-rule, and refuses an empty ledger", () => {
    run("ledger.mjs", "extract", "old", "ledger");
    fill({ status: "no-rule" });
    expect(run("ledger.mjs", "check", "ledger", "new").out).toContain("needs a reason");
    mkdirSync(join(root, "empty"));
    expect(run("ledger.mjs", "check", "empty", "new").code).toBe(2);
  });
});
