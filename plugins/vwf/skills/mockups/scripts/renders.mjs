#!/usr/bin/env node
// The render copy of vwf's execute UX stage.
//
// Run by /vwf:execute after the last ux round, before the landing, with the
// UX reviewer's RENDER: lines on stdin. It copies each render of the built app
// out of the run's worktree into the main checkout's render tree, at the
// screen's own route, so /vwf:mockups renders can serve it after the worktree
// is gone:
//
//   node renders.mjs --worktree <worktree> --main <main checkout>
//                    --project <project> --plan <plan folder>
//
// stdin, one per image (blank lines are ignored; any other line is one stderr
// warning):
//
//   RENDER: <code> <platform> <state> <file>
//
// <file> is a PNG in the worktree, relative to it or absolute; it is realpath'd
// and must sit under the worktree. The route map of each platform is built
// from the worktree's docs/blueprint/flows/<project>/*/<platform>.md, by the
// parse routes.mjs uses (lib/screens.mjs). Each image lands at
//
//   <main>/docs/scratchpad/<project>/renders/<platform>/<path>/index.png
//   <main>/docs/scratchpad/<project>/renders/<platform>/<path>/index--<state>.png
//
// `default` is index.png, any other state index--<state>.png. Latest set only:
// a run overwrites only the screens and states it rendered.
// `renders/<platform>/__renders/renders.json` is
//
//   { "project", "platform",
//     "renders": [ { "code", "state", "route", "file", "plan", "date" } ] }
//
// merged — an existing { code, state } is replaced, every other entry kept;
// `file` is relative to the platform root, `date` ISO 8601 UTC, `plan` the
// plan folder's name. `__renders/routes.json` keeps a copy of the route map,
// in routes.mjs's shape, for the render server.
//
// stdout: one `SKIPPED: <code> <platform> <state> — <reason>` line per line it
// could not copy (an unknown code, a missing file, a file outside the
// worktree, a platform with no route map), then one `COPIED: <n>` line. Exit 0
// once the arguments hold; a bad argument, or a --main with no .git entry, is
// stderr and exit 2 with nothing copied.
//
// Zero dependencies — node: modules only.

import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  realpathSync,
  statSync,
  writeFileSync,
} from "node:fs";
import {
  basename,
  extname,
  join,
  resolve,
  sep,
} from "node:path";
import {
  inRoot,
  RENDERS,
  STATE_RE,
} from "./lib/routes.mjs";
import { buildRouteMap } from "./lib/screens.mjs";

const NAME_RE = /^[A-Za-z0-9._-]+$/;

function fail(message) {
  process.stderr.write(`renders.mjs: ${message}\n`);
  process.exit(2);
}

function parseArgs(argv) {
  const keys = ["worktree", "main", "project", "plan"];
  const out = {};
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    const key = arg.startsWith("--") ? arg.slice(2) : "";
    if (!keys.includes(key)) {
      fail(`unknown argument: ${arg}`);
    }
    const value = argv[i + 1];
    if (value === undefined || value.startsWith("--")) {
      fail(`${arg} needs a value`);
    }
    out[key] = value;
    i += 1;
  }
  for (const key of keys) {
    if (!out[key]) {
      fail(`--${key} is required`);
    }
  }
  if (!NAME_RE.test(out.project) || out.project.startsWith(".")) {
    fail(`--project is not a plain name: ${out.project}`);
  }
  return out;
}

function isDir(path) {
  try {
    return statSync(path).isDirectory();
  }
  catch {
    return false;
  }
}

function isFile(path) {
  try {
    return statSync(path).isFile();
  }
  catch {
    return false;
  }
}

function readStdin() {
  try {
    return readFileSync(0, "utf8");
  }
  catch {
    return "";
  }
}

const args = parseArgs(process.argv.slice(2));

if (!isDir(args.worktree)) {
  fail(`--worktree is not a directory: ${args.worktree}`);
}
const worktree = realpathSync(resolve(args.worktree));
if (!isDir(args.main)) {
  fail(`--main is not a directory: ${args.main}`);
}
const main = realpathSync(resolve(args.main));
if (!existsSync(join(main, ".git"))) {
  fail(`--main holds no .git entry: ${args.main}`);
}
const plan = basename(args.plan.replace(/[\\/]+$/, ""));
if (!plan) {
  fail(`--plan names no folder: ${args.plan}`);
}

const LINE_RE = /^RENDER:\s+(\S+)\s+(\S+)\s+(\S+)\s+(.+?)\s*$/;

const items = [];
for (const [index, raw] of readStdin().split("\n").entries()) {
  const line = raw.trim();
  if (line === "") {
    continue;
  }
  const match = LINE_RE.exec(line);
  if (!match) {
    process.stderr.write(
      `renders.mjs: line ${
        index + 1
      } is not a RENDER: line, ignored: ${line}\n`,
    );
    continue;
  }
  const [, code, platform, state, file] = match;
  items.push({ code, platform, state, file });
}

const skipped = [];
function skip(item, reason) {
  skipped.push(
    `SKIPPED: ${item.code} ${item.platform} ${item.state} — ${reason}`,
  );
}

// One route map per platform, built once; null when the platform has none.
const maps = new Map();
function routeMap(platform) {
  if (maps.has(platform)) {
    return maps.get(platform);
  }
  let map;
  try {
    const built = buildRouteMap(
      join(worktree, "docs", "blueprint", "flows", args.project),
      platform,
    );
    if (built.errors.length > 0) {
      for (const error of built.errors) {
        process.stderr.write(`renders.mjs: ${platform}: ${error}\n`);
      }
      map = { error: "the route map has errors" };
    }
    else {
      map = { screens: built.screens };
    }
  }
  catch (error) {
    map = { error: error.message };
  }
  maps.set(platform, map);
  return map;
}

const date = new Date().toISOString();
const copied = new Map(); // platform → [ entry ]
let count = 0;

for (const item of items) {
  if (!NAME_RE.test(item.platform) || item.platform.startsWith(".")) {
    skip(item, "the platform is not a plain name");
    continue;
  }
  if (!STATE_RE.test(item.state)) {
    skip(item, "the state is not a plain name");
    continue;
  }
  const source = inRoot(worktree, resolve(worktree, item.file));
  if (!source) {
    skip(item, `no file in the worktree: ${item.file}`);
    continue;
  }
  if (!isFile(source)) {
    skip(item, `not a file: ${item.file}`);
    continue;
  }
  if (extname(source).toLowerCase() !== ".png") {
    skip(item, `not a PNG: ${item.file}`);
    continue;
  }
  const map = routeMap(item.platform);
  if (map.error) {
    skip(item, `no route map: ${map.error}`);
    continue;
  }
  const screen = map.screens.find(s => s.code === item.code);
  if (!screen) {
    skip(item, `code ${item.code} is in no ${item.platform} Screens table`);
    continue;
  }

  const platformRoot = join(
    main,
    "docs",
    "scratchpad",
    args.project,
    "renders",
    item.platform,
  );
  const dir = join(
    platformRoot,
    ...(screen.path ? screen.path.split("/") : []),
  );
  mkdirSync(dir, { recursive: true });
  const realRoot = realpathSync(platformRoot);
  const realDir = realpathSync(dir);
  if (realDir !== realRoot && !realDir.startsWith(realRoot + sep)) {
    skip(item, `the route folder escapes the render tree: ${screen.path}`);
    continue;
  }
  const name = item.state === "default"
    ? "index.png"
    : `index--${item.state}.png`;
  copyFileSync(source, join(realDir, name));
  count += 1;

  if (!copied.has(item.platform)) {
    copied.set(item.platform, []);
  }
  const entries = copied.get(item.platform);
  const entry = {
    code: screen.code,
    state: item.state,
    route: screen.route,
    file: screen.path ? `${screen.path}/${name}` : name,
    plan,
    date,
  };
  const at = entries.findIndex(e =>
    e.code === entry.code && e.state === entry.state
  );
  if (at === -1) {
    entries.push(entry);
  }
  else {
    entries[at] = entry;
  }
}

function readRenders(file) {
  try {
    const data = JSON.parse(readFileSync(file, "utf8"));
    return Array.isArray(data?.renders) ? data.renders : [];
  }
  catch {
    return [];
  }
}

function writeJson(file, value) {
  writeFileSync(file, JSON.stringify(value, null, 2) + "\n");
}

for (const [platform, entries] of copied) {
  const reserved = join(
    main,
    "docs",
    "scratchpad",
    args.project,
    "renders",
    platform,
    RENDERS,
  );
  mkdirSync(reserved, { recursive: true });
  const file = join(reserved, "renders.json");
  const kept = readRenders(file).filter(old =>
    !entries.some(e => e.code === old.code && e.state === old.state)
  );
  const renders = [...kept, ...entries].sort((a, b) =>
    String(a.code).localeCompare(String(b.code))
    || String(a.state).localeCompare(String(b.state))
  );
  writeJson(file, { project: args.project, platform, renders });
  writeJson(join(reserved, "routes.json"), {
    project: args.project,
    platform,
    screens: routeMap(platform).screens,
  });
}

for (const line of skipped) {
  process.stdout.write(`${line}\n`);
}
process.stdout.write(`COPIED: ${count}\n`);
