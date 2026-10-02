// The dprint tool module — references/dprint.md, on the engine's interface
// (the header of tool-config.mjs). `all` lands `.config/dprint.json`,
// `.config/taplo.toml` and the root shim; `add-plugin` writes a plugin from
// the reference's table; `remove` takes a requester's plugins, keys and
// excludes out again.
//
// `.config/dprint.json` is strict JSON and carries no marker: the lock entry's
// `keys:` records what each requester wrote — `plugins[<name>]`, a config key,
// `excludes[<entry>]` — and the base is every key no requester holds. A key
// or entry the asset does not carry and no requester holds is the person's.

import { BlockParseError } from "../blocks.mjs";
import { GATE_VERBS } from "../schema.mjs";
import {
  carryList,
  droppedRows,
  expectedWhole,
  foreign,
  landOps,
  leaveShares,
  ListError,
  listRemove,
  need,
  oldPack,
  oldSkill,
  recordMap,
  recordOps,
  unreadable,
  writeOps,
} from "./index.mjs";

const BASE = "dprint";
export const CONFIG = ".config/dprint.json";
export const TAPLO = ".config/taplo.toml";
const SHIM = "dprint.json";

/** The taplo `exclude` array: the second spelling of the exclusion set. */
export const TAPLO_EXCLUDE = {
  key: "exclude",
  open: /^exclude\s*=\s*\[\s*$/,
  kind: "toml",
  indent: "  ",
  punct: "comma",
  order: "alpha",
};

/** references/dprint.md's plugin table: the URL a first write uses, the config key, the config it brings. */
export const PLUGINS = {
  markdown: { key: "markdown", base: true },
  pretty_yaml: { key: "yaml", base: true },
  json: { key: "json", base: true },
  exec: { key: "exec", base: true },
  typescript: {
    url: "https://plugins.dprint.dev/typescript-0.96.1.wasm",
    key: "typescript",
    config: {
      indentWidth: 2,
      lineWidth: 80,
      newLineKind: "lf",
      quoteProps: "asNeeded",
      quoteStyle: "alwaysDouble",
      semiColons: "always",
      trailingCommas: "onlyMultiLine",
      useTabs: false,
    },
  },
  malva: {
    url: "https://plugins.dprint.dev/g-plane/malva-v0.16.0.wasm",
    key: "malva",
    config: { formatComments: true, ignoreCommentDirective: "dprint-ignore" },
  },
  markup_fmt: {
    url: "https://plugins.dprint.dev/g-plane/markup_fmt-v0.27.3.wasm",
    key: "markup",
    config: {
      formatComments: true,
      ignoreCommentDirective: "dprint-fmt-ignore",
      preferAttrsSingleLine: true,
      scriptIndent: true,
      styleIndent: true,
    },
  },
  dockerfile: {
    url: "https://plugins.dprint.dev/dockerfile-0.4.0.wasm",
    key: "dockerfile",
    config: { lineWidth: 80 },
  },
};

/** A plugin URL's name: `…/g-plane/pretty_yaml-v0.6.0.wasm` → `pretty_yaml`. */
export const pluginName = url =>
  url
    .split("/")
    .pop()
    .replace(/@.*$/, "")
    .replace(/\.(wasm|json)$/, "")
    .replace(/-v?\d[\w.]*$/, "");

const isDir = e => e.endsWith("/");

/** The excludes as the asset keeps them: directories first, then globs, each alphabetical. */
const sortExcludes = list =>
  [...new Set(list)].sort((a, b) =>
    Number(!isDir(a)) - Number(!isDir(b)) || (a < b ? -1 : a > b ? 1 : 0)
  );

/** The config as written: top-level keys alphabetical, as the asset keeps them. */
export const stringify = cfg =>
  JSON.stringify(
    Object.fromEntries(
      Object.keys(cfg).sort().map(k => [k, cfg[k]]),
    ),
    null,
    2,
  ) + "\n";

/** The config, or a ListError naming why it cannot be read (a JSONC comment, a non-object). */
export function parseConfig(text) {
  let cfg;
  try {
    cfg = JSON.parse(text);
  }
  catch (e) {
    throw new ListError(`${CONFIG} is not strict JSON (${e.message})`);
  }
  if (!cfg || typeof cfg !== "object" || Array.isArray(cfg)) {
    throw new ListError(`${CONFIG} is not a JSON object`);
  }
  for (const key of ["plugins", "excludes"]) {
    if (cfg[key] !== undefined && !Array.isArray(cfg[key])) {
      throw new ListError(`${CONFIG}'s ${key} is not a list`);
    }
  }
  return cfg;
}

/**
 * The asset's config, carrying from `current` every key it does not hold, a
 * base plugin's URL at the version the file pins (the version is the
 * file's, never drift), every other plugin ahead of `exec`, and every
 * exclude the asset does not hold.
 */
function renderConfig(ctx, current) {
  const asset = JSON.parse(ctx.asset(CONFIG));
  if (current === null) {
    return stringify(asset);
  }
  const cur = parseConfig(current);
  const out = structuredClone(asset);
  for (const [k, v] of Object.entries(cur)) {
    if (!(k in asset)) {
      out[k] = v;
    }
  }
  const have = cur.plugins ?? [];
  const base = asset.plugins.map(pluginName);
  out.plugins = asset.plugins.map(u =>
    have.find(h => pluginName(h) === pluginName(u)) ?? u
  );
  out.plugins.splice(
    out.plugins.length - 1,
    0,
    ...have.filter(h => !base.includes(pluginName(h))),
  );
  out.excludes = sortExcludes([...asset.excludes, ...(cur.excludes ?? [])]);
  return stringify(out);
}

function render(ctx, path, current) {
  if (path === CONFIG) {
    return renderConfig(ctx, current);
  }
  if (path === TAPLO) {
    return carryList(ctx.asset(TAPLO), current, TAPLO_EXCLUDE, BASE);
  }
  return ctx.asset(path);
}

function all(ctx) {
  const ops = [];
  const rows = [];
  const notes = [];
  for (const path of [CONFIG, TAPLO, SHIM]) {
    if (foreign(ctx, path, BASE)) {
      notes.push(`${path} is ${ctx.source(path)}'s — left alone`);
      continue;
    }
    const current = ctx.read(path);
    let rendered;
    try {
      rendered = render(ctx, path, current);
    }
    catch (e) {
      if (!(e instanceof ListError || e instanceof BlockParseError)) {
        throw e;
      }
      rows.push(unreadable(ctx, path, e, `the layout of the skill's ${path}`));
      continue;
    }
    const old = oldPack(ctx, path, BASE);
    ops.push(...landOps(ctx, path, current, rendered, old));
    if (old || (current !== null && ctx.record(path) === null)) {
      rows.push(...targetRows(path, rendered, old));
    }
    if (old) {
      rows.push(...droppedRows(ctx, path, current, rendered));
    }
  }
  ops.push(...oldSkill(ctx, BASE, notes));
  return { ops, rows, notes };
}

/** The retired pack's `target` exclude, which no pack produces: a row offering its removal. */
export function targetRows(path, rendered, supersedes) {
  const line = rendered
    .split("\n")
    .map(l => l.trim())
    .find(l =>
      /^(\|?\(\^\|\/\)|"\*\*\/|'''\(\^\|\/\)|- "\*\*\/)target\//.test(l)
    );
  return line
    ? [{
      kind: "migrate",
      path,
      line,
      reason:
        "target was the retired gate pack's exclude; no pack produces it — remove it",
      answers: ["ok", "keep-existing"],
      effects: {
        ok: [{
          op: "drop-lines",
          path,
          match: line.replace(/,$/, ""),
          supersedes: supersedes ?? undefined,
        }],
        "keep-existing": [],
      },
    }]
    : [];
}

// --- the verbs ------------------------------------------------------------------------

function addPlugin(ctx, { flags, for: requester }) {
  const name = flags.name;
  const plugin = PLUGINS[name];
  if (!plugin) {
    throw new ctx.RefusalError(
      `dprint has no plugin ${name} — references/dprint.md's plugin table names: ${
        Object.keys(PLUGINS).join(", ")
      }`,
    );
  }
  const text = need(ctx, CONFIG, BASE, requester);
  if (plugin.base) {
    return { ops: [], notes: [`${CONFIG}: ${name} is the base's — satisfied`] };
  }
  let cfg;
  try {
    cfg = parseConfig(text);
  }
  catch (e) {
    return { ops: [], rows: [unreadable(ctx, CONFIG, e, "strict JSON")] };
  }
  const entry = `plugins[${name}]`;
  const keys = recordMap(ctx, CONFIG, "keys");
  const plugins = cfg.plugins ?? [];
  if (plugins.some(u => pluginName(u) === name)) {
    const holder = Object.keys(keys).find(r => keys[r].includes(entry));
    if (holder === requester) {
      return { ops: [] };
    }
    if (!requester || !holder) {
      return {
        ops: [],
        notes: [
          `${CONFIG}: ${name} is already held by ${
            holder ?? "a line of the person's own"
          } — satisfied`,
        ],
      };
    }
    const shares = recordMap(ctx, CONFIG, "shares");
    for (const k of [entry, plugin.key]) {
      if (!keys[holder].includes(k)) {
        continue;
      }
      const holders = (shares[k] ??= [holder]);
      if (!holders.includes(requester)) {
        holders.push(requester);
      }
    }
    return { ops: recordOps(ctx, CONFIG, { shares }) };
  }
  const exec = plugins.findIndex(u => pluginName(u) === "exec");
  plugins.splice(exec < 0 ? plugins.length : exec, 0, plugin.url);
  cfg.plugins = plugins;
  const wrote = [entry];
  if (!(plugin.key in cfg)) {
    cfg[plugin.key] = structuredClone(plugin.config);
    wrote.push(plugin.key);
  }
  if (requester) {
    keys[requester] = [...new Set([...(keys[requester] ?? []), ...wrote])];
  }
  return {
    ops: writeOps(ctx, CONFIG, text, stringify(cfg), requester ? { keys } : {}),
  };
}

/**
 * Write exclude entries into `.config/dprint.json` for a requester (keys
 * recorded) or the person (no keys): the ops for the new text and any key or
 * share that moved.
 */
export function addConfigExcludes(ctx, text, { requester, entries, notes }) {
  const cfg = parseConfig(text);
  const keys = recordMap(ctx, CONFIG, "keys");
  const shares = recordMap(ctx, CONFIG, "shares");
  const excludes = cfg.excludes ?? [];
  for (const e of entries) {
    const k = `excludes[${e}]`;
    if (!excludes.includes(e)) {
      excludes.push(e);
      if (requester) {
        keys[requester] = [...new Set([...(keys[requester] ?? []), k])];
      }
      continue;
    }
    const holder = Object.keys(keys).find(r => keys[r].includes(k));
    if (holder === requester && requester) {
      continue;
    }
    if (!requester || !holder) {
      notes.push(
        `${CONFIG}: ${e} is already held by ${
          holder ?? "the base or a line of the person's own"
        } — satisfied`,
      );
      continue;
    }
    const holders = (shares[k] ??= [holder]);
    if (!holders.includes(requester)) {
      holders.push(requester);
    }
  }
  cfg.excludes = sortExcludes(excludes);
  return writeOps(
    ctx,
    CONFIG,
    text,
    stringify(cfg),
    requester ? { keys, shares } : {},
  );
}

/**
 * Take a requester's keys out of `.config/dprint.json`: a key it holds that
 * others share passes to the next sharer; any other is deleted from the
 * file. The ops for the new text and the record maps that moved.
 */
function removeFromConfig(ctx, text, requester) {
  if (!ctx.record(CONFIG) || text === null) {
    return [];
  }
  const keys = recordMap(ctx, CONFIG, "keys");
  const shares = recordMap(ctx, CONFIG, "shares");
  const drop = [];
  for (const k of keys[requester] ?? []) {
    const holders = shares[k];
    if (holders?.[0] === requester && holders.length > 1) {
      keys[holders[1]] = [...new Set([...(keys[holders[1]] ?? []), k])];
    }
    else {
      drop.push(k);
    }
  }
  leaveShares(shares, requester);
  delete keys[requester];
  let next = text;
  if (drop.length) {
    const cfg = parseConfig(text);
    for (const k of drop) {
      const m = /^(plugins|excludes)\[(.+)\]$/.exec(k);
      if (m?.[1] === "plugins") {
        cfg.plugins = (cfg.plugins ?? []).filter(u => pluginName(u) !== m[2]);
      }
      else if (m?.[1] === "excludes") {
        cfg.excludes = (cfg.excludes ?? []).filter(e => e !== m[2]);
      }
      else {
        delete cfg[k];
      }
    }
    next = stringify(cfg);
  }
  return writeOps(ctx, CONFIG, text, next, { keys, shares });
}

/** Every dprint file without `requester`'s keys and blocks. */
export function removeOps(ctx, requester) {
  const ops = removeFromConfig(ctx, ctx.read(CONFIG), requester);
  const taplo = ctx.read(TAPLO);
  if (taplo !== null) {
    const shares = recordMap(ctx, TAPLO, "shares");
    const after = listRemove(taplo, TAPLO_EXCLUDE, { requester, shares });
    ops.push(...writeOps(ctx, TAPLO, taplo, after, { shares }));
  }
  return ops;
}

function plan(ctx, call) {
  if (call.verb === "add-plugin") {
    return addPlugin(ctx, call);
  }
  if (call.verb === "add-exclude") {
    throw new ctx.RefusalError(
      "an exclude is added only through all add-exclude — every gate's list at once",
    );
  }
  try {
    return { ops: removeOps(ctx, call.for) };
  }
  catch (e) {
    if (!(e instanceof ListError || e instanceof BlockParseError)) {
      throw e;
    }
    return { ops: [], rows: [unreadable(ctx, CONFIG, e, "strict JSON")] };
  }
}

function expected(ctx, { path, text }) {
  if (![CONFIG, TAPLO, SHIM].includes(path)) {
    return null;
  }
  return expectedWhole(path, text, render(ctx, path, text));
}

export default {
  verbs: {
    ...GATE_VERBS.dprint,
    "add-exclude": {
      flags: { paths: { type: "pathList" }, generated: { type: "bool" } },
      requester: "optional",
    },
    remove: { flags: {}, requester: "required" },
  },
  plan,
  all,
  allNeedsMise: false,
  expected,
};
