#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.14"
# dependencies = []
# ///
# MISE description="Release the website: bump it from its level, land develop on main, tag main and watch site.yml"
# MISE tools={uv="latest", python="3.14"}
# USAGE flag "--dry-run" help="print the last tag, the level and the version it releases; change nothing"

# The task of [release.site.production] in .config/bootstrap/repo.toml.
# The steps are in _scripts/local.py (release).

import os
import sys

sys.dont_write_bytecode = True
sys.path.insert(0, f"{os.environ['MISE_PROJECT_ROOT']}/.config/mise/tasks/_scripts")
import local  # noqa: E402


def main():
  return local.release(
    "site",
    "site/package.json",
    "site-v",
    preflight=["p:site:check"],
    workflow="site.yml",
    dry_run=os.environ.get("usage_dry_run") == "true",
  )


if __name__ == "__main__":
  sys.exit(main())
