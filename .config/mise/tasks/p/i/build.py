#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.14"
# dependencies = []
# ///
# MISE description="Bundle installer/ into bin/ and verify the publishable package"
# MISE tools={uv="latest", python="3.14"}

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
  os.chdir(os.environ["MISE_PROJECT_ROOT"])
  helpers.print_header("Building the installer ...")
  # bin/ is ignored by git: without this step the tarball has no entry point.
  helpers.print_subheader("Bundling installer/ into bin/ ...")
  run("pnpm", "exec", "tsup")
  if not os.path.isfile("bin/installer.mjs"):
    helpers.print_error("tsup produced no bin/installer.mjs")
    return 1
  helpers.print_subheader("Smoke-testing the bundle ...")
  run("node", "bin/installer.mjs", "--help", stdout=subprocess.DEVNULL)
  helpers.print_subheader("Listing package contents (dry run) ...")
  run("pnpm", "pack", "--dry-run")
  helpers.print_success("Package verified.")
  return 0


if __name__ == "__main__":
  sys.exit(main())
