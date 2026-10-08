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
// The parse is lib/screens.mjs's, shared with renders.mjs. A table is read by
// its header row, by column name (Code, Screen, Route),
// never by position. A Route cell with no `/` token has no route: the screen
// gets `/<code>-<slug>` and `routed: false`, and stdout names it in one
// `NO ROUTE: <code> <screen>` line. A row whose Code cell is a markdown link
// points at the screen's home flow and is not a second definition.
//
// stdout: one summary line, plus one NO ROUTE line per unrouted screen. Two
// codes with one route, one code twice, or a route with a `.` or `..` segment,
// a NUL or a first segment `__mockups` or `__renders` (any case), is an error: stderr, exit 1,
// and nothing is written.
//
// Zero dependencies — node: modules only.

import {
  mkdirSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";
import { RESERVED } from "./lib/routes.mjs";
import { buildRouteMap } from "./lib/screens.mjs";

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

const args = parseArgs(process.argv.slice(2));
const flowsDir = join("docs", "blueprint", "flows", args.project);

let map;
try {
  map = buildRouteMap(flowsDir, args.platform);
}
catch (error) {
  fail(error.message, 1);
}
const { flows, screens, errors } = map;

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
