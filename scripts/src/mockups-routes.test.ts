/**
 * vwf's mockups `routes.mjs`, spawned for real in a temp repo: the route map it
 * writes from every flow's Screens table of one platform, the unrouted
 * fallback, the errors that write nothing, and a table read by column name.
 */
import { spawnSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
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
  "mockups",
  "scripts",
  "routes.mjs",
);

const HEADER =
  "| Code | Screen | Route | Reads (operationId) | States (loading/error/empty) | Actions | Form validation |\n"
  + "| ---- | ------ | ----- | ------------------- | ---------------------------- | ------- | --------------- |\n";

function flowDoc(rows: string[], header = HEADER): string {
  return `# Flow\n\n## Screens → app\n\n${header}${
    rows.join("\n")
  }\n\n### Next\n`;
}

let repo: string;
beforeEach(() => {
  repo = mkdtempSync(join(tmpdir(), "mockups-routes-"));
});
afterEach(() => {
  rmSync(repo, { recursive: true, force: true });
});

function writeFlow(flow: string, platform: string, text: string) {
  const dir = join(repo, "docs", "blueprint", "flows", "demo", flow);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, `${platform}.md`), text);
}

function run(platform = "web") {
  const result = spawnSync(
    "node",
    [SCRIPT, "--project", "demo", "--platform", platform],
    { cwd: repo, encoding: "utf8" },
  );
  return {
    status: result.status,
    stdout: result.stdout,
    stderr: result.stderr,
  };
}

const OUT = [
  "docs",
  "scratchpad",
  "demo",
  "mockups",
  "web",
  "__mockups",
  "routes.json",
];

interface Screen {
  code: string;
  screen: string;
  slug: string;
  flow: string;
  route: string;
  path: string;
  routed: boolean;
}

function routesJson(): {
  project: string;
  platform: string;
  screens: Screen[];
} {
  return JSON.parse(readFileSync(join(repo, ...OUT), "utf8"));
}

function twoFlows() {
  writeFlow(
    "100-signin",
    "web",
    flowDoc([
      "| `100a` | Home | `/` | — | n/a | Sign in | — |",
      "| `100b` | Sign in | `/signin` | createSession | error | Submit | email |",
    ]),
  );
  writeFlow(
    "200-orders",
    "web",
    flowDoc([
      "| 200a | Orders | /orders | listOrders | empty | Open | — |",
      "| 200b | Order details | `/orders/:id` | getOrder | error | Back | — |",
      "| 200c | Receipt preview | — | getReceipt | n/a | Close | — |",
      "| [100b](../100-signin/web.md#screens) | Sign in | `/signin` | — | — | — | — |",
    ]),
  );
  writeFlow(
    "200-orders",
    "ios",
    flowDoc(["| 200a | Orders | — | — | — | — | — |"]),
  );
}

describe("routes.mjs", () => {
  it("maps every code of the platform into one routes.json", () => {
    twoFlows();
    const { status, stdout, stderr } = run();
    expect(stderr).toBe("");
    expect(status).toBe(0);
    const lines = stdout.trimEnd().split("\n");
    expect(lines[0]).toMatch(/^ROUTES: 5 screens in 2 flows/);
    expect(lines.filter(line => line.startsWith("NO ROUTE:"))).toEqual([
      "NO ROUTE: 200c Receipt preview",
    ]);
    const json = routesJson();
    expect(json.project).toBe("demo");
    expect(json.platform).toBe("web");
    expect(json.screens.map(s => s.code)).toEqual([
      "100a",
      "100b",
      "200a",
      "200b",
      "200c",
    ]);
    const by = Object.fromEntries(json.screens.map(s => [s.code, s]));
    expect(by["100a"]).toMatchObject({
      route: "/",
      path: "",
      routed: true,
      flow: "100-signin",
    });
    expect(by["100b"]).toMatchObject({
      route: "/signin",
      path: "signin",
      slug: "sign-in",
    });
    expect(by["200b"]).toMatchObject({
      route: "/orders/:id",
      path: "orders/[id]",
      flow: "200-orders",
      slug: "order-details",
    });
    expect(by["200c"]).toMatchObject({
      route: "/200c-receipt-preview",
      path: "200c-receipt-preview",
      routed: false,
    });
    expect(readFileSync(join(repo, ...OUT), "utf8")).toMatch(
      /^\{\n {2}"project"/,
    );
  });

  it("refuses two codes with one route and writes nothing", () => {
    writeFlow(
      "100-signin",
      "web",
      flowDoc([
        "| 100a | Home | `/` | — | — | — | — |",
        "| 100b | Landing | `/` | — | — | — | — |",
      ]),
    );
    const { status, stderr } = run();
    expect(status).not.toBe(0);
    expect(stderr).toMatch(/route \/ is held by two codes/);
    expect(existsSync(join(repo, ...OUT))).toBe(false);
  });

  it("refuses one code defined twice", () => {
    writeFlow(
      "100-signin",
      "web",
      flowDoc(["| 100a | Home | `/` | — | — | — | — |"]),
    );
    writeFlow(
      "200-orders",
      "web",
      flowDoc(["| 100a | Orders | `/orders` | — | — | — | — |"]),
    );
    const { status, stderr } = run();
    expect(status).not.toBe(0);
    expect(stderr).toMatch(/code 100a is defined twice/);
  });

  it("refuses a :id and a {id} route to one folder", () => {
    writeFlow(
      "200-orders",
      "web",
      flowDoc([
        "| 200a | A | `/orders/:id` | — | — | — | — |",
        "| 200b | B | `/orders/{orderId}` | — | — | — | — |",
      ]),
    );
    expect(run().status).not.toBe(0);
  });

  it("refuses a route with a . or .. segment or under __mockups", () => {
    for (const route of ["/a/../b", "/./a", "/__MOCKUPS/x", "/__mockups"]) {
      writeFlow(
        "100-signin",
        "web",
        flowDoc([`| 100a | Home | \`${route}\` | — | — | — | — |`]),
      );
      const { status, stderr } = run();
      expect(status).not.toBe(0);
      expect(stderr).toMatch(/route .* of 100a/);
      expect(existsSync(join(repo, ...OUT))).toBe(false);
    }
  });

  it("reads a table by column name, not by position", () => {
    twoFlows();
    run();
    const first = routesJson();
    rmSync(join(repo, "docs", "blueprint"), { recursive: true });
    const header =
      "| Route | Actions | Screen | Code |\n| --- | --- | --- | --- |\n";
    writeFlow(
      "100-signin",
      "web",
      flowDoc([
        "| `/` | Sign in | Home | `100a` |",
        "| `/signin` | Submit | Sign in | `100b` |",
      ], header),
    );
    writeFlow(
      "200-orders",
      "web",
      flowDoc([
        "| /orders | Open | Orders | 200a |",
        "| `/orders/:id` | Back | Order details | 200b |",
        "| — | Close | Receipt preview | 200c |",
      ], header),
    );
    const { status } = run();
    expect(status).toBe(0);
    expect(routesJson()).toEqual(first);
  });

  it("fails when the platform has no flow file", () => {
    twoFlows();
    const { status, stderr } = run("android");
    expect(status).not.toBe(0);
    expect(stderr).toMatch(/no android\.md/);
  });
});
