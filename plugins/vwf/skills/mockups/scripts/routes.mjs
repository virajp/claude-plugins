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
//                    "routed" [, "overlay"] } ] }
//
// The parse is lib/screens.mjs's, shared with renders.mjs. A table is read by
// its header row, by column name (Code, Screen, Route),
// never by position. A Route cell with no `/` word has no route: the screen
// gets `/<code>-<slug>` and `routed: false`, and stdout names it in one
// `NO ROUTE: <code> <screen>` line. A row whose Code cell is a markdown link
// (`[004a](../004-checkout/mobile.md#004a)`) points at the screen's home flow
// and is not a second definition. A Route cell that is, whole, `modal of
// <code>`, `dialog of <code>` or `sheet of <code>` (after at most one route
// word) makes the screen an overlay of that parent: it
// takes the parent's route and path plus `"overlay": "<parent code>"`, and is
// served at `<route>?overlay=<code>`.
//
// Before it writes routes.json, it reads the routes.json already there. Once
// the new one is written, every mockup page under the platform's tree —
// index.html or index--*.html, never another file, never a folder — that the
// previous map named and the new one does not is deleted: the pages at a path
// the previous map named and the new one does not (overlay pages there
// included), and the pages of an overlay the previous map had and the new one
// does not — before any link check reads the tree. With no previous
// routes.json, or one that cannot be read, nothing is deleted, so a page at a
// path no map ever named is never touched. Nothing under __mockups/ is
// touched, and a symlink is removed, never followed, so nothing outside the
// tree is (lib/routes.mjs prunePages).
//
// stdout: one summary line, one NO ROUTE line per unrouted screen, and one
// `PRUNED: <path>` line per page deleted. Two non-overlay codes with one
// route, one code twice, a route with a `.` or `..` segment, a NUL or a first
// segment `__mockups` or `__renders` (any case), a marker whose parent or an
// overlay whose own code is not letters, digits and _ only, or an overlay
// whose parent is missing, an overlay, or on another route, is an error:
// stderr, exit 1, and nothing is written or deleted.
//
// Zero dependencies — node: modules only.

import {
  mkdirSync,
  realpathSync,
  writeFileSync,
} from "node:fs";
import {
  dirname,
  join,
} from "node:path";
import {
  prunePages,
  readRoutes,
  RESERVED,
} from "./lib/routes.mjs";
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
// The map this one replaces, read before it is overwritten; null when there
// is none or it cannot be read, and then nothing is pruned.
let previous;
try {
  previous = readRoutes(dirname(outDir)).screens;
}
catch {
  previous = null;
}
writeFileSync(
  outFile,
  JSON.stringify(
    { project: args.project, platform: args.platform, screens },
    null,
    2,
  )
    + "\n",
);
const pruned = prunePages(realpathSync(dirname(outDir)), previous, screens);

// An overlay takes its parent's route; only the parent is named.
const unrouted = screens.filter(screen =>
  !screen.routed && screen.overlay === undefined
);
process.stdout.write(
  `ROUTES: ${screens.length} screens in ${flows.length} flows, `
    + `${unrouted.length} with no route -> ${outFile}\n`,
);
for (const screen of unrouted) {
  process.stdout.write(`NO ROUTE: ${screen.code} ${screen.screen}\n`);
}
for (const path of pruned) {
  process.stdout.write(`PRUNED: ${path}\n`);
}
