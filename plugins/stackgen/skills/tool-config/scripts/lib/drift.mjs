// `check`: for every tool-config record, render what each block's requester
// would write now and compare it with the file. One drift row per differing
// block, one needs-edit row per file the parser cannot read; writes nothing.
// What a requester would write now is the tool module's `expected()`; a
// marked position filled from an argument, a pack's machine_env: key and a
// user line are never drift — the module renders the first from the file,
// normalizes the second away, and the third is never compared.

import {
  blockBodies,
  BlockParseError,
  splitLines,
} from "./blocks.mjs";
import {
  isToolConfig,
  sourceTool,
} from "./record.mjs";
import {
  ANSWERS,
  needsEdit,
} from "./rows.mjs";

const asBodies = v => (v.length && Array.isArray(v[0]) ? v : [v]);

/** A drift row: the block as written (mine) beside what its requester would write (theirs). */
export function driftRow({ path, requester, theirs, mine }) {
  return {
    kind: "drift",
    path,
    requester,
    theirs,
    mine,
    answers: ANSWERS.drift,
  };
}

/**
 * The drift rows for every record of `toolFilter` (every tool when null).
 * `contextFor(tool)` gives the module context; `tools` maps a name to its
 * loaded module. A tool with no module is returned under `prose`.
 */
export async function check({ records, read, tools, contextFor, toolFilter }) {
  const rows = [];
  const prose = new Set();
  for (const record of records) {
    if (!isToolConfig(record)) {
      continue;
    }
    const tool = sourceTool(record);
    if (toolFilter && tool !== toolFilter) {
      continue;
    }
    const mod = tools[tool];
    if (!mod?.expected) {
      prose.add(tool);
      continue;
    }
    const text = read(record.path);
    if (text === null) {
      rows.push(
        needsEdit({
          file: record.path,
          reason: "recorded but missing",
          target: `re-run ${tool}'s all to land it`,
        }),
      );
      continue;
    }
    let mine;
    try {
      mine = blockBodies(text);
    }
    catch (e) {
      if (!(e instanceof BlockParseError)) {
        throw e;
      }
      rows.push(
        needsEdit({
          file: record.path,
          reason: `unreadable block markers: ${e.message}`,
          target: "balanced # >>> <req> / # <<< <req> pairs",
        }),
      );
      continue;
    }
    let expected;
    try {
      expected = await mod.expected(contextFor(tool), {
        path: record.path,
        record,
        text,
      });
    }
    catch (e) {
      rows.push(
        needsEdit({
          file: record.path,
          reason: `cannot parse: ${e.message}`,
          target: `the layout ${tool}'s reference names`,
        }),
      );
      continue;
    }
    if (!expected) {
      continue;
    }
    const norm = (requester, line) => {
      const l = line.trimEnd();
      return expected.normalize ? expected.normalize(requester, l) : l;
    };
    if (expected.whole !== undefined) {
      const a = splitLines(text).lines.map(l => norm(tool, l));
      const b = splitLines(expected.whole).lines.map(l => norm(tool, l));
      if (JSON.stringify(a) !== JSON.stringify(b)) {
        rows.push(
          driftRow({
            path: record.path,
            requester: tool,
            theirs: splitLines(expected.whole)
              .lines,
            mine: splitLines(text).lines,
          }),
        );
      }
      continue;
    }
    for (const [requester, want] of Object.entries(expected.blocks ?? {})) {
      const theirs = asBodies(want);
      const have = mine[requester] ?? [];
      const n = Math.max(theirs.length, have.length);
      for (let i = 0; i < n; i++) {
        const t = theirs[i] ?? [];
        const m = have[i] ?? [];
        const same = t.length === m.length
          && t.every((l, j) => norm(requester, l) === norm(requester, m[j]));
        if (!same) {
          rows.push(
            driftRow({ path: record.path, requester, theirs: t, mine: m }),
          );
        }
      }
    }
  }
  return { rows, prose: [...prose] };
}
