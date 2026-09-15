# U4 — Docs

- **Wave:** 2
- **Depends on:** U1–U3
- **Owns:** `site/src/content/docs/**`, `readme.md`, `CLAUDE.md`,
  `.claude/docs/**`, `.claude/skills/**`,
  `docs/memory/decisions/2026-09-12-*.md`, and every path an earlier unit
  reported under `DOCS FALSIFIED:`. Touch nothing outside this list.
- **Model:** opus
- **Read first:** `${CLAUDE_PLUGIN_ROOT}/skills/docs-sync/SKILL.md` (vwf's),
  every `DOCS FALSIFIED:` line, then the list below.
- **Lazy-load:**
  `docs/memory/decisions/2026-09-10-init-replaces-a-diverged-helper-library.md`;
  `${CLAUDE_PLUGIN_ROOT}/assets/memory.md`.

## Ruling

Quoted from index.md:

> **Two reversals, confirmed by the user 2026-09-12:** [the 2026-09-10 helper
> decision — unmapped calls move to `_scripts/local`; the "already owned, never
> overwritten" rule — a per-file offer.] The docs unit writes one decisions doc
> covering both.

Plus rulings 1–7 as the facts the docs now state.

## Edits

1. Run `vwf:docs-sync` over the run's branch delta; apply its findings.
2. Apply every `DOCS FALSIFIED:` line from U1–U3.
3. The survey's list:
   - `site/src/content/docs/plugins/vwf.md` — the `/vwf:setup` Step 0 passage
     (six predicates); the `/vwf:doctor` section (predicates 5 and 6, the "not
     checked — no lockfile" outcome); the `init` existing-repo passage (the
     sidecar, repo-only tasks kept, diverged pack files offered, the kept
     record).
   - `.claude/skills/vwf-plugin/**` — wherever doctor's or init's brownfield
     behaviour is summarised.
   - `readme.md`, `CLAUDE.md` — only if they enumerate doctor's checks or init's
     passes (CLAUDE.md names "the four baseline predicates" — make it six).
   - `CLAUDE.md`'s `init` paragraph says init "asks six questions"; plan 2
     changed the count — confirm what plan 2's docs unit wrote and leave it
     consistent.
4. **Decisions doc**
   `docs/memory/decisions/2026-09-12-init-brownfield-sidecar-and-diverged-files.md`
   per `assets/memory.md`: both reversals named as reversals with the user's
   quoted words, the three rules, doctor's two predicates, and the ruling-4
   outcome (the existing shape used, or the UNRESOLVED that parks a
   `config_format` bump).

## Verification

- `grep -rn 'four baseline' site/src/content/docs CLAUDE.md readme.md .claude`
  is empty.
- `grep -rn 'never overwritten' site/src/content/docs .claude` is empty.
- `mise run p:site:check` green.
- `mise x -- mise run code:precommit` twice, clean on the second.
- `test -f docs/memory/decisions/2026-09-12-init-brownfield-sidecar-and-diverged-files.md`.

## Guardrails

- Do not touch version files, generated files, or `plugins/**`.
- Site frontmatter is strict YAML; relative `.md` links only inside the
  collection.
- Delete with `rm`, never `git rm`.

## Commit

`docs: init's brownfield rules and doctor's six predicates` — written by the
orchestrator after the wave gate. Type `docs`; no scope.
