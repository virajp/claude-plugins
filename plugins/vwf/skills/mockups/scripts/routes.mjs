#!/usr/bin/env node
// The route map of vwf's mockups.
//
// Run by /vwf:mockups and /vwf:blueprint §6a from the repo root, before any
// mockup is generated. It reads the `## Screens` table of every flow platform
// file of one project and one platform, and writes the map the generators link
// through and the review server and link check match against:
//
//   node routes.mjs --project <project> --platform <platform>
//
// reads   docs/blueprint/flows/<project>/*/<platform>.md
// writes  docs/scratchpad/<project>/mockups/<platform>/__mockups/routes.json
//
//   { "project", "platform",
//     "screens": [ { "code", "screen", "slug", "flow", "route", "path",
//                    "routed" } ] }
//
// A table is read by its header row, by column name (Code, Screen, Route),
// never by position. A Route cell with no `/` token has no route: the screen
// gets `/<code>-<slug>` and `routed: false`, and stdout names it in one
// `NO ROUTE: <code> <screen>` line. A row whose Code cell is a markdown link
// points at the screen's home flow and is not a second definition.
//
// stdout: one summary line, plus one NO ROUTE line per unrouted screen. Two
// codes with one route, one code twice, or a route with a `.` or `..` segment,
// a NUL or a first segment `__mockups` (any case), is an error: stderr, exit 1,
// and nothing is written.
//
// Zero dependencies — node: modules only.

import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";
import {
  pathError,
  RESERVED,
  routeToPath,
  slugify,
} from "./lib/routes.mjs";

function fail(message, code = 2) {
  process.stderr.write(`routes.mjs: ${message}\n`);
  process.exit(code);
}

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    const key = arg.startsWith("--") ? arg.slice(2) : "";
    if (!["project", "platform"].includes(key)) {
      fail(`unknown argument: ${arg}`);
    }
    const value = argv[i + 1];
    if (value === undefined || value.startsWith("--")) {
      fail(`${arg} needs a value`);
    }
    out[key] = value;
    i += 1;
  }
  for (const key of ["project", "platform"]) {
    if (!out[key]) {
      fail(`--${key} is required`);
    }
    if (!/^[A-Za-z0-9._-]+$/.test(out[key]) || out[key].startsWith(".")) {
      fail(`--${key} is not a plain name: ${out[key]}`);
    }
  }
  return out;
}

// The cells of one table row; `\|` is a literal pipe, backticks are dropped.
function cells(line) {
  const body = line.trim().replace(/^\|/, "").replace(/\|$/, "");
  return body
    .split(/(?<!\\)\|/)
    .map(cell => cell.replace(/\\\|/g, "|").replace(/`/g, "").trim());
}

// The rows of the first table under `## Screens`, as { code, screen, route }.
function screensOf(text, file) {
  const lines = text.split("\n");
  const heading = lines.findIndex(line => /^##\s+Screens\b/.test(line));
  if (heading === -1) {
    return [];
  }
  let at = heading + 1;
  while (at < lines.length && !lines[at].trim().startsWith("|")) {
    if (/^#{1,2}\s/.test(lines[at])) {
      return [];
    }
    at += 1;
  }
  if (at >= lines.length) {
    return [];
  }
  const header = cells(lines[at]).map(cell => cell.toLowerCase());
  const column = name => header.indexOf(name);
  const [code, screen, route] = ["code", "screen", "route"].map(column);
  if (code === -1 || screen === -1 || route === -1) {
    fail(`${file}: the Screens table has no Code, Screen and Route columns`, 1);
  }
  const rows = [];
  for (
    at += 2;
    at < lines.length && lines[at].trim().startsWith("|");
    at += 1
  ) {
    const row = cells(lines[at]);
    const rawCode = row[code] ?? "";
    if (rawCode === "" || /\]\(/.test(rawCode)) {
      continue;
    }
    rows.push({
      code: rawCode,
      screen: row[screen] ?? "",
      route: row[route] ?? "",
    });
  }
  return rows;
}

function routeToken(cell) {
  const token = cell.split(/\s+/).find(part => part.startsWith("/"));
  return token === undefined ? null : token.replace(/[?#].*$/, "") || "/";
}

const args = parseArgs(process.argv.slice(2));
const flowsDir = join("docs", "blueprint", "flows", args.project);
if (!existsSync(flowsDir) || !statSync(flowsDir).isDirectory()) {
  fail(`no flows directory: ${flowsDir}`, 1);
}

const flows = readdirSync(flowsDir)
  .filter(name => existsSync(join(flowsDir, name, `${args.platform}.md`)))
  .sort();
if (flows.length === 0) {
  fail(`no ${args.platform}.md under ${flowsDir}/*/`, 1);
}

const screens = [];
const errors = [];
const byCode = new Map();
const byPath = new Map();
for (const flow of flows) {
  const file = join(flowsDir, flow, `${args.platform}.md`);
  for (const row of screensOf(readFileSync(file, "utf8"), file)) {
    const slug = slugify(row.screen) || slugify(row.code);
    const token = routeToken(row.route);
    const routed = token !== null;
    const route = routed ? token : `/${row.code}-${slug}`;
    const path = routeToPath(route);
    // APFS folds case: /Orders and /orders are one folder.
    const key = path.replace(/\[[^\]]*\]/g, "[]").toLowerCase();
    const bad = pathError(path);
    if (bad) {
      errors.push(`route ${route} of ${row.code} ${bad}`);
    }
    if (byCode.has(row.code)) {
      errors.push(
        `code ${row.code} is defined twice: ${
          byCode.get(row.code)
        } and ${flow}`,
      );
    }
    else {
      byCode.set(row.code, flow);
    }
    if (byPath.has(key)) {
      errors.push(
        `route ${route} is held by two codes: ${
          byPath.get(key)
        } and ${row.code}`,
      );
    }
    else {
      byPath.set(key, row.code);
    }
    screens.push({
      code: row.code,
      screen: row.screen,
      slug,
      flow,
      route,
      path,
      routed,
    });
  }
}

if (errors.length > 0) {
  for (const error of errors) {
    process.stderr.write(`routes.mjs: ${error}\n`);
  }
  process.exit(1);
}

const outDir = join(
  "docs",
  "scratchpad",
  args.project,
  "mockups",
  args.platform,
  RESERVED,
);
mkdirSync(outDir, { recursive: true });
const outFile = join(outDir, "routes.json");
writeFileSync(
  outFile,
  JSON.stringify(
    { project: args.project, platform: args.platform, screens },
    null,
    2,
  )
    + "\n",
);

const unrouted = screens.filter(screen => !screen.routed);
process.stdout.write(
  `ROUTES: ${screens.length} screens in ${flows.length} flows, `
    + `${unrouted.length} with no route -> ${outFile}\n`,
);
for (const screen of unrouted) {
  process.stdout.write(`NO ROUTE: ${screen.code} ${screen.screen}\n`);
}
