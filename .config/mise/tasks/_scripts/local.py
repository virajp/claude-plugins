#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.14"
# dependencies = []
# ///
# MISE description="This repo's own library for the release tasks"
# MISE hide=true
# MISE tools={uv="latest", python="3.14"}

# This repo's own library; nothing that bootstrap ships may import it.
#
# The version guard: forbidden, bump, next_version. A version never has a 13
# or a 17 part: a bump that gives one goes on to the next number.
#
# The release levels of .config/bootstrap/releases.toml: read_level,
# raise_level, clear_level. The file is read and written here, not with
# `bootstrap config`, because the engine is a macOS binary and
# deps-update.yml runs on Linux.
#
# release(): the one release flow of the four projects (vwf, stackgen,
# installer, site). The [release.<project>.production] tables of
# .config/bootstrap/repo.toml run it through their own tasks.

import json
import os
import re
import subprocess
import sys
import time
import tomllib

sys.dont_write_bytecode = True
sys.path.insert(0, f"{os.environ['MISE_PROJECT_ROOT']}/.config/mise/tasks/_scripts")
import helpers  # noqa: E402

LEVELS = ["NONE", "PATCH", "MINOR", "MAJOR"]
RELEASES = ".config/bootstrap/releases.toml"
DEVELOP = "develop"
MAIN = "main"
PLAIN = re.compile(r"^(\d+)\.(\d+)\.(\d+)$")


class VersionError(Exception):
  """A version or a level that the guard refuses."""


def parts(version):
  """The three numbers of a plain X.Y.Z version (a leading v is permitted)."""
  m = PLAIN.match(version.removeprefix("v"))
  if not m:
    raise VersionError(f"Cannot bump '{version}': expected a plain X.Y.Z version.")
  return [int(x) for x in m.groups()]


def forbidden(version):
  """True when a part of <version> is 13 or 17. A -pre or +build suffix is
  ignored."""
  core = re.split(r"[-+]", version.removeprefix("v"), maxsplit=1)[0]
  return any(p in ("13", "17") for p in core.split("."))


def bump(version, level):
  """<version> bumped by one level (PATCH, MINOR or MAJOR), with no guard."""
  major, minor, patch = parts(version)
  match level:
    case "MAJOR":
      return f"{major + 1}.0.0"
    case "MINOR":
      return f"{major}.{minor + 1}.0"
    case "PATCH":
      return f"{major}.{minor}.{patch + 1}"
  raise VersionError(f"Unknown bump level '{level}': expected PATCH, MINOR or MAJOR.")


def next_version(version, level):
  """The bump of <version> by <level>, moved past each 13 and 17. A level
  that cannot clear a forbidden higher part is refused."""
  major, minor, patch = parts(bump(version, level))
  if level == "PATCH" and forbidden(f"{major}.{minor}.0"):
    raise VersionError(
      f"A patch bump of {version} cannot clear the forbidden part in {major}.{minor} - set the version by hand."
    )
  if level == "MINOR" and forbidden(f"{major}.0.0"):
    raise VersionError(f"A minor bump of {version} cannot clear the forbidden major {major} - set the version by hand.")
  while forbidden(f"{major}.{minor}.{patch}"):
    if level == "MAJOR":
      major += 1
    elif level == "MINOR":
      minor += 1
    else:
      patch += 1
  return f"{major}.{minor}.{patch}"


def release_target(last, level, manifest):
  """The version that <level> releases from the last tag <last>. The
  manifest is the floor: a target below it releases the manifest as it is."""
  target = next_version(last, level)
  if parts(manifest) > parts(target):
    if forbidden(manifest):
      raise VersionError(f"The manifest {manifest} is above the target {target} and has a 13 or a 17.")
    return manifest
  return target


def read_level(project, path=RELEASES):
  """The level of <project> in the releases file; NONE when the file or the
  key is not there."""
  if not os.path.isfile(path):
    return "NONE"
  with open(path, "rb") as f:
    level = tomllib.load(f).get(project, "NONE")
  if level not in LEVELS:
    raise VersionError(f"Bad level {level!r} for '{project}' in {path}: expected one of {', '.join(LEVELS)}.")
  return level


def _key(project):
  return re.compile(r"^" + re.escape(project) + r"\s*=")


def raise_level(project, level, path=RELEASES):
  """Set the level of <project> to <level> when it is higher than the level
  in the file. It never lowers a level."""
  if level not in LEVELS:
    raise VersionError(f"Unknown release level '{level}': expected one of {', '.join(LEVELS)}.")
  if LEVELS.index(level) <= LEVELS.index(read_level(project, path)):
    return
  lines = []
  if os.path.isfile(path):
    with open(path) as f:
      lines = [line for line in f.read().splitlines() if not _key(project).match(line)]
  if not any(line.startswith("format") for line in lines):
    lines.insert(0, "format = 3")
  lines.append(f'{project} = "{level}"')
  with open(path, "w") as f:
    f.write("\n".join(lines) + "\n")


def clear_level(project, path=RELEASES):
  """Remove the level of <project> from the file. A missing key is no error."""
  if not os.path.isfile(path):
    return
  with open(path) as f:
    lines = f.read().splitlines()
  kept = [line for line in lines if not _key(project).match(line)]
  if kept != lines:
    with open(path, "w") as f:
      f.write("\n".join(kept) + "\n")


def git(*args):
  """Run git. Returns (code, stdout without the last line break)."""
  result = subprocess.run(["git", *args], check=False, stdout=subprocess.PIPE, text=True)
  return result.returncode, result.stdout.rstrip("\n")


def must(*args):
  """Run a command. A failure stops the task with its code."""
  code = subprocess.run(list(args), check=False).returncode
  if code != 0:
    sys.exit(code)


def last_tag(prefix):
  """The highest tag <prefix>X.Y.Z as (tag, version), or (None, None)."""
  best = None
  for name in git("tag", "--list", f"{prefix}*")[1].splitlines():
    version = name.removeprefix(prefix)
    if PLAIN.match(version) and (best is None or parts(version) > parts(best)):
      best = version
  return (f"{prefix}{best}", best) if best else (None, None)


def read_manifest(path):
  with open(path) as f:
    return json.load(f)["version"]


def write_manifest(path, old, new):
  """Replace the version string in place, so the file keeps its format."""
  with open(path) as f:
    text = f.read()
  text, n = re.subn(r'("version"\s*:\s*")' + re.escape(old) + '"', r"\g<1>" + new + '"', text, count=1)
  if n != 1 or json.loads(text)["version"] != new:
    helpers.print_error(f"Cannot write the version into {path}.")
    sys.exit(1)
  with open(path, "w") as f:
    f.write(text)


def watch(workflow, name):
  """Watch the run of <workflow> that the push of the tag <name> started."""
  helpers.print_subheader(f"Watching {workflow} for {name} ...")
  for _ in range(30):
    out = helpers.tool(
      "gh",
      "run",
      "list",
      "--workflow",
      workflow,
      "--limit",
      "20",
      "--json",
      "databaseId,headBranch",
      stdout=subprocess.PIPE,
      text=True,
    ).stdout
    for run in json.loads(out or "[]"):
      if run.get("headBranch") == name:
        code = helpers.tool("gh", "run", "watch", str(run["databaseId"]), "--exit-status").returncode
        if code != 0:
          sys.exit(code)
        return
    time.sleep(4)
  helpers.print_error(f"No run of {workflow} for {name} appeared. Examine it: gh run list --workflow={workflow}")
  sys.exit(1)


def release(project, manifest, prefix, *, preflight=(), after_bump=(), workflow=None, ci=False, dry_run=False):
  """Release <project>: bump <manifest> from the last tag <prefix>X.Y.Z by
  the level of the project, commit on develop, land develop on main, and tag
  main.

  - Level NONE and a manifest that is above its last tag with no tag: the
    run stopped after its commit, so this run lands and tags it (resume).
  - No tag yet: the first release is the manifest as it is.
  - <after_bump>: the tasks that run after the version write; their changes
    join the commit (for example p:plugins:marketplace).
  - <ci>: an annotated tag that is not pushed and not signed; the workflow
    pushes it and starts the publish.
  Returns the exit code."""
  os.chdir(os.environ["MISE_PROJECT_ROOT"])
  helpers.print_header(f"Releasing {project} ...")
  if git("fetch", "--tags", "--quiet", "origin")[0] != 0:
    helpers.print_warn("Cannot fetch the tags of origin: the last tag is the one of this checkout.")
  try:
    level = read_level(project)
    current = read_manifest(manifest)
    _, last = last_tag(prefix)
    if level == "NONE":
      if last is not None and current == last:
        helpers.print_info(f"Nothing to release: the level of {project} is NONE")
        return 0
      target = current
    elif last is None:
      target = current
    else:
      target = release_target(last, level, current)
  except VersionError as e:
    helpers.print_error(str(e))
    return 1
  name = f"{prefix}{target}"
  resume = level == "NONE"
  helpers.print_info(f"{project}: {last or 'none'} -> {target} ({'resume' if resume else level}), tag {name}")
  if last and not resume and target != bump(last, level) and target == next_version(last, level):
    helpers.print_warn(f"Skipped {bump(last, level)}: 13 and 17 are never a version part.")
  if dry_run:
    return 0

  branch = git("rev-parse", "--abbrev-ref", "HEAD")[1]
  if branch != DEVELOP:
    helpers.print_error(f"On '{branch}', not '{DEVELOP}'. A release commits on {DEVELOP}: git switch {DEVELOP}")
    return 1
  if git("status", "--porcelain")[1]:
    helpers.print_error("The tree has uncommitted or untracked files. Commit or remove them first.")
    return 1
  if git("rev-parse", "--quiet", "--verify", f"refs/tags/{name}")[0] == 0:
    helpers.print_error(f"The tag {name} already exists. Set a level for {project} in {RELEASES}.")
    return 1
  if workflow and not ci and not helpers.has_tool("gh"):
    helpers.print_error("gh is necessary to watch the release. Install it with mise, then run gh auth login.")
    return 1

  for task in preflight:
    helpers.print_subheader(f"Running {task} ...")
    must("mise", "run", task)

  if not resume:
    helpers.print_subheader(f"Committing {name} on {DEVELOP} ...")
    if target != current:
      write_manifest(manifest, current, target)
    for task in after_bump:
      must("mise", "run", task)
    clear_level(project)
    # The tree was clean at the start, so each change is of this release.
    must("git", "add", "--all")
    if git("diff", "--cached", "--quiet")[0] != 0:
      must("git", "commit", "--quiet", "-m", f"ops: release {name}")

  helpers.print_subheader(f"Landing {DEVELOP} on {MAIN} ...")
  must("git", "push", "--quiet", "origin", DEVELOP)
  must("mise", "run", "git:merge:main", DEVELOP)
  if git("rev-parse", MAIN)[1] != git("rev-parse", "HEAD")[1]:
    helpers.print_error(f"{MAIN} is not at HEAD after the landing. Tag it by hand on {MAIN}: mise run git:tag {name}")
    return 1

  if ci:
    helpers.print_subheader(f"Tagging {name} ...")
    must("git", "tag", "--annotate", name, "-m", name)
    helpers.print_success(f"Tagged {name}; the workflow pushes it")
    return 0
  must("mise", "run", "git:tag", name, "--push")
  if workflow:
    watch(workflow, name)
  helpers.print_success(f"Released {name}")
  return 0
