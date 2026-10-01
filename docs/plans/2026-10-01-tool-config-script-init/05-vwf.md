# I5 — init relays the verbs; hygiene via tool-config; doctor remedy

- **Wave:** 3
- **Depends on:** I3, I4
- **Model:** opus
- **Kind:** edit
- **Owns:** `plugins/vwf/skills/init/SKILL.md`,
  `plugins/vwf/skills/init/references/{new-repo,existing-repo,readme-and-license}.md`,
  `plugins/vwf/skills/init/assets/hygiene/` (delete),
  `plugins/vwf/skills/doctor/references/code-intelligence.md`

## Ruling

> I1 — init relays rows of `mise migrate-tasks` and `mise audit-shebangs`.

> I4 — init only asks (licence, security contact, brief); tool-config lands.

> I5 — init's `mise run init` step is dropped.

> I6 — doctor remedy `MISE_ENV=dev mise run setup:precommit`.

## Edits

1. Passes 3, 4, 5, 8, 9 and §7 `_default`: replace the procedures with the
   `/stackgen:tool-config mise migrate-tasks --ids …` and `audit-shebangs`
   calls, previewed inside the one consent; keep pass 4's syntax listing as
   init's (LLM) note.
2. §9: drop `mise run init`.
3. Hygiene: questions 3, 6a, 6b feed `all --brief --license --security-contact`;
   `rm -r plugins/vwf/skills/init/assets/hygiene/`; fix citations
   (`grep -rn assets/hygiene plugins/vwf`).
4. `code-intelligence.md:37` remedy.

## Verification

- `grep -rn 'assets/hygiene' plugins/vwf` prints nothing;
  `mise run p:plugins:check` green; the full wave gate.

## Commit

`refactor: init relays tool-config's task and hygiene verbs`
