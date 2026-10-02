# Decision — the tool-config script is the source of truth; the session edits what it hands back

**Date** 2026-10-01 · **Branch** `2026-10-01-tool-config-script-mise` · **Plan**
[`docs/plans/2026-10-01-tool-config-script-mise/`](../../plans/2026-10-01-tool-config-script-mise/index.md)
· **Supersedes**
[`2026-09-26-tool-config-gates.md`](./2026-09-26-tool-config-gates.md) on each
tool's doctrine living in `references/<tool>.md` for the model to apply — for
mise now, for the other seven tools as plans 2 and 3 move them

## What was decided before

On 2026-09-26 each tool's doctrine was folded into `references/<tool>.md`, and
the session applied every instruction by following that prose.

## What changed

The user: *"The script does the initial job of creating the config, LLM knows
how to edit the config if needed. A greenfield work will not need LLM,
brownfield will likely need."*

- **R2 — the script decides what it can.** For mise it renders and writes every
  file, block and pin; a greenfield repo needs no model judgement. Its reference
  now says what the script does and the edits it hands back.
- **D7 — the brownfield split.** The script raises a conflict row for what it
  can decide — the legacy `MERGE_MODEL`, a tool pinned at another version, a
  person's own line, a parseable old pack fragment — and a `needs-edit` row for
  the rest: a root mise config to split, a `merge` answer, a file it cannot
  parse, each naming the file and the target layout. The session makes that edit
  per `references/mise.md`'s *What you edit by hand*, then re-runs the script's
  `check`.
- **D5 — drift is rendered.** `check` renders what each block should be and
  compares it with the file; `/vwf:doctor` calls it in place of the prose
  word-compare. A file still matching the hash its lock record holds is a plain
  write row, not drift.
- **D4 — the machinery stays.** Block markers, numbered preview rows answered
  back, and the `.claude/stackgen/lock.yaml` records keep their shapes.

## The alternatives rejected

- **The script does all brownfield work** — a root config to split or a `merge`
  answer needs judgement a script would only guess at.
- **The model does all brownfield work** — loses the determinism that makes a
  second `all` write nothing.
