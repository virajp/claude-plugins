#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.14"
# dependencies = []
# ///
# MISE description="Rasterize the favicon set from public/brand/favicon.svg"
# MISE dir="{{ config_root }}"
# MISE tools={uv="latest", python="3.14"}

# USAGE about "Rasterize the favicon set from public/brand/favicon.svg"

# `_project` is a MARKED POSITION — renamed to the project's id on landing.

import os
import shutil
import subprocess
import sys
import tempfile

sys.dont_write_bytecode = True
sys.path.insert(0, f"{os.environ['MISE_PROJECT_ROOT']}/.config/mise/tasks/_scripts")
import helpers  # noqa: E402

# The id is the directory name, so the rename is the only edit a pin makes.
PROJECT_ID = os.path.basename(os.path.dirname(os.path.abspath(__file__)))
MARK = "public/brand/favicon.svg"

# Square only `<rect>` corners: a zeroed `<ellipse>` renders a blank icon.
# `$1` and `$2` are the regex's capture refs, not Python's.
SQUARE_JS = """
  import { readFileSync, writeFileSync } from "node:fs";
  const svg = readFileSync(process.env.MARK_SVG, "utf8");
  writeFileSync(
    process.env.SQUARE_SVG,
    svg.replace(/<rect\\b[^>]*>/g, tag =>
      tag.replace(/(\\s)(r[xy])="[^"]*"/g, "$1$2=\\"0\\"")),
  );
"""


def run(*args, **kwargs):
  """Run a tool of mise. A failure stops the task with its code."""
  code = helpers.tool(*args, **kwargs).returncode
  if code != 0:
    sys.exit(code)


def main():
  # A monorepo member at `<id>/`, else the repo root — never a wider search.
  if os.path.isfile(f"{PROJECT_ID}/{MARK}"):
    project = f"{os.getcwd()}/{PROJECT_ID}"
  elif os.path.isfile(MARK):
    project = os.getcwd()
  else:
    print(f"No favicon source for {PROJECT_ID}.", file=sys.stderr)
    print(f"Looked for {PROJECT_ID}/{MARK} and {MARK}, from the repo root.", file=sys.stderr)
    print("The mark is a brand asset the product supplies; put it at one of those.", file=sys.stderr)
    return 1

  src = f"{project}/{MARK}"
  out = f"{project}/public"
  with tempfile.TemporaryDirectory() as tmp:
    run(
      "node",
      "--input-type=module",
      "-e",
      SQUARE_JS,
      env={**os.environ, "MARK_SVG": src, "SQUARE_SVG": f"{tmp}/square.svg"},
    )

    # One-off tools, kept in the temporary directory — never repo dependencies.
    # Each runs from the repo root (the task's dir), so mise resolves the repo's pins.
    os.makedirs(f"{tmp}/stage")
    os.makedirs(f"{tmp}/out")

    # sharp-cli names its output after its input, so each size is staged by stem.
    def render(svg, size, stem):
      shutil.copy(svg, f"{tmp}/stage/{stem}.svg")
      run(
        "pnpx",
        "sharp-cli@6",
        "--input",
        f"{tmp}/stage/{stem}.svg",
        "--output",
        f"{tmp}/out",
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
      )

    render(src, 512, "icon-512")
    render(src, 192, "icon-192")
    render(f"{tmp}/square.svg", 180, "apple-touch-icon")
    render(src, 16, "ico-16")
    render(src, 32, "ico-32")
    render(src, 48, "ico-48")

    # png-to-ico's bin drops all but its first PNG; drive the library, installed in the temporary directory.
    run("pnpm", "--dir", tmp, "init", stdout=subprocess.DEVNULL)
    run("pnpm", "--dir", tmp, "add", "--silent", "png-to-ico@3", stdout=subprocess.DEVNULL)
    script = (
      f"import pngToIco from '{tmp}/node_modules/png-to-ico/index.js';"
      f"const sizes = [16, 32, 48].map(s => '{tmp}/out/ico-' + s + '.png');"
      "process.stdout.write(await pngToIco(sizes));"
    )
    with open(f"{tmp}/favicon.ico", "wb") as f:
      run("node", "--input-type=module", "-e", script, stdout=f)

    for name in ("out/icon-512.png", "out/icon-192.png", "out/apple-touch-icon.png", "favicon.ico"):
      shutil.move(f"{tmp}/{name}", f"{out}/{os.path.basename(name)}")

  names = ("favicon.ico", "apple-touch-icon.png", "icon-192.png", "icon-512.png")
  code = subprocess.run(["ls", "-l", *(f"{out}/{name}" for name in names)], check=False).returncode
  if code != 0:
    return code
  helpers.print_success("The favicon set is written")
  return 0


if __name__ == "__main__":
  sys.exit(main())
