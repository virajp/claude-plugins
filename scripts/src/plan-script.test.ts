/**
 * vwf's plan.mjs, run for real over copies of the fixtures in a temp
 * directory: get, set, append, remove and validate on a plan folder's
 * index.json and on the plan index, docs/plans/index.json.
 */
import { spawnSync } from "node:child_process";
import {
  cpSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
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
  "plan-management",
  "scripts",
  "plan.mjs",
);
const FIXTURES = join(import.meta.dirname, "fixtures", "plan-script");

/** A parsed plan file, mutated freely by the cases below. */
type Json = any;

let root: string;
let change: string;
let cycle: string;
let index: string;

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), "vwf-plan-"));
  cpSync(FIXTURES, root, { recursive: true });
  change = join(root, "change", "index.json");
  cycle = join(root, "cycle", "index.json");
  index = join(root, "docs", "plans", "index.json");
});

afterEach(() => {
  rmSync(root, { recursive: true, force: true });
});

function plan(args: string[], input?: string) {
  return spawnSync("node", [SCRIPT, ...args], {
    encoding: "utf8",
    ...(input === undefined ? {} : { input }),
  });
}

function read(file: string): string {
  return readFileSync(file, "utf8");
}

function parse(file: string): Json {
  return JSON.parse(read(file));
}

/** The bytes plan.mjs writes for a document. */
function bytes(doc: Json): string {
  return `${JSON.stringify(doc, null, 2)}\n`;
}

describe("get", () => {
  it("prints a key as JSON", () => {
    const r = plan(["get", change, "status.state"]);
    expect(r.status).toBe(0);
    expect(r.stdout).toBe("\"APPROVED\"\n");
  });

  it("prints a string without quotes with --raw", () => {
    const r = plan(["get", change, "status.state", "--raw"]);
    expect(r.status).toBe(0);
    expect(r.stdout).toBe("APPROVED\n");
  });

  it("chooses a list entry by its id", () => {
    const r = plan(["get", change, "units.U2"]);
    expect(r.status).toBe(0);
    expect(JSON.parse(r.stdout)).toEqual(parse(change).units[1]);
    expect(plan(["get", change, "units.U2.wave"]).stdout).toBe("2\n");
  });

  it("chooses a plan index row by its id", () => {
    const r = plan(["get", index, "plans.2026-10-20-sign-in.gaps.open"]);
    expect(r.status).toBe(0);
    expect(r.stdout).toBe("1\n");
  });

  it("prints the whole file with no path", () => {
    const r = plan(["get", change]);
    expect(r.status).toBe(0);
    expect(r.stdout).toBe(bytes(parse(change)));
  });

  it("reads the JSON from stdin with -", () => {
    const r = plan([
      "get",
      "-",
      "plans.2026-10-24-plan-json-format.status",
      "--raw",
    ], read(index));
    expect(r.status).toBe(0);
    expect(r.stdout).toBe("APPROVED\n");
  });

  it("refuses a wrong id with exit 2", () => {
    const r = plan(["get", change, "units.U9.status"]);
    expect(r.status).toBe(2);
    expect(r.stderr).toContain(
      `${change}: units.U9.status: no entry with id U9`,
    );
  });

  it("refuses a missing key with exit 2", () => {
    expect(plan(["get", change, "nope"]).status).toBe(2);
  });
});

describe("set", () => {
  it("sets a string and writes the house serialization", () => {
    const before = parse(change);
    const r = plan(["set", change, "units.U1.status", "green"]);
    expect(r.status).toBe(0);
    before.units[0].status = "green";
    expect(read(change)).toBe(bytes(before));
  });

  it("sets a JSON value with --json", () => {
    const r = plan([
      "set",
      change,
      "units.R3.range",
      "{\"from\":\"aaa\",\"to\":\"bbb\"}",
      "--json",
    ]);
    expect(r.status).toBe(0);
    expect(parse(change).units[2].range).toEqual({ from: "aaa", to: "bbb" });
    expect(plan(["set", change, "units.U1.rounds", "2", "--json"]).status).toBe(
      0,
    );
    expect(parse(change).units[0].rounds).toBe(2);
  });

  it.each([["--force the push"], ["--json"], ["--raw"]])(
    "sets a value that starts with -- (%s) as a string",
    value => {
      const r = plan(["set", change, "run.detail", value]);
      expect(r.status).toBe(0);
      expect(parse(change).run.detail).toBe(value);
    },
  );

  it("takes a value of --json as the value when --json follows it", () => {
    const r = plan(["set", change, "run.detail", "\"--json\"", "--json"]);
    expect(r.status).toBe(0);
    expect(parse(change).run.detail).toBe("--json");
  });

  it("keeps the key order and puts a new key at the end", () => {
    const r = plan(["set", change, "run.started", "2026-10-24T10:00"]);
    expect(r.status).toBe(0);
    const doc = parse(change);
    expect(doc.run).toEqual({ started: "2026-10-24T10:00" });
    expect(Object.keys(doc)).toEqual(
      Object.keys(parse(join(FIXTURES, "change", "index.json"))),
    );
  });

  it("refuses a misspelt key, leaving the file unchanged", () => {
    const before = read(change);
    const r = plan(["set", change, "units.U1.stauts", "green"]);
    expect(r.status).toBe(1);
    expect(r.stderr).toContain(
      `${change}: units.U1.stauts: is not a key the schema names`,
    );
    expect(read(change)).toBe(before);
  });

  it("refuses a cycle-only key on a change plan", () => {
    const before = read(change);
    const r = plan(["set", change, "covers", "[]", "--json"]);
    expect(r.status).toBe(1);
    expect(r.stderr).toContain("covers: is a cycle-only key");
    expect(read(change)).toBe(before);
  });

  it("refuses a stage with an unknown state", () => {
    const before = read(change);
    const r = plan(["set", change, "stages.ux.state", "done"]);
    expect(r.status).toBe(1);
    expect(r.stderr).toContain("stages.ux.state:");
    expect(read(change)).toBe(before);
  });

  it("refuses a wrong id, leaving the file unchanged byte for byte", () => {
    const before = read(change);
    const r = plan(["set", change, "units.U9.status", "green"]);
    expect(r.status).toBe(2);
    expect(read(change)).toBe(before);
  });

  it("refuses a value that makes the file invalid", () => {
    const before = read(change);
    const r = plan(["set", change, "units.U1.wave", "one"]);
    expect(r.status).toBe(1);
    expect(r.stderr).toContain("units.U1.wave: must be an integer");
    expect(read(change)).toBe(before);
  });

  it("refuses --json that does not parse", () => {
    const before = read(change);
    expect(plan(["set", change, "run.x", "{", "--json"]).status).toBe(2);
    expect(read(change)).toBe(before);
  });

  it("sets a plan index row's status", () => {
    const r = plan([
      "set",
      index,
      "plans.2026-10-24-plan-json-format.status",
      "RUNNING",
    ]);
    expect(r.status).toBe(0);
    expect(parse(index).plans[0].status).toBe("RUNNING");
  });

  it("leaves no temporary file behind", () => {
    plan(["set", change, "units.U1.status", "green"]);
    plan(["set", change, "units.U1.status", "bogus"]);
    expect(readdirSync(join(root, "change")).filter(f => f.endsWith(".tmp")))
      .toEqual([]);
  });
});

describe("append", () => {
  it("adds an entry with a new id", () => {
    const gap = {
      id: "G1",
      unit: "U2",
      stage: "code",
      text: "a gap",
      state: "open",
    };
    const r = plan(["append", change, "gaps", "--json", JSON.stringify(gap)]);
    expect(r.status).toBe(0);
    expect(parse(change).gaps).toEqual([gap]);
  });

  it("adds a string to a list of strings", () => {
    const r = plan([
      "append",
      change,
      "gates.unit",
      "--json",
      "\"mise run test\"",
    ]);
    expect(r.status).toBe(0);
    expect(parse(change).gates.unit).toEqual([
      "mise x -- mise run code:format",
      "mise run test",
    ]);
  });

  it("refuses a duplicate id, leaving the file unchanged", () => {
    const before = read(cycle);
    const gap = { id: "G1", unit: "", stage: "", text: "again", state: "open" };
    const r = plan(["append", cycle, "gaps", "--json", JSON.stringify(gap)]);
    expect(r.status).toBe(1);
    expect(r.stderr).toContain("the list already holds id G1");
    expect(read(cycle)).toBe(before);
  });

  it("refuses an entry that breaks the schema", () => {
    const before = read(change);
    const r = plan([
      "append",
      change,
      "overrides",
      "--json",
      "{\"id\":\"O1\",\"txt\":\"x\"}",
    ]);
    expect(r.status).toBe(1);
    expect(read(change)).toBe(before);
  });

  it("needs --json", () => {
    expect(plan(["append", change, "gaps", "{}"]).status).toBe(2);
  });
});

describe("remove", () => {
  it("removes a plan index row by its id", () => {
    const before = parse(index);
    const r = plan(["remove", index, "plans.2026-10-24-plan-json-format"]);
    expect(r.status).toBe(0);
    const after = parse(index);
    expect(after.plans.map((p: Json) => p.id)).toEqual(
      before
        .plans
        .map((p: Json) => p.id)
        .filter((id: string) => id !== "2026-10-24-plan-json-format"),
    );
    expect(read(index)).toBe(bytes(after));
  });

  it("removes a gap by its id", () => {
    const r = plan(["remove", cycle, "gaps.G1"]);
    expect(r.status).toBe(0);
    expect(parse(cycle).gaps.some((g: Json) => g.id === "G1")).toBe(false);
  });

  it("refuses a wrong id with exit 2, leaving the file unchanged", () => {
    const before = read(index);
    const r = plan(["remove", index, "plans.no-such-plan"]);
    expect(r.status).toBe(2);
    expect(r.stderr).toContain("no entry with id no-such-plan");
    expect(read(index)).toBe(before);
  });

  it("refuses a key of an object with exit 2", () => {
    const before = read(change);
    const r = plan(["remove", change, "consent.merge"]);
    expect(r.status).toBe(2);
    expect(r.stderr).toContain("remove needs a path to a list entry");
    expect(read(change)).toBe(before);
  });

  it("refuses a removal that makes the file invalid", () => {
    const before = read(change);
    const r = plan(["remove", change, "units.U1"]);
    expect(r.status).toBe(1);
    expect(read(change)).toBe(before);
  });

  it("refuses a missing path and extra arguments", () => {
    expect(plan(["remove", change]).status).toBe(2);
    expect(plan(["remove", change, "gaps.G1", "--json"]).status).toBe(2);
  });
});

describe("validate", () => {
  it.each([
    ["the change plan", "change/index.json"],
    ["the cycle plan", "cycle/index.json"],
    ["the plan index", "docs/plans/index.json"],
  ])("is green on %s", (_, rel) => {
    const r = plan(["validate", join(root, rel)]);
    expect(r.stderr).toBe("");
    expect(r.status).toBe(0);
  });

  it("exits 2 on a missing file", () => {
    const r = plan(["validate", join(root, "nope", "index.json")]);
    expect(r.status).toBe(2);
  });

  it("exits 2 on broken JSON", () => {
    writeFileSync(change, "{ \"format\": 1,");
    const r = plan(["validate", change]);
    expect(r.status).toBe(2);
    expect(r.stderr).toContain("not valid JSON");
  });

  it("refuses stdin", () => {
    expect(plan(["validate", "-"], read(change)).status).toBe(2);
  });

  const unit = (doc: Json, id: string) =>
    doc.units.find((u: Json) => u.id === id);

  const folderCases: [
    string,
    "change" | "cycle",
    (doc: Json) => void,
    string,
  ][] = [
    ["format is not 1", "change", d => {
      d.format = 2;
    }, "format: must be 1"],
    ["type is not valid", "change", d => {
      d.type = "vwf-other";
    }, "type:"],
    ["a required key is missing", "change", d => {
      delete d.stages;
    }, "stages: is missing"],
    ["a key has the wrong JSON type", "change", d => {
      d.title = 3;
    }, "title: must be a string"],
    ["an enum value is not valid", "change", d => {
      unit(d, "U1").status = "done";
    }, "units.U1.status:"],
    ["a release level is not valid", "change", d => {
      d.release_levels[0].level = "HUGE";
    }, "release_levels.vwf.level:"],
    ["an after-landing mode is not run", "change", d => {
      d.after_landing[0].mode = "ask";
    }, "after_landing.A1.mode:"],
    ["a gap state is not valid", "cycle", d => {
      d.gaps[0].state = "maybe";
    }, "gaps.G1.state:"],
    ["an LSP answer is not valid", "cycle", d => {
      d.consent.lsp.dart = "maybe";
    }, "consent.lsp.dart:"],
    ["an id is not unique", "change", d => {
      unit(d, "U2").id = "U1";
    }, "U1 is not unique"],
    ["an id breaks the pattern", "change", d => {
      d.shared_files[0].id = "S 1";
    }, "shared_files[0].id: must match"],
    ["a unit file is not in the folder", "change", d => {
      unit(d, "U1").file = "09-gone.md";
    }, "units.U1.file: 09-gone.md is not in the folder"],
    ["depends_on names no unit", "change", d => {
      unit(d, "U2").depends_on = ["U7"];
    }, "units.U2.depends_on: U7 is not a unit"],
    ["depends_on names a later wave", "change", d => {
      unit(d, "U1").depends_on = ["U2"];
    }, "units.U1.depends_on: U2 is not in an earlier wave"],
    ["waits is empty above wave 1", "change", d => {
      unit(d, "U2").waits = "";
    }, "units.U2.waits:"],
    ["a review unit owns a path", "change", d => {
      unit(d, "R3").owns = ["x"];
    }, "units.R3.owns:"],
    ["a review unit depends on nothing", "change", d => {
      unit(d, "R3").depends_on = [];
    }, "units.R3.depends_on:"],
    ["a review unit has no range", "change", d => {
      delete unit(d, "R3").range;
    }, "units.R3.range:"],
    ["a non-review unit has a range", "change", d => {
      unit(d, "U1").range = { from: "", to: "" };
    }, "units.U1.range: only a review unit"],
    ["backlog and backlog_pieces share an id", "change", d => {
      d.backlog.push("B2");
    }, "B2 is on backlog too"],
    ["a source id is on neither list", "change", d => {
      d.source.push("B9");
    }, "B9 is on neither"],
    ["a backlog piece has no index.md line", "change", d => {
      d.backlog_pieces = ["B7"];
      d.source = ["B1", "B7"];
    }, "B7 has no line"],
    ["a whole backlog id has an index.md line", "change", d => {
      d.backlog = ["B2"];
      d.backlog_pieces = [];
    }, "B2 is whole"],
    ["an unknown key", "change", d => {
      d.stages.ux.note = "x";
    }, "stages.ux.note: is not a key the schema names"],
    ["a cycle-only key on a change plan", "change", d => {
      d.acceptance = [];
    }, "acceptance: is a cycle-only key"],
    ["consent.lsp on a change plan", "change", d => {
      d.consent.lsp = {};
    }, "consent.lsp: is a cycle-only key"],
    ["a cycle plan lacks covers", "cycle", d => {
      delete d.covers;
    }, "covers: is missing"],
    ["a stage is missing", "cycle", d => {
      delete d.stages.ux;
    }, "stages.ux: is missing"],
    ["a gap names no unit", "cycle", d => {
      d.gaps[0].unit = "U9";
    }, "gaps.G1.unit: U9 is not a unit"],
    ["a gap has no text", "cycle", d => {
      d.gaps[0].text = "";
    }, "gaps.G1.text: must not be empty"],
  ];

  it.each(folderCases)("is red when %s", (_, which, mutate, expected) => {
    const file = which === "change" ? change : cycle;
    const doc = parse(file);
    mutate(doc);
    writeFileSync(file, bytes(doc));
    const r = plan(["validate", file]);
    expect(r.status).toBe(1);
    expect(r.stderr).toContain(expected);
    for (const line of r.stderr.trim().split("\n")) {
      expect(line.startsWith(`${file}: `)).toBe(true);
    }
  });

  it("accepts a cycle plan without the optional exposure", () => {
    const doc = parse(cycle);
    delete doc.exposure;
    writeFileSync(cycle, bytes(doc));
    expect(plan(["validate", cycle]).status).toBe(0);
  });

  it("accepts any key under run", () => {
    const doc = parse(change);
    doc.run = { log: "/tmp/x", nested: { a: 1 } };
    writeFileSync(change, bytes(doc));
    expect(plan(["validate", change]).status).toBe(0);
  });

  const indexCases: [string, (doc: Json) => void, string][] = [
    ["format is not 1", d => {
      d.format = 0;
    }, "format: must be 1"],
    ["plans is not a list", d => {
      d.plans = {};
    }, "plans: must be a list"],
    ["a row lacks a key", d => {
      delete d.plans[0].priority;
    }, "plans.2026-10-24-plan-json-format.priority: is missing"],
    ["a row's status is not valid", d => {
      d.plans[0].status = "DRAFT";
    }, "plans.2026-10-24-plan-json-format.status:"],
    ["a row's kind is not valid", d => {
      d.plans[0].kind = "other";
    }, ".kind:"],
    ["a row's gaps has the wrong shape", d => {
      d.plans[1].gaps = { open: "1", moved_to: [] };
    }, "gaps.open: must be an integer"],
    ["a row's target_repo is a number", d => {
      d.plans[0].target_repo = 1;
    }, "target_repo: must be a string or null"],
    ["a row's id is not its folder's basename", d => {
      d.plans[0].id = "2026-10-24-other";
    }, "does not match the basename"],
    ["two rows share an id", d => {
      d.plans[1].id = d.plans[0].id;
      d.plans[1].folder = d.plans[0].folder;
    }, "is not unique"],
    ["a row has an unknown key", d => {
      d.plans[0].owner = "me";
    }, "owner: is not a key the schema names"],
  ];

  it.each(indexCases)(
    "is red on the plan index when %s",
    (_, mutate, expected) => {
      const doc = parse(index);
      mutate(doc);
      writeFileSync(index, bytes(doc));
      const r = plan(["validate", index]);
      expect(r.status).toBe(1);
      expect(r.stderr).toContain(expected);
    },
  );
});

describe("usage", () => {
  it.each([
    [[] as string[]],
    [["frob", "x"]],
    [["get"]],
    [["set", "x", "a"]],
    [["get", "x", "--json"]],
    [["set", "x", "a", "b", "--bogus"]],
    [["set", "x", "a", "b", "c"]],
    [["set", "--json", "a", "b"]],
    [["append", "x", "gaps", "{}", "--json"]],
    [["validate", "x", "--raw"]],
  ])("exits 2 on %j", args => {
    expect(plan(args).status).toBe(2);
  });
});
