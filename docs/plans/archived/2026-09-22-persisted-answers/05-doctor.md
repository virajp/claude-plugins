# U5 — doctor reads the answers and reports a stale one

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/vwf/skills/doctor/references/stack-checks.md`,
  `plugins/vwf/skills/doctor/SKILL.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** `stack-checks.md:401-424` — predicate (e) as the last plan
  left it: the `skipped:` sentences, the `entries:`-record sentence, and the
  provider ignore-section row that reads a config key; `:562-563` (the forge
  default-branch note, deliberately untouched); `SKILL.md:160-166` (§2, the
  stamp comparison) and §9's finding kinds, where a new drift row is described.
- **Lazy-load:** `plugins/vwf/assets/vwf-config.md` (U1's — the `answers:`
  block, by key name); `plugins/stackgen/assets/output-tree.md` (U4's — the
  `skipped:` row's `when`, by key name).

## Ruling

Decision 3, doctor's part: "Doctor's predicate (e) gains one row: a recorded
`forge` that differs from the live host, **or** a `skipped:` row whose
`when: forge` the live host now contradicts, is **drift**, remedy
`/vwf:setup reshape` — so the forge files land at the reshape, never silently
mid-pass."

Decision 6 — Doctor's provider row: "The provider ignore-section row the last
plan added reads `answers.secrets` — the key it presumed. A `config_format` 21
config with **no** `answers:` block is drift in its own right."

Decision 5, doctor's part: a config still reading `config_format` 20 is the
existing stamp check's business — not a second finding.

## Edits

1. **`stack-checks.md`, predicate (e)** — one new row, in the shape the
   predicate's other rows take: the repo's recorded `answers.repos.<repo>.forge`
   compared against the live `origin` host, **or** a lockfile `skipped:` row
   whose `when: forge` names a host the live one contradicts — either is drift,
   remedy `/vwf:setup reshape`, and say what the drift means in one clause (the
   files that axis skipped are waiting for the reshape). A repo with no remote
   at all is **not** a row — there is nothing to contradict.
2. **`stack-checks.md`, the provider row** — it reads `answers.secrets` rather
   than presuming an unnamed key.
3. **`stack-checks.md`** — one row: a config stamped `config_format` 21 with no
   `answers:` block is drift, remedy the same reshape. A config stamped 20 is
   **not** this row's business — `/vwf:doctor` §2's stamp check already reports
   the format drift, and the callers infer meanwhile.
4. **`SKILL.md`** — §9's drift paragraph names the new rows with the others, in
   one clause each; §2 is untouched, since the stamp comparison is generic.

## Verification

- `mise run p:plugins:check` green.
- `grep -n "answers" plugins/vwf/skills/doctor/references/stack-checks.md` — the
  provider row and the two new rows.
- `grep -n "config_format" plugins/vwf/skills/doctor/SKILL.md` — §2 unchanged.

## Guardrails

- Do not edit the config asset (U1), init (U2), setup (U3) or stackgen (U4).
- The forge default-branch note at `:562-563` stays as it is — parked, not this
  plan's.
- No doc outside the two owned files — `DOCS FALSIFIED:` lines.
- `plugins/**/*.md` is not dprint-formatted: match the fold width by hand.
- Delete with `rm`, never `git rm`.

## Commit

`feat: doctor reports a stale forge answer and a format-21 config without the block`
— written by the orchestrator after the wave gate. Type from
`.config/git-conventional-commits.yaml`; no scopes.
