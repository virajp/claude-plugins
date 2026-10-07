# U6 — Docs

- **Wave:** 4
- **Depends on:** R, U2, U3, U4, U5
- **Owns:** `site/src/content/docs/**`, `.claude/**` except
  `.claude/skills/plugin-authoring/references/checks.md`, `CLAUDE.md`,
  `readme.md`, `docs/memory/decisions/2026-10-05-*.md` (new files only)
- **Model:** opus
- **Kind:** edit
- **Read first:** `plugins/vwf/skills/docs-sync/SKILL.md`;
  `plugins/vwf/assets/memory.md`; index.md's Goal and reversals.

## Ruling

> The three reversals in index.md's Goal, confirmed at the gate 2026-10-05 — one
> decision doc each.

> F1–F13, quoted from index.md's Assumed decisions.

## Edits

1. **Run `vwf:docs-sync`** over the branch delta; apply its findings plus every
   `DOCS FALSIFIED:` line U1–U5 returned.
2. **The survey's list**: `site/src/content/docs/plugins/vwf.md` (every pointer
   in index.md's facts); the how-tos `brownfield/migrate-old-vwf-repo.md:75-82`
   (say plan 4's reshape is coming; until then an old-layout repo stays as it
   is), `brownfield/onboard-existing-codebase.md:115`,
   `greenfield/single-repo.md:91-95`, `greenfield/multi-repo.md:341`,
   `operate/choosing-your-stack.md:59`, `plugins/mempalace.md:80`;
   `.claude/skills/vwf-plugin/SKILL.md:114, 122-172, 241` and
   `references/{skills-and-agents,assets,dependencies}.md` per the facts;
   `.claude/skills/stackgen-plugin/SKILL.md` for `values:` and rendered records;
   `CLAUDE.md` and `readme.md` where they describe init's answers, `setup:ai` or
   renovate.
3. **Decision docs** (new): `2026-10-05-stackgen-yaml-replaces-vwf-answers.md`
   (reversal 1, F7), `2026-10-05-shaped-means-stackgen-yaml.md` (reversal 2, F2,
   F3, F4), `2026-10-05-pack-values-and-plugin-subtasks.md` (reversal 3, F1, F5,
   F10), `2026-10-05-doctor-drift-by-preview.md` (F6).

## Verification

- `mise run p:site:check` green.
- `mise run code:precommit` green.
- The full wave gate.

## Guardrails

- Touch nothing under `plugins/`; a falsified passage there is a `GAP:`.
- Never edit an existing decision doc — add new ones.
- `CLAUDE.md`, `readme.md` are dprint-formatted: keep code spans on one line;
  never end a table cell in a bare `*`.
- Delete with `rm`, never `git rm`.

## Commit

`docs: vwf's callers on the template renderer — site, maintainer docs, decisions`
