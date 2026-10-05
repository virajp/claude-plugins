# The Tool-Config Table

The root spellings a repo may already carry for a tool a pack ships, and what
the survey does with each. The existing-repo pipeline's **pass 1** reads this
table: beside the allowlist and the rename map it walks the root and the
inside of `.github/` for every spelling in the second column, and each hit is
one **plan row** whose outcomes — move by default, keep both, delete only on
the user's explicit pick — pass 1 states and this file does not restate; a
`handed` or `report` row's hit is the exception, and is no move row of
init's. The table is the list of what to look for and the shape the move
takes; the offer, the consent and the report are the pipeline's.

## What `all` lands

`/stackgen:tool-config all` lands every file the rows below name, and more;
its own SKILL.md, *What it lands*, is the list, and this file restates none
of it beyond the root spellings. In short: the mise files under `.config/`
and the task library, the gate configs — dprint and its root stand-in,
taplo, pre-commit, gitleaks, grype, the house linter — the git files and the
commit convention, `.graphifyignore`, `.vscode/settings.json` and the
statusline config, every one rendered from the repo's
`.config/stackgen.yaml`. It lands no dependency-update policy.

## The table


The first column is the tool, the second its known root spellings, the third
the path the owner lands the same tool's configuration at, the fourth that
owner — `stackgen:tool-config` or a pack — and the fifth the merge shape — one
of three:

- **`move-and-offer`** — the repo's file becomes the `.config/` copy, and that
  copy is then compared against the owner's render: replace, or keep.
  Nothing is read and dropped; the settings the repo had are what the
  comparison shows. Where the owner is `stackgen:tool-config`, the moved copy
  is that skill's `write` row in its preview, `ok` or `keep-existing`,
  never a pass 6 offer. Where the owner also lands a root stand-in of the
  same basename, this is pass 1's move-and-shim case, and the stand-in takes
  the root spot the real file left.
- **`handed`** — the file sits at the root, where its tool reads it, and
  `/stackgen:tool-config all` renders it in place: init writes no row of its
  own for it, not a move, not a keep, not a stray. The skill's row — the
  file's lines between its markers, or, for a file with no marker pair, one
  `write` row replacing it whole, the repo's own lines listed under it and
  appended below the markers on `ok` per [new repo](new-repo.md) §2 — is
  printed in the repo's section under **Tool-config rows**, and the one
  consent covers it.
- **`report`** — nothing folds or moves the file: it stays at the root, and
  pass 1's toolchain step reports it under Deferred with the unlock it
  names.

| Tool       | Root spellings                     | Landed path                                                   | Owner                  | Merge shape      |
| ---------- | ---------------------------------- | ------------------------------------------------------------- | ---------------------- | ---------------- |
| pre-commit | `.pre-commit-config.yaml`          | `.config/pre-commit-config.yaml`                              | `stackgen:tool-config` | `move-and-offer` |
| gitleaks   | `.gitleaks.toml`                   | `.config/gitleaks.toml`                                       | `stackgen:tool-config` | `move-and-offer` |
| grype      | `.grype.yaml`                      | `.config/grype.yaml`                                          | `stackgen:tool-config` | `move-and-offer` |
| dprint     | `.dprint.json`, root `dprint.json` | `.config/dprint.json`; root `dprint.json` is the skill's shim | `stackgen:tool-config` | `move-and-offer` |
| mise       | `.mise.toml`, root `mise.toml`     | `.config/mise/` — landed beside it, never folded              | `stackgen:tool-config` | `report`         |
| git        | `.gitignore`, `.gitattributes`     | the same root files — rendered in place by the skill          | `stackgen:tool-config` | `handed`         |
| graphify   | `.graphifyignore`                  | the same root file — rendered in place by the skill           | `stackgen:tool-config` | `handed`         |

Some rows need a word:

- **dprint.** Root `dprint.json` is on the allowlist because the skill itself
  lands one there — the two-line stand-in that points at `.config/`. A real
  config of that name at the root is the move-and-shim case, not a
  keep-both: it moves, the stand-in replaces it, and the settings are read
  through the stand-in. `.dprint.json` has no stand-in and simply moves.
- **git and graphify.** Their files sit at the root, where git and the graph
  read them, so there is nothing to move: the skill renders its curated set
  between the markers, and a repo's own lines below the closing marker
  survive every render.
- **A dependency-update policy** — a Renovate or Dependabot file — is no
  row's: nothing ships one, so a root spelling is reported by pass 1 like
  any root file off the allowlist, and one under `.github/` is the repo's
  own and left alone.

A tool with no row here is not on the survey's list: a root file for it is
off the allowlist and is reported, as pass 1 says, never moved. Adding a tool
to the packs or the skill, or a spelling it reads, means adding its row here
in the same change.
