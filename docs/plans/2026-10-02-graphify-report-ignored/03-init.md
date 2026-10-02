# U3 — init asks and records graphify's report mode

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/vwf/skills/init/SKILL.md`,
  `plugins/vwf/skills/init/references/new-repo.md`,
  `plugins/vwf/skills/init/references/existing-repo.md`,
  `plugins/vwf/skills/init/references/tool-configs.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** every owned file, top to bottom — the `-init` plan rewrote the
  question passages; locate them by content (the update-bot question, "Ask all",
  the `answers.repos` recording, the `all` flag table).
- **Lazy-load:** `plugins/vwf/assets/vwf-config.md`'s `answers:` block (read
  only — U4 owns it).

## Ruling

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

## Edits

1. **`SKILL.md`** — add the question right after the update-bot question, asked
   per repo like it: "Commit graphify's `GRAPH_REPORT.md`?" — `ignore` (default)
   or `commit`. Bump the question count wherever it is stated ("Eight in all",
   "Ask all eight") by one. The plan summary lists the value per repo. The
   `answers.repos` recording passage records `graphify_report` beside
   `update_bot`, always present.
2. **`references/new-repo.md`** — the `all` flag table's answers row gains
   `--graphify-report`; the answers-each-fetch-carries table gains a
   `graphify_report` row (from the new question, recorded in that repo's
   `answers.repos` entry); add the question's mechanics beside the update-bot
   mechanics: the default seeds from `git ls-files graphify-out/GRAPH_REPORT.md`
   (D5), then from the recorded value on a reshape.
3. **`references/existing-repo.md`** — the reshape's `answers` recording names
   `graphify_report` with `forge` and `update_bot`; describe the D5 untrack row
   as one of tool-config's preview rows the reshape shows.
4. **`references/tool-configs.md`** — beside the update-bot seeding, the
   graphify question seeds `commit` when the report is tracked.

## Verification

- `grep -n 'graphify_report' plugins/vwf/skills/init/SKILL.md plugins/vwf/skills/init/references/new-repo.md plugins/vwf/skills/init/references/existing-repo.md`
  prints a hit in each.
- `grep -n -- '--graphify-report' plugins/vwf/skills/init/references/new-repo.md`
  prints the flag.
- `mise run p:plugins:check` green.
- The full wave gate.

## Guardrails

- Touch nothing outside Owns; `vwf-config.md` and setup are U4's.
- The key is `graphify_report`, the flag `--graphify-report`, the values
  `ignore` and `commit` — exactly.
- `plugins/**/*.md` is not dprint-formatted — match the fold width by hand; keep
  code spans on one line.
- No `git checkout`, `git restore` or formatter `--fix` outside Owns.

## Commit

`feat: init asks whether to commit graphify's report`
