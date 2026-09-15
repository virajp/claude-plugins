# U4 — the per-repo stub, licence, security contact, and the merges' scope

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/vwf/skills/init/references/readme-and-license.md`,
  `plugins/vwf/skills/init/references/fragments-and-sections.md`
- **Model:** opus
- **Read first:** both owned files, top to bottom, before editing.
- **Lazy-load:** `plugins/vwf/skills/init/SKILL.md` "The questions" (committed
  version — U1 edits it concurrently; read only to match question numbering).

## Ruling

Quoted from `index.md`:

> **4** — Still seven rounds. Questions 2, 6 and 7 list one row per repo inside
> their single round … Questions 1 and 3 apply per repo that resolved to mode
> new.

> **1** — … one plan with a section per repo …

## Edits

1. **`readme-and-license.md`**:
   - The stub (`:8-14`): written at **each** repo's root that resolved to mode
     new, from that repo's own brief (question 3's row for it). A member that
     already has a readme is untouched, as today.
   - The licence (`:34-36` and around): question 6 is one round with one row per
     repo; each repo takes its own answer; "none" on a row writes nothing in
     that repo; a repo that already carries a licence file is listed as kept,
     never replaced — say so in one sentence.
   - The security contact: one row per repo, each defaulted from **that repo's**
     origin; declining a row writes nothing in that repo.
   - `<HOLDER>` and `<YEAR>`: per repo, from that repo's answers.
2. **`fragments-and-sections.md`**: the three merge algorithms run **per repo**,
   each against that repo's own `.config/` (`:100`, `:147` — the globs are
   relative to the repo being shaped, which is now "this repo" rather than "the
   repo"). One sentence at the top; the algorithms themselves do not change. The
   idempotency notes (`:126-130`, `:203-207`) hold per repo.

## Verification

- `mise run p:plugins:check` green.
- `grep -n "per repo" plugins/vwf/skills/init/references/readme-and-license.md`
  hits at least once; same for `fragments-and-sections.md`.
- No heading text changed in either file.

## Guardrails

- Do not touch `SKILL.md`, `new-repo.md` or `existing-repo.md`.
- Name no tool. The licence texts are "the hygiene pack's two texts".
- `plugins/**/*.md` is not dprint-formatted — match the fold width by hand.
- Delete with `rm`, never `git rm`. Stage nothing, commit nothing.

## Commit

`feat: init asks the licence and the security contact per repo` — written by the
orchestrator after the wave gate.
