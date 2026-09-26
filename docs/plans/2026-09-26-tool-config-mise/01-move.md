# U1 — Move the mise pack into the tool-config skill

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/stackgen/stacks/toolchain-manager/mise/**`,
  `plugins/stackgen/stacks/bundles/mise.md`,
  `plugins/stackgen/skills/tool-config/assets/mise/**` (new),
  `plugins/stackgen/skills/tool-config/references/mise/**` (new),
  `plugins/stackgen/skills/tool-config/SKILL.md` (a stub; U2 replaces it)
- **Model:** opus
- **Kind:** edit
- **Read first:** `find plugins/stackgen/stacks/toolchain-manager/mise -type f`;
  index.md's Facts.

## Ruling

> - Decision 2: The mise pack's content moves into the skill:
>   `config/.config/**` → `assets/mise/.config/**` (the landed shape),
>   `conventions.md`, `skills/mise/**` and `pack.yaml`'s facts →
>   `references/mise.md`. `plugins/stackgen/stacks/toolchain-manager/mise/` and
>   `bundles/mise.md` are deleted; no mise skill is copied into target repos any
>   more.

## Edits

1. **Move** with plain `mv`, preserving exec bits:
   `…/toolchain-manager/mise/config/.config` →
   `plugins/stackgen/skills/tool-config/assets/mise/.config`;
   `…/mise/conventions.md`, `…/mise/pack.yaml` and `…/mise/skills/mise` →
   `plugins/stackgen/skills/tool-config/references/mise/` (raw material U2 folds
   into `references/mise.md` in wave 2).
2. **Delete** the emptied `plugins/stackgen/stacks/toolchain-manager/` and
   `plugins/stackgen/stacks/bundles/mise.md` with `rm`.
3. **`plugins/stackgen/skills/tool-config/SKILL.md`** — a minimal valid stub
   (strict-YAML frontmatter `name: tool-config` and a one-line description) so
   the gate after wave 1 sees a well-formed skill; U2 replaces it in wave 2.
4. Edit no moved file's content — U2 and U8 do, in wave 2.

## Verification

- `find plugins/stackgen/stacks/toolchain-manager` prints nothing
- the moved file count equals the count before the move (report under
  `DECIDED:`); `ls -l` a task file shows the exec bit

## Guardrails

- The orchestrator commits this unit **second** in wave 1, after U5.
- Never run a formatter over a moved payload file.
- Delete with `rm`, never `git rm`; no `git checkout`/`restore`.

## Commit

`refactor: move the mise pack into stackgen:tool-config` — written by the
orchestrator, second in wave 1.
