# U1 — The Passing values rule in both contract copies

- **Read first:** every owned file, top to bottom, before editing. Start with
  `plugins/vwf/assets/bootstrap-contract.md`, then
  `plugins/stackgen/assets/bootstrap-contract.md`.
- **Lazy-load:** `plugins/vwf/skills/setup/references/materialize.md`, the
  section `## Declare the addons`, steps 3 and 4 (about lines 203-214), only
  to read the rule as it is today. U2 owns that file.

## Ruling

Quoted from the `decisions` list of `index.json`:

- **D2:** The rule lives in a new section, headed exactly `## Passing values`,
  of `plugins/vwf/assets/bootstrap-contract.md` and
  `plugins/stackgen/assets/bootstrap-contract.md`, with the same body in both
  copies, placed after `## The calls the plugins use` and before any later
  section. Every skill line cites it by that heading, through
  `${CLAUDE_PLUGIN_ROOT}/assets/bootstrap-contract.md` of its own plugin.
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
- **D19:** U1 changes the sentence near the top of both copies that says
  the bodies match, so that it names both differences: the pane exception and
  `## The git ports`.
- **D5:** The rule also covers a command printed for the user to run by hand,
  with the same quoting and the same name check.

## Edits

1. **`plugins/vwf/assets/bootstrap-contract.md`** — add the section
   `## Passing values` after `## The calls the plugins use`, before
   `## The git ports`. Its body states, in this order:
   - why: `bootstrap config set` takes the value as one positional argument,
     with no stdin or file form, and a value or a name can come from a cloned
     repo, so a shell metacharacter in it runs as a command;
   - **Values** (D3, D25, D30): the refusal of a backslash or a control
     character, then the escape, with one short example of an escaped value,
     for example
     the JSON `{"folder":"it's"}` written as `'{"folder":"it'\''s"}'`;
   - **Names in a key** (D4), with the list of key shapes and the stop;
   - **Tool names** (D4), the catalog check;
   - **Printed commands** (D5);
   - one line: a skill that writes to bootstrap cites this section at the
     step that builds the command.
2. **`plugins/stackgen/assets/bootstrap-contract.md`** — add the same section,
   byte for byte the same body, after `## The calls the plugins use`. Copy it;
   do not retype it.
3. **The sentence that says the bodies match** (D19) — lines 3-6 of vwf's
   copy and the matching sentence near the top of stackgen's copy: name both
   differences, the `/vwf:execute` progress-pane exception and the section
   `## The git ports`, which only vwf's copy has. The new `## Passing values`
   section is not a difference.
4. **`plugins/stackgen/skills/stackgen-stack-template/references/bootstrap-handoff.md`**
   — at the `bootstrap add tool` lines (about lines 64 and 82) and the
   `remove tool` line (about line 103): keep the catalog check of lines 18-21,
   and add that every `--answer` value is quoted per `## Passing values` of
   `${CLAUDE_PLUGIN_ROOT}/assets/bootstrap-contract.md` (D3). Show the
   `--answer` argument in its quoted form in each command line.

## Verification

- K2 of `gates.keeps`: the two `## Passing values` sections are the same.
- `command grep -n "Passing values" plugins/stackgen/skills/stackgen-stack-template/references/bootstrap-handoff.md`
  has a hit near each command.
- `mise x -- mise run p:plugins:check` passes.

## Guardrails

- Touch nothing outside the owned paths. U2 owns setup, U3 the other vwf
  skills, U4 doctor.
- `plugins/**/*.md` is not formatted by dprint: match the fold width of the
  file you edit by hand (about 79 columns).
- Write all new prose in ASD-STE100.
- Do not run `git checkout`, `git restore` or a formatter with `--fix`.

## Commit

`fix: the bootstrap contract says how a value and a key name are passed`
