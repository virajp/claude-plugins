#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.14"
# dependencies = []
# ///
# MISE description="Unit-test the npm-normalize hook (table-driven)"
# MISE tools={uv="latest", python="3.14"}

# Runs under the system sed on purpose: the hook must work with BSD sed.

import json
import os
import subprocess
import sys
import tempfile

sys.dont_write_bytecode = True
sys.path.insert(0, f"{os.environ['MISE_PROJECT_ROOT']}/.config/mise/tasks/_scripts")
import helpers  # noqa: E402

HOOK = "plugins/stackgen/stacks/package-manager/pnpm/hooks/npm-normalize.sh"

# (input, expected); expected == input means the hook must not change it.
PNPM = [
  ("npx create-vite app", "pnpm dlx create-vite app"),
  ("npx -y cowsay hi", "pnpm dlx -y cowsay hi"),
  ("npm install", "pnpm install"),
  ("npm ci", "pnpm install --frozen-lockfile"),
  ("npm run build", "pnpm run build"),
  ("npm install && npm run test", "pnpm install && pnpm run test"),
  ("echo hi; npm test", "echo hi; pnpm test"),
  ("npm ci && npx -y prettier .", "pnpm install --frozen-lockfile && pnpm dlx -y prettier ."),
  ("echo $(npm config get registry)", "echo $(pnpm config get registry)"),
  ("ls -la", "ls -la"),
  ("echo deploy-npm-pkg", "echo deploy-npm-pkg"),
]
BUN = [
  ("npx create-vite app", "bunx create-vite app"),
  ("npx -y cowsay hi", "bunx -y cowsay hi"),
  ("npm install", "bun install"),
  ("npm ci", "bun install --frozen-lockfile"),
  ("npm run build", "bun run build"),
  ("npm install && npm run test", "bun install && bun run test"),
  ("echo hi; npm test", "echo hi; bun test"),
  ("npm ci && npx -y prettier .", "bun install --frozen-lockfile && bunx -y prettier ."),
  ("echo $(npm config get registry)", "echo $(bun config get registry)"),
  ("ls -la", "ls -la"),
  ("echo deploy-npm-pkg", "echo deploy-npm-pkg"),
]


def run_table(hook, label, marker, cases):
  """One table in a temporary folder with the lock file <marker>; an empty
  marker tests the pnpm default. Returns the count of failures."""
  failures = 0
  helpers.print_yellow(f"  -- {label}")
  with tempfile.TemporaryDirectory() as sandbox:
    if marker:
      open(os.path.join(sandbox, marker), "w").close()
    for given, expected in cases:
      payload = json.dumps({"tool_input": {"command": given}})
      out = subprocess.run(
        ["bash", hook], input=payload, cwd=sandbox, stdout=subprocess.PIPE, text=True, check=False
      ).stdout
      try:
        actual = json.loads(out)["hookSpecificOutput"]["updatedInput"]["command"] or given
      except (ValueError, KeyError, TypeError):
        actual = given
      if actual == expected:
        helpers.print_yellow(f"  ok   {given}")
      else:
        helpers.print_error(f"  FAIL [{label}] {given}")
        helpers.print_warn(f"       expected: {expected}")
        helpers.print_warn(f"       actual:   {actual}")
        failures += 1
  return failures


def main():
  os.chdir(os.environ["MISE_PROJECT_ROOT"])
  if not helpers.has_tool("jq"):
    helpers.print_error("jq is necessary to run the hook tests")
    return 1
  if not os.path.isfile(HOOK):
    helpers.print_error(f"Hook not found: {HOOK}")
    return 1
  helpers.print_header(f"Testing {HOOK} ...")
  hook = os.path.abspath(HOOK)
  failures = run_table(hook, "pnpm (pnpm-lock.yaml)", "pnpm-lock.yaml", PNPM)
  failures += run_table(hook, "bun (bun.lock)", "bun.lock", BUN)
  failures += run_table(hook, "no lockfile -> pnpm default", "", PNPM)
  if failures:
    helpers.print_error("npm-normalize hook tests failed")
    return 1
  helpers.print_success(f"All npm-normalize hook tests passed ({len(PNPM) * 2 + len(BUN)} cases)!")
  return 0


if __name__ == "__main__":
  sys.exit(main())
