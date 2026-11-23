// The LSP check of doctor (lsp-check D1, D2, D13, D19, D22): bootstrap's
// `code:lsp:check`, run once from the base repo root (D16). Each output line
// `<server>: <command> not found - <fix>` is one degraded row; a task that is
// absent, or a check that fails another way, is one row with subject
// code:lsp:check. The task runs `bootstrap lsp --json`, the one call of the
// checks that can read the network (D20). Every row is degraded (D3).

import { spawnSync } from "node:child_process";
import {
  isObject,
  row,
} from "./util.mjs";

const RULE = "lsp-check";
const TASK = "code:lsp:check";
/** A timeout is a signal, so it is a row too (D24). */
const TIMEOUT = 60000;
const FAILED_REMEDY = `run mise run ${TASK} and fix what it prints`;
/** The not-found line of code:lsp:check, without colour and label. */
const NOT_FOUND = /^(\S+): (.+ not found) - (.+)$/;
/** A line mise writes about the task it ran: `[<task>] ERROR ...` (D13). */
const MISE_LINE = /^\[[^\]]+\] ERROR\b/;
/** The SGR codes print_error adds when styled. */
const ANSI = new RegExp(`${String.fromCharCode(27)}\\[[0-9;]*m`, "g");
/** The prefix of bootstrap's helpers: a label when plain, an emoji when styled (D19). */
const PREFIX = /^(?:\[(?:OK|WARN|ERROR|INFO)\]|✅|⚠️|❌|ℹ️)\s*/u;

function plain(line) {
  return line.replace(ANSI, "").trimEnd();
}

function clean(line) {
  return plain(line).replace(PREFIX, "");
}

function failed(message, remedy = FAILED_REMEDY) {
  return row(RULE, "degraded", null, TASK, message, remedy);
}

/** The row of a spawn that ran and failed: the last stderr line mise did not write (D13). */
function failedRun(r) {
  const lines = (r.stderr ?? "").split("\n").map(plain).filter((l) => l !== "" && !MISE_LINE.test(l));
  if (lines.length === 0) {
    return failed(`${TASK} failed with exit ${r.status}`);
  }
  const last = clean(lines.at(-1));
  return failed(last, last);
}

/** The row of a spawn with no exit status: a failed spawn or a signal (D22). */
function didNotRun(r) {
  return failed(`${TASK} did not run: ${r.error?.message ?? r.signal}`);
}

function taskNames(stdout) {
  try {
    const tasks = JSON.parse(stdout);
    return Array.isArray(tasks) ? tasks.filter(isObject).map((t) => t.name) : null;
  } catch {
    return null;
  }
}

export function lspCheckRows({ base }) {
  const ls = spawnSync("mise", ["tasks", "ls", "--json", "--hidden"], {
    cwd: base,
    encoding: "utf8",
    timeout: TIMEOUT,
  });
  if (ls.status === null) {
    return [didNotRun(ls)];
  }
  const names = ls.status === 0 ? taskNames(ls.stdout) : null;
  if (names === null) {
    return [failedRun(ls)];
  }
  if (!names.includes(TASK)) {
    return [
      failed(
        `${TASK} is not a mise task in ${base}`,
        `run bootstrap sync, so the mise tool writes ${TASK}`,
      ),
    ];
  }

  const r = spawnSync("mise", ["run", TASK], { cwd: base, encoding: "utf8", timeout: TIMEOUT });
  if (r.status === null) {
    return [didNotRun(r)];
  }
  if (r.status === 0) {
    return [];
  }
  const missing = `${r.stdout ?? ""}\n${r.stderr ?? ""}`
    .split("\n")
    .map(clean)
    .map((line) => ({ line, match: NOT_FOUND.exec(line) }))
    .filter(({ match }) => match !== null);
  if (missing.length === 0) {
    return [failedRun(r)];
  }
  return missing.map(({ line, match }) => row(RULE, "degraded", null, match[1], line, match[3]));
}
