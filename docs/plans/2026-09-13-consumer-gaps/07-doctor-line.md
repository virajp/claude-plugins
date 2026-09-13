# U7 — doctor names "pinned, not materialized"

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/vwf/skills/doctor/SKILL.md`,
  `plugins/vwf/skills/doctor/references/stack-checks.md`
- **Model:** opus
- **Read first:** every owned file, top to bottom, before editing.
- **Lazy-load:** `plugins/vwf/assets/stack-adapter.md:284-320` (the materialized
  variant and `language_facts` — read, never edit);
  `plugins/vwf/assets/vwf-config.md:140-178` (the axis states — read, never
  edit).

## Ruling

Decision 10: ""pinned, not materialized — `/vwf:setup` materializes it": one
distinct finding for a project whose `template` is a slug, whose adapter is a
materializing one, and whose target repo has no materialized entry. Still
**blocking** — "the severity follows the pin, never the calendar" stands.
Reached only after a declined landing or on a repo setup has not re-run on.
`unresolved` stays a degradation."

Decision 5 (how doctor finds the target repo): "the member's `path` relative to
the base root, resolved as the member whose `projects:` lists the project;
absent means the current repo."

The user's model: "setup is responsible for pinning the stack to respective
repos; setup is NOT responsible to decide the stack, that responsibility is with
architecture."

## Edits

1. **`plugins/vwf/skills/doctor/references/stack-checks.md`** —
   - The conditional-severity table (`:29-35`): add a row "**pinned, not
     materialized** (§3) | that project's `template` is a slug, the adapter
     materializes, and the target repo's `.claude/stackgen/lock.yaml` does not
     name the slug | blocking — remedy `/vwf:setup` (its materialize pass) |
     never a degradation". Keep `:34` "The severity follows the pin, never the
     calendar" verbatim.
   - The unknown-language check (`:59-66`, anchor "No installed plugin declares
     the token and no materialized facts cover it"): before it reports **unknown
     language**, check the state above first — when the pin is a slug and no
     materialized entry exists in the **target repo** (resolved per decision 5:
     the member whose `projects:` lists the project, else the current repo),
     report "pinned, not materialized — `/vwf:setup` materializes it" **instead
     of** unknown language, since the languages are not unknown, they are
     unread. Name the repo in the finding.
   - The materialized-escape read (`:47-49`): say which repo's `.claude/` tree
     it reads — the target repo's.
   - Add nothing about `auto`; the platform-coverage check (`:190-193`) is
     satisfied by U1's bundle edit and is not touched.
2. **`plugins/vwf/skills/doctor/SKILL.md`** —
   - `:60-64` "**Unavailable ≠ missing ≠ unknown.**": add the fourth word in one
     sentence — *not materialized*: the pin exists, the adapter never landed it
     here; blocking, and the remedy is `/vwf:setup`, not `/vwf:architecture`.
   - The report-kinds prose (`:178-196`): list the new finding beside the
     unknown-language one, with its remedy line.
   - Wherever doctor's remedy text today says the fix for an unmaterialized pin
     is `/vwf:architecture`, change it to `/vwf:setup` — architecture decides,
     setup pins.

## Verification

- `command grep -n "pinned, not materialized" plugins/vwf/skills/doctor/SKILL.md plugins/vwf/skills/doctor/references/stack-checks.md`
  hits in both.
- `command grep -n "severity follows the pin, never the calendar" plugins/vwf/skills/doctor/references/stack-checks.md`
  hits once, unchanged.
- `mise run p:plugins:check` green (rule 4, rule 10, rule 12).
- The orchestrator's fixture step 5 (the decline) reports this finding as
  blocking — index.md, "Gates the orchestrator keeps".

## Guardrails

- Do not touch `plugins/vwf/skills/setup/**` (U5), `plugins/vwf/assets/**` (U4),
  `plugins/stackgen/**` (U1, U6).
- The six shape predicates (`:233-345`) are another plan's; do not edit them.
- Delete with `rm`, never `git rm`. Never `git checkout`, `git restore`,
  `git stash`, or a formatter `--fix` outside Owns.
- `plugins/**/*.md` is not dprint-formatted — match the surrounding fold width
  by hand. Name no technology (checker rule 10).

## Commit

`feat: doctor reports a pinned, unmaterialized template as its own blocking finding`
— written by the orchestrator after the wave gate, not by the unit. Bare type.
