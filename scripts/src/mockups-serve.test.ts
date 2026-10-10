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
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  renameSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { request as httpRequest } from "node:http";
import { connect } from "node:net";
import { tmpdir } from "node:os";
import {
  dirname,
  join,
} from "node:path";
import { runInNewContext } from "node:vm";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
} from "vitest";
import { parse as parseYaml } from "yaml";

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
    [
      "200e",
      "Archive",
      "200-orders",
      "/orders/archive",
      "orders/archive",
      true,
    ],
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
  "orders/[id]/index--error.html": "order detail error page",
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
  stderr: () => string;
  exited: Promise<number | null>;
}

function start(args = ["--root", root]): Promise<Server> {
  const proc = spawn("node", [SCRIPT, ...args], { cwd: repo });
  child = proc;
  let out = "";
  let err = "";
  proc.stderr.on("data", chunk => {
    err += String(chunk);
  });
  const exited = new Promise<number | null>(done => {
    proc.on("exit", code => done(code));
  });
  return new Promise((resolve, reject) => {
    proc.stdout.on("data", chunk => {
      out += String(chunk);
      const line = out.split("\n")[0];
      if (out.includes("\n") && line !== undefined) {
        resolve({
          url: line.replace(/^URL: /, ""),
          stdout: () => out,
          stderr: () => err,
          exited,
        });
      }
    });
    proc.on("exit", code => reject(new Error(`exited ${code} before URL`)));
  });
}

/** fetch normalises `..` away, so send the raw request line; the status. */
function rawGet(base: string, path: string, host?: string): Promise<number> {
  const port = Number(new URL(base).port);
  return new Promise((resolve, reject) => {
    const socket = connect(port, "127.0.0.1", () => {
      socket.write(
        `GET ${path} HTTP/1.1\r\nHost: ${
          host ?? `127.0.0.1:${port}`
        }\r\nConnection: close\r\n\r\n`,
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

/** A request with headers fetch would not let a test set; the status. */
function send(
  base: string,
  method: string,
  path: string,
  headers: Record<string, string>,
  body = "",
): Promise<number> {
  return new Promise((resolve, reject) => {
    const req = httpRequest(
      {
        host: "127.0.0.1",
        port: Number(new URL(base).port),
        method,
        path,
        headers: { connection: "close", ...headers },
      },
      res => {
        res.resume();
        res.on("end", () => resolve(res.statusCode ?? 0));
      },
    );
    req.on("error", reject);
    req.end(body);
  });
}

const COMMENT = JSON.stringify({
  path: "/orders/7",
  state: "",
  selector: "#total",
  text: "Bigger",
});

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

  it("serves the placeholder of a fixed route with no file, never [id]", async () => {
    const { url } = await start();
    const res = await fetch(new URL("/orders/archive", url));
    expect(res.status).toBe(200);
    const body = await res.text();
    expect(body).toContain("200e");
    expect(body).toContain("Not rendered yet");
    expect(body).not.toContain("order detail page");
    expect((await fetch(new URL("/orders/archive?state=error", url))).status)
      .toBe(404);
    expect(await (await fetch(new URL("/orders/7?state=error", url))).text())
      .toContain("order detail error page");
  });

  it("refuses a foreign Host, Origin or a non-JSON POST", async () => {
    const server = await start();
    const port = new URL(server.url).port;
    expect(await rawGet(server.url, "/", `evil.example:${port}`)).toBe(403);
    expect(await rawGet(server.url, "/", "127.0.0.1:1")).toBe(403);
    expect(await rawGet(server.url, "/", `localhost:${port}`)).toBe(200);
    const json = {
      host: `127.0.0.1:${port}`,
      "content-type": "application/json",
    };
    expect(
      await send(server.url, "POST", "/comment", {
        ...json,
        "content-type": "text/plain",
      }, COMMENT),
    )
      .toBe(415);
    expect(
      await send(server.url, "POST", "/comment", {
        ...json,
        origin: "http://evil.example",
      }, COMMENT),
    )
      .toBe(403);
    expect(
      await send(server.url, "POST", "/done", {
        ...json,
        host: `evil.example:${port}`,
      }, "{}"),
    )
      .toBe(403);
    expect(
      await send(server.url, "POST", "/done", {
        ...json,
        "content-type": "text/plain",
      }, "{}"),
    )
      .toBe(415);
    expect(existsSync(join(root, "__mockups", "comments.yaml"))).toBe(false);
    expect(
      await send(server.url, "POST", "/comment", {
        ...json,
        origin: `http://localhost:${port}`,
      }, COMMENT),
    )
      .toBe(204);
    expect((await fetch(server.url)).status).toBe(200);
  });

  it("serves nothing under __mockups/ in any case", async () => {
    const { url } = await start();
    write("__mockups/comments.yaml", "- id: c001\n");
    for (const path of ["/__MOCKUPS/comments.yaml", "/__Mockups/routes.json"]) {
      expect((await fetch(new URL(path, url))).status).toBe(404);
    }
  });

  it("injects an overlay that lets a form's submit control submit", async () => {
    const { url } = await start();
    const body = await (await fetch(url)).text();
    expect(body).toContain("input[type=submit]");
    expect(body).toContain("control.form");
    expect(body).toMatch(/fetch\("\/done", \{[^}]*application\/json/);
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
    expect(yaml).not.toMatch(/^ {2}path: /m);
    expect(yaml).toContain("  code: \"200b\"");
    expect(yaml).toContain("  route: \"/orders/:id\"");
    expect(yaml).toContain("  status: open");
    expect(yaml).toContain("  applied_at: null");
  });

  it("writes every comment as a YAML string that parses back", async () => {
    const { url } = await start();
    const texts = [
      "del \u007f",
      "c1 \u0080 \u0085 \u009f",
      "breaks \u2028 \u2029",
      "bom \ufeff",
      "nonchars \ufffe \uffff",
      "lone \ud800 and \udfff",
      "pair \ud83d\ude00 kept",
    ];
    for (const text of texts) {
      const res = await fetch(new URL("/comment", url), {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ path: "/", state: "", selector: "p", text }),
      });
      expect(res.status).toBe(204);
    }
    const file = readFileSync(join(root, "__mockups", "comments.yaml"), "utf8");
    expect(file).not.toMatch(
      /[\u007f-\u009f\u2028\u2029\ufeff\ufffe\uffff]|[\ud800-\udbff](?![\udc00-\udfff])|(?<![\ud800-\udbff])[\udc00-\udfff]/,
    );
    const parsed = parseYaml(file) as Array<{ text: string; }>;
    expect(parsed.map(c => c.text)).toEqual(texts);
  });

  it("answers POST /done with 204 and exits 0", async () => {
    const server = await start();
    const res = await fetch(new URL("/done", server.url), {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "{}",
    });
    expect(res.status).toBe(204);
    expect(await server.exited).toBe(0);
    const yaml = readFileSync(join(root, "__mockups", "comments.yaml"), "utf8");
    expect(yaml).toMatch(/^# done: /m);
  });

  it("answers a malformed or //-led target and lives on", async () => {
    const { url } = await start();
    expect(await rawGet(url, "//[")).toBe(404);
    expect(await rawGet(url, "//x/orders")).toBe(404);
    expect(await rawGet(url, "/%E0%A4%A")).toBe(400);
    expect(await rawGet(url, "*")).toBe(400);
    expect((await fetch(url)).status).toBe(200);
  });

  it("answers 500 when a comment cannot be written, and lives on", async () => {
    const { url } = await start();
    mkdirSync(join(root, "__mockups", "comments.yaml"));
    const res = await fetch(new URL("/comment", url), {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: COMMENT,
    });
    expect(res.status).toBe(500);
    expect((await fetch(url)).status).toBe(200);
  });

  it("names the screen a [param] path resolves to", async () => {
    const { url } = await start();
    const body = await (await fetch(new URL("/orders/7", url))).text();
    expect(body).toContain("\"code\":\"200b\"");
    expect(body).toContain("\"screen\":\"Order details\"");
  });

  it("lets Alt/Option-click comment on a link or a submit control", async () => {
    const { url } = await start();
    const body = await (await fetch(url)).text();
    expect(body).toContain("e.altKey");
    expect(body).toContain("Alt/Option-click a link or button");
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

describe("serve.mjs --renders", () => {
  const scratch = () => join(repo, "docs", "scratchpad", "demo");
  const renderRoot = (platform: string) => join(scratch(), "renders", platform);
  const mockRoot = (platform: string) => join(scratch(), "mockups", platform);

  function put(file: string, text: string) {
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, text);
  }

  function renderTree(platform: string) {
    const dir = renderRoot(platform);
    const screens = ROUTES.screens.map(s => ({ ...s }));
    put(
      join(dir, "__renders", "routes.json"),
      JSON.stringify({ project: "demo", platform, screens }),
    );
    const entry = (code: string, state: string, file: string) => ({
      code,
      state,
      route: code === "200a" ? "/orders" : "/orders/:id",
      file,
      plan: "demo-plan",
      date: "2026-10-09T00:00:00.000Z",
    });
    put(
      join(dir, "__renders", "renders.json"),
      JSON.stringify({
        project: "demo",
        platform,
        renders: [
          entry("200a", "default", "orders/index.png"),
          entry("200b", "default", "orders/[id]/index.png"),
          entry("200b", "error", "orders/[id]/index--error.png"),
        ],
      }),
    );
    put(join(dir, "orders", "index.png"), "PNG-LIST");
    put(join(dir, "orders", "[id]", "index.png"), "PNG-DETAIL");
    put(join(dir, "orders", "[id]", "index--error.png"), "PNG-ERROR");
  }

  function startRenders(platform: string, extra: string[] = []) {
    return start([
      "--renders",
      "--root",
      renderRoot(platform),
      "--mockups",
      mockRoot(platform),
      ...extra,
    ]);
  }

  beforeEach(() => {
    renderTree("mobile");
    renderTree("web");
    put(
      join(mockRoot("mobile"), "__mockups", "routes.json"),
      JSON.stringify({ ...ROUTES, platform: "mobile" }),
    );
    put(
      join(mockRoot("mobile"), "orders", "[id]", "index.html"),
      "<!doctype html><html><body><p>mobile mockup</p></body></html>\n",
    );
    put(
      join(mockRoot("mobile"), "orders", "[id]", "index--error.html"),
      "<!doctype html><html><body><p>mobile mockup error</p></body></html>\n",
    );
  });

  it("sets the mockup frame beside the image on mobile", async () => {
    const { url } = await startRenders("mobile");
    const body = await (await fetch(new URL("/orders/7", url))).text();
    expect(body).toContain("<iframe id=\"mockup\"");
    expect(body).toContain("src=\"/__mockups/orders/7\"");
    expect(body).toContain("src=\"/orders/%5Bid%5D/index.png\"");
    expect(body).toContain("<!-- mockup-review-overlay -->");
    const error = await (await fetch(new URL("/orders/7?state=error", url)))
      .text();
    expect(error).toContain("src=\"/__mockups/orders/7?state=error\"");
    expect(error).toContain("index--error.png");
    expect(error).toContain("\"states\":[\"error\"]");
    const frame = await fetch(new URL("/__mockups/orders/7?state=error", url));
    expect(await frame.text()).toContain("mobile mockup error");
    const image = await fetch(new URL("/orders/%5Bid%5D/index.png", url));
    expect(image.status).toBe(200);
    expect(image.headers.get("content-type")).toBe("image/png");
    expect(await image.text()).toBe("PNG-DETAIL");
  });

  it("shows the render alone where no mockup exists", async () => {
    const { url } = await startRenders("mobile");
    const body = await (await fetch(new URL("/orders", url))).text();
    expect(body).toContain("src=\"/orders/index.png\"");
    expect(body).not.toContain("<iframe");
  });

  it("links the peer route in a new window once the peer file exists", async () => {
    const peer = join(scratch(), "mockups-web.url");
    const { url } = await startRenders("web", ["--peer-file", peer]);
    const before = await (await fetch(new URL("/orders", url))).text();
    expect(before).toContain("\"peer\":null");
    writeFileSync(peer, "http://127.0.0.1:9/\n");
    const after = await (await fetch(new URL("/orders?x=1", url))).text();
    expect(after).toContain("\"peer\":\"http://127.0.0.1:9/orders\"");
    expect(after).toContain("peer.target = \"_blank\"");
    const state = await (await fetch(new URL("/orders/7?state=error", url)))
      .text();
    expect(state).toContain(
      "\"peer\":\"http://127.0.0.1:9/orders/7?state=error\"",
    );
    expect(state).not.toContain("<iframe");
  });

  it("gives no link for a peer file with a non-loopback URL", async () => {
    const peer = join(scratch(), "mockups-web.url");
    writeFileSync(peer, "http://evil.example:9/\n");
    const { url } = await startRenders("web", ["--peer-file", peer]);
    const body = await (await fetch(new URL("/orders", url))).text();
    expect(body).toContain("\"peer\":null");
  });

  it("writes its own URL to --url-file", async () => {
    const file = join(scratch(), "renders-web.url");
    const server = await startRenders("web", ["--url-file", file]);
    expect(readFileSync(file, "utf8").trim()).toBe(server.url);
  });

  it("replaces a symlink at --url-file rather than writing through it", async () => {
    const target = join(repo, "victim.txt");
    writeFileSync(target, "untouched\n");
    const file = join(scratch(), "renders-web.url");
    symlinkSync(target, file);
    const server = await startRenders("web", ["--url-file", file]);
    expect(readFileSync(target, "utf8")).toBe("untouched\n");
    expect(lstatSync(file).isSymbolicLink()).toBe(false);
    expect(readFileSync(file, "utf8").trim()).toBe(server.url);
  });

  it("refuses a --url-file outside docs/scratchpad/", () => {
    const result = spawnSync(
      "node",
      [
        SCRIPT,
        "--renders",
        "--root",
        renderRoot("web"),
        "--url-file",
        join(repo, "url.txt"),
      ],
      { cwd: repo, encoding: "utf8" },
    );
    expect(result.status).not.toBe(0);
    expect(result.stderr).toMatch(/--url-file must resolve under/);
  });

  it("404s a state with no image, renders.json, and a traversal", async () => {
    const { url } = await startRenders("mobile");
    expect((await fetch(new URL("/orders?state=error", url))).status).toBe(404);
    expect((await fetch(new URL("/__renders/renders.json", url))).status).toBe(
      404,
    );
    writeFileSync(join(repo, "secret.html"), "secret");
    expect(await rawGet(url, "/__mockups/../../../../secret.html")).toBe(404);
    expect(await rawGet(url, "/__mockups/%2e%2e/%2e%2e/secret.html")).toBe(404);
    expect(await rawGet(url, "/../../../etc/passwd")).toBe(404);
    expect((await fetch(new URL("/__mockups/__mockups/x", url))).status).toBe(
      404,
    );
  });

  it("lists every render at /__renders/", async () => {
    const { url } = await startRenders("mobile");
    const list = await (await fetch(new URL("/__renders/", url))).text();
    expect(list).toContain("200a");
    expect(list).toContain("200b");
    expect(list).toContain("demo-plan");
    expect(list).toContain("2026-10-09T00:00:00.000Z");
    expect(list).not.toContain("100a");
  });

  it("records a comment with the plan of the image", async () => {
    const { url } = await startRenders("web");
    const res = await fetch(new URL("/comment", url), {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        path: "/orders/7",
        state: "error",
        selector: "#render",
        text: "Wrong colour",
      }),
    });
    expect(res.status).toBe(204);
    const file = join(renderRoot("web"), "__renders", "comments.yaml");
    const parsed = parseYaml(readFileSync(file, "utf8")) as Array<
      Record<string, unknown>
    >;
    expect(parsed).toHaveLength(1);
    expect(parsed[0]).toMatchObject({
      code: "200b",
      plan: "demo-plan",
      state: "error",
      status: "open",
    });
    expect(existsSync(join(renderRoot("web"), "__mockups"))).toBe(false);
  });

  it("refuses a render root with no renders.json", () => {
    rmSync(join(renderRoot("web"), "__renders", "renders.json"));
    const result = spawnSync(
      "node",
      [SCRIPT, "--renders", "--root", renderRoot("web")],
      { cwd: repo, encoding: "utf8" },
    );
    expect(result.status).not.toBe(0);
    expect(result.stderr).toMatch(/renders\.json/);
  });

  it("adds the peer link to a mockup page, and nothing without the flags", async () => {
    const peer = join(repo, "docs", "scratchpad", "renders-web.url");
    writeFileSync(peer, "http://localhost:9/\n");
    const linked = await start(["--root", root, "--peer-file", peer]);
    const body = await (await fetch(new URL("/signin?state=error", linked.url)))
      .text();
    expect(body).toContain(
      "\"peer\":\"http://localhost:9/signin?state=error\"",
    );
    child?.kill();
    const plain = await start();
    const bare = await (await fetch(plain.url)).text();
    expect(bare).toContain("\"peer\":null");
    expect(bare).toContain("home page");
  });

  it("moves the top page only for a same-origin single-slash link", async () => {
    const { url } = await startRenders("mobile");
    const html = await (await fetch(new URL("/__mockups/orders/7", url)))
      .text();
    const script = /<script>(document\.addEventListener[\s\S]*?)<\/script>/
      .exec(html)
      ?.[1];
    expect(script).toBeDefined();
    const origin = "http://127.0.0.1:1234";
    let handler: (event: unknown) => void = () => {};
    const top = { location: { href: "unchanged" } };
    runInNewContext(script ?? "", {
      URL,
      location: { href: `${origin}/__mockups/orders/7`, origin },
      window: { top },
      document: {
        addEventListener: (_: string, fn: (event: unknown) => void) => {
          handler = fn;
        },
      },
    });
    const click = (href: string) => {
      let prevented = false;
      handler({
        altKey: false,
        preventDefault: () => {
          prevented = true;
        },
        target: { closest: () => ({ getAttribute: () => href }) },
      });
      return prevented;
    };
    expect(click("//evil.example/x")).toBe(false);
    expect(click("/\\evil.example/x")).toBe(false);
    expect(top.location.href).toBe("unchanged");
    expect(click("/orders/8?state=error")).toBe(true);
    expect(top.location.href).toBe("/orders/8?state=error");
  });

  it("shows no mockup, with a warning, when --mockups has no routes.json", async () => {
    rmSync(join(mockRoot("mobile"), "__mockups", "routes.json"));
    const server = await startRenders("mobile");
    const body = await (await fetch(new URL("/orders/7", server.url))).text();
    expect(body).not.toContain("<iframe");
    expect(body).toContain("src=\"/orders/%5Bid%5D/index.png\"");
    expect((await fetch(new URL("/__mockups/orders/7", server.url))).status)
      .toBe(404);
    expect(server.stderr()).toMatch(/no valid __mockups\/routes\.json/);
  });

  it("sees a routes.json rewritten while it runs", async () => {
    const { url } = await startRenders("web");
    expect((await fetch(new URL("/history", url))).status).toBe(404);
    const dir = renderRoot("web");
    const screens = ROUTES.screens.map(s =>
      s.code === "200a" ? { ...s, route: "/history", path: "history" } : s
    );
    put(
      join(dir, "__renders", "routes.json"),
      JSON.stringify({ project: "demo", platform: "web", screens }),
    );
    put(join(dir, "history", "index.png"), "PNG-HISTORY");
    const moved = await (await fetch(new URL("/history", url))).text();
    expect(moved).toContain("No render yet");
    expect(moved).not.toContain("<img");
    put(
      join(dir, "__renders", "renders.json"),
      JSON.stringify({
        project: "demo",
        platform: "web",
        renders: [{
          code: "200a",
          state: "default",
          route: "/history",
          file: "history/index.png",
          plan: "demo-plan",
          date: "2026-10-09T00:00:00.000Z",
        }],
      }),
    );
    const body = await (await fetch(new URL("/history", url))).text();
    expect(body).toContain("src=\"/history/index.png\"");
    expect((await fetch(new URL("/orders", url))).status).toBe(404);
  });

  it("never shows a moved screen's old image for the screen now at its route", async () => {
    const { url } = await startRenders("web");
    // 200a leaves /orders for /history; 200d takes /orders. renders.json still
    // holds 200a's old entry, and orders/index.png is still on disk.
    const screens = ROUTES.screens.map(s =>
      s.code === "200a"
        ? { ...s, route: "/history", path: "history" }
        : s.code === "200d"
        ? { ...s, route: "/orders", path: "orders" }
        : s
    );
    put(
      join(renderRoot("web"), "__renders", "routes.json"),
      JSON.stringify({ project: "demo", platform: "web", screens }),
    );
    const page = await (await fetch(new URL("/orders", url))).text();
    expect(page).toContain("200d");
    expect(page).toContain("No render yet");
    expect(page).not.toContain("<img");
    expect((await fetch(new URL("/orders/index.png", url))).status).toBe(404);
    expect(existsSync(join(renderRoot("web"), "orders", "index.png"))).toBe(
      true,
    );
    const history = await (await fetch(new URL("/history", url))).text();
    expect(history).toContain("No render yet");
    const list = await (await fetch(new URL("/__renders/", url))).text();
    expect(list).not.toContain("200a");
    expect(list).not.toContain("200d");
    expect(list).toContain("200b");
  });

  it("reads ?state=default as the plain index file on both sides", async () => {
    const { url } = await startRenders("mobile");
    const body = await (await fetch(new URL("/orders/7?state=default", url)))
      .text();
    expect(body).toContain("src=\"/orders/%5Bid%5D/index.png\"");
    expect(body).toContain("<iframe id=\"mockup\"");
    const frame = await fetch(
      new URL("/__mockups/orders/7?state=default", url),
    );
    expect(frame.status).toBe(200);
    expect(await frame.text()).toContain("mobile mockup");
    child?.kill();
    const mockups = await start();
    const page = await fetch(new URL("/signin?state=default", mockups.url));
    expect(page.status).toBe(200);
    expect(await page.text()).toContain("signin page");
  });

  it("keeps a screen's renders when its route only renames a parameter", async () => {
    const screens = ROUTES.screens.map(s =>
      s.code === "200b"
        ? { ...s, route: "/orders/{orderId}", path: "orders/[orderId]" }
        : s
    );
    put(
      join(renderRoot("web"), "__renders", "routes.json"),
      JSON.stringify({ project: "demo", platform: "web", screens }),
    );
    const { url } = await startRenders("web");
    const body = await (await fetch(new URL("/orders/7", url))).text();
    expect(body).toContain("src=\"/orders/%5Bid%5D/index.png\"");
    const image = await fetch(new URL("/orders/%5Bid%5D/index.png", url));
    expect(image.status).toBe(200);
    expect(await image.text()).toBe("PNG-DETAIL");
    const error = await fetch(new URL("/orders/7?state=error", url));
    expect(error.status).toBe(200);
    expect(await error.text()).toContain("index--error.png");
  });

  it("takes a --peer-file in a folder not made yet under a symlinked scratchpad", async () => {
    const real = join(repo, "real-scratchpad");
    renameSync(join(repo, "docs", "scratchpad"), real);
    symlinkSync(real, join(repo, "docs", "scratchpad"));
    const peer = join(scratch(), "later", "mockups-web.url");
    const { url } = await startRenders("web", ["--peer-file", peer]);
    expect(await (await fetch(new URL("/orders", url))).text()).toContain(
      "\"peer\":null",
    );
    put(peer, "http://127.0.0.1:9/\n");
    expect(await (await fetch(new URL("/orders", url))).text()).toContain(
      "\"peer\":\"http://127.0.0.1:9/orders\"",
    );
  });

  it("reads the mockups routes.json again at each request", async () => {
    const file = join(mockRoot("mobile"), "__mockups", "routes.json");
    const saved = readFileSync(file, "utf8");
    rmSync(file);
    const { url } = await startRenders("mobile");
    const before = await (await fetch(new URL("/orders/7", url))).text();
    expect(before).not.toContain("<iframe");
    writeFileSync(file, saved);
    const after = await (await fetch(new URL("/orders/7", url))).text();
    expect(after).toContain("<iframe id=\"mockup\"");
    expect((await fetch(new URL("/__mockups/orders/7", url))).status).toBe(200);
    rmSync(file);
    expect((await fetch(new URL("/__mockups/orders/7", url))).status).toBe(404);
  });

  it("removes its --url-file on Done and on exit", async () => {
    const file = join(scratch(), "renders-web.url");
    const done = await startRenders("web", ["--url-file", file]);
    expect(existsSync(file)).toBe(true);
    const res = await fetch(new URL("/done", done.url), {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "{}",
    });
    expect(res.status).toBe(204);
    expect(await done.exited).toBe(0);
    expect(existsSync(file)).toBe(false);
    const killed = await startRenders("web", ["--url-file", file]);
    expect(existsSync(file)).toBe(true);
    child?.kill();
    await killed.exited;
    expect(existsSync(file)).toBe(false);
  });
});
