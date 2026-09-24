# U1 — the pack format: `conditional:`, the lockfile's `skipped:`, the materializer's skip

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/stackgen/assets/pack-format.md`,
  `plugins/stackgen/assets/output-tree.md`,
  `plugins/stackgen/skills/stackgen-stack-template/references/materializer.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** `pack-format.md:48-58` (pack-private paths), `:143-149`
  (baseline ownership), `:157-181` (the `pack.yaml` keys), `:212, 223-233`
  (`unconditional:`); `output-tree.md:352-380` (the lockfile schema);
  `materializer.md:113-118` (the landing hash), `:167-185` (the conflict list
  and the dry-run plan).
- **Lazy-load:** `plugins/vwf/skills/init/SKILL.md` (U5's — how the answers
  reach the materializer; cite the call by name, never edit).

## Ruling

Decision 1 — Conditional files: "`pack.yaml` gains an optional
**`conditional:`** list — each entry a landed path or glob and a `when:` from a
fixed vocabulary: `forge: github|gitlab`, `editor: vscode`, `secrets: <slug>`,
`update_bot: renovate|dependabot|none`. The materializer evaluates `when:`
against the answers init passes it, **skips** a false path and records it under
a `skipped:` list in the lockfile with its condition; doctor never reports a
skipped path as missing; a later run whose answer changed re-evaluates. Rule 11
validates the key (known paths, known vocabulary)."

## Edits

1. **`pack-format.md`** — after the `pack.yaml` keys (`:157-181`), the
   `conditional:` key: its shape (a list of entries, each a `path` — a landed
   path or glob — and a `when` map of one axis to one value), the four axes and
   their values, the rule that a path not under `conditional:` is unconditional,
   that a glob may name a whole fragment set (`.config/vscode.d/*.jsonc`), and
   one example per axis drawn from decision 3's hygiene conditions (name the
   files, not a plugin path). One sentence beside `:212` that `unconditional:`
   is the bundle's word and `conditional:` the file's.
2. **`output-tree.md:352-380`** — the lockfile gains `skipped:` — a list of
   `{ path, pack, when }` — with the rule that a skipped path is neither a
   create nor a conflict and doctor treats it as intentionally absent.
3. **`materializer.md`** — before the conflict list (`:167`), the evaluation
   step: read the answers the caller passes (the four axes), evaluate each
   `conditional:` entry, drop false paths from the landing set and write them to
   `skipped:`; a path both conditional and pre-existing is a conflict only when
   its condition is true. The dry-run plan lists skips under their own heading.

## Verification

- `mise run p:plugins:check` green.
- `grep -n "conditional:" plugins/stackgen/assets/pack-format.md` — the key
  documented with its four axes.
- `grep -n "skipped:" plugins/stackgen/assets/output-tree.md plugins/stackgen/skills/stackgen-stack-template/references/materializer.md`
  — hits in both.

## Guardrails

- Do not edit any pack (U3, U4), the checker (U2), init (U5) or doctor (U6).
- No doc outside the three owned files — `DOCS FALSIFIED:` lines.
- `plugins/**/*.md` is not dprint-formatted: match the fold width by hand.
- Delete with `rm`, never `git rm`.

## Commit

`feat: pack format — conditional files, the lockfile's skipped list, the materializer's skip`
— written by the orchestrator after the wave gate. Type from
`.config/git-conventional-commits.yaml`; no scopes.
