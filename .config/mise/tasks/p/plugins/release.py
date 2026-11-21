#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.14"
# dependencies = []
# ///
# MISE description="Release one plugin: bump it from its level, land develop on main, and tag main"
# MISE tools={uv="latest", python="3.14"}
# USAGE flag "--plugin <name>" required=#true help="the plugin to release, for example vwf"
# USAGE flag "--dry-run" help="print the last tag, the level and the version it releases; change nothing"

# The task of [release.<plugin>.production] in .config/bootstrap/repo.toml.
# A plugin has no workflow: the marketplace of main names the tag of each
# plugin, and Claude clones the plugin at that tag. The steps are in
# _scripts/local.py (release).

import os
import sys

sys.dont_write_bytecode = True
sys.path.insert(0, f"{os.environ['MISE_PROJECT_ROOT']}/.config/mise/tasks/_scripts")
import helpers  # noqa: E402
import local  # noqa: E402


def main():
  name = os.environ.get("usage_plugin", "")
  manifest = f"plugins/{name}/.claude-plugin/plugin.json"
  if not os.path.isfile(os.path.join(os.environ["MISE_PROJECT_ROOT"], manifest)):
    helpers.print_error(f"'{name}' is not a plugin: {manifest} does not exist.")
    return 2
  return local.release(
    name,
    manifest,
    f"{name}-v",
    after_bump=["p:plugins:marketplace"],
    dry_run=os.environ.get("usage_dry_run") == "true",
  )


if __name__ == "__main__":
  sys.exit(main())
