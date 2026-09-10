# U3 — dprint pack: pins move only from a terminal; 1.0.1

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/stackgen/stacks/toolchain-gate/dprint/**`
- **Model:** opus
- **Read first:** `skills/dprint/SKILL.md:95-105` ("Running it") and
  `conventions.md:1-20` before editing.
- **Lazy-load:**
  `plugins/stackgen/stacks/toolchain-manager/mise/config/.config/mise/tasks/setup/mise:33-50`
  — the guard and its comment; quote its "Skipping formatter plugin updates"
  wording exactly.

## Ruling

From index.md's assumed decisions, verbatim:

> **3.** **Include.** One sentence in the dprint pack's "Running it": pins move
> only when `setup:mise` runs in a terminal — CI and any non-TTY run skip the
> update by design and say so. Pack 1.0.0 → 1.0.1.

## Edits

1. **`skills/dprint/SKILL.md:100-102`** — after
   "`dprint config update
   --config .config/dprint.json` is how plugin
   versions move, and it is a deliberate act run from `setup:mise`", add one
   sentence: it runs only when `setup:mise` has a terminal to answer the
   exec-plugin checksum prompt in; CI and any non-TTY run skip it by design and
   print "Skipping formatter plugin updates" — so a pin moves when a person runs
   `setup:mise`, never on its own.
2. **`conventions.md`** — if its pinning bullet (`:11`) implies pins update
   automatically, one clause to match; otherwise untouched.
3. **`pack.yaml`** — `version: 1.0.0` → `1.0.1`.

## Verification

- `mise run plugins:check` green.
- `grep -n 'Skipping formatter plugin updates' plugins/stackgen/stacks/toolchain-gate/dprint/skills/dprint/SKILL.md`
  → one hit.
- `grep -n '^version: 1.0.1' plugins/stackgen/stacks/toolchain-gate/dprint/pack.yaml`
  → one hit.
- Fold width by hand; the `config/` payload is untouched.

## Guardrails

- Do not touch the mise pack's `setup/mise` task — the guard is correct; you
  document it.
- Do not touch the hygiene pack (U1), `output-tree.md` or `scripts/` (U2), any
  doc (U4), the pins or inventory (U5).
- Delete with `rm`, never `git rm` (nothing here is deleted).
- Never run `git checkout`, `git restore`, `git stash`, or a formatter with
  `--fix` on a path outside your Owns.

## Commit

`docs(stackgen): the dprint pack says its pins move only from a terminal` —
written by the orchestrator after the wave gate, not by the unit.
