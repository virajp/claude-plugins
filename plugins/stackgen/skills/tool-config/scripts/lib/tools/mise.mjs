// The mise tool module — references/mise.md, on the engine's interface (the
// header of tool-config.mjs). `all` lands the assets' .config/ tree and the
// repo-local mise skill, filling the marked positions and resolving every
// `latest` pin to an exact version; the verbs write one requester's lines;
// `upgrade` moves pins forward; `expected` is the drift test's half.
//
// A TOML block body is compared as a set of lines with the whitespace outside
// quotes removed: the shipped formatter re-aligns and re-orders keys, so
// neither is ever a change.

import { posix } from "node:path";
import {
  BlockParseError,
  findRegion,
  joinLines,
  parseBlocks,
  splitLines,
} from "../blocks.mjs";
import {
  isToolConfig,
  sha256,
} from "../record.mjs";
import { parseToolConfigList } from "../schema.mjs";

const BASE = "mise";
const CONF = ".config/mise/conf.d";
const TASKS = ".config/mise/tasks";
const SKILL = ".claude/skills/mise/SKILL.md";
const ENV_TOML = `${CONF}/env.toml`;
const TOOLS_TOML = `${CONF}/tools.toml`;
const ALIAS_TOML = `${CONF}/shell_alias.dev.toml`;
const MISE_TOML = ".config/mise.toml";
const SETUP_ALL = `${TASKS}/setup/all`;
const SETUP_AI = `${TASKS}/setup/ai`;
const SETUP_VSCODE = `${TASKS}/setup/vscode`;
const ENVS = ["dev", "ci", "test"];

/** The section names a `conf.d/<name>[.<env>].toml` may carry; any other name is an old pack fragment. */
const SECTIONS = new Set([
  "alias",
  "env",
  "hooks",
  "plugins",
  "prepare",
  "redactions",
  "settings",
  "shell_alias",
  "task_config",
  "tasks",
  "tools",
  "vars",
  "watch_files",
]);

/** What a fragment's tables fold into. */
const FOLDABLE = new Set(["env", "tools", "shell_alias"]);

/** references/mise.md §3's runtime table: one entry per language `runtimes` names. */
const RUNTIMES = {
  node: {
    block: ["node.compile = false"],
    path: ["_.path = { path = \"node_modules/.bin\", tools = true }"],
  },
};

const ROOT_CONFIGS = [".mise.toml", "mise.toml"];

const OLD_LOCKS = [
  ".config/mise.lock",
  ...ENVS.map(e => `.config/mise.${e}.lock`),
  ".config/mise/mise.lock",
  ...ENVS.map(e => `.config/mise/mise.${e}.lock`),
];
const LOCKS_DIR = ".config/mise/locks";

const MARKER = /^(\s*)(#|\/\/) (>>>|<<<) (\S+)\s*$/;
const TABLE = /^\s*\[\[?\s*([^\]]+?)\s*\]\]?\s*(#.*)?$/;
const KEY = /^\s*("(?:[^"\\]|\\.)*"|'[^']*'|[A-Za-z0-9_.-]+)\s*=\s*(.*?)\s*$/;

const isLocal = p => /(^|\/)[^/]*\.local\.[^/]*$/.test(p);
const unquote = k => (k.startsWith("\"")
  ? JSON.parse(k)
  : k.startsWith("'")
  ? k.slice(1, -1)
  : k);
const tomlKey = k => (/^[A-Za-z0-9_-]+$/.test(k) ? k : JSON.stringify(k));
const table = name => ({ kind: "table", name });

function groupBy(items, keyFn) {
  const out = new Map();
  for (const item of items) {
    const k = keyFn(item);
    if (!out.has(k)) {
      out.set(k, []);
    }
    out.get(k).push(item);
  }
  return out;
}

/** The slug rule of assets/ids.md. */
function slug(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

// --- reading TOML lines -------------------------------------------------------

/** A line with the whitespace outside quotes removed — what a comparison sees. */
function squeeze(line) {
  let out = "";
  let quote = null;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (quote) {
      out += c;
      if (c === "\\" && quote === "\"") {
        out += line[++i] ?? "";
      }
      else if (c === quote) {
        quote = null;
      }
    }
    else if (c === "\"" || c === "'") {
      quote = c;
      out += c;
    }
    else if (!/\s/.test(c)) {
      out += c;
    }
  }
  return out;
}

const bag = (lines, norm = squeeze) =>
  JSON.stringify(lines.map(norm).filter(Boolean).sort());
const sameSet = (a, b, norm) => bag(a, norm) === bag(b, norm);
const sameLines = (a, b) => {
  const t = x => splitLines(x).lines.map(l => l.trimEnd()).join("\n");
  return t(a) === t(b);
};

/** The key of a `key = value` line, unquoted, or null. */
function keyOf(line) {
  if (MARKER.test(line) || /^\s*#/.test(line)) {
    return null;
  }
  const m = KEY.exec(line);
  return m ? unquote(m[1]) : null;
}

/** A TOML basic string's value, or the text as it stands. */
function stringValue(text) {
  const t = text.trim();
  if (t.startsWith("\"")) {
    try {
      return JSON.parse(t.replace(/\s+#.*$/, ""));
    }
    catch {
      return t.slice(1, t.lastIndexOf("\""));
    }
  }
  return t;
}

/** A pin's version: a bare string, or the `version` of an inline table. */
function versionOf(value) {
  if (value.startsWith("\"")) {
    return stringValue(value);
  }
  const m = /\bversion\s*=\s*"([^"]*)"/.exec(value);
  return m ? m[1] : null;
}

function withVersion(line, version) {
  const m = KEY.exec(line);
  if (m[2].startsWith("\"")) {
    return line.replace(/=\s*"[^"]*"/, `= "${version}"`);
  }
  return line.replace(
    /\bversion(\s*)=(\s*)"[^"]*"/,
    `version$1=$2"${version}"`,
  );
}

/** Every key line of a file: its table, the block holding it (null: the user's), the key. */
function scan(path, text) {
  const out = [];
  if (text === null) {
    return out;
  }
  let tableName = null;
  let owner = null;
  splitLines(text).lines.forEach((line, i) => {
    const m = MARKER.exec(line);
    if (m) {
      owner = m[3] === ">>>" ? m[4] : null;
      return;
    }
    const t = TABLE.exec(line);
    if (t) {
      tableName = t[1];
      return;
    }
    const key = keyOf(line);
    if (key !== null) {
      out.push({ path, i, line, table: tableName, owner, key });
    }
  });
  return out;
}

/** A requester's block body in one position, or null. */
function blockIn(text, requester, region) {
  if (text === null) {
    return null;
  }
  const { lines } = splitLines(text);
  const reg = findRegion(lines, region);
  if (!reg) {
    return null;
  }
  const b = parseBlocks(lines).find(x =>
    x.requester === requester && x.open >= reg.start && x.close < reg.end
  );
  return b ? lines.slice(b.open + 1, b.close) : null;
}

// --- the layout -----------------------------------------------------------------

/** `conf.d/<section>[.<env>].toml` → {section, env}, or null. */
function sectionOf(path) {
  const m = /^\.config\/mise\/conf\.d\/([A-Za-z0-9_-]+)(?:\.([a-z]+))?\.toml$/
    .exec(path);
  return m ? { section: m[1], env: m[2] ?? null } : null;
}

const sectionFile = (section, env) =>
  `${CONF}/${section}${env && env !== "all" ? `.${env}` : ""}.toml`;

function confFiles(ctx, section) {
  return ctx
    .list(CONF)
    .filter(p => !isLocal(p) && sectionOf(p)?.section === section);
}

/** How an asset path lands: a task, the skill, a section file or a top-level file. */
function kindOf(path) {
  if (path.startsWith(`${TASKS}/`)) {
    return "task";
  }
  if (path === SKILL) {
    return "skill";
  }
  if (sectionOf(path)) {
    return "section";
  }
  return "top";
}

/** An asset split into its frame and the body the `mise` block holds; `region` is where the block sits. */
function split(path, text) {
  const { lines } = splitLines(text);
  const sec = sectionOf(path);
  if (sec && sec.section !== "tasks") {
    const at = lines.findIndex(l => TABLE.exec(l)?.[1] === sec.section);
    return {
      frame: lines.slice(0, at + 1),
      body: lines.slice(at + 1),
      region: table(sec.section),
    };
  }
  let i = 0;
  while (i < lines.length && /^\s*#/.test(lines[i])) {
    i++;
  }
  if (i === lines.length) {
    return { frame: lines, body: [], region: { kind: "whole" } };
  }
  if (i > 0 && lines[i].trim() !== "") {
    i = 0;
  }
  while (i > 0 && i < lines.length && lines[i].trim() === "") {
    i++;
  }
  return {
    frame: lines.slice(0, i),
    body: lines.slice(i),
    region: { kind: "whole" },
  };
}

// One module call reads the repo as it stood when the call began, so what it
// derives from the assets and the carried values is built once per context.
const memo = new WeakMap();
function once(ctx, name, build) {
  if (!memo.has(ctx)) {
    memo.set(ctx, new Map());
  }
  const m = memo.get(ctx);
  if (!m.has(name)) {
    m.set(name, build());
  }
  return m.get(name);
}

const assetSet = ctx => once(ctx, "assets", () => new Set(ctx.listAssets()));

/** The values the repo carries now — the baseline every drift test renders. */
const carriedValues = ctx => once(ctx, "carried", () => values(ctx, {}));

/** The frame a file opens with when no asset ships it. */
function frameFor(ctx, path) {
  if (assetSet(ctx).has(path)) {
    return split(path, ctx.asset(path)).frame;
  }
  const { section, env } = sectionOf(path);
  const scope = env ? `MISE_ENV=${env} only` : "every MISE_ENV";
  return [`# ${section} for ${scope}.`, "", `[${section}]`];
}

// --- the marked positions -------------------------------------------------------------

const POSITION_ENTRY = {
  PATH_ENTRIES: l => l.trim() !== "" && !/^\s*#/.test(l),
  RUNTIME_BLOCK: l => l.trim() !== "" && !/^\s*#/.test(l),
  MEMBER_ALIASES: l => /^\s*setup-[a-z0-9-]+\s*=/.test(l),
  MEMBER_FLAGS: l => /^#USAGE flag "--/.test(l),
};

const positionAt = (lines, name) =>
  lines.findIndex(l => l.includes("MARKED POSITION") && l.includes(name));

/** The entries filled below a position's comment, or undefined where the comment is absent. */
function readPosition(text, name) {
  if (text === null) {
    return undefined;
  }
  const { lines } = splitLines(text);
  const at = positionAt(lines, name);
  if (at < 0) {
    return undefined;
  }
  const out = [];
  for (let i = at + 1; i < lines.length; i++) {
    const l = lines[i];
    if (MARKER.test(l)) {
      break;
    }
    if (POSITION_ENTRY[name](l)) {
      out.push(l);
    }
    else if (!(out.length === 0 && /^\s*#/.test(l))) {
      break;
    }
  }
  return out;
}

/** Insert entries below a position's comment run. */
function fillPosition(lines, name, entries) {
  const at = positionAt(lines, name);
  if (at < 0 || entries.length === 0) {
    return lines;
  }
  let j = at + 1;
  while (j < lines.length && /^\s*#/.test(lines[j]) && !MARKER.test(lines[j])) {
    j++;
  }
  return [...lines.slice(0, j), ...entries, ...lines.slice(j)];
}

function setValue(lines, key, value) {
  const re = new RegExp(`^(\\s*${key}\\s*=\\s*)"(?:[^"\\\\]|\\\\.)*"(.*)$`);
  return lines.map(l => {
    const m = re.exec(l);
    return m ? `${m[1]}${value}${m[2]}` : l;
  });
}

function readArray(text, name) {
  if (text === null) {
    return undefined;
  }
  const m = new RegExp(`^${name}=\\(([\\s\\S]*?)\\)\\s*$`, "m").exec(text);
  return m ? [...m[1].matchAll(/"([^"]*)"/g)].map(x => x[1]) : undefined;
}

function writeArray(lines, name, rows) {
  const at = lines.findIndex(l => l.startsWith(`${name}=(`));
  if (at < 0) {
    return lines;
  }
  let end = at;
  while (end < lines.length && !/\)\s*$/.test(lines[end])) {
    end++;
  }
  const filled = rows.length
    ? [`${name}=(`, ...rows.map(r => `  "${r}"`), ")"]
    : [`${name}=()`];
  return [...lines.slice(0, at), ...filled, ...lines.slice(end + 1)];
}

/** Every position's value as the repo carries it — undefined where it carries none. */
function carried(ctx) {
  const env = ctx.read(ENV_TOML);
  const str = key => {
    const hit = scan(ENV_TOML, env).find(x => x.key === key);
    return hit ? stringValue(KEY.exec(hit.line)[2]) : undefined;
  };
  let legacy;
  for (const path of confFiles(ctx, "env")) {
    const hit = scan(path, ctx.read(path)).find(x => x.key === "MERGE_MODEL");
    legacy ??= hit ? stringValue(KEY.exec(hit.line)[2]) : undefined;
  }
  return {
    repo: str("REPO_NAME"),
    mergeDevelop: str("MERGE_MODEL_DEVELOP"),
    mergeMain: str("MERGE_MODEL_MAIN"),
    legacy,
    members: str("MEMBERS"),
    pathEntries: readPosition(env, "PATH_ENTRIES"),
    runtimeBlock: readPosition(ctx.read(MISE_TOML), "RUNTIME_BLOCK"),
    aliases: readPosition(ctx.read(ALIAS_TOML), "MEMBER_ALIASES"),
    flags: readPosition(ctx.read(SETUP_ALL), "MEMBER_FLAGS"),
    marketplaces: readArray(ctx.read(SETUP_AI), "EXTRA_MARKETPLACES"),
    plugins: readArray(ctx.read(SETUP_AI), "EXTRA_PLUGINS"),
  };
}

const MERGE_MODELS = ["direct", "pr"];
const LINKAGES = ["siblings", "submodule"];

/**
 * The values `all` fills: each key as given, else as the repo carries it,
 * else its default (references/mise.md §3).
 */
function values(ctx, keys) {
  const was = carried(ctx);
  const has = k => keys[k] !== undefined;
  const list = k => keys[k].split(",").filter(Boolean);
  const refuse = msg => {
    throw new ctx.RefusalError(msg);
  };
  const oneOf = (k, valid) => {
    if (!valid.includes(keys[k])) {
      refuse(
        `--${k} must be one of ${valid.join(", ")}, not ${keys[k] || "empty"}`,
      );
    }
    return keys[k];
  };

  const repo = has("repo") && keys.repo !== ""
    ? keys.repo
    : was.repo ?? "unfilled";
  if (has("repo") && keys.repo !== "" && slug(repo) !== repo) {
    refuse(
      `--repo ${repo} is not a slug — the folder name slugified is ${
        slug(repo) || "empty"
      }`,
    );
  }
  const mergeDevelop = has("merge-model-develop")
    ? oneOf("merge-model-develop", MERGE_MODELS)
    : was.mergeDevelop ?? was.legacy ?? "direct";
  const mergeMain = has("merge-model-main")
    ? oneOf("merge-model-main", MERGE_MODELS)
    : was.mergeMain ?? was.legacy ?? "pr";
  const linkage = has("linkage")
    ? oneOf("linkage", LINKAGES)
    : ctx.exists(".gitmodules")
    ? "submodule"
    : "siblings";

  let members;
  let aliases;
  let flags;
  if (has("members")) {
    const paths = list("members");
    const slugs = paths.map(p => {
      if (!/^[A-Za-z0-9._/-]+$/.test(p) || p.split("/").includes("..")) {
        refuse(`--members: ${p} is not a repo-relative path`);
      }
      const s = slug(posix.basename(p));
      if (!s) {
        refuse(`--members: ${p} names no folder to slug`);
      }
      return s;
    });
    const twice = slugs.find((s, i) => slugs.indexOf(s) !== i);
    if (twice) {
      refuse(`--members: two members slug to ${twice}`);
    }
    members = linkage === "siblings" ? paths.join(" ") : "";
    aliases = slugs.map(s => `setup-${s} = "mise run setup:all --${s}"`);
    flags = slugs.map(s =>
      `#USAGE flag "--${s}" help="Set up the ${s} project"`
    );
  }
  else {
    members = has("linkage") && linkage === "submodule"
      ? ""
      : was.members ?? "";
    aliases = was.aliases ?? [];
    flags = was.flags ?? [];
  }

  let pathEntries = was.pathEntries ?? [];
  let runtimeBlock = was.runtimeBlock ?? [];
  if (has("runtimes")) {
    const langs = list("runtimes");
    pathEntries = langs.flatMap(r => RUNTIMES[r]?.path ?? []);
    runtimeBlock = langs.flatMap(r => RUNTIMES[r]?.block ?? []);
  }

  const rows = (k, pattern, carriedRows) => {
    if (!has(k)) {
      return carriedRows ?? [];
    }
    for (const row of list(k)) {
      if (!pattern.test(row)) {
        refuse(`--${k}: ${row} is not a row this key takes`);
      }
    }
    return list(k);
  };
  return {
    repo,
    mergeDevelop,
    mergeMain,
    members,
    aliases,
    flags,
    pathEntries,
    runtimeBlock,
    marketplaces: rows(
      "plugin-sources",
      /^[A-Za-z0-9._:/@-]+\|[A-Za-z0-9._-]+$/,
      was.marketplaces,
    ),
    plugins: rows("plugins", /^[A-Za-z0-9._-]+@[A-Za-z0-9._-]+$/, was.plugins),
  };
}

// --- rendering the assets -------------------------------------------------------

/** A config asset's body with its positions filled and its pins resolved. */
function renderBody(ctx, path, body, v, pins) {
  let lines = [...body];
  if (path === ENV_TOML) {
    lines = setValue(lines, "REPO_NAME", ctx.tomlString(v.repo));
    lines = setValue(
      lines,
      "MERGE_MODEL_DEVELOP",
      ctx.tomlString(v.mergeDevelop),
    );
    lines = setValue(lines, "MERGE_MODEL_MAIN", ctx.tomlString(v.mergeMain));
    lines = setValue(lines, "MEMBERS", ctx.tomlString(v.members));
    lines = fillPosition(lines, "PATH_ENTRIES", v.pathEntries);
  }
  if (path === MISE_TOML) {
    lines = fillPosition(lines, "RUNTIME_BLOCK", v.runtimeBlock);
  }
  if (path === ALIAS_TOML) {
    lines = fillPosition(lines, "MEMBER_ALIASES", v.aliases);
  }
  if (pins) {
    lines = lines.map(l => {
      const key = keyOf(l);
      return key !== null && pins.has(key) ? withVersion(l, pins.get(key)) : l;
    });
  }
  return lines;
}

/** A whole asset — a task file — with its positions filled. */
function renderWhole(path, text, v) {
  const { lines } = splitLines(text);
  let out = lines;
  if (path === SETUP_ALL) {
    out = fillPosition(out, "MEMBER_FLAGS", v.flags);
  }
  if (path === SETUP_AI) {
    out = writeArray(out, "EXTRA_MARKETPLACES", v.marketplaces);
    out = writeArray(out, "EXTRA_PLUGINS", v.plugins);
  }
  return joinLines(out);
}

// --- pins ---------------------------------------------------------------------------

function toolsFiles(ctx) {
  return confFiles(ctx, "tools");
}

/** Every pin in every tools file, the user's lines included. */
function allPins(ctx) {
  return toolsFiles(ctx).flatMap(path =>
    scan(path, ctx.read(path))
      .filter(x => x.table === "tools")
      .map(x => ({ ...x, version: versionOf(KEY.exec(x.line)[2]) }))
  );
}

/** An exact version: three numeric parts at least, an optional pre-release or build tail. */
const isExact = v => /^v?\d+\.\d+\.\d+([-+.][0-9A-Za-z.-]+)?$/.test(v ?? "");

/** Whether a written version answers a requested spec: `latest` takes any exact one, a prefix its own line. */
const satisfies = (written, spec) =>
  isExact(written)
  && (spec === "latest" || written === spec || written.startsWith(`${spec}.`));

/**
 * `mise latest <tool>` — `<tool>@<prefix>` for a prefix spec — once per call;
 * a failure refuses the call naming the tool. Every pin written is exact.
 */
function resolver(ctx) {
  const seen = new Map();
  return (name, spec = "latest") => {
    if (isExact(spec)) {
      return spec;
    }
    const arg = spec === "latest" ? name : `${name}@${spec}`;
    if (!seen.has(arg)) {
      const res = ctx.exec("mise", ["latest", arg]);
      const out = (res.stdout ?? "").trim().split("\n")[0]?.trim() ?? "";
      if (res.status !== 0 || !out || /\s/.test(out)) {
        const why = (res.stderr ?? "").trim().split("\n")[0]
          || `exit ${res.status}`;
        throw new ctx.RefusalError(
          `mise latest ${arg} gave no version (${why}) — a pin is only ever written exact`,
        );
      }
      seen.set(arg, out);
    }
    return seen.get(arg);
  };
}

// --- ops -------------------------------------------------------------------------------

const dropOp = x => ({
  op: "drop-lines",
  path: x.path,
  match: x.line.trim(),
  requester: x.owner,
});

const byKey = (a, b) => {
  const ka = keyOf(a) ?? a;
  const kb = keyOf(b) ?? b;
  return ka < kb ? -1 : ka > kb ? 1 : 0;
};

/**
 * A clash a requester's call was answered keep-existing on, kept as a comment
 * in that requester's own block: the record of the answer, so the same call
 * unchanged raises no row again. `remove`, or the clash going away, clears it.
 */
const DECLINED = /^\s*# keep-existing: (\S+)\s*$/;

function declinedIn(ctx, path, region, requester) {
  return new Set(
    (blockIn(ctx.read(path), requester, region) ?? [])
      .map(l => DECLINED.exec(l)?.[1])
      .filter(Boolean),
  );
}

/** The op that records a keep-existing answer in the requester's block. */
function decline(ctx, path, region, requester, key) {
  const body = blockIn(ctx.read(path), requester, region) ?? [];
  return {
    op: "block",
    path,
    requester,
    body: [...body, `# keep-existing: ${key}`].sort(byKey),
    region,
    frame: frameFor(ctx, path),
  };
}

/** One requester's block with `line` set for its key — replaced in place or added, the body key-sorted. */
function blockWith(ctx, path, region, requester, key, line) {
  const body = (blockIn(ctx.read(path), requester, region) ?? []).filter(l =>
    DECLINED.exec(l)?.[1] !== key
  );
  const at = body.findIndex(l => keyOf(l) === key);
  const next = at >= 0
    ? body.map((l, i) => (i === at ? line : l))
    : [...body, line].sort(byKey);
  return {
    op: "block",
    path,
    requester,
    body: next,
    region,
    frame: frameFor(ctx, path),
  };
}

/** The user's line for a key, replaced in place or added below the frame. */
function userLine(ctx, path, region, line, existing) {
  return {
    op: "user-line",
    path,
    line,
    match: existing?.line.trim(),
    region,
    frame: frameFor(ctx, path),
  };
}

/**
 * Write one keyed line for a requester (null: the user's line), holding the
 * one-key rule over `scope`: a key held anywhere else in it is a conflict row,
 * and nothing is written until it is answered. `keep(existing)` keeps the
 * requester's own line as it stands.
 */
function keyed(ctx, { path, region, requester, key, line, scope, keep, what }) {
  const mine = x => x.path === path && x.owner === requester;
  const own = scope.find(x => x.key === key && mine(x));
  const outside = scope.filter(x => x.key === key && !mine(x));
  const write = requester
    ? blockWith(ctx, path, region, requester, key, line)
    : userLine(ctx, path, region, line, own);
  const settled = own && (squeeze(own.line) === squeeze(line) || keep?.(own));
  if (outside.length === 0) {
    return { ops: settled ? [] : [write] };
  }
  if (requester && declinedIn(ctx, path, region, requester).has(key)) {
    return { ops: [] };
  }
  return {
    ops: [],
    rows: [{
      kind: "conflict",
      path,
      [what]: key,
      requester: requester ?? "user",
      requested: line,
      existing: outside.map(x => ({
        path: x.path,
        holder: x.owner ?? "user",
        line: x.line.trim(),
      })),
      reason: `${key} is already ${
        what === "tool" ? "pinned" : "set"
      } — one ${what} per name`,
      answers: ctx.ANSWERS.conflict,
      effects: {
        "keep-existing": requester
          ? [decline(ctx, path, region, requester, key)]
          : [],
        overwrite: [...outside.map(dropOp), ...(settled ? [] : [write])],
      },
    }],
  };
}

// --- the task table -------------------------------------------------------------------

function header(text) {
  const out = {};
  for (const line of splitLines(text).lines.slice(0, 40)) {
    const m = /^(?:#|\/\/)\s?MISE\s+([a-z_]+)\s*=\s*(.*)$/.exec(line);
    if (m && !(m[1] in out)) {
      out[m[1]] = stringValue(m[2]);
    }
  }
  return out;
}

function inlineTasks(text) {
  const out = [];
  let current = null;
  for (const line of text === null ? [] : splitLines(text).lines) {
    const t = TABLE.exec(line);
    if (t) {
      const m = /^tasks\.(.+)$/.exec(t[1]);
      current = m
        ? { name: unquote(m[1]), description: "", hide: false }
        : null;
      if (current) {
        out.push(current);
      }
      continue;
    }
    const key = current && keyOf(line);
    if (key === "description") {
      current.description = stringValue(KEY.exec(line)[2]);
    }
    if (key === "hide") {
      current.hide = KEY.exec(line)[2].trim() === "true";
    }
  }
  return out;
}

/** The task table's rows: every task file and inline task, `_scripts/` and hidden ones left out. */
function taskRows(ctx, pending = new Map()) {
  const paths = new Set(ctx.list(TASKS));
  for (const p of pending.keys()) {
    if (p.startsWith(`${TASKS}/`)) {
      paths.add(p);
    }
  }
  const read = p => (pending.has(p) ? pending.get(p) : ctx.read(p));
  const tasks = [];
  for (const p of paths) {
    const rel = p.slice(TASKS.length + 1);
    if (rel.split("/")[0] === "_scripts") {
      continue;
    }
    const text = read(p);
    if (text === null) {
      continue;
    }
    const h = header(text);
    if (h.hide === "true") {
      continue;
    }
    const name = rel.split("/").filter(s => s !== "_default").join(":");
    tasks.push({ name, description: h.description ?? "" });
  }
  const conf = `${CONF}/tasks.toml`;
  for (const t of inlineTasks(read(conf))) {
    if (!t.hide) {
      tasks.push(t);
    }
  }
  tasks.sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
  return tasks.map(t =>
    `| \`${t.name}\` | ${t.description.replaceAll("|", "\\|")} |`
  );
}

const OPEN_TABLE = "<!-- >>> tasks -->";
const CLOSE_TABLE = "<!-- <<< tasks -->";

/** The skill split at its table: the lines around it, and the table's rows. */
function skillParts(text) {
  const { lines } = splitLines(text);
  const open = lines.findIndex(l => l.trim() === OPEN_TABLE);
  const close = lines.findIndex(l => l.trim() === CLOSE_TABLE);
  if (open < 0 || close < open) {
    return null;
  }
  return {
    before: lines.slice(0, open + 1),
    rows: lines.slice(open + 3, close),
    after: lines.slice(close),
  };
}

const TABLE_HEAD = ["| Task | Description |", "| ---- | ----------- |"];
const cells = l =>
  l.split("|").map(c => c.trim().replace(/^-+$/, "-")).join("|");

function withTable(text, rows) {
  const parts = skillParts(text);
  return joinLines([...parts.before, ...TABLE_HEAD, ...rows, ...parts.after]);
}

/**
 * The skill's op: the asset with a fresh table on `all`, the table alone on a
 * verb. The table is the base's and never drift; the rest of the file is.
 */
function skillOp(ctx, pending, landing) {
  const current = ctx.read(SKILL);
  const rows = taskRows(ctx, pending);
  const asset = ctx.asset(SKILL);
  if (current === null) {
    return landing
      ? { op: "whole", path: SKILL, content: withTable(asset, rows) }
      : null;
  }
  const have = skillParts(current);
  if (!have) {
    return landing
      ? {
        op: "whole",
        path: SKILL,
        content: withTable(asset, rows),
        drift: true,
      }
      : null;
  }
  const record = ctx.record(SKILL);
  const tableSame =
    JSON.stringify(have.rows.map(cells)) === JSON.stringify(rows.map(cells));
  const staticSame = sameLines(
    joinLines([...have.before, ...have.after].map(squeeze)),
    joinLines(
      [...skillParts(asset).before, ...skillParts(asset).after].map(squeeze),
    ),
  );
  if (!landing) {
    return tableSame || !record || !isToolConfig(record)
      ? null
      : {
        op: "whole",
        path: SKILL,
        content: withTable(current, rows),
        force: true,
      };
  }
  if (staticSame && tableSame) {
    return null;
  }
  if (staticSame && record) {
    return {
      op: "whole",
      path: SKILL,
      content: withTable(current, rows),
      force: true,
    };
  }
  return {
    op: "whole",
    path: SKILL,
    content: withTable(asset, rows),
    ...(untouched(ctx, SKILL, current) ? { force: true } : { drift: true }),
  };
}

// --- all ----------------------------------------------------------------------------------

/** The base's pins and keys that something else in the repo already holds: conflict rows, or settled. */
function baseClashes(ctx, path, region, body, mine, rows, resolve) {
  const omit = new Set();
  const sec = sectionOf(path);
  if (!sec || !["tools", "env", "shell_alias"].includes(sec.section)) {
    return omit;
  }
  const scope = sec.section === "tools"
    ? allPins(ctx)
    : scan(path, ctx.read(path)).filter(x => x.table === sec.section);
  for (const line of body) {
    const key = keyOf(line);
    if (key === null) {
      continue;
    }
    const outside = scope.filter(x =>
      x.key === key && !(x.path === path && x.owner === BASE)
    );
    if (outside.length === 0) {
      continue;
    }
    const inBlock = scope.find(x =>
      x.key === key && x.path === path && x.owner === BASE
    );
    if (mine !== null && !inBlock) {
      omit.add(key);
      continue;
    }
    if (!inBlock) {
      omit.add(key);
    }
    const what = sec.section === "tools"
      ? "tool"
      : sec.section === "env"
      ? "key"
      : "alias";
    const spec = sec.section === "tools" ? versionOf(KEY.exec(line)[2]) : null;
    const resolved = spec !== null && !isExact(spec)
      ? withVersion(line, resolve(key, spec))
      : line;
    rows.push({
      kind: "conflict",
      path,
      [what]: key,
      requester: BASE,
      requested: inBlock ? inBlock.line.trim() : resolved.trim(),
      existing: outside.map(x => ({
        path: x.path,
        holder: x.owner ?? "user",
        line: x.line.trim(),
      })),
      reason: `the base ${
        what === "tool" ? "pins" : "sets"
      } ${key}, which the repo already ${
        what === "tool" ? "pins" : "sets"
      } — one per name`,
      answers: ctx.ANSWERS.conflict,
      effects: {
        "keep-existing": inBlock ? [dropOp(inBlock)] : [],
        overwrite: [
          ...outside.map(dropOp),
          ...(inBlock
            ? []
            : [{
              op: "entry",
              path,
              requester: BASE,
              line: resolved,
              region,
              frame: frameFor(ctx, path),
            }]),
        ],
      },
    });
  }
  return omit;
}

/** The pins a tools asset body lands at: exact as shipped, else as already written, else resolved. */
function basePins(ctx, path, body, mine, resolve) {
  const written = new Map(
    (mine ?? []).map(l => [keyOf(l), keyOf(l) && versionOf(KEY.exec(l)[2])]),
  );
  const pins = new Map();
  for (const line of body) {
    const key = keyOf(line);
    const spec = key === null ? null : versionOf(KEY.exec(line)[2]);
    if (spec === null || isExact(spec)) {
      continue;
    }
    const was = written.get(key);
    pins.set(
      key,
      satisfies(was, spec) ? was : resolve ? resolve(key, spec) : spec,
    );
  }
  return pins;
}

/** The legacy MERGE_MODEL key is the pair's predecessor: never compared, always migrated. */
const notLegacy = path => l =>
  path !== ENV_TOML
  || !/^(MERGE_MODEL|MERGE_MODEL_DEVELOP|MERGE_MODEL_MAIN)$/.test(
    keyOf(l) ?? "",
  );

function configOps(ctx, path, v, rows, resolve) {
  const asset = split(path, ctx.asset(path));
  const current = ctx.read(path);
  if (asset.body.length === 0) {
    const content = ctx.asset(path);
    if (current === null || sameLines(current, content)) {
      return [{ op: "whole", path, content: current ?? content }];
    }
    if (untouched(ctx, path, current)) {
      return [{ op: "whole", path, content, force: true }];
    }
    const recorded = ctx.record(path) !== null;
    return [{ op: "whole", path, content, drift: recorded }];
  }
  const sec = sectionOf(path);
  if (
    !sec && current !== null && blockIn(
        current,
        BASE,
        asset.region,
      ) === null
  ) {
    rows.push(ctx.needsEdit({
      file: path,
      reason:
        "a top-level mise file holding no mise block — its own lines would collide with the base's",
      target:
        `the base's ${path} from the skill's assets, with this file's own settings below its block`,
    }));
    return [];
  }
  const mine = blockIn(current, BASE, asset.region);
  const omit = baseClashes(
    ctx,
    path,
    asset.region,
    asset.body,
    mine,
    rows,
    resolve,
  );
  const body = asset.body.filter(l => !omit.has(keyOf(l)));
  const pins = sec?.section === "tools"
    ? basePins(ctx, path, body, mine, resolve)
    : null;
  const want = renderBody(ctx, path, body, v, pins);
  const op = {
    op: "block",
    path,
    requester: BASE,
    body: want,
    region: asset.region,
    frame: asset.frame,
  };
  if (mine === null) {
    return [op];
  }
  if (sameSet(mine, want)) {
    return [];
  }
  if (untouched(ctx, path, current)) {
    return [op];
  }
  const was = carriedValues(ctx);
  const baseline = renderBody(
    ctx,
    path,
    body,
    was,
    sec?.section === "tools" ? basePins(ctx, path, body, mine, null) : null,
  );
  const keep = notLegacy(path);
  const drifted = !sameSet(mine.filter(keep), baseline.filter(keep));
  return [{ ...op, drift: drifted }];
}

/**
 * Whether a file is exactly what tool-config last wrote — its content hashes
 * to its lock record. Nobody edited it, so a newer asset replaces it as a
 * plain update, never as drift.
 */
function untouched(ctx, path, current) {
  const record = ctx.record(path);
  return current !== null && record?.hash === sha256(current);
}

/** Whether another source's lock entry owns a path — a pack overlay's task file, say. */
function foreign(ctx, path) {
  const source = ctx.source(path);
  return source !== null && !isToolConfig({ source });
}

/** A delete that takes over whatever source owns the path: the lock is gone, so are its files. */
const takeOver = (ctx, path) => ({
  op: "delete",
  path,
  supersedes: ctx.source(path),
});

function taskOps(ctx, path, v, pending) {
  const record = ctx.record(path);
  if (foreign(ctx, path)) {
    return [];
  }
  const want = renderWhole(path, ctx.asset(path), v);
  const current = ctx.read(path);
  const op = { op: "whole", path, content: want, mode: "755" };
  if (current === null) {
    pending.set(path, want);
    return [op];
  }
  if (sameLines(current, want)) {
    pending.set(path, current);
    return [{ ...op, content: current }];
  }
  if (!record) {
    return [op];
  }
  const baseline = renderWhole(path, ctx.asset(path), carriedValues(ctx));
  if (untouched(ctx, path, current) || sameLines(current, baseline)) {
    pending.set(path, want);
    return [{ ...op, force: true }];
  }
  return [{ ...op, drift: true }];
}

/** references/mise.md §5: every step a row; nothing dropped unseen. */
function migrate(ctx, pending, rows, notes) {
  const ops = [];
  for (const path of confFiles(ctx, "env")) {
    for (
      const x of scan(path, ctx.read(path)).filter(y => y.key === "MERGE_MODEL")
    ) {
      rows.push({
        kind: "move",
        path,
        line: x.line.trim(),
        reason:
          "the legacy MERGE_MODEL becomes MERGE_MODEL_DEVELOP and MERGE_MODEL_MAIN in the mise block",
        answers: ["ok"],
        effects: { ok: [dropOp(x)] },
      });
    }
  }

  for (const path of ctx.list(CONF)) {
    const sec = sectionOf(path);
    if (isLocal(path) || !sec || SECTIONS.has(sec.section)) {
      continue;
    }
    rows.push(fold(ctx, path, sec));
  }

  for (const path of ROOT_CONFIGS) {
    if (ctx.exists(path)) {
      rows.push(ctx.needsEdit({
        file: path,
        reason:
          "a root mise config — the layout keeps every mise file under .config/",
        target:
          "[settings] and top-level keys → .config/mise.toml; [tools], [env], [shell_alias] → .config/mise/conf.d/<section>.toml; [tasks.*] → .config/mise/conf.d/tasks.toml; then delete it",
      }));
    }
  }
  for (const path of [MISE_TOML, ...ENVS.map(e => `.config/mise.${e}.toml`)]) {
    const extra = scan(path, ctx.read(path)).find(x =>
      x.owner === null && x.table !== null && !x.table.startsWith("settings")
    );
    if (extra) {
      rows.push(ctx.needsEdit({
        file: path,
        reason:
          `a top-level mise file carrying [${extra.table}] — sections live in conf.d`,
        target: `[${extra.table}] → .config/mise/conf.d/${
          extra.table.split(".")[0]
        }.toml; the rest stays as settings`,
      }));
    }
  }

  for (const path of OLD_LOCKS) {
    if (ctx.exists(path)) {
      ops.push(takeOver(ctx, path));
    }
  }
  const sidecars = ctx.list(LOCKS_DIR);
  if (sidecars.length) {
    rows.push({
      kind: "delete",
      path: `${LOCKS_DIR}/`,
      files: sidecars.length,
      reason:
        "the lock is gone, and with it the sidecars its entries pointed at",
      answers: ["ok"],
      effects: { ok: sidecars.map(p => takeOver(ctx, p)) },
    });
  }

  const vscode = ctx.read(SETUP_VSCODE);
  if (vscode !== null) {
    const record = ctx.record(SETUP_VSCODE);
    const setupAll = pending.get(SETUP_ALL) ?? ctx.read(SETUP_ALL) ?? "";
    if (!record || !isToolConfig(record) || record.hash !== sha256(vscode)) {
      notes.push(
        `${SETUP_VSCODE} kept: it was changed since it was landed — delete it by hand once nothing runs it`,
      );
    }
    else if (setupAll.includes("setup:vscode")) {
      notes.push(`${SETUP_VSCODE} kept: this repo's setup/all still runs it`);
    }
    else {
      ops.push({ op: "delete", path: SETUP_VSCODE });
      pending.set(SETUP_VSCODE, null);
    }
  }

  rows.push(...hoists(ctx));
  return ops;
}

/** An old pack fragment folded into its requester's blocks, or a needs-edit row where it does not parse. */
function fold(ctx, path, { section: requester, env }) {
  const text = ctx.read(path);
  const tables = new Map();
  let current = null;
  let bad = /^[a-z0-9][a-z0-9-]*$/.test(requester)
    ? null
    : "its name is not a requester slug";
  for (const line of splitLines(text).lines) {
    if (bad) {
      break;
    }
    if (line.trim() === "" || /^\s*#/.test(line)) {
      continue;
    }
    const t = TABLE.exec(line);
    if (t) {
      current = FOLDABLE.has(t[1]) ? t[1] : null;
      bad = current ? null : `[${t[1]}] is not a section a block can hold`;
      continue;
    }
    const m = KEY.exec(line);
    if (!current || !m || /[[{]$/.test(m[2]) || /"""|'''/.test(m[2])) {
      bad = `cannot read: ${line.trim()}`;
      continue;
    }
    if (!tables.has(current)) {
      tables.set(current, []);
    }
    tables.get(current).push(line.trim());
  }
  const into = [...tables.keys()].map(s => sectionFile(s, env));
  if (bad || tables.size === 0) {
    return ctx.needsEdit({
      file: path,
      reason: `an old pack fragment that cannot be folded: ${
        bad ?? "it holds no section"
      }`,
      target: `${requester}'s blocks in .config/mise/conf.d/<section>${
        env ? `.${env}` : ""
      }.toml, then delete it`,
    });
  }
  const ops = [...tables].map(([s, lines]) => ({
    op: "block",
    path: sectionFile(s, env),
    requester,
    body: [...lines].sort(byKey),
    region: table(s),
    frame: frameFor(ctx, sectionFile(s, env)),
  }));
  return {
    kind: "fold",
    path,
    requester,
    into,
    reason:
      `an old pack fragment — split into ${requester}'s blocks, then deleted`,
    answers: ["ok"],
    effects: { ok: [...ops, takeOver(ctx, path)] },
  };
}

const newer = (a, b) => {
  const pa = a.split(/[.-]/).map(Number);
  const pb = b.split(/[.-]/).map(Number);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    if ((pa[i] ?? 0) !== (pb[i] ?? 0)) {
      return (pa[i] ?? 0) > (pb[i] ?? 0) ? a : b;
    }
  }
  return a;
};

/** A non-base tool pinned in two environment files moves to tools.toml, as one row. */
function hoists(ctx) {
  const base = new Set(
    ctx
      .listAssets()
      .filter(p => sectionOf(p)?.section === "tools")
      .flatMap(p => split(p, ctx.asset(p)).body.map(keyOf).filter(Boolean)),
  );
  const pins = allPins(ctx);
  const rows = [];
  const byTool = groupBy(
    pins.filter(x => x.path !== TOOLS_TOML && !base.has(x.key)),
    x => x.key,
  );
  for (const [tool, held] of byTool) {
    if (
      new Set(held.map(x => x.path)).size < 2
      || pins.some(x => x.key === tool && x.path === TOOLS_TOML)
    ) {
      continue;
    }
    const version = held.map(x => x.version ?? "").reduce(newer);
    const first = held[0];
    const line = withVersion(first.line.trim(), version);
    const region = table("tools");
    const write = first.owner
      ? {
        op: "entry",
        path: TOOLS_TOML,
        requester: first.owner,
        line,
        region,
        frame: frameFor(ctx, TOOLS_TOML),
      }
      : userLine(ctx, TOOLS_TOML, region, line);
    rows.push({
      kind: "hoist",
      tool,
      path: TOOLS_TOML,
      from: held.map(x => ({
        path: x.path,
        holder: x.owner ?? "user",
        line: x.line.trim(),
      })),
      to: line,
      reason:
        `${tool} is pinned in ${held.length} environment files — one pin, in tools.toml`,
      answers: ["ok", "keep-existing"],
      effects: { ok: [...held.map(dropOp), write], "keep-existing": [] },
    });
  }
  return rows;
}

function all(ctx, keys) {
  const v = values(ctx, keys);
  const resolve = resolver(ctx);
  const rows = [];
  const notes = [];
  const pending = new Map();
  const ops = [];
  for (const path of ctx.listAssets()) {
    const kind = kindOf(path);
    if (foreign(ctx, path)) {
      notes.push(`${path} is ${ctx.source(path)}'s — left alone`);
      continue;
    }
    try {
      if (kind === "task") {
        ops.push(...taskOps(ctx, path, v, pending));
      }
      else if (kind === "section" || kind === "top") {
        ops.push(...configOps(ctx, path, v, rows, resolve));
      }
    }
    catch (e) {
      if (!(e instanceof BlockParseError)) {
        throw e;
      }
      rows.push(ctx.needsEdit({
        file: path,
        reason: `unreadable block markers: ${e.message}`,
        target: "balanced # >>> <req> / # <<< <req> pairs",
      }));
    }
  }
  pending.set(
    `${CONF}/tasks.toml`,
    ctx.read(`${CONF}/tasks.toml`) ?? ctx.asset(`${CONF}/tasks.toml`),
  );
  ops.push(...migrate(ctx, pending, rows, notes));
  const skill = foreign(ctx, SKILL) ? null : skillOp(ctx, pending, true);
  if (skill) {
    ops.push(skill);
  }
  return { ops, rows, notes };
}

// --- the verbs ---------------------------------------------------------------------------------

function envScope(ctx, path) {
  return scan(path, ctx.read(path)).filter(x => x.table === "env");
}

function addTool(ctx, { flags, for: requester }) {
  const path = sectionFile("tools", flags.env);
  const region = table("tools");
  const spec = flags.version;
  const scope = allPins(ctx);
  const own = scope.find(x =>
    x.key === flags.name && x.path === path && x.owner === requester
  );
  const resolved = satisfies(own?.version, spec)
    ? own.version
    : resolver(ctx)(flags.name, spec);
  const line = `${tomlKey(flags.name)} = { version = ${
    ctx.tomlString(resolved)
  } }`;
  return keyed(ctx, {
    path,
    region,
    requester,
    key: flags.name,
    line,
    scope,
    keep: x => satisfies(x.version, spec),
    what: "tool",
  });
}

function addEnv(ctx, { flags, for: requester }) {
  const path = sectionFile("env", flags.env);
  const machine = requester ? ctx.machineEnv(requester) : [];
  return keyed(ctx, {
    path,
    region: table("env"),
    requester,
    key: flags.key,
    line: `${flags.key} = ${ctx.tomlString(flags.value ?? "")}`,
    scope: envScope(ctx, path),
    keep: () => machine.includes(flags.key),
    what: "key",
  });
}

/** Where a key is set in an [env] table outside every conf.d block — the files mise reads after conf.d included. */
function envOutside(ctx, key) {
  const top = [
    MISE_TOML,
    ...ENVS.map(e => `.config/mise.${e}.toml`),
    ...ROOT_CONFIGS,
  ];
  return [
    ...confFiles(ctx, "env").flatMap(p => envScope(ctx, p)),
    ...top.flatMap(p => scan(p, ctx.read(p)).filter(x => x.table === "env")),
  ]
    .filter(x => x.key === key && x.owner === null);
}

function setEnv(ctx, { flags, for: requester }) {
  const key = flags.key;
  const line = `${key} = ${ctx.tomlString(flags.value ?? "")}`;
  const region = table("env");
  const outside = envOutside(ctx, key);
  if (!requester) {
    const own = outside.find(x => sectionOf(x.path));
    if (!own) {
      throw new ctx.RefusalError(
        `no line of yours sets ${key} in .config/mise/conf.d/env*.toml — set env with no --for rewrites only your own line`,
      );
    }
    return squeeze(own.line) === squeeze(line)
      ? { ops: [] }
      : { ops: [userLine(ctx, own.path, region, line, own)] };
  }
  const held = confFiles(ctx, "env")
    .flatMap(p => envScope(ctx, p))
    .find(x => x.key === key && x.owner === requester);
  if (!held) {
    throw new ctx.RefusalError(
      `${requester}'s block sets no ${key} — set env rewrites a key its requester's block already sets`,
    );
  }
  if (squeeze(held.line) === squeeze(line)) {
    return { ops: [] };
  }
  const write = blockWith(ctx, held.path, region, requester, key, line);
  const sameFile = outside.find(x => x.path === held.path);
  if (sameFile && declinedIn(ctx, held.path, region, requester).has(key)) {
    return { ops: [] };
  }
  const rows = outside.map(x => ({
    kind: "conflict",
    path: x.path,
    key,
    requester,
    requested: line,
    existing: [{ path: x.path, holder: "user", line: x.line.trim() }],
    reason: x === sameFile
      ? `${key} is also set by your line in the block's own file — a table holds a key once`
      : `${key} is also set outside ${requester}'s block — ${
        winner(x.path, held.path)
      } wins`,
    answers: x === sameFile
      ? ["move-in", "keep-existing"]
      : ["move-in", "keep-both"],
    effects: x === sameFile
      ? {
        "move-in": [dropOp(x), write],
        "keep-existing": [decline(ctx, held.path, region, requester, key)],
      }
      : { "move-in": [dropOp(x)], "keep-both": [] },
  }));
  return { ops: sameFile ? [] : [write], rows };
}

/** Which of two files mise lets win for one key: any top-level file over conf.d; an environment's file over the base's. */
function winner(a, b) {
  if (!sectionOf(a)) {
    return a;
  }
  const envOf = p => sectionOf(p).env ?? "";
  if (Boolean(envOf(a)) !== Boolean(envOf(b))) {
    return envOf(a) ? a : b;
  }
  return a > b ? a : b;
}

function addAlias(ctx, { flags, for: requester }) {
  return keyed(ctx, {
    path: ALIAS_TOML,
    region: table("shell_alias"),
    requester,
    key: flags.name,
    line: `${tomlKey(flags.name)} = ${ctx.tomlString(flags.command)}`,
    scope: scan(ALIAS_TOML, ctx.read(ALIAS_TOML)).filter(x =>
      x.table === "shell_alias"
    ),
    what: "alias",
  });
}

/** A pack's structured mise entries, from its pack.yaml; none for a pack this plugin does not ship. */
function packEntries(ctx, requester) {
  return once(ctx, `pack:${requester}`, () => {
    const text = ctx.pack(requester);
    if (text === null) {
      return [];
    }
    try {
      return parseToolConfigList(text).filter(e =>
        typeof e === "object" && e.tool === "mise"
      );
    }
    catch {
      return [];
    }
  });
}

/** The version spec that put a pin where it is: the base's asset, the pack's entry, else `latest`. */
function declaredSpec(ctx, x) {
  if (x.owner === BASE && assetSet(ctx).has(x.path)) {
    const line = split(x.path, ctx.asset(x.path)).body.find(l =>
      keyOf(l) === x.key
    );
    return (line && versionOf(KEY.exec(line)[2])) ?? "latest";
  }
  if (x.owner && x.owner !== BASE) {
    const e = packEntries(ctx, x.owner).find(y =>
      y.verb === "add-tool"
      && y.name === x.key
      && sectionFile("tools", y.env) === x.path
    );
    return e ? String(e.version) : "latest";
  }
  return "latest";
}

function upgrade(ctx) {
  if (!(ctx.env.MISE_ENV ?? "").split(",").includes("dev")) {
    throw new ctx.RefusalError(
      "upgrade is dev only — run it under MISE_ENV=dev",
    );
  }
  const resolve = resolver(ctx);
  const region = table("tools");
  const rows = [];
  for (const x of allPins(ctx).filter(p => p.version !== null)) {
    // A pin moves only as far as what declared it allows: an exact version is
    // deliberate and stays, so `all` and the pack's entries never undo upgrade.
    const spec = declaredSpec(ctx, x);
    if (isExact(spec)) {
      continue;
    }
    const to = resolve(x.key, spec);
    if (x.version === to) {
      continue;
    }
    const line = withVersion(x.line, to);
    // Line-level ops, so the accepted rows of one block compose into one write:
    // the new pin joins the block, then the old one leaves it.
    const ok = x.owner
      ? [
        {
          op: "entry",
          path: x.path,
          requester: x.owner,
          line,
          region,
          frame: frameFor(ctx, x.path),
        },
        dropOp(x),
      ]
      : [userLine(ctx, x.path, region, line, x)];
    rows.push({
      kind: "upgrade",
      path: x.path,
      requester: x.owner ?? "user",
      tool: x.key,
      from: x.version,
      to,
      answers: ["ok", "keep"],
      effects: { ok, keep: [] },
    });
  }
  return { ops: [], rows };
}

const VERBS = {
  "add-tool": addTool,
  "add-env": addEnv,
  "set-env": setEnv,
  "add-alias": addAlias,
  upgrade,
  remove: (ctx, call) => ({ ops: [{ op: "remove", requester: call.for }] }),
};

function plan(ctx, call) {
  const result = VERBS[call.verb](ctx, call);
  const table = skillOp(ctx, new Map(), false);
  return { ...result, ops: [...(result.ops ?? []), ...(table ? [table] : [])] };
}

// --- check ----------------------------------------------------------------------------------

/** What one pack's structured mise entries write into `path`, the pins as the file holds them. */
function packLines(ctx, requester, path, mine) {
  const entries = packEntries(ctx, requester);
  if (entries.length === 0) {
    return null;
  }
  const written = new Map(mine.map(l => [keyOf(l), l]));
  const lines = [];
  for (const e of entries) {
    if (e.verb === "add-tool" && sectionFile("tools", e.env) === path) {
      const was = written.get(e.name);
      const spec = String(e.version);
      const held = was ? versionOf(KEY.exec(was)[2]) : null;
      const v = satisfies(held, spec) ? held : spec;
      lines.push(
        `${tomlKey(e.name)} = { version = ${ctx.tomlString(String(v))} }`,
      );
    }
    if (e.verb === "add-env" && sectionFile("env", e.env) === path) {
      lines.push(`${e.key} = ${ctx.tomlString(String(e.value ?? ""))}`);
    }
    if (e.verb === "add-alias" && path === ALIAS_TOML) {
      lines.push(`${tomlKey(e.name)} = ${ctx.tomlString(String(e.command))}`);
    }
  }
  return lines.sort(byKey);
}

function expected(ctx, { path, text }) {
  const assets = assetSet(ctx);
  if (path === SKILL) {
    const parts = skillParts(text);
    return {
      whole: parts ? withTable(ctx.asset(SKILL), parts.rows) : ctx.asset(SKILL),
      normalize: (_, l) => squeeze(l),
    };
  }
  if (path.startsWith(`${TASKS}/`)) {
    return assets.has(path)
      ? { whole: renderWhole(path, ctx.asset(path), carriedValues(ctx)) }
      : null;
  }
  const sec = sectionOf(path);
  if (!assets.has(path) && !sec) {
    return null;
  }
  const machine = new Map();
  const normalize = (requester, line) => {
    if (requester !== BASE) {
      if (!machine.has(requester)) {
        machine.set(requester, ctx.machineEnv(requester));
      }
      const key = keyOf(line);
      if (key !== null && machine.get(requester).includes(key)) {
        return `${key}=<machine>`;
      }
    }
    return squeeze(line);
  };
  const out = {};
  const settle = (requester, want, mine) => {
    const norm = l => normalize(requester, l);
    out[requester] = mine && sameSet(mine, want, norm) ? mine : want;
  };
  if (assets.has(path)) {
    const asset = split(path, ctx.asset(path));
    if (asset.body.length === 0) {
      return { whole: ctx.asset(path) };
    }
    const mine = blockIn(text, BASE, asset.region);
    const held = new Set(
      (sec?.section === "tools"
        ? allPins(ctx)
        : scan(path, text).filter(x => x.table === sec?.section))
        .filter(x => !(x.path === path && x.owner === BASE))
        .map(x => x.key),
    );
    const body = sec ? asset.body.filter(l => !held.has(keyOf(l))) : asset.body;
    const pins = sec?.section === "tools"
      ? basePins(ctx, path, body, mine, null)
      : null;
    settle(BASE, renderBody(ctx, path, body, carriedValues(ctx), pins), mine);
  }
  if (sec) {
    const region = table(sec.section);
    for (
      const requester of new Set(
        parseBlocks(splitLines(text).lines).map(b => b.requester),
      )
    ) {
      if (requester === BASE) {
        continue;
      }
      const mine = blockIn(text, requester, region) ?? [];
      const want = packLines(ctx, requester, path, mine);
      if (want) {
        // A clash answered keep-existing stands for its line: never drift.
        const kept = new Set(
          mine.map(l => DECLINED.exec(l)?.[1]).filter(Boolean),
        );
        const compared = mine.filter(l => !DECLINED.test(l));
        const norm = l => normalize(requester, l);
        out[requester] = sameSet(
            compared,
            want.filter(l => !kept.has(keyOf(l))),
            norm,
          )
          ? mine
          : want;
      }
    }
  }
  return { blocks: out, normalize };
}

// --- the module ----------------------------------------------------------------------------------

const ENV_VALUES = ["all", ...ENVS];

export default {
  verbs: {
    "add-tool": {
      flags: {
        name: { type: "toolName", required: true },
        version: { type: "value", required: true },
        env: { required: true, values: ENV_VALUES },
      },
      requester: "optional",
      needsMise: true,
    },
    "add-env": {
      flags: {
        key: { type: "envKey", required: true },
        value: { type: "value", template: "own" },
        env: { required: true, values: ENV_VALUES },
      },
      requester: "optional",
    },
    "set-env": {
      flags: {
        key: { type: "envKey", required: true },
        value: { type: "value" },
      },
      requester: "optional",
    },
    "add-alias": {
      flags: {
        name: { type: "aliasName", required: true },
        command: { type: "value", required: true },
        env: { values: ["dev"] },
      },
      requester: "optional",
    },
    upgrade: { flags: {}, requester: "forbidden", needsMise: true },
    remove: { flags: {}, requester: "required" },
  },
  plan,
  all,
  allNeedsMise: true,
  expected,
};
