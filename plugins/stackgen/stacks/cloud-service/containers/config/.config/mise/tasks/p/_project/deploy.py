#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.14"
# dependencies = []
# ///
# MISE description="Build this project's container image and deploy it with its Worker to Cloudflare"
# MISE dir="{{ config_root }}"
# MISE tools={uv="latest", python="3.14"}

# USAGE flag "--dry-run" help="validate the config and the upload without publishing"

# `_project` is a MARKED POSITION — renamed to the project's id on landing.

import os
import shutil
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
  helpers.print_header(f"Deploying {PROJECT_ID} to Cloudflare Containers ...")

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

  # 2. Docker — `wrangler deploy` builds the image. `--dry-run` builds nothing.
  if not dry_run:
    if not shutil.which("docker"):
      helpers.print_error("Docker is not on PATH")
      helpers.print_warn("`wrangler deploy` builds this project's container image before it")
      helpers.print_warn("publishes, and it builds it with Docker. Install Docker on this")
      helpers.print_warn("machine — or, on a CI runner, use one whose image ships it.")
      return 1
    info = subprocess.run(["docker", "info"], check=False, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    if info.returncode != 0:
      helpers.print_error("The Docker daemon is not answering")
      helpers.print_warn("`docker` is installed but `docker info` failed, so the image cannot")
      helpers.print_warn("be built. Start the daemon and retry; on a CI runner, that usually")
      helpers.print_warn("means the Docker service was not enabled for the job.")
      return 1

  # 3. The application build is the project's; the image build is wrangler's.
  if have_task(f"p:{PROJECT_ID}:build"):
    helpers.print_subheader(f"Building {PROJECT_ID} ...")
    code = subprocess.run(["mise", "run", f"p:{PROJECT_ID}:build"], check=False).returncode
    if code != 0:
      return code
  else:
    helpers.print_subheader("Skipping the build ...")
    helpers.print_warn(f"No p:{PROJECT_ID}:build task — assuming the Dockerfile builds")
    helpers.print_warn("everything the image needs.")

  # 4. Deploy, through the lockfile's wrangler — the pack pins none.
  wrangler = ["pnpm", "exec", "wrangler"] if os.path.isfile("pnpm-lock.yaml") else ["npx", "wrangler"]

  deploy_args = ["deploy"]
  if dry_run:
    deploy_args.append("--dry-run")
    helpers.print_subheader("Validating the deploy (--dry-run) ...")
  else:
    helpers.print_subheader("Building the image, pushing it, and publishing the Worker ...")

  code = helpers.tool(*wrangler, *deploy_args).returncode
  if code != 0:
    return code
  if dry_run:
    helpers.print_success(f"The deploy of {PROJECT_ID} is valid")
  else:
    helpers.print_success(f"{PROJECT_ID} is deployed to Cloudflare Containers")
  return 0


if __name__ == "__main__":
  sys.exit(main())
