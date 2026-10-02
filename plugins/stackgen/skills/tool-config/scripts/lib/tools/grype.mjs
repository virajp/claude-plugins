// The grype tool module — references/grype.md, on the engine's interface
// (the header of tool-config.mjs). `all` lands `.config/grype.yaml`;
// `add-ignore` writes one entry with the four things its bar asks for as the
// comment above it; `remove-ignore` deletes one entry wherever it sits;
// `remove` takes a requester's block out of `ignore:`. `ignore: []` becomes a
// block sequence on the first entry and returns to `[]` when the last goes.

import {
  BlockParseError,
  joinLines,
  splitLines,
} from "../blocks.mjs";
import { GATE_VERBS } from "../schema.mjs";
import {
  carryList,
  expectedWhole,
  foreign,
  landOps,
  ListError,
  listRegion,
  need,
  oldPack,
  oldSkill,
  readList,
  unreadable,
  writeList,
} from "./index.mjs";

const BASE = "grype";
const CONFIG = ".config/grype.yaml";

const IGNORE = {
  key: "ignore",
  open: /^ignore:\s*(\[\]\s*)?$/,
  kind: "yaml",
  indent: "  ",
  flow: true,
};

const VULN = /^\s*- vulnerability:\s*["']?([A-Za-z0-9-]+)["']?\s*$/;

const render = (ctx, current) =>
  carryList(ctx.asset(CONFIG), current, IGNORE, BASE);

function all(ctx) {
  const notes = [];
  if (foreign(ctx, CONFIG, BASE)) {
    return {
      ops: [],
      notes: [`${CONFIG} is ${ctx.source(CONFIG)}'s — left alone`],
    };
  }
  const current = ctx.read(CONFIG);
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
      rows: [unreadable(ctx, CONFIG, e, "the skill's ignore: layout")],
    };
  }
  return {
    ops: [
      ...landOps(ctx, CONFIG, current, rendered, oldPack(ctx, CONFIG, BASE)),
      ...oldSkill(ctx, BASE, notes),
    ],
    notes,
  };
}

/** The list's lines, region and units — refused as a needs-edit by the caller when unreadable. */
function list(text) {
  const { lines, eol } = splitLines(text);
  const region = listRegion(lines, IGNORE);
  if (!region) {
    throw new ListError(`${CONFIG} has no ignore: list`);
  }
  return { lines, eol, region, units: readList(lines, region, IGNORE) };
}

const write = ({ lines, eol, region }, units) =>
  joinLines(writeList(lines, region, IGNORE, units), eol);

/** Where an id is ignored now — a requester's block or the person's line — or undefined. */
function holderOf(units, id) {
  for (const u of units) {
    const lines = u.requester === undefined ? [u.line] : u.lines;
    if (lines.some(l => VULN.exec(l)?.[1] === id)) {
      return u.requester ?? null;
    }
  }
  return undefined;
}

function addIgnore(ctx, { flags, for: requester }) {
  const text = need(ctx, CONFIG, BASE, requester);
  const l = list(text);
  const held = holderOf(l.units, flags.id);
  if (held !== undefined) {
    return {
      ops: [],
      notes: [
        `${CONFIG}: ${flags.id} is already ignored, in ${
          held === null ? "a line of the person's own" : `${held}'s block`
        } — nothing written`,
      ],
    };
  }
  const entry = [
    `# id: ${flags.id}`,
    `# package: ${flags.package}`,
    `# reason: ${flags.reason}`,
    `# expires: ${flags.expires}`,
    `- vulnerability: ${flags.id}`,
  ]
    .map(x => `${IGNORE.indent}${x}`);
  const units = [...l.units];
  if (requester) {
    const own = units.find(u => u.requester === requester);
    if (own) {
      own.lines = [...own.lines, ...entry];
    }
    else {
      const last = units.findLastIndex(u => u.requester !== undefined);
      units.splice(last < 0 ? units.length : last + 1, 0, {
        requester,
        lines: entry,
      });
    }
  }
  else {
    units.push(...entry.map(line => ({ line })));
  }
  return {
    ops: [{ op: "whole", path: CONFIG, content: write(l, units), force: true }],
  };
}

/** The lines with the entry for `id` gone: its `- vulnerability:` line and the comment run directly above it. */
function dropEntry(lines, id) {
  const at = lines.findIndex(l => VULN.exec(l)?.[1] === id);
  let start = at;
  while (
    start > 0
    && /^\s*#/.test(lines[start - 1])
    && !/^\s*# (>>>|<<<) /.test(lines[start - 1])
  ) {
    start--;
  }
  return [...lines.slice(0, start), ...lines.slice(at + 1)];
}

function removeIgnore(ctx, { flags }) {
  const text = need(ctx, CONFIG, BASE);
  const l = list(text);
  const held = holderOf(l.units, flags.id);
  if (held === undefined) {
    throw new ctx.RefusalError(`${CONFIG} ignores no ${flags.id}`);
  }
  let units;
  if (held === null) {
    const lines = dropEntry(l.units.map(u => u.line ?? null), flags.id);
    // the person's lines, rebuilt around the blocks they sat between
    const blocks = l.units.filter(u => u.requester !== undefined);
    units = [];
    let b = 0;
    for (const line of lines) {
      units.push(line === null ? blocks[b++] : { line });
    }
  }
  else {
    units = l.units.map(u =>
      u.requester === held ? { ...u, lines: dropEntry(u.lines, flags.id) } : u
    );
  }
  return {
    ops: [{ op: "whole", path: CONFIG, content: write(l, units), force: true }],
  };
}

function remove(ctx, { for: requester }) {
  const text = ctx.read(CONFIG);
  if (text === null) {
    return { ops: [] };
  }
  const l = list(text);
  if (!l.units.some(u => u.requester === requester)) {
    return { ops: [] };
  }
  const next = write(l, l.units.filter(u => u.requester !== requester));
  return {
    ops: [{ op: "whole", path: CONFIG, content: next, force: true }],
  };
}

const VERBS = {
  "add-ignore": addIgnore,
  "remove-ignore": removeIgnore,
  remove,
};

function plan(ctx, call) {
  try {
    return VERBS[call.verb](ctx, call);
  }
  catch (e) {
    if (!(e instanceof ListError || e instanceof BlockParseError)) {
      throw e;
    }
    return {
      ops: [],
      rows: [unreadable(ctx, CONFIG, e, "the skill's ignore: layout")],
    };
  }
}

function expected(ctx, { path, text }) {
  return path === CONFIG
    ? expectedWhole(CONFIG, text, render(ctx, text))
    : null;
}

export default {
  verbs: {
    ...GATE_VERBS.grype,
    remove: { flags: {}, requester: "required" },
  },
  plan,
  all,
  allNeedsMise: false,
  expected,
};
