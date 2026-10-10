#!/usr/bin/env node
// The render copy of vwf's execute UX stage.
//
// Run by /vwf:execute after the last ux round, before the landing, once per
// project, with the UX reviewer's RENDER: lines for that project on stdin. It
// copies each render of the built app out of the run's worktree into the main
// checkout's render tree, at the screen's own route, so /vwf:mockups renders
// can serve it after the worktree is gone:
//
//   node renders.mjs --worktree <worktree> --main <main checkout>
//                    --project <project> --plan <plan folder>
//
// stdin, one per image (blank lines are ignored; any other line is one stderr
// warning):
//
//   RENDER: <project> <code> <platform> <state> <file>
//
// A line whose <project> is not --project is SKIPPED. <file> is a PNG — the
// ux-gate contract takes PNG only — in the worktree, relative to its root or
// absolute; it is realpath'd and must sit under the worktree. The route map of
// each platform is built from the worktree's
// docs/blueprint/flows/<project>/*/<platform>.md, by the parse routes.mjs uses
// (lib/screens.mjs). Each image lands at
//
//   <main>/docs/scratchpad/<project>/renders/<platform>/<path>/index.png
//   <main>/docs/scratchpad/<project>/renders/<platform>/<path>/index--<state>.png
//
// `default` is index.png, any other state index--<state>.png. Latest set only.
// `renders/<platform>/__renders/renders.json` is
//
//   { "project", "platform",
//     "renders": [ { "code", "state", "route", "file", "plan", "date" } ] }
//
// merged, for each platform this run copied to — the entry of each
// { code, state } this run copied is replaced; an old entry naming a file this
// run overwrote is dropped (that file now holds another render), compared in
// the file system's own case rule, detected, never assumed; and an old entry
// is pruned when its code is no longer in the platform's route map or its
// route changed. A route is compared by shape, parameter names dropped, so a
// route edit that only renames a parameter keeps its renders. The image of
// every entry dropped or pruned is deleted, unless a kept entry names the same
// file; only an index.png or index--<state>.png under a route folder of the
// tree is ever deleted, never under __renders/, and a symlink there is
// removed, never followed. So each kept entry still describes the image at its
// file. `file` is relative to the platform root, `date` ISO 8601 UTC, `plan`
// the plan folder's name. `__renders/routes.json` keeps a copy of the route
// map, in routes.mjs's shape, for the render server.
//
// Every folder is made one level at a time, each checked to sit under the
// tree before the next, and an image replaces whatever sits at its name — a
// symlink is removed, never followed.
//
// stdout: one `SKIPPED: <code> <platform> <state> — <reason>` line per line it
// could not copy (another project, an unknown code, a missing file, a file
// that is not a PNG, a file outside the worktree, a platform with no route
// map, a folder or copy that failed), then one `COPIED: <n>` line; the json of
// every platform that copied is written whatever failed. Exit 0 once the
// arguments hold and every json was written; a json that cannot be written is
// one stderr line and exit 1. A bad argument, a --main with no .git entry, or
// a stdin that cannot be read is stderr and exit 2 with nothing copied.
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
  statSync,
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
  isRenderName,
  renderFile,
  renderName,
  RENDERS,
  routeDir,
  routeShape,
  STATE_RE,
  underReserved,
} from "./lib/routes.mjs";
import { buildRouteMap } from "./lib/screens.mjs";

// A plain file name: no separator, never a dot file.
function plainName(value) {
  return /^[A-Za-z0-9._-]+$/.test(value) && !value.startsWith(".");
}

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
  if (!plainName(out.project)) {
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
  catch (error) {
    return fail(`cannot read stdin: ${error.message}`);
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

const LINE_RE = /^RENDER:\s+(\S+)\s+(\S+)\s+(\S+)\s+(\S+)\s+(.+?)\s*$/;

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
  const [, project, code, platform, state, file] = match;
  items.push({ project, code, platform, state, file });
}

const skipped = [];
function skip(item, reason) {
  skipped.push(
    `SKIPPED: ${item.code} ${item.platform} ${item.state} — ${reason}`,
  );
}

// The realpath of a platform's render tree, made one level at a time under
// the main checkout, or null when it escapes.
function platformRoot(platform) {
  return ensureDir(main, [
    "docs",
    "scratchpad",
    args.project,
    "renders",
    platform,
  ]);
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
  if (item.project !== args.project) {
    skip(item, `project ${item.project} is not --project ${args.project}`);
    continue;
  }
  if (!plainName(item.platform)) {
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
    skip(item, `not a PNG — a render file must be a PNG: ${item.file}`);
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

  const name = renderName(item.state);
  try {
    const realRoot = platformRoot(item.platform);
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
    file: renderFile(screen.path, item.state),
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
    return Array.isArray(data?.renders)
      ? data.renders.filter(entry =>
        entry !== null && typeof entry === "object"
      )
      : [];
  }
  catch {
    return [];
  }
}

// True when the file system under dir folds case: the reserved folder, which
// exists, is found again under its upper-case name as the same file.
function foldsCase(dir) {
  try {
    const lower = statSync(join(dir, RENDERS));
    const upper = statSync(join(dir, RENDERS.toUpperCase()));
    return lower.ino === upper.ino && lower.dev === upper.dev;
  }
  catch {
    return false;
  }
}

// Deletes the image an entry names, only when it is an index.png or
// index--<state>.png in a route folder that resolves under the platform root
// and not under __renders/; whatever sits at that name — a symlink included —
// is removed, never followed. Anything else is left alone.
function removeImage(realRoot, file) {
  if (typeof file !== "string") {
    return;
  }
  const segments = file.split("/");
  const name = segments.pop();
  if (
    !isRenderName(name)
    || segments.some(segment => ["", ".", ".."].includes(segment))
  ) {
    return;
  }
  const dir = inRoot(realRoot, routeDir(realRoot, segments.join("/")));
  if (!dir || underReserved(realRoot, dir, RENDERS)) {
    return;
  }
  const target = join(dir, name);
  try {
    if (!lstatSync(target).isDirectory()) {
      rmSync(target);
    }
  }
  catch {
    // already gone
  }
}

// Writes onto a fresh file, as copyFresh does: whatever sits at the name — a
// symlink included — is unlinked first, and the exclusive create refuses
// anything that reappears there, so the write never follows a link.
function writeJson(file, value) {
  rmSync(file, { force: true });
  writeFileSync(file, JSON.stringify(value, null, 2) + "\n", { flag: "wx" });
}

// renders.json and routes.json are written for every platform that copied,
// whatever failed before; a platform that cannot be written is one stderr line
// and exit 1.
for (const [platform, entries] of copied) {
  try {
    const screens = routeMap(platform).screens;
    const realRoot = platformRoot(platform);
    const reserved = realRoot && ensureDir(realRoot, [RENDERS]);
    if (!reserved) {
      throw new Error("the render tree escapes the main checkout");
    }
    const file = join(reserved, "renders.json");
    const folded = foldsCase(realRoot);
    const key = path => (folded ? String(path).toLowerCase() : String(path));
    const old = readRenders(file);
    // The { code, state } pairs this run copied are replaced, an old entry
    // naming a file this run overwrote is dropped — it no longer describes
    // that file — and an old entry whose code left the route map or whose
    // route changed shape is pruned. Every other entry is kept as it is.
    const kept = old.filter(entry => {
      const screen = screens.find(s => s.code === entry.code);
      return screen
        && typeof entry.route === "string"
        && routeShape(entry.route) === routeShape(screen.route)
        && !entries.some(e =>
          (e.code === entry.code && e.state === entry.state)
          || key(e.file) === key(entry.file)
        );
    });
    const renders = [...kept, ...entries].sort((a, b) =>
      String(a.code).localeCompare(String(b.code))
      || String(a.state).localeCompare(String(b.state))
    );
    writeJson(file, { project: args.project, platform, renders });
    // The image of each entry that went is deleted once the json
    // holds the change, unless a kept entry names that file.
    const named = new Set(renders.map(entry => key(entry.file)));
    for (const entry of old) {
      if (!kept.includes(entry) && !named.has(key(entry.file))) {
        removeImage(realRoot, entry.file);
      }
    }
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
    process.exitCode = 1;
  }
}

for (const line of skipped) {
  process.stdout.write(`${line}\n`);
}
process.stdout.write(`COPIED: ${count}\n`);
