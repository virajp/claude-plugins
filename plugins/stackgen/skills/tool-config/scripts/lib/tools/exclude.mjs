// The cross-tool verb — SKILL.md's *The one cross-tool verb*, registered as
// the tool `all`, which lands no base. `all add-exclude` writes each path, in
// each list's own spelling, into dprint's `excludes`, taplo's `exclude` and
// the hook config's `(?x)` exclude — and, with `--generated`, gitleaks'
// allowlist — so the formatters' three lists state one set and the scanner's
// is a subset of it by construction. `all remove` is `remove` on each.
//
// A path is classified per schema.mjs's classifyPath: a trailing `/` marks a
// directory, globs included (`*.xcassets/`), excluded with everything inside;
// `*` or `?` with no trailing `/` is a file glob; any other is a directory.

import { BlockParseError } from "../blocks.mjs";
import {
  classifyPath,
  GATE_VERBS,
} from "../schema.mjs";
import * as dprint from "./dprint.mjs";
import * as gitleaks from "./gitleaks.mjs";
import {
  listAdd,
  ListError,
  need,
  recordMap,
  unreadable,
  writeOps,
} from "./index.mjs";
import * as preCommit from "./pre-commit.mjs";

/** A glob as a regex under (?x): metacharacters, `#` and space escaped, `*` → `[^/]*`, `?` → `[^/]`. */
function regex(name) {
  return [...name]
    .map(c =>
      c === "*"
        ? "[^/]*"
        : c === "?"
        ? "[^/]"
        : /[.+^${}()|[\]\\#\s]/.test(c)
        ? `\\${c}`
        : c
    )
    .join("");
}

/** One path in each list's spelling — references/dprint.md and pre-commit.md, *The spellings*. */
export function spell(path) {
  const { name, kind } = classifyPath(path);
  const dir = kind === "directory";
  const re = `(^|/)${regex(name)}${dir ? "/" : "$"}`;
  return {
    dprint: dir ? `**/${name}/` : `**/${name}`,
    taplo: JSON.stringify(dir ? `**/${name}/**` : `**/${name}`),
    hook: re,
    gitleaks: `'''${re}'''`,
  };
}

function addExclude(ctx, { flags, for: requester }) {
  const generated = flags.generated === "true";
  const spelled = flags.paths.split(",").map(spell);
  const files = [
    [dprint.CONFIG, "dprint"],
    [dprint.TAPLO, "dprint"],
    [preCommit.HOOKS, "pre-commit"],
    ...(generated ? [[gitleaks.CONFIG, "gitleaks"]] : []),
  ];
  const texts = new Map(
    files.map(([p, tool]) => [p, need(ctx, p, tool, requester)]),
  );
  const notes = [];
  const ops = dprint.addConfigExcludes(ctx, texts.get(dprint.CONFIG), {
    requester,
    entries: spelled.map(s => s.dprint),
    notes,
  });
  const lists = [
    [dprint.TAPLO, dprint.TAPLO_EXCLUDE, "dprint", "taplo"],
    [preCommit.HOOKS, preCommit.EXCLUDE, "pre-commit", "hook"],
    [gitleaks.CONFIG, gitleaks.PATHS, "gitleaks", "gitleaks"],
  ]
    .filter(([path]) => texts.has(path));
  for (const [path, spec, base, key] of lists) {
    const shares = recordMap(ctx, path, "shares");
    const res = listAdd(texts.get(path), spec, {
      requester,
      entries: spelled.map(s => s[key]),
      base,
      shares,
      notes,
      path,
    });
    ops.push(
      ...writeOps(
        ctx,
        path,
        texts.get(path),
        res.text,
        requester ? { shares } : {},
      ),
    );
  }
  return { ops, notes };
}

function plan(ctx, call) {
  try {
    if (call.verb === "add-exclude") {
      return addExclude(ctx, call);
    }
    return {
      ops: [
        ...dprint.removeOps(ctx, call.for),
        ...preCommit.removeOps(ctx, call.for),
        ...gitleaks.removeOps(ctx, call.for),
      ],
    };
  }
  catch (e) {
    if (!(e instanceof ListError || e instanceof BlockParseError)) {
      throw e;
    }
    return {
      ops: [],
      rows: [unreadable(ctx, "the exclusion set", e, "each list's layout")],
    };
  }
}

export default {
  verbs: {
    ...GATE_VERBS.all,
    remove: { flags: {}, requester: "required" },
  },
  plan,
};
