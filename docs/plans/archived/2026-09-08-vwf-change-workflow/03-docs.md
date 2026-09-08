# U3 — docs: the manual, a how-to, the repo's own maps

- **Wave:** 3
- **Depends on:** U1, U2
- **Owns:** `readme.md`, `CLAUDE.md`, `site/src/content/docs/plugins/vwf.md`,
  `site/src/content/docs/how-to/operate/ad-hoc-change.md` (new),
  `site/src/content/docs/how-to/index.md`, `.claude/docs/plugins.md`,
  `.claude/skills/vwf-plugin/SKILL.md`,
  `.claude/skills/vwf-plugin/references/skills-and-agents.md`
- **Model:** opus
- **Read first:** the cited lines of every owned file below; the wave 1–2 diff
  (`git diff <integration>..HEAD -- plugins/vwf/skills/change-plan
  plugins/vwf/skills/change-execute plugins/vwf/skills/blueprint-authoring`)
  once, to describe what landed rather than what was planned; the two new
  `SKILL.md` frontmatters, so the manual quotes the real descriptions.
- **Lazy-load:** `site/CLAUDE.md:48-61` (the link rule, anchors, em-dashes);
  `site/src/content.config.ts:15-19` (the required frontmatter);
  `site/src/nav.ts:44-55` (how `order` places a page); the three existing pages
  under `site/src/content/docs/how-to/operate/` (their `order` values and
  voice).

## Ruling

The user's request:

> I like the repo-level `create-plan` and `execute-plan` skills. These are good
> for adhoc work which don't really follow vwf process of blueprint. There are
> times where adhoc work is required to be done which has nothing to do with the
> project so let's add both of these to `vwf`

From index.md's assumed decisions, verbatim:

> **10.** `change-plan`: user **and** model (`disable-model-invocation: false`,
> no `user-invocable`). `change-execute`: user-only
> (`disable-model-invocation: true`) — it must start a fresh session, which only
> the user can guarantee.

> **11.** Both `model: opus`, `effort: high`, as every other vwf workflow skill.

> **15.** `vwf.md`: two command rows, the invocation and tiering prose, two
> `###` sections placed after the `verify`/`feedback` sections, one sentence in
> the walkthrough saying ad-hoc work sits beside the chain, and the "vwf skills"
> section. Plus one how-to page
> `site/src/content/docs/how-to/operate/ad-hoc-change.md` (plan, execute,
> resume). The mermaid graph is **not** changed — the pair is outside the chain
> by definition.

The tension index.md names, to be stated in the manual's invocation prose: the
pair adds two user-invocable skills; both must be user-typed, and only
`change-execute` is hidden from the model.

## Edits

The orchestrator dispatches the `docs-reconciler` agent with the wave 1–2 diff
first and hands this unit its findings, plus every `DOCS FALSIFIED:` line U1 and
U2 returned. Apply those, and the survey's list:

1. **`site/src/content/docs/plugins/vwf.md`.**
   - `:719-740` the command table: two rows, `/vwf:change-plan` and
     `/vwf:change-execute`, in the table's existing column shape, placed after
     the last workflow row (`feedback` or `verify`, whichever the table ends
     on). Descriptions from the real frontmatter, shortened to the table's
     length.
   - `:742-757` invocation prose: add `change-execute` to the user-only list
     with its reason (fresh session); say `change-plan` stays model-invocable
     for a future hand-off.
   - `:759-768` tiering: both on opus, effort high.
   - `:779-1765` per-skill sections: two new `### /vwf:change-plan` and
     `### /vwf:change-execute` sections **after** the `verify` and `feedback`
     sections, each with: what it is for (an ad-hoc change with no blueprint
     slice — tooling, CI, docs, a refactor, a repo the blueprint does not
     describe), the argument, the procedure at the manual's usual depth (recall
     → survey → scope check → one-question interview → wave gate and
     after-landing steps → the hard gate → the folder; and: refuse early → one
     worktree → preflight from the plan's Wave gate → waves with review and a
     commit per green unit → the fixed docs and gates units → land → `run` steps
     → one question for `ask` steps), the plan-folder shape
     (`docs/plans/<date>-<name>/index.md`, `type: vwf-change-plan`, one file per
     unit; archived to `docs/plans/archived/` by change-execute), what blocks
     and how a re-run resumes, and how it relates to `/vwf:plan` and
     `/vwf:execute` (a blueprint slice goes there; this pair never reads the
     blueprint). Heading anchors will be `#vwfchange-plan` and
     `#vwfchange-execute` — link to them from the table rows if the other rows
     link.
   - `:304-330` the walkthrough: one sentence — work with no blueprint slice
     does not enter this chain; it is `/vwf:change-plan` then
     `/vwf:change-execute`, linked to the sections.
   - `:1926-1992` the "vwf skills" section: the pair under workflow skills;
     `:1730` (docs-sync covering ad-hoc work) and `:213`, `:306`, `:1990` — read
     each; where "ad-hoc" now has a command, name it.
   - The mermaid graph `:268-282` is **not** edited.
2. **`site/src/content/docs/how-to/operate/ad-hoc-change.md`** (new).
   Frontmatter exactly `title`, `description`, `order` — `order` one past the
   highest existing `operate/` page. Body: when to use the pair rather than a
   blueprint slice; a worked walk — `/vwf:change-plan <request>`, the interview
   (one question at a time; the wave gate and after-landing steps confirmed from
   the repo's own tasks), approve, the launch line; a fresh session,
   `/vwf:change-execute docs/plans/<date>-<name>`, what the final report shows,
   the `ask` stop; resume after a block (fix the ruling in `index.md`, re-run
   the same command). Links are relative `.md` inside the collection
   (`site/CLAUDE.md:48-52`). No em-dashes are required to be removed from
   markdown, but match the operate pages' voice.
3. **`site/src/content/docs/how-to/index.md:64`** — if the page lists the
   operate guides by hand, add the new one; if the list is generated from
   `order`, no edit (`nav.ts:44-55`).
4. **`readme.md:212-223`** — the vwf entry: one sentence that vwf also carries
   an ad-hoc pair for work outside the blueprint, naming the two commands. `:66`
   only if it enumerates commands.
5. **`CLAUDE.md`.** `:217` the vwf row in the Plugins table: add "and the ad-hoc
   `change-plan` / `change-execute` pair" to the cell — the cell is wide and
   dprint re-pads the table; let it. `:226-240` the workflow sentence: after
   "with `verify` and `feedback` closing the loop", one clause — "and
   `change-plan` → `change-execute` beside the chain for work with no blueprint
   slice". `:48-50` and `:64-65`, `:77-78` (the repo's own `/create-plan`,
   `/execute-plan` rows) are **unchanged** — the second plan retires them.
6. **`.claude/docs/plugins.md:12`** — the vwf inventory row gains the pair.
7. **`.claude/skills/vwf-plugin/SKILL.md`.** `:55-60` the ordering line: one
   clause that the change pair sits beside the chain. `:124-145` the invocation
   table: no new mode; add, in the prose under it, that `change-execute` is a
   user-only skill and why, and `change-plan` is user-and-model.
8. **`.claude/skills/vwf-plugin/references/skills-and-agents.md:20-39`** — two
   rows in the workflow-skill table, the two-column shape indented under the
   `skills/` bullet: name, one line, invocation mode. `:8-18` if it counts the
   user-only skills.
9. **No decisions doc** — this plan reverses nothing.

## Verification

- `mise run site:check` green — `astro check`, the build, the link checker over
  `dist/**/*.html` and the markdown mirror; a missing `order` fails the build
  loudly.
- `pnpm exec dprint check` over every owned root doc and `.claude/**` file
  touched (they **are** dprint's).
- `grep -n 'change-plan\|change-execute' readme.md CLAUDE.md .claude/docs/plugins.md .claude/skills/vwf-plugin/SKILL.md .claude/skills/vwf-plugin/references/skills-and-agents.md`
  → at least one hit per file.
- `grep -c '^### /vwf:change-' site/src/content/docs/plugins/vwf.md` → `2`;
  `grep -c '/vwf:change-' site/src/content/docs/plugins/vwf.md` ≥ 6.
- `command ls site/src/content/docs/how-to/operate/ad-hoc-change.md` exists;
  `grep -c '^order:' …/ad-hoc-change.md` → `1`.
- `git diff --stat -- 'site/src/content/docs/plugins/vwf.md'` shows no change
  between `:268-282` (the graph):
  `git diff -U0 -- site/src/content/docs/plugins/vwf.md | grep -c 'graph\|-->'`
  → `0`.
- `mise run plugins:check` still green (nothing under `plugins/` touched).

## Guardrails

- Touch nothing under `plugins/`, `scripts/`, `installer/`; nothing under
  `docs/plans/`; no `plugin.json`, no generated file, no `site/package.json`.
- Do **not** edit `CLAUDE.md:48-50`, `:64-65`, `:77-78`, `:281` or
  `.claude/skills/release/SKILL.md` — the second plan owns the retirement.
- Never run `git checkout`, `git restore`, `git stash`, or any formatter or
  linter with `--fix` on a path outside your Owns.
- Describe what waves 1–2 **landed**, from the diff, not what the plan said;
  report a difference as a `GAP:`.
- `readme.md` is lowercase (`2026-09-05-readme-is-lowercase.md`).
- Relative `.md` links only inside the collection; heading anchors are
  load-bearing (`site/CLAUDE.md:48-57`).
- Write with Write/Edit, never `cat` heredocs; never a `git commit -m` body with
  backticks.

## Commit

`docs(vwf): the change-plan / change-execute pair — manual, how-to, repo maps` —
written by the orchestrator after the wave gate, not by the unit.
