# U6 — init lands the universal tools through stackgen:tool-config all

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/vwf/skills/init/**`
- **Model:** opus
- **Kind:** edit
- **Read first:** `init/SKILL.md` (the adapter fetch :290–310, :745–771, the
  config keys :33–89); `references/new-repo.md` (:80–110 the slug order, §7 the
  marked-position list, §10, §11); `references/existing-repo.md` (the splice
  test, the reshape rows); `references/tool-configs.md`; index.md's Facts.

## Ruling

> - Decision 7: init calls `/stackgen:tool-config all` with its answers (repo
>   name, members, merge models, runtimes, editor, forge, secrets, update bot)
>   as arguments — `all` lands every tool the skill owns (mise, in T1) — then
>   fetches the unconditional bundles that remain through the stack adapter.
>   Marked positions become arguments. vwf still names no tool.
> - Decision 15: Any sentence a unit adds is short.

## Edits

1. **Landing order** (`new-repo.md:80-110`, `SKILL.md:745-771`) — first
   `/stackgen:tool-config all` with the answers, then the remaining
   unconditional slugs through the adapter (today `repo-gates`, `repo-hygiene`;
   T2 and T3 shrink this). Name no tool: say "every tool
   `stackgen:tool-config all` owns".
2. **Marked positions** — the §7 positions the skill now fills are passed as
   arguments; init's splice steps for them retire; the ones still in adapter
   payloads (licence, security contact, commit scopes) stay until T2/T3.
3. **Reshape** (`existing-repo.md`) — a repo whose stackgen lock records the
   `mise` slug is migrated by calling `tool-config all` and letting the skill
   offer its drift rows; old `conf.d/<pack>.toml` files are folded by the
   skill's migration, with consent.
4. **Shape detection** (`SKILL.md:214-215`) — "shaped" reads the stackgen lock
   for `source: tool-config/…` records as well as bundle slugs.
5. **§10** — the bootstrap still runs `MISE_ENV=dev mise run setup:all` (B1).

## Verification

- `MISE_ENV=dev mise run p:plugins:check` green (rule 10: vwf names no tool)
- `grep -rn "mise" plugins/vwf/skills/init` shows only command lines B1 put
  there (`mise run …`) and no tool doctrine

## Guardrails

- `plugins/**/*.md` is not formatted — match the fold width by hand; no code
  span wraps a line.
- Touch nothing outside `plugins/vwf/skills/init/**`.
- Delete with `rm`, never `git rm`; no `git checkout`/`restore`.

## Commit

`feat: vwf init lands the universal tools through stackgen:tool-config` —
written by the orchestrator after the wave gate.
