#!/usr/bin/env node
// The link check of vwf's mockups.
//
// Run by /vwf:mockups and /vwf:blueprint §6a over one platform's tree, after
// the generators wrote it and before any server starts or any review is asked:
//
//   node links.mjs --root docs/scratchpad/<project>/mockups/<platform>
//
// Reads every .html under the root (never __mockups/, in any case) and every
// link in it: the href of an <a> or <area>, the action of a <form>, and the
// formaction of a <button> or <input> — read from the tags, so a comment, a
// <script>, <style>, <textarea> or <title>, another attribute (data-href) and
// another element (<link>, an SVG <image>) are never read. An unquoted value
// runs to the next space or `>`, as in a browser. Character references are
// decoded as a browser does first, numeric 0x80-0x9F through Windows-1252.
//
// A `#` link is correct. A root-absolute link is correct when the review
// server would serve it — a file, a [param] folder, or the placeholder of a
// code in __mockups/routes.json with no file yet, with or without `?state=`; a
// `?state=` page, or that screen's default page when the state page is missing
// (the server shows it with a "state not rendered" banner); and a
// `?overlay=<code>` link names an overlay of the screen at that route. The target is read by lib/link.mjs and matched by
// lib/routes.mjs, the parser and matcher the server uses, so the two agree.
// Every other link — relative, `http:`, `mailto:`, protocol-relative — is
// broken, and so is a form that submits by POST (its own method="post", or
// its button's formmethod): the review server answers GET only.
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
  parseTarget,
  resolveTarget,
} from "./lib/link.mjs";
import {
  isReserved,
  readRoutes,
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
        return at === "" && isReserved(entry.name)
          ? []
          : pages(join(dir, entry.name), rel);
      }
      return entry.isFile() && entry.name.endsWith(".html") ? [rel] : [];
    });
}

// Text a browser never reads as a tag: a comment (to its end when it is never
// closed), and the raw text of script, style, textarea and title.
const SKIP_RE =
  /<!--[\s\S]*?(?:-->|$)|<(script|style|textarea|title)\b[^>]*>[\s\S]*?(?:<\/\1\s*>|$)/gi;
// One tag: an optional `/`, its name, and its attributes, quoted values kept
// whole so a `>` inside one does not end the tag.
const TAG_RE = /<(\/?)([A-Za-z][^\s/>]*)((?:[^>"']|"[^"]*"|'[^']*')*)>/g;
// One attribute: a name and a value, double-, single- or unquoted.
const ATTR_RE = /([^\s"'>/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g;

// A tag's attributes by lower-case name, the first of a name winning, as in a
// browser; an attribute with no value is null.
function attributes(text) {
  const out = new Map();
  for (const [, name, double, single, bare] of text.matchAll(ATTR_RE)) {
    const key = name.toLowerCase();
    if (!out.has(key)) {
      out.set(key, double ?? single ?? bare ?? null);
    }
  }
  return out;
}

// The links of one page, in order: { href, post }, post true for a target a
// form submits by POST.
function linksOf(html) {
  const links = [];
  let formPost = false;
  for (
    const [, close, rawName, rest] of html.replace(SKIP_RE, " ").matchAll(
      TAG_RE,
    )
  ) {
    const name = rawName.toLowerCase();
    if (close) {
      if (name === "form") {
        formPost = false;
      }
      continue;
    }
    const attrs = attributes(rest);
    const isPost = value => String(value ?? "").trim().toLowerCase() === "post";
    let href = null;
    let post = false;
    if (name === "a" || name === "area") {
      href = attrs.get("href") ?? null;
    }
    else if (name === "form") {
      formPost = isPost(attrs.get("method"));
      href = attrs.get("action") ?? null;
      post = formPost;
    }
    else if (name === "button" || name === "input") {
      href = attrs.get("formaction") ?? null;
      post = attrs.has("formmethod")
        ? isPost(attrs.get("formmethod"))
        : formPost;
    }
    if (href !== null) {
      links.push({ href, post });
    }
  }
  return links;
}

// The named references a URL could hide in, beyond LEGACY's. With a `;`, a
// name in neither table is refused — the check fails closed rather than guess.
const NAMED = {
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
// Every name a reference ending in `;` may use: LEGACY plus NAMED.
const KNOWN = { ...LEGACY, ...NAMED };
// The numeric references 0x80-0x9F a browser reads as Windows-1252; the five
// it leaves alone (0x81, 0x8D, 0x8F, 0x90, 0x9D) are not listed.
const WINDOWS_1252 = Object.fromEntries(
  (
    "80:20ac 82:201a 83:192 84:201e 85:2026 86:2020 87:2021 88:2c6 89:2030 "
    + "8a:160 8b:2039 8c:152 8e:17d 91:2018 92:2019 93:201c 94:201d 95:2022 "
    + "96:2013 97:2014 98:2dc 99:2122 9a:161 9b:203a 9c:153 9e:17e 9f:178"
  )
    .split(" ")
    .map(pair => pair.split(":").map(hex => parseInt(hex, 16))),
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
      if (!Object.hasOwn(KNOWN, name)) {
        unknown = true;
        return ref;
      }
      return KNOWN[name];
    }
    const code = hex !== undefined ? parseInt(hex, 16) : parseInt(dec, 10);
    if (code === 0 || code > 0x10ffff || (code >= 0xd800 && code <= 0xdfff)) {
      return "\ufffd";
    }
    return String.fromCodePoint(WINDOWS_1252[code] ?? code);
  });
  return unknown ? null : out;
}

function verdict(raw, post) {
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
  const target = parseTarget(href);
  if (target === null) {
    return "malformed path";
  }
  const match = resolveTarget(root, routes, target);
  if (match.kind === "none") {
    return match.reason;
  }
  return post ? "a POST form; the review server answers GET only" : null;
}

const broken = [];
let count = 0;
const list = pages(root);
for (const page of list) {
  const html = readFileSync(join(root, ...page.split("/")), "utf8");
  for (const { href, post } of linksOf(html)) {
    count += 1;
    const reason = verdict(href, post);
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
