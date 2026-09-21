# U2 — init passes: pass 6 in every mode, the section resolver, the already-there rules

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/vwf/skills/init/references/existing-repo.md`,
  `plugins/vwf/skills/init/references/fragments-and-sections.md`,
  `plugins/vwf/skills/init/references/readme-and-license.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** the three owned files, top to bottom, before editing —
  `existing-repo.md:84`, pass 1, pass 6 (`:271-283`, `:342-374`), the
  `kept_files` record (`:385-406`, `:826-838`, `:953`);
  `fragments-and-sections.md:31-63`; `readme-and-license.md:32-35`, `:51-56`,
  `:69-108`.
- **Lazy-load:** `plugins/vwf/skills/init/SKILL.md` mode table (U1's — cite the
  mode names);
  `plugins/stackgen/stacks/repo-hygiene/repo-hygiene/conventions.md:77-107` (the
  section table).

## Ruling

Decision 1 — Mode, the part this unit carries: "`source` runs the new-repo
landing **plus** the read-before-land passes of the existing pipeline that have
something to read (pass 1 survey, pass 6 offer; the sidecar and rename passes
only when a task library exists)."

Decision 2 — Stack read: "… The read drives the `.gitignore` sections (the
hygiene table, which gains go/rust/swift rows if absent) …"

Decision 5 — Conflicts: "Pass 6's replace-or-keep offer, its default rule and
its `kept_files` record run in **every** mode over every path the materializer
reports as a conflict — `blank` included; the plan shows one row per conflict
before consent. `SECURITY.md` and `README.md` get the already-there rule LICENSE
has (`readme-and-license.md:51-56`): kept, never replaced, reported."

## Edits

1. **`existing-repo.md`** — the lead-in (`:84` region) names the file as the
   `shaped` mode's pipeline **and** the home of the passes `source` and `blank`
   borrow; each borrowed pass (pass 1, pass 6, the `kept_files` record) gains
   one sentence saying which modes run it and on what input (the materializer's
   conflict list, in `blank` and `source`; the survey's diverged list, in
   `shaped`). Pass 6's input is generalised from "a pack-owned file whose
   content diverged" to "a path offered to this pass" so both callers fit; the
   compare, the default rule and the outcomes are unchanged. The sidecar and
   rename passes state their precondition (a task library exists) in one line
   each.
2. **`fragments-and-sections.md:31-63`** — the section resolver takes the stack
   read's language set as its input (from U1's new section, cited by name)
   instead of "the pinned packs"; `:49-63` (skip present) stands.
3. **`readme-and-license.md`** — `:69-97` SECURITY gains the already-there rule
   in LICENSE's words (`:51-56`): an existing `SECURITY.md` is kept, never
   replaced, reported as such, and the contact question is still asked only when
   the file will be written; `:32-35` README: an existing `README.md` in `blank`
   or `source` mode is kept as-is and never stubbed — the rename is the `shaped`
   pipeline's (pass 2) and is not run here — one sentence.

## Verification

- `mise run p:plugins:check` green.
- `grep -n "blank\|source\|shaped" plugins/vwf/skills/init/references/existing-repo.md`
  — the three modes named at the lead-in and at pass 1 and pass 6.
- `grep -n "stack read" plugins/vwf/skills/init/references/fragments-and-sections.md`
  — the resolver names its new input.
- `grep -n "kept, never replaced\|already there" plugins/vwf/skills/init/references/readme-and-license.md`
  — a hit in the SECURITY section.

## Guardrails

- Do not edit `SKILL.md` or `new-repo.md` (U1) — cite by section name.
- Do not edit a pack (U4) or the config schema (U3).
- No doc — `DOCS FALSIFIED:` lines.
- `plugins/**/*.md` is not dprint-formatted: match the fold width by hand;
  strict-YAML frontmatter untouched.
- Delete with `rm`, never `git rm`.

## Commit

`feat: init passes — pass 6 and kept_files in every mode; sections from the stack read`
— written by the orchestrator after the wave gate. Type from
`.config/git-conventional-commits.yaml`; no scopes.
