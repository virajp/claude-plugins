#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.14"
# dependencies = []
# ///
# MISE description="Check or sort the keys of the package.json files"
# MISE hide=true
# MISE tools={uv="latest", python="3.14"}
# USAGE flag "--debug" help="emit debug logs"
# USAGE flag "--fix" help="apply fixes"
# USAGE arg "[files]" var=#true help="the files to format; only the package.json files are used; the default is the whole tree"

# dprint owns the whitespace of package.json. This task adds the one thing
# dprint cannot do: the key order, which is a convention, not a format.
# code:format passes its files to each code:format:* task. Only the
# package.json files are for the sorter. Given files without one: nothing to do.

import os
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
  given = helpers.usage_files()
  if given:
    targets = [f for f in given if os.path.basename(f) == "package.json" and os.path.isfile(f)]
    if not targets:
      return 0
  else:
    targets = ["**/package.json", "--ignore", "**/node_modules"]
  # The sorter has no --fix: sorting is its default, and --check is the read-only mode.
  check = [] if os.environ.get("usage_fix") == "true" else ["--check"]
  helpers.print_subheader("Sorting the package.json files ...")
  run("pnpm", "dlx", "sort-package-json", *check, *targets)
  return 0


if __name__ == "__main__":
  sys.exit(main())
