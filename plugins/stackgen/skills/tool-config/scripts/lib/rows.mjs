// The rows a call shows before it writes, numbered r1, r2, … in order, each
// with the answer names SKILL.md's table gives, and the check that a call's
// `--answers` names exactly the rows its preview showed, unchanged.

import { spawnSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import {
  dirname,
  isAbsolute,
  join,
} from "node:path";
import { sha256 } from "./record.mjs";

/** The answers each kind of row takes. A tool's own conflict rows name theirs. */
export const ANSWERS = {
  create: ["ok"],
  write: ["ok"],
  delete: ["ok"],
  fold: ["ok"],
  move: ["ok"],
  record: ["ok"],
  share: ["ok"],
  drift: ["take-theirs", "keep-mine", "merge"],
  conflict: ["keep-existing", "overwrite"],
  "needs-edit": ["done", "skip"],
};

/** A needs-edit row: a change the script cannot make, for the LLM to make and re-check. */
export function needsEdit({ file, reason, target }) {
  return {
    kind: "needs-edit",
    file,
    reason,
    target,
    answers: ANSWERS["needs-edit"],
  };
}

const hidden = key => key === "effects" || key === "id" || key.startsWith("_");

/** What identifies a row's content: everything shown but its id. */
export function fingerprint(row) {
  const shown = Object.fromEntries(
    Object.entries(row).filter(([k]) => !hidden(k)),
  );
  return sha256(JSON.stringify(shown)).slice(0, 16);
}

/** Number the rows in order and fingerprint each. */
export function numberRows(rows) {
  return rows.map((row, n) => {
    const answers = row.answers ?? ANSWERS[row.kind];
    if (!answers) {
      throw new Error(`row kind ${row.kind} names no answers`);
    }
    const out = { ...row, answers, id: `r${n + 1}` };
    out._fingerprint = fingerprint(out);
    return out;
  });
}

/** A row as the caller sees it: id first, nothing internal. */
export function publicRow(row) {
  const out = { id: row.id };
  for (const [k, v] of Object.entries(row)) {
    if (!hidden(k)) {
      out[k] = v;
    }
  }
  return out;
}

/** `r1:ok,r2:keep-existing` → Map, or a thrown refusal. */
export function parseAnswers(text) {
  const out = new Map();
  if (text === "") {
    return out;
  }
  for (const part of text.split(",")) {
    const m = /^(r[1-9][0-9]*):([a-z][a-z0-9-]*)$/.exec(part);
    if (!m) {
      throw new RefusalError(
        `answers: ${JSON.stringify(part)} is not <id>:<answer>`,
      );
    }
    if (out.has(m[1])) {
      throw new RefusalError(`answers: ${m[1]} is answered twice`);
    }
    out.set(m[1], m[2]);
  }
  return out;
}

/** A refused call: exit 2, the message, and the rows shown again when there are some. */
export class RefusalError extends Error {
  constructor(message, rows) {
    super(message);
    this.rows = rows;
  }
}

/**
 * Refuse unless `answers` names exactly the rebuilt rows' ids, each with one
 * of its answers, and every row matches the one the stored preview showed.
 */
export function checkAnswers(rows, answers, stored) {
  if (!stored) {
    throw new RefusalError(
      "no preview on record for this call — run it with preview first, then answer its rows",
      rows,
    );
  }
  const before = new Map(stored.map(r => [r.id, r.fingerprint]));
  for (const row of rows) {
    if (!before.has(row.id) || before.get(row.id) !== row._fingerprint) {
      throw new RefusalError(
        `row ${row.id} changed since the preview — answer the rows shown again`,
        rows,
      );
    }
  }
  if (before.size !== rows.length) {
    throw new RefusalError(
      "the rows changed since the preview — answer the rows shown again",
      rows,
    );
  }
  const ids = new Set(rows.map(r => r.id));
  for (const id of answers.keys()) {
    if (!ids.has(id)) {
      throw new RefusalError(`answers: no row ${id}`, rows);
    }
  }
  for (const row of rows) {
    const answer = answers.get(row.id);
    if (answer === undefined) {
      throw new RefusalError(`answers: row ${row.id} is not answered`, rows);
    }
    if (!row.answers.includes(answer)) {
      throw new RefusalError(
        `answers: ${row.id} takes ${row.answers.join(" or ")}, not ${answer}`,
        rows,
      );
    }
  }
}

// --- the preview record --------------------------------------------------------
// A preview's rows are kept in the repo's git dir, keyed by the call, so the
// answering call can tell a row that changed in between. Never in the tree.

function storePath(repoRoot) {
  const git = spawnSync("git", ["-C", repoRoot, "rev-parse", "--git-dir"], {
    encoding: "utf8",
  });
  if (git.status === 0) {
    const dir = git.stdout.trim();
    return join(
      isAbsolute(dir) ? dir : join(repoRoot, dir),
      "stackgen-tool-config-previews.json",
    );
  }
  return join(
    tmpdir(),
    `stackgen-tool-config-previews-${sha256(repoRoot).slice(0, 16)}.json`,
  );
}

export function previewStore(repoRoot) {
  const path = storePath(repoRoot);
  const load =
    () => (existsSync(path) ? JSON.parse(readFileSync(path, "utf8")) : {});
  const save = all => {
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, JSON.stringify(all, null, 2) + "\n");
  };
  return {
    get: signature => load()[signature] ?? null,
    put(signature, rows) {
      const all = load();
      all[signature] = rows.map(r => ({
        id: r.id,
        fingerprint: r._fingerprint,
      }));
      save(all);
    },
    drop(signature) {
      const all = load();
      if (!(signature in all)) {
        return;
      }
      delete all[signature];
      save(all);
    },
  };
}
