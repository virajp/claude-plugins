# U1 — init hands the repo shape to bootstrap

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/vwf/skills/init/**`
- **Model:** opus
- **Kind:** edit
- **Read first:** `SKILL.md`, `references/tool-configs.md`,
  `references/new-repo.md`, `references/existing-repo.md`,
  `references/readme-and-license.md`.

## Ruling

> - Decision 1: init surveys the repo and hands one `bootstrap: adopt`
>   instruction to `docs/sync/vwf.md`. It keeps CONTRIBUTING, SECURITY, the
>   licenses, `.config/vwf.yaml` and the forge pass.
> - Decision 2: init no longer ships `.github/ISSUE_TEMPLATE/*`; bootstrap's
>   github or gitlab tool lands them.
> - Decision 3: Shaped means `.config/bootstrap.toml` exists. A repo with
>   `.config/stackgen.yaml` and no `.config/bootstrap.toml` is migrated by
>   `/vwf:setup reshape`: it sends `bootstrap: adopt` with the values read from
>   `stackgen.yaml`, then deletes `stackgen.yaml` on the user's consent.
> - Decision 6: vwf uses bootstrap's names: `setup` (was `setup:all`), `code`
>   (was `code:all`), `code:format`, `code:lint`, `setup:worktree` with `setup`
>   as the fallback.
> - Decision 8: The procedure — clone, `docs/sync/vwf.md`, the three instruction
>   types — is written once, in
>   `plugins/vwf/skills/init/references/bootstrap-handoff.md`, which replaces
>   `references/tool-configs.md`.
> - Decision 9: the adopt instruction shape in `index.md`.

## Edits

1. **`references/bootstrap-handoff.md`** — new: the clone
   (`git clone --depth 1 git@github.com:virajp/bootstrap.git` into `mktemp -d`,
   removed afterwards), "read `docs/sync/vwf.md` and follow it with the
   instruction", the three instruction types (`adopt` with its shape from
   `index.md`; `add tools`; `remove tools`), each with `reason:`, and the rule
   that a plugin never edits `.config/bootstrap.toml` itself and relies on
   nothing else in bootstrap. Delete `references/tool-configs.md` with `rm`.
2. **`SKILL.md`** — replace the `tool-config all` call (:629-634) and every
   `stackgen.yaml` read/write (:39, :225-250, :370-406) with: survey, ask the
   values the adopt instruction needs, hand off per `bootstrap-handoff.md`, then
   land vwf's own hygiene assets and `.config/vwf.yaml`, then the forge pass
   (forge read from the selected `github`/`gitlab` tool). Shaped means
   `.config/bootstrap.toml` exists. Multi-repo: one adopt per repo, members
   first, per bootstrap's own order. Rewrite :5-6, :116, :481, :564-565.
3. **`references/new-repo.md`**, **`references/existing-repo.md`** — the same
   change at the lines the facts list; §9/§10 (the `setup:all` aggregator)
   become `mise run setup`.
4. **`references/readme-and-license.md`** (:37),
   **`assets/hygiene/CONTRIBUTING.md`** (:38) — no `stackgen.yaml` or
   task-library wording; use bootstrap task names.
5. **Delete** `assets/hygiene/.github/` with `rm -r`, and every passage that
   lands or lists those templates.

## Verification

- `mise run p:plugins:check` — green.
- `grep -rnE 'tool-config|stackgen\.yaml|setup:all|code:all|code:(format|lint):all|ISSUE_TEMPLATE' plugins/vwf/skills/init`
  — no hit, except the migration passage that reads a legacy `stackgen.yaml`.

## Guardrails

- Do not touch `plugins/vwf/skills/{setup,doctor}/**` or `plugins/stackgen/**`.
- `plugins/**/*.md` is not formatted; match the surrounding fold width by hand.
  Strict-YAML frontmatter: do not break `SKILL.md`'s.
- Delete with `rm`, never `git rm`.

## Commit

`feat: init hands the repo shape to bootstrap`
