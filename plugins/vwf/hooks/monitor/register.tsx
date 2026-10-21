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
  PlanRun,
  Run,
  UnitRow,
} from "../../types";
import {
  folderIn,
  gapsOf,
  isFinished,
  isFollowed,
  joinPath,
  memberPaths,
  parseIndex,
  resolveBase,
  reviewName,
  runningFolders,
  unitFor,
  unitState,
} from "./plan";

const PANE = "vwf-monitor";
const SKILL = "vwf:execute";
const RUNNER = "vwf:execute-runner";
const ENDED = ["completed", "failed", "killed"];

const run = atom({ plugin: "vwf", key: "monitorRun" } as const, null);
const isQuiet = atom({ plugin: "vwf", key: "monitorQuiet" } as const, true);
const viewing = atom({ plugin: "vwf", key: "monitorViewing" } as const, null);

type $ = EngineInterface;

function isOver(agent: AgentRun): boolean {
  return agent.endedAt !== undefined || ENDED.includes(agent.status);
}

function current(r: Run): PlanRun | undefined {
  return r.plans[r.plans.length - 1];
}

function clock(ms: number | undefined): string {
  if (ms === undefined) {
    return "—";
  }
  const d = new Date(ms);

  return `${String(d.getHours()).padStart(2, "0")}:${
    String(d.getMinutes()).padStart(2, "0")
  }`;
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

/** A unit's color: running plain, failed red, skipped gray, finished green, or yellow with gaps. */
function colorOf(state: string, gaps: number): string | undefined {
  if (/block|fail/.test(state)) {
    return "red";
  }
  if (/^skipped/.test(state)) {
    return "gray";
  }
  if (isFinished(state)) {
    return gaps > 0 ? "yellow" : "green";
  }

  return undefined;
}

const WAIT_MS = 10 * 60 * 1000;
const THROTTLE_MS = 3000;
let refreshing: Promise<void> | undefined;
let lastRefresh = -Infinity;
// The refresh timer: it runs only while a run is live.
let timer: Timer | undefined;
// Set when a main-loop turn ended with no live agent; the run ends after
// WAIT_MS with no change in the plan file or the agents.
let waitingSince: number | undefined;
let lastChangeAt = 0;
let lastSeen = "";
// True while the plan was picked from docs/plans/index.md, not named.
let isGuess = false;
// The runner of each plan of an `all` run, by folder.
const runners = new Map<string, string>();
// The base repo of each checkout, once resolved.
const bases = new Map<string, string | undefined>();

function stopTimer() {
  timer?.cancel();
  timer = undefined;
}

function startTimer($: $) {
  stopTimer();
  timer = $.clock.every(THROTTLE_MS, () => void poke($));
}

async function start($: $, args: string) {
  const now = await $.clock.now();
  const cwd = await $.session.cwd();
  const folder = folderIn(args);
  const mode = args.trim().split(/\s+/)[0] || "next";
  waitingSince = undefined;
  lastSeen = "";
  lastChangeAt = now;
  isGuess = !folder;
  await update($, run, () => ({
    mode,
    cwd,
    startedAt: now,
    plans: folder ? [{ folder, startedAt: now, agents: [] }] : [],
  }));
  startTimer($);
  await poke($, true);
}

/** Ends the run: its plans, the wait, the timer. */
async function endRun($: $, now: number) {
  stopTimer();
  waitingSince = undefined;
  await update($, run, value =>
    value
      ? {
        ...value,
        endedAt: value.endedAt ?? now,
        plans: value.plans.map(p => ({ ...p, endedAt: p.endedAt ?? now })),
      }
      : value);
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
        read: path => $.fs.read(path).catch(() => undefined),
        git: (dir, args) => git($, dir, args),
      }),
    );
  }

  return bases.get(cwd);
}

/** The checkouts a plan can be in: the cwds, the base repo, its members, and each one's worktrees. */
async function roots($: $, cwds: string[]): Promise<string[]> {
  const found = new Set<string>(cwds);
  for (const cwd of cwds) {
    const base = await baseOf($, cwd);
    if (base === undefined) {
      continue;
    }
    found.add(base);
    const config = await $.fs.read(`${base}/.config/vwf.yaml`).catch(() => "");
    for (const path of memberPaths(config)) {
      found.add(joinPath(base, path));
    }
  }
  for (const root of [...found]) {
    for (
      const line of (await git($, root, ["worktree", "list", "--porcelain"]))
        ?.split("\n") ?? []
    ) {
      if (line.startsWith("worktree ")) {
        found.add(line.slice("worktree ".length));
      }
    }
  }

  return [...found];
}

async function exists($: $, path: string): Promise<boolean> {
  return (await $.fs.stat(path).catch(() => undefined)) !== undefined;
}

const nameOf = (path: string) => path.split("/").pop() ?? "";

/**
 * The plan's index.md: the known one while it exists, else the first live
 * copy (the worktree named for the folder first), else an archived one.
 */
async function locate(
  $: $,
  cwds: string[],
  folder: string,
  known: string | undefined,
): Promise<{ path: string; isArchived: boolean; } | undefined> {
  const live = `/docs/plans/${folder}/index.md`;
  if (known?.endsWith(live) && (await exists($, known))) {
    return { path: known, isArchived: false };
  }
  const all = await roots($, cwds);
  const ordered = [
    ...all.filter(root => nameOf(root) === folder),
    ...all.filter(root => nameOf(root) !== folder),
  ];
  for (const root of ordered) {
    if (await exists($, `${root}${live}`)) {
      return { path: `${root}${live}`, isArchived: false };
    }
  }
  for (const root of ordered) {
    const path = `${root}/docs/plans/archived/${folder}/index.md`;
    if (await exists($, path)) {
      return { path, isArchived: true };
    }
  }

  return undefined;
}

/**
 * With no folder named: the one RUNNING row of the plan index, or among
 * several, the one in this session's checkout or one of its worktrees.
 */
async function pick(
  $: $,
  cwds: string[],
): Promise<{ folder?: string; problem?: string; }> {
  const folders = new Set<string>();
  for (const cwd of cwds) {
    const base = (await baseOf($, cwd)) ?? cwd;
    for (const dir of new Set([base, cwd])) {
      const index = await $
        .fs
        .read(`${dir}/docs/plans/index.md`)
        .catch(() => "");
      runningFolders(index).forEach(folder => folders.add(folder));
    }
  }
  const rows = [...folders];
  if (rows.length === 0) {
    return { problem: "No plan reads RUNNING in docs/plans/index.md." };
  }
  if (rows.length === 1) {
    return { folder: rows[0] };
  }
  const cwd = cwds[0] ?? "";
  const listed = (await git($, cwd, ["worktree", "list", "--porcelain"]))
    ?.split("\n")
    .filter(line => line.startsWith("worktree "))
    .map(line => line.slice("worktree ".length)) ?? [];
  const main = listed[0];
  const here = (await git($, cwd, ["rev-parse", "--show-toplevel"]))?.trim();
  const tiers = [
    here && here !== main ? [here] : [],
    listed.slice(1),
  ];
  for (const tier of tiers) {
    const hits: string[] = [];
    for (const folder of rows) {
      for (const root of tier) {
        if (await exists($, `${root}/docs/plans/${folder}/index.md`)) {
          hits.push(folder);
          break;
        }
      }
    }
    if (hits.length === 1) {
      return { folder: hits[0] };
    }
    if (hits.length > 1) {
      break;
    }
  }

  return {
    problem: `${rows.length} plans read RUNNING: run /vwf-monitor <folder>.`,
  };
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

/** The unit an agent is for, from its name and what it was given. */
function mapUnit(
  name: string | undefined,
  text: string,
  units: UnitRow[],
): string | undefined {
  return reviewName(name) ?? unitFor(text, units, name);
}

/** Reads the plan files and the agent list again, and merges them into the run. */
async function refresh($: $) {
  const r = await read($, run);
  if (!r || r.endedAt !== undefined) {
    return;
  }
  const now = await $.clock.now();
  // The run's worktree is gone after landing: also look from where the session is now.
  const cwds = [...new Set([await $.session.cwd(), r.cwd])];
  let folder = current(r)?.folder;
  let problem: string | undefined;
  if (isGuess || folder === undefined) {
    const picked = await pick($, cwds);
    problem = picked.problem;
    folder = picked.folder ?? folder;
  }
  if (folder === undefined) {
    await update(
      $,
      run,
      value => (value ? { ...value, refreshedAt: now, problem } : value),
    );
    return;
  }
  const known = current(r)?.folder === folder
    ? current(r)?.indexPath
    : undefined;
  const found = await locate($, cwds, folder, known);
  const text = found
    ? await $.fs.read(found.path).catch(() => undefined)
    : undefined;
  problem ??= text === undefined
    ? `Cannot read the index.md of ${folder}.`
    : undefined;
  const plan = text === undefined ? undefined : parseIndex(text);
  const listed: AgentInfo[] | undefined = await $
    .agent
    .list()
    .catch(() => undefined);

  await update($, run, value => {
    if (!value) {
      return value;
    }
    let plans = value.plans;
    const head = plans[plans.length - 1];
    if (!head) {
      plans = [{ folder, startedAt: value.startedAt, agents: [] }];
    }
    else if (head.folder !== folder && isGuess) {
      // A better pick: the agents seen so far are this session's.
      plans = [...plans.slice(0, -1), {
        ...head,
        folder,
        indexPath: undefined,
        plan: undefined,
      }];
    }
    const lastIndex = plans.length - 1;
    const last = plans[lastIndex];
    if (!last) {
      return value;
    }
    const units = plan?.units ?? last.plan?.units ?? [];
    const knownIds = new Set(plans.flatMap(p => p.agents.map(a => a.id)));
    const runner = runners.get(last.folder);
    // Agents that ran before the mod loaded, or before /vwf-monitor: no start
    // time. An agent of an earlier plan of an `all` run is never adopted.
    const adopted: AgentRun[] = (listed ?? [])
      .filter(info =>
        !knownIds.has(info.id)
        && isFollowed({ name: info.name, type: info.type }, units)
        && (runner !== undefined
          ? info.parentId === runner
          : plans.length === 1)
      )
      .map(info => ({
        id: info.id,
        type: info.type,
        description: info.description,
        status: info.status,
        unit: mapUnit(info.name, info.description, units),
      }));
    const settle = (agent: AgentRun): AgentRun => {
      const info = listed?.find(one => one.id === agent.id);
      const unit = agent.unit
        ?? mapUnit(info?.name, agent.description, units);
      if (isOver(agent) || listed === undefined) {
        return { ...agent, unit };
      }
      // An agent gone from the list has ended.
      const status = info?.status ?? "completed";
      const endedAt = !info || ENDED.includes(status) ? now : undefined;

      return { ...agent, status, endedAt, unit };
    };
    plans = plans.map((p, i) => ({
      ...p,
      agents: [...p.agents, ...(i === lastIndex ? adopted : [])].map(settle),
    }));
    const next = plans[lastIndex];
    if (next && next.folder === folder) {
      const isLanded = plan?.status === "COMPLETE"
        || plan?.status === "BLOCKED"
        || found?.isArchived === true;
      plans[lastIndex] = {
        ...next,
        indexPath: found?.path ?? next.indexPath,
        plan: plan ?? next.plan,
        endedAt: next.endedAt
          ?? (isLanded && next.agents.every(isOver) ? now : undefined),
      };
    }

    return { ...value, refreshedAt: now, problem, plans };
  });

  const after = await read($, run);
  const p = after ? current(after) : undefined;
  if (!after || !p) {
    return;
  }
  const seen = `${text ?? ""}\n${
    after
      .plans
      .flatMap(one => one.agents.map(a => `${a.id}:${a.status}`))
      .join(",")
  }`;
  if (seen !== lastSeen) {
    lastSeen = seen;
    lastChangeAt = now;
  }
  const status = p.plan?.status;
  // In every mode: the next plan of an `all` run is a new run.
  const isDone = status === "BLOCKED"
    || status === "COMPLETE"
    || found?.isArchived === true;
  const isStale = waitingSince !== undefined
    && now - Math.max(waitingSince, lastChangeAt) >= WAIT_MS;
  if (isDone || isStale) {
    await endRun($, now);
  }
}

export const register: Register = on => {
  on("session.start", async ($, e, next) => {
    await $.command.register({
      name: "vwf-monitor",
      description: "Open the vwf:execute monitor pane",
    });
    // After a reload: the pane may still be up, and a live run goes on.
    const panes = await $.ui.panes().catch(() => []);
    isOpen = panes.some(pane => pane.id === PANE);
    const r = await read($, run);
    if (r && r.endedAt === undefined) {
      startTimer($);
    }

    return next(e);
  });

  // /vwf-monitor [folder]: also picks up a run that started before the mod loaded.
  // /vwf-monitor close: closes the pane.
  on("command.run", { command: "vwf-monitor" }, async ($, e) => {
    if (e.args.trim() === "close") {
      await close($);

      return { text: "The vwf:execute monitor is closed." };
    }
    const r = await read($, run);
    // A named folder always starts over; a bare /vwf-monitor keeps a live run.
    if (!r || r.endedAt !== undefined || folderIn(e.args)) {
      await start($, e.args || "attached");
    }
    await open($, e.presentation.columns);

    return { text: "The vwf:execute monitor is open." };
  });

  // A typed /vwf:execute: the person asked, so the pane opens at any width.
  on("prompt.submit", async ($, e, next) => {
    if (e.command?.name === SKILL) {
      await start($, e.command.args);
      await open($);
    }

    return next(e);
  });

  // The model ran the skill: the pane opens where the terminal is wide enough.
  on("tool.call", { tool: "Skill" }, async ($, e, next) => {
    const r = await read($, run);
    if (e.skill === SKILL && (!r || r.endedAt !== undefined)) {
      await start($, e.args ?? "");
      void open($);
    }

    return next(e);
  });

  // Each tool call in the session also refreshes, at most once each THROTTLE_MS.
  on("tool.call", async ($, e, next) => {
    const result = await next(e);
    // The main loop is working again: the run is not waiting.
    if (e.agentId === undefined) {
      waitingSince = undefined;
    }
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

  // Each unit and wave-review agent: its start time, its unit, its id for the click.
  on("agent.spawn", async ($, e, next) => {
    const spawned = await next(e);
    const r = await read($, run);
    if (!r || !spawned.agentId) {
      return spawned;
    }
    const agentId = spawned.agentId;
    const isRunner = e.subagentType === RUNNER;
    if (r.endedAt !== undefined) {
      // The next plan of an `all` run, after the last one ended its run.
      const following = isRunner && r.mode === "all"
        ? folderIn(e.prompt)
        : undefined;
      if (following) {
        runners.set(following, agentId);
        await start($, `all docs/plans/${following}`);
      }

      return spawned;
    }
    const units = current(r)?.plan?.units ?? [];
    if (
      !isRunner && !isFollowed({ name: e.name, type: e.subagentType }, units)
    ) {
      return spawned;
    }
    const now = await $.clock.now();
    waitingSince = undefined;
    // A runner of `all` starts the next plan.
    const folder = isRunner ? folderIn(e.prompt) : undefined;
    if (isRunner && !folder) {
      return spawned;
    }
    if (folder) {
      runners.set(folder, agentId);
    }
    const wasGuess = isGuess;
    if (folder) {
      isGuess = false;
    }
    await update($, run, value => {
      if (!value) {
        return value;
      }
      let plans = value.plans;
      if (folder) {
        const head = plans[plans.length - 1];
        if (head?.folder === folder) {
          return value;
        }
        // A guessed plan nothing ran in gives way to the runner's.
        if (head && wasGuess && head.agents.length === 0) {
          plans = plans.slice(0, -1);
        }

        return {
          ...value,
          plans: [
            ...plans.map(p => (p.endedAt === undefined
              ? { ...p, endedAt: now }
              : p)
            ),
            { folder, startedAt: now, agents: [] },
          ],
        };
      }
      const last = plans[plans.length - 1];
      if (!last) {
        return value;
      }
      const agent: AgentRun = {
        id: agentId,
        type: e.subagentType,
        description: e.description,
        unit: mapUnit(
          e.name,
          `${e.description}\n${e.prompt}`,
          last.plan?.units ?? [],
        ),
        startedAt: now,
        status: "running",
      };

      return {
        ...value,
        plans: [...plans.slice(0, -1), {
          ...last,
          agents: [...last.agents, agent],
        }],
      };
    });
    // A new plan: read it now.
    if (folder) {
      void poke($, true);
    }

    return spawned;
  });

  // The main loop ended its turn with no agent live: the run waits, and the
  // refresh ends it once the plan lands or nothing changes for WAIT_MS.
  on("turn.complete", async ($, e, next) => {
    const done = await next(e);
    const r = await read($, run);
    if (!r || r.endedAt !== undefined || e.agentId !== undefined) {
      return done;
    }
    await poke($, true);
    const after = await read($, run);
    if (!after || after.endedAt !== undefined) {
      return done;
    }
    const isIdle = after.plans.every(p => p.agents.every(isOver));
    if (isIdle) {
      waitingSince = await $.clock.now();
      // Redraw the pane's status line.
      await update($, run, value => (value ? { ...value } : value));
    }

    return done;
  });

  // While the run is live, the pane is up and the main view shows, tool rows draw as one dim line.
  on("ui.render", { component: "ToolUse" }, async ($, e, next) => {
    const r = await read($, run);
    if (
      !isOpen
      || !r
      || r.endedAt !== undefined
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
    const p = r ? current(r) : undefined;

    if (!r || !p) {
      return (
        <Box flexDirection="column">
          <Text dimColor>No /vwf:execute run in this session yet.</Text>
          {r?.problem !== undefined && (
            <Text color="red">{fit(r.problem, width)}</Text>
          )}
        </Box>
      );
    }

    const now = Date.now();
    const plan = p.plan;
    const units = plan?.units ?? [];
    const states = units.map(unit =>
      unitState(unit, plan?.log ?? [], p.agents)
    );
    const done = states.filter(isFinished).length;
    const gapCounts = units.map(unit => (plan
      ? gapsOf(unit.id, plan)
        .length
      : 0)
    );
    const barWidth = Math.max(units.length * 2, width - 10);
    const segment = units.length === 0
      ? 0
      : Math.max(1, Math.floor((barWidth - (units.length - 1)) / units.length));
    const isMainView = e.props.view.agentId === undefined;
    // The wave reviews, in the order they ran.
    const reviews = [
      ...new Set(
        p
          .agents
          .map(a => a.unit)
          .filter((unit): unit is string => reviewName(unit) !== undefined),
      ),
    ];
    const isWaiting = r.endedAt === undefined && waitingSince !== undefined;

    const back = async () => {
      await $.ui.view({});
      await update($, viewing, () => null);
    };
    const show = async (unitId: string) => {
      const agent = [...p.agents].reverse().find(a => a.unit === unitId);
      if (!agent) {
        $.ui.toast(`${unitId} has no subagent output in this session.`);
        return;
      }
      const moved = await $.ui.view({ agentId: agent.id });
      if (moved.deny) {
        $.ui.toast(`Cannot show ${unitId}: ${moved.deny}`);
      }
      else {
        await update($, viewing, () => agent.id);
      }
    };

    return (
      <Box flexDirection="column">
        <Box>
          <Button
            key="close"
            label="Close"
            hotkey="c"
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
          {r.endedAt === undefined && <Text>{" "}</Text>}
          {r.endedAt === undefined && (
            <Button
              key="quiet"
              label={quiet ? "Show tool rows" : "Hide tool rows"}
              hotkey="t"
              onPress={() => update($, isQuiet, value => !value)}
            />
          )}
          <Text dimColor>{"  Esc closes · ctrl+x tab, then a hotkey"}</Text>
        </Box>
        <Text bold>{fit(plan?.title || p.folder, width)}</Text>
        <Text dimColor>
          {fit(
            `${p.folder} · ${plan?.status ?? "…"}${
              isWaiting ? " · waiting" : ""
            } · ${r.mode}${
              r
                  .plans
                  .length > 1
                ? ` · plan ${r.plans.length}`
                : ""
            }`,
            width,
          )}
        </Text>
        <Text>
          Started {clock(p.startedAt)} · Ended {clock(p.endedAt)} · Elapsed{" "}
          {span(p.startedAt, p.endedAt ?? now)}
        </Text>
        <Text>
          {units.map((unit, i) => {
            const state = states[i] ?? "";
            const isPending = state === "" || state === "pending";
            const gap = i < units.length - 1 ? " " : "";

            return isPending
              ? <Text dimColor>{"░".repeat(segment) + gap}</Text>
              : (
                <Text color={colorOf(state, gapCounts[i] ?? 0)}>
                  {"█".repeat(segment) + gap}
                </Text>
              );
          })} {done}/{units.length}
        </Text>
        <Text>{" "}</Text>
        <Text dimColor>
          {fit(
            "Unit  Wave Kind    Status        Start  End    Time   Gaps",
            width,
          )}
        </Text>
        {units.map((unit, i) => {
          const agents = p.agents.filter(a => a.unit === unit.id);
          const first = agents[0];
          const lastAgent = agents[agents.length - 1];
          const state = states[i] ?? "";
          const gaps = gapCounts[i] ?? 0;
          const color = colorOf(state, gaps);
          const end = state === "running" ? undefined : lastAgent?.endedAt;

          return (
            <Button
              key={`unit-${unit.id}`}
              plain
              onPress={() => show(unit.id)}
            >
              {fit(unit.id, 6)}
              {fit(unit.wave, 5)}
              {fit(unit.kind, 8)}
              <Text color={color}>{fit(state, 14)}</Text>
              {fit(clock(first?.startedAt), 7)}
              {fit(clock(end), 7)}
              {fit(span(first?.startedAt, end ?? (first ? now : undefined)), 7)}
              <Text color={gaps > 0 ? "yellow" : undefined}>
                {String(gaps)}
              </Text>
            </Button>
          );
        })}
        {reviews.map(key => {
          const agents = p.agents.filter(a => a.unit === key);
          const first = agents[0];
          const lastAgent = agents[agents.length - 1];
          const isLive = agents.some(a => !isOver(a));
          const state = isLive ? "running" : (lastAgent?.status ?? "");
          const end = isLive ? undefined : lastAgent?.endedAt;

          return (
            <Button
              key={`review-${key}`}
              plain
              onPress={() => show(key)}
            >
              {fit(key, 11)}
              {fit("review", 8)}
              <Text color={colorOf(state, 0)}>{fit(state, 14)}</Text>
              {fit(clock(first?.startedAt), 7)}
              {fit(clock(end), 7)}
              {fit(span(first?.startedAt, end ?? (first ? now : undefined)), 7)}
            </Button>
          );
        })}
        {plan && plan.gaps.length > 0 && <Text>{" "}</Text>}
        {plan && plan.gaps.length > 0 && <Text bold>Gaps</Text>}
        {(plan?.gaps ?? []).map(gap => (
          <Text color="yellow">{fit(`- ${gap}`, width)}</Text>
        ))}
        <Text>{" "}</Text>
        <Text dimColor>
          {fit(
            `Read ${
              r.refreshedAt === undefined
                ? "—"
                : new Date(r.refreshedAt).toTimeString().slice(0, 8)
            } · ${e.props.placement} · ${
              e.viewport?.isFullscreen === undefined
                ? "layout unknown"
                : e.viewport.isFullscreen
                ? "fullscreen"
                : "normal layout"
            } · ${p.indexPath ?? "no index.md found"}`,
            width,
          )}
        </Text>
        {r.problem !== undefined && (
          <Text color="red">{fit(r.problem, width)}</Text>
        )}
      </Box>
    );
  });
};
