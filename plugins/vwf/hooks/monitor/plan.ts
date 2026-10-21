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
  const cells = (line: string) =>
    line.trim().replace(/^\||\|$/g, "").split("|").map(cell => cell.trim());
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

/** The unit that a dispatch is for: its id, or its unit file's name. */
export function unitFor(text: string, units: UnitRow[]): string | undefined {
  const byFile = units.find(unit =>
    unit.file !== "" && text.includes(unit.file)
  );
  if (byFile) {
    return byFile.id;
  }
  const id = text.match(UNIT_ID)?.[0];

  return units.some(unit => unit.id === id) ? id : undefined;
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
