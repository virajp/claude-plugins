# U4 — init drops the agent-plugins question

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/vwf/skills/init/SKILL.md`,
  `plugins/vwf/skills/init/references/new-repo.md`,
  `plugins/vwf/skills/init/references/existing-repo.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** every owned file, top to bottom. Question 5 is
  `init/SKILL.md:540-575` (2026-10-03); the flag rows are
  `new-repo.md:97,490-492` and `existing-repo.md:708`.

## Ruling

> D4 — Retired: `EXTRA_MARKETPLACES`, `EXTRA_PLUGINS`, `--inventory`, `--user`,
> tool-config's `--plugin-sources`/`--plugins` keys, and init's question 5 (the
> agent-plugins question). The task installs no extra plugin of the user's
> choosing "(for now)".

> D1 — The task reads `claude plugin list --json`; when `vwf@virajp-plugins` is
> installed at **user or project** scope it does nothing more for vwf. When it
> is at neither, it runs `pnpx @virajp.dev/claude-plugins@latest --all` — the
> installer, which registers the marketplace and installs vwf (and stackgen) at
> **user** scope. It never installs at project scope, and it continues whether
> or not it installed.

## Edits

1. **`SKILL.md`** — delete question 5 whole (the `setup:ai --inventory` read,
   the vwf-row filter, the ask, the rows it passes). Renumber the questions
   after it down by one, every cross-reference to them in the owned files
   included, and lower every stated count ("Eight in all", "Ask all eight", and
   any round count) by one. Where init describes what `setup:ai` does on the
   landing's `setup:all`, it says D1's check-then-upgrade, not "installs".
2. **`references/new-repo.md`** — drop `--plugin-sources`/`--plugins` from the
   `all` flag table (`:97`) and the passage at `:490-492`; fix any question
   number that moved.
3. **`references/existing-repo.md`** — drop the same at `:708`; fix any moved
   question number.

## Verification

- `grep -nE 'plugin-sources|--plugins|--inventory|setup:ai --inventory' plugins/vwf/skills/init -r`
  prints nothing.
- The stated question count in `SKILL.md` equals the number of questions it
  lists.
- `mise run p:plugins:check` green.
- The full wave gate.

## Guardrails

- Touch nothing outside Owns; other skills citing a moved question number are a
  `DOCS FALSIFIED:` line.
- `plugins/**/*.md` is not dprint-formatted — match the fold width by hand; keep
  code spans on one line.
- No `git checkout`, `git restore` or formatter `--fix` outside Owns.

## Commit

`feat: init drops the agent-plugins question`
