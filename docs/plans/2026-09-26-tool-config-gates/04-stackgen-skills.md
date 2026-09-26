# U4 — stackgen's own skills and assets stop naming the gate packs

- **Wave:** 1
- **Depends on:** —
- **Owns:**
  `plugins/stackgen/skills/{stackgen-stack-template,stackgen-stack-menu,stackgen-sync}/**`,
  `plugins/stackgen/assets/{pack-format,output-tree,kinds,taxonomy}.md`,
  `plugins/stackgen/stacks/readme.md`, the prose (not the pins) of
  `plugins/stackgen/stacks/bundles/{bun,pnpm-turbo,pnpm-workspace,repo-hygiene}.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** index.md's Facts (the "Other readers" and "The bundle" lines);
  `plugins/stackgen/skills/tool-config/SKILL.md` (T1's contract).

## Ruling

> - Decision 1: The four packs move into the skill. The packs and
>   `bundles/repo-gates.md` are deleted; no tool skill is copied into target
>   repos.
> - Decision 5: The `pre-commit.d` markers retire; uv's fragment becomes
>   `pre-commit add hook … for uv` and is deleted.
> - Decision 3: The verb
>   `/stackgen:tool-config all add exclude [generated] <paths>` writes dprint's
>   excludes, taplo's excludes and the pre-commit global exclude; `generated`
>   also writes the gitleaks allowlist.
> - Decision 12: Any comment or sentence a unit adds is one line (B65).

## Edits

1. **stackgen-stack-template** (`SKILL.md:165`,
   `references/materializer.md:116`), **stackgen-stack-menu**
   (`SKILL.md:29,36,39,112`), **stackgen-sync** (`SKILL.md:39,134`) — the gates
   are the skill's, not a bundle; the materializer runs a pack's `tool-config:`
   hook, plugin, exclude and ignore lines like its mise lines; no `pre-commit.d`
   fragment is landed or merged.
2. **Assets** — `pack-format.md` (:34, :64, :123, :353-376, :478: the
   `pre-commit.d` fragment kind retires, a gate pack's whole config is no longer
   a payload), `output-tree.md` (:147, :256, :325-326), `kinds.md` (:267
   `repo-gate` kind, :301, :533), `taxonomy.md:250`, `stacks/readme.md`.
3. **Bundle prose** — `bun.md:32`, `pnpm-turbo.md:33`, `pnpm-workspace.md:39`,
   `repo-hygiene.md:38` stop naming `repo-gates`.

## Verification

- `grep -rn "repo-gates\|pre-commit\.d" plugins/stackgen/skills/stackgen-* plugins/stackgen/assets plugins/stackgen/stacks/readme.md`
  prints nothing
- `MISE_ENV=dev mise run p:plugins:check` green

## Guardrails

- `plugins/**/*.md` is not formatted — match the fold width by hand; no code
  span wraps a line.
- Never edit a bundle's `components:` pins (U11's) or the tool-config skill.
- Delete with `rm`, never `git rm`; no `git checkout`/`restore`.

## Commit

`feat: stackgen skills and assets hand the gates to tool-config` — written by
the orchestrator after the wave gate.
