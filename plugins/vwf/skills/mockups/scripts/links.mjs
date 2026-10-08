#!/usr/bin/env node
// The link check of vwf's mockups.
//
// Run by /vwf:mockups and /vwf:blueprint §6a over one platform's tree, after
// the generators wrote it and before any server starts or any review is asked:
//
//   node links.mjs --root docs/scratchpad/<project>/mockups/<platform>
//
// Reads every .html under the root (never __mockups/) and every href in it. A
// `#` link is correct. A root-absolute link is correct when the review server
// would serve it — a file, a [param] folder, or the placeholder of a code in
// __mockups/routes.json with no file yet — and its `?state=` file exists. It
// matches through lib/routes.mjs, the module the server uses, so the two agree.
// Every other href — relative, `http:`, `mailto:`, protocol-relative — is
// broken.
//
// Broken links: one `BROKEN: <page> -> <href> — <reason>` line each on stdout,
// exit 1. None: one `LINKS OK: <n> links in <m> pages` line, exit 0. A root
// that is not a directory or has no valid routes.json: stderr, exit 2.
//
// Zero dependencies — node: modules only.

import {
  existsSync,
  readdirSync,
  readFileSync,
  realpathSync,
  statSync,
} from "node:fs";
import {
  join,
  resolve,
} from "node:path";
import {
  matchPath,
  readRoutes,
  RESERVED,
} from "./lib/routes.mjs";

function fail(message) {
  process.stderr.write(`links.mjs: ${message}\n`);
  process.exit(2);
}

function parseArgs(argv) {
  if (argv.length !== 2 || argv[0] !== "--root" || argv[1].startsWith("--")) {
    fail("usage: links.mjs --root <platform dir>");
  }
  return { root: argv[1] };
}

const args = parseArgs(process.argv.slice(2));
if (!existsSync(args.root) || !statSync(args.root).isDirectory()) {
  fail(`--root is not a directory: ${args.root}`);
}
const root = realpathSync(resolve(args.root));
let routes;
try {
  routes = readRoutes(root);
}
catch (error) {
  fail(error.message);
}

// Every .html file under the root, root-relative with `/`, __mockups/ skipped.
function pages(dir, at = "") {
  return readdirSync(dir, { withFileTypes: true })
    .sort((a, b) => a.name.localeCompare(b.name))
    .flatMap(entry => {
      const rel = at ? `${at}/${entry.name}` : entry.name;
      if (entry.isDirectory()) {
        return at === "" && entry.name === RESERVED
          ? []
          : pages(join(dir, entry.name), rel);
      }
      return entry.isFile() && entry.name.endsWith(".html") ? [rel] : [];
    });
}

// href="…", href='…' or an unquoted href=….
const HREF_RE = /\bhref\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/gi;

function verdict(href) {
  if (href.startsWith("#")) {
    return null;
  }
  if (!href.startsWith("/") || href.startsWith("//")) {
    return /^[a-z][a-z0-9+.-]*:/i.test(href) || href.startsWith("//")
      ? "not a link inside the mockups"
      : "not root-absolute";
  }
  // A browser reads a backslash as / and drops tab/CR/LF: /\evil.com is another host.
  if (/[\\\t\r\n]/.test(href)) {
    return "not a link inside the mockups";
  }
  const base = "http://127.0.0.1";
  const url = new URL(href, base);
  if (url.origin !== new URL(base).origin) {
    return "not a link inside the mockups";
  }
  const states = url.searchParams.getAll("state");
  if (states.length > 1) {
    return "more than one state";
  }
  const match = matchPath(root, routes, url.pathname, states[0] ?? null);
  return match.kind === "none" ? match.reason : null;
}

const broken = [];
let count = 0;
const list = pages(root);
for (const page of list) {
  const html = readFileSync(join(root, ...page.split("/")), "utf8");
  for (const [, double, single, bare] of html.matchAll(HREF_RE)) {
    const href = (double ?? single ?? bare ?? "").trim();
    count += 1;
    const reason = verdict(href);
    if (reason !== null) {
      broken.push(`BROKEN: ${page} -> ${href} — ${reason}`);
    }
  }
}

if (broken.length > 0) {
  process.stdout.write(broken.join("\n") + "\n");
  process.exit(1);
}
process.stdout.write(`LINKS OK: ${count} links in ${list.length} pages\n`);
