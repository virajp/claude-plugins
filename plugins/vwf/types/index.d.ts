/** One row of a plan folder's Units table. */
export type UnitRow = {
  id: string;
  wave: string;
  kind: string;
  file: string;
  status: string;
  commit: string;
};

/** One row of a plan folder's Run log table. */
export type LogRow = {
  wave: string;
  unit: string;
  model: string;
  round: string;
  outcome: string;
  detail: string;
  commit: string;
};

/** What the mod reads from a plan folder's index.md. */
export type PlanSnapshot = {
  title: string;
  status: string;
  units: UnitRow[];
  log: LogRow[];
  gaps: string[];
};

/** One vwf:execute-* subagent the run dispatched. */
export type AgentRun = {
  id: string;
  type: string;
  description: string;
  unit?: string;
  /** Absent for an agent that ran before the mod loaded. */
  startedAt?: number;
  endedAt?: number;
  status: string;
};

/** One plan of the run: a named folder, or each plan of `all`. */
export type PlanRun = {
  folder: string;
  indexPath?: string;
  startedAt: number;
  endedAt?: number;
  plan?: PlanSnapshot;
  agents: AgentRun[];
};

/** One /vwf:execute invocation. */
export type Run = {
  mode: string;
  cwd: string;
  startedAt: number;
  endedAt?: number;
  plans: PlanRun[];
  /** When the mod last read the plan files. */
  refreshedAt?: number;
  /** Why the last read failed, if it did. */
  problem?: string;
};

/** A RUNNING row of docs/plans/index.json. */
export type PlanIndexRow = {
  id: string;
  folder: string;
  kind: string;
  title: string;
  target_repo: string | null;
};

/** One unit of a plan folder's index.json. */
export type PlanUnit = {
  id: string;
  title: string;
  wave: number;
  file: string;
  kind: string;
  status: string;
  commit: string;
  rounds: number;
  range?: { from: string; to: string; };
};

/** One entry of a plan folder's `gaps`. */
export type PlanGap = {
  id: string;
  unit: string;
  stage: string;
  text: string;
  state: string;
};

/** What the mod reads from a plan folder's index.json. */
export type PlanFolder = {
  title: string;
  state: string;
  units: PlanUnit[];
  gaps: PlanGap[];
  run: { worktree?: string; log?: string; };
};

/** One subagent, as the action log records it. */
export type ReplayAgent = {
  /** The child id: the agent's transcript. */
  id: string;
  type: string;
  name?: string;
  description: string;
  startedAt?: number;
  endedAt?: number;
  /** An agent.start and no agent.end. */
  live: boolean;
};

/** A unit with what the log adds: its times and its latest agent. */
export type ReplayUnit = PlanUnit & {
  startedAt?: number;
  endedAt?: number;
  agent?: ReplayAgent;
};

/** One run of the plan: one run.start. */
export type ReplayRun = {
  id: string;
  session: string;
  mode: string;
  startedAt?: number;
};

/** The state of a plan: its folder's index.json, replayed with its log. */
export type Replay = {
  title: string;
  state: string;
  units: ReplayUnit[];
  /** The open entries of the folder's `gaps`. */
  gaps: PlanGap[];
  runs: ReplayRun[];
  /** The last run.start's session, else the last line's. */
  session?: string;
  /** The wave-review agents, by name (`R2`, `R2-late`, `R-late`). */
  reviews: Record<string, ReplayAgent>;
  /** The ids of the agents with an agent.start and no agent.end. */
  live: string[];
  ended: boolean;
  /** The log was read from a tail (over 4 MiB). */
  partial: boolean;
  /** No log line yet. */
  noData: boolean;
  /** Lines that did not parse. */
  skipped: number;
};

declare module "claude-code" {
  interface PluginState {
    vwf: {
      monitorRun: Run | null;
      monitorQuiet: boolean;
      monitorViewing: string | null;
    };
  }
}
