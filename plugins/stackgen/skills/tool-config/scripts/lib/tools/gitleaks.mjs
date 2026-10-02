// The gitleaks tool module — references/gitleaks.md, on the engine's
// interface (the header of tool-config.mjs). `all` lands
// `.config/gitleaks.toml`; its allowlist is written only through
// `all add-exclude --generated` (exclude.mjs), and `remove` takes a
// requester's block out of it. Custom rules and fingerprint entries are the
// person's lines, never written here.

import {
  BlockParseError,
  joinLines,
  splitLines,
} from "../blocks.mjs";
import { targetRows } from "./dprint.mjs";
import {
  carryList,
  droppedRows,
  expectedWhole,
  foreign,
  landOps,
  ListError,
  listRemove,
  oldPack,
  oldSkill,
  recordMap,
  unreadable,
  writeOps,
} from "./index.mjs";

const BASE = "gitleaks";
export const CONFIG = ".config/gitleaks.toml";

/** `[allowlist] paths`: the scanner's spelling of the exclusion set, generated trees only. */
export const PATHS = {
  key: "paths",
  open: /^paths\s*=\s*\[\s*$/,
  kind: "toml",
  indent: "  ",
  punct: "comma",
  order: "alpha",
};

/** A TOML text's tables, in order — the first the lines above any header, its `name` null. */
function tables(text) {
  const out = [{ name: null, header: null, lines: [] }];
  for (const l of splitLines(text).lines) {
    const m = /^\s*(\[\[?)\s*([^\]]+?)\s*\]\]?\s*(#.*)?$/.exec(l);
    if (m) {
      out.push({ name: `${m[1]}${m[2]}`, header: l, lines: [] });
    }
    else {
      out.at(-1).lines.push(l);
    }
  }
  return out;
}

const keyOf = l => /^\s*([A-Za-z0-9_-]+|"[^"]*")\s*=/.exec(l)?.[1] ?? null;

/** How far a line opens brackets, its strings and comment set aside. */
const depthOf = l => {
  const bare = l.replace(/'''.*?'''|"(?:[^"\\]|\\.)*"|'[^']*'|#.*$/g, "");
  return (bare.match(/\[/g)?.length ?? 0) - (bare.match(/\]/g)?.length ?? 0);
};

/** A table's statements: each key line with every line of a value it leaves open, at their indices. */
function statements(lines) {
  const out = [];
  let depth = 0;
  lines.forEach((l, i) => {
    if (depth > 0) {
      out.at(-1).lines.push(l);
      out.at(-1).end = i;
      depth += depthOf(l);
    }
    else if (keyOf(l) !== null) {
      out.push({ key: keyOf(l), lines: [l], start: i, end: i });
      depth = depthOf(l);
    }
  });
  return out;
}

/**
 * The person's own rules and settings, carried into the rendering: every
 * table the asset does not hold (each custom `[[rules]]`) appended whole, and
 * every key an asset table holds that the asset does not, at that table's end.
 */
function carryTables(rendered, current) {
  if (current === null) {
    return rendered;
  }
  const mine = tables(rendered);
  const known = new Set(
    mine.filter(t => t.name && !t.name.startsWith("[[")).map(t => t.name),
  );
  for (const t of tables(current)) {
    const into = mine.find(m => m.name === t.name);
    if (into && known.has(t.name ?? "")) {
      const own = statements(into.lines);
      const keys = new Set(own.map(s => s.key));
      const extra = statements(t.lines).filter(s => !keys.has(s.key));
      if (extra.length) {
        // keys in taplo's order (reorder_keys): alphabetical within the table
        const merged = [...own, ...extra].sort((a, b) =>
          a.key < b.key ? -1 : a.key > b.key ? 1 : 0
        );
        const from = own.length ? own[0].start : 0;
        const to = own.length ? own.at(-1).end + 1 : 0;
        into.lines.splice(from, to - from, ...merged.flatMap(s => s.lines));
      }
    }
    else if (t.name !== null) {
      const body = [...t.lines];
      while (body.at(-1)?.trim() === "") {
        body.pop();
      }
      const last = mine.at(-1).lines;
      while (last.at(-1)?.trim() === "") {
        last.pop();
      }
      last.push("");
      mine.push({ name: t.name, header: t.header, lines: body });
    }
  }
  return joinLines(
    mine.flatMap(t => (t.header === null ? t.lines : [t.header, ...t.lines])),
  );
}

const render = (ctx, current) =>
  carryTables(carryList(ctx.asset(CONFIG), current, PATHS, BASE), current);

function all(ctx) {
  const notes = [];
  if (foreign(ctx, CONFIG, BASE)) {
    return {
      ops: [],
      notes: [`${CONFIG} is ${ctx.source(CONFIG)}'s — left alone`],
    };
  }
  const current = ctx.read(CONFIG);
  const old = oldPack(ctx, CONFIG, BASE);
  let rendered;
  try {
    rendered = render(ctx, current);
  }
  catch (e) {
    if (!(e instanceof ListError || e instanceof BlockParseError)) {
      throw e;
    }
    return {
      ops: [],
      rows: [unreadable(ctx, CONFIG, e, "the skill's allowlist layout")],
    };
  }
  const rows = old || (current !== null && ctx.record(CONFIG) === null)
    ? targetRows(CONFIG, rendered, old)
    : [];
  if (old) {
    rows.push(...droppedRows(ctx, CONFIG, current, rendered));
  }
  return {
    ops: [
      ...landOps(ctx, CONFIG, current, rendered, old),
      ...oldSkill(ctx, BASE, notes),
    ],
    rows,
    notes,
  };
}

/** The allowlist without `requester`'s block. */
export function removeOps(ctx, requester) {
  const text = ctx.read(CONFIG);
  if (text === null) {
    return [];
  }
  const shares = recordMap(ctx, CONFIG, "shares");
  const next = listRemove(text, PATHS, { requester, shares });
  return writeOps(ctx, CONFIG, text, next, { shares });
}

function plan(ctx, call) {
  if (call.verb !== "remove") {
    throw new ctx.RefusalError(
      "the allowlist is written only through all add-exclude --generated",
    );
  }
  try {
    return { ops: removeOps(ctx, call.for) };
  }
  catch (e) {
    if (!(e instanceof ListError || e instanceof BlockParseError)) {
      throw e;
    }
    return {
      ops: [],
      rows: [unreadable(ctx, CONFIG, e, "the skill's allowlist layout")],
    };
  }
}

function expected(ctx, { path, text }) {
  return path === CONFIG
    ? expectedWhole(CONFIG, text, render(ctx, text))
    : null;
}

const refused = {
  flags: { paths: { type: "pathList" }, generated: { type: "bool" } },
  requester: "optional",
};

export default {
  verbs: {
    "add-exclude": refused,
    "add-allowlist": refused,
    remove: { flags: {}, requester: "required" },
  },
  plan,
  all,
  allNeedsMise: false,
  expected,
};
