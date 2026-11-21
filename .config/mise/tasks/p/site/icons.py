#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.14"
# dependencies = []
# ///
# MISE description="Rasterize the favicon set from public/brand/vwf-favicon.svg"
# MISE tools={uv="latest", python="3.14"}

import os
import shutil
import subprocess
import sys
import tempfile

sys.dont_write_bytecode = True
sys.path.insert(0, f"{os.environ['MISE_PROJECT_ROOT']}/.config/mise/tasks/_scripts")
import helpers  # noqa: E402


def run(*args, **kwargs):
  """Run a tool of mise. A failure stops the task with its code."""
  code = helpers.tool(*args, **kwargs).returncode
  if code != 0:
    sys.exit(code)


def main():
  site = f"{os.environ['MISE_PROJECT_ROOT']}/site"
  src = f"{site}/public/brand/vwf-favicon.svg"
  out = f"{site}/public"
  helpers.print_header("Rasterizing the favicon set ...")
  with tempfile.TemporaryDirectory() as tmp:
    # The touch icon must be full-bleed: iOS paints transparent corners black.
    with open(src) as f:
      square = f.read().replace('rx="14"', 'rx="0"')
    with open(f"{tmp}/square.svg", "w") as f:
      f.write(square)
    # One-off tools, run from the temporary folder, so nothing resolves against the workspace.
    os.makedirs(f"{tmp}/stage")
    os.makedirs(f"{tmp}/out")

    # sharp-cli names its output after its input, so each size is staged under its stem.
    def render(svg, size, stem):
      shutil.copy(svg, f"{tmp}/stage/{stem}.svg")
      run(
        "pnpm",
        "dlx",
        "sharp-cli@6",
        "--input",
        f"stage/{stem}.svg",
        "--output",
        "out",
        "--density",
        "1200",
        "--format",
        "png",
        "resize",
        str(size),
        str(size),
        "--fit",
        "contain",
        "--background",
        "rgba(0,0,0,0)",
        cwd=tmp,
      )

    render(src, 512, "icon-512")
    render(src, 192, "icon-192")
    render(f"{tmp}/square.svg", 180, "apple-touch-icon")
    for size in (16, 32, 48):
      render(src, size, f"ico-{size}")

    # Not the bin of png-to-ico: it reads only its first path and upscales it to 256.
    run("pnpm", "init", cwd=tmp, stdout=subprocess.DEVNULL)
    run("pnpm", "add", "--silent", "png-to-ico@3", cwd=tmp, stdout=subprocess.DEVNULL)
    script = (
      f"import pngToIco from '{tmp}/node_modules/png-to-ico/index.js';"
      f"const sizes = [16, 32, 48].map(s => '{tmp}/out/ico-' + s + '.png');"
      "process.stdout.write(await pngToIco(sizes));"
    )
    with open(f"{tmp}/favicon.ico", "wb") as f:
      run("node", "--input-type=module", "-e", script, stdout=f)

    for name in ("out/icon-512.png", "out/icon-192.png", "out/apple-touch-icon.png", "favicon.ico"):
      shutil.move(f"{tmp}/{name}", f"{out}/{os.path.basename(name)}")
  for name in ("favicon.ico", "apple-touch-icon.png", "icon-192.png", "icon-512.png"):
    helpers.print_info(f"{out}/{name}: {os.path.getsize(f'{out}/{name}')} bytes")
  helpers.print_success("The favicon set is written")
  return 0


if __name__ == "__main__":
  sys.exit(main())
