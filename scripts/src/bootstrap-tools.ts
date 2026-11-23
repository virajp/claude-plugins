#!/usr/bin/env node
/**
 * Writes `scripts/src/bootstrap-tools.json`, the committed snapshot of
 * bootstrap's tool names, from `bootstrap catalog --json`.
 *
 * The checker's rule 14 holds every bundle's `tools:` names against this file,
 * and never calls bootstrap itself: the engine is a macOS binary, and the
 * checker runs in CI on Linux. So the snapshot is regenerated here, on a
 * machine with bootstrap installed, and committed. `catalog` lists every tool
 * bootstrap supports, not only the ones a repo selected, and works outside a
 * repo.
 *
 * The snapshot is a list of `{ name, category }`, sorted by name. With
 * `--check` nothing is written, and the run exits 1 when the committed file
 * differs from what the catalog gives. A bootstrap that is absent, fails, or
 * answers `ok: false` exits 1 with its errors.
 *
 * Usage: node scripts/src/bootstrap-tools.ts [--check]
 */
import { spawnSync } from "node:child_process";
import {
  existsSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";
import { firstDifference } from "./marketplace.ts";

export const SNAPSHOT_PATH = "scripts/src/bootstrap-tools.json";

export interface BootstrapTool {
  readonly name: string;
  readonly category: string;
}

/** The tools of `bootstrap catalog --json`, or the errors that stopped it. */
export function readCatalog(
  env: NodeJS.ProcessEnv = process.env,
): { readonly tools: readonly BootstrapTool[] } | { readonly errors: readonly string[] } {
  const run = spawnSync("bootstrap", ["catalog", "--json"], {
    encoding: "utf8",
    env,
  });
  if (run.error !== undefined) {
    return { errors: [`bootstrap could not run: ${run.error.message}`] };
  }
  let reply: unknown;
  try {
    reply = JSON.parse(run.stdout);
  } catch {
    return {
      errors: [
        `bootstrap catalog --json exited ${run.status} with no JSON reply`,
        ...(run.stderr.trim() === "" ? [] : [run.stderr.trim()]),
      ],
    };
  }
  const { ok, data, errors } = (reply ?? {}) as {
    ok?: unknown;
    data?: { tools?: unknown };
    errors?: unknown;
  };
  if (ok !== true || run.status !== 0) {
    const messages = (Array.isArray(errors) ? errors : [])
      .map((e) => String((e as { message?: unknown }).message ?? e));
    return {
      errors: messages.length > 0
        ? messages
        : [`bootstrap catalog --json failed (exit ${run.status})`],
    };
  }
  const tools = Array.isArray(data?.tools) ? data.tools : [];
  const list: BootstrapTool[] = [];
  for (const tool of tools) {
    const { name, category } = (tool ?? {}) as Record<string, unknown>;
    if (typeof name !== "string" || typeof category !== "string") {
      return { errors: [`bootstrap catalog lists a tool with no name or category`] };
    }
    list.push({ name, category });
  }
  return { tools: list };
}

/** The snapshot file's text: the tools, sorted by name. */
export function renderSnapshot(tools: readonly BootstrapTool[]): string {
  const sorted = [...tools]
    .map(({ name, category }) => ({ name, category }))
    .sort((a, b) => a.name.localeCompare(b.name));
  return `${JSON.stringify(sorted, null, 2)}\n`;
}

/** Write or check the snapshot under `repoRoot`; returns the exit code. */
export function main(
  repoRoot: string,
  args: readonly string[],
  env: NodeJS.ProcessEnv = process.env,
): number {
  const catalog = readCatalog(env);
  if ("errors" in catalog) {
    for (const message of catalog.errors) {
      console.error(message);
    }
    return 1;
  }
  const generated = renderSnapshot(catalog.tools);
  const target = join(repoRoot, SNAPSHOT_PATH);

  if (args.includes("--check")) {
    const committed = existsSync(target) ? readFileSync(target, "utf8") : "";
    if (committed !== generated) {
      console.error(`${SNAPSHOT_PATH} is not what bootstrap catalog gives.\n`);
      console.error(firstDifference(committed, generated));
      console.error(
        `\nRe-run 'node scripts/src/bootstrap-tools.ts' and stage the result.`,
      );
      return 1;
    }
    console.log(`${SNAPSHOT_PATH} is up to date.`);
    return 0;
  }
  writeFileSync(target, generated);
  console.log(`wrote ${SNAPSHOT_PATH}`);
  return 0;
}

if (import.meta.main) {
  process.exit(main(join(import.meta.dirname, "..", ".."), process.argv.slice(2)));
}
