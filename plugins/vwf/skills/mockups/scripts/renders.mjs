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
// merged — an existing { code, state } is replaced, every other entry kept
// while its code keeps the same route and file in the new route map; an entry
// whose code left the map or moved is dropped, and its image removed.
// `file` is relative to the platform root, `date` ISO 8601 UTC, `plan` the
// plan folder's name. `__renders/routes.json` keeps a copy of the route map,
// in routes.mjs's shape, for the render server.
//
// Every folder is made one level at a time, each checked to sit under the
// tree before the next, and an image replaces whatever sits at its name — a
// symlink is removed, never followed.
//
// stdout: one `SKIPPED: <code> <platform> <state> — <reason>` line per line it
// could not copy (an unknown code, a missing file, a file outside the
// worktree, a platform with no route map, a folder or copy that failed), then
// one `COPIED: <n>` line; the json of every platform that copied is written
// whatever failed. Exit 0
// once the arguments hold; a bad argument, or a --main with no .git entry, is
// stderr and exit 2 with nothing copied.
//
// Zero dependencies — node: modules only.

import {
  constants,
  copyFileSync,
  existsSync,
  lstatSync,
  mkdirSync,
  readFileSync,
  realpathSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import {
  basename,
  extname,
  join,
  resolve,
} from "node:path";
import {
  inRoot,
  isDir,
  isFile,
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

// Creates each segment under the (realpath'd) base one level at a time, each
// level checked to resolve under the base before the next is made, so a
// symlinked folder never leads a mkdir outside it. The realpath of the last
// level, or null when one escapes or is not a directory.
function ensureDir(base, segments) {
  let dir = base;
  for (const segment of segments) {
    const next = join(dir, segment);
    try {
      mkdirSync(next);
    }
    catch (error) {
      if (error.code !== "EEXIST") {
        throw error;
      }
    }
    const real = inRoot(base, next);
    if (!real || !isDir(real)) {
      return null;
    }
    dir = real;
  }
  return dir;
}

// Copies onto a fresh file: whatever sits at the target — a symlink included —
// is removed first, so the copy never follows a link out of the tree.
function copyFresh(source, target) {
  let existing = null;
  try {
    existing = lstatSync(target);
  }
  catch {
    // nothing there
  }
  if (existing?.isDirectory()) {
    throw new Error(`a directory sits at ${target}`);
  }
  if (existing) {
    rmSync(target);
  }
  copyFileSync(source, target, constants.COPYFILE_EXCL);
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

  const name = item.state === "default"
    ? "index.png"
    : `index--${item.state}.png`;
  try {
    const realRoot = ensureDir(main, [
      "docs",
      "scratchpad",
      args.project,
      "renders",
      item.platform,
    ]);
    if (!realRoot) {
      skip(item, "the render tree escapes the main checkout");
      continue;
    }
    const realDir = ensureDir(
      realRoot,
      screen.path ? screen.path.split("/") : [],
    );
    if (!realDir) {
      skip(item, `the route folder escapes the render tree: ${screen.path}`);
      continue;
    }
    copyFresh(source, join(realDir, name));
  }
  catch (error) {
    skip(item, `cannot copy: ${error.message}`);
    continue;
  }
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

// The file an entry of `code` and `state` sits at under the route map now, or
// null when the code is in no Screens table any more.
function currentFile(screens, code, state) {
  const screen = screens.find(s => s.code === code);
  if (!screen) {
    return null;
  }
  const name = state === "default" ? "index.png" : `index--${state}.png`;
  return {
    route: screen.route,
    file: screen.path ? `${screen.path}/${name}` : name,
  };
}

// Removes an image an old entry named, when it is a PNG under the platform
// root and outside __renders/.
function removeImage(realRoot, file) {
  const real = inRoot(realRoot, join(realRoot, ...String(file).split("/")));
  if (
    !real
    || real === realRoot
    || !real.toLowerCase().endsWith(".png")
    || real.slice(realRoot.length + 1).split(/[\\/]/)[0].toLowerCase()
      === RENDERS
    || !isFile(real)
  ) {
    return;
  }
  rmSync(real);
}

// renders.json and routes.json are written for every platform that copied,
// whatever failed before; a platform that cannot be written is one stderr line.
for (const [platform, entries] of copied) {
  try {
    const screens = routeMap(platform).screens;
    const realRoot = ensureDir(main, [
      "docs",
      "scratchpad",
      args.project,
      "renders",
      platform,
    ]);
    const reserved = realRoot && ensureDir(realRoot, [RENDERS]);
    if (!reserved) {
      throw new Error("the render tree escapes the main checkout");
    }
    const file = join(reserved, "renders.json");
    // An old entry stays only while its code still has the same route and
    // file in the route map; routes.json is rewritten from that map, and the
    // server finds an image through it, so a stale image would show as
    // another screen's render.
    const dropped = [];
    const kept = readRenders(file).filter(old => {
      if (entries.some(e => e.code === old.code && e.state === old.state)) {
        return false;
      }
      const now = currentFile(screens, old.code, old.state);
      if (now === null || now.route !== old.route || now.file !== old.file) {
        dropped.push(old);
        return false;
      }
      return true;
    });
    const renders = [...kept, ...entries].sort((a, b) =>
      String(a.code).localeCompare(String(b.code))
      || String(a.state).localeCompare(String(b.state))
    );
    for (const old of dropped) {
      if (!renders.some(e => e.file === old.file)) {
        removeImage(realRoot, old.file);
      }
    }
    writeJson(file, { project: args.project, platform, renders });
    writeJson(join(reserved, "routes.json"), {
      project: args.project,
      platform,
      screens,
    });
  }
  catch (error) {
    process.stderr.write(
      `renders.mjs: ${platform}: cannot write ${RENDERS}/: ${error.message}\n`,
    );
  }
}

for (const line of skipped) {
  process.stdout.write(`${line}\n`);
}
process.stdout.write(`COPIED: ${count}\n`);
