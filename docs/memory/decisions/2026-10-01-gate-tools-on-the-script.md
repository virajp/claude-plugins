# Decision — dprint, pre-commit, gitleaks and grype move onto the script

**Date** 2026-10-01 · **Branch** `2026-10-01-tool-config-script-gates` ·
**Plan**
[`docs/plans/2026-10-01-tool-config-script-gates/`](../../plans/2026-10-01-tool-config-script-gates/index.md)
(rulings G1, G2, G5, G6, G7, G9) · **Supersedes**
[`2026-10-01-pack-entries-are-structured.md`](./2026-10-01-pack-entries-are-structured.md)
D10 ("mise only, for now") for these four tools and `all`, and the string verbs
of [`2026-09-26-tool-config-gates.md`](./2026-09-26-tool-config-gates.md)

## What was decided before

mise ran on the tool-config script; the four gate tools and the cross-tool
exclude were applied by the session from their references, in a word grammar
(`dprint add plugin`, `all add exclude`, `pre-commit add hook`,
`grype add ignore`), and pack entries for them were strings.

## What changed

- **The script lands them.** dprint `add-plugin`; pre-commit `add-hook`,
  `add-linter-ignore`, `set-scopes`; gitleaks `remove` only; grype
  `add-ignore`/`remove-ignore`; `all add-exclude --paths … [--generated]`. git,
  graphify and renovate stay prose until plan 3.
- **G1 — directory globs.** A trailing `/` marks a directory, globs included
  (`*.xcassets/`); `*`/`?` without one is a file glob; a bare name is a
  directory.
- **G2 — validated.** Every write to the pre-commit config runs
  `mise x -- pre-commit validate-config`; a failure restores the file byte for
  byte and refuses the call.
- **G5 — one formatter.** Every written file passes through
  `mise x -- dprint fmt --config .config/dprint.json` before its hash is
  recorded, mise files included: how a line folds is the shipped formatter's
  call.
- **G6 — post-merge.** `post-merge` joins `default_install_hook_types`;
  `graphify-refresh` runs at `post-commit` and `post-merge`; a `post-commit` or
  `post-merge` hook is always written with `always_run: true`.
- **G7 — grype ignores.**
  `add-ignore --id --package <name@version> --reason --expires <YYYY-MM-DD>`,
  all four required, written as the entry's comment.
- **G9 — structured entries.** The 22 pack entries for these tools are YAML
  mappings validated by the script's schema; checker rule 11 refuses a string
  entry for mise, dprint, pre-commit, grype or `all`. git entries stay strings.

## The alternatives rejected

- **An explicit `kind: dir|glob` field** — a trailing `/` already says it.
- **Self-check or verb-only validation** — only pre-commit's own validator knows
  its schema.
- **The script folds lines itself** — a second formatter disagreeing with the
  shipped one is drift on every run.
- **A free-text grype reason judged by the LLM** — four required fields need no
  judgement.
