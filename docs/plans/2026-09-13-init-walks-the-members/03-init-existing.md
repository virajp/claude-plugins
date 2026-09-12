# U3 — existing-repo.md: the eleven passes per repo, the plan and apply across repos

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/vwf/skills/init/references/existing-repo.md`
- **Model:** opus
- **Read first:** the owned file, top to bottom, before editing.
- **Lazy-load:** `plugins/vwf/assets/membership.md`;
  `plugins/vwf/skills/init/SKILL.md` (committed version, for heading names only
  — U1 edits it concurrently); `references/new-repo.md` §7 and §11 headings (U2
  edits it concurrently).

## Ruling

Quoted from `index.md`:

> **1** — init walks members itself: one survey across the base and every
> member, one plan with a section per repo, one consent, per-repo report
> sections.

> **6** — A clone row inside the same plan … the member is then surveyed and
> shaped in the same run.

> **9** — Members are applied and committed before the base, so the base's
> gitlinks are current when it commits. Within a repo the existing order holds —
> fills, three merges, git pass.

> **13** — A second run on a fully shaped product prints an empty plan with a
> section per repo each reading nothing, and says the product is shaped.

> **14** — `existing-repo.md`'s "gate configuration commits first, alone"
> applies **per repo**, since each repo's pre-commit is its own.

> **18** — Pass 1's scope is root **entries** — files and directories — and it
> recognises, never lists, `.claude/` (the materializer's lockfile home this run
> writes) and every resolved member path, beside `.gitmodules` and the editor
> directory; pass 10 exempts the init-authored
> `.config/mise/tasks/p/<id>/_default` slot exactly as it exempts
> `_scripts/local`; pass 9 reports a marked position unfilled only when the
> marker token is still present, never because the value equals the shipped
> default.

## Edits

1. **Opening** (`:1-10`): the three phases run across the resolved repo set —
   the survey runs its eleven passes **in each repo** that resolved to mode
   existing, the plan is **one document with one section per repo**, base first,
   and the apply touches each repo in members-then-base order (ruling 9). One
   paragraph.
2. **Survey** (`:12-15`): "Read-only, and exhaustive before anything is printed.
   Eleven passes" — add "per repo". Then, per pass, the minimum edit that scopes
   it to "the repo this pass is running in": pass 1's root (`:16-19`), pass 6's
   diff against the bundles (`:216-218`), pass 9's ids and marked positions
   (`:308-395` — the member flags and aliases now compare against the resolved
   **members**, per U2's §7; say "the members, per new-repo §7" and no more),
   pass 11's scope source and origin (`:449-450` — each repo's own
   `.config/vwf.yaml` where it has one, the base's otherwise; each repo's own
   origin).
   - `kept_files` (`:257-271`): the record lives in the **base's**
     `.config/vwf.yaml`, keyed by repo-relative path with the member path as
     prefix (`backend/.config/…`), since a member has no `.config/vwf.yaml` of
     its own under submodule linkage. State that in one sentence.
3. **An absent member** — a short paragraph after the survey's opening: its
   section carries the clone row (ruling 6, cite the membership asset for the
   command) and the words "surveyed after the clone"; at apply time the clone
   runs first, then the eleven passes run in it, then its rows print, then its
   apply proceeds. Nothing is written before its survey.
4. **Plan** (`:467-517`): the block (`:497-508`) is printed once **per repo**
   under a `── <repo> ──` heading, base first, and the totals line (`:510-516`)
   is printed per repo and then once for the product. The empty-plan rule
   becomes ruling 13.
5. **Consent** (`:519-536`): one yes covers every section. No change to the
   answer set.
6. **Apply** (`:538-618`): the order is members first, then the base (ruling 9);
   within a repo the existing order. "The gate configuration commits first,
   alone" (`:581-602`) applies **per repo** (ruling 14): say why — each repo's
   pre-commit is its own and runs its own hooks.
7. **Report** (`:619-`): point at SKILL.md's per-repo shape; do not duplicate.
8. **Resume edits — ruling 18.** Edits 1–7 are committed (`4a57960a`,
   `c4aef86b`); do not redo them. Read the committed file and make exactly these
   three changes so the fixture's step 6 reads nothing per section:
   - **Pass 1**: state its scope as root *entries* (files and directories),
     resolving the ambiguity the reviewer found between the pass's wording and
     the "Two root entries" exemption. Extend that exemption to `.claude/` — the
     materializer's lockfile home, written by this run — and to every resolved
     member path in the base (the member work trees), on the same footing as
     `.gitmodules`: recognised, never listed. Name no allowlist asset.
   - **Pass 10**: exempt the init-authored `_default` slot
     (`.config/mise/tasks/p/<id>/_default`, new-repo §7) exactly as
     `_scripts/local` is exempt — it is init's own output, not a repo-owned
     task, and is never listed as kept.
   - **Pass 9**: a marked position is reported unfilled only when its marker
     token is still present in the file; a value equal to the shipped default
     (`MERGE_MODEL` `direct`) is filled, not unfilled.

## Verification

- `mise run p:plugins:check` green.
- Every `### N — …` pass heading present before the edit is present after it,
  same text, same number.
- `grep -n "per repo" plugins/vwf/skills/init/references/existing-repo.md` hits
  in the Survey opening, the Plan, and the Apply.
- `grep -n "surveyed after the clone" …/existing-repo.md` hits once.
- Ruling 18: `grep -n '_default' …/existing-repo.md` hits in pass 10;
  `grep -n
  'marker' …/existing-repo.md` hits in pass 9; pass 1 names
  `.claude/` and the member paths as recognised entries.

## Guardrails

- Do not touch `SKILL.md`, `new-repo.md`, `fragments-and-sections.md` or
  `readme-and-license.md`.
- Keep the eleven pass headings and their numbers — the manual cites "eleven
  passes" and U8 keeps that count true.
- Name no tool; the packs are "the toolchain pack", "the gates pack", "the
  hygiene pack".
- `plugins/**/*.md` is not dprint-formatted — match the fold width by hand.
- Delete with `rm`, never `git rm`. Stage nothing, commit nothing.

## Commit

`feat: init surveys every member through the eleven passes` — written by the
orchestrator after the wave gate.
