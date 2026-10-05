#!/usr/bin/env node
// stackgen:tool-config's script: renders a repo's universal tool configs from
// two trees — `assets/`, copied as they are, and `templates/`, rendered from
// `.config/stackgen.yaml` — and a pack's own `templates/`, showing every
// change as a numbered row before it writes. The grammar is lib/cli.mjs's;
// the output is JSON on stdout, always — exit 0 on success, 2 on a refused
// call ({error, rows?}), 1 on an internal fault.
//
//   all          writes the given values into stackgen.yaml, then renders every
//                asset and template; then `MISE_ENV=dev mise run setup:all`
//   pack         writes the pack's `--set` values, renders its templates/, and
//                re-renders the `…:all` tasks
//   pack-remove  deletes the pack's conf.d folder and subtasks, drops its values,
//                and re-renders the `…:all` tasks
//   upgrade      moves each exact pin a CI-loaded mise file holds forward
//
// No file is recorded anywhere: each call compares a fresh render with the
// repo as it stands. A file that differs is one row — `ok` takes the render,
// `keep-existing` leaves the file. A call that writes then runs the formatter
// over every file it wrote, when the repo has `.config/dprint.json`, and
// `pre-commit validate-config` when it wrote the hook config; either failing
// puts every file back byte for byte. Every tool runs as `mise x -- <tool>`
// (lib/run.mjs), after `mise which` says it is installed.

import { spawnSync } from "node:child_process";
import {
  chmodSync,
  existsSync,
  lstatSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  realpathSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import {
  dirname,
  join,
  relative,
  resolve,
  sep,
} from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "./lib/cli.mjs";
import {
  checkRelPath,
  sha256,
  splitLines,
  UnsafePathError,
} from "./lib/paths.mjs";
import {
  filledSlot,
  isCiLoaded,
  isExact,
  isMarked,
  pinExact,
  pinsOf,
  renderTemplate,
  setPin,
  splice,
  SUBTASK_DIRS,
  subtaskNames,
  taskNames,
  TASKS_DIR,
  tierOf,
  valueNames,
  walk,
} from "./lib/render.mjs";
import {
  checkAnswers,
  numberRows,
  previewStore,
  publicRow,
  RefusalError,
} from "./lib/rows.mjs";
import {
  MISSING_MISE,
  onPath,
  Runner,
} from "./lib/run.mjs";
import {
  STACKGEN_PATH,
  stackgenText,
  valuesFrom,
  withPack,
  withValues,
} from "./lib/stackgen-file.mjs";
import {
  readStackgen,
  ValuesError,
} from "./lib/values.mjs";
import { YamlError } from "./lib/yaml.mjs";

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));

const DPRINT_CONFIG = ".config/dprint.json";
const HOOK_CONFIG = ".config/pre-commit-config.yaml";
const CONF_D = ".config/mise/conf.d";

const modeOf = exec => (exec ? "755" : "644");

// --- the workspace: the repo as the call would leave it --------------------------

class Workspace {
  constructor(root) {
    this.root = root;
    this.files = new Map(); // path → text | null (deleted)
    this.modes = new Map();
    this.order = []; // touched paths, first touch first
  }

  /**
   * The absolute path of a repo-relative one, for any read, write, delete or
   * list: refused when it is absolute or climbs with `..`, when it or any
   * parent inside the repo is a symlink, or when it resolves outside the root.
   */
  safe(path) {
    checkRelPath(path);
    this.realRoot ??= realpathSync(this.root);
    const parts = path.split("/").filter(p => p !== "" && p !== ".");
    let at = this.realRoot;
    for (const part of parts) {
      at = join(at, part);
      let st;
      try {
        st = lstatSync(at);
      }
      catch (e) {
        if (e.code === "ENOENT" || e.code === "ENOTDIR") {
          break;
        }
        throw e;
      }
      if (st.isSymbolicLink()) {
        throw new UnsafePathError(
          `${path}: ${relative(this.realRoot, at)} is a symlink — refused`,
        );
      }
    }
    const abs = join(this.realRoot, ...parts);
    if (abs !== this.realRoot && !abs.startsWith(this.realRoot + sep)) {
      throw new UnsafePathError(`${path} resolves outside the repo — refused`);
    }
    return abs;
  }

  disk(path) {
    const abs = this.safe(path);
    return existsSync(abs) && statSync(abs).isFile()
      ? readFileSync(abs, "utf8")
      : null;
  }

  /** Whether the file on disk is executable; null when there is none. */
  diskExec(path) {
    const abs = this.safe(path);
    return existsSync(abs) && statSync(abs).isFile()
      ? (statSync(abs).mode & 0o111) !== 0
      : null;
  }

  read(path) {
    return this.files.has(path) ? this.files.get(path) : this.disk(path);
  }

  /** Whether the file is executable as the call would leave it. */
  isExec(path) {
    return typeof this.files.get(path) === "string"
      ? this.modes.get(path) === "755"
      : this.diskExec(path) === true;
  }

  /**
   * Refuse a write a non-file already stands in the way of: a parent that is
   * a file (an old layout's task where a folder now goes), or a folder at the
   * path itself — never seen as absent, never half-written.
   */
  clear(path) {
    const abs = this.safe(path);
    let at = this.realRoot;
    for (const part of path.split("/").slice(0, -1)) {
      at = join(at, part);
      if (!existsSync(at)) {
        return;
      }
      if (!statSync(at).isDirectory()) {
        throw new RefusalError(
          `${path} needs ${
            relative(this.realRoot, at)
          } to be a folder, and a file is there — move it aside, then re-run`,
        );
      }
    }
    if (existsSync(abs) && !statSync(abs).isFile()) {
      throw new RefusalError(
        `${path} is a folder where a file goes — move it aside, then re-run`,
      );
    }
  }

  touch(path) {
    if (!this.order.includes(path)) {
      this.order.push(path);
    }
  }

  write(path, text, mode) {
    this.clear(path);
    this.touch(path);
    this.files.set(path, text);
    this.modes.set(path, mode);
  }

  remove(path) {
    this.touch(path);
    this.files.set(path, null);
    this.modes.delete(path);
  }

  /** Forget a planned change: the path reads as the disk has it. */
  drop(path) {
    this.order = this.order.filter(p => p !== path);
    this.files.delete(path);
    this.modes.delete(path);
  }

  /** Repo-relative files under `dir`, as the call would leave them. */
  list(dir) {
    const base = dir.replace(/\/$/, "");
    const out = new Set();
    // the directory and its parents are held to safe(); a symlink inside it is never followed or listed
    const visit = rel => {
      const abs = this.safe(rel);
      if (!existsSync(abs) || !statSync(abs).isDirectory()) {
        return;
      }
      for (const d of readdirSync(abs, { withFileTypes: true })) {
        if (d.isSymbolicLink()) {
          continue;
        }
        const p = `${rel}/${d.name}`;
        if (d.isDirectory()) {
          visit(p);
        }
        else {
          out.add(p);
        }
      }
    };
    visit(base);
    for (const [p, text] of this.files) {
      if (!p.startsWith(`${base}/`)) {
        continue;
      }
      if (text === null) {
        out.delete(p);
      }
      else {
        out.add(p);
      }
    }
    return [...out].sort();
  }

  /** The paths this call will write (not delete), before any is written. */
  pending() {
    return this.order.filter(p => typeof this.files.get(p) === "string");
  }

  /**
   * Write every touched file. Returns what it wrote and deleted, and
   * `restore()`, which puts each touched path back byte for byte.
   */
  writeFiles() {
    const written = [];
    const deleted = [];
    // every path is held to safe() before the first byte is written
    const targets = new Map(this.order.map(p => [p, this.safe(p)]));
    const before = new Map();
    for (const path of this.order) {
      const abs = targets.get(path);
      before.set(
        path,
        existsSync(abs) && statSync(abs).isFile()
          ? { bytes: readFileSync(abs), mode: statSync(abs).mode & 0o777 }
          : null,
      );
    }
    const restore = () => {
      for (const [path, was] of before) {
        const abs = targets.get(path);
        if (was === null) {
          rmSync(abs, { force: true });
          continue;
        }
        mkdirSync(dirname(abs), { recursive: true });
        writeFileSync(abs, was.bytes);
        chmodSync(abs, was.mode);
      }
    };
    try {
      this.writeEach(targets, written, deleted);
    }
    catch (e) {
      // a failure midway leaves nothing half-written
      restore();
      throw e;
    }
    return { written, deleted, restore };
  }

  writeEach(targets, written, deleted) {
    for (const path of this.order) {
      const text = this.files.get(path);
      const abs = targets.get(path);
      if (text === null) {
        if (existsSync(abs)) {
          rmSync(abs);
          deleted.push(path);
          // a folder the delete left empty goes too: pack-remove's conf.d/<slug>/
          for (
            let dir = dirname(abs);
            dir.startsWith(this.realRoot + sep)
            && readdirSync(dir).length === 0;
            dir = dirname(dir)
          ) {
            rmSync(dir, { recursive: true });
          }
        }
        continue;
      }
      mkdirSync(dirname(abs), { recursive: true });
      writeFileSync(abs, text);
      chmodSync(abs, parseInt(this.modes.get(path) ?? "644", 8));
      written.push(path);
    }
  }
}

// --- placing a file -------------------------------------------------------------

/**
 * Plan one source file — an asset, or a rendered template — at `path`: a
 * source that renders empty deletes the repo's copy; a placeholder never
 * overwrites a filled slot; a marked file keeps every line outside its
 * markers; a CI-loaded mise file gets exact pins; and a render the repo's
 * formatter would leave as the file already reads is no change.
 */
function place(ctx, path, source, exec, raw = source) {
  const { ws, env, notes } = ctx;
  const existing = ws.disk(path);
  ws.drop(path);
  // a filled slot wins over everything, an empty render's delete included
  if (filledSlot(raw, existing)) {
    return;
  }
  if (source.trim() === "") {
    if (existing !== null) {
      ws.remove(path);
    }
    return;
  }
  ctx.rendered.add(path);
  let text = source;
  if (existing !== null && isMarked(source)) {
    const spliced = splice(existing, source);
    if (spliced === null) {
      notes.push(
        `${path} has no single tool-config marker pair — its row replaces the whole file`,
      );
    }
    text = spliced ?? source;
  }
  if (isCiLoaded(path)) {
    text = pinExact(text, existing, tool => env.runner.latest(tool));
  }
  if (existing !== null && text !== existing) {
    text = formatted(ctx, path, text) ?? text;
  }
  if (text === existing && ws.diskExec(path) === exec) {
    return;
  }
  ws.write(path, text, modeOf(exec));
}

/** `text` as the repo's formatter would leave it — only once the repo has one installed. */
function formatted(ctx, path, text) {
  const { ws, env } = ctx;
  if (ctx.formatter === undefined) {
    ctx.formatter = ws.disk(DPRINT_CONFIG) !== null && env.runner.has("dprint");
  }
  return ctx.formatter ? env.runner.format(path, text, DPRINT_CONFIG) : null;
}

/** Render one tree's templates in tier order: plain names, then subtask lists, then TASKS. */
function renderTree(ctx, templates, values, { tiers = [0, 1, 2] } = {}) {
  let names = valueNames(values);
  for (const tier of [0, 1, 2]) {
    if (tier === 1) {
      names = { ...names, ...subtaskNames(ctx.ws) };
    }
    if (tier === 2) {
      names = { ...names, TASKS: taskNames(ctx.ws) };
    }
    if (!tiers.includes(tier)) {
      continue;
    }
    for (const t of templates.filter(t => t.tier === tier)) {
      place(
        ctx,
        t.path,
        renderTemplate(t.text, names, t.path),
        t.exec,
        t.text,
      );
    }
  }
}

function readTree(dir) {
  return walk(dir).map(f => {
    const text = readFileSync(f.abs, "utf8");
    return { ...f, text, tier: tierOf(text) };
  });
}

// --- stackgen.yaml ---------------------------------------------------------------

function readDoc(ws) {
  // the parsed file, held to safe() like every other path
  ws.safe(STACKGEN_PATH);
  return readStackgen(ws.root);
}

/** Plan the values file's new text; returns it, for the render to read. */
function setDoc(ctx, doc) {
  const text = stackgenText(doc);
  const existing = ctx.ws.disk(STACKGEN_PATH);
  // a pack call with no values never creates the file for `format` alone
  const empty = Object.keys(doc).every(k => k === "format");
  if (text !== existing && !(existing === null && empty)) {
    ctx.ws.write(STACKGEN_PATH, text, "644");
  }
  return text;
}

// --- commands ----------------------------------------------------------------------

function cmdAll(ctx, call) {
  const doc = withValues(readDoc(ctx.ws), call.values);
  if (!doc.repo_name) {
    throw new RefusalError(
      `all needs --repo-name: ${STACKGEN_PATH} holds no repo_name yet`,
    );
  }
  const values = valuesFrom(setDoc(ctx, doc), ctx.ws.root);
  for (const f of walk(ctx.assetsDir)) {
    place(ctx, f.path, readFileSync(f.abs, "utf8"), f.exec);
  }
  renderTree(ctx, readTree(ctx.templatesDir), values);
}

/** The universal templates that list subtasks or tasks, re-rendered after a pack's files move. */
function rerenderAll(ctx, text) {
  const values = valuesFrom(text, ctx.ws.root);
  renderTree(ctx, readTree(ctx.templatesDir), values, { tiers: [1, 2] });
}

/** Every path tool-config's own assets/ and templates/ ship. */
function shippedPaths(ctx) {
  return [...walk(ctx.assetsDir), ...walk(ctx.templatesDir)].map(f => f.path);
}

/**
 * Why a pack template may not render at `path` (lowercased: every compare is
 * case-blind, as a case-insensitive disk is), or null when it may.
 */
function refusedDestination(path, slug, shipped) {
  const segs = path.split("/");
  if (path === STACKGEN_PATH.toLowerCase()) {
    return "the values file is the script's alone";
  }
  if (segs.includes(".git")) {
    return "nothing renders into .git/";
  }
  if (shipped.has(path)) {
    return "tool-config ships that path itself";
  }
  const confD = `${CONF_D}/`.toLowerCase();
  if (path.startsWith(confD) && segs[confD.split("/").length - 1] !== slug) {
    return `a pack renders into conf.d/${slug}/ alone`;
  }
  if (path.startsWith(`${TASKS_DIR}/`.toLowerCase()) && segs.at(-1) === "all") {
    return "the …:all tasks are tool-config's";
  }
  return null;
}

function cmdPack(ctx, call) {
  const slug = call.flags.slug;
  const dir = resolve(call.flags.dir);
  if (!existsSync(dir) || !statSync(dir).isDirectory()) {
    throw new RefusalError(`--dir ${call.flags.dir} is not a folder`);
  }
  const text = setDoc(ctx, withPack(readDoc(ctx.ws), slug, call.sets));
  const templates = readTree(join(dir, "templates"));
  const shipped = new Set(shippedPaths(ctx).map(p => p.toLowerCase()));
  for (const t of templates) {
    const why = refusedDestination(t.path.toLowerCase(), slug, shipped);
    if (why) {
      throw new RefusalError(`${slug}'s templates/ holds ${t.path} — ${why}`);
    }
  }
  renderTree(ctx, templates, valuesFrom(text, ctx.ws.root, slug));
  rerenderAll(ctx, text);
}

function cmdPackRemove(ctx, call) {
  const slug = call.flags.slug;
  const text = setDoc(ctx, withPack(readDoc(ctx.ws), slug, null));
  // a path tool-config ships itself is never a pack's to delete
  const shipped = new Set(shippedPaths(ctx));
  const owned = [
    ...ctx.ws.list(`${CONF_D}/${slug}/`),
    ...Object
      .values(SUBTASK_DIRS)
      .map(d => `${TASKS_DIR}/${d}/${slug}`)
      .filter(p => ctx.ws.read(p) !== null),
  ];
  for (const path of owned.filter(p => !shipped.has(p)).sort()) {
    ctx.ws.remove(path);
  }
  rerenderAll(ctx, text);
}

/** One row per exact pin a CI-loaded mise file holds that `mise latest` has moved past. */
function cmdUpgrade(ctx) {
  const { ws, env } = ctx;
  const rows = [];
  const files = [
    ".config/mise.toml",
    ...ws.list(`${CONF_D}/`),
  ]
    .filter(isCiLoaded);
  for (const path of files) {
    const text = ws.disk(path);
    for (const pin of pinsOf(text)) {
      if (!isExact(pin.version)) {
        continue;
      }
      let to;
      try {
        to = env.runner.latest(pin.tool);
      }
      catch (e) {
        if (!(e instanceof RefusalError)) {
          throw e;
        }
        // one tool mise cannot resolve holds no other pin back
        ctx.notes.push(
          `${path}: ${pin.tool} left at ${pin.version} — ${e.message}`,
        );
        continue;
      }
      if (
        !isExact(to) || to.replace(/^v/, "") === pin.version.replace(/^v/, "")
      ) {
        continue;
      }
      rows.push({
        kind: "pin",
        path,
        tool: pin.tool,
        from: pin.version,
        to,
        _apply: () =>
          ws.write(
            path,
            setPin(ws.read(path), pin.line, to),
            modeOf(ws.diskExec(path)),
          ),
      });
    }
  }
  return rows;
}

// --- rows -----------------------------------------------------------------------

/** One count-aware line difference: what `after` adds and drops against `before`. */
function lineDiff(before, after) {
  const count = new Map();
  for (const l of before) {
    count.set(l, (count.get(l) ?? 0) + 1);
  }
  const added = [];
  for (const l of after) {
    if (count.get(l)) {
      count.set(l, count.get(l) - 1);
    }
    else {
      added.push(l);
    }
  }
  const removed = [...count].flatMap(([l, n]) => Array(n).fill(l));
  return { added, removed };
}

/** The create, write and delete rows: each planned path against the disk. */
function fileRows(ws) {
  const rows = [];
  const short = t => (t === null ? null : sha256(t).slice(0, 12));
  for (const path of ws.order) {
    const before = ws.disk(path);
    const after = ws.read(path);
    const row = {
      kind: before === null ? "create" : after === null ? "delete" : "write",
      path,
      before: short(before),
      after: short(after),
    };
    if (before !== null && after !== null) {
      Object.assign(
        row,
        lineDiff(splitLines(before).lines, splitLines(after).lines),
      );
      const exec = ws.modes.get(path) === "755";
      if (ws.diskExec(path) !== exec) {
        row.mode = ws.modes.get(path);
      }
    }
    if (path === STACKGEN_PATH) {
      // the call's own values: answering the call is answering them
      row.answers = ["ok"];
    }
    rows.push(row);
  }
  return rows;
}

/**
 * Refuse an answer set that splits a task from what runs it: a kept file
 * that still runs a task this call deletes, or an `ok`'d file — a new
 * `…:all` — that stops running a task the answers keep.
 */
function refuseOrphans(ws, rows, answers) {
  const tasks = answer =>
    rows
      .filter(r =>
        r.kind === "delete"
        && answers.get(r.id) === answer
        && r.path.startsWith(`${TASKS_DIR}/`)
      )
      .map(r => r.path.slice(TASKS_DIR.length + 1).split("/").join(":"));
  // a task name holds no pattern syntax but `.`, which only widens the match
  const runs = (text, t) => new RegExp(`mise run ${t}(\\s|$)`, "m").test(text);
  const gone = tasks("ok");
  const stays = tasks("keep-existing");
  for (const row of rows) {
    const before = ws.disk(row.path) ?? "";
    const answer = answers.get(row.id);
    if (answer === "keep-existing") {
      const task = gone.find(t => runs(before, t));
      if (task) {
        throw new RefusalError(
          `${row.id} keeps ${row.path}, which still runs ${task} — a task this call deletes; answer both rows alike`,
          rows,
        );
      }
    }
    if (answer === "ok" && row.kind === "write") {
      const after = ws.read(row.path) ?? "";
      const task = stays.find(t => runs(before, t) && !runs(after, t));
      if (task) {
        throw new RefusalError(
          `${row.id} rewrites ${row.path} without ${task} — a task the answers keep; answer both rows alike`,
          rows,
        );
      }
    }
  }
}

// --- landing -----------------------------------------------------------------------

/**
 * Write the call's files, then — on `all` — `MISE_ENV=dev mise run setup:all`,
 * then the formatter over every file written, then `pre-commit
 * validate-config` when the hook config was written. A tool a step needs and
 * the repo has not installed refuses before the first byte (on `all`, after
 * setup:all has had its chance). A setup:all failure leaves the files
 * written; a formatter or validate failure puts every file back byte for byte.
 */
function land(ws, env, { all, tail = [], written: onWritten }) {
  const runner = env.runner;
  const pending = ws.pending();
  // `all` finishes the whole rendered set, so a run stopped after its writes
  // is completed by the next: its tail is every file it renders, not only those it writes
  const finish = [...new Set([...pending, ...(all ? tail : [])])].sort();
  const formats = finish.length > 0 && ws.read(DPRINT_CONFIG) !== null;
  const validates = finish.includes(HOOK_CONFIG);
  if (!all) {
    if (formats) {
      runner.ensure("dprint");
    }
    if (validates) {
      runner.ensure("pre-commit");
    }
  }
  const { written, deleted, restore: restoreWritten } = ws.writeFiles();
  // the preview is spent once a byte is written: a re-run previews afresh
  onWritten?.();
  let setupOutput = "";
  if (all) {
    const kept = (why, output) =>
      new RefusalError(
        `${why} — the files this call wrote stay; re-run all once it passes${
          output ? `:\n${output}` : ""
        }`,
        undefined,
        { written, deleted },
      );
    try {
      runner.trust();
    }
    catch (e) {
      throw e instanceof RefusalError ? kept(e.message) : e;
    }
    const setup = runner.setupAll();
    if (!setup.ok) {
      throw kept("MISE_ENV=dev mise run setup:all failed", setup.output);
    }
    setupOutput = setup.output;
  }
  const held = new Map(
    finish.filter(p => !written.includes(p)).map(p => {
      const abs = ws.safe(p);
      return [p, existsSync(abs) ? readFileSync(abs) : null];
    }),
  );
  const restore = () => {
    restoreWritten();
    for (const [p, bytes] of held) {
      if (bytes !== null) {
        writeFileSync(ws.safe(p), bytes);
      }
    }
  };
  const files = finish.filter(p => held.get(p) !== null);
  try {
    if (formats && files.length) {
      runner.tool("dprint", [
        "fmt",
        "--config",
        DPRINT_CONFIG,
        "--allow-no-files",
        ...files,
      ]);
    }
    if (validates) {
      runner.tool("pre-commit", ["validate-config", HOOK_CONFIG]);
    }
  }
  catch (e) {
    restore();
    if (e instanceof RefusalError) {
      throw new RefusalError(
        `${e.message}\nevery file this call wrote is back as it was`,
      );
    }
    throw e;
  }
  // a passing setup:all can still warn (a kept foreign hook manager): relay it
  return { written, deleted, ...(setupOutput && { setup: setupOutput }) };
}

// --- main ------------------------------------------------------------------------------

function repoRootOf(given) {
  if (given) {
    return resolve(given);
  }
  const git = spawnSync("git", ["rev-parse", "--show-toplevel"], {
    encoding: "utf8",
  });
  return git.status === 0 ? git.stdout.trim() : process.cwd();
}

function signatureOf(call, repoRoot) {
  const { command, flags, sets } = call;
  return sha256(JSON.stringify({ root: repoRoot, command, flags, sets }));
}

async function run(argv) {
  const call = parseArgs(argv);
  const pluginRoot = resolve(
    call.globals["plugin-root"] || join(SCRIPT_DIR, "..", "..", ".."),
  );
  const repoRoot = repoRootOf(call.globals["repo-root"]);
  const env = { repoRoot, pluginRoot, runner: new Runner(repoRoot) };
  const ws = new Workspace(repoRoot);
  const skill = join(pluginRoot, "skills", "tool-config");
  const ctx = {
    ws,
    env,
    notes: [],
    rendered: new Set(),
    assetsDir: join(skill, "assets"),
    templatesDir: join(skill, "templates"),
  };

  if (
    (call.command === "all" || call.command === "upgrade") && !onPath("mise")
  ) {
    throw new RefusalError(MISSING_MISE);
  }
  // trust is the person's to grant beforehand; an untrusted config stops here
  env.runner.trust();

  let raised = [];
  if (call.command === "all") {
    cmdAll(ctx, call);
  }
  else if (call.command === "pack") {
    cmdPack(ctx, call);
  }
  else if (call.command === "pack-remove") {
    cmdPackRemove(ctx, call);
  }
  else {
    raised = cmdUpgrade(ctx);
  }
  const rows = numberRows([...fileRows(ws), ...raised]);
  const store = previewStore(repoRoot);
  const signature = signatureOf(call, repoRoot);
  const extra = ctx.notes.length ? { notes: ctx.notes } : {};

  if (call.preview) {
    store.put(signature, rows);
    return { preview: true, rows: rows.map(publicRow), ...extra };
  }
  if (call.answers === null && rows.length) {
    store.put(signature, rows);
    throw new RefusalError(
      "this call shows rows — answer each with --answers <id>:<answer>,…",
      rows,
    );
  }
  if (rows.length) {
    checkAnswers(rows, call.answers ?? new Map(), store.get(signature));
  }
  else if (call.answers?.size) {
    // a re-run of a call that wrote and then stopped: nothing is left to answer
    ctx.notes.push("no rows to answer — --answers ignored");
    extra.notes = ctx.notes;
  }
  for (const row of rows) {
    const answer = call.answers?.get(row.id);
    if (row._apply) {
      if (answer === "ok") {
        row._apply();
      }
    }
    else if (answer === "keep-existing") {
      ws.drop(row.path);
    }
  }
  refuseOrphans(ws, rows, call.answers ?? new Map());
  const kept = new Set(
    rows.filter(r => call.answers?.get(r.id) === "keep-existing").map(r =>
      r.path
    ),
  );
  const { written, deleted, setup } = land(ws, env, {
    all: call.command === "all",
    tail: [...ctx.rendered].filter(p => !kept.has(p)),
    written: () => store.drop(signature),
  });
  return { written, deleted, ...(setup && { setup }), ...extra };
}

try {
  const out = await run(process.argv.slice(2));
  process.stdout.write(JSON.stringify(out, null, 2) + "\n");
}
catch (e) {
  // exitCode, never exit(): exit() can cut a large JSON body short on a pipe
  if (
    e instanceof RefusalError
    || e instanceof UnsafePathError
    || e instanceof ValuesError
    || e instanceof YamlError
  ) {
    const body = {
      error: e.message,
      ...(e.rows && { rows: e.rows.map(publicRow) }),
      ...e.extra,
    };
    process.stdout.write(JSON.stringify(body, null, 2) + "\n");
    process.exitCode = 2;
  }
  else {
    process.stdout.write(
      JSON.stringify({ error: String(e?.message ?? e) }, null, 2) + "\n",
    );
    process.stderr.write(`${e?.stack ?? e}\n`);
    process.exitCode = 1;
  }
}
