# U6 — setup's Step 0 offers init when any member has drifted

- **Wave:** 2
- **Depends on:** U1
- **Owns:** `plugins/vwf/skills/setup/SKILL.md`,
  `plugins/vwf/skills/setup/references/onboard-pipeline.md`
- **Model:** opus
- **Read first:** both owned files, top to bottom; then
  `plugins/vwf/skills/init/SKILL.md` as U1 left it (Step 0 and the report).
- **Lazy-load:** `plugins/vwf/assets/membership.md:64-83` (base-repo resolution
  — setup already cites it at `onboard-pipeline.md:90-91`).

## Ruling

Quoted from `index.md`:

> **1** — init walks members itself: one survey across the base and every
> member, one plan with a section per repo, one consent, per-repo report
> sections.

> **7** — All six evaluate per repo — the base and every locally-present member
> — grouped by repo in §5, one `/vwf:setup reshape` remedy.

Reversal 1, from the Goal: "the shape is per repo, but the **run** is per
product."

## Edits

1. **`SKILL.md` Step 0** (`:79-108`): the shape check reads the three slugs in
   the **base's** lockfile and in **each locally-present member's** lockfile,
   and evaluates doctor's six predicates per repo (cite doctor; restate
   nothing). The offer fires when **any** repo is missing a slug or fails a
   predicate, and the offer names which repos. Keep "this offer and
   `/vwf:setup reshape` are the only two ways it is reached" (`:100-108`)
   verbatim in meaning.
2. **`SKILL.md` reshape** (`:67-72`): "invoke `/vwf:init` — which surveys **the
   base and every member**, shows its one plan and takes its own consents —
   print init's report verbatim, and stop." A run of `/vwf:setup reshape`
   started inside a member resolves the base per the membership asset and runs
   from there; say so.
3. **`SKILL.md` `:57-61`** (repo shape is init's): add one sentence — on a
   multi-repo product the shape is per repo and one init run reaches them all.
4. **`SKILL.md` `:156-160`** (setup writes each member's `vwf-membership.yaml`):
   unchanged; verify it still reads true.
5. **`onboard-pipeline.md` `:49-56`** (Step 0 only checks, offers init on
   missing/behind): the same per-repo wording as edit 1, in one sentence.
   `:168-170` (an existing repo is what init surveys): "each existing repo in
   the product".

## Verification

- `mise run p:plugins:check` green.
- `grep -n "every member" plugins/vwf/skills/setup/SKILL.md` hits in Step 0 and
  in the reshape paragraph.
- `grep -n "only two ways" plugins/vwf/skills/setup/SKILL.md` still hits.
- `argument-hint: "[reshape]"` in the frontmatter is unchanged.

## Guardrails

- Do not touch `plugins/vwf/skills/doctor/**` (U5) or `init/**` (landed).
- Do not forward a target directory or a flag through setup — the 2026-09-06
  ruling on that stands; members are reached by walking, not by naming one.
- Name no tool.
- Strict-YAML frontmatter; `plugins/**/*.md` is not dprint-formatted.
- Delete with `rm`, never `git rm`. Stage nothing, commit nothing.

## Commit

`feat: setup offers init when any member has drifted` — written by the
orchestrator after the wave gate.
