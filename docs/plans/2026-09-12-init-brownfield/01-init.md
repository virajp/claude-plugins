# U1 — init: the sidecar, repo-only tasks, diverged pack files

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/vwf/skills/init/SKILL.md`,
  `plugins/vwf/skills/init/references/existing-repo.md`,
  `plugins/vwf/skills/init/references/new-repo.md`,
  `plugins/vwf/skills/init/references/fragments-and-sections.md`,
  `plugins/vwf/skills/init/references/readme-and-license.md`. Touch nothing
  outside this list.
- **Model:** opus
- **Read first:** every owned file, top to bottom, **as plans 1 and 2 left
  them**. The passes you change are `existing-repo.md:104-141` (the helper
  library), `:139` and `:149-153` (byte-identical untouched; "already owned,
  never overwritten"), `:143-153` (creates), `:272-305` (plan sections),
  `:307-315` (consent), `:317-340` (apply order), `:381-403` (report). Then,
  read-only:
  `docs/memory/decisions/2026-09-10-init-replaces-a-diverged-helper-library.md`
  (what stands and what this reverses) and `plugins/vwf/assets/vwf-config.md`
  (the `enforcement:` decline shapes, for ruling 4).
- **Lazy-load:**
  `plugins/stackgen/stacks/toolchain-manager/mise/skills/mise/references/task-library.md`
  §143 (the mandatory set, for ruling 2's "name the contract does not carry")
  and §507 (the legacy table, for ruling 3's default).

## Ruling

Quoted from index.md:

> **1. The sidecar.** "Move them to a repo-owned `_scripts/local` sidecar."
> `_scripts/local` is repo-owned, shipped by no pack, and sourced **after**
> `_scripts/helpers` by each task that needs it. During the helper pass, every
> function the repo's tasks call that the legacy table does not map is extracted
> **verbatim** (its whole body) from the repo's old helper into
> `_scripts/local`, listed by name in the plan as one row each, and each calling
> task gains one
> `source "${MISE_PROJECT_ROOT}/.config/mise/tasks/_scripts/local"` line
> directly after its helpers `source`. Nothing is deferred on this account. A
> repo that already has `_scripts/local` gets the functions appended, never
> duplicated.

> **2. Repo-only tasks.** "Keep, list, and flag only contract violations." A
> task file under `.config/mise/tasks/` that no landed pack ships is kept
> untouched and listed in the plan under "repo-owned, kept". One under `setup/`
> or `code/` whose name the task library's mandatory set does not carry gets a
> report note: the contract reserves those two groups for the shipped set, and
> the task's home is `p:<id>:*` unless it is a gate every project shares. init
> never moves or renames it.

> **3. Diverged pack files.** "Offer replace-or-keep per file, replace re-fills
> the marked positions." The survey lists every pack-owned file whose bytes
> differ from the pack's after the rename pass, with a three-line summary (what
> the repo's version adds, what it lacks, whether it references a retired name).
> Each is one row in the single consent plan: **replace** (the pack's file
> lands; every marked position it carries is filled from the interview's
> confirmed answers, the same way a fresh landing fills them) or **keep**
> (untouched; recorded per ruling 4). The default is replace when the repo's
> file references any left-hand name of the legacy table; keep otherwise.

> **4. Recording a kept file.** DECIDED 2026-09-12 by the user, after U1 and U2
> both returned the fallback: the record is a **new key**,
> `enforcement.kept_files:` — a map of `<path>: { reason: <one line> }`, the
> path as the lockfile names it — and `config_format` bumps 16 → 18 (U6 owns the
> schema, the lineage row and the migrate sentence). `init` writes the key,
> consented in its single plan, and never creates `.config/vwf.yaml` — on a repo
> `/vwf:setup` has not reached, the keep is applied and only the record is
> Deferred with unlock "run `/vwf:setup`, then `/vwf:setup reshape`". `init` and
> `doctor` read it; an absent block reads as empty.

And the two reversals from index.md's Goal, verbatim, to quote in the text where
each rule changes.

## Edits

1. **`existing-repo.md`, the helper pass (`:104-141`)** — keep replace-and-
   rewrite as written. Replace the "unmapped → deferred" paragraph (`:132-137`)
   with the sidecar rule (ruling 1): how the function list is derived (every
   function name the repo's tasks call, minus the pack helper's names, minus the
   legacy table's left-hand names), the verbatim extraction, the
   `_scripts/local` create row, the per-task `source` line as a rewrite row, and
   the append-never-duplicate rule for an existing sidecar. State that
   `_scripts/local` is the one file under `_scripts/` a pack never ships and
   init never replaces.
2. **`existing-repo.md`, a new pass "Repo-only tasks"** — after the project-
   groups pass: enumerate `.config/mise/tasks/**` files no landed pack ships;
   list each as "repo-owned, kept"; for one under `setup/` or `code/` whose
   contract name the mandatory set lacks, the report note per ruling 2. Say
   plainly that init moves nothing.
3. **`existing-repo.md`, the diverged-file rule (`:139`, `:149-153`)** — replace
   "already owned, never overwritten" with ruling 3: the survey row with its
   three-line summary, the default, the two outcomes, and that a marked position
   on a replaced file is filled from the confirmed answers exactly as the
   new-repo pipeline fills it (cite `new-repo.md` §The marked positions by its
   heading). Name the reversal in one sentence.
4. **`existing-repo.md`, plan sections / consent / apply order / report** — add
   the sidecar rows, the repo-only list, the diverged rows with their
   replace/keep column; the consent step lets the user flip any diverged row's
   default; the apply order lands replaced files before the marked- position
   fills; the report shows the three new sections. Ruling 4 (resume): the kept
   record is `enforcement.kept_files.<path>: { reason }` in `.config/vwf.yaml` —
   name that key wherever round 2 left "recorded as kept under `enforcement:`",
   drop the "key is not settled here" paragraph and the Deferred record line,
   and write the key in the apply order after the keep itself. Never create the
   config file; the Deferred-with-unlock case stays only for a repo `/vwf:setup`
   has not reached.
5. **`SKILL.md`** — where the brownfield behaviour is summarised, three
   sentences: sidecar, repo-only kept, diverged offered. Update the "what init
   never does" list if it says "never overwrites a diverged pack file".
6. **`new-repo.md`, `fragments-and-sections.md`, `readme-and-license.md`** —
   read; edit only if a sentence contradicts the three rules (a greenfield repo
   has none of these cases). Otherwise untouched.

## Verification

- `grep -n '_scripts/local' plugins/vwf/skills/init/references/existing-repo.md plugins/vwf/skills/init/SKILL.md`
  hits both.
- `grep -n 'never overwritten' plugins/vwf/skills/init` is empty.
- `grep -n 'repo-owned, kept' …/existing-repo.md` hits.
- `grep -rniE '\bgh\b|\bglab\b|pnpx|npx|dprint|gitleaks' plugins/vwf/skills/init`
  adds no hit (init names no tool).
- `mise run p:plugins:check` green; frontmatter untouched.

## Guardrails

- Do not touch `doctor` (U2), `setup` (U3), or `plugins/vwf/assets/` (nobody in
  this plan — ruling 4).
- init names no tool; it names task-library paths and contract names only.
- Strict-YAML frontmatter untouched; match fold width by hand.
- Delete with `rm`, never `git rm` (nothing to delete).

## Commit

`feat: init moves unmapped helpers to a sidecar, keeps repo-only tasks, and offers diverged pack files`
— written by the orchestrator after the wave gate. Type `feat`; no scope.
