# Decision — a hand key and the editor block never both carry a key

**Date** 2026-09-20 · **Branch** `2026-09-20-init-editor-dedupe` · **Plan**
[`docs/plans/2026-09-20-init-editor-dedupe/`](../../plans/2026-09-20-init-editor-dedupe/index.md)
· **Supersedes** the 2026-09-10/11 ruling in
[`docs/plans/archived/2026-09-10-repo-task-groups-and-editor-block/`](../../plans/archived/2026-09-10-repo-task-groups-and-editor-block/index.md)
· **Amends** the precedence passage of
[`2026-09-06-editor-fragments-inside-the-fence.md`](./2026-09-06-editor-fragments-inside-the-fence.md)

## What was decided before

The 2026-09-06 decision put the composed editor block **first** in each of the
two `.vscode` files "so a key a human writes after the block wins by ordinary
later-key precedence, and a second merge leaves it byte-for-byte". The doctrine
in `plugins/stackgen/assets/pack-format.md` and its restatement in
`init/references/fragments-and-sections.md` said the same: a hand key beat the
composed one because JSON's own last-wins rule tolerated the duplicate. The
composition step read the fragments alone and never the existing file.

On 2026-09-10/11 this repo's own `.vscode/settings.json` hit that rule — two
keys carried both in the block and by hand — and the ruling was: *dedupe the
hand keys with an inline `eslint-disable`, keep the union by hand; rejected:
changing vwf's algorithm here*.

## What changed

**The reversal.** That ruling is superseded: the algorithm changes. A hand key
wins because the block **omits** it, not because JSON tolerates the duplicate.
The 2026-09-06 decision that the block sits first and everything outside it
survives byte-for-byte stands, with the one carve-out that *take* and *union*
remove the hand copy on the user's word.

**The collision rule.** The composition step reads each editor file whole, as
JSONC, and keeps the hand section — everything outside the marked block — apart
from the block. A top-level `settings` key or a nesting parent present both
there and in the composed set is a **collision**. Two packs shipping one key is
not: that stays the composition order's silent business. A collision is never
resolved silently; it is asked, once, and recorded so it is not asked again.

**The three choices**, offered by the shape of the key:

| Choice    | The block                  | The hand copy                               |
| --------- | -------------------------- | ------------------------------------------- |
| **keep**  | omits the key              | untouched                                   |
| **take**  | carries the pack's value   | removed — the exact lines shown in the plan |
| **union** | carries pack + hand merged | removed — the exact lines shown in the plan |

A scalar setting offers keep or take; an object-valued setting or a nesting
parent offers all three, union composing the pack's entries and the hand entries
into the block's one value, the hand value winning where both name one key. An
extension id is its own value, so a colliding id is the same id twice and every
choice ends the same way — it is kept without asking and never recorded. Keep is
the default on every row and is what a run that was never asked would have
shown. The removal a take or union makes is the **one** edit init makes outside
the markers, made only on a recorded or just-given answer, with the lines it
removes shown before the one consent.

**The round and the record.** The collision round belongs to the plan step — one
round per run whatever the repo count, one row per collision reading
`file · key · hand value · pack value · choice`, a sub-line under that editor
file's merge row. It is not an eighth question; the seven stand, and a run with
no collision asks nothing. Every answer is written under
`enforcement.editor_keys` in the **base's** `.config/vwf.yaml` as
`<file>: { <key>: keep | take | union }`, the file spelled base-relative with
the member's path as prefix exactly as `kept_files` spells its paths. `init` now
writes **two** keys into that file and still never creates it; `init` alone
reads `editor_keys`, and `/vwf:doctor` never reads `.vscode`. A recorded answer
applies on every later run without asking; editing the block or the hand section
is how a user is re-asked.

**`config_format` 19 → 20.** The bump adds `editor_keys: {}` where the block
lacks it and moves nothing else — the same shape `16 → 18` took for
`kept_files`. Nothing wrote the key before 20, so every repo converges on an
empty map; a collision already in a repo's `.vscode` files is init's to ask on
its next composition, never the migration's to answer. `blueprint_format`
stays 25.

## The alternatives rejected

- **Omit and report without asking**, or **union silently**, or **block wins** —
  a collision is a pack against a person, and each of these decides it for them.
- **Keep or take only**, or **a question per key** — union is the answer a
  nesting parent usually wants, and one round per run is the shape every other
  init question takes.
- **Fold the record into `kept_files`**, **persist `keep` only**, or **no
  persistence** — a path and a key are different records, and a run that asks
  the same collision twice is the re-run the empty-plan rule forbids.
- **Number the round Q8** — it is a plan-step detail, not a question every run
  asks.
- **A doctor predicate over `.vscode`** — the detection runs inside every
  composition, new and existing mode alike, so the "no `vscode.d` survey pass"
  gap closes without one.
- **Never edit outside the block, even on consent** — then take and union could
  not exist, and the duplicate would return.

## This repo's own `.vscode`

`.vscode/settings.json` here still carries `explorer.fileNesting.patterns` and
`files.exclude` twice, each hand copy under an
`eslint-disable-next-line json/no-duplicate-keys`. No unit touched them: they
are cleaned by the next `/vwf:setup reshape` on this repo, on the collision
question, which is the user's real-repo verification of this change.
