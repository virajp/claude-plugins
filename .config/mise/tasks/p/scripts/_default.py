#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.14"
# dependencies = []
# ///
# MISE description="The scripts project's own tasks - none written yet"
# MISE hide=true
# MISE tools={uv="latest", python="3.14"}
# PLACEHOLDER

import os
import sys

sys.dont_write_bytecode = True
sys.path.insert(0, f"{os.environ['MISE_PROJECT_ROOT']}/.config/mise/tasks/_scripts")
import placeholder  # noqa: E402

if __name__ == "__main__":
  placeholder.placeholder_notice("p:scripts", "no project tasks yet")
