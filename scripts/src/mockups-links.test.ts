/**
 * vwf's mockups `links.mjs`, spawned for real over a temp platform tree: a
 * correct tree passes, every kind of broken href is one BROKEN line, a link to
 * a code with no file yet is correct, and a [param] folder matches any value.
 */
import { spawnSync } from "node:child_process";
import {
  mkdirSync,
  mkdtempSync,
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

const SCRIPT = join(
  import.meta.dirname,
  "..",
  "..",
  "plugins",
  "vwf",
  "skills",
  "mockups",
  "scripts",
  "links.mjs",
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

let repo: string;
let root: string;
beforeEach(() => {
  repo = mkdtempSync(join(tmpdir(), "mockups-links-"));
  root = join(repo, "docs", "scratchpad", "demo", "mockups", "web");
  write("__mockups/routes.json", JSON.stringify(ROUTES, null, 2));
});
afterEach(() => {
  rmSync(repo, { recursive: true, force: true });
});

function write(rel: string, text: string) {
  const file = join(root, ...rel.split("/"));
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, text);
}

function html(...hrefs: string[]): string {
  const links = hrefs.map(href => `<a href="${href}">x</a>`).join("\n");
  return `<!doctype html><html><body>\n${links}\n</body></html>\n`;
}

function correctTree() {
  write("index.html", html("/signin", "#", "/orders"));
  write("signin/index.html", html("/signin?state=error", "/", "#main"));
  write("signin/index--error.html", html("/signin"));
  write("orders/index.html", html("/orders/1042", "/200c-receipt"));
  write("orders/[id]/index.html", `<a href='/orders'>back</a>`);
  write("__mockups/stray.html", html("relative.html"));
}

function run() {
  const result = spawnSync("node", [SCRIPT, "--root", root], {
    cwd: repo,
    encoding: "utf8",
  });
  return {
    status: result.status,
    stdout: result.stdout,
    stderr: result.stderr,
  };
}

describe("links.mjs", () => {
  it("passes a correct tree with one LINKS OK line", () => {
    correctTree();
    const { status, stdout } = run();
    expect(stdout).toBe("LINKS OK: 10 links in 5 pages\n");
    expect(status).toBe(0);
  });

  it("names every broken href once and exits 1", () => {
    correctTree();
    write(
      "orders/index.html",
      html(
        "/orders/1042",
        "/nowhere",
        "/signin?state=empty",
        "signin",
        "http://example.com/",
        "mailto:a@b.c",
      ),
    );
    const { status, stdout } = run();
    expect(status).toBe(1);
    const lines = stdout.trimEnd().split("\n");
    expect(lines).toHaveLength(5);
    for (const line of lines) {
      expect(line).toMatch(/^BROKEN: orders\/index\.html -> \S+ — .+$/);
    }
    expect(lines.map(line => line.split(" ")[3])).toEqual([
      "/nowhere",
      "/signin?state=empty",
      "signin",
      "http://example.com/",
      "mailto:a@b.c",
    ]);
  });

  it("counts a link to a code with no file yet as correct", () => {
    write("index.html", html("/200c-receipt", "/orders/7"));
    const { status, stdout } = run();
    expect(stdout).toMatch(/^LINKS OK: 2 links in 1 pages/);
    expect(status).toBe(0);
  });

  it("matches /orders/1042 to the orders/[id] folder", () => {
    write("orders/[id]/index.html", html("/orders/1042", "/orders/abc"));
    write("orders/[id]/index--error.html", html("/orders/1042?state=error"));
    expect(run().status).toBe(0);
  });

  it("never matches a fixed route to its [param] sibling", () => {
    write(
      "orders/[id]/index.html",
      html("/orders/new", "/orders/1?state=error"),
    );
    write("orders/[id]/index--error.html", html("/orders/new?state=error"));
    const { status, stdout } = run();
    expect(status).toBe(1);
    expect(stdout).toBe(
      "BROKEN: orders/[id]/index--error.html -> /orders/new?state=error — "
        + "no state file index--error.html\n",
    );
  });

  it("refuses an href a browser reads as another host", () => {
    for (const href of ["/\\evil.com", "/\t/evil.com", "/\\\\evil.com/"]) {
      write("index.html", html(href));
      const { status, stdout } = run();
      expect(status).toBe(1);
      expect(stdout).toBe(
        `BROKEN: index.html -> ${href} — not a link inside the mockups\n`,
      );
    }
  });

  it("decodes character references before it judges an href", () => {
    for (
      const href of [
        "/&#x2F;evil.com",
        "/&#47;evil.com",
        "/&#047evil.com",
        "/&sol;evil.com",
        "&sol;&sol;evil.com",
        "/&#92;evil.com",
        "/&bsol;evil.com",
        "/&Tab;/evil.com",
        "/&NewLine;/evil.com",
        "&#x0D;//evil.com",
        "http&colon;//evil.com",
      ]
    ) {
      write("index.html", html(href));
      const { status, stdout } = run();
      expect(status, href).toBe(1);
      expect(stdout).toBe(
        `BROKEN: index.html -> ${href} — not a link inside the mockups\n`,
      );
    }
  });

  it("fails closed on an & that is not a known reference", () => {
    for (const href of ["/&foo;/evil.com", "/signin&x", "/signin&amp"]) {
      write("index.html", html(href));
      const { status, stdout } = run();
      expect(status, href).toBe(1);
      expect(stdout).toBe(
        `BROKEN: index.html -> ${href} — an unknown character reference\n`,
      );
    }
    write(
      "index.html",
      html("&#47;signin", "/orders&sol;new", "/signin?a=1&amp;b=2"),
    );
    expect(run().stdout).toBe("LINKS OK: 3 links in 1 pages\n");
  });

  it("reads unquoted hrefs too", () => {
    write("index.html", "<a href=/signin>a</a> <a href=nowhere>b</a>\n");
    const { status, stdout } = run();
    expect(status).toBe(1);
    expect(stdout).toBe(
      "BROKEN: index.html -> nowhere — not root-absolute\n",
    );
    write("index.html", "<a href=/orders/new>a</a><a href=/200c-receipt>b</a>");
    expect(run().stdout).toBe("LINKS OK: 2 links in 1 pages\n");
  });

  it("refuses a routes.json whose path is reserved or climbs", () => {
    for (const path of ["__MOCKUPS/x", "a/../b", "./a"]) {
      write(
        "__mockups/routes.json",
        JSON.stringify({
          ...ROUTES,
          screens: [{ ...ROUTES.screens[0], path }],
        }),
      );
      const { status, stderr } = run();
      expect(status).toBe(2);
      expect(stderr).toMatch(/path/);
    }
  });

  it("refuses a root with no routes.json", () => {
    rmSync(join(root, "__mockups"), { recursive: true });
    write("index.html", html("/"));
    const { status, stderr } = run();
    expect(status).toBe(2);
    expect(stderr).toMatch(/routes\.json/);
  });
});
