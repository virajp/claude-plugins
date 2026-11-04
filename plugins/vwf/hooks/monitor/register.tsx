import {
  atom,
  read,
  update,
} from "claude-code";
import type {
  AgentInfo,
  EngineInterface,
  Register,
  Timer,
} from "claude-code";

import type {
  AgentRun,
  PlanFolder,
  PlanIndexRow,
  PlanRun,
  QueueRow,
  Replay,
  Run,
} from "../../types";
import {
  expandHome,
  folderIn,
  indexRows,
  joinPath,
  latestRow,
  memberPaths,
  nameOf,
  phaseOf,
  queueRows,
  readFolder,
  replay,
  resolveBase,
  rowFromFolder,
  time,
} from "./plan";
import {
  drawList,
  drawTimeline,
} from "./view";

const PANE = "vwf-monitor";
const SKILL = "vwf:execute";
const ENDED = ["completed", "failed", "killed"];
const FINISHED = ["green", "skipped"];

const run = atom({ plugin: "vwf", key: "monitorRun" } as const, null);
const isQuiet = atom({ plugin: "vwf", key: "monitorQuiet" } as const, true);
const viewing = atom({ plugin: "vwf", key: "monitorViewing" } as const, null);

type $ = EngineInterface;

function clock(ms: number | undefined): string {
  if (ms === undefined) {
    return "—";
  }
  const d = new Date(ms);

  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function span(from: number | undefined, to: number | undefined): string {
  if (from === undefined || to === undefined) {
    return "—";
  }
  const minutes = Math.round((to - from) / 60000);

  return minutes < 60
    ? `${minutes}m`
    : `${Math.floor(minutes / 60)}h${String(minutes % 60).padStart(2, "0")}`;
}

function fit(text: string, width: number): string {
  return text.length <= width
    ? text.padEnd(width)
    : text.slice(0, Math.max(0, width - 1)) + "…";
}

// The widest dock and the tallest inline block the engine grants: requests, which a
// size the person dragged wins over. The dock reads `columns`, the inline block `rows`.
const WIDEST = 400;
const TALLEST = 200;

// Whether the pane is up: it gates the compact tool rows, and tells the
// AskUserQuestion hook whether there is a pane to reopen.
let isOpen = false;

async function open($: $, columns = WIDEST) {
  const opened = await $.ui.open({
    id: PANE,
    title: "vwf:execute",
    columns,
    rows: TALLEST,
    closeOnEscape: true,
  });
  isOpen = true;

  return opened;
}

async function close($: $) {
  isOpen = false;
  await $.ui.close({ id: PANE });
}

/** A unit's color: failed red, skipped gray, green green, or yellow with gaps. */
function colorOf(state: string, gaps: number): string | undefined {
  if (/fail|unresolved/.test(state)) {
    return "red";
  }
  if (state === "skipped") {
    return "gray";
  }
  if (state === "green") {
    return gaps > 0 ? "yellow" : "green";
  }

  return undefined;
}

// How long the pane waits for a claim or a next plan, and shows its closing message.
const PATIENCE_MS = 10 * 60 * 1000;
const CLOSE_MS = 10 * 1000;
const THROTTLE_MS = 3000;
// $.fs.read refuses a file over 4 MiB: a larger log is read from its tail.
const READ_MAX = 4194304;
const TAIL_BYTES = "4000000";
let refreshing: Promise<void> | undefined;
let lastRefresh = -Infinity;
// The refresh timer: it runs only while a run is live, the pane waits, or it
// shows the list of RUNNING plans.
let timer: Timer | undefined;
// The closing message's timer.
let closer: Timer | undefined;
// The base repo of each checkout, once resolved.
const bases = new Map<string, string | undefined>();
// The last read of each index.json and each log, by path, with the size and
// mtime it was read at: an unchanged file is not read again.
const states = new Map<
  string,
  { size: number; mtimeMs: number; folder?: PlanFolder; problem?: string }
>();
const logs = new Map<
  string,
  {
    size: number;
    mtimeMs: number;
    lines: string[];
    partial: boolean;
    problem?: string;
  }
>();

/** True while the pane waits for a claim or follows a run that did not end. */
function isLive(r: Run | null): boolean {
  return r !== null
    && r.endedAt === undefined
    && (r.waiting !== undefined
      || r.plan?.phase === "live"
      || r.plan?.phase === "paused");
}

/** True while a read can change what the pane shows. */
function needsRefresh(r: Run | null): boolean {
  return r !== null
    && r.endedAt === undefined
    && (isLive(r)
      || (isOpen
        && (r.isListOpen === true
          || r.plan === undefined
          || r.plan.phase !== "ended")));
}

/** The plan's phase from its row, its folder, its live agents and its log (T8). */
function phased(plan: PlanRun, now: number): PlanRun {
  return {
    ...plan,
    phase: phaseOf({
      state: plan.replay.state,
      rowStatus: plan.row.status,
      hasLiveAgent: plan.replay.live.length > 0,
      lastAt: plan.replay.lastAt,
      rowStarted: time(plan.row.started),
      now,
    }),
  };
}

function stopTimer() {
  timer?.cancel();
  timer = undefined;
}

function startTimer($: $) {
  stopTimer();
  timer = $.clock.every(THROTTLE_MS, () => void poke($));
}

/** The name that a /vwf-monitor argument gives with no date: its last path part. */
function bareName(token: string): string | undefined {
  return token === "" || token === "attached" || token === "next" || token === "all"
    ? undefined
    : nameOf(token);
}

/**
 * Starts following. /vwf:execute <folder> waits for that plan's claim, and
 * /vwf:execute next or all shows the plan list until the claim; /vwf-monitor
 * shows the named plan, else the plan a read picks.
 */
async function start($: $, args: string, isExecute: boolean) {
  const now = await $.clock.now();
  const cwd = await $.session.cwd();
  const token = args.trim().split(/\s+/)[0] ?? "";
  const named = folderIn(args) ?? (isExecute ? undefined : bareName(token));
  const mode = token || "next";
  closer?.cancel();
  closer = undefined;
  bases.clear();
  states.clear();
  logs.clear();
  await update($, run, () => {
    const value: Run = { mode, cwd, startedAt: now };
    if (named !== undefined) {
      value.named = named;
    }
    if (isExecute) {
      value.waiting = "claim";
      value.waitStartedAt = now;
      if (named === undefined) {
        value.isQueue = true;
      }
    }

    return value;
  });
  startTimer($);
  await poke($, true);
}

/** Shows one message, then closes the pane after CLOSE_MS. */
async function finish($: $, message: string) {
  stopTimer();
  const now = await $.clock.now();
  await update($, run, (value) =>
    value
      ? {
        mode: value.mode,
        cwd: value.cwd,
        startedAt: value.startedAt,
        endedAt: now,
        message,
        refreshedAt: now,
      }
      : value);
  closer?.cancel();
  closer = $.clock.after(CLOSE_MS, () => {
    closer = undefined;
    void close($);
  });
}

/** A git command's stdout, or undefined when it failed. */
async function git(
  $: $,
  cwd: string,
  args: string[],
): Promise<string | undefined> {
  const out = await $
    .process
    .run(["git", ...args], { cwd })
    .catch(() => undefined);

  return out && out.exitCode === 0 ? out.stdout : undefined;
}

async function baseOf($: $, cwd: string): Promise<string | undefined> {
  if (!bases.has(cwd)) {
    bases.set(
      cwd,
      await resolveBase(cwd, {
        read: (path) => $.fs.read(path).catch(() => undefined),
        git: (dir, args) => git($, dir, args),
      }),
    );
  }

  return bases.get(cwd);
}

async function stat($: $, path: string) {
  return $.fs.stat(path).catch(() => undefined);
}

/** A folder's index.json, read again only when its size or mtime moved. */
async function readState(
  $: $,
  path: string,
): Promise<{ folder?: PlanFolder; problem?: string }> {
  const now = await stat($, path);
  if (now === undefined) {
    return { problem: `Cannot read ${path}.` };
  }
  const last = states.get(path);
  if (last && last.size === now.size && last.mtimeMs === now.mtimeMs) {
    return last;
  }
  const text = await $.fs.read(path).catch(() => undefined);
  const read = text === undefined
    ? { problem: `Cannot read ${path}.` }
    : readFolder(text);
  states.set(path, { size: now.size, mtimeMs: now.mtimeMs, ...read });

  return read;
}

/**
 * The log's lines, read again only when its size or mtime moved; over 4 MiB,
 * the lines of its last 4000000 bytes, the first (cut) one dropped. A missing
 * log has no lines.
 */
async function readLog(
  $: $,
  path: string,
): Promise<{ lines: string[]; partial: boolean; problem?: string }> {
  const now = await stat($, path);
  if (now === undefined) {
    return { lines: [], partial: false };
  }
  const last = logs.get(path);
  if (last && last.size === now.size && last.mtimeMs === now.mtimeMs) {
    return last;
  }
  let read: { lines: string[]; partial: boolean; problem?: string };
  if (now.size > READ_MAX) {
    const out = await $
      .process
      .run(["tail", "-c", TAIL_BYTES, path])
      .catch(() => undefined);
    read = {
      lines: (out?.stdout ?? "").split("\n").slice(1),
      partial: true,
    };
    if (out === undefined || out.exitCode !== 0 || out.isStdoutTruncated) {
      read.problem = `tail -c ${TAIL_BYTES} ${path}: ${
        out === undefined
          ? "did not run"
          : out.isStdoutTruncated
          ? "output cut"
          : `exit ${out.exitCode}`
      }`;
    }
  } else {
    const text = await $.fs.read(path).catch(() => undefined);
    read = text === undefined
      ? { lines: [], partial: false, problem: `Cannot read ${path}.` }
      : { lines: text.split("\n"), partial: false };
  }
  logs.set(path, { size: now.size, mtimeMs: now.mtimeMs, ...read });

  return read;
}

const OLD_FORMAT =
  "This repo is on the old plan format (docs/plans/index.md): the pane reads docs/plans/index.json only.";

type Found =
  | { kind: "plan"; plan: PlanRun; problem?: string }
  | { kind: "problem"; problem: string };

/** The repos a plan can be in: the base, and each member for a `target_repo` row. */
async function reposOf($: $, base: string, isMember: boolean): Promise<string[]> {
  const repos = [base];
  if (isMember) {
    const yaml = await $.fs.read(`${base}/.config/vwf.yaml`).catch(() => "");
    memberPaths(yaml).forEach((path) => repos.push(joinPath(base, path)));
  }

  return repos;
}

/**
 * A row's index.json in its main checkout: its folder, else the archived
 * copy, in the base repo or a member's.
 */
async function mainCopy(
  $: $,
  repos: string[],
  folder: string,
): Promise<{ repo: string; path: string; hasMd: boolean } | { hasMd: boolean }> {
  const name = nameOf(folder);
  let hasMd = false;
  for (const repo of repos) {
    for (
      const dir of [
        `${repo}/${folder}`,
        `${repo}/docs/plans/archived/${name}`,
      ]
    ) {
      if ((await stat($, `${dir}/index.json`)) !== undefined) {
        return { repo, path: `${dir}/index.json`, hasMd };
      }
      hasMd ||= (await stat($, `${dir}/index.md`)) !== undefined;
    }
  }

  return { hasMd };
}

/**
 * A row's plan: its folder's index.json in the main checkout (the base repo,
 * or a member's for a `target_repo` row) for `run`; the state from the run's
 * worktree copy when it exists — live, else archived during the landing — else
 * the main or archived copy; then the log at `run.log`.
 */
async function loadPlan(
  $: $,
  base: string,
  row: PlanIndexRow,
): Promise<Found> {
  const name = nameOf(row.folder);
  const repos = await reposOf($, base, row.target_repo !== null);
  const main = await mainCopy($, repos, row.folder);
  if (!("path" in main)) {
    return {
      kind: "problem",
      problem: main.hasMd
        ? `${name}: old format, no details.`
        : `Cannot find ${row.folder}/index.json.`,
    };
  }
  const read = await readState($, main.path);
  if (read.folder === undefined) {
    return { kind: "problem", problem: read.problem ?? main.path };
  }
  let folder = read.folder;
  let statePath = main.path;
  if (read.folder.run.worktree !== undefined) {
    const tree = joinPath(main.repo, read.folder.run.worktree);
    for (
      const path of [
        `${tree}/${row.folder}/index.json`,
        `${tree}/docs/plans/archived/${name}/index.json`,
      ]
    ) {
      if ((await stat($, path)) === undefined) {
        continue;
      }
      const copy = await readState($, path);
      if (copy.folder !== undefined) {
        folder = copy.folder;
        statePath = path;
        break;
      }
    }
  }
  const home = (await $.env.get("HOME")) ?? "";
  const logPath = read.folder.run.log === undefined
    ? undefined
    : expandHome(read.folder.run.log, home);
  const log = logPath === undefined
    ? { lines: [], partial: false }
    : await readLog($, logPath);
  const plan: PlanRun = phased({
    folder: row.folder,
    row,
    repo: main.repo,
    statePath,
    replay: replay(log.lines, folder, { partial: log.partial }),
    phase: "live",
  }, await $.clock.now());
  if (logPath !== undefined) {
    plan.logPath = logPath;
  }
  const found: Found = { kind: "plan", plan };
  if (log.problem !== undefined) {
    found.problem = log.problem;
  }

  return found;
}

/** A folder's entries; none when it cannot be read. */
async function dirs($: $, path: string): Promise<string[]> {
  const entries = await $.fs.list(path).catch(() => []);

  return entries
    .filter((one) => one.kind === "dir")
    .map((one) => one.name);
}

/** The folder a name means: an exact name, else one that ends in `-<name>`. */
function matchName(names: string[], name: string): string | undefined {
  return names.includes(name)
    ? name
    : names.filter((one) => one.endsWith(`-${name}`)).sort().pop();
}

/**
 * The named plan: its row, else a folder in docs/plans or docs/plans/archived
 * that has no row, in the base repo or a member's.
 */
async function loadNamed(
  $: $,
  base: string,
  rows: PlanIndexRow[],
  name: string,
): Promise<Found> {
  const hit = matchName(rows.map((row) => nameOf(row.folder)), name);
  const row = rows.find((one) => nameOf(one.folder) === hit);
  if (row !== undefined) {
    return loadPlan($, base, row);
  }
  for (const repo of await reposOf($, base, true)) {
    for (const parent of ["docs/plans", "docs/plans/archived"]) {
      const folder = matchName(await dirs($, `${repo}/${parent}`), name) ?? name;
      const path = `${repo}/${parent}/${folder}`;
      const read = (await stat($, `${path}/index.json`)) === undefined
        ? undefined
        : await readState($, `${path}/index.json`);
      if (read?.folder !== undefined) {
        return loadPlan($, base, rowFromFolder(`${parent}/${folder}`, read.folder));
      }
      if ((await stat($, `${path}/index.md`)) !== undefined) {
        return { kind: "problem", problem: `${folder}: old format, no details.` };
      }
    }
  }

  return { kind: "problem", problem: `No plan named ${name}.` };
}

/** The plan list's rows, with the units finished of each folder that can be read. */
async function loadQueue(
  $: $,
  base: string,
  rows: PlanIndexRow[],
): Promise<QueueRow[]> {
  const out = queueRows(rows);
  for (const one of out) {
    const row = rows.find((other) => other.folder === one.folder);
    const main = await mainCopy(
      $,
      await reposOf($, base, row?.target_repo != null),
      one.folder,
    );
    if (!("path" in main)) {
      continue;
    }
    let folder = (await readState($, main.path)).folder;
    if (folder?.run.worktree !== undefined) {
      const path = `${joinPath(main.repo, folder.run.worktree)}/${one.folder}/index.json`;
      if ((await stat($, path)) !== undefined) {
        folder = (await readState($, path)).folder ?? folder;
      }
    }
    if (folder !== undefined) {
      one.total = folder.units.length;
      one.done = folder.units.filter((unit) => FINISHED.includes(unit.status)).length;
    }
  }

  return out;
}

/** Refreshes at most once each THROTTLE_MS, and never twice at the same time. */
async function poke($: $, force = false) {
  while (refreshing) {
    if (!force) {
      return;
    }
    await refreshing;
  }
  const now = await $.clock.now();
  if (!force && now - lastRefresh < THROTTLE_MS) {
    return;
  }
  lastRefresh = now;
  refreshing = refresh($).finally(() => {
    refreshing = undefined;
  });
  await refreshing;
}

/**
 * The replay with each live agent that $.agent.list() shows as done, or does
 * not list, ended — in the run's own session only. An agent that started
 * after the list was read is not ended for missing from it.
 */
function settle(
  state: Replay,
  listed: AgentInfo[] | undefined,
  listedAt: number,
  session: string | undefined,
): Replay {
  if (listed === undefined || session === undefined) {
    return state;
  }
  if (state.session !== session) {
    return state;
  }
  const isOver = (id: string, startedAt?: number) => {
    const info = listed.find((one) => one.id === id);

    return info
      ? ENDED.includes(info.status)
      : startedAt === undefined || startedAt < listedAt;
  };
  const fix = (agent: AgentRun): AgentRun =>
    agent.live && isOver(agent.id, agent.startedAt)
      ? { ...agent, live: false }
      : agent;
  const starts = new Map<string, number | undefined>();
  state.units.forEach((unit) => {
    if (unit.agent) {
      starts.set(unit.agent.id, unit.agent.startedAt);
    }
  });
  Object.values(state.reviews).forEach((agent) => {
    starts.set(agent.id, agent.startedAt);
  });
  const reviews: Record<string, AgentRun> = {};
  for (const [key, agent] of Object.entries(state.reviews)) {
    reviews[key] = fix(agent);
  }

  return {
    ...state,
    units: state.units.map((unit) => unit.agent ? { ...unit, agent: fix(unit.agent) } : unit),
    reviews,
    live: state.live.filter((id) => !isOver(id, starts.get(id))),
  };
}

/** Reads the plan index, the folder and its log again, and the agent list. */
async function refresh($: $) {
  const r = await read($, run);
  if (!r || r.endedAt !== undefined) {
    return;
  }
  const now = await $.clock.now();
  // The list first: an agent the log shows starting after this was not listed.
  const listed = await $.agent.list().catch(() => undefined);
  const cwd = await $.session.cwd();
  const base = (await baseOf($, cwd)) ?? (await baseOf($, r.cwd)) ?? r.cwd;
  if ((await stat($, `${base}/docs/plans/index.md`)) !== undefined) {
    await finish($, OLD_FORMAT);
    return;
  }
  const text = await $
    .fs
    .read(`${base}/docs/plans/index.json`)
    .catch(() => undefined);
  if (text === undefined) {
    await finish($, `No docs/plans/index.json in ${base}.`);
    return;
  }
  const { rows, problem: indexProblem } = indexRows(text);
  if (indexProblem !== undefined) {
    await update(
      $,
      run,
      (value) => value ? { ...value, problem: indexProblem, refreshedAt: now } : value,
    );
    return;
  }
  const session = await $.session.id().catch(() => undefined);
  const running = rows.filter((row) => row.status === "RUNNING");
  const next: Run = { ...r, refreshedAt: now };
  delete next.problem;

  // /vwf:execute next or all: the first RUNNING row that this run did not find
  // at its opening, or one its log says this session runs, is the claim.
  const isAll = r.mode === "all";
  if (next.isQueue || isAll) {
    next.baseline ??= running.map((row) => row.folder);
    let claimed = running.find((row) => !next.baseline?.includes(row.folder));
    if (claimed === undefined && next.isQueue && session !== undefined) {
      for (const row of running) {
        const one = await loadPlan($, base, row);
        if (one.kind === "plan" && one.plan.replay.session === session) {
          claimed = row;
          break;
        }
      }
    }
    if (claimed !== undefined) {
      next.named = nameOf(claimed.folder);
      next.baseline = [
        ...next.baseline.filter((one) => one !== claimed.folder),
        claimed.folder,
      ];
      delete next.isQueue;
      delete next.isListOpen;
      delete next.waiting;
      delete next.waitStartedAt;
    }
  }

  // A bare /vwf-monitor: the running plan, this session's of several, else the
  // latest; the plan list when none of them can be picked. The pick stays.
  if (next.named === undefined && !next.isQueue && !next.isListOpen) {
    let pick: PlanIndexRow | undefined = running.length === 1 ? running[0] : undefined;
    if (running.length > 1 && session !== undefined) {
      const mine: PlanIndexRow[] = [];
      for (const row of running) {
        const one = await loadPlan($, base, row);
        if (one.kind === "plan" && one.plan.replay.session === session) {
          mine.push(row);
        }
      }
      pick = mine.length === 1 ? mine[0] : undefined;
    }
    pick ??= running.length === 0 ? latestRow(rows) : undefined;
    if (pick !== undefined) {
      next.named = nameOf(pick.folder);
    } else {
      next.isListOpen = true;
    }
  }

  if (next.named === undefined) {
    delete next.plan;
  } else {
    const found = await loadNamed($, base, rows, next.named);
    if (found.kind === "problem") {
      delete next.plan;
      next.isListOpen = true;
      next.problem = found.problem;
    } else {
      next.plan = phased({
        ...found.plan,
        replay: settle(found.plan.replay, listed, now, session),
      }, now);
      if (found.problem !== undefined) {
        next.problem = found.problem;
      }
      if (next.waiting === "claim" && found.plan.row.status !== "APPROVED") {
        delete next.waiting;
        delete next.waitStartedAt;
      }
    }
  }

  // An `all` run with its plan landed polls for the next RUNNING row.
  if (isAll && next.plan?.phase === "ended" && next.waiting === undefined) {
    next.waiting = "next";
    next.waitStartedAt = now;
  }
  // The wait ends; the pane stays.
  if (
    next.waiting !== undefined
    && now - (next.waitStartedAt ?? now) >= PATIENCE_MS
  ) {
    delete next.waiting;
    delete next.waitStartedAt;
  }

  if (next.plan === undefined || next.isListOpen) {
    next.queue = await loadQueue($, base, rows);
    const archived = await dirs($, `${base}/docs/plans/archived`);
    next.archived = archived.sort().reverse();
  }

  await update($, run, () => next);
  const after = await read($, run);
  if (needsRefresh(after)) {
    if (timer === undefined) {
      startTimer($);
    }
  } else {
    stopTimer();
  }
}

export const register: Register = (on) => {
  on("session.start", async ($, e, next) => {
    await $.command.register({
      name: "vwf-monitor",
      description: "Open the vwf:execute monitor pane",
    });
    // After a reload: the pane may still be up, and a live run goes on.
    const panes = await $.ui.panes().catch(() => []);
    isOpen = panes.some((pane) => pane.id === PANE);
    if (needsRefresh(await read($, run))) {
      startTimer($);
    }

    return next(e);
  });

  // /vwf-monitor [plan]: any plan by name, else the running or the latest plan.
  // /vwf-monitor close: closes the pane.
  on("command.run", { command: "vwf-monitor" }, async ($, e) => {
    if (e.args.trim() === "close") {
      await close($);

      return { text: "The vwf:execute monitor is closed." };
    }
    const r = await read($, run);
    // A named plan always starts over; a bare /vwf-monitor keeps a live run.
    if (!isLive(r) || e.args.trim() !== "") {
      isOpen = true;
      await start($, e.args || "attached", false);
    }
    await open($, e.presentation.columns);

    return { text: "The vwf:execute monitor is open." };
  });

  // A typed /vwf:execute: the person asked, so the pane opens at any width.
  on("prompt.submit", async ($, e, next) => {
    if (e.command?.name === SKILL) {
      await start($, e.command.args, true);
      await open($);
    }

    return next(e);
  });

  // The model ran the skill: the pane opens where the terminal is wide enough.
  on("tool.call", { tool: "Skill" }, async ($, e, next) => {
    const r = await read($, run);
    if (e.skill === SKILL && (!r || r.endedAt !== undefined)) {
      await start($, e.args ?? "", true);
      void open($);
    }

    return next(e);
  });

  // Each tool call in the session also refreshes, at most once each THROTTLE_MS.
  on("tool.call", async ($, e, next) => {
    const result = await next(e);
    const r = await read($, run);
    if (r && r.endedAt === undefined) {
      void poke($);
    }

    return result;
  });

  // A question for the person: an open pane steps aside until it is answered.
  on("tool.call", { tool: "AskUserQuestion" }, async ($, e, next) => {
    const r = await read($, run);
    if (
      !r || r.endedAt !== undefined || e.agentId !== undefined || !isOpen
    ) {
      return next(e);
    }
    await close($);
    const answered = await next(e);
    void open($);

    return answered;
  });

  // The person closed the pane.
  on("ui.close", async ($, e, next) => {
    const closed = await next(e);
    if (e.id === PANE) {
      isOpen = false;
    }

    return closed;
  });

  // A new agent: the log has its Agent call; read it.
  on("agent.spawn", async ($, e, next) => {
    const spawned = await next(e);
    const r = await read($, run);
    if (r && r.endedAt === undefined) {
      void poke($);
    }

    return spawned;
  });

  // The main loop ended its turn: read the plan again.
  on("turn.complete", async ($, e, next) => {
    const done = await next(e);
    const r = await read($, run);
    if (r && r.endedAt === undefined && e.agentId === undefined) {
      await poke($, true);
    }

    return done;
  });

  // While the run is live, the pane is up and the main view shows, tool rows draw as one dim line.
  on("ui.render", { component: "ToolUse" }, async ($, e, next) => {
    const r = await read($, run);
    if (
      !isOpen
      || !isLive(r)
      || !(await read($, isQuiet))
      || (await read($, viewing)) !== null
    ) {
      return next(e);
    }
    const { Text } = $.ui.resolve(e);

    return <Text dimColor>· {e.props.tool}</Text>;
  });

  on("ui.render", { component: "Pane", requestId: PANE }, async ($, e) => {
    isOpen = true;
    const { Box, Text, Button } = $.ui.resolve(e);
    const r = await read($, run);
    const quiet = await read($, isQuiet);
    const width = Math.max(40, e.props.bodyColumns);
    const p = r?.plan;
    const isMainView = e.props.view.agentId === undefined;
    const live = isLive(r);
    // The terminal lays columns out in cells; a graphical surface draws a proportional
    // font, so its text is never padded and its tables are rows of sized boxes.
    const isTerminal = e.surface === "terminal";
    const cut = (text: string, size: number) => isTerminal ? fit(text, size) : text;

    const back = async () => {
      await $.ui.view({});
      await update($, viewing, () => null);
    };
    const buttons = (
      <Box>
        <Button
          key="close"
          label="Close"
          hotkey="c"
          {...(isTerminal ? {} : { role: "dismiss" as const })}
          onPress={() => close($)}
        />
        {!isMainView && <Text>{" "}</Text>}
        {!isMainView && (
          <Button
            key="back"
            label="Main transcript"
            hotkey="m"
            onPress={back}
          />
        )}
        {live && <Text>{" "}</Text>}
        {live && (
          <Button
            key="quiet"
            label={quiet ? "Show tool rows" : "Hide tool rows"}
            hotkey="t"
            onPress={() => update($, isQuiet, (value) => !value)}
          />
        )}
        {isTerminal && <Text dimColor>{"  Esc closes · ctrl+x tab, then a hotkey"}</Text>}
      </Box>
    );
    const problem = r?.problem !== undefined && <Text color="red">{cut(r.problem, width)}</Text>;

    if (!r) {
      return (
        <Box flexDirection="column">
          {buttons}
          <Text dimColor>No plan is open. Run /vwf-monitor.</Text>
        </Box>
      );
    }
    if (r.message !== undefined) {
      return (
        <Box flexDirection="column">
          {buttons}
          <Text>{r.message}</Text>
          <Text dimColor>The pane closes in 10 s.</Text>
        </Box>
      );
    }
    const pick = async (folder: string) => {
      await update($, run, (value) => {
        if (!value) {
          return value;
        }
        const next: Run = { ...value, named: nameOf(folder) };
        delete next.isListOpen;
        delete next.plan;

        return next;
      });
      startTimer($);
      await poke($, true);
    };
    const setList = async (isListOpen: boolean) => {
      await update($, run, (value) => {
        if (!value) {
          return value;
        }
        const next: Run = { ...value };
        if (isListOpen) {
          next.isListOpen = true;
        } else {
          delete next.isListOpen;
        }

        return next;
      });
      startTimer($);
      await poke($, true);
    };
    const toggleArchived = () =>
      update($, run, (value) => value ? { ...value, isArchivedOpen: !value.isArchivedOpen } : value);
    if (!p || r.isListOpen) {
      const list = {
        queue: r.queue ?? [],
        archived: r.archived ?? [],
        isArchivedOpen: r.isArchivedOpen === true,
        isWaiting: r.isQueue === true && r.waiting !== undefined,
        mode: r.mode,
        problem: r.problem,
        readAt: r.refreshedAt,
        hasPlan: p !== undefined,
        isTerminal,
        width,
        close: () => close($),
        back: () => setList(false),
        pick,
        toggleArchived,
      };

      return drawList($.ui.resolve(e), list);
    }

    const now = r.refreshedAt ?? Date.now();
    const state = p.replay;
    const isEnded = p.phase === "ended";
    const units = state.units;
    const shown = units.map((unit) => unit.agent?.live && unit.status === "pending" ? "running" : unit.status);
    const done = shown.filter((one) => FINISHED.includes(one)).length;
    const gapCounts = units.map((unit) => state.gaps.filter((gap) => gap.unit === unit.id).length);
    const isClaiming = r.waiting === "claim" && r.isQueue !== true;
    const barWidth = Math.max(units.length * 2, width - 10);
    const segment = units.length === 0
      ? 0
      : Math.max(1, Math.floor((barWidth - (units.length - 1)) / units.length));
    const startedAt = time(p.row.started);
    const endedAt = time(p.row.ended);
    const phase = isClaiming
      ? "claim in progress"
      : p.phase === "not-run"
      ? "not run"
      : p.phase === "paused"
      ? `paused or stopped${state.detail ? ` — ${state.detail}` : ""}`
      : p.phase;
    // A start and end, and the time between, or up to now while not ended.
    const times = (started: string, ended: string) => {
      const from = time(started);
      const end = time(ended);

      return fit(clock(from), 7) + fit(clock(end), 7) + fit(
        span(
          from,
          end ?? (from !== undefined && !isEnded ? now : undefined),
        ),
        7,
      );
    };
    const reviews = Object.entries(state.reviews);
    const name = nameOf(p.folder);

    const show = async (label: string, agent: AgentRun | undefined) => {
      if (!agent) {
        $.ui.toast(`${label} has no subagent in the log.`);
        return;
      }
      const moved = await $.ui.view({ agentId: agent.id });
      if (moved.deny) {
        $.ui.toast(`Cannot show ${label}: ${moved.deny}`);
      } else {
        await update($, viewing, () => agent.id);
      }
    };

    const footer = `Read ${
      r.refreshedAt === undefined
        ? "—"
        : new Date(r.refreshedAt).toTimeString().slice(0, 8)
    } · ${e.props.placement} · ${
      e.viewport?.isFullscreen === undefined
        ? "layout unknown"
        : e.viewport.isFullscreen
        ? "fullscreen"
        : "normal layout"
    } · ${p.logPath ?? "no run.log yet"}`;

    if (e.surface !== "terminal") {
      return drawTimeline($.ui.resolve(e), {
        plan: p,
        now,
        shown,
        gapCounts,
        isClaiming,
        readAt: r.refreshedAt,
        problem: r.problem,
        isLive: live,
        isQuiet: quiet,
        isMainView,
        close: () => close($),
        back,
        plans: () => setList(true),
        toggleQuiet: () => update($, isQuiet, (value) => !value),
        show,
      });
    }

    return (
      <Box flexDirection="column">
        <Box>
          {buttons}
          <Text>{" "}</Text>
          <Button key="plans" label="Plans" hotkey="p" onPress={() => setList(true)} />
        </Box>
        <Text bold>{fit(state.title || name, width)}</Text>
        <Text dimColor>
          {fit(
            `${name} · ${state.state || "…"} · ${phase} · ${r.mode}`,
            width,
          )}
        </Text>
        <Text>
          Started {clock(startedAt)} · Ended {clock(endedAt)} · Elapsed{" "}
          {span(startedAt, endedAt ?? (isEnded ? undefined : now))}
        </Text>
        <Text>
          {units.map((unit, i) => {
            const one = shown[i] ?? "";
            const gap = i < units.length - 1 ? " " : "";

            return one === "pending"
              ? <Text dimColor>{"░".repeat(segment) + gap}</Text>
              : (
                <Text color={colorOf(one, gapCounts[i] ?? 0)}>
                  {"█".repeat(segment) + gap}
                </Text>
              );
          })} {done}/{units.length}
        </Text>
        {state.noData && <Text dimColor>no run data yet</Text>}
        <Text>{" "}</Text>
        <Text dimColor>
          {fit(
            "Unit  Title                Wave Kind    Status      Start  End    Time   Gaps",
            width,
          )}
        </Text>
        {units.map((unit, i) => {
          const one = shown[i] ?? "";
          const gaps = gapCounts[i] ?? 0;

          return (
            <Button
              key={`unit-${unit.id}`}
              plain
              onPress={() => show(unit.id, unit.agent)}
            >
              {fit(unit.id, 6)}
              {fit(unit.title, 21)}
              {fit(String(unit.wave), 5)}
              {fit(unit.kind, 8)}
              <Text color={colorOf(one, gaps)}>{fit(one, 12)}</Text>
              {times(unit.started, one === "running" ? "" : unit.ended)}
              <Text color={gaps > 0 ? "yellow" : undefined}>
                {String(gaps)}
              </Text>
            </Button>
          );
        })}
        {state.waves.map((wave) => (
          <Text key={`wave-${wave.id}`}>
            {fit(wave.id, 32)}
            {fit("wave", 8)}
            <Text color={colorOf(wave.status, 0)}>{fit(wave.status, 12)}</Text>
            {times(wave.started, wave.ended)}
          </Text>
        ))}
        {reviews.map(([key, agent]) => (
          <Button
            key={`review-${key}`}
            plain
            onPress={() => show(key, agent)}
          >
            {fit(key, 32)}
            {fit("review", 8)}
            <Text>{fit(agent.live ? "running" : "done", 12)}</Text>
          </Button>
        ))}
        {state.stages.map((stage) => (
          <Text key={`stage-${stage.name}`}>
            {fit(stage.name, 32)}
            {fit("stage", 8)}
            <Text color={colorOf(stage.state, 0)}>{fit(stage.state, 12)}</Text>
            {times(stage.started, stage.ended)}
          </Text>
        ))}
        {state.gaps.length > 0 && <Text>{" "}</Text>}
        {state.gaps.length > 0 && <Text bold>Gaps</Text>}
        {state.gaps.map((gap) => (
          <Text color="yellow">
            {fit(`- ${gap.id} · ${gap.unit || gap.stage} · ${gap.text}`, width)}
          </Text>
        ))}
        <Text>{" "}</Text>
        <Text dimColor>{fit(footer, width)}</Text>
        {state.partial && (
          <Text dimColor>
            {fit(
              `partial replay: the log is over 4 MiB, its last ${TAIL_BYTES} bytes read`,
              width,
            )}
          </Text>
        )}
        {problem}
      </Box>
    );
  });
};
