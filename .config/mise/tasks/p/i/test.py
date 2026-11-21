#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.14"
# dependencies = []
# ///
# MISE description="Smoke-test the built installer CLI (non-mutating)"
# MISE tools={uv="latest", python="3.14"}

# Tests the built bin/, not the source: see installer/CLAUDE.md. The
# invocations never change anything: each exits before an install runs.

import os
import shutil
import subprocess
import sys
import tempfile

sys.dont_write_bytecode = True
sys.path.insert(0, f"{os.environ['MISE_PROJECT_ROOT']}/.config/mise/tasks/_scripts")
import helpers  # noqa: E402

CLI = ["node", "bin/installer.mjs"]


def must(*args, **kwargs):
  """Run a tool of mise. A failure stops the task with its code."""
  result = helpers.tool(*args, **kwargs)
  if result.returncode != 0:
    sys.exit(result.returncode)
  return result


def cli(*args, env=None, stdin=None):
  """Run the built CLI. Returns (code, stdout and stderr)."""
  result = helpers.tool(*CLI, *args, env=env, stdin=stdin, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
  return result.returncode, result.stdout


def files(root):
  return sorted(os.path.join(d, f) for d, _, fs in os.walk(root) for f in fs)


def fail(msg, output=None):
  helpers.print_error(msg)
  if output:
    print(output)
  sys.exit(1)


def main():
  os.chdir(os.environ["MISE_PROJECT_ROOT"])
  helpers.print_header("Testing the installer ...")

  helpers.print_subheader("Bundling installer/ into bin/ ...")
  must("pnpm", "exec", "tsup", stdout=subprocess.DEVNULL)

  helpers.print_subheader("Rendering --help ...")
  if cli("--help")[0] != 0:
    fail("--help exits non-zero")

  helpers.print_subheader("Asserting no flags exits non-zero ...")
  if cli()[0] == 0:
    fail("Expected a non-zero exit with no flags")

  helpers.print_subheader("Asserting every retired flag is rejected ...")
  for flag in ("--platform", "--upgrade", "--force"):
    if cli(flag, "claude")[0] == 0:
      fail(f"Expected a non-zero exit for a retired flag ({flag})")

  # End to end against the built bundle and a throwaway HOME; `claude` is a stub.
  helpers.print_subheader("Setting up a throwaway HOME ...")
  home = tempfile.mkdtemp()
  try:
    node = helpers.tool("which", "node", stdout=subprocess.PIPE, text=True).stdout.strip()
    os.makedirs(f"{home}/bin")
    with open(f"{home}/bin/claude", "w") as f:
      f.write("#!/bin/sh\nexit 0\n")
    os.chmod(f"{home}/bin/claude", 0o755)
    # HOME and the XDG variables, or a run writes into the real config.
    env = {
      **os.environ,
      "PATH": f"{os.path.dirname(node)}:{home}/bin",
      "HOME": home,
      "XDG_CONFIG_HOME": f"{home}/.config",
      "XDG_DATA_HOME": f"{home}/.local/share",
    }

    def e2e(*args, stdin=None):
      result = subprocess.run(
        [node, "bin/installer.mjs", *args],
        env=env,
        stdin=stdin,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        check=False,
      )
      return result.returncode, result.stdout

    helpers.print_subheader("Asserting --user vwf --dry-run describes the claude commands ...")
    before = files(home)
    out = e2e("--user", "vwf", "--dry-run")[1]
    for expected in (
      "claude plugin marketplace add virajp/claude-plugins",
      "claude plugin install vwf@virajp-plugins --scope user",
    ):
      if expected not in out:
        fail(f"--user vwf --dry-run did not describe: {expected}", out)
    if files(home) != before:
      fail("--user vwf --dry-run wrote something; it must write nothing")

    helpers.print_subheader("Seeding a legacy receipt ...")
    receipt_dir = f"{home}/.config/ai-plugins/receipts"
    receipt = f"{receipt_dir}/cursor.json"
    artifact = f"{home}/.cursor/rules/virajp.md"
    config = f"{home}/.cursor/settings.json"
    os.makedirs(f"{home}/.cursor/rules")
    os.makedirs(receipt_dir)
    with open(artifact, "w") as f:
      f.write("the file that install wrote\n")
    with open(config, "w") as f:
      f.write('{\n  "virajp": "ours"\n}\n')
    with open(receipt, "w") as f:
      f.write(f"""{{
  "version": 3,
  "installedAt": "2026-08-01T00:00:00Z",
  "entries": [
    {{ "kind": "file", "path": "{artifact}" }},
    {{
      "kind": "configKey",
      "file": "{config}",
      "path": ["virajp"],
      "hadKey": true,
      "previous": "theirs"
    }}
  ]
}}
""")

    # The restore itself is asserted in uninstall.test.ts; --uninstall needs a TTY.
    helpers.print_subheader("Asserting --uninstall --dry-run finds the legacy receipt ...")
    out = e2e("--uninstall", "--dry-run")[1]
    if receipt not in out:
      fail(f"--uninstall --dry-run did not name {receipt}", out)
    if "revert" not in out:
      helpers.print_warn("A delete rather than a revert would leave the user with nothing.")
      fail("--uninstall --dry-run described no revert for it", out)
    if not os.path.isfile(receipt) or not os.path.isfile(artifact):
      fail("--uninstall --dry-run removed something; it must write nothing")
    with open(config) as f:
      if '"virajp": "ours"' not in f.read():
        fail(f"--uninstall --dry-run edited {config}; it must write nothing")

    helpers.print_subheader("Asserting --uninstall refuses without a terminal ...")
    if e2e("--uninstall", stdin=subprocess.DEVNULL)[0] == 0:
      fail("Expected a non-zero exit for --uninstall with no TTY to ask on")
  finally:
    shutil.rmtree(home, ignore_errors=True)

  helpers.print_subheader("Running the vitest suites ...")
  must("pnpm", "exec", "vitest", "run")

  helpers.print_success("All installer smoke tests passed!")
  return 0


if __name__ == "__main__":
  sys.exit(main())
