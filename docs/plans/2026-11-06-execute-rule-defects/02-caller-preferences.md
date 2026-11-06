# U2 — Honor a caller's preference in doctor and handoff

- **Read first:** every owned file, top to bottom, before editing.
- **Lazy-load:** the `Caller Preferences` section of
  `plugins/vwf/skills/git-workflow/SKILL.md`, which is the pattern to follow.

## Ruling

> D6: execute declares a caller preference in the skill's arguments, as text that
> starts with prefer: and that the skill never reads as a name. To doctor: prefer:
> report only, which offers no fix and asks nothing. To handoff: prefer: the one
> thread is this plan's run. Both skills get a short section that honors the
> prefix, as git-workflow honors a declared preference. An argument with only the
> prefix counts as empty, so doctor checks every project and handoff writes next.
> Names, when a caller has them, come before the prefix.

> D9: No. These edits change rules on purpose, and a ledger proves that a rewrite
> keeps every rule. The wave review judges each edit against its unit file.

## Edits

1. **`plugins/vwf/skills/doctor/SKILL.md`** — add a short `## Caller Preferences`
   section, above `## Hard Rules`. Everything in `$ARGUMENTS` from `prefer:` to its
   end is a preference, and the words before it are the project names or `baseline`.
   `prefer: report only` means that the skill reports its findings, offers no fix
   and asks nothing. With no `prefer:`, the skill offers as it does now.
2. **`plugins/vwf/skills/doctor/SKILL.md`** — at lines 23 and 32, say that an argument
   with only a preference counts as no argument, and that a preference is not a
   project name. At line 65, say that `$ARGUMENTS` can
   end with a `prefer:` preference. In the first Hard Rule, add a clause that points
   to the new section.
3. **`plugins/vwf/skills/handoff/SKILL.md`** — add a short `## Caller Preferences`
   section, above `## Pipeline`. Everything in `$ARGUMENTS` from `prefer:` to its
   end is a preference, and the words before it are the name. An argument with only
   a preference has an empty name, which means `next`. `prefer: the one thread is
   <text>` names the thread, and the skill does not ask at step 1. With no `prefer:`,
   the skill asks as it does now.
4. **`plugins/vwf/skills/handoff/SKILL.md`** — in step 1, and where `$ARGUMENTS` is
   defined, add a clause that points to the new section.

## Verification

- `mise x -- mise run code:format`
- `mise x -- mise run code:lint`
- `mise x -- mise run p:plugins:check`
- `grep -n 'prefer:' plugins/vwf/skills/doctor/SKILL.md plugins/vwf/skills/handoff/SKILL.md`
  prints a line for each file.

## Guardrails

- Do not touch `execute`. U1 owns it.
- Do not migrate either skill to the standard, and do not fix its existing lint
  findings.
- Change no behavior when no `prefer:` is present.
- `plugins/**/*.md` is not formatted. Match the fold width of the file by hand.

## Commit

`fix: let a caller stop the prompts of doctor and handoff`
