# U1 — The shipped setup:ai task and tool-config's mise module

- **Wave:** 1
- **Depends on:** —
- **Owns:**
  `plugins/stackgen/skills/tool-config/assets/mise/.config/mise/tasks/setup/ai`,
  `plugins/stackgen/skills/tool-config/scripts/lib/cli.mjs`,
  `plugins/stackgen/skills/tool-config/scripts/lib/schema.mjs`,
  `plugins/stackgen/skills/tool-config/scripts/lib/tools/mise.mjs`,
  `scripts/src/tool-config-mise.test.ts`,
  `scripts/src/fixtures/tool-config/mise/**`
- **Model:** opus
- **Kind:** edit
- **Read first:** every owned file, top to bottom; the `add-tool` verb end to
  end (schema entry, `VERBS` table, block writing, `remove <requester>`) is the
  model for `add-plugin`.
- **Lazy-load:** `.config/mise/tasks/setup/ai` (this repo's copy, read only) —
  the update loop D2 describes is already written there.

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

> D3 — `@latest` on the package.

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

1. **`assets/.../setup/ai`** — rewrite to D1, D2, D8, keeping the file's
   header/usage comment style and the `#MISE` metadata lines (description
   updated; drop the `--user`/`--inventory` usage lines). Order: no-`claude`
   guard → `cd "$MISE_PROJECT_ROOT"` → vwf check (D1, matching `id` and
   accepting `scope` `user` or `project`) → the pack plugins' block markers
   (empty in the shipped file; each block's lines run the D5 check per plugin) →
   D2's three steps → a closing message. Remove `EXTRA_*`, `REQUIRED`, `SCOPE`,
   the marketplace add/update by name, the graphify and claude-status steps.
   Must pass `shellcheck -x` and `shfmt -d`.
2. **`cli.mjs`** — drop the `plugin-sources` and `plugins` keys from the `all`
   key list; an old call carrying them is refused with the existing unknown-key
   error.
3. **`schema.mjs`** — add the `add-plugin` mise verb: required `plugin`
   (`<name>@<marketplace>`, refuse anything else) and `source` (`<owner>/<repo>`
   or a path); same requester/`--for` handling as `add-tool`.
4. **`mise.mjs`** — remove the `--plugin-sources`/`--plugins` reading, checks
   and marked-position writing; add `add-plugin` to `VERBS`, writing the
   requester's block in `setup/ai` and removing it on `remove <requester>`.
   **Brownfield (D7):** when `setup/ai` already exists and was not written by
   tool-config's greenfield copy (follow how `mise.mjs` already tells a landed
   asset from a repo's own file), do not overwrite it, emit no conflict/drift
   row and record no hash for it; report one line naming the file and that its
   required steps are the LLM's to render per the mise reference. A pack's
   `add-plugin` against such a file is reported the same way, never written.
5. **Tests and fixtures** — update the greenfield fixture to the new task; drop
   `--plugin-sources`/`--plugins` from the test args; add cases: `add-plugin`
   writes a block and `remove` drops it; an invalid `plugin` value is refused;
   the two retired keys are refused; a brownfield `setup/ai` is left
   byte-identical with the one-line report.

## Verification

- `pnpm vitest run` green, new cases included.
- `pnpm exec tsc --noEmit -p scripts` green.
- `mise run p:plugins:shellcheck` green.
- `grep -nE 'EXTRA_|--inventory|--scope project|graphify install|claude-status' plugins/stackgen/skills/tool-config/assets/mise/.config/mise/tasks/setup/ai`
  prints only the `autoremove --scope project` line.
- The full wave gate.

## Guardrails

- Touch nothing outside Owns — prose is U2's, the pack U3's, init U4's.
- The verb is `add-plugin`, the keys `plugin` and `source` — exactly.
- Never run the task against the real `claude` in a test; tests render files
  only.
- No `git checkout`, `git restore` or formatter `--fix` outside Owns.

## Commit

`feat: setup:ai checks for vwf and installs it at user scope only when absent`
