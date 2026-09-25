# U3 — One shipped linter config with ignores, and a serial lint hook

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/stackgen/stacks/toolchain-gate/pre-commit/**` except
  `pack.yaml`,
  `plugins/stackgen/stacks/toolchain-gate/eslint/config/.config/linter.yaml`,
  `plugins/stackgen/stacks/toolchain-gate/eslint/conventions.md`,
  `plugins/stackgen/stacks/toolchain-gate/eslint/skills/**`,
  `plugins/stackgen/stacks/package-manager/pnpm/conventions.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** the eslint pack's `linter.yaml`, `conventions.md` and
  `skills/eslint/SKILL.md`; the pre-commit pack's
  `config/.config/pre-commit-config.yaml`, `conventions.md` and skill.
- **Lazy-load:** `@askviraj/linter`'s README
  (`pnpm view @askviraj/linter readme`) for the `linter.yaml` schema and the
  `ignores:` syntax; every pack's `conventions.md` under
  `plugins/stackgen/stacks/` for the generated trees each names (grep `build/`,
  `.dart_tool`, `.build/`, `dist/`, `DerivedData`, `.venv`, `node_modules`).

## Ruling

> **B1** — The mise pack declares `npm:@askviraj/linter` at an exact version
> (1.1.6, re-verified against the registry at run time) in its tools; every
> `code:lint` calls `linter` directly, and `pnpm dlx` for the linter is gone.
> (U3 carries it for the eslint pack's prose only; U1 edits the tasks.)

> **B2** — One `.config/linter.yaml`, shipped by the pre-commit gate pack, whose
> `ignores:` lists every generated tree the packs know (`build/`, `.dart_tool/`,
> `.build/` and the rest the packs' conventions name); the eslint pack stops
> shipping its copy. Rejected: `linter.d` fragments composed by init; language
> packs append.

> **B4** — The pre-commit pack's `lint` hook gets `require_serial: true`.

## Edits

1. **New `toolchain-gate/pre-commit/config/.config/linter.yaml`** — the eslint
   copy's content (`version: 1` and its comments, kept where still true), with
   `ignores:` uncommented and listing every generated tree found in the
   lazy-load grep, one per line, each with the pack that produces it in a
   trailing comment. Schema per the linter's README.
2. **Remove** `toolchain-gate/eslint/config/.config/linter.yaml` with `rm`.
3. **`toolchain-gate/pre-commit/config/.config/pre-commit-config.yaml`** — the
   `lint` hook (`:103-110`) gains `require_serial: true`.
4. **Pre-commit pack prose** (`conventions.md`, `skills/**`) — list
   `.config/linter.yaml` among the files it ships, and say what `ignores:` is
   for and that a new language pack's generated tree is added here.
5. **eslint pack prose** — `conventions.md:29` and `skills/eslint/SKILL.md`
   (`:11`, `:20`, `:90`, `:117`, `:120`): the file is now the pre-commit pack's;
   the eslint skill still guides editing it. Replace the
   `pnpm dlx @askviraj/linter` lines (`:62`, `:72-75`) with the pinned binary U1
   names (`linter`, unless U1's `DECIDED:` differs — the orchestrator passes it;
   if not passed, use `linter` and say so in `GAP:`).
6. **`package-manager/pnpm/conventions.md:63`** — the passage naming
   `.config/linter.yaml` says who ships it now.

## Verification

- `mise run p:plugins:check` passes (rule 11: the `config/` root on the landable
  allowlist; pre-commit YAML parses).
- `find plugins/stackgen/stacks -name linter.yaml` returns only the pre-commit
  pack's.
- `grep -n 'require_serial' plugins/stackgen/stacks/toolchain-gate/pre-commit/config/.config/pre-commit-config.yaml`
  shows it on the `lint` hook.

## Guardrails

- Do not touch any `code/lint` or `code/format` (U1's, U2's), or any `pack.yaml`
  (U7's). If a `pack.yaml` lists shipped files, report it as `GAP:` for U7.
- Payload under `config/` is excluded from this repo's formatter.
- `plugins/**/*.md` is not dprint-formatted: fold by hand. Keep code spans on
  one line.
- Write with Write/Edit, never heredocs. Delete with `rm`, never `git rm`.

## Commit

`fix: one shipped linter.yaml with ignores in the pre-commit pack, and a serial lint hook`
