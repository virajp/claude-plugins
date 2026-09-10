# U10 — `/vwf:doctor`: the "run `/vwf:init`" finding

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/vwf/skills/doctor/**`. Touch nothing outside this list —
  not `init` (U9), not any stackgen file.
- **Model:** opus
- **Read first:** `SKILL.md` (207 lines — `:31-46` the doc-paths table,
  `:130-141` the dispatch table, `:143-154` the dependency audit's use of the
  word "lockfile", `:157-179` the finding kinds and every inline blocking
  condition, `:181-193` the report contract, `:200-207` callers halting on
  blocking), `references/stack-checks.md` (229 — `:101-127` how stack pins are
  resolved from config keys, `:210-214` the existing `/vwf:init` nudge in the
  mise check), `references/harness-and-memory.md` (96),
  `references/code-intelligence.md` (48 — the `.graphifyignore` check).
- **Lazy-load:** `plugins/stackgen/skills/stackgen-sync/SKILL.md:26` and
  `plugins/stackgen/skills/stackgen-stack-template/references/materializer.md:147`
  for the shape of `.claude/stackgen/lock.yaml`, which doctor has never read;
  `plugins/stackgen/stacks/toolchain-gate/pre-commit/config/.config/git-conventional-commits.yaml:26-32`
  for where `commitScopes` lives.

## Ruling

D23 — "Doctrine plus a doctor finding": "`/vwf:doctor` gains a check — the
adapter lockfile's pack versions against the installed packs, plus the registry
ids against `commitScopes` and the `p:<id>` groups — that reports 'run
/vwf:init' as a finding. Nothing runs by itself; the user is told when." The
user: "`init` must be run at regular interval to keep everything in sync (state
of the repo and it's config/setup)".

D16 — both `develop` and `main` must exist.

D24 — a re-run after architecture is expected to rename `p/<repo>/` to
`p/<registry-id>/`; the doctor finding is what says so.

The finding kind is **drift** (`SKILL.md:157-179`'s enum), never blocking: a
repo behind its baseline still works; it is out of date.

## Edits

1. **`references/stack-checks.md`** — a new section after the mise check
   (`:210-214`), **The repo shape against its baseline**, four sub-checks, each
   a `drift` finding whose remedy line is `/vwf:init`: (a) **Pack versions.**
   Read `.claude/stackgen/lock.yaml` (the adapter's lockfile; cite
   `stackgen-sync` as its owner and read only what is needed); for every
   component it records with a version, compare against the installed pack's
   `pack.yaml` `version:` under the stackgen plugin root
   (`${CLAUDE_PLUGIN_ROOT}` of the adapter — resolve the way `stack-checks.md`
   already resolves adapter paths; if it does not, resolve through the
   marketplace's installed path the same way the mise check finds a binary, and
   say how in `DECIDED:`). A recorded version older than the installed one is
   drift naming the component and both versions. A lockfile that does not exist
   is `missing` with `/vwf:init` as the remedy — the shape was never laid down.
   (b) **Project ids.** For every project in the registry (the doc-paths table
   already reads it), slugify its id per the adapter's `assets/ids.md` (cite, do
   not restate) and check: a task directory `.config/mise/tasks/p/<slug>/`
   exists; the slug appears in `.config/git-conventional-commits.yaml`'s
   `commitScopes` (or the list is empty, which is fine for a single-project repo
   and stated so); and — only when `.config/mise.dev.toml` carries
   `[shell_alias]` entries of the `setup-<id>` form — one for this slug. Each
   miss is one drift row. A `p/` directory whose segment matches no slug is
   drift worded as "id source changed: `<dir>` is not a registry id". (c)
   **Branches.** `git show-ref --verify --quiet refs/heads/develop` and
   `refs/heads/main`: a missing one is drift, remedy `/vwf:init`, with the
   one-line branch model. (d) **The environment key.** `.config/mise.toml`
   carries `REPO_NAME` and its value is not the shipped placeholder; else drift.
2. **`SKILL.md`** — (a) the dispatch table (`:130-141`) gains the section; (b)
   the finding-kind prose (`:157-179`) gains, under `drift`, one clause naming
   the baseline check so a reader knows it is not blocking; (c) the remedies
   paragraph (`:181-193`) notes that every row from this section shares one
   remedy, so the report prints `/vwf:init` once with the rows that led to it;
   (d) the doc-paths table gains `.claude/stackgen/lock.yaml` and
   `.config/git-conventional-commits.yaml`, read-only.
3. **`references/stack-checks.md:210-214`** — the existing nudge stays; add one
   sentence that the section below is the fuller version of the same check.

## Verification

- `mise run plugins:check` exits 0 — rules 4, 6, 7, 10, 12. Rule 10: name no
  tool; `git` is fine; the editor and the forge are not this skill's to name at
  all.
- `grep -n "lock.yaml" plugins/vwf/skills/doctor/SKILL.md plugins/vwf/skills/doctor/references/stack-checks.md`
  hits both.
- `grep -n "ids.md" plugins/vwf/skills/doctor/references/stack-checks.md` hits.
- `grep -c "/vwf:init" plugins/vwf/skills/doctor/references/stack-checks.md` is
  at least 4.
- The section's four sub-checks each state their finding kind and remedy in the
  report contract's shape (`SKILL.md:181-193`).

## Guardrails

- Doctor **reports; it never writes** — the skill's own hard rule. No sub-check
  creates a branch, a directory or a key.
- Do not edit `plugins/vwf/skills/init/**`; a passage there is U9's.
- Strict YAML frontmatter; fold width by hand; `cat` is `bat` — Write/Edit only.

## Commit

`feat(vwf): doctor reports repo-shape drift with /vwf:init as the remedy` —
written by the orchestrator after the wave gate, not by the unit.
