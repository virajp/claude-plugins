# Decision — packs declare their machine values in `values:`; pack plugins are `setup/ai/<slug>` subtasks; an unedited file has no preview row

**Date** 2026-10-05 · **Branch** `2026-10-05-vwf-callers-on-templates` ·
**Plan**
[`docs/plans/2026-10-05-vwf-callers-on-templates/`](../../plans/2026-10-05-vwf-callers-on-templates/index.md)
(F1, F5, F10) · **Reverses**
[`2026-10-03-setup-ai-validates-vwf.md`](./2026-10-03-setup-ai-validates-vwf.md)
D5 (a pack plugin arrives through a `tool-config:` `add-plugin` entry) and D7
("landed and nobody edited" read from the lockfile record)

## What was decided before

D5 had a pack ask for a plugin with a structured `tool-config:` entry that
tool-config wrote into `setup/ai` inside the pack's block. D7 told a `setup/ai`
tool-config landed and nobody edited from one edited by hand by its lockfile
record. Separately, swiftui's `machine_env:` entries carried a `detect` command
and a `question` per value, and `/vwf:setup` wrote each answer into the pack's
block with `tool-config mise set-env`.

## What changed

Plan 2 removed `tool-config:` and `machine_env:` from `pack.yaml`: a pack ships
files — `config/` copied, `templates/` rendered by `tool-config pack` — and
tool-config records nothing. Deleting `machine_env:` also deleted each value's
`detect` and `question`; the user ruled *"Plan 2 has started, if it has not then
amend it otherwise add to plan 3"*. Confirmed at the plan's gate on 2026-10-05.

- **`values:` (F1).** A pack's `pack.yaml` lists the machine values its
  templates read, each entry exactly `name` (upper snake), `detect` (a shell
  command printing the value, non-zero when it cannot tell) and `question`.
  swiftui's four come back from `machine_env:` renamed. `p:plugins:check` holds
  the list to the templates both ways — every name read as `@@NAME@@`, every
  pack-own tag declared — and refuses a malformed entry, a repeated name, or
  `FORMAT` and tool-config's global names.
- **The values contract (F10).** `/vwf:setup` gathers each entry — runs
  `detect`, else asks `question` — and passes the stack plugin a `values:` map
  beside `answers:`: pack slug → lowercase name → value. The materializer copies
  `config/`, then runs
  `tool-config pack --slug <slug> --dir <pack dir> --set <name>=<value>…`, which
  stores the values under `packs.<slug>` in `stackgen.yaml`. A dropped pack goes
  through `pack-remove`, then its recorded files are deleted. `apply-entries`,
  `set-env` and `machine_env` go.
- **Rendered records (F5).** The materializer records each path `pack` rendered
  in `.claude/stackgen/lock.yaml` with `source: <pack>@<version>`,
  `rendered: true` and no hash. It is judged against a fresh render
  (`preview pack`), never against bytes, and `stackgen-sync` refreshes it by
  re-running `pack` for a newer pack version.
- **Pack plugins (reverses D5).** A pack that needs a plugin ships a
  `setup/ai/<slug>` subtask calling `ensure_plugin`; `setup:ai:all` calls it
  beside `setup:ai:base`. `setup:ai` is `setup:ai:all` everywhere vwf names it.
- **Unedited (reverses D7).** A file the skill owns is unedited when its
  `preview` returns no row for it — the same test doctor runs.

## The alternatives rejected

- **Leave the metadata deleted** — every Mac would then be asked four questions
  `xcodebuild` already answers.
- **Restrict templates to `conf.d/<slug>/`** — a pack's rendered file can sit
  anywhere its tool reads it; the record is what makes removal exact.
