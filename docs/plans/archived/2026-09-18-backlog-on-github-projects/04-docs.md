# U4 — Docs

- **Wave:** 3
- **Depends on:** U2, U3
- **Owns:** `readme.md`, `.claude/skills/vwf-plugin/**`,
  `site/src/content/docs/plugins/vwf.md`,
  `site/src/content/docs/how-to/operate/ad-hoc-change.md`,
  `site/src/content/docs/how-to/operate/production-feedback-loop.md`,
  `docs/memory/decisions/2026-09-18-backlog-on-github-projects.md` (new)
- **Model:** opus
- **Kind:** edit
- **Read first:** `${CLAUDE_PLUGIN_ROOT}/skills/docs-sync/SKILL.md`; the
  committed `plugins/vwf/skills/backlog/SKILL.md` and `references/github.md`;
  the plan's Facts section (the passage list); every `DOCS FALSIFIED:` line
  U1–U3 returned; `docs/memory/decisions/2026-09-18-plan-management.md` and
  `2026-09-13-vwf-process.md` (the decision-doc shape, and the ruling this plan
  reverses); `plugins/vwf/assets/memory.md` (the decision-doc rules).
- **Lazy-load:** `site/CLAUDE.md` (the link rule and the gate) before touching a
  heading or an anchor in `vwf.md`.

## Ruling

The Goal's reversal, quoted:

> The 2026-09-13-vwf-process decision (ruling 3) rejected a mempalace room as
> the store because "a backlog that exists only in memory is one an offline
> session cannot read". A GitHub Project has the same property — it needs
> network and a `project`-scoped `gh` token — and this plan accepts it with **no
> file fallback** …

Decisions 1, 2, 5, 7, 9 and 10 as the content the docs now describe (quoted in
full in `01-skill.md` and `03-doctor.md`; the docs restate what a user sees,
never the procedure).

## Edits

1. **Run `vwf:docs-sync`** over the branch delta (waves 1–2) and apply its
   findings, plus every `DOCS FALSIFIED:` line, plus the survey's list:
2. **`readme.md:242-244`** — `/vwf:backlog` is the sole writer of the backlog
   project on the repo's forge; no path.
3. **`.claude/skills/vwf-plugin/references/docs-tree.md:47,56-60`** —
   `docs/backlog.md` leaves the docs tree; the backlog is the forge project, one
   per product, named for the base repo; callers unchanged.
   **`references/skills-and-agents.md:35,36,39,45,46`** — the backlog row and
   the four rows that mention it. Check `SKILL.md` for a count or a sentence
   that names the file.
4. **`site/src/content/docs/plugins/vwf.md`** — `:405-410` (docs-tree entry
   goes; a one-line note that the backlog lives on the forge); `:819` (command
   table cell); `:1890-1893`, `:1903-1905` (plan hand-off: the verb, no file
   staged); `:1946` (index columns: ids of the project's items); `:2191-2192`
   (execute landing); `:2262-2263`, `:2271`, `:2286` (plan-management);
   `:2335-2338` (feedback boundary); **`:2410-2463`, the `### /vwf:backlog`
   section, rewritten**: what the backlog is; where it lives (a GitHub Project
   titled with the base repo's name under its account); what the user needs
   (`gh`, logged in, `project` scope — and that `/vwf:doctor` reports it); the
   item shape (`Bnn — title` draft issues; Status Todo / In Progress / Done /
   Closed; Priority P0–P2; Group); the seven verbs with the examples at
   `:2424-2427` updated; the first-run experience — `add` asks consent and hands
   over the browser with the Team planning template, then continues; the GitLab
   line — detected, not yet supported; and the no-fallback sentence, plainly.
   `:2480`, `:2544`, `:2563-2566` (change-plan). Keep every heading's anchor —
   `#vwfbacklog` is linked from elsewhere and `p:site:check` fails a dangling
   fragment.
5. **`site/src/content/docs/how-to/operate/ad-hoc-change.md:68-70,154-155,233,279`**
   — the file → the project; the hand-off no longer stages a backlog file.
6. **`site/src/content/docs/how-to/operate/production-feedback-loop.md:300-307`**
   — "Deferring is not a backlog" names the project, not a file.
7. **`docs/memory/decisions/2026-09-18-backlog-on-github-projects.md`** — new,
   in the shape of `2026-09-18-plan-management.md`: header line with date,
   branch, plan link, **Reverses** `2026-09-13-vwf-process.md` ruling 3's
   offline argument, **Backlog** none; what prompted it (the user's request and
   the GitLab addition, verbatim where the plan quotes it); what changed; the
   rulings with what each rejected (decisions 1–10, 12–15 of the plan's table,
   condensed); the GitLab shape as parked; what stays outside.

## Verification

- `grep -rn 'docs/backlog' readme.md .claude/skills/vwf-plugin site/src/content/docs`
  returns nothing.
- `grep -n '^### /vwf:backlog' site/src/content/docs/plugins/vwf.md` still hits
  exactly once.
- `grep -n 'Team planning' site/src/content/docs/plugins/vwf.md` hits.
- `test -f docs/memory/decisions/2026-09-18-backlog-on-github-projects.md`.
- `mise run p:site:check` green (the link checker over the rebuilt site).
- `mise run code:precommit` green.

## Guardrails

- Touch nothing outside the owned paths — not `plugins/**` (report a falsified
  passage there as `UNRESOLVED:` naming the owning unit), not `CLAUDE.md` (names
  the backlog nowhere; confirm with grep and leave it), not `docs/backlog.md`
  (U5 deletes it), not `docs/memory/decisions/2026-09-13-vwf-process.md` or any
  other historical decision or handoff.
- `readme.md`, `site/**` and `docs/**` **are** dprint-formatted at width 80;
  `.claude/**` markdown too — let the pre-commit pass re-pad tables, do not
  hand-align.
- No escaped backtick inside a code span; no code span starting with `##`; no
  table cell ending in a bare asterisk.
- Never fake an anchor; re-point links, keep headings.
- Delete nothing; `rm` nothing.

## Commit

`docs: backlog on GitHub Projects — the manual, the repo docs and the decision`
— written by the orchestrator after the wave gate. `docs` is in
`.config/git-conventional-commits.yaml`.
