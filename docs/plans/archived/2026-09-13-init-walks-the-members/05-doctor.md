# U5 — doctor evaluates the six shape predicates per member

- **Wave:** 2
- **Depends on:** U1
- **Owns:** `plugins/vwf/skills/doctor/SKILL.md`,
  `plugins/vwf/skills/doctor/references/stack-checks.md`
- **Model:** opus
- **Read first:** both owned files, top to bottom, before editing; then
  `plugins/vwf/skills/init/SKILL.md` as U1 left it (Step 0 — the member
  resolution rule you cite), and `plugins/vwf/assets/membership.md`.
- **Lazy-load:**
  `plugins/vwf/skills/doctor/references/code-intelligence.md:22-32` (the
  existing per-present-member pattern for graphify — mirror its wording for
  absent members).

## Ruling

Quoted from `index.md`:

> **7** — All six evaluate per repo — the base and every locally-present member
> — grouped by repo in §5, one `/vwf:setup reshape` remedy. An absent member is
> a blind spot, never a finding.

> **2** — `.gitmodules` paths (walked recursively …) **union** the `members:`
> list in `.config/vwf.yaml`, deduped on realpath. A path in one source and not
> the other is reported as a membership disagreement, never shaped.

## Edits

1. **`stack-checks.md` — "The repo shape against its baseline"** (`:233-352`):
   - The opening paragraph: the six sub-checks run **per repo** — the base and
     every locally-present member, resolved the way init resolves them (cite
     init's Step 0 by name; do not restate ruling 2's rule beyond one clause).
     Each finding is printed under its repo. The remedy stays one line.
   - (a) pack versions: each repo's own `.claude/stackgen/lock.yaml`; a member
     with no lockfile reads `not checked — no lockfile` under that member.
   - (b) project ids: each repo's own generated surfaces against the ids that
     repo owns (the base registry's `members[].projects` for a member where
     declared — cite init §7 for the source order rather than restating it).
   - (c) branches: per repo.
   - (d) `REPO_NAME`: per repo, each its own environment block.
   - (e) content drift: per repo; `kept_files` is read from the **base's**
     config with the member path as prefix (matches U3).
   - (f) `MERGE_MODEL` / `MEMBERS`: per repo; the `MEMBERS` row stays
     siblings-only and is evaluated on the base alone (a member declares no
     members unless it has its own `.gitmodules`).
   - Add the **member flags** to (f) or as its own sentence under (b): the
     base's aggregator flag list and alias list are compared against the
     resolved members; a list naming project ids where members exist is drift
     (ruling 5, via U2's §7).
   - Absent member: one sentence — a blind spot, said in §5's output as
     `<member> — not present, not checked`, never a finding; mirror
     `code-intelligence.md:27-32`.
2. **`SKILL.md`**:
   - §5's summary (`:172-177`): "per repo — the base and each locally-present
     member".
   - `:208-212` (reshape is the door): add that a reshape now walks the members,
     so the one remedy covers a member's drift too.
   - `:111-114` (presence is not a finding): unchanged; verify it still reads
     true against the new §5 wording.

## Verification

- `mise run p:plugins:check` green.
- `grep -n "per repo" plugins/vwf/skills/doctor/references/stack-checks.md` hits
  in the "repo shape" section's opening.
- `grep -n "not present, not checked" …/stack-checks.md` hits once.
- The six sub-check labels (a)–(f) are unchanged in letter and title — the
  manual and `setup/SKILL.md` cite "six predicates".

## Guardrails

- Do not touch `plugins/vwf/skills/setup/**` (U6) or `init/**` (wave 1, landed).
- Do not add a seventh predicate; the count "six" is cited in nine places U8
  keeps true.
- Name no tool.
- `plugins/**/*.md` is not dprint-formatted — match the fold width by hand.
- Delete with `rm`, never `git rm`. Stage nothing, commit nothing.

## Commit

`feat: doctor evaluates the six shape predicates per member` — written by the
orchestrator after the wave gate.
