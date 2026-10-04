# U1 — The script: graphify's report mode, untrack and bare-line rows

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/stackgen/skills/tool-config/scripts/lib/cli.mjs`,
  `plugins/stackgen/skills/tool-config/scripts/lib/tools/git.mjs`,
  `plugins/stackgen/skills/tool-config/scripts/lib/tools/graphify.mjs`, the
  hygiene tool test file and its fixtures as the hygiene plan's H3 created them
  — only their git and graphify cases
- **Model:** opus
- **Kind:** edit
- **Read first:** every owned file, top to bottom;
  `plugins/stackgen/skills/tool-config/references/{git,graphify}.md` (read only
  — U2 owns them) for the row and conflict-row vocabulary.
- **Lazy-load:** `TC/scripts/lib/tools/renovate.mjs` — the model for a
  flag-conditioned row (`--update-bot`); the engine's preview/conflict-row
  helpers under `TC/scripts/lib/` — reuse, never re-implement.

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

1. **`cli.mjs`** — add `"graphify-report"` to `ALL_KEYS`, accepting exactly
   `ignore` or `commit`; any other value is refused with the same error shape as
   an invalid `--update-bot`. Absent means `ignore`.
2. **`graphify.mjs`** — `all` reads the mode and asks git for `graphify-out/`
   (ignore) or `graphify-out/*` then `!graphify-out/GRAPH_REPORT.md` (commit),
   "for graphify", in that order. `.graphifyignore` is unchanged. When the mode
   is `ignore` and `git ls-files graphify-out/GRAPH_REPORT.md` lists the file,
   emit the D5 untrack conflict row; on `ok` the apply step runs
   `git rm --cached graphify-out/GRAPH_REPORT.md` (never deleting the file);
   without `ok` it does nothing to the index.
3. **`git.mjs`** — the duplicate check treats a trailing `/*` like a trailing
   `/` when comparing patterns (D6). When graphify's block is requested in
   `commit` mode and a bare `graphify-out/` or `/graphify-out/` line sits
   outside the block, emit the D6 replace conflict row; on `ok` remove that line
   and write the block; without `ok` leave it and add a warning that the
   negation is inert.
4. **Tests** — in the hygiene tool test, add cases: ignore mode (flag absent and
   explicit) yields the one-line block; commit mode yields the two-line block in
   order; tracked report + ignore yields the untrack row and an unapplied row
   leaves the index alone; bare line + commit yields the replace row; dedupe
   matches `graphify-out/*` against `graphify-out/`; an invalid
   `--graphify-report` value is refused. Fixtures follow H3's naming.

## Verification

- `pnpm vitest run` green, the new cases included.
- `pnpm exec tsc --noEmit -p scripts` green.
- `grep -n 'graphify-report' plugins/stackgen/skills/tool-config/scripts/lib/cli.mjs`
  prints the key.
- The full wave gate.

## Guardrails

- Touch nothing outside Owns — U2 owns the tool-config prose, U3/U4 own vwf.
- The flag is `--graphify-report`, the values `ignore` and `commit` — exactly.
- Never run `git rm --cached` in a test against this checkout; tests use temp
  repos as H3's fixtures do.
- No `git checkout`, `git restore` or formatter `--fix` outside Owns.

## Commit

`feat: tool-config ignores graphify's report unless commit is asked`
