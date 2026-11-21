#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.14"
# dependencies = []
# ///
# MISE description="Run the website's dev server"
# MISE tools={uv="latest", python="3.14"}

# The arguments pass through to astro dev.

import os
import sys

sys.dont_write_bytecode = True
sys.path.insert(0, f"{os.environ['MISE_PROJECT_ROOT']}/.config/mise/tasks/_scripts")
import helpers  # noqa: E402


def main():
  os.chdir(f"{os.environ['MISE_PROJECT_ROOT']}/site")
  return helpers.tool("pnpm", "exec", "astro", "dev", *sys.argv[1:]).returncode


if __name__ == "__main__":
  sys.exit(main())
