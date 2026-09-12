# U7 — the mise pack: member flags and aliases name member repos

- **Wave:** 2
- **Depends on:** —
- **Owns:** `plugins/stackgen/stacks/toolchain-manager/mise/pack.yaml`,
  `plugins/stackgen/stacks/toolchain-manager/mise/config/.config/mise/tasks/setup/all`,
  `plugins/stackgen/stacks/toolchain-manager/mise/config/.config/mise.dev.toml`,
  `plugins/stackgen/stacks/toolchain-manager/mise/skills/mise/SKILL.md`,
  `plugins/stackgen/stacks/toolchain-manager/mise/skills/mise/references/task-library.md`,
  `plugins/stackgen/stacks/toolchain-manager/mise/skills/mise/references/config-files.md`,
  `plugins/stackgen/stacks/toolchain-manager/mise/conventions.md`,
  `plugins/stackgen/stacks/bundles/mise.md`. The orchestrator regenerates
  `plugins/stackgen/stacks/inventory.md` before this unit's commit; the unit
  does not touch it.
- **Model:** opus
- **Read first:** every owned file, top to bottom. In `setup/all` read the whole
  file; in the three skill files and `conventions.md` read the passages the
  survey pointed at and their surrounding sections.
- **Lazy-load:**
  `plugins/stackgen/stacks/toolchain-manager/mise/config/.config/mise.toml:125-142`
  (the `MEMBERS` block — read to confirm it needs **no** edit; ruling 11).

## Ruling

Quoted from `index.md`:

> **5** — Filled from the resolved **member repos**, one flag and one alias per
> member, never from project ids. A reshape rewrites flags an earlier run wrote
> from project ids, as a rewrite row. Project ids still fill `p:<slug>:*` and
> `REPO_NAME` in each repo.

> **11** — Unchanged: empty where `.gitmodules` exists, the sibling paths from
> `members:` otherwise. Ruling 5 changes the flags and aliases only.

> **15** — `1.2.0` → `1.2.1`: the change is comment and prose, no task behaviour
> moves. `pack.yaml`, the bundle pin and the regenerated inventory land in
> **one** commit — the orchestrator regenerates the inventory before committing
> U7.

## Edits

1. **`config/.config/mise/tasks/setup/all:8-17`** — the comment block. "One
   member flag per project is added here when this repo has members. The ids
   come from the project registry when there is one, else the member directory
   name — the same list `[shell_alias]` gets its `setup-<id>` aliases from"
   becomes: one flag per **member repo** — each submodule, or each path the
   `MEMBERS` list names — named by that member's slug; the same list the
   `setup-<slug>` aliases come from; the orchestrator that shapes the repo fills
   both. Keep the two example lines; keep the single-project sentence.
   Comment-only: no executable line changes.
2. **`config/.config/mise.dev.toml:40-50`** — the alias template comment: same
   correction, if and only if its text ties the alias list to project ids.
   Otherwise leave the file untouched and say so in `DECIDED:`.
3. **`skills/mise/SKILL.md:147, 155-162`** — the marked-positions passage: the
   member flags and aliases take the member repos; `MEMBERS` stays as described.
4. **`skills/mise/references/task-library.md:277-302`** and **`:566-575`** — the
   flags come from the members, not from the ids; the ids still name the
   `p:<id>:*` groups.
5. **`skills/mise/references/config-files.md:93-97, 114-120`** — confirm
   `MEMBERS` semantics are unchanged; edit only a sentence that ties the
   **aliases** to project ids, if one exists.
6. **`conventions.md:52`** — "member flags share the id token" becomes the
   member's slug token.
7. **`pack.yaml`** — `version: 1.2.0` → `version: 1.2.1`.
8. **`stacks/bundles/mise.md:7`** — `toolchain-manager/mise@1.2.0` → `@1.2.1`.

## Verification

- `mise run p:plugins:shellcheck` green (the `setup/all` edit is inside the pack
  `config/` tier: `shellcheck -x` plus `shfmt -d`).
- `mise run p:plugins:check` green — rule 4 (config tier: exec bit and shebang
  on `setup/all` intact), rule 13 (no plugin-relative citation in a landed file
  — the comment must not name `assets/`, the plugin-root token, or a `../`
  climb).
- `mise run p:plugins:inventory --check` is **expected red** until the
  orchestrator regenerates; the unit does not run the generator.
- `grep -n "per project" plugins/stackgen/stacks/toolchain-manager/mise/config/.config/mise/tasks/setup/all`
  returns nothing in the flag comment.
- `git -C <worktree> diff --stat -- plugins/stackgen/stacks/toolchain-manager/mise/config/`
  shows only `setup/all` and, at most, `mise.dev.toml`.

## Guardrails

- **Never format a `config/` payload file with this repo's dprint** — the tree
  is excluded on purpose; a formatted payload fails a shaped repo's first hook
  run. Edit comments by hand, preserve the exec bit and the shebang.
- Never write file content containing `npm` after a pipe — the normalize hook
  rewrites it; use the Edit tool.
- Do not touch `inventory.md`, `helpers` (`members()` stays), or `mise.toml`.
- Do not touch `plugins/vwf/**`.
- Delete with `rm`, never `git rm`. Stage nothing, commit nothing.

## Commit

`fix: the aggregator's member flags name member repos` — written by the
orchestrator after the wave gate, **after** it runs
`mise run p:plugins:inventory` so `pack.yaml`, `bundles/mise.md` and
`inventory.md` land in this one commit.
