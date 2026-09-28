# U2 — Write the stackgen:tool-config skill and its mise reference

- **Wave:** 2
- **Depends on:** U1
- **Owns:** `plugins/stackgen/skills/tool-config/SKILL.md` (new),
  `plugins/stackgen/skills/tool-config/references/**`
- **Model:** opus
- **Kind:** edit
- **Read first:** everything U1 moved into `references/mise/`; the B1 layout in
  index.md's Facts; `plugins/stackgen/skills/stackgen-stack-template/SKILL.md`
  (frontmatter shape, read only); `.claude/skills/plugin-authoring/SKILL.md`
  (invocation frontmatter); `docs/plans/2026-09-26-tool-config-mise/index.md`
  Gates the orchestrator keeps.

## Ruling

> - Decision 1: `plugins/stackgen/skills/tool-config/`, user-invocable and
>   model-invocable: `/stackgen:tool-config <tool> <instruction>` or
>   `/stackgen:tool-config all [answers]`. `SKILL.md` is the contract (argument
>   grammar, block markers, drift, removal, lock recording);
>   `references/<tool>.md` is each tool's doctrine and verbs; `assets/<tool>/`
>   its static files and templates. This plan ships `mise`.
> - Decision 3: The skill writes each requester's lines between
>   `# >>> <requester>` / `# <<< <requester>` (`//` in JSONC); the base is the
>   tool's own name (`# >>> mise`). Lines outside every block are the user's and
>   never touched. Where a format has no comments (plain JSON), provenance is
>   kept in the lock entry. A section file exists only while it has content.
> - Decision 4: On a later run, a block differing from what its requester would
>   write is shown with take theirs / keep mine / merge — no hash. The user:
>   *"skill must check with user on what to do and accordingly do it"*.
>   `machine_env` values are never drift.
> - Decision 5: `/stackgen:tool-config <tool> remove <requester>` deletes that
>   requester's blocks; the materializer calls it when a pack is dropped.
> - Decision 15: Any sentence a unit adds is short.

## Edits

1. **`SKILL.md`** — frontmatter (`name: tool-config`, a description that says
   when to use it, user-invocable and model-invocable, `argument-hint`); the
   contract: argument grammar (`<tool> <instruction> [for <requester>]`,
   `all [key=value …]`), the tools it owns (`mise` in T1; the list grows in T2
   and T3), block markers and requester tags, drift, removal, the stackgen lock
   record (`source: tool-config/<tool>@<stackgen version>`), and that it never
   touches a line outside a block.
2. **`references/mise.md`** — one reference folding `references/mise/`'s raw
   material: the B1 layout; what `mise` alone lands (the files under
   `assets/mise/.config/`, the task library copied verbatim, `vscode.d` only
   when `editor=vscode`); the arguments that fill `REPO_NAME`, the merge models,
   `MEMBERS`, runtimes, `PATH_ENTRIES`, `setup-<member>` aliases; the verbs —
   `add tool <name> <version> to <env|all environments>`,
   `add env <K>=<V> to <env>`, `set env <K>=<V>`, `add alias <name>=<cmd>`
   (dev), `remove <requester>`, `upgrade` (= `setup:all --upgrade`), `lock`; the
   lock rules (one lock, the environment union, only when missing or
   `--upgrade`); one pin per tool across environment files; the `setup:mise` and
   `setup:all` contract; graphify as a dev tool. Then `rm -r references/mise/`.

## Verification

- `MISE_ENV=dev mise run p:plugins:check` green (the skill's frontmatter is
  strict YAML)
- `grep -rn "conf.d/<pack>\|stacks/toolchain-manager" plugins/stackgen/skills/tool-config`
  prints nothing

## Guardrails

- `plugins/**/*.md` is not formatted — match the fold width by hand; no code
  span wraps a line; no line caps on a skill — split into references instead.
- Touch nothing outside the owned paths (`assets/**` is U8's).
- Delete with `rm`, never `git rm`; no `git checkout`/`restore`.

## Commit

`feat: stackgen:tool-config — the contract and the mise reference` — written by
the orchestrator after the wave gate.
