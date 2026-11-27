# U3 — Generator and materializer docs: generated skills name no task, helpers.py, the NN- part form

- **Read first:** every owned file, top to bottom, before editing.
- **Lazy-load:** `~/Projects/github.com/virajp/bootstrap/docs/sync/index.md`
  (about :125-:160, the rules for repo-owned tasks; read only).

## Ruling

> D3 — none, bootstrap will generate mise skill detailing the tasks it has
> installed — a generated skill names no task. The generator and materializer
> docs name `_scripts/helpers.py` and, where they state the per-tool part
> form, `code:lint:NN-<name>` / `code:format:NN-<name>`.

> D3b — Generated only: the rule covers generated skills. Shipped skills keep
> their task names, because a person reviews them and the checker can guard
> them.

> D1 — All five to Python: rewrite all five as `deploy.py` / `icons.py` uv
> scripts in bootstrap's form (standard library only, imports `helpers`, mode
> 755), with the same names, flags and exit codes, and the same output plus
> M51's success line (D22).

> D5 — Python uv only: each file under a pack's `p/_project/` must be
> `<name>.py`, mode 755, with the `#!/usr/bin/env -S uv run --script`
> shebang.

> D4 — The units cite the skill as `.claude/skills/mise/` and assume nothing
> more about it.

## Edits

1. **`skills/stackgen-stack-template/references/generator.md`** — where a
   generated component's skill is described (about :129-:131 and :167-:168):
   a generated skill names no task, not even an aggregate; the repo's mise
   skill, `.claude/skills/mise/`, which bootstrap writes, describes the tasks.
2. **`assets/kinds.md`** — the topics that tell a generated skill to cover or
   invoke task names (about :105, :264, :323-:325, :472-:475, :499) say the
   topic is covered without naming a task, and point to the repo's mise skill.
   A topic stays; only the task naming goes.
3. **`skills/stackgen-stack-template/SKILL.md`** (about :225-:245) and
   **`assets/pack-format.md`** (:38, :81) — a pack's `config/` tier holds only
   `p/_project/` tasks, each a Python uv script `<name>.py` (D5); the example
   path `config/.config/mise/tasks/p/_project/deploy` becomes `…/deploy.py`.
4. **`references/materializer.md`** — the landing example (:57, :78):
   `p/_project/deploy.py` lands as `p/<id>/deploy.py` and runs as
   `p:<id>:deploy`; the gate-task form (about :141-:161) reads
   `code:lint:NN-<name>` / `code:format:NN-<name>`. Where it lands a
   `p/_project/<name>.py`, it also says (D23): an old landed task file with
   the same name and no extension under `.config/mise/tasks/p/<id>/` is shown
   as replaced, and removed with plain `rm` on the user's consent, because
   mise runs the file without the extension first and so hides the `.py`.
5. **`references/bootstrap-handoff.md`** (:3-:9, :34-:35) and
   **`assets/output-tree.md`** (:149, :169) — a task a pack ships is a Python
   uv script that imports bootstrap's `_scripts/helpers.py`; remove every
   statement that it sources `_scripts/helpers`.
6. **`skills/stackgen-sync/SKILL.md`** (D23) — where it diffs a component's
   `config/` files (about :136-:140, and the apply rules about :220 and
   :284-:285): a `.config/mise/tasks/p/<id>/<name>` file with no extension,
   beside the `<name>.py` the pack now ships, is shown as replaced, and is
   removed with plain `rm` on the user's consent, because mise runs the file
   without the extension first and so hides the `.py`.

## Verification

- `mise x -- mise run code:format --all` and `mise x -- mise run code:lint --all` green.
- `mise run p:plugins:check` green.
- `grep -rn '_scripts/helpers[^.]\|_scripts/helpers$\|_project/deploy[^.]' plugins/stackgen/skills plugins/stackgen/assets`
  prints nothing.

## Guardrails

- Touch nothing outside the owned paths.
- Delete with `rm`, never `git rm`. No `git checkout`, `git restore`, and no
  formatter `--fix` outside the owned paths.
- `plugins/**/*.md` is not dprint-formatted: match the surrounding fold width
  by hand.

## Commit

`docs(stackgen): generated skills name no task, and pack tasks are Python`
