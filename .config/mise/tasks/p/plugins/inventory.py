#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.14"
# dependencies = []
# ///
# MISE description="Generate plugins/stackgen/stacks/inventory.md from the stacks tree (--check to assert freshness)"
# MISE tools={uv="latest", python="3.14"}

# Runs the TypeScript directly: node 22.6 or newer strips the types.
# The arguments (--check) pass through; deliberately not a # USAGE flag.

import os
import sys

sys.dont_write_bytecode = True
sys.path.insert(0, f"{os.environ['MISE_PROJECT_ROOT']}/.config/mise/tasks/_scripts")
import helpers  # noqa: E402


def main():
  os.chdir(os.environ["MISE_PROJECT_ROOT"])
  return helpers.tool("node", "scripts/src/inventory.ts", *sys.argv[1:]).returncode


if __name__ == "__main__":
  sys.exit(main())
