# U3 — The design-tool pack requests taste-skill

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/stackgen/stacks/design-tool/claude-code/pack.yaml` (the
  `tool-config:` list only — never `version:`),
  `plugins/stackgen/stacks/design-tool/claude-code/conventions.md`,
  `plugins/stackgen/stacks/design-tool/claude-code/skills/design-session/SKILL.md`,
  `plugins/stackgen/stacks/bundles/claude-code.md` (prose only — never the
  `design-tool/claude-code@…` pin line)
- **Model:** opus
- **Kind:** edit
- **Read first:** every owned file; one other pack's `tool-config:` list (e.g.
  `plugins/stackgen/stacks/capability-provider/doppler/pack.yaml`) for the entry
  shape.

## Ruling

> D5 — A pack may request a plugin with a structured `tool-config:` entry
> `{ tool: mise, verb: add-plugin, plugin: <name>@<marketplace>, source: <owner/repo> }`.
> tool-config writes it into `setup/ai` inside that requester's block markers.
> The task treats each the same as vwf: installed at either scope → nothing;
> else `claude plugin marketplace add <source>` when the marketplace is not
> registered, then `claude plugin install --scope user <plugin>`.
> `remove <requester>` drops the block.

> D6 — The design-tool/claude-code pack requests
> `{ tool: mise, verb: add-plugin, plugin: taste-skill@taste-skill, source: Leonxlnx/taste-skill }`;
> its conventions, its design-session halt text and `bundles/claude-code.md` say
> `setup:ai` installs it at user scope when absent.

## Edits

1. **`pack.yaml`** — add the D6 entry to the `tool-config:` list (create the
   list if the pack has none), in the list's existing style.
2. **`conventions.md`** (`:71-80`) — the plugin this pack requires: the pack
   requests it, and `setup:ai` installs it at user scope when it is installed at
   neither scope; drop the init-question-5 and project-scope wording. The halt
   message stays "run `mise run setup:ai`".
3. **`skills/design-session/SKILL.md`** (`:69`) — the halt sentence matches.
4. **`bundles/claude-code.md`** (`:22-24`) — "the repo's `setup:ai` installs it"
   gains "at user scope, when absent"; leave the pin line alone.

## Verification

- `grep -nE 'question 5|project scope' plugins/stackgen/stacks/design-tool/claude-code plugins/stackgen/stacks/bundles/claude-code.md -r`
  prints nothing about taste-skill's install.
- `grep -n 'add-plugin' plugins/stackgen/stacks/design-tool/claude-code/pack.yaml`
  prints the entry.
- `mise run p:plugins:check` green (pack schema).
- The full wave gate — `p:plugins:inventory -- --check` may go red only if the
  inventory renders `tool-config:` entries; report that as a `GAP:` for U7,
  never regenerate here.

## Guardrails

- Never edit `version:` in `pack.yaml` or the pin line in
  `bundles/claude-code.md` — U7's.
- `plugins/stackgen/stacks/*/*/config/` is payload and excluded — not touched
  here.
- `plugins/**/*.md` is not dprint-formatted — match the fold width by hand.
- No `git checkout`, `git restore` or formatter `--fix` outside Owns.

## Commit

`feat: the design-tool pack requests taste-skill through setup:ai`
