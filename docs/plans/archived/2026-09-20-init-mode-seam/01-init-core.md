# U1 — init core: the three modes, the stack read, the sub-project rule

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/vwf/skills/init/SKILL.md`,
  `plugins/vwf/skills/init/references/new-repo.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** both owned files, top to bottom, before editing (673 and 794
  lines) — the mode table `SKILL.md:183-194`, the no-argument rule `:127-129`,
  the roster read `:239-259`, "sub-project directory" `:295`, `:298`, `:321`;
  `new-repo.md:3-5`, §2 `:60-76`, §5 `:114-123`, `:141, 151`.
- **Lazy-load:** `plugins/vwf/skills/setup/SKILL.md:168-174` (setup's
  blank-vs-code definition — cite, never edit);
  `plugins/vwf/skills/init/references/existing-repo.md` pass 1 and pass 6 (U2's
  — cite by pass number);
  `plugins/stackgen/stacks/repo-hygiene/repo-hygiene/conventions.md:77-107` (the
  ignore-section table); `plugins/stackgen/assets/pack-format.md` (marked
  positions);
  `SG/skills/stackgen-stack-template/references/materializer.md:167-185` (the
  conflict list).

## Ruling

Decision 1 — Mode: "Three modes, decided per repo by init from what the tree
contains: **`shaped`** — the materializer lockfile exists (today's existing
path); **`source`** — no lockfile, but a language manifest, a source directory,
a root tool config, or a `.config/` without the lockfile; **`blank`** — none of
those (README, LICENSE, `.gitignore`, `.gitattributes` and docs are not evidence
— setup's own definition at `S/SKILL.md:168-174`, cited not restated). `source`
runs the new-repo landing **plus** the read-before-land passes of the existing
pipeline that have something to read (pass 1 survey, pass 6 offer; the sidecar
and rename passes only when a task library exists). Init still takes no
argument; setup's fork stays for its onboard sub-paths."

Decision 2 — Stack read: "One read, in order, first hit per language wins: the
pins under `projects.<name>.stack.*` and `languages` in `.config/vwf.yaml`; else
the lockfile's components (`shaped`); else, in `source` mode, a **manifest
table** — `package.json` → node, `pyproject.toml` / `requirements.txt` → python,
`pubspec.yaml` → dart, `go.mod` → go, `Cargo.toml` → rust, `Package.swift` →
swift — read at the root and in every sub-project directory (decision 4).
`blank` reads nothing and lands no section. The read drives the `.gitignore`
sections … and decision 3's slots."

Decision 3 — Runtime block: "… marked positions — `RUNTIME_BLOCK` and
`PATH_ENTRIES` — which init fills from the stack read (one runtime line per
detected language, `_.path` left empty when nothing needs it)".

Decision 4 — Sub-project: "Defined: the registry's `projects[].path` list when a
registry exists; else, in `source` mode, a non-root directory carrying its own
manifest from decision 2's table, or a member a workspace file enumerates
(`pnpm-workspace.yaml` globs, `melos.yaml`, a Cargo or Go workspace). `docs/`,
`scripts/`, `.config/`, `.github/` and any dotdir never qualify. `blank`
proposes none."

Decision 5 — Conflicts: "Pass 6's replace-or-keep offer, its default rule and
its `kept_files` record run in **every** mode over every path the materializer
reports as a conflict — `blank` included; the plan shows one row per conflict
before consent."

## Edits

1. **`SKILL.md`** — the mode table (`:183-194`) becomes three rows with the
   evidence per mode (decision 1) and one sentence on what each mode runs;
   `:127-129` stands (no argument) and gains that setup's fork is one input init
   re-derives. A new short section **The stack read** after the roster read
   (`:239-259`): the three sources in order, the manifest table, what the read
   drives (sections, the two slots, the sub-project proposals). The three
   "sub-project directory" mentions (`:295, 298, 321`) point at one definition
   written once (decision 4), beside Q2. The plan summary (`:70-78`, `:476-481`)
   says the conflict rows appear in every mode.
2. **`new-repo.md`** — `:3-5` reworded to the three modes (this file is the
   `blank` and `source` landing; `shaped` is `existing-repo.md`'s). §2
   (`:60-76`): after the materializer's dry-run, every conflict it lists becomes
   a pass-6 row — cite `existing-repo.md`'s pass 6 by name, do not restate it —
   and a keep is recorded under `kept_files` exactly as that pass records it. §5
   (`:114-123`): the sections come from the stack read, not the lockfile alone;
   a `source` repo with a `package.json` gets the node section on the first run.
   A new step beside §5 fills the two marked positions of decision 3 from the
   same read. `:141, 151` use the sub-project definition. The `source` mode's
   extra passes (pass 1 survey, pass 6 offer; sidecar and rename only with a
   task library) are listed as one paragraph pointing into `existing-repo.md`.

## Verification

- `mise run p:plugins:check` green.
- `grep -n "blank\|source\|shaped" plugins/vwf/skills/init/SKILL.md` — the three
  modes named in the table.
- `grep -c "sub-project directory" plugins/vwf/skills/init/SKILL.md` — every hit
  sits within two lines of the definition or cites it.
- `grep -n "RUNTIME_BLOCK\|PATH_ENTRIES" plugins/vwf/skills/init/references/new-repo.md`
  — both named.
- `grep -n "package.json\|pubspec.yaml\|go.mod" plugins/vwf/skills/init/SKILL.md`
  — the manifest table present.

## Guardrails

- Do not edit `existing-repo.md`, `fragments-and-sections.md` or
  `readme-and-license.md` (U2); cite their passes.
- Do not edit `vwf-config.md` or `setup/**` (U3), or any pack (U4).
- Rule 10 — vwf prose names no technology outside the enumerated list: the
  manifest filenames are file names, not tool tokens; keep tool names (`pnpm`,
  `melos`, `cargo`) out of `SKILL.md` prose — say "the workspace file" and put
  the filenames in `new-repo.md`, which is a reference.
- No doc — `DOCS FALSIFIED:` lines.
- `plugins/**/*.md` is not dprint-formatted: match the fold width by hand;
  strict-YAML frontmatter untouched.
- Delete with `rm`, never `git rm`.

## Commit

`feat: init decides blank, source or shaped from the tree; the stack read` —
written by the orchestrator after the wave gate. Type from
`.config/git-conventional-commits.yaml`; no scopes.
