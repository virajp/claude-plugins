#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.14"
# dependencies = []
# ///
# MISE description="Release the installer: bump it from its level, land develop on main, tag main and watch release.yml"
# MISE tools={uv="latest", python="3.14"}
# USAGE flag "--ci" help="CI mode: make the tag and stop; the workflow pushes it and starts release.yml"
# USAGE flag "--dry-run" help="print the last tag, the level and the version it releases; change nothing"

# The task of [release.installer.production] and, with --ci, of
# [release.installer.ci] in .config/bootstrap/repo.toml. deps-update.yml
# runs the ci kind. The steps are in _scripts/local.py (release).

import os
import sys

sys.dont_write_bytecode = True
sys.path.insert(0, f"{os.environ['MISE_PROJECT_ROOT']}/.config/mise/tasks/_scripts")
import local  # noqa: E402


def main():
  return local.release(
    "installer",
    "package.json",
    "installer-v",
    preflight=["p:i:test"],
    workflow="release.yml",
    ci=os.environ.get("usage_ci") == "true",
    dry_run=os.environ.get("usage_dry_run") == "true",
  )


if __name__ == "__main__":
  sys.exit(main())
