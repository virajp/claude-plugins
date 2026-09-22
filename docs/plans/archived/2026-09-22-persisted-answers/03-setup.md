# U3 — setup's materialize pass carries the answers

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/vwf/skills/setup/SKILL.md`,
  `plugins/vwf/skills/setup/references/materialize.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** `materialize.md:83-98` — the invocation the pass composes
  today (catalog paths plus a `repo:` line, no answers); the whole of
  `materialize.md` for where the pass reports what it landed; `SKILL.md:97`
  (Step 0), `:127-150` (the shape offer on doctor's predicates), `:222-236` (the
  second shape check after the pass).
- **Lazy-load:** `plugins/vwf/assets/vwf-config.md` (U1's — the `answers:`
  schema, by key name);
  `plugins/stackgen/skills/stackgen-stack-template/references/materializer.md`
  (U4's — the `answers:` input and the evaluation step, cited by name, never
  edited).

## Ruling

Decision 2, setup's part: "Setup's pass and sync never write any other key" —
the one write it may make is a stale `forge` value, decision 3's.

Decision 3 — Forge is read live: "Every caller reads the forge from `origin` at
run time and passes **that** as the `forge` axis; the recorded value is the
record and the fallback for a repo with no remote reachable. Doctor's predicate
(e) gains one row: a recorded `forge` that differs from the live host, **or** a
`skipped:` row whose `when: forge` the live host now contradicts, is **drift**,
remedy `/vwf:setup reshape` — so the forge files land at the reshape, never
silently mid-pass."

Decision 5 — A format-20 repo: "A caller that finds **no `answers:` block**
infers what init's own seeds would give — forge from `origin`, editor from a
`.vscode/` directory or the editor binary, secrets from the lockfile's pinned
provider, update bot from a renovate or dependabot file — passes that map and
**writes nothing**."

## Edits

1. **`materialize.md:83-98`** — the composed invocation gains an `answers:` line
   beside `repo:`, carrying the four axes: the product-level `editor` and
   `secrets` from the config's `answers:` block, and the target repo's `forge`
   and `update_bot` from that block's `repos:` entry — with the forge **re-read
   from that repo's `origin`** and the recorded value used only where no remote
   answers. A recorded forge the live host contradicts is rewritten in place,
   that one value and nothing else, and named in the pass's report. Then the
   inference rule for a config with no block (decision 5), spelled as the four
   reads, and the sentence that the pass writes no block of its own — the
   reshape does.
2. **`materialize.md`**, the pass's report — the skips the materializer returns
   are listed as the plan's own Skipped rows are, so a fragment the editor
   answer skipped is visible rather than silently absent.
3. **`SKILL.md`** — one sentence where the pass is described: it honours the
   recorded answers, so a template pinned months after init lands what that
   repo's answers allow; and the pass never lands a forge-conditioned file a
   stale record would have skipped — doctor reports the staleness and the
   reshape lands it.

## Verification

- `mise run p:plugins:check` green (rule 10 in `SKILL.md`).
- `grep -n "answers" plugins/vwf/skills/setup/references/materialize.md` — the
  invocation line and the inference rule.
- `grep -n "repo:" plugins/vwf/skills/setup/references/materialize.md` — the
  `repo:` line still there, `answers:` beside it.

## Guardrails

- Do not edit the config asset (U1), init (U2), stackgen (U4) or doctor (U5).
- The pass writes no config key but the stale `forge` value decision 3 allows.
- No doc outside the two owned files — `DOCS FALSIFIED:` lines.
- `plugins/**/*.md` is not dprint-formatted: match the fold width by hand.
- Delete with `rm`, never `git rm`.

## Commit

`feat: setup's materialize pass carries the recorded answers` — written by the
orchestrator after the wave gate. Type from
`.config/git-conventional-commits.yaml`; no scopes.
