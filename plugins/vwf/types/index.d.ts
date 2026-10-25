/**
 * One subagent of the plan as the pane shows it: the log's, its `live`
 * checked against $.agent.list() when the run is in this session.
 */
export type AgentRun = ReplayAgent;

/** A run as the pane shows it (T8): live, paused or stopped, or ended. */
export type RunPhase = "live" | "paused" | "ended";

/** The plan the pane shows: the RUNNING row's folder, replayed with its log. */
export type PlanRun = {
  /** The row's folder, relative to its repo root (`docs/plans/<name>`). */
  folder: string;
  /** The row of docs/plans/index.json: the plan's status and times. */
  row: PlanIndexRow;
  /** The checkout that holds the folder: the base repo, or a member's. */
  repo: string;
  /** The index.json the state came from: the worktree, main or archived copy. */
  statePath: string;
  /** The log, `~` expanded; absent until the claim writes `run.log`. */
  logPath?: string;
  replay: Replay;
  /** Set at each refresh, from the statuses, the live agents and the log's last line. */
  phase: RunPhase;
};

/** One opening of the pane, by /vwf:execute or /vwf-monitor. */
export type Run = {
  mode: string;
  cwd: string;
  startedAt: number;
  /** Set when the pane stops following: the closing message shows. */
  endedAt?: number;
  /** The folder name the opening named, until that plan has shown and gone. */
  named?: string;
  /** What the pane waits for while no plan reads RUNNING. */
  waiting?: "claim" | "next";
  waitStartedAt?: number;
  plan?: PlanRun;
  /** The RUNNING folders, when none of several is this session's. */
  choices?: string[];
  /** The message shown for 10 s before the pane closes. */
  message?: string;
  /** When the mod last read the plan files. */
  refreshedAt?: number;
  /** Why the last read failed, if it did. */
  problem?: string;
};

/**
 * A RUNNING row of docs/plans/index.json. A time is an ISO-8601 UTC string,
 * "" when not set (or absent from an older row).
 */
export type PlanIndexRow = {
  id: string;
  folder: string;
  kind: string;
  title: string;
  status: string;
  started: string;
  ended: string;
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
  started: string;
  ended: string;
};

/** One entry of a plan folder's `waves` (`W1` … `W<n>`). */
export type PlanWave = {
  id: string;
  status: string;
  started: string;
  ended: string;
};

/** One entry of a plan folder's `stages`, by its key. */
export type PlanStage = {
  name: string;
  state: string;
  started: string;
  ended: string;
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
  /** The folder's `status.detail`. */
  detail: string;
  units: PlanUnit[];
  waves: PlanWave[];
  stages: PlanStage[];
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
  /** Its agent.start: orders the agents, and settles the live check. */
  startedAt?: number;
  /** An agent.start and no agent.end. */
  live: boolean;
};

/** A unit with what the log adds: its latest agent. */
export type ReplayUnit = PlanUnit & {
  agent?: ReplayAgent;
};

/** The state of a plan: its folder's index.json, replayed with its log. */
export type Replay = {
  title: string;
  state: string;
  detail: string;
  units: ReplayUnit[];
  waves: PlanWave[];
  stages: PlanStage[];
  /** The open entries of the folder's `gaps`. */
  gaps: PlanGap[];
  /** The last run.start's session, else the last line's. */
  session?: string;
  /** The wave-review agents, by name (`R2`, `R2-late`, `R-late`). */
  reviews: Record<string, ReplayAgent>;
  /** The ids of the agents with an agent.start and no agent.end. */
  live: string[];
  /** The ts of the log's last line, for the freshness check. */
  lastAt?: number;
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
