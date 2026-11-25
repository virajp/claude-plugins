# U2 — Setup cites the rule at every bootstrap write

- **Read first:** every owned file, top to bottom, before editing.
- **Lazy-load:** `plugins/vwf/assets/bootstrap-contract.md`, the section
  `## Passing values`, which U1 writes in the same wave. If it is not there
  yet, use the ruling below; its heading is fixed.

## Ruling

Quoted from the `decisions` list of `index.json`:

- **D2:** Every skill line cites the rule by its heading, `## Passing values`,
  through `${CLAUDE_PLUGIN_ROOT}/assets/bootstrap-contract.md`.
- **D3:** Every value, always, whatever its source: the value argument of
  `bootstrap config set` and every value of an `--answer <tool>.<key>=<value>`
  pair. Serialize the value first (JSON for a list or a table), then replace
  each `'` with `'\''` and wrap the whole value in single quotes. A scalar,
  free text included, is passed as its raw text, never encoded as a JSON
  string (D25). Never pass it unquoted or in double quotes.
- **D30:** A value that holds a backslash, a newline or another control
  character stops that one write with a report that names the key, and
  nothing is written for it. Without these characters the `'\''` form is the
  same in sh, bash, zsh and fish (in fish a backslash inside single quotes
  escapes the next quote).
- **D4:** A name that becomes one segment of a key path contains only
  letters, digits, `_` and `-`; a `.` is not allowed, because it splits the
  path into a nested key. The key shapes are: `repo.members.<name>`, the
  `<field>` of `repo.members.<name>.<field>`, `repo.projects.<name>`, the name
  of `config unset repo.projects.<old name>`, `tools.<tool>.projects`,
  `releases.<key>`, and the `<env>` and `<project>` of
  `repo.deploy.<env>.<project>`. A tool name given to `add tool` or
  `remove tool` is also a name of `bootstrap catalog --json` `data.tools`. A
  bad name stops that one write with a report that names it, and nothing is
  written for it. A `.` stays allowed inside a JSON value, for example the
  `<name>@<marketplace>` keys of `tools.claude.plugins.project` in
  materialize.md step 3.
- **D5:** A command printed for the user to run by hand follows the same rule.
- **D17:** materialize.md:154 gets the D4 check on `<t>` before the write.
  Step 3 of `## Declare the addons` stays a separate check, because it checks
  keys inside a JSON value, where a `.` is allowed.
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
- **D16:** The printed fixes `bootstrap add tool <tool>` are covered by D4
  and D5: each gets the catalog check and a citation of `## Passing values`.

## Edits

At each line below, show the value in its quoted form (`'<value>'` or
`'<JSON ...>'`), and add a short clause or sentence that cites
`## Passing values` of `${CLAUDE_PLUGIN_ROOT}/assets/bootstrap-contract.md`.
Where a name goes into a key path, add the D4 check and its stop. One citation
for each step is enough when a step holds several writes.

1. **`plugins/vwf/skills/setup/references/migrate-pipeline.md`** — about line
   109 (`config set <repo key> <value>`, values from `vwf.yaml`); lines 121 and
   123 (`repo.members.<name>` as a whole table and field by field, values from
   `vwf.yaml`, `.gitmodules` and `git remote get-url`); line 165
   (`repo.projects.<name>`, the folder from `registry.yaml`); line 204
   (`tools.<tool>.projects`); line 205 (`config unset repo.projects.<old name>`);
   line 210 (the folder line printed for the user, D5). Add D23 to the
   26 to 27 step (about lines 107-115) and the 27 to 28 step (about lines
   200-210): the check of every name before the first write, and the stop.
2. **`plugins/vwf/skills/setup/references/onboard-pipeline.md`** — about lines
   43-44 (`repo.product_name`, the user's answer) and line 157
   (`repo.members.<name>`, read from `.gitmodules`).
3. **`plugins/vwf/skills/setup/SKILL.md`** — about line 305 (the generic
   `config set <key> <value>` for product_name, topology, topology_reason and
   members) and line 309 (the `repo.projects` folder).
4. **`plugins/vwf/skills/setup/references/workspace-structure.md`** — about
   line 63 (generic `<key> <value>`), line 81 (`repo.members`) and line 88
   (`config unset`).
5. **`plugins/vwf/skills/setup/references/materialize.md`**:
   - Step 4 **Quote.** of `## Declare the addons` (about lines 209-214):
     replace the inline rule with a pointer to `## Passing values`, and keep
     one sentence on why this map needs it (committed config that a cloned
     repo controls). Keep step 3's key check as it is: those keys are inside a
     JSON value, where a `.` is allowed.
   - Line 156, which points to that **Quote** step: point it to
     `## Passing values` instead.
   - About line 154, `tools.<t>.projects` (D17): add the D4 check on `<t>`
     before the write — letters, digits, `_` and `-`, and a name of the
     catalog. Step 3's key check stays a separate check, because it checks
     keys inside a JSON value, where a `.` is allowed.
   - About line 143, `bootstrap add tool <t>`, where the tool name comes from a
     bundle's `tools:` (a repo bundle can sit in the cloned repo): add the D4
     catalog check and its stop.

6. **Printed `add tool` fixes (D16)** — `plugins/vwf/skills/setup/SKILL.md`
   about line 339, `migrate-pipeline.md` about line 170, and
   `plugins/vwf/skills/setup/references/topology-detection.md` about line 61:
   a citation of `## Passing values` at each form (D20).

## Verification

- `command grep -nE 'bootstrap (config (set|unset)|add tool)' plugins/vwf/skills/setup`
  — each hit is a constant command (for example `bootstrap add tool claude`)
  or its step cites `## Passing values`.
- `command grep -n "'\\\\''" plugins/vwf/skills/setup/references/materialize.md`
  finds no inline escape rule left outside the pointer.
- `mise x -- mise run p:plugins:check` passes.

## Guardrails

- Touch nothing outside the owned paths. U1 owns the contract, U3 the other
  skills.
- Change only the bootstrap writes and their citations. Do not reword the
  steps around them.
- `plugins/**/*.md` is not formatted by dprint: match the fold width of the
  file you edit by hand.
- Write all new prose in ASD-STE100.
- Do not run `git checkout`, `git restore` or a formatter with `--fix`.

## Commit

`fix: setup quotes each bootstrap value and checks each key name`
