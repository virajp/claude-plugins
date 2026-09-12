# U8 — Docs

- **Wave:** 3
- **Depends on:** U1–U7
- **Owns:** `site/src/content/docs/**`, `readme.md`, `CLAUDE.md`,
  `.claude/docs/**`, `.claude/skills/**`,
  `plugins/stackgen/stacks/repo-hygiene/**` (the CONTRIBUTING stub only),
  `docs/memory/decisions/2026-09-12-*.md`, and every path an earlier unit
  reported under `DOCS FALSIFIED:`. Touch nothing outside this list.
- **Model:** opus
- **Read first:** `${CLAUDE_PLUGIN_ROOT}/skills/docs-sync/SKILL.md` (vwf's),
  then every `DOCS FALSIFIED:` line the orchestrator passes in, then the survey
  list below.
- **Lazy-load:**
  `docs/memory/decisions/2026-09-06-init-owns-the-first-commit.md` for the
  decision you are superseding; `${CLAUDE_PLUGIN_ROOT}/assets/memory.md` for the
  decisions-doc shape.

## Ruling

Quoted from index.md:

> **Reversal, confirmed by the user 2026-09-12:** decision D17 of
> `2026-09-06-init-owns-the-first-commit` had `init` ask the forge default and
> run `mise run setup:default-branch <answer>` so that `init` names no forge.
> Now `init`'s git pass ends at the `develop`/`main` pair and the first push; it
> never touches the remote's settings. The repo-hygiene pack's CONTRIBUTING stub
> carries the forge one-liner (a pack may name `gh`/`glab`; vwf prose may not).
> The docs unit writes the decisions doc for this.

> **10.** … the repo-hygiene CONTRIBUTING stub gains one line telling a
> maintainer to set the forge default branch by hand, showing the `gh` and
> `glab` forms.

Plus rulings 1–9 and 11–13 as the facts the docs now state.

## Edits

1. Run `vwf:docs-sync` over the run's branch delta; apply its findings.
2. Apply every `DOCS FALSIFIED:` line from U1–U7.
3. The survey's list, whether or not docs-sync finds each:
   - `site/src/content/docs/plugins/stackgen.md` — `:547` (the `code/*`
     enumeration; no new names, but say the three gate tasks take a file list
     and the hooks call them), `:552-556` (`code:all`), `:557-563` (merge tasks:
     `MERGE_MODEL`, both modes), `:570-573` (`setup:all` order without
     default-branch; `setup:ai` line unchanged), `:588-589` (delete the
     `setup:default-branch` bullet), `:695-712` (legacy table: no row change;
     confirm), and wherever the page describes the pre-commit pack's shipped
     hooks or a language pack's fragment.
   - `site/src/content/docs/plugins/vwf.md` — `:960` (init no longer sets the
     forge default; the git pass ends at the pair and the push; `MERGE_MODEL`
     asked in that step), `:1992` (merge tasks obey `MERGE_MODEL`; git-workflow
     offers the PR path), and wherever the page restates "merge, not PRs".
   - `readme.md`, `CLAUDE.md`, `.claude/docs/repo-shape.md`,
     `.claude/skills/stackgen-plugin/**`, `.claude/skills/vwf-plugin/**` — grep
     for `default-branch`, `merge:develop`, `merge:main`, `pre-commit`,
     `formatter` hook, `gitleaks` hook and reconcile each passage.
   - `plugins/stackgen/stacks/repo-hygiene/repo-hygiene/config/CONTRIBUTING.md:27`
     — after the merge-task sentence, one sentence on `MERGE_MODEL`, and one
     line: the forge's default branch is set once by hand,
     `gh repo edit
     --default-branch <branch>` or
     `glab repo update --defaultBranch <branch>`. This file is payload: no
     plugin-path citation.
4. **Decisions doc**
   `docs/memory/decisions/2026-09-12-task-library-configures-each-gate-once.md`
   per `assets/memory.md`: the one-configuration-per-tool rule, the three hook
   ids, the file-list contract, `MERGE_MODEL`, `MEMBERS`, and the D17 reversal
   named as a reversal with the reason ("a one-time act is not a task a machine
   re-runs; the forge line lives in the hygiene pack, which may name a tool").

## Verification

- `grep -rn 'default-branch' site/src/content/docs readme.md CLAUDE.md .claude`
  returns only the CONTRIBUTING-style "set by hand" mentions, if any.
- `grep -rn 'not PRs' site/src/content/docs .claude plugins/vwf` is empty.
- `mise run p:site:check` green (build plus link checker over HTML and the
  markdown mirror).
- `mise x -- mise run code:precommit` twice, clean on the second (the formatter
  reflows `site/**/*.md`, `readme.md`, `CLAUDE.md`; `plugins/**/*.md` by hand).
- `test -f docs/memory/decisions/2026-09-12-task-library-configures-each-gate-once.md`.

## Guardrails

- Do not touch version files, generated files, or `pack.yaml` (U9).
- Do not touch `plugins/**` outside the repo-hygiene CONTRIBUTING stub.
- Site frontmatter is strict YAML with `title`, `description`, `order`; do not
  add or remove keys.
- Relative `.md` links only inside the site collection; anything outside is an
  absolute GitHub URL.
- Delete with `rm`, never `git rm`.
- Widening a table cell in `CLAUDE.md` or `readme.md` re-pads every row
  (dprint); that is fine, let the formatter do it.

## Commit

`docs: the task library configures each gate once, the hooks call it, and init leaves the forge alone`
— written by the orchestrator after the wave gate. Type `docs`; no scope.
