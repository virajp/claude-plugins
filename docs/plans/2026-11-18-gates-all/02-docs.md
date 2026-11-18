# U2 — Docs

- **Read first:** the branch delta of wave 1, then each passage named below.
- **Lazy-load:** `${CLAUDE_PLUGIN_ROOT}/skills/docs-sync/SKILL.md`.

## Ruling

Quoted from the `decisions` list of `index.json`:

- **D1:** The default unit gate is `mise x -- mise run code:format --all`, and
  the default wave gate is `mise x -- mise run code:lint --all`. After
  bootstrap 4.0.0, `code:format` and `code:lint` examine only the uncommitted
  files when they get no files and no `--all`. The wave gate runs before wave 1
  and after the units commit, on a clean worktree, so without `--all` it
  examines nothing.
- **D2:** The plan gate stays `mise x -- mise run code:precommit`. It always
  runs pre-commit with `--all-files` and takes no flag.
- **D4:** The plans that are already queued keep their gate lines. No unit
  edits a folder under `docs/plans/`.
- **D7:** The stackgen pack texts that name `mise run code:lint` or
  `code:format` stay as they are. They say which tool a task runs, and that
  stays true.
- **D16:** `CLAUDE.md` (about line 243) says the lint hook calls `code:lint`,
  which runs the house linter over the whole tree. Rewrite that clause: the
  lint hook calls `code:lint` with the staged files, and `code:lint --all`
  lints the whole tree, so every linter exclusion still lives in
  `.config/linter.yaml` and nowhere else. `.claude/docs/repo-shape.md` (about
  lines 122-125) already says the hooks pass the staged files, and stays.
- **D18:** U2 owns this repo's `CONTRIBUTING.md` and applies the D6 and D14
  edits to its gates section: the comments of the two bare daily commands say
  that they examine the uncommitted files; one `--all` line each is added; the
  sentence above the block names the `--all` forms as the pre-push form.
- **D22:** Move the comment column of the whole daily-checks `sh` block, so
  that all comments align. On the lines you do not otherwise change
  (`code:sec`, `code:precommit`), only whitespace changes.

## Edits

1. Run `/vwf:docs-sync` over the branch delta of this run. Apply each finding
   inside the owned paths, and each `DOCS FALSIFIED:` line of U1.
2. **`site/src/content/docs/plugins/vwf.md`** — in the "three gates" passage
   of `/vwf:change-plan` (about lines 3495-3510), the proposal becomes
   `mise x -- mise run code:format --all`,
   `mise x -- mise run code:lint --all` and
   `mise x -- mise run code:precommit`. Add one sentence with the reason of D1.
   Examine the other gate passages of the file (about lines 2178, 2460, 2508)
   and change only a passage that names a default command.
3. **`site/src/content/docs/how-to/operate/ad-hoc-change.md`** — in "The three
   gates" bullet (about line 120), the proposal becomes `code:format --all`,
   `code:lint --all` and `code:precommit`, with the reason of D1 in one
   sentence.
4. **`.claude/skills/vwf-plugin/references/skills-and-agents.md`** — in the
   `change-plan` row (about line 48), the defaults become
   `code:format --all`, `code:lint --all` and `code:precommit`.
5. **`CLAUDE.md`** (about line 243, the dprint trap bullet) — per D16, rewrite
   the clause "the `lint` hook calls `code:lint`, which runs the house linter
   over the whole tree": the hook calls `code:lint` with the staged files, and
   `code:lint --all` lints the whole tree, so every linter exclusion still
   lives in `.config/linter.yaml` and nowhere else.
6. **`CONTRIBUTING.md`** (this repo's own, about lines 50-55, "The gates") —
   per D18: change the comments of `mise run code:format` and
   `mise run code:lint` to say that they examine the uncommitted files (staged,
   changed and new); add `mise run code:format --all` and
   `mise run code:lint --all`, each with a comment that says it examines every
   file of the repository; keep the comment column aligned; rewrite the
   sentence above the block ("nothing to remember beyond running them before
   you push"): while you work, the bare commands examine the uncommitted
   files; before you push, run the `--all` forms. Change nothing else.
7. `readme.md` and `.claude/docs/**`: change a passage only if docs-sync finds
   that it names a default gate line. `.claude/docs/repo-shape.md` (about lines
   122-125) already says the hooks pass the staged files: leave it (D16).

## Verification

- `mise x -- mise run code:format --all` and `mise x -- mise run code:lint --all`
  pass.
- `command grep -rnE 'code:(format|lint)' site/src/content/docs/plugins/vwf.md site/src/content/docs/how-to/operate/ad-hoc-change.md .claude/skills/vwf-plugin/references/skills-and-agents.md`
  shows `--all` on each default gate line of the planners.

## Guardrails

- Touch nothing outside the owned paths. Do not edit `site/src/content/docs/plugins/stackgen.md`
  for this change (D7).
- Write all new prose in ASD-STE100.
- `CLAUDE.md` and `readme.md` are dprint-formatted: widening one table cell
  re-pads each row.
- Delete with `rm`, never `git rm`. Do not run `git checkout` or `git restore`.

## Commit

`docs: the default vwf gate lines take --all`
