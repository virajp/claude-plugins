#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.14"
# dependencies = []
# ///
# MISE description="Type-check, build and link-check the website (the site gate)"
# MISE tools={uv="latest", python="3.14"}

# The site gate: what the wave gate and release:site:production run.

import os
import subprocess
import sys

sys.dont_write_bytecode = True
sys.path.insert(0, f"{os.environ['MISE_PROJECT_ROOT']}/.config/mise/tasks/_scripts")
import helpers  # noqa: E402


def run(*args, **kwargs):
  """Run a tool of mise. A failure stops the task with its code."""
  code = helpers.tool(*args, **kwargs).returncode
  if code != 0:
    sys.exit(code)


def main():
  os.chdir(f"{os.environ['MISE_PROJECT_ROOT']}/site")
  helpers.print_header("Checking the website ...")
  run("pnpm", "exec", "astro", "check")
  code = subprocess.run(["mise", "run", "p:site:build"], check=False).returncode
  if code != 0:
    return code
  helpers.print_subheader("Checking the links ...")
  run("pnpm", "exec", "tsx", "scripts/check-links.ts")
  helpers.print_success("The website is valid")
  return 0


if __name__ == "__main__":
  sys.exit(main())
