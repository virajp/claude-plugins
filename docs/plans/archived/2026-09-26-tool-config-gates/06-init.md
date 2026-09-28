# U6 — init lands the gates through tool-config all

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/vwf/skills/init/**`
- **Model:** opus
- **Kind:** edit
- **Read first:** `SKILL.md:487-489,730,746`;
  `references/new-repo.md:82-88,405`;
  `references/existing-repo.md:199-221,874-906`;
  `references/tool-configs.md:36-56`;
  `references/fragments-and-sections.md:120-176`; T1's edits to init (the
  `/stackgen:tool-config all` call); index.md's Facts.

## Ruling

> - Decision 7: init lands the gates through the `/stackgen:tool-config all`
>   call T1 introduced (`all` now lands the five tools) and fetches only the
>   hygiene bundle through the adapter; the commit scopes it derives pass as an
>   argument. Its adoption table (`tool-configs.md`) stays in init, each row
>   naming the skill as the owner of the landed file. The `pre-commit.d` merge
>   section retires.
> - Decision 12: Any sentence a unit adds is one line (B65).

## Edits

1. **Fetch order** (`SKILL.md:746`, `new-repo.md:82-88`) — no `repo-gates` slug;
   `tool-config all` covers the gates; only hygiene is still fetched.
2. **Commit scopes** (`SKILL.md:487-489,730`, `new-repo.md:405`,
   `existing-repo.md:874-906`) — derived as today, passed to `all` as the
   `scopes=` argument; init no longer writes
   `.config/git-conventional-commits.yaml` itself.
3. **`tool-configs.md`** — rows :38, :40-42 and the dprint note :52-56 name
   `stackgen:tool-config` as the owner; the move-and-offer behaviour is
   unchanged.
4. **`fragments-and-sections.md:120-176`** — the `pre-commit.d` merge retires;
   say in one line that packs call `pre-commit add hook`.
5. vwf still names no tool outside rule 10's exemptions.

## Verification

- `grep -rn "repo-gates\|pre-commit\.d" plugins/vwf/skills/init` prints nothing
- `MISE_ENV=dev mise run p:plugins:check` green (rule 10)

## Guardrails

- `plugins/**/*.md` is not formatted — match the fold width by hand; no code
  span wraps a line.
- Touch nothing outside `plugins/vwf/skills/init/**`.
- Delete with `rm`, never `git rm`; no `git checkout`/`restore`.

## Commit

`feat: init lands the gates through stackgen:tool-config` — written by the
orchestrator after the wave gate.
