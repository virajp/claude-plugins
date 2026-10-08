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

// The named references a URL could hide in. With a `;`, a name in neither this
// table nor LEGACY is refused — the check fails closed rather than guess.
const NAMED = {
  amp: "&",
  AMP: "&",
  lt: "<",
  LT: "<",
  gt: ">",
  GT: ">",
  quot: "\"",
  QUOT: "\"",
  apos: "'",
  sol: "/",
  bsol: "\\",
  colon: ":",
  period: ".",
  Tab: "\t",
  NewLine: "\n",
  num: "#",
  quest: "?",
  equals: "=",
  percnt: "%",
  semi: ";",
  comma: ",",
  plus: "+",
  excl: "!",
  commat: "@",
  lowbar: "_",
  lpar: "(",
  rpar: ")",
  nbsp: "\u00a0",
};
// HTML's legacy names — the ones a browser also decodes with no `;` — and
// their code points.
const LEGACY = Object.fromEntries(
  (
    "AElig:c6 AMP:26 Aacute:c1 Acirc:c2 Agrave:c0 Aring:c5 Atilde:c3 Auml:c4 "
    + "COPY:a9 Ccedil:c7 ETH:d0 Eacute:c9 Ecirc:ca Egrave:c8 Euml:cb GT:3e "
    + "Iacute:cd Icirc:ce Igrave:cc Iuml:cf LT:3c Ntilde:d1 Oacute:d3 Ocirc:d4 "
    + "Ograve:d2 Oslash:d8 Otilde:d5 Ouml:d6 QUOT:22 REG:ae THORN:de Uacute:da "
    + "Ucirc:db Ugrave:d9 Uuml:dc Yacute:dd aacute:e1 acirc:e2 acute:b4 "
    + "aelig:e6 agrave:e0 amp:26 aring:e5 atilde:e3 auml:e4 brvbar:a6 "
    + "ccedil:e7 cedil:b8 cent:a2 copy:a9 curren:a4 deg:b0 divide:f7 eacute:e9 "
    + "ecirc:ea egrave:e8 eth:f0 euml:eb frac12:bd frac14:bc frac34:be gt:3e "
    + "iacute:ed icirc:ee iexcl:a1 igrave:ec iquest:bf iuml:ef laquo:ab lt:3c "
    + "macr:af micro:b5 middot:b7 nbsp:a0 not:ac ntilde:f1 oacute:f3 ocirc:f4 "
    + "ograve:f2 ordf:aa ordm:ba oslash:f8 otilde:f5 ouml:f6 para:b6 plusmn:b1 "
    + "pound:a3 quot:22 raquo:bb reg:ae sect:a7 shy:ad sup1:b9 sup2:b2 sup3:b3 "
    + "szlig:df thorn:fe times:d7 uacute:fa ucirc:fb ugrave:f9 uml:a8 uuml:fc "
    + "yacute:fd yen:a5 yuml:ff"
  )
    .split(" ")
    .map(pair => {
      const [name, hex] = pair.split(":");
      return [name, String.fromCodePoint(parseInt(hex, 16))];
    }),
);
const REF_RE =
  /&(?:#[xX]([0-9a-fA-F]+);?|#([0-9]+);?|([A-Za-z][A-Za-z0-9]*)(;?))/g;

// The value a browser reads out of the attribute: every character reference
// decoded, as the HTML parser does before the URL parser sees it. A legacy
// name with no `;` is decoded too, unless `=` follows it — HTML's attribute
// rule (the name run is already maximal, so no letter or digit can follow).
// Any other `&` is literal text, as in HTML. Null when a named reference
// ending in `;` is one this file does not know — the check fails closed on it.
function decode(value) {
  let unknown = false;
  const out = value.replace(REF_RE, (ref, hex, dec, name, semi, at) => {
    if (name !== undefined) {
      if (semi === "") {
        return Object.hasOwn(LEGACY, name) && value[at + ref.length] !== "="
          ? LEGACY[name]
          : ref;
      }
      const known = Object.hasOwn(NAMED, name) ? NAMED : LEGACY;
      if (!Object.hasOwn(known, name)) {
        unknown = true;
        return ref;
      }
      return known[name];
    }
    const code = hex !== undefined ? parseInt(hex, 16) : parseInt(dec, 10);
    return code === 0 || code > 0x10ffff || (code >= 0xd800 && code <= 0xdfff)
      ? "\ufffd"
      : String.fromCodePoint(code);
  });
  return unknown ? null : out;
}

function verdict(raw) {
  const decoded = decode(raw);
  if (decoded === null) {
    return "an unknown character reference";
  }
  // The URL parser strips leading and trailing C0 controls and spaces.
  let start = 0;
  let end = decoded.length;
  while (start < end && decoded.charCodeAt(start) <= 0x20) {
    start++;
  }
  while (end > start && decoded.charCodeAt(end - 1) <= 0x20) {
    end--;
  }
  const href = decoded.slice(start, end);
  if (href.startsWith("#")) {
    return null;
  }
  if (!href.startsWith("/") || href.startsWith("//")) {
    return /^[a-z][a-z0-9+.-]*:/i.test(href) || href.startsWith("//")
      ? "not a link inside the mockups"
      : "not root-absolute";
  }
  // A browser reads a backslash as / and drops tab/CR/LF: /\evil.com is another
  // host. What is left — one /, then no / or \ — is a path on this origin.
  if (/[\\\t\r\n]/.test(href)) {
    return "not a link inside the mockups";
  }
  const url = new URL(href, "http://127.0.0.1");
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
    const href = double ?? single ?? bare ?? "";
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
