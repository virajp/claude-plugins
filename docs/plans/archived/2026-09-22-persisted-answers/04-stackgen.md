# U4 — stackgen: sync evaluates conditionals, removal drops the skipped rows

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/stackgen/assets/output-tree.md`,
  `plugins/stackgen/skills/stackgen-stack-template/SKILL.md`,
  `plugins/stackgen/skills/stackgen-stack-template/references/materializer.md`,
  `plugins/stackgen/skills/stackgen-sync/SKILL.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** `output-tree.md:372-375` (the `skipped:` schema), `:408-430`
  (its invariants), `:431-435` (removal — what it removes today);
  `materializer.md:18-22` (the inputs), `:186-222` (the evaluation step and the
  unanswered-reads-true rule); `stack-template/SKILL.md:160-180` (the `repo:`
  and `answers:` caller lines and the Inputs list); `stackgen-sync/SKILL.md`
  whole — especially `:47-70` (step 2's re-derivation and its three
  classifications) and `:106-118` (removal by subtraction).
- **Lazy-load:** `plugins/vwf/assets/vwf-config.md` (U1's — the `answers:`
  block, by key name); `plugins/vwf/skills/setup/references/materialize.md`
  (U3's — how a caller composes the map; cite, never edit).

## Ruling

Decision 4 — Sync's rule: "`stackgen-sync` evaluates every `conditional:` entry
against the answers (forge live) and gains one classification beside its three:
a path whose condition is **false** is `skipped (condition)` — never offered,
its `skipped:` row rewritten for that pack; a path that **never landed** and
whose condition is **now true** is `landable — condition now true` and is landed
under sync's existing consent tier for a new pack file; a **landed** path whose
condition turned false is `kept`, reported once and never removed. Removal drops
the pack's `skipped:` rows with its `entries:`."

Decision 7 — The default stays: "The materializer's 'an unanswered axis reads
true' rule is **unchanged** — it is what keeps a caller this plan does not know
about landing what it landed before. Every caller this plan does know about now
passes a full map."

Decision 5, stackgen's part: a caller that finds no `answers:` block infers the
four values from the tree, passes them and writes nothing.

## Edits

1. **`stack-template/SKILL.md:160-180`** — the caller rule names the three
   callers that pass `answers:` now (init, setup's materialize pass, sync)
   rather than init alone; the Inputs list carries `answers:` beside `repo:`
   with a pointer to the config block it is read from. The unanswered-reads-true
   default is restated as what it is — the fallback for a caller that passes
   none, not the normal path.
2. **`materializer.md`** — one sentence at the evaluation step: the map a caller
   passes comes from the config's `answers:` block with the forge re-read live,
   and an axis absent from the map still reads true (decision 7, unchanged).
   Nothing else about the evaluation changes.
3. **`output-tree.md`** — the removal passage at `:431-435` removes the pack's
   `skipped:` rows with its `entries:`, `settings_keys` and `mcp_servers`, so an
   un-pinned or removed pack leaves no rows behind; and one invariant in the
   `:408-430` list saying the same, since a `skipped:` row for a pack the repo
   no longer runs would otherwise persuade doctor that a path is intentionally
   absent for ever.
4. **`stackgen-sync/SKILL.md`** — step 2 reads the config's `answers:` block
   (inferring per decision 5 when there is none, forge live either way) and
   evaluates each pack's `conditional:` entries before it classifies: the three
   states decision 4 names, beside the existing unchanged/pack-moved/repo-edited
   three, each reported in the sync report; the `skipped:` rows rewritten for
   the packs this run evaluated and no others; a turned-true path landed under
   the consent tier a new pack file already takes, named in that consent line.
   Removal (`:106-118`) drops the `skipped:` rows as edit 3 states.

## Verification

- `mise run p:plugins:check` green.
- `mise run p:plugins:inventory -- --check` green (no pack touched).
- `grep -n "answers" plugins/stackgen/skills/stackgen-sync/SKILL.md plugins/stackgen/skills/stackgen-stack-template/SKILL.md`
  — hits in both.
- `grep -n "skipped" plugins/stackgen/assets/output-tree.md` — the removal
  passage names it.

## Guardrails

- No file under `plugins/stackgen/stacks/` — no pack, no payload, no version.
- Do not edit the config asset (U1), init (U2), setup (U3) or doctor (U5).
- The materializer's default is unchanged — only its description of where the
  map comes from.
- No doc outside the four owned files — `DOCS FALSIFIED:` lines.
- `plugins/**/*.md` is not dprint-formatted: match the fold width by hand.
- Delete with `rm`, never `git rm`.

## Commit

`feat: sync evaluates conditional files; removal drops a pack's skipped rows` —
written by the orchestrator after the wave gate. Type from
`.config/git-conventional-commits.yaml`; no scopes.
