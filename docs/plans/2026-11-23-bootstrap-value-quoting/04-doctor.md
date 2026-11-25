# U4 — Doctor's remedies check the names they print

- **Test first:** in `scripts/src/doctor-checks.test.ts`, a project named with
  a character outside letters, digits, `_` and `-` (for example `web.app` or
  `a'b`), with no `repo.projects.<name>`, gives a `project-folder` row whose
  remedy contains no `bootstrap config set` and names the project as not a
  valid bootstrap key. It fails before the edit.
- **Read first:** `plugins/vwf/skills/doctor/scripts/lib/stack.mjs`, the
  `project-folder` row (about lines 394-405), then the part of
  `scripts/src/doctor-checks.test.ts` that tests that row.

## Ruling

Quoted from the `decisions` list of `index.json`:

- **D4:** A name that becomes one segment of a key path contains only letters,
  digits, `_` and `-`; a `.` is not allowed, because it splits the path into a
  nested key.
- **D5:** A command printed for the user to run by hand follows the same rule.
- **D6:** The row stays as it is (rule `project-folder`, severity `degraded`),
  but its remedy prints no command. It reads: project `<name>` is not a valid
  bootstrap key (letters, digits, `_` and `-` only); rename the project by hand in
  `docs/blueprint/registry.yaml` and in each `projects.<name>` key of
  `.config/vwf.yaml`, then run `/vwf:setup` and `/vwf:doctor` again (D21, D32). A valid name keeps today's
  remedy, `bootstrap config set repo.projects.<name> '{"folder":"<path>"}' --json`,
  where `<path>` stays a literal placeholder.
- **D13:** U4 also checks the tool name of the `tool-link` remedy with
  `/^[A-Za-z0-9_-]+$/`. A name that fails gets no command: the remedy says
  that tool `<name>` is not a valid bootstrap tool name. The row stays as it
  is. Doctor makes no `bootstrap catalog` call for this check.

## Edits

1. **`plugins/vwf/skills/doctor/scripts/lib/stack.mjs`** — at the
   `project-folder` row, test the name with `/^[A-Za-z0-9_-]+$/`. A name that
   matches keeps today's remedy. A name that does not gets the D6 remedy text.
   The message stays as it is. Keep the script dependency-free.
2. **`plugins/vwf/skills/doctor/scripts/lib/stack.mjs`** — at the `tool-link`
   remedy (about line 248, `bootstrap add tool ${tool}`), the same check on
   the tool name, per D13.
3. **`scripts/src/doctor-checks.test.ts`** — the test above, a test for a bad
   tool name in the `tool-link` remedy, and tests that prove a valid project
   name and a valid tool name still get today's remedies. Add a fixture under
   `scripts/src/fixtures/doctor-checks/` only if the existing setup cannot
   make the case.

## Verification

- `mise x -- pnpm vitest run scripts/src/doctor-checks.test.ts` passes.
- `mise x -- pnpm exec tsc --noEmit -p scripts` passes.
- `mise x -- mise run p:plugins:check` passes.

## Guardrails

- Touch nothing outside the owned paths.
- Change only the remedies of the `project-folder` and `tool-link` rows.
  Leave every other row and its rule as it is.
- Do not run `git checkout`, `git restore` or a formatter with `--fix`.

## Commit

`fix: doctor prints no command for a project or tool name that is not valid`
