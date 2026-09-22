# U3 — the mise pack: two positions, the merge tasks read per destination

- **Wave:** 1
- **Depends on:** —
- **Owns:** under `plugins/stackgen/stacks/toolchain-manager/mise/`:
  `config/.config/mise.toml`, `config/.config/mise/tasks/_scripts/merge`,
  `config/.config/mise/tasks/code/merge/develop`,
  `config/.config/mise/tasks/code/merge/main`,
  `config/.config/mise/tasks/code/worktrees`, `skills/**`, `conventions.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** every owned file, top to bottom — `mise.toml:118-128` (the
  marked position and its comment), `_scripts/merge` whole (`:11-19`, `:99-125`,
  `:137-164`, `:150-151`, `:172-181`, `:190-201`, `:258`, `:273-318`),
  `code/merge/develop:21`, `code/merge/main:9-16`, `code/worktrees:15-28`,
  `skills/mise/references/task-library.md` (`:164-165`, `:487-503`, `:515-532`,
  `:639`), `config-files.md`'s env-block passage, `conventions.md`'s
  marked-position list.
- **Lazy-load:** `plugins/stackgen/assets/pack-format.md` (marked-position
  syntax); `.config/mise/tasks/p/plugins/shellcheck` (the gate's flags).

## Ruling

Decision 1 — Per-branch landing: "Two marked positions replace `MERGE_MODEL` in
the mise pack's `mise.toml`: **`MERGE_MODEL_DEVELOP`** (preselected `direct`)
and **`MERGE_MODEL_MAIN`** (preselected `pr`), values `direct` or `pr`. …
`code:merge:develop` reads the first, `code:merge:main` the second … A repo
still carrying `MERGE_MODEL` alone: every reader takes it as both values".

Decision 5 — Merge method: "Unchanged — `--no-ff` locally, the forge's default
for a PR".

Decision 6 — `code:worktrees`: "`default_branch()` keeps reading `origin/HEAD`;
the literal fallback stays `main`."

## Edits

1. **`mise.toml:118-128`** — replace the `MERGE_MODEL` marked position with two,
   `MERGE_MODEL_DEVELOP` and `MERGE_MODEL_MAIN`, in the file's marker syntax,
   each with a one-line comment naming the task that reads it and the two
   values; ship the defaults `direct` and `pr` as the comment's example, the
   positions themselves empty as the others are. Cite nothing by plugin path.
2. **`_scripts/merge`** — `merge_to_destination_branch DEST SOURCE` resolves its
   mode from the destination: `MERGE_MODEL_DEVELOP` when `DEST` is `develop`,
   `MERGE_MODEL_MAIN` when `main`; when the resolved variable is unset and
   `MERGE_MODEL` is set, take `MERGE_MODEL` and print one `print_warn` line
   naming it legacy; when both are unset, `direct` (`:150-151` today).
   Everything else — the refusals `:153-181`, the direct sequence `:190-318`,
   `open_pull_request` `:99-125` — unchanged.
3. **`code/merge/develop`**, **`code/merge/main`** — the `#MISE description` and
   the header comments (`main:9-14`) name the variable each reads; no logic
   change beyond what `_scripts/merge` now resolves.
4. **`code/worktrees`** — unchanged logic; the comment at `:15-23` says the
   fallback is the literal `main` by decision 6 (one line).
5. **`skills/mise/references/task-library.md`** — rows `:164-165` name the
   variable per task; the `MERGE_MODEL` section (`:515-532`) becomes the
   two-position section with the legacy rule; `:487-503` and `:639` where they
   name the single key. **`config-files.md`** — the env-block passage lists the
   two positions. **`conventions.md`** — the marked-position list.

## Verification

- `mise run p:plugins:shellcheck` green over the three scripts.
- `mise run p:plugins:check` green (rule 11 parses the mise pack's config; exec
  bits intact — edit in place).
- `grep -n "MERGE_MODEL_DEVELOP\|MERGE_MODEL_MAIN" <mise.toml> <_scripts/merge> <task-library.md>`
  — hits in all three.
- `grep -n "MERGE_MODEL\b" <_scripts/merge>` — only in the legacy branch.
- `bash -n` passes on the three scripts.

## Guardrails

- `config/` is payload — no dprint; shfmt `-i 2 -ci` via the gate only.
- Edit scripts in place; never delete and recreate.
- Do not edit `plugins/vwf/**` (U1, U2, U4) or the hygiene pack (U4).
- No `pack.yaml` bump — U7.
- No doc outside the mise pack — `DOCS FALSIFIED:` lines.
- BSD tools, bash 3.2.
- Delete with `rm`, never `git rm`.

## Commit

`feat: mise pack — MERGE_MODEL_DEVELOP and MERGE_MODEL_MAIN; merge tasks read per destination`
— written by the orchestrator after the wave gate. Type from
`.config/git-conventional-commits.yaml`; no scopes.
