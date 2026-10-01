# U1 — The script's engine

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/stackgen/skills/tool-config/scripts/tool-config.mjs`,
  `plugins/stackgen/skills/tool-config/scripts/lib/cli.mjs`,
  `plugins/stackgen/skills/tool-config/scripts/lib/blocks.mjs`,
  `plugins/stackgen/skills/tool-config/scripts/lib/rows.mjs`,
  `plugins/stackgen/skills/tool-config/scripts/lib/record.mjs`,
  `plugins/stackgen/skills/tool-config/scripts/lib/drift.mjs`,
  `plugins/stackgen/skills/tool-config/scripts/lib/schema.mjs`,
  `scripts/src/tool-config-core.test.ts`
- **Model:** opus
- **Kind:** edit
- **Read first:** `plugins/stackgen/skills/tool-config/SKILL.md` whole — it is
  the specification this engine implements (argument shapes, Blocks, Consent and
  the rows, Drift, Removal, The lock record).
- **Lazy-load:** `plugins/stackgen/assets/output-tree.md` (the lock entry
  shape); `installer/src/mempalace-checkpoint-script.test.ts:1-12` (how a suite
  under `src/` spawns a plugin script); `vitest.config.mts`.

## Ruling

> D1 — Node, one ESM entry `TC/scripts/tool-config.mjs` plus modules under
> `TC/scripts/lib/`, built-ins only, zero npm dependencies. Run as `node` from
> `PATH` — never `mise x node@lts --` (amended 2026-10-01 by plan 2, which pins
> node and switches the run to `mise x -- node`).

> D4 — Block markers, preview rows with `answers=`, and the
> `.claude/stackgen/lock.yaml` record all stay, in today's shapes.

> D5 — Drift is "render what this block should be, compare with the file" —
> exposed as a script `check` command that `/vwf:doctor` calls, replacing the
> prose word-compare rules.

> D7 — The script emits conflict rows for what it can decide and a `needs-edit`
> row for the rest (a root mise config to split, a `merge` answer, an
> unparseable file), naming the file and the target layout. The LLM makes that
> edit, then re-runs the script's `check`.

> D8 — Flag-style: e.g.
> `tool-config.mjs mise add-tool --name <n> --version <v> --env dev --for <pack>`;
> `tool-config.mjs preview all --repo <slug> …`;
> `--answers r1:ok,r2:keep-existing`.

> D9 — A pack's `tool-config:` entry becomes structured YAML, validated by
> `check.ts` against one schema the script exports.

> D20 — The script stops with the install remedy when `mise` is not on `PATH`.

User, verbatim: *"There are many items which are static and mechanical: These
must be taken care by scripts (bash or node only, don't use python) with
placeholders/comments marking positions for different inserts. Some items will
really need LLM and only those must be done using LLM."*

## Edits

1. **`TC/scripts/tool-config.mjs`** — the entry, `#!/usr/bin/env node`, mode
   `755`. Parses argv through `lib/cli.mjs`, dispatches to a tool module from
   `lib/tools/index.mjs` (U3 writes it — import it lazily, so the engine's own
   suite runs before U3 lands, with a test-only tool registered by the suite),
   prints its result as JSON on stdout, exits 0 on success, 2 on a refused call
   (with a JSON `{error, rows?}` body), 1 on an internal fault. Global flags:
   `--repo-root <path>` (default: the cwd's git top level),
   `--plugin-root <path>` (default: two directories above the script); JSON is
   the only output form.
2. **`lib/cli.mjs`** — the flag grammar. Shapes:
   - `[preview] <tool> <verb> [--<key> <value>]… [--for <requester>] [--answers <id>:<answer>,…]`
   - `[preview] all [--<key> <value>]… [--answers …]` — keys `repo`, `members`,
     `linkage`, `merge-model-develop`, `merge-model-main`, `runtimes`,
     `plugin-sources`, `plugins`, `forge`, `editor`, `secrets`, `update-bot`,
     `scopes`; lists comma-separated, no spaces; `--<key>` with an empty value
     is empty; an omitted key keeps the repo's current value, else the tool's
     default (SKILL.md *Arguments*).
   - `check [<tool>]` — drift report, writes nothing.
   - `apply-entries --pack <slug> --file <pack.yaml>` — reads a pack's
     structured `tool-config:` list (schema below) and runs each entry as its
     flag call, previewed or answered as the other shapes are. Validation per
     SKILL.md *What a call may carry* (env key, alias name, tool name, value
     escaping, template only in a pack's own `add-env`), refused whole before
     anything is computed. An unknown flag or verb is refused naming the valid
     ones.
3. **`lib/blocks.mjs`** — read and write `# >>> <req>` / `# <<< <req>` blocks
   (`// >>>` for JSONC) per SKILL.md *Blocks*: one block per requester per
   position, base first then requesters in asking order, one blank line between
   adjacent blocks except inside a list, sorted entries where the format's
   formatter sorts, a file's frame, lines outside every block are the user's and
   are never written without a settled row, a file exists only while it has
   content, shared entries recorded once.
4. **`lib/rows.mjs`** — build rows `r1, r2, …` in order, each with its kind and
   the answer names SKILL.md's table gives (`take-theirs`/`keep-mine`/`merge`,
   `keep-existing`/`overwrite`, `move-in`/`keep-both`, `ok`), plus the new kind
   **`needs-edit`** (answers: `done`, `skip`) carrying `file`, `reason` and
   `target` (the layout the file must reach). A call with `--answers` rebuilds
   the rows and refuses the whole call when an id is missing, unknown, wrongly
   answered, or its content changed since the preview. A `merge` answer always
   yields a `needs-edit` row for that block rather than a computed merge.
5. **`lib/record.mjs`** — read and write `.claude/stackgen/lock.yaml` entries in
   the materializer's shape (`path`;
   `source: tool-config/<tool>@<stackgen version>`, the version read from
   `<plugin-root>/.claude-plugin/plugin.json`; `hash` sha256 of the content
   after the write, `mode`, `blocks`, `keys`, `shares`, `templates`). Entries
   whose `source` is not `tool-config/…` are read and preserved untouched. Write
   the YAML by hand in the file's existing style — no YAML dependency; read it
   with a narrow parser for exactly this shape.
6. **`lib/drift.mjs`** — `check`: for every `tool-config/…` record, render each
   block as its requester would write it now and compare it with the file;
   report one drift row per differing block and one `needs-edit` row per file
   the parser cannot read. Marked positions filled from arguments, a pack's
   `machine_env:` keys, and user lines are never drift.
7. **`lib/schema.mjs`** — export `TOOL_CONFIG_ENTRY_SCHEMA`, a plain object
   describing a structured pack entry: required `tool` and `verb`, and per
   `(tool, verb)` the allowed keys and their types. For mise: `add-tool`
   (`name`, `version`, `env`: `all|dev|ci|test`), `add-env` (`key`, `value`,
   `env`), `add-alias` (`name`, `command`). Export `validateEntry(entry)`
   returning a list of faults (empty when valid). `scripts/src/check.ts` (U4)
   imports both.
8. **Missing mise.** Before any verb that resolves a version, check `mise` on
   `PATH`; absent → exit 2 with an `error` reading: mise is not on PATH —
   install mise (https://mise.jdx.dev), then re-run.
9. **`scripts/src/tool-config-core.test.ts`** — vitest, spawning the script with
   `node` in `mkdtemp` sandboxes (git-initialised). Cover: argument refusals
   (unknown flag, bad env key, template in a typed value); block insert,
   re-insert idempotence, remove leaving user lines byte for byte; a shared
   entry moving to the next sharer on remove; row numbering; `--answers` refusal
   on a missing id, an unknown id and a changed row; a `merge` answer yielding
   `needs-edit`; lock record written with sha256 and preserved foreign entries;
   `check` clean after a write and reporting one row after a hand edit inside a
   block; missing `mise` refused (run with a `PATH` lacking it). Use a test-only
   tool module the suite registers, so this suite needs nothing from U3.

## Verification

- `pnpm vitest run scripts/src/tool-config-core.test.ts` green.
- `pnpm exec tsc --noEmit -p scripts` green.
- `head -n1 plugins/stackgen/skills/tool-config/scripts/tool-config.mjs` is
  `#!/usr/bin/env node` and the file is executable.
- `grep -rn "require(\|from \"[a-z]" plugins/stackgen/skills/tool-config/scripts/`
  finds only `node:` built-in imports.
- The full wave gate.

## Guardrails

- Do not touch `TC/scripts/lib/tools/**` (U3) or `TC/assets/**` (U2).
- No npm dependency, no python, no `jq`.
- Every `${CLAUDE_PLUGIN_ROOT}` reference stays inside stackgen; the script
  finds its own root from `import.meta.url`, never from an env var vwf sets.
- Delete with `rm`, never `git rm`.

## Commit

`feat: tool-config engine — a node script for blocks, rows, drift and the lock record`
