#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.14"
# dependencies = []
# ///
# MISE description="Publish the installer to npmjs.org"
# MISE tools={uv="latest", python="3.14"}
# USAGE flag "--dry-run" help="run all checks and packaging without publishing"

# The local fallback: prefer release:installer:production, so CI publishes
# with OIDC provenance.

import json
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


def mise_run(*args):
  code = subprocess.run(["mise", "run", *args], check=False).returncode
  if code != 0:
    sys.exit(code)


def main():
  os.chdir(os.environ["MISE_PROJECT_ROOT"])
  helpers.print_header("Publishing the installer ...")
  helpers.print_subheader("Verifying npm authentication ...")
  if helpers.tool("npm", "whoami", stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL).returncode != 0:
    helpers.print_error("Not logged in to npm. Run `npm login` first, then retry.")
    return 1
  mise_run("p:i:test")
  mise_run("p:i:build")
  with open("package.json") as f:
    version = json.load(f)["version"]
  package = f"@virajp.dev/claude-plugins@{version}"
  if os.environ.get("usage_dry_run") == "true":
    helpers.print_subheader(f"Dry-run publish of {package} ...")
    run("npm", "publish", "--access", "public", "--dry-run")
    helpers.print_success("Dry run complete: nothing was published.")
    return 0
  helpers.print_subheader(f"Publishing {package} to npmjs.org ...")
  run("npm", "publish", "--access", "public")
  helpers.print_success(f"Published {package}!")
  return 0


if __name__ == "__main__":
  sys.exit(main())
