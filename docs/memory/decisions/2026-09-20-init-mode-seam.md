# Decision — init decides blank, source or shaped from the tree; the stack read; conflicts offered in every mode

**Date** 2026-09-20 · **Branch** `2026-09-20-init-mode-seam` · **Plan**
[`docs/plans/2026-09-20-init-mode-seam/`](../../plans/2026-09-20-init-mode-seam/index.md)
· **Backlog** B28, piece D2, plan 2 of 5 · **Problem**
[`2026-09-20-init-shape-audit.md`](../problems/2026-09-20-init-shape-audit.md)
(B1, G1, G2, G3, L5, G7, G8, G10, G13, G14)

## What was decided before

`/vwf:init` knew two modes, read off two markers: no `.config/` directory
**and** no task-library directory meant `new`, anything else `existing`. The
signal was called "deliberately narrow" on the grounds that nothing in the new
pipeline touched source — which was true of source files and false of every
other file a repo already had at a path a pack lands: the materializer reported
such a path as a conflict and the new pipeline said only that a decline was a
deferral, with no replace-or-keep row and no `kept_files` record. The
`.gitignore` language sections were resolved from the pinned packs, so a first
run on a repo with a `package.json` and no pin appended nothing; the mise base
config carried its runtime settings as a commented block for a human to prune
("keep ONLY the one matching this repo's runtime, and delete the rest") and its
`_.path` line commented "until a package-manager component lands". "Sub-project
directory" was used in seven places and defined in none. The top-level `stacks:`
adapter roster was read by init, setup and stackgen's menu skill and documented
nowhere in the config schema, whose `enforcement:` note said `stacks:` had been
retired in format 10 — that was `enforcement.stacks`. The two-marker test was
never a recorded decision; the "adopt, not flatten" doctrine
(`2026-09-12-init-brownfield-sidecar-and-diverged-files.md`) was the existing
pipeline's alone.

## What changed

**Three modes, decided per repo from what its tree contains** — the first row
that holds:

| The repo carries                                                                                                      | Mode     |
| --------------------------------------------------------------------------------------------------------------------- | -------- |
| the stack adapter's **lockfile** — written when a pack first landed                                                   | `shaped` |
| no lockfile, but a **language manifest**, a **source directory**, a **root tool config**, or a `.config/` without one | `source` |
| none of those                                                                                                         | `blank`  |

`shaped` is today's existing pipeline whole. `source` is the new-repo landing
**plus** the read-before-land passes of the existing pipeline that have
something to read — pass 1 (the root survey) and pass 6 (the replace-or-keep
offer), with pass 3 (renames) and pass 5 (the helper library and its sidecar)
only where a task library exists. `blank` is the new-repo landing alone. Init
still takes no argument: setup's own blank-or-code fork stays setup's, for its
onboard sub-paths, and init re-derives the mode. The two tests differ on a root
tool config — not code for setup, `source` evidence for init, since pass 1 has
to read it before a pack lands beside it — and, as the wave review noted, on
`docs/blueprint/`, which setup's fork counts and init's does not. A readme, a
licence, `.gitignore`, `.gitattributes` and a docs tree are not evidence, by
setup's definition, cited rather than restated.

**The stack read.** Once per repo, before the plan; three sources in order, the
first hit per language winning: the pins under `projects.<name>.stack.*` and
`languages` in `.config/vwf.yaml`; else the lockfile's components (`shaped`);
else, in `source` mode only, a fixed manifest table read at the root and in
every sub-project directory — `package.json` → node, `pyproject.toml` /
`requirements.txt` → python, `pubspec.yaml` → dart, `go.mod` → go, `Cargo.toml`
→ rust, `Package.swift` → swift. Every source resolves to those six keys: a pin
token or a lockfile component slug is mapped onto one by the hygiene pack's
template table (the adapter owns the mapping, init restates none of it), and a
token, slug or manifest nothing maps is proposed in the plan, never guessed.
`blank` reads nothing. The read is the only thing that drives the `.gitignore`
language sections, the two runtime positions, and the sub-project proposals
question 2 shows where no registry names them.

**Two new marked positions.** The mise pack's runtime block under `[settings]`
becomes `RUNTIME_BLOCK` and its `_.path` line `PATH_ENTRIES`; both ship empty,
init fills them from the stack read (one runtime settings line per detected
language, the path entry only where a project-local binary directory needs one),
and the human instruction comments go. A marked position is what the content
hash splices out, so the fill is never drift. The base's marked positions are
now five: `REPO_NAME`, `MERGE_MODEL`, `MEMBERS`, `RUNTIME_BLOCK`,
`PATH_ENTRIES`. The hygiene pack's `.gitignore` template table is re-keyed from
pinned pack to language and gains `go`, `rust` and `swift` rows (upstream
templates, fetched and resolving). Pack bumps: mise `1.3.0` → `1.4.0`, hygiene
`1.1.1` → `1.1.2`.

**Sub-project directory, defined once** (init's question 2): where a registry
exists, the registry's `projects[].path` list and nothing else; where none does
— a first run — the term is live in `source` mode only and means a non-root
directory carrying its own manifest from the stack read's table, or one a
workspace file at the root enumerates (`pnpm-workspace.yaml` globs,
`melos.yaml`, a Cargo or Go workspace). `docs/`, `scripts/`, `.config/`,
`.github/` and any dot-directory never qualify. `blank` proposes none.

**Conflicts offered in every mode.** Pass 6's replace-or-keep offer, its default
rule and its `enforcement.kept_files` record run over every path the
materializer's dry run reports as a conflict — `blank` included; the plan shows
one row per conflict before the consent. `README.md` and `SECURITY.md` join
`LICENSE` under the already-there rule: kept, never replaced, reported, and
never a `kept_files` entry, since nothing was offered. This is the "adopt, not
flatten" doctrine extended to `source` and `blank`, not changed.

**The `stacks:` roster documented.** `vwf-config.md` gains the top-level
`stacks:` key where init reads it — the adapter roster, product-wide, written by
`setup` and read by init, setup's topology and workspace references, and each
adapter's menu skill — with the retirement note corrected to name
`enforcement.stacks`. No `config_format` bump: the key was already read and
written.

## The alternatives rejected

- **Setup hands `blank` / `code` down to init** — init would take an argument
  for the first time, and setup's test is the wrong one for init's job (a root
  tool config is a file pass 1 must read).
- **Widen the two-marker test and keep two modes** — a source-bearing repo
  without a lockfile is neither empty nor previously shaped; forcing it into
  either branch is what overwrote files or ran eleven passes over nothing.
- **Lockfile only, or ask the user for the languages** — a first run has no
  lockfile, and the manifests already answer.
- **Leave the runtime comment for a human** — a hand-picked line is the edit
  that turns a pack-owned file into a diverged one.
- **Keep "sub-project directory" undefined** — seven uses, no definition, and
  question 2's proposals depended on it.
- **Mode `new` keeps silent conflicts; `SECURITY.md` replaced** — a decline that
  leaves no record is re-offered forever, and a security contact the repo
  already names is not the pack's to overwrite.
- **Bump `config_format` to 21 for `stacks:`** — documenting a key every reader
  already reads changes no file.

## Still out of scope

- The brownfield read-before-land rules for root tool configs, the rename map,
  the `.gitignore` section merge, the hook-manager survey, the missing
  §3/4/8/9/10 passes, writers and hashes, inline `[tasks.*]` — plan 3
  (`init-brownfield-reads`), which also widens what pass 1 sees in `source`
  mode.
- `new-repo.md` §11(c) still assumes the first commit precedes hook wiring; a
  `source` repo with hooks already wired is plan 4's (`branch-model`), with the
  git pass, branch names and members' HEAD.
- Rendering the hygiene root set, the editor baseline split, the gate values —
  plan 5 (`pack-intent-rendering`).
- A repo keeping its own `SECURITY.md` has no 6b row, so the issue chooser's
  vulnerability entry has no address — the declined shape (entry removed) is
  assumed.
- The language-keyed hygiene table has no row for a pin with no language (a
  `flutter` pin alone) — the stack read is assumed to always yield `dart` beside
  it.
- Wave review, contested at the round cap: three passages say the two tests
  "differ on exactly one item" where two differ (the root tool config and
  `docs/blueprint/`); `init/SKILL.md` proposes an unmapped slug where the
  hygiene table says such slugs need no row.
