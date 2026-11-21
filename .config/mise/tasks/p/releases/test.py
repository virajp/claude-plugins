#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.14"
# dependencies = []
# ///
# MISE description="Unit-test the version and level functions of _scripts/local.py (table-driven)"
# MISE tools={uv="latest", python="3.14"}

# Each file case runs in a temporary folder; .config/bootstrap/releases.toml
# is never touched.

import os
import sys
import tempfile

sys.dont_write_bytecode = True
sys.path.insert(0, f"{os.environ['MISE_PROJECT_ROOT']}/.config/mise/tasks/_scripts")
import helpers  # noqa: E402
import local  # noqa: E402

failures = 0
count = 0


def eq(label, want, fn, *args):
  global failures, count
  count += 1
  try:
    got = fn(*args)
  except local.VersionError as e:
    got = f"refused: {e}"
  if got != want:
    failures += 1
    helpers.print_error(f"{label}: got {got!r}, want {want!r}")


def refuses(label, fn, *args):
  global failures, count
  count += 1
  try:
    got = fn(*args)
  except local.VersionError:
    return
  failures += 1
  helpers.print_error(f"{label}: got {got!r}, want a refusal")


def text(path):
  with open(path) as f:
    return f.read()


def main():
  helpers.print_header("Testing the release functions ...")

  helpers.print_subheader("The version guard ...")
  eq("13 is forbidden", True, local.forbidden, "1.13.0")
  eq("17 with a v is forbidden", True, local.forbidden, "v17.0.0")
  eq("113 is permitted", False, local.forbidden, "1.113.0")
  eq("a -pre suffix is ignored", False, local.forbidden, "1.2.3-13")
  eq("21.0.0 MAJOR -> 22.0.0", "22.0.0", local.next_version, "21.0.0", "MAJOR")
  eq("1.1.50 PATCH -> 1.1.51", "1.1.51", local.next_version, "1.1.50", "PATCH")
  eq("1.12.0 MINOR -> 1.14.0 (13 skipped)", "1.14.0", local.next_version, "1.12.0", "MINOR")
  eq("1.1.16 PATCH -> 1.1.18 (17 skipped)", "1.1.18", local.next_version, "1.1.16", "PATCH")
  eq("12.0.0 MAJOR -> 14.0.0 (13 skipped)", "14.0.0", local.next_version, "12.0.0", "MAJOR")
  refuses("13.0.0 PATCH cannot clear the major", local.next_version, "13.0.0", "PATCH")
  refuses("1.13.4 PATCH cannot clear the minor", local.next_version, "1.13.4", "PATCH")
  refuses("a bad level", local.next_version, "1.0.0", "major")
  refuses("a bad version", local.next_version, "1.x", "PATCH")

  helpers.print_subheader("The manifest floor ...")
  eq("manifest above the target -> manifest", "21.2.0", local.release_target, "21.0.0", "MINOR", "21.2.0")
  eq("target above the manifest -> target", "22.0.0", local.release_target, "21.0.0", "MAJOR", "21.2.0")
  eq("equal -> the same", "21.0.1", local.release_target, "21.0.0", "PATCH", "21.0.1")
  refuses("manifest above the target with a 13", local.release_target, "1.0.0", "PATCH", "1.13.0")

  helpers.print_subheader("The levels of releases.toml ...")
  with tempfile.TemporaryDirectory() as tmp:
    path = os.path.join(tmp, "releases.toml")
    eq("no file -> NONE", "NONE", local.read_level, "vwf", path)
    local.raise_level("vwf", "PATCH", path)
    eq("raise makes the file", 'format = 3\nvwf = "PATCH"\n', text, path)
    local.raise_level("vwf", "MAJOR", path)
    eq("PATCH then MAJOR -> MAJOR", "MAJOR", local.read_level, "vwf", path)
    local.raise_level("vwf", "PATCH", path)
    eq("MAJOR then PATCH -> MAJOR", "MAJOR", local.read_level, "vwf", path)
    local.raise_level("site", "MINOR", path)
    eq("no key -> NONE", "NONE", local.read_level, "stackgen", path)
    refuses("a bad level", local.raise_level, "vwf", "HUGE", path)
    local.clear_level("vwf", path)
    eq("clear removes one key", 'format = 3\nsite = "MINOR"\n', text, path)
    local.clear_level("stackgen", path)
    eq("clear of a missing key changes nothing", 'format = 3\nsite = "MINOR"\n', text, path)
    with open(path, "a") as f:
      f.write('vwf = "BIG"\n')
    refuses("a bad level in the file", local.read_level, "vwf", path)

  if failures:
    helpers.print_error(f"{failures} of {count} cases failed")
    return 1
  helpers.print_success(f"{count} cases passed")
  return 0


if __name__ == "__main__":
  sys.exit(main())
