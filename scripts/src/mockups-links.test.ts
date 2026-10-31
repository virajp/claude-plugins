/**
 * vwf's mockups `links.mjs`, spawned for real over a temp platform tree: a
 * correct tree passes, every kind of broken href is one BROKEN line, a link to
 * a code with no file yet is correct, a [param] folder matches any value, a
 * missing state page falls back to the default page, a form action is checked
 * like an href, and an overlay link is checked against its parent's route.
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
        "/200c-receipt?state=empty",
        "signin",
        "http://example.com/",
        "mailto:a@b.c",
      ),
    );
    const { status, stdout } = run();
    expect(status).toBe(1);
    const lines = stdout.trimEnd().split("\n");
    expect(lines).toHaveLength(4);
    for (const line of lines) {
      expect(line).toMatch(/^BROKEN: orders\/index\.html -> \S+ — .+$/);
    }
    expect(lines.map(line => line.split(" ")[3])).toEqual([
      "/nowhere",
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

  it("takes a state of a fixed route with no file as its placeholder", () => {
    // The server answers /orders/new?state=error with the placeholder of the
    // fixed route, never the [id] sibling's error page (mockups-serve.test.ts).
    write(
      "orders/[id]/index.html",
      html("/orders/new", "/orders/1?state=error"),
    );
    write("orders/[id]/index--error.html", html("/orders/new?state=error"));
    expect(run().status).toBe(0);
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

  it("fails closed on a named reference it does not know", () => {
    for (const href of ["/&foo;/evil.com", "/signin&x;", "/&Foo9;evil.com"]) {
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

  it("reads any other & as a literal &", () => {
    write("signin/index--error.html", html("/"));
    write("index.html", html("/signin?a=1&state=error", "/signin?a&b=2"));
    const { status, stdout } = run();
    expect(status).toBe(0);
    expect(stdout).toBe("LINKS OK: 3 links in 2 pages\n");
  });

  it("decodes a legacy name with no ; as a browser does in an attribute", () => {
    write("signin/index--error.html", html("/"));
    for (
      const [href, reason] of [
        ["/signin&amp", "no such route"],
        ["/signin?state=error&lt", "malformed state error<"],
      ] as const
    ) {
      write("index.html", html(href));
      const { status, stdout } = run();
      expect(status, href).toBe(1);
      expect(stdout).toBe(`BROKEN: index.html -> ${href} — ${reason}\n`);
    }
    write(
      "index.html",
      html(
        "/signin?state=error&lt=1",
        "/signin?state=error&ltx",
        "/signin&copy;",
      ),
    );
    expect(run().stdout).toBe(
      "BROKEN: index.html -> /signin&copy; — no such route\n",
    );
    write(
      "index.html",
      html("/signin?state=error&lt=1", "/signin?a=1&state=error"),
    );
    expect(run().stdout).toBe("LINKS OK: 3 links in 2 pages\n");
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

  it("checks a form action by the same rules as an href", () => {
    write(
      "index.html",
      "<form action=\"/signin\"><button>a</button></form>\n"
        + "<form action='/nowhere'><button>b</button></form>\n"
        + "<form method=\"POST\" action=\"/orders\"><button>c</button></form>\n"
        + "<form action=\"https://evil.example/x\"></form>\n"
        + "<form><button formaction=\"/gone\">d</button></form>\n",
    );
    const { status, stdout } = run();
    expect(status).toBe(1);
    expect(stdout).toBe(
      "BROKEN: index.html -> /nowhere — no such route\n"
        + "BROKEN: index.html -> /orders — a POST form; the review server "
        + "answers GET only\n"
        + "BROKEN: index.html -> https://evil.example/x — not a link inside the "
        + "mockups\n"
        + "BROKEN: index.html -> /gone — no such route\n",
    );
  });

  it("breaks a POST form whatever its action, # and none included", () => {
    write(
      "index.html",
      "<form method=\"post\"><button>a</button></form>\n"
        + "<form method=post action=\"#\"><button>b</button></form>\n"
        + "<form action=\"#\"><button>c</button></form>\n"
        + "<form><button>d</button></form>\n",
    );
    const { status, stdout } = run();
    expect(status).toBe(1);
    expect(stdout).toBe(
      "BROKEN: index.html ->  — a POST form; the review server answers GET "
        + "only\n"
        + "BROKEN: index.html -> # — a POST form; the review server answers GET "
        + "only\n",
    );
  });

  it("reads only the href of a link, never other attributes or text", () => {
    write(
      "index.html",
      "<!-- <a href=\"nowhere\">old</a> -->\n"
        + "<div data-href=\"nowhere\">x</div>\n"
        + "<link rel=\"icon\" href=\"data:,\">\n"
        + "<svg><image href=\"data:image/png;base64,AA==\"/></svg>\n"
        + "<style>a[href=\"nowhere\"]{color:red}</style>\n"
        + "<p>see href=nowhere</p>\n"
        + "<a title=\"a > b\" href=\"/signin\">ok</a>\n",
    );
    expect(run().stdout).toBe("LINKS OK: 1 links in 1 pages\n");
  });

  it("reads an unquoted href to the next space or >", () => {
    write("signin/index--error.html", html("/"));
    write("index.html", "<a href=/signin?state=error>a</a>\n");
    expect(run().stdout).toBe("LINKS OK: 2 links in 2 pages\n");
  });

  it("reads a bare & in a query as a literal &", () => {
    write("orders/[id]/index--error.html", html("/"));
    write("index.html", html("/orders/1?state=error&tab=items"));
    expect(run().stdout).toBe("LINKS OK: 2 links in 2 pages\n");
  });

  it("skips the reserved folder in any case", () => {
    write("__Mockups/x.html", html("relative.html"));
    write("index.html", html("/"));
    expect(run().stdout).toBe("LINKS OK: 1 links in 1 pages\n");
  });

  it("matches a folder only in its exact case", () => {
    write("signin/index.html", html("/"));
    write("orders/new/index.html", html("/"));
    write("index.html", html("/Signin", "/ORDERS/new"));
    const { status, stdout } = run();
    expect(status).toBe(1);
    expect(stdout).toBe(
      "BROKEN: index.html -> /Signin — no such route\n"
        + "BROKEN: index.html -> /ORDERS/new — no such route\n",
    );
  });

  it("maps a numeric reference 0x80-0x9F as a browser does", () => {
    write(
      "__mockups/routes.json",
      JSON.stringify({
        ...ROUTES,
        screens: [
          ...ROUTES.screens,
          { ...ROUTES.screens[0], code: "300a", route: "/€", path: "€" },
        ],
      }),
    );
    write("€/index.html", html("/"));
    write("index.html", html("/&#x80;", "/&#128;"));
    expect(run().stdout).toBe("LINKS OK: 3 links in 2 pages\n");
  });

  it("takes a missing state page as the default page, else the placeholder", () => {
    write("signin/index.html", html("/"));
    write("index.html", html("/signin?state=empty", "/200c-receipt?state=x"));
    expect(run().status).toBe(0);
  });

  it("checks an overlay link against its parent's route", () => {
    write(
      "__mockups/routes.json",
      JSON.stringify({
        ...ROUTES,
        screens: [
          ...ROUTES.screens,
          {
            ...ROUTES.screens[3],
            code: "200f",
            screen: "Cancel order",
            overlay: "200b",
          },
        ],
      }),
    );
    write("orders/[id]/index.html", html("/orders/1?overlay=200f"));
    write(
      "orders/[id]/index--overlay-200f.html",
      html("/orders/1", "/orders/1?overlay=200f&state=error"),
    );
    write(
      "index.html",
      html(
        "/orders?overlay=200f",
        "/orders/1?overlay=999z",
        "/orders/1?state=overlay-200f",
      ),
    );
    const { status, stdout } = run();
    expect(status).toBe(1);
    expect(stdout).toBe(
      "BROKEN: index.html -> /orders?overlay=200f — no overlay 200f on this "
        + "route\n"
        + "BROKEN: index.html -> /orders/1?overlay=999z — no overlay 999z on "
        + "this route\n"
        + "BROKEN: index.html -> /orders/1?state=overlay-200f — malformed state "
        + "overlay-200f\n",
    );
  });

  it("passes an overlay link whose parent or overlay page is not rendered yet", () => {
    write(
      "__mockups/routes.json",
      JSON.stringify({
        ...ROUTES,
        screens: [
          ...ROUTES.screens,
          { ...ROUTES.screens[3], code: "200f", overlay: "200b" },
          { ...ROUTES.screens[1], code: "100f", overlay: "100b" },
        ],
      }),
    );
    write("signin/index.html", html("/"));
    write("index.html", html("/orders/1?overlay=200f", "/signin?overlay=100f"));
    expect(run().stdout).toBe("LINKS OK: 3 links in 2 pages\n");
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
