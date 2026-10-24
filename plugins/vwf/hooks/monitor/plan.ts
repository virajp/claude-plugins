import type {
  AgentRun,
  LogRow,
  PlanSnapshot,
  UnitRow,
} from "../../types";

const FOLDER = /\b(\d{4}-\d{2}-\d{2}-[a-z0-9][a-z0-9-]*)\b/;
const UNIT_ID = /\bU\d+\b/;
const LIVE = ["pending", "running", "waiting"];
// C0/C1 control characters but the newline and the tab: no escape sequence
// from a plan file reaches the terminal.
// eslint-disable-next-line no-control-regex
const CONTROL = /[\u0000-\u0008\u000b-\u001f\u007f-\u009f]/g;

/** The lines of one `## <heading>` section, the heading excluded. */
function section(text: string, heading: RegExp): string[] {
  const lines = text.split("\n");
  const start = lines.findIndex(line => heading.test(line));
  if (start < 0) {
    return [];
  }
  const rest = lines.slice(start + 1);
  const end = rest.findIndex(line => /^## /.test(line));

  return end < 0 ? rest : rest.slice(0, end);
}

/** The rows of the first Markdown table in `lines`, keyed by header. */
function table(lines: string[]): Record<string, string>[] {
  const rows = lines.filter(line => line.trim().startsWith("|"));
  if (rows.length < 2) {
    return [];
  }
  // An escaped pipe (`\|`) stays inside its cell.
  const cells = (line: string) =>
    line
      .trim()
      .replace(/^\|/, "")
      .replace(/(?<!\\)\|$/, "")
      .split(/(?<!\\)\|/)
      .map(cell => cell.trim().replace(/\\\|/g, "|"));
  const header = cells(rows[0] ?? "").map(name => name.toLowerCase());

  return rows.slice(2).map(line => {
    const row: Record<string, string> = {};
    cells(line).forEach((cell, i) => {
      row[header[i] ?? String(i)] = cell;
    });

    return row;
  });
}

/** The bullets of a section, each bullet's wrapped lines joined. */
function bullets(lines: string[]): string[] {
  const out: string[] = [];
  for (const line of lines) {
    if (/^\s*[-*] /.test(line)) {
      out.push(line.replace(/^\s*[-*] /, "").trim());
    }
    else if (line.trim() !== "" && out.length > 0 && /^\s+/.test(line)) {
      out[out.length - 1] += " " + line.trim();
    }
  }

  return out;
}

/** Reads the parts of a plan folder's index.md that the pane shows. */
export function parseIndex(raw: string): PlanSnapshot {
  const text = raw.replace(CONTROL, "");
  const title =
    (text.match(/^# Plan — (.+)$/m)?.[1] ?? text.match(/^# (.+)$/m)?.[1] ?? "")
      .trim();
  const status =
    section(text, /^## Status\b/).join(" ").match(/\*\*([A-Z]+)\*\*/)?.[1]
      ?? "";
  const units: UnitRow[] = table(section(text, /^## Units\b/))
    .filter(row => UNIT_ID.test(row["id"] ?? ""))
    .map(row => ({
      id: row["id"] ?? "",
      wave: row["wave"] ?? "",
      kind: row["kind"] ?? "",
      file: (row["unit file"] ?? "").match(/\[([^\]]+)\]/)?.[1]
        ?? row["unit file"]
        ?? "",
      status: row["status"] ?? "",
      commit: row["commit"] ?? "",
    }));
  const log: LogRow[] = table(section(text, /^## Run log\b/)).map(row => ({
    wave: row["wave"] ?? "",
    unit: row["unit"] ?? "",
    model: row["model"] ?? "",
    round: row["round"] ?? "",
    outcome: row["outcome"] ?? "",
    detail: row["detail"] ?? "",
    commit: row["commit"] ?? "",
  }));
  const gaps = bullets(section(text, /^## Gaps surfaced during execution\b/));

  return { title, status, units, log, gaps };
}

/** The folders that docs/plans/index.md marks RUNNING. */
export function runningFolders(text: string): string[] {
  return table(section(text, /^## Plans\b/))
    .filter(row => row["status"] === "RUNNING")
    .map(row => row["folder"]?.match(FOLDER)?.[1] ?? "")
    .filter(folder => folder !== "");
}

/** The plan folder that a text names, if any. */
export function folderIn(text: string): string | undefined {
  return text.match(FOLDER)?.[1];
}

// The names /vwf:execute gives its agents: a unit (`U<n>`, a late loop
// `U<n>-late<k>`) and a wave review (`R<wave>`, `R<wave>-late`, `R-late`). A
// name already taken may carry a `-<n>` suffix.
const UNIT_NAME = /^(U\d+)(?:-late\d+)?(?:-\d+)?$/;
const REVIEW_NAME = /^(R\d+(?:-late)?|R-late)(?:-\d+)?$/;
const ROW_ID = /\bU\d+(?:-late\d+)?\b/g;
const PREFIX = "vwf:execute-";
const RUNNER = "vwf:execute-runner";

/** The wave review an agent's name says it is (`R2`, `R2-late`, `R-late`). */
export function reviewName(name: string | undefined): string | undefined {
  return name?.match(REVIEW_NAME)?.[1];
}

/**
 * True for an agent the pane follows: one named for a unit of the plan or a
 * wave review, or a `vwf:execute-*` agent other than the runner.
 */
export function isFollowed(
  agent: { name?: string; type: string; },
  units: UnitRow[],
): boolean {
  if (reviewName(agent.name) !== undefined) {
    return true;
  }
  const id = agent.name?.match(UNIT_NAME)?.[1];
  // Before the plan is read, any unit name counts.
  if (id && (units.length === 0 || units.some(unit => unit.id === id))) {
    return true;
  }

  return agent.type.startsWith(PREFIX) && agent.type !== RUNNER;
}

// A review row's reviewers: their prompt names the row before the files of
// the units the row covers.
const REVIEWER = /(?:^|:)execute-(?:code|security)-reviewer$/;

/**
 * The unit that a dispatch is for: the agent's name; then, for a review-row
 * reviewer, the first row id of the plan in the text before a unit file's
 * name; for any other agent, a unit file's name before a row id.
 */
export function unitFor(
  text: string,
  units: UnitRow[],
  name?: string,
  type?: string,
): string | undefined {
  const named = name?.match(UNIT_NAME)?.[1];
  if (named && (units.length === 0 || units.some(unit => unit.id === named))) {
    return named;
  }
  const byRow = () => {
    for (const match of text.matchAll(ROW_ID)) {
      const id = match[0].match(UNIT_ID)?.[0];
      if (units.some(unit => unit.id === id)) {
        return id;
      }
    }

    return undefined;
  };
  const byFile = () =>
    units.find(unit => unit.file !== "" && text.includes(unit.file))?.id;

  return type !== undefined && REVIEWER.test(type)
    ? byRow() ?? byFile()
    : byFile() ?? byRow();
}

/** The value of a `key:` line, its quotes and trailing comment dropped. */
function value(line: string): string {
  return line
    .replace(/^[^:]*:\s*/, "")
    .replace(/\s+#.*$/, "")
    .trim()
    .replace(/^(["'])(.*)\1$/, "$2");
}

/** The `path:` of each `members:` entry of a `.config/vwf.yaml`. */
export function memberPaths(yaml: string): string[] {
  const out: string[] = [];
  let isIn = false;
  for (const line of yaml.split("\n")) {
    // A sequence written with no indent stays inside its key.
    if (/^[^\s#-]/.test(line)) {
      isIn = /^members:/.test(line);
      continue;
    }
    if (isIn && /^\s*(-\s+)?path:/.test(line)) {
      const path = value(line.replace(/^\s*-\s+/, ""));
      if (path !== "") {
        out.push(path);
      }
    }
  }

  return out;
}

/** The `host:` of a `.config/vwf-membership.yaml`. */
export function hostOf(yaml: string): string | undefined {
  const line = yaml.split("\n").find(one => /^host:/.test(one));
  const host = line === undefined ? "" : value(line);

  return host === "" ? undefined : host;
}

/** `rel` resolved against the directory `base`, `.` and `..` folded. */
export function joinPath(base: string, rel: string): string {
  const parts: string[] = [];
  for (
    const part of (rel.startsWith("/") ? rel : `${base}/${rel}`).split("/")
  ) {
    if (part === "..") {
      parts.pop();
    }
    else if (part !== "" && part !== ".") {
      parts.push(part);
    }
  }

  return "/" + parts.join("/");
}

/** What `resolveBase` reads with: a file's text, a git command's stdout. */
export type BaseIo = {
  read: (path: string) => Promise<string | undefined>;
  git: (cwd: string, args: string[]) => Promise<string | undefined>;
};

/** One absolute path from a git command's stdout, else undefined. */
function onePath(out: string | undefined): string | undefined {
  const line = out?.trim();

  return line && !line.includes("\n") && line.startsWith("/")
    ? line
    : undefined;
}

/**
 * The base repo of a checkout: `.config/vwf.yaml` here, else the membership
 * `host:`, else a linked worktree's main checkout, tried again from there.
 */
export async function resolveBase(
  cwd: string,
  io: BaseIo,
): Promise<string | undefined> {
  let dir = cwd;
  for (let hop = 0; hop < 3; hop++) {
    const root = onePath(await io.git(dir, ["rev-parse", "--show-toplevel"]))
      ?? dir;
    if ((await io.read(`${root}/.config/vwf.yaml`)) !== undefined) {
      return root;
    }
    const membership = await io.read(`${root}/.config/vwf-membership.yaml`);
    const host = membership === undefined ? undefined : hostOf(membership);
    if (host !== undefined) {
      const base = joinPath(root, host);
      if ((await io.read(`${base}/.config/vwf.yaml`)) !== undefined) {
        return base;
      }
    }
    const common = onePath(
      await io.git(root, [
        "rev-parse",
        "--path-format=absolute",
        "--git-common-dir",
      ]),
    );
    const main = common?.endsWith("/.git") ? common.slice(0, -5) : undefined;
    if (!main || main === root) {
      return undefined;
    }
    dir = main;
  }

  return undefined;
}

/** True when the Status section of an index.md names `root`, where the plan runs. */
export function isClaimedIn(text: string, root: string): boolean {
  return section(text, /^## Status\b/)
    .join(" ")
    .split(/\s+/)
    .some(word => word.replace(/^`|[`.,;:]+$/g, "") === root);
}

/** A unit's state, from the live agents first and then the files. */
export function unitState(
  unit: UnitRow,
  log: LogRow[],
  agents: AgentRun[],
): string {
  if (
    agents.some(agent =>
      agent.unit === unit.id && agent.endedAt === undefined && LIVE
        .includes(agent.status)
    )
  ) {
    return "running";
  }
  const last = [...log].reverse().find(row =>
    row.unit.match(UNIT_ID)?.[0] === unit.id
  );
  if (unit.status !== "" && unit.status !== "pending") {
    return unit.status;
  }
  if (last) {
    return last.outcome;
  }

  return unit.status || "pending";
}

/** True for a state that counts as finished on the progress bar. */
export function isFinished(state: string): boolean {
  return /^(green|pass|skipped|done|complete)/i.test(state);
}

/** The gaps that name a unit: Gaps-section bullets and GAP lines of its log rows. */
export function gapsOf(unitId: string, plan: PlanSnapshot): string[] {
  const named = new RegExp(`\\b${unitId}\\b`);
  const fromSection = plan.gaps.filter(gap => named.test(gap));
  const fromLog = plan
    .log
    .filter(row =>
      row.unit.match(UNIT_ID)?.[0] === unitId && /\bGAP\b/.test(row.detail)
    )
    .map(row => row.detail);

  return [...fromSection, ...fromLog];
}
