#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.14"
# dependencies = []
# ///
# MISE description="Stage changed plugins into the dev marketplace under an X.Y.Z+N version and update the local install"
# MISE tools={uv="latest", python="3.14"}
# USAGE flag "--plugin <name>" help="stage only this plugin; the default is each plugin"

# Releases nothing. The task of [release.<plugin>.local] in
# .config/bootstrap/repo.toml. Why the +N and the cache handling:
# .claude/docs/dev-marketplace.md.

import filecmp
import json
import os
import re
import shutil
import subprocess
import sys

sys.dont_write_bytecode = True
sys.path.insert(0, f"{os.environ['MISE_PROJECT_ROOT']}/.config/mise/tasks/_scripts")
import helpers  # noqa: E402

MARKETPLACE = "virajp-plugins"
STAGE = ".dev-marketplace/plugins"
HOME = os.path.expanduser("~")
CACHE = f"{HOME}/.claude/plugins/cache/{MARKETPLACE}"
INSTALLED_JSON = f"{HOME}/.claude/plugins/installed_plugins.json"
VERSION_LINE = re.compile(r'^(  "version": ")[^"]+', re.MULTILINE)


def claude(*args, capture=False):
  """Run the claude CLI. A failure stops the task with its code."""
  result = subprocess.run(["claude", *args], check=False, text=True, stdout=subprocess.PIPE if capture else None)
  if result.returncode != 0:
    sys.exit(result.returncode)
  return result.stdout or ""


def installed_version(name):
  """The installed version of one plugin at user scope, or ''."""
  try:
    with open(INSTALLED_JSON) as f:
      entries = json.load(f)["plugins"].get(f"{name}@{MARKETPLACE}", [])
  except (OSError, ValueError, KeyError):
    return ""
  return next((e.get("version", "") for e in entries if e.get("scope") == "user"), "")


def manifest_version(tree):
  try:
    with open(f"{tree}/.claude-plugin/plugin.json") as f:
      return json.load(f)["version"]
  except (OSError, ValueError, KeyError):
    return ""


def build_of(version, base):
  """The build number of a version, or 0 when it has none or a different base."""
  return int(version.split("+", 1)[1]) if version.startswith(f"{base}+") else 0


def without_version(tree):
  with open(f"{tree}/.claude-plugin/plugin.json") as f:
    return VERSION_LINE.sub(r"\1", f.read())


def differs(cmp):
  """True when a filecmp.dircmp tree differs anywhere but plugin.json."""
  if cmp.left_only or cmp.right_only or cmp.funny_files:
    return True
  if [f for f in cmp.diff_files if f != "plugin.json"]:
    return True
  return any(differs(sub) for sub in cmp.subdirs.values())


def changed(tree, staged):
  """Whether a tree and its staged copy differ anywhere but the version line."""
  if not os.path.isdir(staged):
    return True
  if differs(filecmp.dircmp(tree, staged, ignore=[])):
    return True
  return without_version(tree) != without_version(staged)


def fix_settings_path():
  """'marketplace add' writes this machine's absolute path into
  settings.json; Claude expands ${HOME} in it and keeps it through update and
  install."""
  settings = f"{HOME}/.claude/settings.json"
  absolute = os.path.realpath(".dev-marketplace")
  if not os.path.isfile(settings) or not absolute.startswith(HOME + "/"):
    return
  with open(settings) as f:
    before = f.read()
  after = before.replace(json.dumps(absolute), json.dumps("${HOME}" + absolute[len(HOME) :]))
  if after != before:
    with open(settings, "w") as f:
      f.write(after)
    helpers.print_info("settings.json: the dev marketplace path now reads ${HOME}/...")


def main():
  os.chdir(os.environ["MISE_PROJECT_ROOT"])
  only = os.environ.get("usage_plugin", "")
  helpers.print_header("Staging the plugins into the dev marketplace ...")

  # 1. Refuse user mode: the update below would copy the last release again.
  if ".dev-marketplace" not in claude("plugin", "marketplace", "list", capture=True):
    helpers.print_error(f"{MARKETPLACE} is not registered from ./.dev-marketplace: this machine is in user mode.")
    helpers.print_yellow(
      "Setup is .claude/docs/dev-marketplace.md: 'claude plugin marketplace add ./.dev-marketplace' (the leading ./ is necessary)."
    )
    return 1
  fix_settings_path()

  names = sorted(n for n in os.listdir("plugins") if os.path.isdir(f"plugins/{n}"))
  if only:
    if only not in names:
      helpers.print_error(f"'{only}' is not a plugin of plugins/.")
      return 2
    names = [only]

  # 2. Stage each plugin whose tree moved.
  os.makedirs(STAGE, exist_ok=True)
  staged_names = []
  for name in names:
    tree = f"plugins/{name}"
    staged = f"{STAGE}/{name}"
    if not changed(tree, staged):
      continue
    base = manifest_version(tree)
    if "+" in base:
      helpers.print_error(
        f"{tree} declares {base}: the tracked manifest stays plain semver; the +N is only in the staged copy."
      )
      return 1
    n = max(build_of(manifest_version(staged), base), build_of(installed_version(name), base)) + 1
    version = f"{base}+{n}"
    shutil.rmtree(staged, ignore_errors=True)
    shutil.copytree(tree, staged, symlinks=True)
    manifest = f"{staged}/.claude-plugin/plugin.json"
    with open(manifest) as f:
      text = VERSION_LINE.sub(r"\g<1>" + version, f.read(), count=1)
    with open(manifest, "w") as f:
      f.write(text)
    # A cache folder that Claude has for this version is stale.
    shutil.rmtree(f"{CACHE}/{name}/{base}-{n}", ignore_errors=True)
    helpers.print_yellow(f"{name}: staged {version}")
    staged_names.append(name)

  # 3. Write both manifests again, and refresh the marketplace.
  if subprocess.run(["mise", "run", "p:plugins:marketplace"], check=False).returncode != 0:
    return 1
  claude("plugin", "marketplace", "update", MARKETPLACE)

  # 4. Update, or install: vwf installs stackgen as its dependency.
  if not installed_version("vwf"):
    claude("plugin", "install", f"vwf@{MARKETPLACE}", "--scope", "user")
  else:
    for name in names:
      if installed_version(name):
        claude("plugin", "update", f"{name}@{MARKETPLACE}")

  helpers.print_success("The local install matches the working tree:")
  lines = claude("plugin", "list", capture=True).splitlines()
  for i, line in enumerate(lines):
    if f"@{MARKETPLACE}" in line:
      print("\n".join(lines[i : i + 2]))
  if staged_names:
    helpers.print_warn("Restart Claude Code: a plugin's skills are read at session start.")
  return 0


if __name__ == "__main__":
  sys.exit(main())
