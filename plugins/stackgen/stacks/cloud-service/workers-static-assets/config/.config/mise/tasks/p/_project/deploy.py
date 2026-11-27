#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.14"
# dependencies = []
# ///
# MISE description="Deploy this project's built static assets to Cloudflare Workers"
# MISE dir="{{ config_root }}"
# MISE tools={uv="latest", python="3.14"}

# USAGE flag "--dry-run" help="validate the config and the upload without publishing"

# `_project` is a MARKED POSITION — renamed to the project's id on landing.

import os
import subprocess
import sys

sys.dont_write_bytecode = True
sys.path.insert(0, f"{os.environ['MISE_PROJECT_ROOT']}/.config/mise/tasks/_scripts")
import helpers  # noqa: E402

# The id is the directory name, so the rename is the only edit a pin makes.
PROJECT_ID = os.path.basename(os.path.dirname(os.path.abspath(__file__)))


def have_task(name):
  """Whether `mise tasks` lists the task name.

  It queries `mise tasks` because `helpers.has_own_task` finds only a file task,
  and a build task that a repo defines in TOML must still run.
  """
  result = subprocess.run(["mise", "tasks"], check=False, capture_output=True, text=True)
  return any(line.split()[:1] == [name] for line in result.stdout.splitlines()[1:])


def main():
  dry_run = os.environ.get("usage_dry_run", "false") == "true"
  helpers.print_header(f"Deploying {PROJECT_ID} to Cloudflare Workers ...")

  # 1. Credentials, before anything runs. `--dry-run` needs none.
  if not dry_run:
    missing = [name for name in ("CLOUDFLARE_API_TOKEN", "CLOUDFLARE_ACCOUNT_ID") if not os.environ.get(name)]
    if missing:
      helpers.print_error(f"Missing Cloudflare credentials: {' '.join(missing)}")
      helpers.print_warn("wrangler reads CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID from the")
      helpers.print_warn("environment. This repo's secrets provider supplies them from")
      helpers.print_warn("GLB_CLOUDFLARE_API_TOKEN and GLB_CLOUDFLARE_ACCOUNT_ID — run through")
      helpers.print_warn("`mise run setup` first, or export them for a one-off deploy.")
      helpers.print_warn("`wrangler login` is the interactive alternative and is a laptop-only")
      helpers.print_warn("convenience: CI has no browser and must use the token.")
      return 1

  # 2. The build is the framework's, not this task's.
  if have_task(f"p:{PROJECT_ID}:build"):
    helpers.print_subheader(f"Building {PROJECT_ID} ...")
    code = subprocess.run(["mise", "run", f"p:{PROJECT_ID}:build"], check=False).returncode
    if code != 0:
      return code
  else:
    helpers.print_subheader("Skipping the build ...")
    helpers.print_warn(f"No p:{PROJECT_ID}:build task — assuming the asset directory in")
    helpers.print_warn("wrangler.jsonc is already built.")

  # 3. Deploy, through the lockfile's wrangler — the pack pins none.
  wrangler = ["pnpm", "exec", "wrangler"] if os.path.isfile("pnpm-lock.yaml") else ["npx", "wrangler"]

  deploy_args = ["deploy"]
  if dry_run:
    deploy_args.append("--dry-run")
    helpers.print_subheader("Validating the deploy (--dry-run) ...")
  else:
    helpers.print_subheader("Uploading assets and publishing ...")

  code = helpers.tool(*wrangler, *deploy_args).returncode
  if code != 0:
    return code
  if dry_run:
    helpers.print_success(f"The deploy of {PROJECT_ID} is valid")
  else:
    helpers.print_success(f"{PROJECT_ID} is deployed to Cloudflare Workers")
  return 0


if __name__ == "__main__":
  sys.exit(main())
