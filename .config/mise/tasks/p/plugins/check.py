#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.14"
# dependencies = []
# ///
# MISE description="Static validation of the authored plugins/ tree"
# MISE tools={uv="latest", python="3.14"}

import glob
import os
import shutil
import subprocess
import sys

sys.dont_write_bytecode = True
sys.path.insert(0, f"{os.environ['MISE_PROJECT_ROOT']}/.config/mise/tasks/_scripts")
import helpers  # noqa: E402


def main():
  os.chdir(os.environ["MISE_PROJECT_ROOT"])
  helpers.print_header("Checking plugins/ ...")
  if helpers.tool("node", "scripts/src/check.ts", stderr=subprocess.STDOUT).returncode != 0:
    helpers.print_error("plugins/ has findings: see above")
    return 1
  # --strict fails an unknown field; skipped, with a warning, where claude is not there (CI).
  if not shutil.which("claude"):
    helpers.print_warn("claude not on PATH: skipping `plugin validate --strict`")
  else:
    helpers.print_subheader("Validating manifests with claude plugin validate --strict ...")
    failed = False
    for manifest in [".claude-plugin/marketplace.json", *sorted(glob.glob("plugins/*/"))]:
      result = subprocess.run(
        ["claude", "plugin", "validate", "--strict", manifest],
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        check=False,
      )
      if result.returncode != 0:
        helpers.print_error(manifest)
        print("\n".join("    " + line for line in result.stdout.splitlines()))
        failed = True
    if failed:
      return 1
  helpers.print_success("plugins/ is valid")
  return 0


if __name__ == "__main__":
  sys.exit(main())
