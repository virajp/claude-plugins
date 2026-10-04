# U2 — tool-config's doctrine for setup:ai

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/stackgen/skills/tool-config/SKILL.md`,
  `plugins/stackgen/skills/tool-config/references/mise.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** every owned file, top to bottom; the falsified passages are
  `references/mise.md:291`, `:464`, `:819`, `:923`, `:999-1026`, `:1244-1245`
  (2026-10-03 line numbers).

## Ruling

> D1 — The task reads `claude plugin list --json`; when `vwf@virajp-plugins` is
> installed at **user or project** scope it does nothing more for vwf. When it
> is at neither, it runs `pnpx @virajp.dev/claude-plugins@latest --all` — the
> installer, which registers the marketplace and installs vwf (and stackgen) at
> **user** scope. It never installs at project scope, and it continues whether
> or not it installed.

> D2 — After the vwf check, always: `claude plugin marketplace update` (every
> registered marketplace), then `claude plugin update --scope <its scope> <id>`
> for every installed plugin, then
> `claude plugin autoremove --scope project --yes`, from `MISE_PROJECT_ROOT`. No
> `claude` on PATH → warn and exit 0, as today.

> D4 — Retired: `EXTRA_MARKETPLACES`, `EXTRA_PLUGINS`, `--inventory`, `--user`,
> tool-config's `--plugin-sources`/`--plugins` keys, and init's question 5 (the
> agent-plugins question). The task installs no extra plugin of the user's
> choosing "(for now)".

> D5 — A pack may request a plugin with a structured `tool-config:` entry
> `{ tool: mise, verb: add-plugin, plugin: <name>@<marketplace>, source: <owner/repo> }`.
> tool-config writes it into `setup/ai` inside that requester's block markers.
> The task treats each the same as vwf: installed at either scope → nothing;
> else `claude plugin marketplace add <source>` when the marketplace is not
> registered, then `claude plugin install --scope user <plugin>`.
> `remove <requester>` drops the block.

> D7 — Greenfield: tool-config copies the shipped task as an asset (plus pack
> blocks). Brownfield — the repo already has a `setup/ai` of its own:
> tool-config does not overwrite it, offers no conflict or drift row, and
> records no content hash for it; the doctrine in `TC/references/mise.md` tells
> the LLM which steps the task must carry (D1, D2, the pack blocks) and it
> renders any missing step into the user's file, keeping everything else. No
> test or checker asserts a brownfield task's content.

> D8 — Graphify wiring (`graphify install --platform claude`) and the
> claude-status hint leave the task.

## Edits

1. **`references/mise.md`** — rewrite the "`setup:ai` — the repo's agent
   plugins" section (`:999-1026`) as the doctrine: the required steps (D1, D2),
   the pack plugin blocks (D5), and the greenfield/brownfield split (D7) —
   stated so an LLM can create the task from nothing or sync an existing one,
   with the explicit note that the user may extend the task freely and nothing
   checks its content. Fix the other falsified passages: `:291` (setup:ai no
   longer wires graphify), `:464`, `:819` (task table: "check for vwf, upgrade
   every marketplace and plugin"), `:923`, `:1244-1245`. Document the
   `add-plugin` verb beside `add-tool` in the verbs section.
2. **`SKILL.md`** — the `all` key table drops `--plugin-sources` and
   `--plugins`; the verbs list gains `mise add-plugin`.

## Verification

- `grep -nE 'plugin-sources|EXTRA_PLUGINS|--inventory|at project scope' plugins/stackgen/skills/tool-config/SKILL.md plugins/stackgen/skills/tool-config/references/mise.md`
  prints no live claim (a sentence saying project-scope installs are gone is
  fine).
- `grep -n 'add-plugin' plugins/stackgen/skills/tool-config/references/mise.md`
  prints hits.
- `mise run p:plugins:check` green.
- The full wave gate.

## Guardrails

- Touch nothing outside Owns; a falsified passage elsewhere is a
  `DOCS FALSIFIED:` line.
- `plugins/**/*.md` is not dprint-formatted — match the fold width by hand; keep
  code spans on one line; never end a table cell in a bare `*`.
- No plugin-relative citation in anything that lands (checker rule 13).
- No `git checkout`, `git restore` or formatter `--fix` outside Owns.

## Commit

`docs: tool-config's doctrine for setup:ai`
