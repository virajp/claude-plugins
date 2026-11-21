#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.14"
# dependencies = []
# ///
# MISE description="Build the website and its search index into site/dist"
# MISE tools={uv="latest", python="3.14"}

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
  os.chdir(f"{os.environ['MISE_PROJECT_ROOT']}/site")
  helpers.print_header("Building the website ...")
  run("pnpm", "exec", "astro", "build")
  # Pagefind indexes the built HTML in place, and writes dist/pagefind/.
  helpers.print_subheader("Indexing the website ...")
  run("pnpm", "exec", "pagefind", "--site", "dist")
  helpers.print_success("The website is built")
  return 0


if __name__ == "__main__":
  sys.exit(main())
