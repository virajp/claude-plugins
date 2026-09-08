# U2 — docs: CLAUDE.md and the CI doc point at the vwf pair; the reconciler goes

- **Wave:** 2
- **Depends on:** U1
- **Owns:** `CLAUDE.md`, `.claude/docs/ci-and-releases.md`, `readme.md`
  (expected untouched), `site/src/content/docs/**` (expected untouched); delete
  `.claude/agents/docs-reconciler.md`
- **Model:** opus
- **Read first:** `CLAUDE.md:40-80` and `:275-285`,
  `.claude/docs/ci-and-releases.md:55-70`; the wave-1 diff
  (`git diff <develop>..HEAD -- .claude/`) once.
- **Lazy-load:** `site/src/content/docs/plugins/vwf.md` — only to confirm the
  two anchors `#vwfchange-plan` and `#vwfchange-execute` exist (plan 1's docs
  unit wrote them) and the how-to page path
  `site/src/content/docs/how-to/operate/ad-hoc-change.md`.

## Ruling

From index.md's assumed decisions, verbatim:

> **1.** Deleted. `vwf:docs-sync` and its surveyor take over the docs unit; the
> surface-ownership knowledge it carried is already `CLAUDE.md`'s "Docs ship
> with the change" rule.

> **2.** The **docs unit**, after the orchestrator has dispatched the agent for
> this run's findings — so this run still gets its reconciliation and the file
> is gone in the same commit as the docs that stop naming it.

> **4.** The two rows and their link definitions are **replaced** by one row
> pointing at the vwf manual's sections for the pair
> (`site/src/content/docs/plugins/vwf.md` anchors `#vwfchange-plan`,
> `#vwfchange-execute`) and the how-to page — an absolute GitHub URL is not
> needed; a repo-relative path is the table's convention.

> **5.** `CLAUDE.md:48-50` reads: a change to this repo is planned with
> `/vwf:change-plan` and run, in a fresh session, with
> `/vwf:change-execute <folder>`; each plan folder carries this repo's gate
> lines, `mise run plugins:local` as a `run` step and `/release` as an `ask`
> step. One sentence, not a paragraph.

> **6.** Untouched: `docs/plans/archived/**`, `docs/memory/**`.

## Edits

The orchestrator dispatches the `docs-reconciler` agent with the wave-1 diff
**first** and hands this unit its findings plus every `DOCS FALSIFIED:` line U1
returned. Apply those, and the list below; delete the agent file **last**.

1. **`CLAUDE.md:48-50`.** Per decision 5. The clause "`release`, `create-plan`
   and `execute-plan` are slash commands" → "`release` is a slash command; a
   change to this repo is planned with `/vwf:change-plan` and run, in a fresh
   session, with `/vwf:change-execute <folder>` — each plan folder carries this
   repo's gate lines, `mise run plugins:local` as a `run` step and `/release` as
   an `ask` step".
2. **`CLAUDE.md:64-65`** — the two "Where the detail lives" rows → one row per
   decision 4: *Read* `site/src/content/docs/plugins/vwf.md#vwfchange-plan` (and
   the how-to at `site/src/content/docs/how-to/operate/ad-hoc-change.md`); *For*
   "planning and running a change to this repo with the vwf pair — the
   interview, the folder, waves, the gate, after-landing steps". Use a new
   reference-link label (e.g. `[chg]`) in the file's existing style.
3. **`CLAUDE.md:77-78`** — remove `[cp]:` and `[ep]:`; add the new definition
   beside the others. dprint re-pads the table — let it, on this file only.
4. **`CLAUDE.md:281`** — "`/execute-plan` runs it unprompted at the end of a
   green run" → "`/vwf:change-execute` runs it as the plan's after-landing `run`
   step". Keep the surrounding sentence.
5. **`.claude/docs/ci-and-releases.md:62`** — the same replacement as 4.
6. **`readme.md`, `site/src/content/docs/**`** — expected untouched (the survey
   found no mention); apply only what the reconciler or a `DOCS FALSIFIED:` line
   names.
7. **Delete `.claude/agents/docs-reconciler.md`** — last, after every edit
   above, with `git rm`.
8. **No decisions doc** — nothing reversed.

## Verification

- `grep -rn 'create-plan\|execute-plan\|docs-reconciler' CLAUDE.md readme.md .claude/docs/ .claude/skills/ .claude/agents/ site/src/content/docs/`
  → nothing.
- `grep -n '\[cp\]\|\[ep\]' CLAUDE.md` → nothing; every `[label]:` definition in
  `CLAUDE.md` is referenced at least once and every `[…][label]` has a
  definition (`pnpm exec markdownlint-cli2 CLAUDE.md` is what pre-commit runs).
- `command ls .claude/agents/` → `target-verifier.md` present,
  `docs-reconciler.md` absent.
- `pnpm exec dprint check CLAUDE.md .claude/docs/ci-and-releases.md` green.
- `mise run plugins:check` still green.

## Guardrails

- Touch nothing under `plugins/`, `scripts/`, `installer/`, `docs/`; not
  `.claude/skills/**` (U1's); not `.claude/agents/target-verifier.md`.
- Never run `git checkout`, `git restore`, `git stash`, or any formatter or
  linter with `--fix` on a path outside your Owns.
- Delete the reconciler **after** the orchestrator has dispatched it — the unit
  prompt will say the findings are in hand; if it does not, return
  `UNRESOLVED: reconciler findings not received` rather than deleting.
- `readme.md` is lowercase.
- Write with Write/Edit, never `cat` heredocs; never a `git commit -m` body with
  backticks.

## Commit

`docs: this repo plans with /vwf:change-plan — retire docs-reconciler` — written
by the orchestrator after the wave gate, not by the unit.
