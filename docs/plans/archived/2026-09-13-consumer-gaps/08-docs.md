# U8 — docs

- **Wave:** 2
- **Depends on:** U1–U7
- **Owns:** `readme.md`, `CLAUDE.md`, `.claude/docs/**`,
  `.claude/skills/vwf-plugin/**`, `.claude/skills/stackgen-plugin/**`,
  `.claude/skills/plugin-authoring/**`, `site/src/content/docs/**`,
  `docs/memory/decisions/2026-09-13-consumer-gaps.md`, every `DOCS FALSIFIED:`
  path U1–U7 returned
- **Model:** opus
- **Read first:** index.md's Goal, reversals and facts; every
  `DOCS
  FALSIFIED:` line from the run log; then each file below before editing
  it.
- **Lazy-load:** `${CLAUDE_PLUGIN_ROOT}/skills/docs-sync/SKILL.md` (the engine);
  `${CLAUDE_PLUGIN_ROOT}/assets/memory.md` (the decision-doc shape); the
  archived `docs/plans/archived/2026-09-13-init-walks-the-members/08-docs.md`
  (the last docs unit's shape, for the decision doc's tone).

## Ruling

Run `vwf:docs-sync` over the run's branch delta and apply its findings, plus
every `DOCS FALSIFIED:` line the earlier units returned, plus the list below
from the survey. Edit only what the change falsified.

The three reversals, to be recorded in
`docs/memory/decisions/2026-09-13-consumer-gaps.md` verbatim from index.md:

1. "Materialization moves from architecture to setup.
   `plugins/vwf/assets/stack-adapter.md:305-309` … and
   `plugins/vwf/skills/architecture/references/stack-menu.md:124-129` place it
   at pin time inside `/vwf:architecture`. Now `/vwf:setup` owns it, as a
   materialize pass that runs on every setup run; architecture only records the
   decision and invokes setup at its end."
2. "Setup writes `unresolved`. `plugins/vwf/assets/vwf-config.md:165` … and
   `plugins/vwf/skills/setup/references/onboard-pipeline.md:72-77` … are
   reversed for one case: an **absent** project axis on a repo architecture has
   not run on. A pinned slug is never rewritten."
3. "The landing consent rule. … The user chose an unattended landing for this
   plan. Recorded as a one-plan override, not as a change to the rule."

And the user's model, quoted in the decision doc: "setup is responsible for
pinning the stack to respective repos; setup is NOT responsible to decide the
stack, that responsibility is with architecture; setup will run before
architecture as well as after (this must be programmed), so the decision of
stack and pinning are covered."

Decisions 1–10 in index.md are the rulings the docs describe; quote a ruling
rather than paraphrasing where a doc states the rule.

## Edits

Surveyed passages, by fact — each is falsified by wave 1 and has this unit as
its owner:

1. **Flutter's platforms are five, `auto` among them, declared beside
   `mobile`.** `site/src/content/docs/how-to/operate/choosing-your-stack.md:45`,
   `site/src/content/docs/how-to/greenfield/ui-with-design-tool.md:81`,
   `site/src/content/docs/plugins/stackgen.md:200,696`,
   `site/src/content/docs/plugins/vwf.md:594,611,1305,1356`,
   `.claude/skills/vwf-plugin/references/docs-tree.md:16`,
   `.claude/skills/plugin-authoring/references/checks.md:253`. The stackgen
   manual's flutter pack row reads `0.3.0` where it names a version.
2. **Commit prefixes are bare `docs:` / `ops:`; the type list is the pack's
   ten.**
   `site/src/content/docs/plugins/vwf.md:1025-1026,1826-1829,2073,2080,2377`,
   `site/src/content/docs/how-to/operate/ad-hoc-change.md:73-75`,
   `.claude/skills/vwf-plugin/SKILL.md:71`.
3. **Architecture decides, setup pins; the invocation carries `repo:`; the chain
   is `setup → product → architecture (→ setup, invoked)`.** `CLAUDE.md:239-274`
   (the workflow paragraph — add the invoked setup and the materialize pass in
   one sentence each; do not restate init's paragraph),
   `site/src/content/docs/plugins/vwf.md:650-652,1220-1223,314-315,1187-1189`,
   `.claude/skills/vwf-plugin/references/skills-and-agents.md:26,28`,
   `.claude/skills/vwf-plugin/references/assets.md:24` (the stack-adapter row),
   `.claude/skills/stackgen-plugin/SKILL.md` (the "one contract vwf holds it to"
   section — the `repo:` line; and wherever it says architecture materializes),
   `site/src/content/docs/plugins/stackgen.md:155`,
   `site/src/content/docs/how-to/greenfield/multi-repo.md` (where it describes
   per-member stack materialization, if it does).
4. **Doctor's new finding and the two-pass.** Where a doc describes doctor's
   blocking kinds or the "run setup again after architecture" sequence:
   `site/src/content/docs/plugins/vwf.md:1182-1185,1194`,
   `site/src/content/docs/how-to/greenfield/single-repo.md:427,435`,
   `site/src/content/docs/how-to/brownfield/migrate-old-vwf-repo.md:99,150`,
   `site/src/content/docs/how-to/brownfield/onboard-existing-codebase.md:375,390`,
   `readme.md:71-77,108-113` — only the lines that state a now-false fact.
5. **The decision doc** `docs/memory/decisions/2026-09-13-consumer-gaps.md` per
   `assets/memory.md`: the three reversals, the user's model, the five gaps in
   one line each with what changed, and the parked plan 2 named as the
   follow-up.
6. Every `DOCS FALSIFIED:` path from U1–U7's reports.

Do not edit any `plugins/**` file — every plugin passage was owned in wave 1; a
plugin passage docs-sync flags is reported as `GAP:` for the orchestrator, not
edited here.

## Verification

- `command grep -rn "four platforms\|blueprint(\|chore(vwf)" readme.md CLAUDE.md .claude/ site/src/content/docs/`
  is empty.
- `command grep -rln "repo: <path>\|materialize pass" .claude/skills/vwf-plugin/ site/src/content/docs/plugins/vwf.md`
  hits at least once each.
- `test -f docs/memory/decisions/2026-09-13-consumer-gaps.md`.
- `mise run p:site:check` green — the manual builds and every link resolves.
- `mise run code:format` and `mise run code:lint` green over the edited files
  (`CLAUDE.md`, `readme.md`, `site/**` **are** dprint-formatted at 80; a table
  cell must not end in a bare `*`).

## Guardrails

- Do not touch `plugins/**`, any version file,
  `.claude-plugin/marketplace.json`, `plugins/stackgen/stacks/inventory.md`
  (U9).
- Do not widen the workflow paragraph in `CLAUDE.md` beyond the two sentences
  the change needs; it was rewritten yesterday.
- Delete with `rm`, never `git rm`. Never `git checkout`, `git restore`,
  `git stash`, or a formatter `--fix` outside Owns.
- Write files with the Write/Edit tools, never a heredoc — `cat` is aliased to
  `bat` on this machine.

## Commit

`docs: consumer gaps — the manual, the repo docs and the decision` — written by
the orchestrator after the wave gate, not by the unit. Bare type.
