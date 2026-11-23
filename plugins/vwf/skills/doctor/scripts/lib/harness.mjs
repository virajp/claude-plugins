// The harness capabilities a project's platforms imply (assets/harness.md,
// D37): dev for any screen platform, screenshots for a browser one, goldens
// for a device one. A task capability is present when its task name is in
// `mise tasks ls --json --no-global --hidden` (D19); goldens is the
// test:golden port of `bootstrap describe --json` (D10). Each read runs in the
// repo that holds the project (D24). An absent capability is a degraded row; a
// failed mise call is a refusal (D25).

import { spawnSync } from "node:child_process";
import {
  ChecksError,
  isObject,
  row,
} from "./util.mjs";

const BROWSER = ["site", "webapp"];
const DEVICE = ["desktop", "mobile", "tablet", "auto", "watch", "tv", "spatial"];

/** capability → {task} for a mise task, {port} for a bootstrap port. */
const SOURCES = {
  dev: { task: "dev" },
  screenshots: { task: "screenshots" },
  goldens: { port: "test:golden" },
};

/** The capabilities the platforms imply, in harness.md's order. */
export function impliedCapabilities(platforms) {
  const browser = platforms.some((p) => BROWSER.includes(p));
  const device = platforms.some((p) => DEVICE.includes(p));
  return [
    ...(browser || device ? ["dev"] : []),
    ...(browser ? ["screenshots"] : []),
    ...(device ? ["goldens"] : []),
  ];
}

/** The task names of `mise tasks ls --json --no-global --hidden` in `cwd`. */
export function miseTasks(cwd) {
  const args = ["tasks", "ls", "--json", "--no-global", "--hidden"];
  const what = `mise ${args.join(" ")}`;
  const r = spawnSync("mise", args, { cwd, encoding: "utf8" });
  if (r.error?.code === "ENOENT") {
    throw new ChecksError(`${what} failed in ${cwd}: mise is not on PATH`);
  }
  let tasks = null;
  try {
    tasks = r.status === 0 ? JSON.parse(r.stdout) : null;
  } catch {
    // reported below
  }
  if (!Array.isArray(tasks)) {
    const why = ((r.stderr ?? "") || (r.error?.message ?? "") || `exit ${r.status ?? r.signal}`).trim();
    throw new ChecksError(`${what} failed in ${cwd}: ${why}`);
  }
  return tasks.filter(isObject).map((t) => t.name).filter((n) => typeof n === "string");
}

function portPresent(described, port) {
  const ports = Array.isArray(described?.ports) ? described.ports : [];
  return ports.some((p) => isObject(p) && p.name === port && p.present === true);
}

/**
 * The degraded harness rows of one project: one per implied capability that
 * is absent in `dir`. `described` is that repo's describe data; `tasksOf()`
 * reads its mise tasks, called only when a task capability is implied.
 */
export function harnessRows(name, platforms, dir, described, tasksOf) {
  const rows = [];
  for (const capability of impliedCapabilities(platforms)) {
    const { task, port } = SOURCES[capability];
    const present = task !== undefined ? tasksOf().includes(task) : portPresent(described, port);
    if (!present) {
      rows.push(
        row(
          "harness",
          "degraded", // D37: a recorded gap, never stops execute
          name,
          capability,
          task !== undefined
            ? `${capability} missing: no ${task} task in ${dir}`
            : `${capability} missing: the ${port} port is not present in ${dir}`,
          `/vwf:plan injects the ${capability} unit when a cycle needs it`,
        ),
      );
    }
  }
  return rows;
}
