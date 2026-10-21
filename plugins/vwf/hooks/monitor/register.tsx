import {
  atom,
  read,
  update,
} from "claude-code";
import type {
  EngineInterface,
  Register,
} from "claude-code";

import type {
  AgentRun,
  PlanRun,
  Run,
} from "../../types";
import {
  folderIn,
  gapsOf,
  isFinished,
  parseIndex,
  runningFolders,
  unitFor,
  unitState,
} from "./plan";

const PANE = "vwf-monitor";
const SKILL = "vwf:execute";
const AGENT_PREFIX = "vwf:execute-";
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

function open($: $, columns = WIDEST) {
  return $.ui.open({
    id: PANE,
    title: "vwf:execute",
    columns,
    rows: TALLEST,
    closeOnEscape: true,
  });
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

async function start($: $, args: string) {
  const now = await $.clock.now();
  const cwd = await $.session.cwd();
  const folder = folderIn(args);
  const mode = args.trim().split(/\s+/)[0] || "next";
  await update($, run, () => ({
    mode,
    cwd,
    startedAt: now,
    plans: folder ? [{ folder, startedAt: now, agents: [] }] : [],
  }));
  await poke($, true);
}

/** Where a plan folder can be: each checkout of the repo, live or archived. */
async function candidates(
  $: $,
  cwds: string[],
  folder: string,
): Promise<string[]> {
  const roots = new Set<string>();
  for (const cwd of cwds) {
    roots.add(cwd);
    const listed = await $
      .process
      .run(["git", "worktree", "list", "--porcelain"], { cwd })
      .catch(() => undefined);
    for (const line of listed?.stdout.split("\n") ?? []) {
      if (line.startsWith("worktree ")) {
        roots.add(line.slice("worktree ".length));
      }
    }
  }

  return [...roots].flatMap(root => [
    `${root}/docs/plans/${folder}/index.md`,
    `${root}/docs/plans/archived/${folder}/index.md`,
  ]);
}

/** The copy of the plan's index.md with the newest change. */
async function locate(
  $: $,
  cwds: string[],
  folder: string,
): Promise<string | undefined> {
  let best: { path: string; mtime: number; } | undefined;
  for (const path of await candidates($, cwds, folder)) {
    const stat = await $.fs.stat(path).catch(() => undefined);
    if (stat && (!best || stat.mtimeMs > best.mtime)) {
      best = { path, mtime: stat.mtimeMs };
    }
  }

  return best?.path;
}

const LINGER_MS = 10 * 60 * 1000;
const THROTTLE_MS = 3000;
let refreshing: Promise<void> | undefined;
let lastRefresh = -Infinity;

/** Refreshes at most once each THROTTLE_MS, and never twice at the same time. */
async function poke($: $, force = false) {
  const now = await $.clock.now();
  if (refreshing) {
    await refreshing;
  }
  if (!force && (refreshing || now - lastRefresh < THROTTLE_MS)) {
    return;
  }
  lastRefresh = now;
  refreshing = refresh($).finally(() => {
    refreshing = undefined;
  });
  await refreshing;
}

/** Reads the plan files and the agent list again. */
async function refresh($: $) {
  const r = await read($, run);
  if (!r) {
    return;
  }
  const now = await $.clock.now();
  const last0 = r.plans[r.plans.length - 1];
  // After the run ends, keep reading until the plan file says how it ended.
  const isSettled = last0?.plan?.status === "COMPLETE"
    || last0?.plan?.status === "BLOCKED";
  if (r.endedAt !== undefined && (isSettled || now - r.endedAt > LINGER_MS)) {
    return;
  }
  // The run's worktree is gone after landing: also look from where the session is now.
  const cwds = [...new Set([await $.session.cwd(), r.cwd])];
  let plans = r.plans;
  if (plans.length === 0) {
    let folder: string | undefined;
    for (const cwd of cwds) {
      const index = await $.fs.read(`${cwd}/docs/plans/index.md`).catch(() =>
        ""
      );
      folder ??= runningFolders(index)[0];
    }
    if (!folder) {
      await update(
        $,
        run,
        value => (value
          ? {
            ...value,
            refreshedAt: now,
            problem: "No plan reads RUNNING in docs/plans/index.md.",
          }
          : value),
      );
      return;
    }
    plans = [{ folder, startedAt: r.startedAt, agents: [] }];
  }
  const last = plans[plans.length - 1];
  if (!last) {
    return;
  }
  const indexPath = (await locate($, cwds, last.folder)) ?? last.indexPath;
  const text = indexPath
    ? await $.fs.read(indexPath).catch(() => undefined)
    : undefined;
  const problem = text === undefined
    ? `Cannot read the index.md of ${last.folder}.`
    : undefined;
  const plan = text === undefined ? last.plan : parseIndex(text);
  const listed = await $.agent.list().catch(() => []);
  // Agents that ran before the mod loaded, or before /vwf-monitor: no start time.
  const known = new Set(last.agents.map(agent => agent.id));
  const adopted: AgentRun[] = listed
    .filter(info =>
      info.type.startsWith(AGENT_PREFIX)
      && info.type !== RUNNER
      && !known.has(info.id)
    )
    .map(info => ({
      id: info.id,
      type: info.type,
      description: info.description,
      status: info.status,
    }));
  const agents = [...last.agents, ...adopted].map(agent => {
    const info = listed.find(one => one.id === agent.id);
    const status = info?.status ?? agent.status;
    const endedAt = agent.endedAt
      ?? (ENDED.includes(status) && agent.startedAt !== undefined
        ? now
        : undefined);
    const unit = agent.unit
      ?? (plan ? unitFor(agent.description, plan.units) : undefined);

    return { ...agent, status, endedAt, unit };
  });
  const isLanded = plan?.status === "COMPLETE" || plan?.status === "BLOCKED";
  const next: PlanRun = {
    ...last,
    indexPath,
    plan,
    agents,
    endedAt: last.endedAt
      ?? (isLanded && agents.every(isOver) ? now : undefined),
  };
  await update(
    $,
    run,
    value =>
      value
        ? {
          ...value,
          refreshedAt: now,
          problem,
          plans: [...plans.slice(0, -1), next],
        }
        : value,
  );
}

export const register: Register = on => {
  on("session.start", async ($, e, next) => {
    await $.command.register({
      name: "vwf-monitor",
      description: "Open the vwf:execute monitor pane",
    });
    $.clock.every(THROTTLE_MS, () => void poke($));

    return next(e);
  });

  // /vwf-monitor [folder]: also picks up a run that started before the mod loaded.
  // /vwf-monitor close: closes the pane.
  on("command.run", { command: "vwf-monitor" }, async ($, e) => {
    if (e.args.trim() === "close") {
      await $.ui.close({ id: PANE });

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
    const r = await read($, run);
    if (r && r.endedAt === undefined) {
      await poke($);
    }

    return result;
  });

  // A question for the person: the pane steps aside until it is answered.
  on("tool.call", { tool: "AskUserQuestion" }, async ($, e, next) => {
    const r = await read($, run);
    if (!r || r.endedAt !== undefined || e.agentId !== undefined) {
      return next(e);
    }
    await $.ui.close({ id: PANE });
    const answered = await next(e);
    void open($);

    return answered;
  });

  // Each vwf:execute-* subagent: its start time, its unit, its id for the click.
  on("agent.spawn", async ($, e, next) => {
    const spawned = await next(e);
    const r = await read($, run);
    if (
      !r || r.endedAt !== undefined || !e
        .subagentType
        .startsWith(AGENT_PREFIX) || !spawned.agentId
    ) {
      return spawned;
    }
    const now = await $.clock.now();
    const agentId = spawned.agentId;
    await update($, run, value => {
      if (!value) {
        return value;
      }
      let plans = value.plans;
      // A runner of `all` starts the next plan.
      const folder = e.subagentType === RUNNER ? folderIn(e.prompt) : undefined;
      if (folder && current(value)?.folder !== folder) {
        plans = [
          ...plans.map(p => (p
              .endedAt === undefined
            ? { ...p, endedAt: now }
            : p)
          ),
          { folder, startedAt: now, agents: [] },
        ];
      }
      const last = plans[plans.length - 1];
      if (!last) {
        return value;
      }
      const agent: AgentRun = {
        id: agentId,
        type: e.subagentType,
        description: e.description,
        unit: unitFor(`${e.description}\n${e.prompt}`, last.plan?.units ?? []),
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

    return spawned;
  });

  // The main loop ended its turn with no unit running: the run is over.
  on("turn.complete", async ($, e, next) => {
    const done = await next(e);
    const r = await read($, run);
    if (!r || r.endedAt !== undefined || e.agentId !== undefined) {
      return done;
    }
    await refresh($);
    const last = await read($, run);
    const isIdle = !last || last.plans.every(p => p.agents.every(isOver));
    if (isIdle) {
      const now = await $.clock.now();
      await update($, run, value =>
        value
          ? {
            ...value,
            endedAt: now,
            plans: value.plans.map(p => ({ ...p, endedAt: p.endedAt ?? now })),
          }
          : value);
    }

    return done;
  });

  // While the run is live and the main view shows, tool rows draw as one dim line.
  on("ui.render", { component: "ToolUse" }, async ($, e, next) => {
    const r = await read($, run);
    if (
      !r
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
    const { Box, Text, Button } = $.ui.resolve(e);
    const r = await read($, run);
    const quiet = await read($, isQuiet);
    const width = Math.max(40, e.props.bodyColumns);
    const p = r ? current(r) : undefined;

    if (!r || !p) {
      return (
        <Box flexDirection="column">
          <Text dimColor>No /vwf:execute run in this session yet.</Text>
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
            onPress={() => $.ui.close({ id: PANE })}
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
            `${p.folder} · ${plan?.status ?? "…"} · ${r.mode}${
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
