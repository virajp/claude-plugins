# U5 — Docs

- **Read first:** `plugins/vwf/skills/docs-sync/SKILL.md`, then each owned
  file's passages that the facts section lists.

## Ruling

> - D3: plan-management claim sets run to {"worktree": ".worktrees/<name>",
>   "log": "~/Library/Caches/vwf/<repo>/<folder basename>.jsonl"} in the
>   folder's index.json, in the claim commit, with one plan.mjs set --json.
>   <name> is the plan's name (the branch and worktree name /vwf:execute
>   uses); <repo> is the repo name log.mjs derives. The ~ is literal: no home
>   path is committed, and VWF_LOG_ROOT does not change the committed value.
>   This reverses the rule 'the index row is the one edit the run makes in
>   the main checkout' (approved 2026-10-24).
> - D25: Add mise x -- mise run p:site:check to the plan gate (astro check,
>   the build and the link checker). U5 keeps the heading 'The action log'
>   of site/src/content/docs/plugins/vwf.md, so the anchor #the-action-log
>   that plugins/mempalace.md:102 links to stays.

## Edits

1. Run `vwf:docs-sync` over the run's branch delta. Apply its findings and
   every `DOCS FALSIFIED:` line that U1, U2 and U3 returned.
2. Reconcile the passages the facts section lists: `CLAUDE.md` (`:60-63`,
   `:261`, `:373-374`; the hooks paragraph names the `SessionEnd` hook),
   `.claude/skills/vwf-plugin/SKILL.md` (`:69-91`, `:364`, `:401-423`),
   `.claude/skills/vwf-plugin/references/docs-tree.md`, `assets.md`,
   `skills-and-agents.md`, `.claude/docs/repo-shape.md:271-272`,
   `site/src/content/docs/plugins/vwf.md` (the action log `:3115-3150`, the
   claim, unclaim, archive and report passages),
   `site/src/content/docs/how-to/operate/ad-hoc-change.md` and
   `how-to/greenfield/single-repo.md:324`. Every `/tmp/vwf` mention becomes
   `~/Library/Caches/vwf/<repo>/<folder>.jsonl`.
3. Write `docs/memory/decisions/2026-10-25-action-log-per-plan.md` per
   `plugins/vwf/assets/memory.md`: every ruling of the `decisions` list of `index.json`, in short, and the
   reversal of D3 with the user's approval date, 2026-10-24.

## Verification

- `grep -rn '/tmp/vwf/' CLAUDE.md .claude site/src/content/docs plugins/vwf`
  prints nothing. (The trailing slash leaves out
  `plugins/vwf/agents/execute-coder.md`, whose `/tmp/vwf-coder-test.log` is
  another path and stays.)
- `mise x -- mise run code:format` and `mise x -- mise run code:lint` are
  green.

## Guardrails

- Touch nothing outside the owned paths.
- `CLAUDE.md` and `site/**` are dprint-formatted: do not end a table cell in
  a bare `*`.
- Never use `cat >` heredocs to write files; use Write or Edit.

## Commit

`docs: the action log moves to one file per plan in Library/Caches`
