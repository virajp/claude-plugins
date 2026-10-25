import type {
  AgentRun,
  LogRow,
  PlanFolder,
  PlanGap,
  PlanIndexRow,
  PlanSnapshot,
  PlanUnit,
  Replay,
  ReplayAgent,
  ReplayRun,
  ReplayUnit,
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
  // A gap the run settled itself starts with `closed`; an untagged one is open.
  const gaps = bullets(section(text, /^## Gaps surfaced during execution\b/))
    .filter(gap => !/^closed\b/i.test(gap));

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
  return unitOf(text, units, name, type);
}

function unitOf(
  text: string,
  units: { id: string; file: string; }[],
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

// The JSON plan format and the action log.

/** A unit status that ends a unit (the schema.mjs unit enum). */
const FINAL = ["green", "failed", "unresolved", "skipped"];

type Json = Record<string, unknown>;

function isObject(value: unknown): value is Json {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** A string field, control characters stripped; "" when absent. */
function str(value: unknown): string {
  return typeof value === "string" ? value.replace(CONTROL, "") : "";
}

function num(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function time(value: unknown): number | undefined {
  const ms = typeof value === "string" ? Date.parse(value) : NaN;

  return Number.isNaN(ms) ? undefined : ms;
}

function parse(text: string): { value?: unknown; problem?: string; } {
  try {
    return { value: JSON.parse(text) };
  }
  catch (error) {
    return { problem: error instanceof Error ? error.message : String(error) };
  }
}

/**
 * The unit an agent is for, from the type and the name of its Agent
 * `tool.start` summary: a unit name (`U<n>`, `U<n>-late<k>`, a `-<n>`
 * suffix) first; then, for a `vwf:execute-*` agent other than the runner,
 * today's rules over `text` (the summary's description) — a review-row
 * reviewer by the row id, any other by a unit file's name.
 */
export function unitForAgent(
  type: string,
  name: string | undefined,
  units: { id: string; file: string; }[],
  text = "",
): string | undefined {
  const named = name?.match(UNIT_NAME)?.[1];
  if (named && units.some(unit => unit.id === named)) {
    return named;
  }
  if (!type.startsWith(PREFIX) || type === RUNNER) {
    return undefined;
  }

  return unitOf(text, units, undefined, type);
}

/** The RUNNING rows of a docs/plans/index.json text. */
export function runningRows(
  text: string,
): { rows: PlanIndexRow[]; problem?: string; } {
  const { value, problem } = parse(text);
  if (problem !== undefined) {
    return { rows: [], problem: `docs/plans/index.json: ${problem}` };
  }
  const plans = isObject(value) && Array.isArray(value["plans"])
    ? value["plans"]
    : undefined;
  if (plans === undefined) {
    return { rows: [], problem: "docs/plans/index.json: no plans list" };
  }
  const rows = plans
    .filter(isObject)
    .filter(row => row["status"] === "RUNNING")
    .map(row => ({
      id: str(row["id"]),
      folder: str(row["folder"]),
      kind: str(row["kind"]),
      title: str(row["title"]),
      target_repo: typeof row["target_repo"] === "string"
        ? str(row["target_repo"])
        : null,
    }))
    .filter(row => row.folder !== "");

  return { rows };
}

/** True for the old markdown plan format. */
export function isOldFormat(facts: {
  /** docs/plans/index.md exists. */
  indexMd: boolean;
  /** The folder has an index.md. */
  folderMd?: boolean;
  /** The folder has an index.json. */
  folderJson?: boolean;
}): boolean {
  return facts.indexMd || (facts.folderMd === true && !facts.folderJson);
}

/** What the pane shows of a plan folder's index.json text. */
export function readFolder(
  text: string,
): { folder?: PlanFolder; problem?: string; } {
  const { value, problem } = parse(text);
  if (problem !== undefined || !isObject(value)) {
    return { problem: `index.json: ${problem ?? "not an object"}` };
  }
  const status = isObject(value["status"]) ? value["status"] : {};
  const run = isObject(value["run"]) ? value["run"] : {};
  const units: PlanUnit[] =
    (Array.isArray(value["units"]) ? value["units"] : [])
      .filter(isObject)
      .map(unit => {
        const out: PlanUnit = {
          id: str(unit["id"]),
          title: str(unit["title"]),
          wave: num(unit["wave"]),
          file: str(unit["file"]),
          kind: str(unit["kind"]),
          status: str(unit["status"]) || "pending",
          commit: str(unit["commit"]),
          rounds: num(unit["rounds"]),
        };
        const range = unit["range"];
        if (isObject(range)) {
          out.range = { from: str(range["from"]), to: str(range["to"]) };
        }

        return out;
      });
  const gaps: PlanGap[] = (Array.isArray(value["gaps"]) ? value["gaps"] : [])
    .filter(isObject)
    .map(gap => ({
      id: str(gap["id"]),
      unit: str(gap["unit"]),
      stage: str(gap["stage"]),
      text: str(gap["text"]),
      state: str(gap["state"]),
    }));
  const folder: PlanFolder = {
    title: str(value["title"]),
    state: str(status["state"]),
    units,
    gaps,
    run: {},
  };
  if (str(run["worktree"]) !== "") {
    folder.run.worktree = str(run["worktree"]);
  }
  if (str(run["log"]) !== "") {
    folder.run.log = str(run["log"]);
  }

  return { folder };
}

/** A leading `~/` becomes `home + "/"`. */
export function expandHome(path: string, home: string): string {
  return path.startsWith("~/") ? `${home}/${path.slice(2)}` : path;
}

/**
 * An Agent `tool.start` summary split at its first two ` :: `: three parts
 * give type, name and description, two give type and description.
 */
function splitSummary(
  summary: string,
): { type: string; name?: string; description: string; } {
  const parts = summary.replace(/ \[bg\]$/, "").split(" :: ");
  if (parts.length >= 3) {
    return {
      type: parts[0] ?? "",
      name: parts[1],
      description: parts.slice(2).join(" :: "),
    };
  }

  return { type: parts[0] ?? "", description: parts[1] ?? "" };
}

/**
 * The plan's state: `folder` (the worktree copy of its index.json, else the
 * main or archived copy) gives the status, the units and the open gaps; the
 * log lines add the runs, each unit's times and agents, the wave-review
 * agents, the live agents and whether the run ended. `plan.snapshot`, `row`
 * status and `gap` events are no source of state.
 */
export function replay(
  lines: string[],
  folder: PlanFolder,
  options: { partial?: boolean; } = {},
): Replay {
  const runs: ReplayRun[] = [];
  let skipped = 0;
  let lastSession: string | undefined;
  // Indexed by line number of the event that ends a run.
  const ends: { at: number; event: string; session: string; }[] = [];
  const firstRunning = new Map<string, number>();
  const lastFinal = new Map<string, { at: number; ts?: number; }>();
  const lastRunning = new Map<string, number>();
  // The Agent calls, by tool_use_id; the agents, by id.
  const calls = new Map<
    string,
    {
      type: string;
      name?: string;
      description: string;
      at?: number;
      child?: string;
    }
  >();
  const pending: string[] = [];
  const agents = new Map<
    string,
    {
      call?: string;
      startedAt?: number;
      endedAt?: number;
      started: boolean;
      ended: boolean;
    }
  >();
  const agentOf = (id: string) => {
    let agent = agents.get(id);
    if (agent === undefined) {
      agent = { started: false, ended: false };
      agents.set(id, agent);
    }

    return agent;
  };
  let lastStart = -1;
  let count = 0;

  for (const raw of lines) {
    if (raw.trim() === "") {
      continue;
    }
    let e: unknown;
    try {
      e = JSON.parse(raw);
    }
    catch {
      skipped++;
      continue;
    }
    if (!isObject(e)) {
      skipped++;
      continue;
    }
    const at = count++;
    const ts = time(e["ts"]);
    const session = str(e["session"]);
    if (session !== "") {
      lastSession = session;
    }
    const event = str(e["event"]);
    switch (event) {
      case "run.start":
        runs.push({
          id: str(e["run"]),
          session,
          mode: str(e["mode"]),
          startedAt: ts,
        });
        lastStart = at;
        break;
      case "run.end":
      case "stop":
      case "session.end":
        ends.push({ at, event, session });
        break;
      case "row": {
        const unit = str(e["unit"]);
        const status = str(e["status"]);
        if (unit === "") {
          break;
        }
        if (status === "running") {
          if (!firstRunning.has(unit) && ts !== undefined) {
            firstRunning.set(unit, ts);
          }
          lastRunning.set(unit, at);
        }
        else if (FINAL.includes(status)) {
          lastFinal.set(unit, { at, ts });
        }
        break;
      }
      case "tool.start": {
        const tool = str(e["tool"]);
        const id = str(e["tool_use_id"]);
        if ((tool === "Agent" || tool === "Task") && id !== "") {
          calls.set(id, { ...splitSummary(str(e["summary"])), at: ts });
          pending.push(id);
        }
        break;
      }
      case "tool.end": {
        const id = str(e["tool_use_id"]);
        const child = str(e["child"]);
        const call = calls.get(id);
        if (call !== undefined && child !== "") {
          // The child the hook recorded wins over a guess at agent.start.
          for (const [other, agent] of agents) {
            if (agent.call === id && other !== child) {
              agent.call = undefined;
            }
          }
          call.child = child;
          agentOf(child).call = id;
        }
        const index = pending.indexOf(id);
        if (index >= 0) {
          pending.splice(index, 1);
        }
        break;
      }
      case "agent.start": {
        const id = str(e["agent"]);
        if (id === "") {
          break;
        }
        const agent = agentOf(id);
        agent.started = true;
        agent.startedAt = ts;
        // A foreground Agent call ends after its agent: tie the agent to the
        // oldest open call of its type until tool.end names the child.
        if (agent.call === undefined) {
          const type = str(e["agent_type"]);
          const index = pending.findIndex(call => {
            const one = calls.get(call);

            return one !== undefined
              && one.child === undefined
              && ![...agents.values()].some(a => a.call === call)
              && (one.type === type || one.type === "");
          });
          if (index >= 0) {
            agent.call = pending[index];
          }
        }
        break;
      }
      case "agent.end": {
        const id = str(e["agent"]);
        if (id !== "") {
          const agent = agentOf(id);
          agent.ended = true;
          agent.endedAt = ts;
        }
        break;
      }
      default:
        break;
    }
  }

  const session = lastStart >= 0
    ? runs[runs.length - 1]?.session
    : lastSession;
  const ended = ends.some(end =>
    end.at > lastStart
    && (end.event !== "session.end" || end.session === session)
  );

  // Each agent with its call, oldest first.
  const tied: {
    agent: ReplayAgent;
    unit?: string;
    review?: string;
    order: number;
  }[] = [];
  for (const [id, agent] of agents) {
    const call = agent.call === undefined ? undefined : calls.get(agent.call);
    if (call === undefined) {
      continue;
    }
    const one: ReplayAgent = {
      id,
      type: call.type,
      description: call.description,
      live: agent.started && !agent.ended,
    };
    if (call.name !== undefined) {
      one.name = call.name;
    }
    // A start time is an agent.start only (D10, D26); the Agent call's
    // tool.start orders the agents, never dates one.
    if (agent.startedAt !== undefined) {
      one.startedAt = agent.startedAt;
    }
    if (agent.endedAt !== undefined) {
      one.endedAt = agent.endedAt;
    }
    const review = reviewName(call.name);
    tied.push({
      agent: one,
      review,
      order: agent.startedAt ?? call.at ?? 0,
      unit: review === undefined
        ? unitForAgent(call.type, call.name, folder.units, call.description)
        : undefined,
    });
  }
  tied.sort((a, b) => a.order - b.order);

  const reviews: Record<string, ReplayAgent> = {};
  for (const one of tied) {
    if (one.review !== undefined) {
      reviews[one.review] = one.agent;
    }
  }

  const units: ReplayUnit[] = folder.units.map(unit => {
    const mine = tied.filter(one => one.unit === unit.id).map(one => one.agent);
    const out: ReplayUnit = { ...unit };
    const startedAt = firstRunning.get(unit.id)
      ?? mine.find(agent => agent.startedAt !== undefined)?.startedAt;
    if (startedAt !== undefined) {
      out.startedAt = startedAt;
    }
    const final = lastFinal.get(unit.id);
    if (
      final?.ts !== undefined && (lastRunning.get(unit.id) ?? -1) < final.at
    ) {
      out.endedAt = final.ts;
    }
    const latest = mine[mine.length - 1];
    if (latest !== undefined) {
      out.agent = latest;
    }

    return out;
  });

  const state: Replay = {
    title: folder.title,
    state: folder.state,
    units,
    gaps: folder.gaps.filter(gap => gap.state === "open"),
    runs,
    reviews,
    live: [...agents]
      .filter(([, agent]) => agent.started && !agent.ended)
      .map(([id]) => id),
    ended,
    partial: options.partial === true,
    noData: count === 0,
    skipped,
  };
  if (session !== undefined) {
    state.session = session;
  }

  return state;
}
