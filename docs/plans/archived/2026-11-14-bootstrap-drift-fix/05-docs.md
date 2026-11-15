# U5 — Docs

- **Read first:** the branch delta of wave 1, then each passage named below.
- **Lazy-load:** `${CLAUDE_PLUGIN_ROOT}/skills/docs-sync/SKILL.md`.

## Ruling

D30, the user's answer to a rulings-review gap, verbatim. It narrows D23:

> Say tracked files only (Recommended): The rewrite says: it runs every hook
> over every file git tracks, with no flag; a new file is checked once it is
> `git add`-ed, or by the commit hook at commit. The clause "nothing has to be
> staged" is corrected to match.

D5, the user's answer, verbatim:

> Update docs; you edit tasks (Recommended): P0 changes the docs to
> `[tools.git.branch.main]`. The plan's index.md lists the four task files and
> `.config/bootstrap.toml` as a hand step for you, so the docs and the tasks
> match once you edit them.

D8: the plan gate is `mise x -- mise run code:precommit`, with no `--all`.

D17, the user's answer to a rulings-review gap, verbatim:

> Own all .claude docs (Recommended): Widen U5's owns to `.claude/docs/**` and
> `.claude/skills/**`, which S1 already gives it. U5 can then fix any falsified
> passage there. No other unit edits those trees.

D18, the user's answer to a rulings-review gap, verbatim:

> Rewrite the reason (Recommended): U5 rewrites the sentence the same way U4
> rewrites gates-consent.md and plan-doc.md: the plan gate runs the full hook
> pass over every file, because the task always runs pre-commit with
> --all-files and takes no flag. The same applies to any such sentence in
> ad-hoc-change.md.

D19, the user's answer to a rulings-review gap, verbatim:

> dprint on owned files (Recommended): U5 may run `mise x -- dprint fmt <file>`
> on each file it changed, never on the whole tree and never
> `code:format --fix`. Then the unit gate must pass.

D23, the user's answer to a rulings-review gap, verbatim:

> U1 and U5 rewrite (Recommended): U1 rewrites SKILL.md:156-158 and U5 rewrites
> vwf.md:3796-3797: code:precommit runs every hook over every file of the tree,
> with no flag. Nothing else in those passages changes.

D29, the user's answer to a rulings-review gap, verbatim:

> Precedent, keep name (Recommended): Follow the precedent's words: the first
> line says "resolved 2026-11-14 by 2026-11-14-bootstrap-drift-fix (B118)" in
> place of "open" and "| not fixed". Keep the file name, so the link in the
> archived plan still works.

D22, the user's answer to a rulings-review gap, verbatim:

> U5 owns it (Recommended): Add CONTRIBUTING.md to U5's owns and to K2's scan.
> U5 changes it to `[tools.git.branch.<branch>]`, the same as CLAUDE.md (D5).

D20, the user's answer to a rulings-review gap, verbatim:

> Name bootstrap init (Recommended): Any prose that names the migration says
> "run bootstrap init", the words bootstrap itself prints. D4's ruling (new key
> only) does not change.

## Edits

1. Run `vwf:docs-sync` over the run's branch delta, and apply its findings plus
   every `DOCS FALSIFIED:` line that wave 1 returned.
2. The passages the survey found, each changed to the current name:
   - `CLAUDE.md` lines 310 and 314: `[branch.<branch>]` and `[branch.main]`
     become `[tools.git.branch.<branch>]` and `[tools.git.branch.main]`.
   - `CONTRIBUTING.md` (the repo root's) line 30: the same (D22).
   - `.claude/docs/ci-and-releases.md` lines 38 and 59: the same.
   - `.claude/skills/release/SKILL.md` line 141: the same.
   - `.claude/skills/vwf-plugin/SKILL.md` line 184 and
     `.claude/skills/vwf-plugin/references/skills-and-agents.md` line 29: the
     same.
   - `.claude/skills/stackgen-plugin/SKILL.md` line 123: "a fresh shallow
     clone" becomes a blobless clone (`--filter=blob:none`); line 125:
     `add tools` becomes `add`.
   - `site/src/content/docs/plugins/vwf.md` lines 1152 and 3802: the
     `[branch.*]` names; line 3481: `code:precommit --all` becomes
     `code:precommit`, and the reason at lines 3483-3484 is rewritten per
     D18; lines 3796-3798 are rewritten per D23 and D30; line 1392: "its `remove tools` instruction" becomes
     "its `bootstrap: remove […]` instruction".
   - `site/src/content/docs/plugins/stackgen.md` line 678: `add tools` becomes
     `add`.
   - `site/src/content/docs/how-to/operate/ad-hoc-change.md` line 120:
     `code:precommit --all` becomes `code:precommit`.
3. **`docs/memory/gaps/2026-11-06-gate-line-all-flag-undeclared-open.md`**:
   per D29, keep the file name. In the first record line, replace `open` and
   the trailing `| not fixed` with
   `resolved 2026-11-14 by 2026-11-14-bootstrap-drift-fix (B118)`, the words
   of the precedent `2026-11-06-release-target-below-manifest-resolved.md`.
   Replace the closing "Open:" paragraph with: "Resolved: the planners and the
   template write `code:precommit` with no flag, and the planners read the
   task list with `mise tasks ls --hidden`."

## Verification

- `mise x -- mise run code:format` passes.
- K2 of the plan's `gates.keeps` finds no hit in the owned docs.

## Guardrails

- Touch nothing outside the owned paths.
- `CLAUDE.md`, `readme.md` and the site pages are dprint-formatted: widening a
  table cell re-pads every row. A table cell that ends in `*` oscillates
  between the formatter and the linter: avoid it.
- Do not edit `.config/` files: they are the user's hand step.
- Delete with `rm`, never `git rm`.

## Commit

`docs: name bootstrap's current keys, verbs and plan gate line`
