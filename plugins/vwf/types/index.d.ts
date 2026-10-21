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

declare module "claude-code" {
  interface PluginState {
    vwf: {
      monitorRun: Run | null;
      monitorQuiet: boolean;
      monitorViewing: string | null;
    };
  }
}
