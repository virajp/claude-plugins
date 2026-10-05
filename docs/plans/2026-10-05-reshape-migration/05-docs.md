# U4 — Docs: the chain-wide sweep

- **Wave:** 3
- **Depends on:** R, U2, U3
- **Owns:** `site/src/content/docs/**`, `.claude/**`, `CLAUDE.md`, `readme.md`,
  `docs/memory/decisions/2026-10-05-*.md` (new files only), and any passage
  under `plugins/**` the retired-name grep still hits after U2 and U3
- **Model:** opus
- **Kind:** edit
- **Read first:** `plugins/vwf/skills/docs-sync/SKILL.md`;
  `plugins/vwf/assets/memory.md`; the four chain plans' index.md (decisions
  only).

## Ruling

> G7 — The docs unit runs docs-sync over the **whole chain's** delta (from the
> commit before plan 1's first unit to this branch) and a repo-wide retired-name
> grep that must be empty outside `docs/plans/archived/`, `docs/memory/`,
> `docs/plans/2026-10-0*` folders and changelogs.

User, verbatim: *"Ensure that all changes are done, including docs & site"*.

## Edits

1. **Find the chain's base** —
   `git log --format=%H -n1 --grep "docs: change plan — tool-config-template-engine"`
   is the approval commit; its parent is the base. Run `vwf:docs-sync` over
   `<base>..HEAD`; apply every finding inside Owns.
2. **The migration how-to** —
   `site/src/content/docs/how-to/brownfield/migrate-old-vwf-repo.md` rewritten
   for G1–G6: what reshape shows, the `conf.d/repo/` folder, the `needs-edit`
   rows, the older-layout refusal;
   `site/src/content/docs/plugins/{vwf,stackgen}.md` sections on reshape.
3. **The retired-name sweep** — run, from the repo root:
   `rg -n "apply-entries|add-exclude|add-hook|add-linter-ignore|add-tool|add-env|set-env|add-alias|machine_env|MARKED POSITION|update_bot|update-bot|renovate|tools\.dev\.toml|tools\.toml|env\.dev\.toml|shell_alias\.dev\.toml|RUNTIME_BLOCK|PATH_ENTRIES|MEMBER_ALIASES|keep-existing:|source: tool-config|tool-config check|code:lint\b[^:]|code:format\b[^:]|setup:ai\b[^:]|doppler" --glob '!docs/plans/**' --glob '!docs/memory/**' --glob '!**/CHANGELOG*' --glob '!scripts/src/fixtures/**' --glob '!.claude/worktrees/**'`
   — every hit is either fixed (inside Owns) or a passage that legitimately
   names the old model as history (say which in `DECIDED:`); an `add-…` hit that
   is a different verb (e.g. a git command) is left, named.
4. **Decision doc** — `2026-10-05-reshape-migrates-v2-layout.md`: G1–G4, G2's
   scope rule, the user's words.

## Verification

- The sweep's command prints only the hits `DECIDED:` justifies.
- `mise run p:site:check` green; `mise run code:precommit` green.
- The full wave gate.

## Guardrails

- Never edit an existing decision doc — add new ones.
- `CLAUDE.md`, `readme.md` and `.claude/**` docs are dprint-formatted: keep code
  spans on one line; never end a table cell in a bare `*`. `plugins/**/*.md` is
  not: match the fold width by hand.
- Delete with `rm`, never `git rm`.

## Commit

`docs: the template chain's last sweep — migration how-to, site, maintainer docs`
