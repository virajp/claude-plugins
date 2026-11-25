# U3 — The other vwf skills cite the rule at every bootstrap write

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
  string (D25). Never pass it unquoted or in double quotes. For `--answer`,
  quote the whole `<tool>.<key>=<value>` argument as one single-quoted word.
- **D30:** A value that holds a backslash, a newline or another control
  character stops that one write with a report that names the key, and
  nothing is written for it. Without these characters the `'\''` form is the
  same in sh, bash, zsh and fish (in fish a backslash inside single quotes
  escapes the next quote).
- **D33:** An `--answer` value is never encoded as JSON. It is passed in the
  form that `bootstrap questions --json` shows for that question, then the
  whole `<tool>.<key>=<value>` argument is quoted per D3 and checked per D30.
  JSON encoding applies to `config set` only.
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
- **D22:** In `execute/references/land.md` (about lines 90-113), a key of
  `.config/releases.yaml` that fails the D4 check is skipped and reported; the
  valid keys are written. `.config/releases.yaml` is not removed while it holds
  a skipped key, so the key is not lost. The landing continues.
- **D31:** After a skip, the moved keys are removed from
  `.config/releases.yaml`, so only the skipped keys stay, and the landing
  commit carries the edited file. Each later landing reports the same skip
  until the user renames the key; no key is written twice.
- **D29:** For a key that D22 skipped, the hand-step report of `land.md`
  (about line 113) prints no command: it names the key, says that it is not a
  valid bootstrap key, and says that it stays in `.config/releases.yaml`.
- **D34:** At `init/references/new-repo.md:65`, U3 adds a short clause at
  "with the answers": each answer is passed as a quoted `--answer` per
  `## Passing values`.
- **D15:** U3 quotes `init/SKILL.md:424` too, per D3: every `--answer` of
  `bootstrap migrate` and of `add tool`.

## Edits

At each line below, show the value in its quoted form, and add a short clause
or sentence that cites `## Passing values` of
`${CLAUDE_PLUGIN_ROOT}/assets/bootstrap-contract.md`. Where a name goes into a
key path, add the D4 check and its stop. One citation for each step is enough
when a step holds several writes.

1. **`plugins/vwf/skills/architecture/SKILL.md`** — about lines 406-409
   (`repo.topology`, `repo.topology_reason` free text, the members as a whole
   table or field by field) and line 428 (the `repo.projects` folder).
2. **`plugins/vwf/skills/verify/SKILL.md`** — about line 60,
   `repo.deploy.<env>.<project> <url>`, the URL from deploy manifests and env
   files, or asked.
3. **`plugins/vwf/skills/execute/references/land.md`** — about line 93
   (`releases.<key> <level>`, keys from the repo's `.config/releases.yaml`),
   line 101 (`releases.<id>`, from the folder's `release_levels`) and line 113
   (the lines printed for the user, D5) Add D22 and D31 to the move: the skip, the
   report, the removal of the moved keys, and the condition on the `rm` of
   step 1.
4. **`plugins/vwf/skills/plan/references/delta-checks.md`** — about line 70,
   the `repo.projects` folder line that a plan writes into its units.
5. **`plugins/vwf/skills/init/SKILL.md`** — about line 424
   (`bootstrap migrate … --answer <tool>.<key>=<value>`), lines 452 and 455, and
   **`plugins/vwf/skills/init/references/new-repo.md`** — about line 65:
   `bootstrap add tool virajp-plugins --answer <tool>.<key>=<value>`. Show
   each `--answer` argument quoted per D3 and D33. At `new-repo.md:65`,
   which is prose, add the D34 clause.

## Verification

- `command grep -nE 'bootstrap (config (set|unset)|add tool)|--answer ' plugins/vwf/skills/architecture plugins/vwf/skills/verify plugins/vwf/skills/execute/references/land.md plugins/vwf/skills/plan/references/delta-checks.md plugins/vwf/skills/init`
  — each hit that writes is quoted, and its step cites `## Passing values`.
- `mise x -- mise run p:plugins:check` passes.

## Guardrails

- Touch nothing outside the owned paths. `init/assets/hygiene/CONTRIBUTING*.md`
  are docs for people, not commands a skill runs: leave them.
- Change only the bootstrap writes and their citations. Do not reword the
  steps around them.
- `plugins/**/*.md` is not formatted by dprint: match the fold width of the
  file you edit by hand.
- Write all new prose in ASD-STE100.
- Do not run `git checkout`, `git restore` or a formatter with `--fix`.

## Commit

`fix: vwf skills quote each bootstrap value and check each key name`
