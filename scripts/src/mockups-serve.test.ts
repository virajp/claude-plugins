/**
 * vwf's mockups `serve.mjs`, spawned for real over a temp platform tree and
 * driven over HTTP: the one URL line, routes to files, [param] folders, state
 * files, the in-memory list and placeholder pages, the root confinement, the
 * comment and done endpoints, and the refusals to start.
 */
import {
  type ChildProcess,
  spawn,
  spawnSync,
} from "node:child_process";
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
import { connect } from "node:net";
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
  "serve.mjs",
);

const ROUTES = {
  project: "demo",
  platform: "web",
  screens: [
    ["100a", "Home", "100-signin", "/", "", true],
    ["100b", "Sign in", "100-signin", "/signin", "signin", true],
    ["200a", "Orders", "200-orders", "/orders", "orders", true],
    ["200b", "Order details", "200-orders", "/orders/:id", "orders/[id]", true],
    ["200c", "Receipt", "200-orders", "/200c-receipt", "200c-receipt", false],
    ["200d", "New order", "200-orders", "/orders/new", "orders/new", true],
  ]
    .map(([code, screen, flow, route, path, routed]) => ({
      code,
      screen,
      slug: String(screen).toLowerCase().replace(/ /g, "-"),
      flow,
      route,
      path,
      routed,
    })),
};

const PAGES: Record<string, string> = {
  "index.html": "home page",
  "signin/index.html": "signin page",
  "signin/index--error.html": "signin error page",
  "orders/index.html": "orders page",
  "orders/[id]/index.html": "order detail page",
  "orders/new/index.html": "new order page",
};

let repo: string;
let root: string;
let child: ChildProcess | null = null;

beforeEach(() => {
  repo = realpathSync(mkdtempSync(join(tmpdir(), "mockups-serve-")));
  root = join(repo, "docs", "scratchpad", "demo", "mockups", "web");
  write("__mockups/routes.json", JSON.stringify(ROUTES, null, 2));
  for (const [rel, text] of Object.entries(PAGES)) {
    write(rel, `<!doctype html><html><body><p>${text}</p></body></html>\n`);
  }
});
afterEach(() => {
  child?.kill();
  child = null;
  rmSync(repo, { recursive: true, force: true });
});

function write(rel: string, text: string) {
  const file = join(root, ...rel.split("/"));
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, text);
}

interface Server {
  url: string;
  stdout: () => string;
  exited: Promise<number | null>;
}

function start(args = ["--root", root]): Promise<Server> {
  const proc = spawn("node", [SCRIPT, ...args], { cwd: repo });
  child = proc;
  let out = "";
  const exited = new Promise<number | null>(done => {
    proc.on("exit", code => done(code));
  });
  return new Promise((resolve, reject) => {
    proc.stdout.on("data", chunk => {
      out += String(chunk);
      const line = out.split("\n")[0];
      if (out.includes("\n") && line !== undefined) {
        resolve({ url: line.replace(/^URL: /, ""), stdout: () => out, exited });
      }
    });
    proc.on("exit", code => reject(new Error(`exited ${code} before URL`)));
  });
}

/** fetch normalises `..` away, so send the raw request line; the status. */
function rawGet(base: string, path: string): Promise<number> {
  return new Promise((resolve, reject) => {
    const socket = connect(Number(new URL(base).port), "127.0.0.1", () => {
      socket.write(
        `GET ${path} HTTP/1.1\r\nHost: x\r\nConnection: close\r\n\r\n`,
      );
    });
    let data = "";
    socket.on("data", chunk => {
      data += String(chunk);
    });
    socket.on("end", () => resolve(Number(data.split(" ")[1])));
    socket.on("error", reject);
  });
}

describe("serve.mjs", () => {
  it("prints exactly one URL line on 127.0.0.1", async () => {
    const server = await start();
    expect(server.stdout()).toMatch(/^URL: http:\/\/127\.0\.0\.1:\d+\/\n$/);
    expect(new URL(server.url).hostname).toBe("127.0.0.1");
  });

  it("serves / as index.html with the overlay, the file unchanged", async () => {
    const { url } = await start();
    const res = await fetch(url);
    expect(res.status).toBe(200);
    const body = await res.text();
    expect(body).toContain("home page");
    expect(body).toContain("<!-- mockup-review-overlay -->");
    expect(readFileSync(join(root, "index.html"), "utf8")).not.toContain(
      "<script",
    );
  });

  it("serves a [param] folder for any value, a static folder first", async () => {
    const { url } = await start();
    expect(await (await fetch(new URL("/orders/7", url))).text()).toContain(
      "order detail page",
    );
    expect(await (await fetch(new URL("/orders/new", url))).text()).toContain(
      "new order page",
    );
  });

  it("serves a state file, and 404 for a state with no file", async () => {
    const { url } = await start();
    const res = await fetch(new URL("/signin?state=error", url));
    const body = await res.text();
    expect(body).toContain("signin error page");
    expect(body).toContain("\"states\":[\"error\"]");
    expect((await fetch(new URL("/signin?state=empty", url))).status).toBe(404);
  });

  it("lists every code at /__mockups/ and serves nothing else under it", async () => {
    const { url } = await start();
    const list = await (await fetch(new URL("/__mockups/", url))).text();
    for (const screen of ROUTES.screens) {
      expect(list).toContain(screen.code);
    }
    expect(list).toContain("not rendered yet");
    expect((await fetch(new URL("/__mockups/routes.json", url))).status).toBe(
      404,
    );
  });

  it("serves a placeholder for a code with no file", async () => {
    const { url } = await start();
    const res = await fetch(new URL("/200c-receipt", url));
    expect(res.status).toBe(200);
    const body = await res.text();
    expect(body).toContain("200c");
    expect(body).toContain("200-orders");
    expect(body).toContain("Not rendered yet");
    expect(body).toContain("href=\"/__mockups/\"");
    expect(existsSync(join(root, "200c-receipt"))).toBe(false);
  });

  it("serves nothing outside the root", async () => {
    const { url } = await start();
    writeFileSync(join(repo, "secret.html"), "secret");
    symlinkSync(join(repo, "secret.html"), join(root, "leak.html"));
    expect(await rawGet(url, "/../../../../../secret.html")).toBe(404);
    expect(await rawGet(url, "/%2e%2e/%2e%2e/secret.html")).toBe(404);
    expect((await fetch(new URL("/leak.html", url))).status).toBe(404);
    expect((await fetch(new URL("/nowhere", url))).status).toBe(404);
  });

  it("records a comment with its code and route, 400 on a missing field", async () => {
    const { url } = await start();
    const post = (body: unknown) =>
      fetch(new URL("/comment", url), {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
    const ok = await post({
      path: "/orders/7",
      state: "",
      selector: "#total",
      text: "Bigger",
    });
    expect(ok.status).toBe(204);
    expect(
      (await post({ path: "/orders/7", selector: "#total", text: "x" })).status,
    )
      .toBe(400);
    const yaml = readFileSync(join(root, "__mockups", "comments.yaml"), "utf8");
    expect(yaml.match(/^- id: /gm)).toHaveLength(1);
    expect(yaml).toContain("  code: \"200b\"");
    expect(yaml).toContain("  route: \"/orders/:id\"");
    expect(yaml).toContain("  status: open");
    expect(yaml).toContain("  applied_at: null");
  });

  it("answers POST /done with 204 and exits 0", async () => {
    const server = await start();
    const res = await fetch(new URL("/done", server.url), { method: "POST" });
    expect(res.status).toBe(204);
    expect(await server.exited).toBe(0);
    const yaml = readFileSync(join(root, "__mockups", "comments.yaml"), "utf8");
    expect(yaml).toMatch(/^# done: /m);
  });

  it("refuses a root outside docs/scratchpad/", () => {
    const outside = join(repo, "elsewhere");
    mkdirSync(join(outside, "__mockups"), { recursive: true });
    writeFileSync(
      join(outside, "__mockups", "routes.json"),
      JSON.stringify(ROUTES),
    );
    const result = spawnSync("node", [SCRIPT, "--root", outside], {
      cwd: repo,
      encoding: "utf8",
    });
    expect(result.status).not.toBe(0);
    expect(result.stdout).toBe("");
    expect(result.stderr).toMatch(/docs\/scratchpad/);
  });

  it("refuses a root with no routes.json", () => {
    rmSync(join(root, "__mockups"), { recursive: true });
    const result = spawnSync("node", [SCRIPT, "--root", root], {
      cwd: repo,
      encoding: "utf8",
    });
    expect(result.status).not.toBe(0);
    expect(result.stderr).toMatch(/routes\.json/);
  });
});
