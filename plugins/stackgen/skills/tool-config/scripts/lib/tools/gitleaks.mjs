// The gitleaks tool module — references/gitleaks.md, on the engine's
// interface (the header of tool-config.mjs). `all` lands
// `.config/gitleaks.toml`; its allowlist is written only through
// `all add-exclude --generated` (exclude.mjs), and `remove` takes a
// requester's block out of it. Custom rules and fingerprint entries are the
// person's lines, never written here.

import { BlockParseError } from "../blocks.mjs";
import { targetRows } from "./dprint.mjs";
import {
  carryList,
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

const render = (ctx, current) =>
  carryList(ctx.asset(CONFIG), current, PATHS, BASE);

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
