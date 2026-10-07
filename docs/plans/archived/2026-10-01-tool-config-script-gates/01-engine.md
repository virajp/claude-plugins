# G1 — Engine: the `all` sequence, the formatter, tool invocation, the grammar

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/stackgen/skills/tool-config/scripts/tool-config.mjs`,
  `plugins/stackgen/skills/tool-config/scripts/lib/*.mjs` (every module directly
  under `lib/`, never `lib/tools/`), `scripts/src/tool-config-core.test.ts`,
  `scripts/src/tool-config-mise.test.ts` (plan 1's suite — its fake `mise` must
  answer the new `all` sequence)
- **Model:** opus
- **Kind:** edit
- **Read first:** every owned file as plan 1 left it;
  `plugins/stackgen/skills/tool-config/SKILL.md` (*Arguments*, *The one
  cross-tool verb*, *Consent and the rows*).

## Ruling

> G1 — A trailing `/` marks a directory, globs included (`*.xcassets/`) —
> excluded with everything inside. `*`/`?` without a trailing `/` is a file
> glob; a bare name with neither is a directory, as today.

> G2 — Every write to the pre-commit config runs
> `mise x -- pre-commit validate-config`; a failure restores the file byte for
> byte and refuses the call.

> G3 — Tools run only as `mise x -- <tool>` (the version the repo's config
> pins), never `mise x <tool>@… --`. A tool not installed → the call stops with
> the remedy `MISE_ENV=dev mise run setup:all`.

> G4 — `all` = land every file → `MISE_ENV=dev mise run setup:all` → format and
> validate the files it wrote → record hashes. Trust is assumed: an untrusted
> config stops the call with the remedy.

> G5 — Engine-wide: every written file passes through
> `mise x -- dprint fmt --config .config/dprint.json <files>` before its hash is
> recorded, mise files included.

> G7 —
> `grype add-ignore --id <id> --package <name@version> --reason <text> --expires <YYYY-MM-DD>`,
> all four required.

> G8 — the script runs as `mise x -- node …`; only the first `all` on a repo
> with no mise config needs `node` on `PATH`.

> G9 — The 22 entries become structured YAML validated by the script's schema.

User, verbatim: *"the tools must be pre-installed via mise only.
`mise x dprint -- ...` may install a different version that what is mentioned in
mise config so use `mise x -- dprint ...`"*; *"`mise trust` is expected to be
run before hand by user, script must expect that this is in-place"*.

## Edits

1. **Tool runner** (a module under `lib/`): `runTool(tool, args)` executes
   `mise x -- <tool> <args>` in the repo root and never any other form; before
   the first call it checks the tool resolves (`mise which <tool>`), else
   refuses with the `setup:all` remedy. Remove any `mise x <tool>@…` form plan 1
   left, including the node fallback.
2. **Trust check**: before any write, `mise trust --show` (or the equivalent
   read-only query) in the repo; an untrusted config refuses the call naming the
   remedy — trust the path (`trusted_config_paths` in the global mise config, or
   `mise trust --all`). The script never runs `mise trust`. A repo with no mise
   config yet passes (nothing to trust).
3. **The `all` sequence**: land every tool's files (each tool module's `all`),
   then `MISE_ENV=dev mise run setup:all`, then the formatter over every file
   written this call, then `pre-commit validate-config` when the hook config was
   written, then record hashes. A failure in `setup:all` stops the call with its
   output and records nothing; files already written stay, and the report says
   so.
4. **Formatter step** for every write path (verbs included):
   `runTool('dprint', ['fmt', '--config', '.config/dprint.json', ...files])` on
   the files the call wrote, before hashes are taken. Files dprint does not
   format pass through unchanged.
5. **Validate step**: any call that wrote `.config/pre-commit-config.yaml` runs
   `runTool('pre-commit', ['validate-config', '.config/pre-commit-config.yaml'])`;
   a failure restores every file the call wrote, byte for byte, and refuses.
6. **Grammar** (`lib/cli.mjs`, `lib/schema.mjs`): flag shapes and schema entries
   for `dprint add-plugin --name`; `pre-commit add-hook --repo --id --stage`
   with the optional flags
   `--name --entry --language --files --types --args --rev --description --pass-filenames --always-run`;
   `pre-commit add-linter-ignore --paths`; `pre-commit set-scopes --scopes`;
   `grype add-ignore` (G7), `grype remove-ignore --id`;
   `all add-exclude --paths [--generated]` with the G1 path rule (trailing `/` =
   directory). The structured pack-entry schema gains
   `{tool: dprint, verb: add-plugin, name}`,
   `{tool: pre-commit, verb: add-hook, …}`,
   `{tool: pre-commit, verb: add-linter-ignore, paths: [...]}`,
   `{tool: all, verb: add-exclude, paths: [...], generated: bool}`.
7. **`scripts/src/tool-config-core.test.ts`** — with a fake `mise` on `PATH`
   that records its argv: `all` calls `mise run setup:all` after writing and
   before formatting; every tool run is `mise x -- <tool>`; an untrusted repo
   refuses; a failed validate restores files; a missing tool refuses with the
   remedy; the G1 path classification table.
8. **`scripts/src/tool-config-mise.test.ts`** (plan 1's) — teach its fake `mise`
   the calls the new `all` sequence makes (`run setup:all`, `x -- dprint fmt`,
   `x -- pre-commit validate-config`, `which`, `trust`), so the suite stays
   green; its assertions about mise output are unchanged. The golden fixtures it
   compares against are G2's.

## Verification

- `pnpm vitest run scripts/src/tool-config-core.test.ts` green.
- `pnpm exec tsc --noEmit -p scripts` green.
- `grep -rn -E 'mise x [a-z@]' plugins/stackgen/skills/tool-config/scripts`
  prints nothing (only `mise x --`).
- The full wave gate.

## Guardrails

- Do not touch `lib/tools/**` (G3) or any asset (G2).
- No npm dependency, no python.
- Delete with `rm`, never `git rm`.

## Commit

`feat: tool-config engine runs setup:all, the formatter and validate-config through mise x --`
