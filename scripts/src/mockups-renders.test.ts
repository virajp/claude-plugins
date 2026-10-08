/**
 * vwf's mockups `renders.mjs`, spawned for real over a temp worktree and a temp
 * main checkout: the RENDER: lines it copies to the route folders, the lines it
 * skips, and the renders.json it merges.
 */
import { spawnSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  rmSync,
  symlinkSync,
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

const SCRIPT = join(
  import.meta.dirname,
  "..",
  "..",
  "plugins",
  "vwf",
  "skills",
  "mockups",
  "scripts",
  "renders.mjs",
);

const DOC = "# Flow\n\n## Screens → app\n\n"
  + "| Code | Screen | Route | Reads | States | Actions | Form validation |\n"
  + "| ---- | ------ | ----- | ----- | ------ | ------- | --------------- |\n"
  + "| 200a | Orders | `/orders` | — | empty | — | — |\n"
  + "| 200b | Order details | `/orders/:id` | — | error | — | — |\n";

let base: string;
let w: string;
let m: string;

beforeEach(() => {
  base = realpathSync(mkdtempSync(join(tmpdir(), "mockups-renders-")));
  w = join(base, "worktree");
  m = join(base, "main");
  for (const platform of ["mobile", "web"]) {
    put(w, `docs/blueprint/flows/demo/200-orders/${platform}.md`, DOC);
  }
  put(w, "shots/a.png", "PNG-A");
  put(w, "shots/b.png", "PNG-B");
  mkdirSync(join(m, ".git"), { recursive: true });
});
afterEach(() => {
  rmSync(base, { recursive: true, force: true });
});

function put(dir: string, rel: string, text: string) {
  const file = join(dir, ...rel.split("/"));
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, text);
}

function run(input: string, plan = "demo-plan") {
  const result = spawnSync(
    "node",
    [
      SCRIPT,
      "--worktree",
      w,
      "--main",
      m,
      "--project",
      "demo",
      "--plan",
      plan,
    ],
    { input, encoding: "utf8" },
  );
  return {
    status: result.status,
    stdout: result.stdout,
    stderr: result.stderr,
  };
}

const TREE = join("docs", "scratchpad", "demo", "renders");

function tree(...rel: string[]) {
  return join(m, TREE, ...rel);
}

interface Entry {
  code: string;
  state: string;
  route: string;
  file: string;
  plan: string;
  date: string;
}

function rendersJson(platform: string): {
  project: string;
  platform: string;
  renders: Entry[];
} {
  return JSON.parse(
    readFileSync(tree(platform, "__renders", "renders.json"), "utf8"),
  );
}

const SMOKE = [
  "RENDER: 200b mobile default shots/a.png",
  "RENDER: 200b mobile error shots/b.png",
  "RENDER: 200a web default shots/a.png",
  "RENDER: 999z mobile default shots/a.png",
  "",
]
  .join("\n");

describe("renders.mjs", () => {
  it("copies each known code to its route folder and skips the rest", () => {
    const { status, stdout } = run(SMOKE);
    expect(status).toBe(0);
    const lines = stdout.trimEnd().split("\n");
    expect(lines.at(-1)).toBe("COPIED: 3");
    const skipped = lines.filter(line => line.startsWith("SKIPPED:"));
    expect(skipped).toHaveLength(1);
    expect(skipped[0]).toMatch(/^SKIPPED: 999z mobile default — /);
    expect(readFileSync(tree("mobile", "orders", "[id]", "index.png"), "utf8"))
      .toBe("PNG-A");
    expect(
      readFileSync(
        tree("mobile", "orders", "[id]", "index--error.png"),
        "utf8",
      ),
    )
      .toBe("PNG-B");
    expect(readFileSync(tree("web", "orders", "index.png"), "utf8")).toBe(
      "PNG-A",
    );
    const json = rendersJson("mobile");
    expect(json).toMatchObject({ project: "demo", platform: "mobile" });
    expect(json.renders.map(e => [e.code, e.state, e.file])).toEqual([
      ["200b", "default", "orders/[id]/index.png"],
      ["200b", "error", "orders/[id]/index--error.png"],
    ]);
    for (const entry of json.renders) {
      expect(entry.plan).toBe("demo-plan");
      expect(entry.route).toBe("/orders/:id");
      expect(entry.date).toMatch(/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d+Z$/);
    }
    const routes = JSON.parse(
      readFileSync(tree("mobile", "__renders", "routes.json"), "utf8"),
    );
    expect(routes.platform).toBe("mobile");
    expect(routes.screens.map((s: { code: string; }) => s.code)).toEqual([
      "200a",
      "200b",
    ]);
  });

  it("skips a file outside the worktree or missing, copies nothing for it", () => {
    put(base, "outside.png", "OUT");
    const { status, stdout } = run(
      [
        `RENDER: 200a mobile default ${join(base, "outside.png")}`,
        "RENDER: 200a mobile error ../outside.png",
        "RENDER: 200a mobile empty shots/missing.png",
      ]
        .join("\n"),
    );
    expect(status).toBe(0);
    expect(stdout.match(/^SKIPPED: /gm)).toHaveLength(3);
    expect(stdout.trimEnd().split("\n").at(-1)).toBe("COPIED: 0");
    expect(existsSync(tree("mobile"))).toBe(false);
  });

  it("replaces one entry on a second run and keeps the others", () => {
    run(SMOKE);
    const first = rendersJson("mobile");
    const { stdout } = run(
      "RENDER: 200b mobile error shots/a.png\n",
      "docs/plans/2026-10-09-second/",
    );
    expect(stdout.trimEnd()).toBe("COPIED: 1");
    const second = rendersJson("mobile");
    expect(second.renders).toHaveLength(2);
    const by = (list: Entry[], state: string) =>
      list.find(e => e.state === state);
    expect(by(second.renders, "default")).toEqual(
      by(first.renders, "default"),
    );
    expect(by(second.renders, "error")?.plan).toBe("2026-10-09-second");
    expect(
      readFileSync(
        tree("mobile", "orders", "[id]", "index--error.png"),
        "utf8",
      ),
    )
      .toBe("PNG-A");
    expect(rendersJson("web").renders).toHaveLength(1);
  });

  it("warns on a line that is not a RENDER: line", () => {
    const { status, stdout, stderr } = run("hello\n\nRENDER: 200a web x\n");
    expect(status).toBe(0);
    expect(stdout.trimEnd()).toBe("COPIED: 0");
    expect(stderr.match(/not a RENDER: line/g)).toHaveLength(2);
  });

  it("drops the entries and images of a code that moved or left the map", () => {
    run(SMOKE);
    run("RENDER: 200a mobile default shots/b.png\n");
    expect(rendersJson("mobile").renders).toHaveLength(3);
    // 200b moves to /order/:id; 200a stays.
    put(
      w,
      "docs/blueprint/flows/demo/200-orders/mobile.md",
      DOC.replace("`/orders/:id`", "`/order/:id`"),
    );
    const { stdout } = run("RENDER: 200a mobile empty shots/a.png\n");
    expect(stdout.trimEnd()).toBe("COPIED: 1");
    const json = rendersJson("mobile");
    expect(json.renders.map(e => [e.code, e.state])).toEqual([
      ["200a", "default"],
      ["200a", "empty"],
    ]);
    expect(existsSync(tree("mobile", "orders", "[id]", "index.png"))).toBe(
      false,
    );
    expect(existsSync(tree("mobile", "orders", "[id]", "index--error.png")))
      .toBe(false);
    expect(readFileSync(tree("mobile", "orders", "index.png"), "utf8")).toBe(
      "PNG-B",
    );
    const routes = JSON.parse(
      readFileSync(tree("mobile", "__renders", "routes.json"), "utf8"),
    );
    expect(
      routes.screens.find((s: { code: string; }) => s.code === "200b").route,
    )
      .toBe("/order/:id");
  });

  it("replaces a symlinked image, never writing through it", () => {
    put(base, "outside.png", "OUTSIDE");
    mkdirSync(tree("mobile", "orders"), { recursive: true });
    symlinkSync(
      join(base, "outside.png"),
      tree("mobile", "orders", "index.png"),
    );
    const { stdout } = run("RENDER: 200a mobile default shots/a.png\n");
    expect(stdout.trimEnd()).toBe("COPIED: 1");
    expect(readFileSync(join(base, "outside.png"), "utf8")).toBe("OUTSIDE");
    expect(readFileSync(tree("mobile", "orders", "index.png"), "utf8")).toBe(
      "PNG-A",
    );
  });

  it("replaces a symlinked renders.json and routes.json, never writing through them", () => {
    put(base, "outside-renders.json", "OUTSIDE-R");
    put(base, "outside-routes.json", "OUTSIDE-S");
    mkdirSync(tree("mobile", "__renders"), { recursive: true });
    symlinkSync(
      join(base, "outside-renders.json"),
      tree("mobile", "__renders", "renders.json"),
    );
    symlinkSync(
      join(base, "outside-routes.json"),
      tree("mobile", "__renders", "routes.json"),
    );
    const { stdout } = run("RENDER: 200a mobile default shots/a.png\n");
    expect(stdout.trimEnd()).toBe("COPIED: 1");
    expect(readFileSync(join(base, "outside-renders.json"), "utf8")).toBe(
      "OUTSIDE-R",
    );
    expect(readFileSync(join(base, "outside-routes.json"), "utf8")).toBe(
      "OUTSIDE-S",
    );
    expect(rendersJson("mobile").renders.map(e => e.code)).toEqual(["200a"]);
    expect(
      JSON
        .parse(
          readFileSync(tree("mobile", "__renders", "routes.json"), "utf8"),
        )
        .platform,
    )
      .toBe("mobile");
  });

  it("skips a route folder that is a symlink out of the tree, making nothing there", () => {
    const outside = join(base, "elsewhere");
    mkdirSync(outside);
    mkdirSync(tree("mobile"), { recursive: true });
    symlinkSync(outside, tree("mobile", "orders"));
    const { stdout } = run("RENDER: 200b mobile default shots/a.png\n");
    expect(stdout).toMatch(/^SKIPPED: 200b mobile default — .*escapes/m);
    expect(stdout.trimEnd().split("\n").at(-1)).toBe("COPIED: 0");
    expect(existsSync(join(outside, "[id]"))).toBe(false);
  });

  it("turns a failed copy into a SKIPPED line and still writes the json", () => {
    mkdirSync(tree("mobile", "orders", "[id]", "index.png"), {
      recursive: true,
    });
    const { status, stdout } = run(SMOKE);
    expect(status).toBe(0);
    expect(stdout).toMatch(/^SKIPPED: 200b mobile default — cannot copy: /m);
    expect(stdout.trimEnd().split("\n").at(-1)).toBe("COPIED: 2");
    expect(rendersJson("mobile").renders.map(e => e.state)).toEqual(["error"]);
    expect(rendersJson("web").renders).toHaveLength(1);
    expect(existsSync(tree("mobile", "__renders", "routes.json"))).toBe(true);
  });

  it("refuses a --main with no .git entry", () => {
    rmSync(join(m, ".git"), { recursive: true });
    const { status, stdout, stderr } = run(SMOKE);
    expect(status).toBe(2);
    expect(stdout).toBe("");
    expect(stderr).toMatch(/\.git/);
  });
});
