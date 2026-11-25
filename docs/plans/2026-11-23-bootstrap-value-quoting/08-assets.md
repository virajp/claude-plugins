# U8 — The vwf assets and doctor references follow the rule

- **Read first:** every owned file, top to bottom, before editing.
- **Lazy-load:** `plugins/vwf/assets/bootstrap-contract.md`, the section
  `## Passing values`, which U1 writes in the same wave. If it is not there
  yet, use the ruling below; its heading is fixed.

## Ruling

Quoted from the `decisions` list of `index.json`:

- **D3:** Every value, always, whatever its source: serialize it (JSON for a
  list or a table), replace each `'` with `'\''`, and wrap the whole value in
  single quotes. A scalar, free text included, is passed as its raw text,
  never encoded as a JSON string (D25). Never pass it unquoted or in double
  quotes.
- **D30:** A value that holds a backslash, a newline or another control
  character stops that one write with a report that names the key, and
  nothing is written for it. Without these characters the `'\''` form is the
  same in sh, bash, zsh and fish (in fish a backslash inside single quotes
  escapes the next quote).
- **D4:** A name that becomes one segment of a key path contains only
  letters, digits, `_` and `-`; a `.` is not allowed. A tool name given to
  `add tool` or `remove tool` is also a name of the catalog. A bad name stops
  that one write with a report that names it.
- **D2:** Every skill line cites the rule by its heading, `## Passing values`,
  through `${CLAUDE_PLUGIN_ROOT}/assets/bootstrap-contract.md`.
- **D6:** The row stays as it is (rule `project-folder`, severity `degraded`),
  but its remedy prints no command. It reads: project `<name>` is not a valid
  bootstrap key (letters, digits, `_` and `-` only); rename the project by hand in
  `docs/blueprint/registry.yaml` and in each `projects.<name>` key of
  `.config/vwf.yaml`, then run `/vwf:setup` and `/vwf:doctor` again (D21, D32). A valid name keeps today's
  remedy, `bootstrap config set repo.projects.<name> '{"folder":"<path>"}' --json`,
  where `<path>` stays a literal placeholder.
- **D23:** In the 26 to 27 and 27 to 28 migration steps, check every name of
  the step before its first write. On a bad name, stop the step for that repo
  before any write: report the bad name and how to rename it. `vwf.yaml`
  keeps the key and the stamp stays at the old `config_format`, so the next
  `/vwf:setup` offers the step again. Other repos continue.
- **D28:** The D23 report gives the rename route. A member or env name: rename
  it in `.config/vwf.yaml` by hand (for a submodule member, also its name in
  `.gitmodules`), then run `/vwf:setup` again. A project name: rename it by hand in
  `docs/blueprint/registry.yaml` and in each `projects.<name>` key of
  `.config/vwf.yaml`, then run `/vwf:setup` again (D32).
- **D20:** A command that shows only placeholders (for example
  `bootstrap add tool <tool>`) is a form, not a write. In a `.md` file it
  cites `## Passing values` once at the form, and whoever fills it in applies
  the rule; the D4 check applies to the real name, not to the placeholder.
- **D16:** The printed fixes `bootstrap add tool <tool>` are forms (D20):
  each cites `## Passing values` once.
- **D18:** D1 also covers `plugins/vwf/assets`. U8 owns `stack-adapter.md`
  and `topologies/monorepo.md` too, and quotes each write there with a
  citation of `## Passing values`.
- **D14:** The vwf assets and doctor references that hold a bootstrap write or
  a doctor remedy are owned by this unit, U8.

## Edits

1. **`plugins/vwf/skills/doctor/references/stack-checks.md`** — about line 71,
   where a project with no `repo.projects.<name>` gets the fix
   `bootstrap config set repo.projects.<name> …`: add D6, the remedy with no
   command for a project name that is not a valid key.
2. **`plugins/vwf/assets/vwf-config.md`** — about line 195, the same passage:
   add D6.
3. **`plugins/vwf/skills/doctor/references/stack-checks.md`** — about lines 95
   and 111, the printed `bootstrap add tool <tool>` forms (D16, D20): cite
   `## Passing values` once at each.
4. **`plugins/vwf/assets/vwf-config.md`** — about line 152, and
   **`plugins/vwf/assets/stack-adapter.md`** — about line 362, and
   **`plugins/vwf/assets/topologies/monorepo.md`** — about line 93: each
   `bootstrap config set` with a value (D18): show the value quoted per D3,
   add the D4 check where a name goes into a key path, and cite
   `## Passing values`.

5. **`plugins/vwf/assets/stack-vocabulary.md`** — about line 39, the form
   `bootstrap add tool <t>`, and **`plugins/vwf/assets/vwf-config.md`** —
   about line 924, the 27 to 28 `add tool` form: cite `## Passing values`
   once at each (D20).
6. **`plugins/vwf/assets/vwf-config.md`** — about line 901, the 26 to 27
   `config set` of member, env and project names: a real write. Quote each
   value per D3, add the D4 check with the D23 stop, and cite
   `## Passing values` (D20).

## Verification

- `command grep -n "repo.projects" plugins/vwf/skills/doctor/references/stack-checks.md plugins/vwf/assets/vwf-config.md`
  — each passage that gives the fix also states D6.
- `mise x -- mise run p:plugins:check` passes.

## Guardrails

- Touch nothing outside the owned paths. U4 owns `stack.mjs`.
- `plugins/**/*.md` is not formatted by dprint: match the fold width of the
  file you edit by hand.
- Write all new prose in ASD-STE100.
- Do not run `git checkout`, `git restore` or a formatter with `--fix`.

## Commit

`fix: the vwf assets and doctor references follow the Passing values rule`
