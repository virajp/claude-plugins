# U2 — tool-config prose: the report mode

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/stackgen/skills/tool-config/SKILL.md`,
  `plugins/stackgen/skills/tool-config/references/git.md`,
  `plugins/stackgen/skills/tool-config/references/graphify.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** every owned file, top to bottom.
- **Lazy-load:** `plugins/stackgen/skills/tool-config/references/renovate.md` —
  how a flag-conditioned row is described.

## Ruling

> D1 — `graphify-out/GRAPH_REPORT.md` is ignored by default. The `ignore` mode
> asks git for `graphify-out/` alone; the `commit` mode keeps today's
> `graphify-out/*` then `!graphify-out/GRAPH_REPORT.md`, negation after its
> pattern. The "diffable in review" rationale retires.

> D3 — init asks one more per-repo question — commit graphify's report, default
> `ignore` — and records `answers.repos.<path>.graphify_report: ignore | commit`
> beside `update_bot`, always present. A reshape re-asks, seeded with the
> recorded value. The answer reaches tool-config `all` as
> `--graphify-report ignore|commit`; an absent flag means `ignore`.

> D5 — When `git ls-files` shows the report tracked, the question's default
> becomes `commit` and the plan summary says why. Answering `ignore` adds a
> conflict row — untrack `graphify-out/GRAPH_REPORT.md` with `git rm --cached`,
> the file kept on disk — applied only on an `ok`; declining keeps it tracked
> and records `commit`. Never a silent untrack.

> D6 — In `commit` mode, a bare `graphify-out/` (or `/graphify-out/`) line
> outside the graphify block becomes a conflict row: replace it with the block's
> lines, applied only on an `ok`; declining leaves the line and warns the
> negation is inert. The duplicate check normalises a trailing `/*` against a
> trailing `/`.

## Edits

1. **`SKILL.md`** — the `all` key table gains `--graphify-report` (`ignore` |
   `commit`, default `ignore`), beside `--update-bot`, in the table's own row
   shape.
2. **`references/graphify.md`** — the git-lines passage describes the two modes
   (D1); the "keys it reads" line names `graphify-report`; the "worth diffing in
   review" rationale is replaced by one sentence: the report is ignored by
   default and committed only when the repo's user chose `commit`; the D5
   untrack row is described where conflict rows are.
3. **`references/git.md`** — the duplicate-check passage adds the trailing `/*`
   normalisation; the conflict-row list gains the D6 bare-line row; the
   migration passage's graphify section (old two-pattern section) notes that it
   maps to the `commit` mode.

## Verification

- `grep -n 'graphify-report' plugins/stackgen/skills/tool-config/SKILL.md plugins/stackgen/skills/tool-config/references/graphify.md`
  prints the key in both.
- `grep -n 'worth diffing' plugins/stackgen/skills/tool-config/references/graphify.md`
  prints nothing.
- `mise run p:plugins:check` green.
- The full wave gate.

## Guardrails

- Touch nothing outside Owns; a falsified passage elsewhere is a
  `DOCS FALSIFIED:` line.
- `plugins/**/*.md` is not dprint-formatted — match the surrounding fold width
  by hand; keep code spans on one line; never end a table cell in a bare `*`.
- No plugin-relative citation in anything that lands (checker rule 13).
- No `git checkout`, `git restore` or formatter `--fix` outside Owns.

## Commit

`docs: tool-config describes graphify's report mode`
