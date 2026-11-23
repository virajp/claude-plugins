#!/usr/bin/env node
// The blocking checks of /vwf:doctor, the ones /vwf:execute stops on.
//
//   node checks.mjs [--projects a,b] [--repo <dir>]
//
// Run from any directory: the base repo is resolved from --repo (default the
// cwd) per assets/membership.md. Prints one JSON object on stdout,
// {base, projects, findings}, each finding {rule, severity, project, subject,
// message, remedy}; a repo-level row has project null. Exit 0 when no row is
// blocking, 1 when one is, 2 on a usage or internal error.
//
// --projects scopes the project checks; --projects "" runs the repo-level
// checks only; no flag checks every registry project. No audit, no drift, no
// bootstrap dry-run, and no network read but one: the checks run bootstrap's
// code:lsp:check once from the base root, which runs `bootstrap lsp --json`,
// and report each LSP server it cannot resolve as a degraded lsp-check row; a
// task that is absent or fails is one lsp-check row too. An LSP server of
// `bootstrap lsp --json` missing from the vwf-tools plugin is a degraded row
// (R5b D8).

import {
  ChecksError,
  runChecks,
} from "./lib/index.mjs";

const USAGE = "usage: node checks.mjs [--projects a,b] [--repo <dir>]";

function parseArgs(argv) {
  const options = {};
  for (let i = 0; i < argv.length; i += 2) {
    const flag = argv[i];
    const value = argv[i + 1];
    if (value === undefined || !["--projects", "--repo"].includes(flag)) {
      throw new ChecksError(USAGE);
    }
    if (flag === "--projects") {
      options.projects = value.split(",").map((p) => p.trim()).filter((p) => p !== "");
    } else {
      options.cwd = value;
    }
  }
  return options;
}

try {
  const result = runChecks(parseArgs(process.argv.slice(2)));
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  process.exitCode = result.findings.some((f) => f.severity === "blocking") ? 1 : 0;
} catch (error) {
  process.stderr.write(`checks.mjs: ${error.message}\n`);
  process.exitCode = 2;
}
